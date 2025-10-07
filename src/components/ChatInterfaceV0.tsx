'use client';

import { ChatInterfaceProps } from '@/types/chat';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { useToastContext } from '@/contexts/ToastContext';
import { useOrientationChange } from '@/hooks/useOrientationChange';
import MessageListV0 from './MessageListV0';
import MessageInputV0 from './MessageInputV0';
import ErrorBoundary from './ErrorBoundary';
import { LazyPWAInstallPrompt } from '@/lib/lazyComponents';

/**
 * v0.app Style ChatInterface Component
 * Minimal, clean, and focused on content
 */
function ChatInterfaceContent() {
  const { state, addMessage, updateMessageStatus, setLoading, setError } =
    useChatContext();
  const toast = useToastContext();

  useOrientationChange();

  const handleSendMessage = async (message: string): Promise<void> => {
    let userMessageId: string | undefined;

    try {
      userMessageId = addMessage({
        content: message,
        type: 'user',
        status: 'sending',
      });

      setLoading(true);
      setError(null);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: `session_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      updateMessageStatus(userMessageId, 'sent');

      addMessage({
        content: data.data?.response || 'Response dari AI Assistant',
        type: 'assistant',
        status: 'sent',
      });

      toast.success(
        'Pesan Terkirim',
        'Pesan Anda berhasil dikirim dan diproses oleh AI Assistant.'
      );
    } catch (error: any) {
      console.error('Error sending message:', error);

      if (userMessageId) {
        updateMessageStatus(userMessageId, 'error');
      }

      let errorMessage =
        'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.';

      if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Gagal Mengirim Pesan', errorMessage, { duration: 7000 });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen flex-col"
      style={{
        backgroundColor: 'var(--background)',
      }}
    >
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Main Chat Area - v0.app style: centered, max-width, generous spacing */}
      <main
        id="main-content"
        className="flex flex-1 flex-col overflow-hidden"
        role="main"
      >
        <div
          className="mx-auto flex h-full w-full flex-col"
          style={{
            maxWidth: '48rem' /* 768px - similar to v0.app */,
            padding: '0 var(--space-md)',
          }}
        >
          {/* Message List */}
          <MessageListV0
            messages={state.messages}
            isLoading={state.isLoading}
          />

          {/* Message Input */}
          <MessageInputV0
            onSendMessage={handleSendMessage}
            isLoading={state.isLoading || !state.isOnline}
          />
        </div>
      </main>

      {/* PWA Install Prompt */}
      <LazyPWAInstallPrompt
        onInstall={() => console.log('PWA berhasil diinstall')}
        onDismiss={() => console.log('PWA install prompt ditutup')}
      />
    </div>
  );
}

/**
 * Main ChatInterface component with Error Boundary and Context Provider
 */
export default function ChatInterface({
  initialMessages = [],
}: ChatInterfaceProps) {
  return (
    <ErrorBoundary>
      <ChatProvider initialMessages={initialMessages}>
        <ChatInterfaceContent />
      </ChatProvider>
    </ErrorBoundary>
  );
}
