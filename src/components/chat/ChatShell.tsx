'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  Suspense,
  lazy,
  useMemo,
  useCallback,
} from 'react';
import { useChat } from '@/hooks/useChatStreaming';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { ChatShellProps, Message } from '@/types/chat';
import { TopBar } from './TopBar';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { Composer } from './Composer';
import {
  saveLastReadMessageId,
  loadLastReadMessageId,
  saveSidebarState,
  loadSidebarState,
  saveUIState,
} from '@/lib/storage';
import { MOCK_CHAT_HISTORY } from '@/lib/constants';

// Lazy load non-critical components untuk optimasi bundle size
const CommandPalette = lazy(() =>
  import('./CommandPalette').then(mod => ({ default: mod.CommandPalette }))
);
const SidePanel = lazy(() =>
  import('./SidePanel').then(mod => ({ default: mod.SidePanel }))
);
const SettingsSheet = lazy(() =>
  import('./SettingsSheet').then(mod => ({ default: mod.SettingsSheet }))
);

/**
 * Interface untuk ChatContext
 * Menyediakan state dan functions yang dapat diakses oleh child components
 */
interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  send: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  stop: () => void;
  append: (message: Message) => void;
}

/**
 * Context untuk share chat state ke child components
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Hook untuk mengakses ChatContext
 * Throws error jika digunakan di luar ChatShell
 */
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatShell');
  }
  return context;
}

/**
 * ChatShell - Root container component untuk aplikasi chat
 *
 * Komponen ini bertanggung jawab untuk:
 * - Layout utama aplikasi dengan responsive design
 * - State management menggunakan useChat hook
 * - Online/offline detection
 * - Menyediakan context untuk child components
 * - Global keyboard shortcuts
 *
 * @param initialMessages - Pesan awal untuk chat (opsional)
 * @param sessionId - ID sesi chat untuk tracking (opsional)
 */
export function ChatShell({ initialMessages = [], sessionId }: ChatShellProps) {
  // Chat state management menggunakan useChat hook
  const { messages, isLoading, error, send, regenerate, stop, append, retry } =
    useChat(initialMessages, sessionId);

  // Online/offline detection menggunakan custom hook (no duplicate listeners!)
  const isOnline = useOnlineStatus();

  // State untuk command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // State untuk settings sheet
  const [settingsOpen, setSettingsOpen] = useState(false);

  // State untuk sidebar (load from storage on mount)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = loadSidebarState();
    return stored ?? false;
  });

  // Track last read message ID
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(
    () => {
      const stored = loadLastReadMessageId();
      return stored ?? null;
    }
  );

  // Use mock chat history from constants (no hardcoded data!)
  const chatHistory = useMemo(() => MOCK_CHAT_HISTORY, []);

  /**
   * Batch persist UI state when sidebar or messages change
   * Optimized to reduce localStorage writes
   */
  useEffect(() => {
    const updates: Record<string, any> = {
      sidebarOpen,
    };

    // Update last read message ID if messages changed
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastReadMessageId) {
        setLastReadMessageId(lastMessage.id);
        updates.lastReadMessageId = lastMessage.id;
      }
    }

    // Batch save to localStorage (single write operation)
    saveUIState(updates);
  }, [sidebarOpen, messages, lastReadMessageId]);

  /**
   * Preload CommandPalette saat Ctrl key ditekan
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Preload CommandPalette saat Ctrl/Cmd ditekan
        import('./CommandPalette').catch(() => { });
      }
    };

    window.addEventListener('keydown', handleKeyDown, {
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Setup global keyboard shortcuts
   */
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        // Open command palette
        setCommandPaletteOpen(true);
      },
      description: 'Open command palette',
    },
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        // New chat - clear messages and focus composer
        // Untuk production, ini akan navigate ke new chat route
        console.log('New chat (Ctrl/Cmd+N)');

        // Clear messages (untuk demo purposes)
        // Di production, ini akan navigate ke route baru
        if (
          window.confirm('Mulai percakapan baru? Pesan saat ini akan hilang.')
        ) {
          window.location.reload();
        }
      },
      description: 'Start new chat',
    },
    {
      key: '/',
      handler: () => {
        // Focus composer textarea
        const textarea = document.querySelector(
          'textarea[aria-label="Message input"]'
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          console.log('Composer focused (/)');
        }
      },
      description: 'Focus message input',
    },
  ]);

  // Context value yang akan di-share ke child components
  const contextValue: ChatContextType = {
    messages,
    isLoading,
    error,
    isOnline,
    send,
    regenerate,
    stop,
    append,
  };

  /**
   * Handler untuk retry failed message
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleRetry = useCallback(
    (messageId: string) => {
      console.log('Retry message:', messageId);
      retry(messageId);
    },
    [retry]
  );

  /**
   * Handler untuk new chat action
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleNewChat = useCallback(() => {
    if (messages.length > 0) {
      if (
        window.confirm('Mulai percakapan baru? Pesan saat ini akan hilang.')
      ) {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }, [messages.length]);

  /**
   * Handler untuk clear history action
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleClearHistory = useCallback(() => {
    if (messages.length > 0) {
      if (
        window.confirm(
          'Hapus semua pesan? Tindakan ini tidak dapat dibatalkan.'
        )
      ) {
        window.location.reload();
      }
    }
  }, [messages.length]);

  /**
   * Handler untuk open settings action
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  /**
   * Handler untuk toggle sidebar
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  /**
   * Handler untuk select chat dari history
   * Memoized untuk prevent unnecessary re-renders
   */
  const handleChatSelect = useCallback((chatId: string) => {
    console.log('Selected chat:', chatId);
    // TODO: Load chat history untuk chatId yang dipilih
    // Untuk demo, kita hanya log dan close sidebar di mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <ChatContext.Provider value={contextValue}>
      <div className="flex h-screen flex-col bg-background">
        {/* Skip to content link for keyboard navigation */}
        <a
          href="#main-chat-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>

        {/* TopBar dengan branding dan actions */}
        <TopBar
          title={sessionId ? `Chat ${sessionId}` : undefined}
          onSettingsClick={handleOpenSettings}
          showSidebarToggle={true}
          onSidebarToggle={handleSidebarToggle}
        />

        {/* Main content area dengan sidebar dan chat */}
        <div className="flex flex-1 overflow-hidden">
          {/* SidePanel untuk chat history - Lazy loaded */}
          <Suspense
            fallback={
              <div className="hidden h-full w-80 border-r bg-background md:block" />
            }
          >
            <SidePanel
              open={sidebarOpen}
              onOpenChange={setSidebarOpen}
              chats={chatHistory}
              activeChatId={sessionId}
              onChatSelect={handleChatSelect}
            />
          </Suspense>

          {/* Main chat area dengan semantic HTML - Full width untuk scrollbar di pojok kanan */}
          <main
            id="main-chat-content"
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Conditional rendering: EmptyState atau MessageList */}
            {messages.length === 0 ? (
              <EmptyState
                onSuggestionClick={suggestion => {
                  send(suggestion);
                }}
              />
            ) : (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                onCopy={content => {
                  navigator.clipboard.writeText(content);
                  console.log('Copied:', content);
                }}
                onRegenerate={messageId => {
                  console.log('Regenerate:', messageId);
                  regenerate();
                }}
                onReaction={(messageId, reaction) => {
                  console.log('Reaction:', messageId, reaction);
                }}
                onRetry={handleRetry}
              />
            )}
          </main>
        </div>

        {/* Composer - Docked at bottom */}
        <Composer
          onSend={send}
          isLoading={isLoading}
          isOnline={isOnline}
          placeholder="Ketik pesan Anda di sini..."
          maxLength={5000}
        />

        {/* Command Palette - Lazy loaded */}
        <Suspense fallback={null}>
          {commandPaletteOpen && (
            <CommandPalette
              open={commandPaletteOpen}
              onOpenChange={setCommandPaletteOpen}
              onNewChat={handleNewChat}
              onClearHistory={handleClearHistory}
              onOpenSettings={handleOpenSettings}
            />
          )}
        </Suspense>

        {/* Settings Sheet - Lazy loaded */}
        <Suspense fallback={null}>
          <SettingsSheet
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            onClearHistory={handleClearHistory}
          />
        </Suspense>
      </div>
    </ChatContext.Provider>
  );
}
