'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from '@/types/chat';
import { validateMessage, sanitizeMessage } from '@/lib/utils';
import { useToastContext } from '@/contexts/ToastContext';

/**
 * v0.app Style MessageInput Component
 * Minimal, clean input with subtle button
 */
export default function MessageInput({
  onSendMessage,
  isLoading,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToastContext();

  // Validate message
  useEffect(() => {
    if (message.trim().length === 0) {
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      const validation = validateMessage(message);
      setError(validation.isValid ? null : validation.error || null);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [message]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length >= 4800 && message.length < 4800) {
      toast.warning(
        'Mendekati Batas Karakter',
        `Anda telah menggunakan ${value.length} dari 5000 karakter.`,
        { duration: 3000 }
      );
    }

    setMessage(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const validation = validateMessage(message);
    if (!validation.isValid) {
      const errorMessage = validation.error || 'Pesan tidak valid';
      setError(errorMessage);
      toast.warning('Pesan Tidak Valid', errorMessage, { duration: 4000 });
      return;
    }

    try {
      const sanitizedMessage = sanitizeMessage(message);
      await onSendMessage(sanitizedMessage);
      setMessage('');
      setError(null);

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      const errorMessage = 'Gagal mengirim pesan. Silakan coba lagi.';
      setError(errorMessage);
      toast.error('Gagal Mengirim', errorMessage, { duration: 6000 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }

    if (e.key === 'Escape') {
      setMessage('');
      setError(null);
    }
  };

  const isSubmitDisabled = isLoading || !!error || message.trim().length === 0;

  return (
    <div style={{ 
      padding: 'var(--space-xl) 0',
      borderTop: '1px solid var(--border-subtle)'
    }}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Textarea Input - v0.app style */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up..."
          disabled={isLoading}
          className="w-full resize-none focus:outline-none"
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--space-lg)',
            color: isLoading ? 'var(--text-tertiary)' : 'var(--text-primary)',
            padding: 'var(--space-md) 3.5rem var(--space-md) var(--space-lg)',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            minHeight: '52px',
            transition: 'border-color 200ms ease, box-shadow 200ms ease'
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--gray-800)';
              e.target.style.boxShadow = '0 0 0 1px var(--gray-800)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
            e.target.style.boxShadow = 'none';
          }}
          rows={1}
          maxLength={5000}
          aria-label="Input pesan chat"
          aria-invalid={!!error}
        />

        {/* Send Button - v0.app style: minimal, icon only */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="absolute flex items-center justify-center touch-manipulation"
          style={{
            bottom: 'var(--space-sm)',
            right: 'var(--space-sm)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isSubmitDisabled ? 'var(--gray-100)' : 'var(--gray-900)',
            color: isSubmitDisabled ? 'var(--gray-400)' : 'var(--gray-50)',
            border: 'none',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.backgroundColor = 'var(--gray-800)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.backgroundColor = 'var(--gray-900)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          aria-label="Kirim pesan"
        >
          {isLoading ? (
            <div 
              className="animate-spin rounded-full" 
              style={{ 
                width: '18px', 
                height: '18px',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'var(--gray-50)',
                borderTopColor: 'transparent'
              }}
            />
          ) : (
            <svg
              style={{
                height: '18px',
                width: '18px'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          )}
        </button>

        {/* Error Message - minimal */}
        {error && (
          <div
            className="flex items-center animate-fade-in"
            style={{ 
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-sm)',
              fontSize: '0.8125rem',
              gap: 'var(--space-xs)'
            }}
            role="alert"
          >
            <svg
              style={{ 
                height: '14px',
                width: '14px',
                flexShrink: 0
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Upgrade Plan Link - v0.app style */}
        <div style={{
          marginTop: 'var(--space-md)',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)'
        }}>
          <span>Upgrade to Team to unlock all of v0's features and more credits.</span>
          {' '}
          <a 
            href="#" 
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Upgrade Plan
          </a>
        </div>
      </form>
    </div>
  );
}
