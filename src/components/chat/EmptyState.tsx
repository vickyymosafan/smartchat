'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Props untuk EmptyState component
 */
interface EmptyStateProps {
  /** Callback function saat suggestion chip diklik */
  onSuggestionClick?: (suggestion: string) => void;
  /** Array of suggestion strings untuk ditampilkan */
  suggestions?: string[];
}

/**
 * Default suggestions yang ditampilkan jika tidak ada custom suggestions
 */
const defaultSuggestions = [
  'Apa itu AI?',
  'Jelaskan tentang machine learning',
  'Bagaimana cara kerja neural network?',
  'Tips produktivitas kerja',
];

/**
 * EmptyState Component
 *
 * Menampilkan initial state saat belum ada pesan dalam chat.
 * Menyediakan suggestion chips untuk quick start conversation.
 *
 * Features:
 * - Centered layout dengan max-width 28rem
 * - Icon illustration (MessageCircle)
 * - Headline dan description text
 * - Suggestion chips dengan hover animation
 * - Keyboard shortcuts documentation
 * - Fade-in animation saat mount
 *
 * @param onSuggestionClick - Callback saat suggestion diklik
 * @param suggestions - Custom suggestions (default: defaultSuggestions)
 *
 * @example
 * ```tsx
 * <EmptyState
 *   onSuggestionClick={(suggestion) => send(suggestion)}
 *   suggestions={['Hello', 'How are you?']}
 * />
 * ```
 */
export function EmptyState({
  onSuggestionClick,
  suggestions = defaultSuggestions,
}: EmptyStateProps) {
  // Track initial mount to skip animation for better LCP
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Mark initial mount as complete after first render
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <motion.div
      initial={isInitialMount ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isInitialMount ? 0 : 0.3, ease: [0, 0, 0.2, 1] }}
      className="flex h-full items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-[90%] sm:max-w-md text-center">
        {/* Icon */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <MessageCircle className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-muted-foreground" />
        </div>

        {/* Headline */}
        <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold">Mulai Percakapan</h2>

        {/* Description */}
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground px-2">
          Kirim pesan pertama Anda untuk memulai percakapan dengan AI Assistant
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border bg-background px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        {/* Keyboard Hints */}
        <div className="mt-4 sm:mt-6 space-y-2 text-xs sm:text-sm text-muted-foreground px-2">
          <p className="hidden sm:block">
            💡 Tekan{' '}
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              Enter
            </kbd>{' '}
            untuk kirim,{' '}
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              Shift+Enter
            </kbd>{' '}
            untuk baris baru
          </p>

          {/* Keyboard Shortcuts Documentation - Hidden on mobile */}
          <details className="mt-3 sm:mt-4 text-left hidden sm:block">
            <summary className="cursor-pointer text-center hover:text-foreground transition-colors">
              ⌨️ Lihat semua keyboard shortcuts
            </summary>
            <div className="mt-3 space-y-2 rounded-lg border bg-muted/50 p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Focus message input</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Open command palette</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  {typeof window !== 'undefined' &&
                  /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
                    ? 'Cmd+K'
                    : 'Ctrl+K'}
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Start new chat</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  {typeof window !== 'undefined' &&
                  /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
                    ? 'Cmd+N'
                    : 'Ctrl+N'}
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Send message</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>New line</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  Shift+Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Clear input</span>
                <kbd className="rounded bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs shadow-sm">
                  Escape
                </kbd>
              </div>
            </div>
          </details>
        </div>
      </div>
    </motion.div>
  );
}
