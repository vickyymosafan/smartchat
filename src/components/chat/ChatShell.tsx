'use client';

import {
  useEffect,
  useState,
  createContext,
  useContext,
  Suspense,
  lazy,
} from 'react';
import { useChat } from '@/hooks/useChatStreaming';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ChatShellProps, Message } from '@/types/chat';
import { TopBar } from './TopBar';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { Composer } from './Composer';
import { useTheme } from '@/hooks/useTheme';
import {
  saveLastReadMessageId,
  loadLastReadMessageId,
  saveSidebarState,
  loadSidebarState,
} from '@/lib/storage';

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

// Type import untuk ChatItem
import type { ChatItem } from './SidePanel';

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

  // Online/offline detection state
  const [isOnline, setIsOnline] = useState(true);

  // State untuk command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // State untuk settings sheet
  const [settingsOpen, setSettingsOpen] = useState(false);

  // State untuk sidebar (load from storage on mount)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = loadSidebarState();
    return stored ?? false;
  });

  // Theme management
  const { setTheme, theme } = useTheme();

  // Track last read message ID
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(
    () => {
      const stored = loadLastReadMessageId();
      return stored ?? null;
    }
  );

  // Mock chat history data (untuk demo purposes)
  const [chatHistory] = useState<ChatItem[]>([
    {
      id: '1',
      title: 'Cara membuat aplikasi React',
      preview:
        'Saya ingin belajar membuat aplikasi React dari awal. Bisa bantu?',
      timestamp: Date.now() - 3600000, // 1 hour ago
      unreadCount: 2,
      isPinned: true,
    },
    {
      id: '2',
      title: 'Pertanyaan tentang TypeScript',
      preview: 'Bagaimana cara menggunakan generics di TypeScript?',
      timestamp: Date.now() - 7200000, // 2 hours ago
      isPinned: true,
    },
    {
      id: '3',
      title: 'Setup Tailwind CSS',
      preview: 'Langkah-langkah setup Tailwind CSS di Next.js',
      timestamp: Date.now() - 86400000, // 1 day ago
    },
    {
      id: '4',
      title: 'Optimasi performa web',
      preview: 'Tips untuk meningkatkan performa website',
      timestamp: Date.now() - 172800000, // 2 days ago
      unreadCount: 1,
    },
    {
      id: '5',
      title: 'Belajar API REST',
      preview: 'Penjelasan tentang RESTful API dan best practices',
      timestamp: Date.now() - 259200000, // 3 days ago
    },
  ]);

  /**
   * Setup online/offline detection
   * Mendengarkan event online dan offline dari browser
   */
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Event handler untuk online event
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    // Event handler untuk offline event
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Persist sidebar state when it changes
   */
  useEffect(() => {
    saveSidebarState(sidebarOpen);
  }, [sidebarOpen]);

  /**
   * Update last read message ID when messages change
   * Save the ID of the last message in the list
   */
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastReadMessageId) {
        setLastReadMessageId(lastMessage.id);
        saveLastReadMessageId(lastMessage.id);
      }
    }
  }, [messages, lastReadMessageId]);

  /**
   * Preload CommandPalette saat Ctrl key ditekan
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Preload CommandPalette saat Ctrl/Cmd ditekan
        import('./CommandPalette').catch(() => {});
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
   */
  const handleRetry = (messageId: string) => {
    console.log('Retry message:', messageId);
    retry(messageId);
  };

  /**
   * Handler untuk new chat action
   */
  const handleNewChat = () => {
    if (messages.length > 0) {
      if (
        window.confirm('Mulai percakapan baru? Pesan saat ini akan hilang.')
      ) {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  /**
   * Handler untuk clear history action
   */
  const handleClearHistory = () => {
    if (messages.length > 0) {
      if (
        window.confirm(
          'Hapus semua pesan? Tindakan ini tidak dapat dibatalkan.'
        )
      ) {
        window.location.reload();
      }
    }
  };

  /**
   * Handler untuk toggle theme action
   */
  const handleToggleTheme = () => {
    const newTheme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  };

  /**
   * Handler untuk open settings action
   */
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  /**
   * Handler untuk toggle sidebar
   */
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Handler untuk select chat dari history
   */
  const handleChatSelect = (chatId: string) => {
    console.log('Selected chat:', chatId);
    // TODO: Load chat history untuk chatId yang dipilih
    // Untuk demo, kita hanya log dan close sidebar di mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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

          {/* Main chat area dengan semantic HTML */}
          <main
            id="main-chat-content"
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Container dengan responsive max-width constraints */}
            <div className="mx-auto flex h-full w-full max-w-full flex-col sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
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
            </div>
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
              onToggleTheme={handleToggleTheme}
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
