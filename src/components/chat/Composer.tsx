'use client';

import {
  useState,
  useRef,
  useEffect,
  FormEvent,
  KeyboardEvent,
  useCallback,
} from 'react';
import { Send, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import type { ComposerProps } from '@/types/chat';
import { cn, validateMessage as validateMessageUtil } from '@/lib/utils';
import { saveInputDraft, loadInputDraft, clearInputDraft } from '@/lib/storage';
import { DEFAULT_CONFIG } from '@/lib/constants';

/**
 * Composer - Input area component untuk mengirim pesan
 *
 * Komponen ini menyediakan:
 * - Autosize textarea yang menyesuaikan tinggi berdasarkan konten
 * - Validasi input dengan character counter
 * - Keyboard shortcuts (Enter untuk send, Shift+Enter untuk newline)
 * - Send button dengan loading state
 * - Responsive design dengan proper touch targets
 *
 * @param onSend - Callback function saat pesan dikirim
 * @param isLoading - Status loading saat mengirim pesan
 * @param placeholder - Placeholder text untuk textarea
 * @param maxLength - Maksimal panjang karakter (default: 5000)
 */
export function Composer({
  onSend,
  isLoading = false,
  isOnline = true,
  placeholder = 'Ketik pesan Anda di sini...',
  maxLength = DEFAULT_CONFIG.MAX_MESSAGE_LENGTH,
}: ComposerProps) {
  // State untuk message input
  const [message, setMessage] = useState('');

  // State untuk validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // Ref untuk textarea element (digunakan untuk autosize logic)
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref untuk debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref untuk auto-save timer (1 second debounce)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load input draft on mount
   */
  useEffect(() => {
    const draft = loadInputDraft();
    if (draft) {
      setMessage(draft);
    }
  }, []);

  /**
   * Validation function dengan debounce
   * Menggunakan shared validation utility
   */
  const validateMessage = useCallback(
    (value: string) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer untuk debounce validation
      debounceTimerRef.current = setTimeout(() => {
        const validation = validateMessageUtil(value);
        setValidationError(validation.isValid ? null : validation.error || null);
      }, 300);
    },
    []
  );

  /**
   * Autosize logic untuk textarea
   * Menyesuaikan tinggi textarea berdasarkan scrollHeight
   * Min-height: 48px, Max-height: 120px
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height ke auto untuk mendapatkan scrollHeight yang akurat
    textarea.style.height = 'auto';

    // Set height berdasarkan scrollHeight dengan constraints
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 120);
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  /**
   * Auto-save input draft every 1 second
   */
  useEffect(() => {
    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (1 second debounce)
    autoSaveTimerRef.current = setTimeout(() => {
      saveInputDraft(message);
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [message]);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle form submit
   * Mengirim pesan jika valid (tidak kosong dan tidak loading)
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    // Validasi: pesan tidak boleh kosong atau ada validation error
    if (!trimmedMessage || isLoading || validationError) {
      return;
    }

    try {
      // Kirim pesan
      await onSend(trimmedMessage);

      // Clear textarea dan validation error setelah berhasil kirim
      setMessage('');
      setValidationError(null);

      // Clear input draft from storage
      clearInputDraft();

      // Focus kembali ke textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling akan ditangani oleh parent component
    }
  };

  /**
   * Handle keyboard shortcuts
   * - Enter: send message (jika tidak ada Shift)
   * - Shift+Enter: new line (default behavior)
   * - Escape: clear textarea
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter tanpa Shift = send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Trigger form submit
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
      return;
    }

    // Escape = clear textarea
    if (e.key === 'Escape') {
      e.preventDefault();
      setMessage('');
      setValidationError(null);

      // Clear input draft from storage
      clearInputDraft();

      // Focus tetap di textarea
      textareaRef.current?.focus();
      return;
    }

    // Shift+Enter = new line (default behavior, tidak perlu handle)
  };

  /**
   * Handle textarea change
   * Update message state dan trigger validation
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Trigger validation dengan debounce
    validateMessage(newValue);
  };

  // Check apakah send button harus disabled
  const isSendDisabled =
    !message.trim() || isLoading || validationError !== null || !isOnline;

  // Check apakah character count mendekati limit (> 4500)
  const isNearLimit = message.length > 4500;

  // Calculate character count display
  const characterCount = `${message.length}/${maxLength}`;

  return (
    <div className="border-t bg-background p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <form onSubmit={handleSubmit} className="relative">
          {/* Autosize Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isLoading}
            className={cn(
              'w-full resize-none rounded-2xl border bg-background',
              'px-3 sm:px-4 py-2.5 sm:py-3 pr-12 sm:pr-14',
              'min-h-[44px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px]',
              'text-sm sm:text-base leading-normal',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-shadow duration-200',
              validationError && 'border-destructive focus:ring-destructive'
            )}
            rows={1}
            aria-label="Message input"
            aria-describedby="composer-hints composer-error"
            aria-invalid={validationError !== null}
          />

          {/* Send Button - Positioned absolute bottom-right */}
          <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSendDisabled}
                  className={cn(
                    'h-9 w-9 sm:h-10 sm:w-10 rounded-full',
                    'transition-transform duration-200',
                    'hover:scale-110',
                    'active:scale-95',
                    'disabled:hover:scale-100'
                  )}
                  aria-label="Kirim pesan"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              {!isOnline && (
                <TooltipContent side="top">
                  <p>Tidak ada koneksi internet</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </form>

        {/* Validation Error Message */}
        {validationError && (
          <div
            id="composer-error"
            className="mt-2 text-sm text-destructive"
            role="alert"
          >
            {validationError}
          </div>
        )}

        {/* Offline Indicator Message */}
        {!isOnline && (
          <div
            className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <WifiOff className="h-4 w-4" />
            <span>Tidak ada koneksi internet</span>
          </div>
        )}

        {/* Keyboard Hints and Character Counter */}
        <div
          id="composer-hints"
          className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground"
        >
          {/* Keyboard Hints - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex items-center gap-2">
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>
            <span className="text-xs">kirim</span>
            <span>•</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Shift+Enter
            </kbd>
            <span>baris baru</span>
          </div>

          {/* Character Counter */}
          <span
            className={cn(
              'transition-colors duration-200 text-[10px] sm:text-xs',
              !isNearLimit && 'sm:ml-auto',
              isNearLimit && 'text-destructive font-medium ml-auto'
            )}
            aria-live="polite"
            aria-label={`${message.length} dari ${maxLength} karakter`}
          >
            {characterCount}
          </span>
        </div>
      </div>
    </div>
  );
}
