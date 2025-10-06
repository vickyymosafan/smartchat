'use client';

import { ChatInterfaceProps } from '@/types/chat';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { useToastContext } from '@/contexts/ToastContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorBoundary from './ErrorBoundary';
import { LazyPWAInstallPrompt } from '@/lib/lazyComponents';

/**
 * Komponen internal ChatInterface yang menggunakan context
 */
function ChatInterfaceContent() {
  const { state, addMessage, updateMessageStatus, setLoading, setError } =
    useChatContext();
  const toast = useToastContext();

  /**
   * Handle pengiriman pesan ke API dengan integrasi n8n RAG System
   */
  const handleSendMessage = async (message: string): Promise<void> => {
    // Declare userMessageId outside try-catch so it's accessible in catch block
    let userMessageId: string | undefined;

    try {
      // Tambahkan pesan user dengan status 'sending'
      userMessageId = addMessage({
        content: message,
        type: 'user',
        status: 'sending',
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

      // Update status pesan user menjadi 'sent'
      updateMessageStatus(userMessageId, 'sent');

      // Tambahkan response dari RAG AI Assistant
      addMessage({
        content: data.data?.response || 'Response dari AI Assistant',
        type: 'assistant',
        status: 'sent',
      });

      // Tampilkan toast success
      toast.success(
        'Pesan Terkirim',
        'Pesan Anda berhasil dikirim dan diproses oleh AI Assistant.'
      );
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Update status pesan user menjadi 'error' jika pesan sudah dibuat
      if (userMessageId) {
        updateMessageStatus(userMessageId, 'error');
      }

      // Tentukan pesan error berdasarkan jenis error
      let errorMessage = 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Tampilkan toast error
      toast.error(
        'Gagal Mengirim Pesan',
        errorMessage,
        { duration: 7000 }
      );

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show offline indicator - Responsive design
   */
  const OfflineIndicator = () => {
    if (state.isOnline) return null;

    return (
      <div className="border-b border-warning/20 bg-warning/10 px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-none items-center justify-center text-warning sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <svg
            className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
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
          <span className="text-label-medium font-medium sm:text-label-large">
            Anda sedang offline. Pesan akan dikirim saat koneksi kembali.
          </span>
        </div>
      </div>
    );
  };

  /**
   * Error display component - Responsive design with touch-optimized close button
   */
  const ErrorDisplay = () => {
    if (!state.error) return null;

    return (
      <div className="border-b border-error/20 bg-error/10 px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-none items-center justify-between text-error sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="flex min-w-0 flex-1 items-center">
            <svg
              className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
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
            <span className="text-label-medium truncate font-medium sm:text-label-large">
              {state.error}
            </span>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-error/70 transition-colors hover:bg-error/10 hover:text-error focus:outline-none focus:ring-2 focus:ring-error/20 sm:h-6 sm:w-6"
            aria-label="Tutup pesan error"
          >
            <svg
              className="h-4 w-4"
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
      {/* Header - Mobile-first responsive design */}
      <header className="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
        <div className="mx-auto w-full max-w-none px-3 py-3 sm:max-w-2xl sm:px-4 sm:py-4 lg:max-w-4xl lg:px-6 xl:max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-headline-medium truncate text-text sm:text-headline-large lg:text-display-small">
                Chat Dinamis
              </h1>
              <p className="text-body-small hidden text-text-muted sm:block sm:text-body-medium">
                Asisten AI yang siap membantu Anda
              </p>
            </div>

            {/* Connection Status Indicator - Optimized for touch */}
            <div className="flex items-center space-x-2 rounded-full bg-surface px-2 py-1 sm:px-3 sm:py-1.5">
              <div
                className={`h-2 w-2 rounded-full ${state.isOnline ? 'status-online' : 'status-offline'}`}
              />
              <span className="text-label-medium font-medium text-text-muted sm:text-label-large">
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

      {/* Main Chat Area - Responsive container */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-none flex-col sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          {/* Message List */}
          <MessageList messages={state.messages} isLoading={state.isLoading} />

          {/* Message Input */}
          <MessageInput
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
