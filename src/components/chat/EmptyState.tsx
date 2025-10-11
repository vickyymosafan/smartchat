'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="flex h-full items-center justify-center p-8"
    >
      <div className="max-w-[28rem] text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground" />
        </div>

        {/* Headline */}
        <h2 className="mb-3 text-2xl font-semibold">Mulai Percakapan</h2>

        {/* Description */}
        <p className="mb-6 text-muted-foreground">
          Kirim pesan pertama Anda untuk memulai percakapan dengan AI Assistant
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        {/* Keyboard Hints */}
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p>
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

          {/* Keyboard Shortcuts Documentation */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-center hover:text-foreground transition-colors">
              ⌨️ Lihat semua keyboard shortcuts
            </summary>
            <div className="mt-3 space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span>Focus message input</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Open command palette</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
                  {typeof window !== 'undefined' &&
                  /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
                    ? 'Cmd+K'
                    : 'Ctrl+K'}
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Start new chat</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
                  {typeof window !== 'undefined' &&
                  /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
                    ? 'Cmd+N'
                    : 'Ctrl+N'}
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Send message</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>New line</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
                  Shift+Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Clear input</span>
                <kbd className="rounded bg-background px-2 py-1 font-mono text-xs shadow-sm">
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
