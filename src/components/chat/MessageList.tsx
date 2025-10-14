'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { MessageListProps } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { groupMessagesByDate } from '@/lib/date-utils';
import { useDebouncedScroll } from '@/hooks/useDebouncedScroll';

/**
 * MessageList Component
 *
 * Menampilkan daftar pesan dalam scrollable container dengan virtualization untuk optimal performance.
 * Mendukung conditional rendering untuk EmptyState saat tidak ada pesan.
 *
 * Features:
 * - Virtualized scrolling dengan @tanstack/react-virtual untuk handle 1000+ messages
 * - Auto-scroll ke bottom saat pesan baru
 * - Responsive padding (1rem mobile → 2rem desktop)
 * - Gap 1rem antara messages
 * - Conditional rendering untuk EmptyState
 * - Overscan 5 items untuk smooth scrolling
 *
 * @param messages - Daftar pesan yang akan ditampilkan
 * @param isLoading - Status loading
 * @param onRegenerate - Callback saat regenerate message
 * @param onCopy - Callback saat copy message
 * @param onReaction - Callback saat reaction pada message
 */
// Message animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1] as const, // ease-out
    },
  },
};

export function MessageList({
  messages,
  isLoading = false,
  onRegenerate,
  onCopy,
  onReaction,
  onRetry,
}: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const userScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Track previous message count untuk detect new messages
  const prevMessageCountRef = useRef(messages.length);

  // Group messages by date dengan useMemo untuk performance
  const groupedItems = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Configure virtualizer untuk optimal performance
  const virtualizer = useVirtualizer({
    count: groupedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: index => {
      // Date separators lebih kecil dari messages
      return groupedItems[index].type === 'separator' ? 50 : 100;
    },
    overscan: 5, // Render 5 items outside viewport untuk smooth scrolling
  });

  // Wrap scrollToBottom dengan useCallback untuk stability
  const scrollToBottom = useCallback(() => {
    if (!parentRef.current) return;
    requestAnimationFrame(() => {
      if (parentRef.current) {
        parentRef.current.scrollTo({
          top: parentRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }, []);

  // Setup debounced scroll dengan delay 150ms untuk smooth performance
  const { debouncedScroll, cleanup: cleanupDebounce } = useDebouncedScroll(
    scrollToBottom,
    150
  );



  // Setup IntersectionObserver untuk detect apakah user di bottom
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          isAtBottomRef.current = entry.isIntersecting;
        });
      },
      {
        root: parentRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Auto-scroll ke bottom saat ada pesan baru (hanya jika user di bottom DAN tidak sedang scroll manual)
  useEffect(() => {
    if (isAtBottomRef.current && !userScrollingRef.current) {
      debouncedScroll();
    }
    
    // Update previous message count
    prevMessageCountRef.current = messages.length;
  }, [messages, debouncedScroll]);

  // Handle scroll button visibility dan detect manual scroll
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Update scroll button visibility
      setShowScrollButton(distanceFromBottom > 150);

      // Detect manual scroll - set flag untuk prevent auto-scroll
      userScrollingRef.current = true;

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset flag setelah user stop scrolling (500ms)
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false;
      }, 500);
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupDebounce();
    };
  }, [cleanupDebounce]);

  // Conditional rendering: tampilkan EmptyState jika tidak ada pesan
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={parentRef}
        role="log"
        aria-label="Chat message history"
        aria-live="polite"
        aria-atomic="false"
        className="chat-scroll h-full overflow-y-auto py-4 pb-4 sm:py-6 sm:pb-6 lg:py-8 lg:pb-8"
      >
        <div
          ref={contentRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualItem => {
            const item = groupedItems[virtualItem.index];

            // Check if this is a new message (simple check based on message count)
            const isNewMessage = 
              item.type === 'message' && 
              virtualItem.index >= prevMessageCountRef.current;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item.type === 'separator' ? (
                  <DateSeparator date={item.date!} />
                ) : (
                  <motion.div
                    className="pb-4"
                    variants={messageVariants}
                    initial={isNewMessage ? 'hidden' : 'visible'}
                    animate="visible"
                  >
                    <MessageBubble
                      message={item.message!}
                      onCopy={
                        onCopy ? () => onCopy(item.message!.content) : undefined
                      }
                      onRegenerate={
                        onRegenerate
                          ? () => onRegenerate(item.message!.id)
                          : undefined
                      }
                      onReaction={
                        onReaction
                          ? reaction => onReaction(item.message!.id, reaction)
                          : undefined
                      }
                      onRetry={
                        onRetry ? () => onRetry(item.message!.id) : undefined
                      }
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* TypingIndicator saat assistant sedang mengetik */}
        {isLoading && (
          <div className="pb-4">
            <TypingIndicator />
          </div>
        )}

        {/* Bottom sentinel untuk IntersectionObserver */}
        <div ref={bottomSentinelRef} className="h-px" aria-hidden="true" />
      </div>

      {/* Scroll-to-bottom button dengan fade animation */}
      <Button
        onClick={() => {
          scrollToBottom();
          isAtBottomRef.current = true;
          userScrollingRef.current = false; // Reset manual scroll flag
        }}
        size="icon-lg"
        variant="default"
        className={cn(
          'absolute bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-200 ease-out sm:bottom-24 sm:right-6 lg:right-8',
          showScrollButton
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        )}
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
