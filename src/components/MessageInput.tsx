'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from '@/types/chat';
import { validateMessage, sanitizeMessage } from '@/lib/utils';

/**
 * Komponen MessageInput untuk form input pesan chat
 * Menyediakan form input dengan validasi real-time, keyboard shortcuts, dan responsive design
 */
export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Validasi pesan secara real-time
   */
  useEffect(() => {
    if (message.trim().length === 0) {
      setError(null);
      return;
    }

    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      const validation = validateMessage(message);
      setError(validation.isValid ? null : validation.error || null);
      setIsValidating(false);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [message]);

  /**
   * Auto-resize textarea berdasarkan konten
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  /**
   * Handle perubahan input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
  };

  /**
   * Handle pengiriman pesan
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    const validation = validateMessage(message);
    if (!validation.isValid) {
      setError(validation.error || 'Pesan tidak valid');
      return;
    }

    try {
      const sanitizedMessage = sanitizeMessage(message);
      await onSendMessage(sanitizedMessage);
      setMessage('');
      setError(null);
      
      // Focus kembali ke textarea setelah mengirim
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter untuk kirim (tanpa Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    
    // Shift + Enter untuk baris baru (default behavior)
    // Escape untuk clear input
    if (e.key === 'Escape') {
      setMessage('');
      setError(null);
    }
  };

  const isSubmitDisabled = isLoading || !!error || message.trim().length === 0;

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="relative">
          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan Anda di sini... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            disabled={isLoading}
            className={`
              w-full resize-none rounded-lg border px-4 py-3 pr-12 text-base
              transition-colors duration-200 focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${isLoading ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-900'}
              placeholder:text-slate-500
              sm:text-sm
            `}
            rows={1}
            maxLength={5000}
            aria-label="Input pesan chat"
            aria-invalid={!!error}
            aria-describedby={error ? 'message-error' : undefined}
          />

          {/* Tombol Kirim */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`
              absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center
              rounded-md transition-all duration-200
              ${isSubmitDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200'
              }
              sm:h-9 sm:w-9
            `}
            aria-label="Kirim pesan"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5" />
            ) : (
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="message-error"
            className="mt-2 flex items-center text-sm text-red-600"
            role="alert"
          >
            <svg
              className="mr-2 h-4 w-4 flex-shrink-0"
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
            {error}
          </div>
        )}

        {/* Character Counter */}
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>Enter untuk kirim • Shift+Enter untuk baris baru</span>
            {isValidating && (
              <span className="flex items-center">
                <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-transparent" />
                Memvalidasi...
              </span>
            )}
          </div>
          <span className={message.length > 4500 ? 'text-amber-600' : ''}>
            {message.length}/5000
          </span>
        </div>
      </form>
    </div>
  );
}