'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageListProps, Message } from '@/types/chat';
import { formatTimestamp, formatTimeOnly } from '@/lib/utils';

/**
 * Komponen MessageList untuk menampilkan daftar pesan chat
 * Menyediakan tampilan pesan dengan auto-scroll, diferensiasi visual, dan timestamp
 */
export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedMessages, setAnimatedMessages] = useState<Set<string>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);

  /**
   * Auto-scroll ke pesan terbaru saat ada pesan baru dengan smooth behavior
   */
  useEffect(() => {
    if (messagesEndRef.current && containerRef.current) {
      // Use requestAnimationFrame for optimized scroll performance
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    }
  }, [messages]);

  /**
   * Track new messages for entrance animation
   */
  useEffect(() => {
    const newMessageIds = messages
      .filter(msg => !animatedMessages.has(msg.id))
      .map(msg => msg.id);
    
    if (newMessageIds.length > 0) {
      setAnimatedMessages(prev => {
        const updated = new Set(prev);
        newMessageIds.forEach(id => updated.add(id));
        return updated;
      });
    }
  }, [messages, animatedMessages]);

  /**
   * Handle scroll to detect if user scrolled up
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Scroll to bottom function with smooth animation
   */
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  /**
   * Render individual message bubble
   */
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const shouldAnimate = !animatedMessages.has(message.id);
    
    // Calculate stagger delay based on position in recent messages
    const recentMessageIndex = messages.slice(-5).findIndex(m => m.id === message.id);
    const staggerDelay = recentMessageIndex >= 0 ? recentMessageIndex * 50 : 0;

    return (
      <div
        key={message.id}
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${
          isSystem ? 'justify-center' : ''
        } ${shouldAnimate ? 'animate-slide-up' : ''}`}
        style={shouldAnimate ? { animationDelay: `${staggerDelay}ms` } : undefined}
        role="article"
        aria-label={`${isUser ? 'Pesan Anda' : 'Pesan dari asisten'} pada ${formatTimeOnly(message.timestamp)}`}
      >
        <div
          className={`
            transition-all duration-200 message-bubble
            ${
              isUser
                ? 'bg-[var(--gray-900)] text-[var(--gray-50)] rounded-2xl rounded-br-md shadow-sm'
                : isSystem
                  ? 'bg-surface text-text-muted text-xs italic sm:text-sm rounded-2xl'
                  : 'bg-[var(--gray-100)] border border-[var(--gray-200)] text-[var(--gray-950)] rounded-2xl rounded-bl-md shadow-xs'
            }
          `}
          style={{
            maxWidth: '85%',
            padding: '0.625rem 0.875rem'
          }}
        >
          <style>{`
            @media (min-width: 640px) {
              .message-bubble {
                max-width: 75% !important;
                padding: 0.75rem 1rem !important;
              }
            }
            @media (min-width: 1024px) {
              .message-bubble {
                max-width: 65% !important;
                padding: 0.875rem 1.125rem !important;
              }
            }
          `}</style>
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words message-content" style={{
            fontSize: '0.9375rem',
            lineHeight: '1.5'
          }}>
            <style>{`
              @media (min-width: 640px) {
                .message-content {
                  font-size: 0.9375rem !important;
                  line-height: 1.6 !important;
                }
              }
              @media (min-width: 1024px) {
                .message-content {
                  font-size: 1rem !important;
                  line-height: 1.625 !important;
                }
              }
            `}</style>
            {message.content}
          </div>

          {/* Message Footer dengan Timestamp dan Status */}
          <div
            className={`
              flex items-center justify-between
              ${isUser ? 'text-primary-light' : isSystem ? 'text-text-muted' : 'text-text-muted'}
            `}
            style={{
              marginTop: '0.5rem',
              fontSize: '0.6875rem',
              lineHeight: '1.3'
            }}
          >
            <span className="font-medium">
              {formatTimeOnly(message.timestamp)}
            </span>

            {/* Status Indicator untuk pesan user dengan animasi */}
            {isUser && (
              <div className="flex items-center" style={{
                marginLeft: '0.5rem',
                gap: '0.25rem'
              }}>
                {message.status === 'sending' && (
                  <div className="flex items-center" style={{
                    gap: '0.25rem'
                  }}>
                    <div 
                      className="rounded-full border-2 border-t-transparent animate-spin" 
                      style={{
                        borderColor: 'var(--gray-300)',
                        borderTopColor: 'transparent',
                        height: '12px',
                        width: '12px'
                      }}
                    />
                    <span className="hidden sm:inline" style={{
                      fontSize: '0.6875rem'
                    }}>Mengirim...</span>
                  </div>
                )}
                {message.status === 'sent' && (
                  <div className="flex items-center" role="status" aria-label="Pesan terkirim">
                    <svg
                      className="animate-checkmark"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        strokeDasharray: 20,
                        strokeDashoffset: 0,
                        height: '14px',
                        width: '14px'
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                {message.status === 'error' && (
                  <div className="flex items-center" role="alert" aria-label="Gagal mengirim pesan" style={{ 
                    color: 'var(--gray-400)',
                    gap: '0.25rem'
                  }}>
                    <svg
                      className="animate-error-shake"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        height: '14px',
                        width: '14px'
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline" style={{
                      fontSize: '0.6875rem'
                    }}>Gagal</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render date separator untuk mengelompokkan pesan berdasarkan tanggal
   */
  const renderDateSeparator = (date: Date, key: string) => (
    <div key={key} className="flex items-center justify-center" style={{
      padding: '0.75rem 0'
    }}>
      <div className="rounded-full bg-[var(--gray-100)] font-medium text-[var(--gray-600)]" style={{
        padding: '0.375rem 0.75rem',
        fontSize: '0.75rem',
        lineHeight: '1.3'
      }}>
        {formatTimestamp(date, false)}
      </div>
    </div>
  );

  /**
   * Group messages by date untuk menampilkan date separator
   */
  const groupMessagesByDate = () => {
    const grouped: { date: string; messages: Message[] }[] = [];

    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString();
      const existingGroup = grouped.find(group => group.date === dateKey);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        grouped.push({
          date: dateKey,
          messages: [message],
        });
      }
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div
      ref={containerRef}
      className="chat-scroll flex-1 overflow-y-auto bg-surface relative"
      role="log"
      aria-live="polite"
      aria-label="Daftar pesan chat"
      aria-atomic="false"
      style={{ 
        scrollBehavior: 'smooth',
        padding: '1rem'
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .chat-scroll { padding: 1.5rem !important; }
        }
        @media (min-width: 1024px) {
          .chat-scroll { padding: 2rem !important; }
        }
      `}</style>
      <div className="mx-auto w-full">
        {/* Empty State - Mobile optimized */}
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center animate-fade-in" style={{
            padding: '1rem'
          }}>
            <div className="text-center" style={{
              maxWidth: '320px'
            }}>
              <div className="mx-auto flex items-center justify-center rounded-full bg-[var(--gray-100)]" style={{
                marginBottom: '1.5rem',
                height: '64px',
                width: '64px'
              }}>
                <svg
                  style={{
                    height: '32px',
                    width: '32px',
                    color: 'var(--gray-600)'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-medium sm:text-headline-large" style={{
                marginBottom: '0.75rem',
                color: 'var(--gray-950)',
                fontSize: '1.125rem',
                lineHeight: '1.5'
              }}>
                Mulai Percakapan
              </h3>
              <p className="text-body-medium sm:text-body-large" style={{
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                Kirim pesan pertama Anda untuk memulai percakapan dengan asisten
                AI.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {groupedMessages.map((group, groupIndex) => (
          <div key={group.date}>
            {/* Date Separator */}
            {renderDateSeparator(new Date(group.date), `date-${groupIndex}`)}

            {/* Messages in this date group */}
            <div className="message-group" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <style>{`
                @media (min-width: 640px) {
                  .message-group { gap: 1rem !important; }
                }
                @media (min-width: 1024px) {
                  .message-group { gap: 1.25rem !important; }
                }
              `}</style>
              {group.messages.map((message) =>
                renderMessage(message, messages.indexOf(message))
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator - Mobile optimized */}
        {isLoading && (
          <div 
            className="flex justify-start animate-slide-up"
            role="status"
            aria-live="polite"
            aria-label="Asisten sedang mengetik"
          >
            <div className="rounded-2xl rounded-bl-md border border-[var(--gray-200)] bg-[var(--gray-100)] shadow-xs" style={{
              maxWidth: '85%',
              padding: '0.625rem 0.875rem'
            }}>
              <div className="flex items-center" style={{
                gap: '0.5rem'
              }}>
                <div className="flex" aria-hidden="true" style={{
                  gap: '0.25rem'
                }}>
                  <div className="rounded-full bg-[var(--gray-600)] animate-bounce-dots [animation-delay:-0.32s]" style={{
                    height: '8px',
                    width: '8px'
                  }}></div>
                  <div className="rounded-full bg-[var(--gray-600)] animate-bounce-dots [animation-delay:-0.16s]" style={{
                    height: '8px',
                    width: '8px'
                  }}></div>
                  <div className="rounded-full bg-[var(--gray-600)] animate-bounce-dots" style={{
                    height: '8px',
                    width: '8px'
                  }}></div>
                </div>
                <span className="text-[var(--gray-600)]" style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.4'
                }}>
                  Asisten sedang mengetik...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button - Touch optimized 48x48px */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed z-10 flex items-center justify-center rounded-full shadow-lg animate-slide-up touch-manipulation"
          style={{
            bottom: '6.5rem',
            right: '1rem',
            width: '48px',
            height: '48px',
            minWidth: '48px',
            minHeight: '48px',
            backgroundColor: 'var(--gray-900)',
            color: 'var(--gray-50)',
            transition: 'background-color 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-800)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-900)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          aria-label="Scroll ke bawah"
        >
          <svg
            style={{
              height: '24px',
              width: '24px'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
