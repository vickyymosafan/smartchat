'use client';

import { MessageBubbleProps } from '@/types/chat';
import { cn } from '@/lib/utils';
import {
  CheckCheck,
  AlertCircle,
  Copy,
  RefreshCw,
  Check,
  RotateCw,
} from 'lucide-react';
import MarkdownRenderer from '@/lib/ui/MarkdownRenderer';
import { TooltipButton } from './TooltipButton';
import { ReactionButtons } from './ReactionButtons';
import { toast } from 'sonner';
import { useState } from 'react';

/**
 * Utility function untuk format timestamp ke format waktu saja (HH:MM)
 */
function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Component untuk status indicator pada user messages
 */
function StatusIndicator({ hasError }: { hasError?: boolean }) {
  if (hasError) {
    return (
      <AlertCircle className="h-3 w-3 text-destructive" aria-label="Error" />
    );
  }

  return (
    <CheckCheck className="h-3 w-3 text-muted-foreground" aria-label="Sent" />
  );
}

/**
 * MessageBubble Component
 *
 * Menampilkan individual message dengan variants untuk user/assistant/system.
 * Mendukung responsive max-width, hover effects, dan status indicators.
 *
 * @param message - Data pesan yang akan ditampilkan
 * @param onCopy - Callback saat copy message (untuk assistant messages)
 * @param onRegenerate - Callback saat regenerate message (untuk assistant messages)
 * @param onReaction - Callback saat reaction pada message (untuk assistant messages)
 * @param onRetry - Callback saat retry failed message (untuk user messages)
 */
export function MessageBubble({
  message,
  onCopy,
  onRegenerate,
  onReaction,
  onRetry,
}: MessageBubbleProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { role, content, createdAt, meta } = message;
  const hasError = meta?.error === true;

  // System message variant - centered dengan rounded-full
  if (role === 'system') {
    return (
      <div className="flex justify-center px-4 py-2">
        <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  // Handler untuk retry failed message
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // User message variant - right aligned dengan accent background
  if (role === 'user') {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
          <div
            className={cn(
              'rounded-2xl rounded-br-md bg-accent px-3 py-2 text-accent-foreground sm:px-4 sm:py-3',
              'whitespace-pre-wrap break-words',
              hasError &&
              'border-2 border-destructive bg-destructive/10 text-foreground'
            )}
          >
            <p className="text-sm sm:text-base">{content}</p>
          </div>
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{formatTimeOnly(createdAt)}</span>
            <StatusIndicator hasError={hasError} />
            {hasError && onRetry && (
              <TooltipButton
                icon={RotateCw}
                label="Retry"
                onClick={handleRetry}
                ariaLabel="Retry sending message"
                className="h-6 w-6 text-destructive hover:text-destructive/80"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handler untuk copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      toast.success('Copied to clipboard', {
        duration: 2000,
      });

      // Reset copy success state setelah 2 detik
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);

      // Call optional onCopy callback
      if (onCopy) {
        onCopy();
      }
    } catch (error) {
      toast.error('Failed to copy', {
        duration: 2000,
      });
    }
  };

  // Handler untuk regenerate message
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  // Handler untuk reaction
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(reaction);
    }
  };

  // Assistant message variant - left aligned tanpa bubble background
  if (role === 'assistant') {
    return (
      <div className="flex justify-start px-4 py-2">
        <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
          <div className="px-3 py-2 sm:px-4 sm:py-3">
            <MarkdownRenderer content={content} />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTimeOnly(createdAt)}
            </span>
            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <TooltipButton
                icon={copySuccess ? Check : Copy}
                label={copySuccess ? 'Copied!' : 'Copy'}
                onClick={handleCopy}
                ariaLabel="Copy message"
              />

              {/* Regenerate Button */}
              {onRegenerate && (
                <TooltipButton
                  icon={RefreshCw}
                  label="Regenerate"
                  onClick={handleRegenerate}
                  ariaLabel="Regenerate response"
                />
              )}

              {/* Reaction Buttons */}
              {onReaction && <ReactionButtons onReaction={handleReaction} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - tidak seharusnya terjadi
  return null;
}
