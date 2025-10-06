'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from '@/types/chat';
import { validateMessage, sanitizeMessage } from '@/lib/utils';
import { useToastContext } from '@/contexts/ToastContext';

/**
 * Komponen MessageInput untuk form input pesan chat
 * Menyediakan form input dengan validasi real-time, keyboard shortcuts, dan responsive design
 */
export default function MessageInput({
  onSendMessage,
  isLoading,
}: MessageInputProps) {
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
      toast.warning('Pesan Tidak Valid', errorMessage, { duration: 4000 });
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
      toast.error('Gagal Mengirim', errorMessage, { duration: 6000 });
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
    <div className="bg-[var(--gray-50)] message-input-container" style={{
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'var(--gray-200)',
      padding: '1rem'
    }}>
      <style>{`
        @media (min-width: 640px) {
          .message-input-container { padding: 1.5rem !important; }
        }
        @media (min-width: 1024px) {
          .message-input-container { padding: 2rem !important; }
        }
      `}</style>
      <form onSubmit={handleSubmit} className="mx-auto w-full">
        <div className="relative">
          {/* Textarea Input - Responsive for all screen sizes */}
          <style>{`
            @media (min-width: 640px) {
              .message-textarea {
                padding: 1rem 4rem 1rem 1.25rem !important;
                font-size: 0.9375rem !important;
                min-height: 52px !important;
              }
            }
            @media (min-width: 1024px) {
              .message-textarea {
                padding: 1.125rem 4.5rem 1.125rem 1.5rem !important;
                font-size: 1rem !important;
                line-height: 1.625 !important;
                min-height: 56px !important;
              }
            }
          `}</style>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan Anda di sini..."
            disabled={isLoading}
            className={`w-full resize-none focus:outline-none message-textarea placeholder:text-[var(--gray-400)] ${error ? 'animate-shake' : ''}`}
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: error ? 'var(--gray-800)' : 'var(--gray-300)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isLoading ? 'var(--gray-50)' : 'white',
              color: isLoading ? 'var(--gray-400)' : 'var(--gray-950)',
              boxShadow: 'none',
              transform: 'scale(1)',
              transition: 'border-color 200ms cubic-bezier(0, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1), background-color 200ms cubic-bezier(0, 0, 0.2, 1)',
              padding: '0.875rem 3.5rem 0.875rem 1rem',
              fontSize: '0.9375rem',
              lineHeight: '1.5',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (!isLoading && !error && document.activeElement !== target) {
                target.style.borderTopColor = 'var(--gray-400)';
                target.style.borderRightColor = 'var(--gray-400)';
                target.style.borderBottomColor = 'var(--gray-400)';
                target.style.borderLeftColor = 'var(--gray-400)';
              }
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (!isLoading && !error && document.activeElement !== target) {
                const color = error ? 'var(--gray-800)' : 'var(--gray-300)';
                target.style.borderTopColor = color;
                target.style.borderRightColor = color;
                target.style.borderBottomColor = color;
                target.style.borderLeftColor = color;
              }
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderTopColor = 'var(--gray-800)';
                e.target.style.borderRightColor = 'var(--gray-800)';
                e.target.style.borderBottomColor = 'var(--gray-800)';
                e.target.style.borderLeftColor = 'var(--gray-800)';
                e.target.style.boxShadow = '0 0 0 3px rgba(38, 38, 38, 0.1)';
                e.target.style.transform = 'scale(1.005)';
              }
            }}
            onBlur={(e) => {
              const color = error ? 'var(--gray-800)' : 'var(--gray-300)';
              e.target.style.borderTopColor = color;
              e.target.style.borderRightColor = color;
              e.target.style.borderBottomColor = color;
              e.target.style.borderLeftColor = color;
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'scale(1)';
            }}
            rows={1}
            maxLength={5000}
            aria-label="Input pesan chat"
            aria-invalid={!!error}
            aria-describedby={error ? 'message-error' : undefined}
          />

          {/* Tombol Kirim - Responsive touch target */}
          <style>{`
            @media (min-width: 640px) {
              .send-button {
                bottom: 0.625rem !important;
                right: 0.625rem !important;
                width: 52px !important;
                height: 52px !important;
                min-width: 52px !important;
                min-height: 52px !important;
              }
            }
            @media (min-width: 1024px) {
              .send-button {
                bottom: 0.75rem !important;
                right: 0.75rem !important;
                width: 56px !important;
                height: 56px !important;
                min-width: 56px !important;
                min-height: 56px !important;
              }
            }
          `}</style>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`
              absolute flex items-center justify-center
              rounded-full touch-manipulation send-button
              ${isSubmitDisabled
                ? 'cursor-not-allowed'
                : ''
              }
            `}
            style={{
              bottom: '0.5rem',
              right: '0.5rem',
              width: '48px',
              height: '48px',
              minWidth: '48px',
              minHeight: '48px',
              backgroundColor: isSubmitDisabled ? 'var(--gray-100)' : 'var(--gray-900)',
              color: isSubmitDisabled ? 'var(--gray-400)' : 'var(--gray-50)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderTopColor: isSubmitDisabled ? 'var(--gray-200)' : 'var(--gray-900)',
              borderRightColor: isSubmitDisabled ? 'var(--gray-200)' : 'var(--gray-900)',
              borderBottomColor: isSubmitDisabled ? 'var(--gray-200)' : 'var(--gray-900)',
              borderLeftColor: isSubmitDisabled ? 'var(--gray-200)' : 'var(--gray-900)',
              boxShadow: isSubmitDisabled ? 'none' : 'var(--shadow-sm)',
              transform: 'scale(1)',
              transition: 'background-color 200ms cubic-bezier(0, 0, 0.2, 1), border-color 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.backgroundColor = 'var(--gray-800)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.backgroundColor = 'var(--gray-900)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }
            }}
            onMouseUp={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onFocus={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(38, 38, 38, 0.1), var(--shadow-sm)';
              }
            }}
            onBlur={(e) => {
              if (!isSubmitDisabled) {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }
            }}
            aria-label="Kirim pesan"
          >
            <style>{`
              @media (min-width: 640px) {
                .send-icon { width: 24px !important; height: 24px !important; }
              }
              @media (min-width: 1024px) {
                .send-icon { width: 26px !important; height: 26px !important; }
              }
            `}</style>
            {isLoading ? (
              <div
                className="animate-spin rounded-full send-icon"
                style={{
                  width: '22px',
                  height: '22px',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: 'var(--gray-50)',
                  borderTopColor: 'transparent'
                }}
              />
            ) : (
              <svg
                className="send-icon"
                style={{
                  height: '22px',
                  width: '22px'
                }}
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

        {/* Error Message - Mobile optimized */}
        {error && (
          <div
            id="message-error"
            className="flex items-center animate-fade-in"
            style={{
              color: 'var(--gray-900)',
              marginTop: '0.625rem',
              fontSize: '0.8125rem',
              lineHeight: '1.4',
              gap: '0.5rem'
            }}
            role="alert"
          >
            <svg
              className="flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                color: 'var(--gray-700)',
                height: '16px',
                width: '16px'
              }}
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

        {/* Character Counter and Help Text - Mobile optimized */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{
            color: 'var(--gray-600)',
            marginTop: '0.625rem',
            fontSize: '0.6875rem',
            lineHeight: '1.3',
            gap: '0.375rem'
          }}
        >
          <div className="flex items-center" style={{
            gap: '0.5rem'
          }}>
            <span className="hidden sm:inline">
              Enter untuk kirim • Shift+Enter untuk baris baru
            </span>
            <span className="sm:hidden">Tekan kirim untuk mengirim pesan</span>
            {isValidating && (
              <span className="flex items-center" style={{
                gap: '0.25rem'
              }}>
                <div
                  className="animate-spin rounded-full"
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--gray-600)',
                    borderTopColor: 'transparent',
                    height: '12px',
                    width: '12px'
                  }}
                />
                <span className="hidden sm:inline">Memvalidasi...</span>
              </span>
            )}
          </div>
          <span
            className="text-right"
            style={{
              color: message.length > 4500 ? 'var(--gray-800)' : 'var(--gray-600)',
              fontSize: '0.6875rem',
              fontWeight: message.length > 4500 ? '600' : '400'
            }}
          >
            {message.length}/5000
          </span>
        </div>
      </form>
    </div>
  );
}
