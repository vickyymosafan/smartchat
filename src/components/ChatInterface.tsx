'use client';

import { useEffect } from 'react';
import { ChatInterfaceProps } from '@/types/chat';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import PWAInstallPrompt from './PWAInstallPrompt';

/**
 * Komponen internal ChatInterface yang menggunakan context
 */
function ChatInterfaceContent() {
  const { state, addMessage, updateMessageStatus, setLoading, setError } = useChatContext();

  /**
   * Handle pengiriman pesan ke API
   */
  const handleSendMessage = async (message: string): Promise<void> => {
    try {
      // Tambahkan pesan user dengan status 'sending'
      addMessage({
        content: message,
        type: 'user',
        status: 'sending',
      });

      setLoading(true);
      setError(null);

      // Simulasi API call - akan diganti dengan implementasi nyata di task selanjutnya
      // TODO: Implementasi API call ke n8n webhook
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status pesan user menjadi 'sent'
      const userMessage = state.messages[state.messages.length - 1];
      if (userMessage) {
        updateMessageStatus(userMessage.id, 'sent');
      }

      // Tambahkan response dari assistant
      addMessage({
        content: 'Terima kasih atas pesan Anda. Fitur ini akan segera diimplementasikan dengan integrasi n8n webhook.',
        type: 'assistant',
        status: 'sent',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update status pesan user menjadi 'error'
      const userMessage = state.messages[state.messages.length - 1];
      if (userMessage) {
        updateMessageStatus(userMessage.id, 'error');
      }

      setError('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show offline indicator
   */
  const OfflineIndicator = () => {
    if (state.isOnline) return null;

    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="mx-auto max-w-4xl flex items-center justify-center text-amber-800">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">
            Anda sedang offline. Pesan akan dikirim saat koneksi kembali.
          </span>
        </div>
      </div>
    );
  };

  /**
   * Error display component
   */
  const ErrorDisplay = () => {
    if (!state.error) return null;

    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-2">
        <div className="mx-auto max-w-4xl flex items-center justify-between text-red-800">
          <div className="flex items-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{state.error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 focus:outline-none"
            aria-label="Tutup pesan error"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Chat Dinamis
              </h1>
              <p className="text-sm text-slate-600">
                Asisten AI yang siap membantu Anda
              </p>
            </div>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${state.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs text-slate-500 sm:text-sm">
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

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Message List */}
        <MessageList 
          messages={state.messages} 
          isLoading={state.isLoading} 
        />

        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading || !state.isOnline}
        />
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt 
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
export default function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  return (
    <ErrorBoundary>
      <ChatProvider initialMessages={initialMessages}>
        <ChatInterfaceContent />
      </ChatProvider>
    </ErrorBoundary>
  );
}