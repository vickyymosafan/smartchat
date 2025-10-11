'use client';

import { ChatInterfaceProps } from '@/types/chat';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { toast } from 'sonner';
import { useOrientationChange } from '@/hooks/useOrientationChange';
import { MessageList } from './chat/MessageList';
import MessageInput from './MessageInput';
import ErrorBoundary from './ErrorBoundary';
import { LazyPWAInstallPrompt } from '@/lib/lazyComponents';

/**
 * Komponen internal ChatInterface yang menggunakan context
 */
function ChatInterfaceContent() {
  const { state, addMessage, setLoading, setError } = useChatContext();

  // Handle orientation changes smoothly
  useOrientationChange();

  /**
   * Handle pengiriman pesan ke API dengan integrasi n8n RAG System
   */
  const handleSendMessage = async (message: string): Promise<void> => {
    // Declare userMessageId outside try-catch so it's accessible in catch block
    let userMessageId: string | undefined;

    try {
      // Tambahkan pesan user
      userMessageId = addMessage({
        role: 'user',
        content: message,
        createdAt: Date.now(),
      });

      setLoading(true);
      setError(null);

      // Kirim request ke API chat yang terintegrasi dengan n8n
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: `session_${Date.now()}`, // Generate session ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      // Tambahkan response dari RAG AI Assistant
      addMessage({
        role: 'assistant',
        content: data.data?.response || 'Response dari AI Assistant',
        createdAt: Date.now(),
      });

      // Tampilkan toast success
      toast.success('Pesan Anda berhasil dikirim dan diproses oleh AI Assistant.');
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Tentukan pesan error berdasarkan jenis error
      let errorMessage =
        'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Tampilkan toast error
      toast.error(errorMessage, { duration: 7000 });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show offline indicator - Mobile-optimized responsive design
   */
  const OfflineIndicator = () => {
    if (state.isOnline) return null;

    return (
      <div
        className="border-b animate-fade-in"
        role="alert"
        aria-live="assertive"
        style={{
          backgroundColor: 'var(--gray-100)',
          borderColor: 'var(--gray-200)',
          padding: '0.75rem 1rem',
          minHeight: '44px',
        }}
      >
        <div
          className="mx-auto flex max-w-none items-center justify-center sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
          style={{
            color: 'var(--gray-700)',
            gap: '0.5rem',
          }}
        >
          <svg
            className="flex-shrink-0"
            aria-hidden="true"
            style={{
              height: '1.125rem',
              width: '1.125rem',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            className="text-label-medium font-medium sm:text-label-large"
            style={{
              fontSize: '0.8125rem',
              lineHeight: '1.4',
            }}
          >
            Anda sedang offline. Pesan akan dikirim saat koneksi kembali.
          </span>
        </div>
      </div>
    );
  };

  /**
   * Error display component - Mobile-optimized with 44x44px touch targets
   */
  const ErrorDisplay = () => {
    if (!state.error) return null;

    return (
      <div
        className="border-b animate-fade-in"
        role="alert"
        aria-live="assertive"
        style={{
          backgroundColor: 'var(--gray-150)',
          borderColor: 'var(--gray-250)',
          padding: '0.75rem 1rem',
          minHeight: '44px',
        }}
      >
        <div
          className="mx-auto flex max-w-none items-center justify-between sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
          style={{
            color: 'var(--gray-800)',
            gap: '0.75rem',
          }}
        >
          <div
            className="flex min-w-0 flex-1 items-center"
            style={{
              gap: '0.5rem',
            }}
          >
            <svg
              className="flex-shrink-0"
              aria-hidden="true"
              style={{
                height: '1.125rem',
                width: '1.125rem',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className="text-label-medium truncate font-medium sm:text-label-large"
              style={{
                fontSize: '0.8125rem',
                lineHeight: '1.4',
              }}
            >
              {state.error}
            </span>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex flex-shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none touch-manipulation"
            style={{
              height: '44px',
              width: '44px',
              minHeight: '44px',
              minWidth: '44px',
              color: 'var(--gray-600)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--gray-200)';
              e.currentTarget.style.color = 'var(--gray-800)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--gray-600)';
            }}
            aria-label="Tutup pesan error"
          >
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Header - Mobile-first responsive design with optimized spacing */}
      <header
        className="sticky top-0 z-10 border-b shadow-sm"
        role="banner"
        style={{
          backgroundColor: 'var(--gray-50)',
          borderColor: 'var(--gray-200)',
        }}
      >
        <div
          className="mx-auto w-full max-w-none sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
          style={{
            padding: '1rem 1rem',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              gap: '1rem',
            }}
          >
            <div className="min-w-0 flex-1">
              <h1
                className="truncate"
                style={{
                  color: 'var(--gray-950)',
                  fontSize: '1.125rem',
                  lineHeight: '1.5',
                  fontWeight: '700',
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    h1 { font-size: 1.25rem !important; }
                  }
                  @media (min-width: 1024px) {
                    h1 { font-size: 1.5rem !important; }
                  }
                `}</style>
                SMARTCHAT
              </h1>
              <p
                className="hidden sm:block"
                style={{
                  color: 'var(--gray-600)',
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                }}
              >
                Asisten AI yang siap membantu Anda
              </p>
            </div>

            {/* Connection Status Indicator - Responsive for all screen sizes */}
            <div
              className="flex items-center rounded-full"
              role="status"
              aria-live="polite"
              aria-label={
                state.isOnline
                  ? 'Status koneksi: Online'
                  : 'Status koneksi: Offline'
              }
              style={{
                backgroundColor: 'var(--gray-100)',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                minHeight: '36px',
                flexShrink: 0,
              }}
            >
              <style>{`
                @media (min-width: 640px) {
                  .status-container { padding: 0.625rem 1rem !important; }
                }
              `}</style>
              <div
                className={`rounded-full ${state.isOnline ? 'status-online' : 'status-offline'}`}
                aria-hidden="true"
                style={{
                  width: '8px',
                  height: '8px',
                  flexShrink: 0,
                }}
              />
              <span
                className="font-medium"
                style={{
                  color: 'var(--gray-600)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    .status-text { font-size: 0.875rem !important; }
                  }
                `}</style>
                {state.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Error Display */}
      <ErrorDisplay />

      {/* Main Chat Area - Responsive container with desktop optimization */}
      <main
        id="main-content"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        role="main"
      >
        <div
          className="mx-auto flex h-full w-full max-w-none flex-col sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
          style={{
            width: '100%',
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              main > div {
                padding-left: 1rem;
                padding-right: 1rem;
              }
            }
            @media (min-width: 1280px) {
              main > div {
                padding-left: 2rem;
                padding-right: 2rem;
              }
            }
          `}</style>
          {/* Message List */}
          <MessageList messages={state.messages} isLoading={state.isLoading} />
        </div>
      </main>

      {/* Message Input - Docked at bottom outside main container */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={state.isLoading || !state.isOnline}
      />

      {/* PWA Install Prompt */}
      <LazyPWAInstallPrompt
        onInstall={() => console.log('PWA berhasil diinstall')}
        onDismiss={() => console.log('PWA install prompt ditutup')}
      />
    </div>
  );
}

/**
 * Komponen utama ChatInterface dengan Error Boundary dan Context Provider
 * Mengintegrasikan semua sub-komponen dengan layout responsif
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
