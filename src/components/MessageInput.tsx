'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from '@/types/chat';
import { validateMessage, sanitizeMessage } from '@/lib/utils';
import { useToastContext } from '@/contexts/ToastContext';

/**
 * Komponen MessageInput untuk form input pesan chat
 * Menyediakan form input dengan validasi real-time, keyboard shortcuts, dan responsive design
 */
export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToastContext();

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
    
    // Cek jika mendekati batas karakter
    if (value.length >= 4800 && message.length < 4800) {
      toast.warning(
        'Mendekati Batas Karakter',
        `Anda telah menggunakan ${value.length} dari 5000 karakter.`,
        { duration: 3000 }
      );
    }
    
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
      const errorMessage = validation.error || 'Pesan tidak valid';
      setError(errorMessage);
      
      // Tampilkan toast warning untuk validation error
      toast.warning(
        'Pesan Tidak Valid',
        errorMessage,
        { duration: 4000 }
      );
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
      const errorMessage = 'Gagal mengirim pesan. Silakan coba lagi.';
      setError(errorMessage);
      
      // Tampilkan toast error untuk send error
      toast.error(
        'Gagal Mengirim',
        errorMessage,
        { duration: 6000 }
      );
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
    <div className="border-t border-border bg-background p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="mx-auto w-full">
        <div className="relative">
          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan Anda di sini..."
            disabled={isLoading}
            className={`
              text-body-large input-field w-full resize-none rounded-2xl border px-4 py-3 pr-14
              transition-colors duration-200 focus:outline-none focus:ring-2
              ${error 
                ? 'border-error focus:border-error focus:ring-error/20' 
                : 'border-border focus:border-primary focus:ring-primary/20'
              }
              ${isLoading ? 'bg-surface text-text-muted' : 'bg-background text-text'}
              placeholder:text-text-muted
              sm:px-5 sm:py-4 sm:pr-16 sm:text-body-medium
            `}
            rows={1}
            maxLength={5000}
            aria-label="Input pesan chat"
            aria-invalid={!!error}
            aria-describedby={error ? 'message-error' : undefined}
          />

          {/* Tombol Kirim - Touch optimized */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`
              absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center
              rounded-full transition-all duration-200 touch-manipulation focus-ring
              ${isSubmitDisabled
                ? 'btn-primary:disabled'
                : 'btn-primary hover:bg-primary-hover focus:bg-primary-hover active:scale-95'
              }
              sm:bottom-3 sm:right-3 sm:h-12 sm:w-12
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
            className="text-body-medium mt-2 flex items-center text-error"
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

        {/* Character Counter and Help Text */}
        <div className="text-label-small mt-2 flex flex-col space-y-1 text-text-muted sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">Enter untuk kirim • Shift+Enter untuk baris baru</span>
            <span className="sm:hidden">Tekan kirim untuk mengirim pesan</span>
            {isValidating && (
              <span className="flex items-center">
                <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-text-muted border-t-transparent" />
                <span className="hidden sm:inline">Memvalidasi...</span>
              </span>
            )}
          </div>
          <span className={`${message.length > 4500 ? 'text-warning' : ''} text-right`}>
            {message.length}/5000
          </span>
        </div>
      </form>
    </div>
  );
}