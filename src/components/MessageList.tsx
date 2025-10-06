'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageListProps, Message } from '@/types/chat';
import { formatTimestamp, formatTimeOnly } from '@/lib/utils';

/**
 * Komponen untuk format markdown di assistant messages
 */
function FormattedMessage({ content }: { content: string }) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let listKey = 0;

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag
            key={`list-${listKey++}`}
            style={{
              margin: '0.5rem 0',
              paddingLeft: '1.5rem',
              listStylePosition: 'outside'
            }}
          >
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: '0.25rem',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: parseInlineFormatting(item) }}
              />
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    const parseInlineFormatting = (line: string): string => {
      // Bold: **text** or __text__
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
      line = line.replace(/__(.+?)__/g, '<strong style="font-weight: 600;">$1</strong>');
      
      // Italic: *text* or _text_
      line = line.replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>');
      line = line.replace(/_(.+?)_/g, '<em style="font-style: italic;">$1</em>');
      
      // Code: `code`
      line = line.replace(/`(.+?)`/g, '<code style="background-color: rgba(0,0,0,0.06); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">$1</code>');
      
      return line;
    };

    lines.forEach((line, index) => {
      // Heading 1: # Text
      if (line.match(/^#\s+(.+)/)) {
        flushList();
        const text = line.replace(/^#\s+/, '');
        elements.push(
          <h1
            key={`h1-${index}`}
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginTop: index > 0 ? '1rem' : '0',
              marginBottom: '0.75rem',
              lineHeight: '1.3',
              color: '#1a1a1a'
            }}
          >
            {text}
          </h1>
        );
      }
      // Heading 2: ## Text
      else if (line.match(/^##\s+(.+)/)) {
        flushList();
        const text = line.replace(/^##\s+/, '');
        elements.push(
          <h2
            key={`h2-${index}`}
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginTop: index > 0 ? '0.875rem' : '0',
              marginBottom: '0.625rem',
              lineHeight: '1.35',
              color: '#1a1a1a'
            }}
          >
            {text}
          </h2>
        );
      }
      // Heading 3: ### Text
      else if (line.match(/^###\s+(.+)/)) {
        flushList();
        const text = line.replace(/^###\s+/, '');
        elements.push(
          <h3
            key={`h3-${index}`}
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginTop: index > 0 ? '0.75rem' : '0',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
              color: '#1a1a1a'
            }}
          >
            {text}
          </h3>
        );
      }
      // Heading 4: #### Text
      else if (line.match(/^####\s+(.+)/)) {
        flushList();
        const text = line.replace(/^####\s+/, '');
        elements.push(
          <h4
            key={`h4-${index}`}
            style={{
              fontSize: '1.0625rem',
              fontWeight: '600',
              marginTop: index > 0 ? '0.625rem' : '0',
              marginBottom: '0.5rem',
              lineHeight: '1.45',
              color: '#1a1a1a'
            }}
          >
            {text}
          </h4>
        );
      }
      // Heading 5: ##### Text
      else if (line.match(/^#####\s+(.+)/)) {
        flushList();
        const text = line.replace(/^#####\s+/, '');
        elements.push(
          <h5
            key={`h5-${index}`}
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: index > 0 ? '0.5rem' : '0',
              marginBottom: '0.375rem',
              lineHeight: '1.5',
              color: '#1a1a1a'
            }}
          >
            {text}
          </h5>
        );
      }
      // Bullet point: • Text or - Text or * Text
      else if (line.match(/^[•\-\*]\s+(.+)/)) {
        const text = line.replace(/^[•\-\*]\s+/, '');
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(text);
      }
      // Numbered list: 1. Text or 1) Text
      else if (line.match(/^\d+[\.\)]\s+(.+)/)) {
        const text = line.replace(/^\d+[\.\)]\s+/, '');
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(text);
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
        if (index > 0 && index < lines.length - 1) {
          elements.push(
            <div key={`space-${index}`} style={{ height: '0.5rem' }} />
          );
        }
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p
            key={`p-${index}`}
            style={{
              marginBottom: '0.5rem',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: parseInlineFormatting(line) }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="formatted-message" style={{
      fontSize: '0.9375rem',
      lineHeight: '1.6',
      color: '#1a1a1a',
      textAlign: 'justify',
      textJustify: 'inter-word'
    }}>
      <style>{`
        @media (min-width: 640px) {
          .formatted-message {
            font-size: 0.9375rem !important;
          }
        }
        @media (min-width: 1024px) {
          .formatted-message {
            font-size: 1rem !important;
          }
        }
        .formatted-message ul {
          list-style-type: disc;
        }
        .formatted-message ol {
          list-style-type: decimal;
        }
        .formatted-message p {
          text-align: justify;
          text-justify: inter-word;
        }
        .formatted-message h1,
        .formatted-message h2,
        .formatted-message h3,
        .formatted-message h4,
        .formatted-message h5 {
          text-align: left;
        }
        .formatted-message li {
          text-align: justify;
          text-justify: inter-word;
        }
      `}</style>
      {parseMarkdown(content)}
    </div>
  );
}

/**
 * Komponen MessageBubble terpisah untuk handle realtime timestamp dengan hooks
 */
function MessageBubble({ 
  message, 
  shouldAnimate, 
  staggerDelay 
}: { 
  message: Message; 
  shouldAnimate: boolean; 
  staggerDelay: number;
}) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  // Realtime timestamp dengan hooks
  const [currentTime, setCurrentTime] = useState(formatTimeOnly(message.timestamp));
  
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatTimeOnly(message.timestamp));
    };
    
    // Update setiap menit
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [message.timestamp]);

  if (isSystem) {
    return (
      <div
        className={`flex w-full justify-center ${shouldAnimate ? 'animate-slide-up' : ''}`}
        style={shouldAnimate ? { animationDelay: `${staggerDelay}ms` } : undefined}
        role="article"
      >
        <div className="text-center italic" style={{
          color: 'var(--gray-500)',
          fontSize: '0.8125rem',
          lineHeight: '1.4',
          padding: '0.25rem 0.75rem'
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${shouldAnimate ? 'animate-slide-up' : ''}`}
      style={shouldAnimate ? { animationDelay: `${staggerDelay}ms` } : undefined}
      role="article"
      aria-label={`${isUser ? 'Pesan Anda' : 'Pesan dari asisten'} pada ${currentTime}`}
    >
      <div
        className="message-bubble-container"
        style={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          gap: '0.25rem'
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .message-bubble-container {
              max-width: 75% !important;
            }
          }
          @media (min-width: 1024px) {
            .message-bubble-container {
              max-width: 70% !important;
            }
          }
        `}</style>

        {/* Bubble Chat */}
        <div
          className="message-bubble transition-all duration-200"
          style={{
            backgroundColor: isUser ? '#181C14' : '#F7F7F7',
            color: isUser ? '#ffffff' : '#1a1a1a',
            borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
            padding: '0.75rem 1rem',
            boxShadow: isUser ? '0 2px 4px rgba(24, 28, 20, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.06)',
            wordBreak: 'break-word',
            position: 'relative'
          }}
        >
          <style>{`
            @media (min-width: 640px) {
              .message-bubble {
                padding: 0.875rem 1.125rem !important;
                border-radius: ${isUser ? '1.5rem 1.5rem 0.375rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.375rem'} !important;
              }
            }
            @media (min-width: 1024px) {
              .message-bubble {
                padding: 1rem 1.25rem !important;
              }
            }
            .message-bubble:hover {
              box-shadow: ${isUser ? '0 4px 8px rgba(24, 28, 20, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
            }
          `}</style>

          {/* Message Content */}
          {isUser ? (
            <div className="whitespace-pre-wrap break-words message-content" style={{
              fontSize: '0.9375rem',
              lineHeight: '1.5'
            }}>
              <style>{`
                @media (min-width: 640px) {
                  .message-content {
                    font-size: 0.9375rem !important;
                    line-height: 1.55 !important;
                  }
                }
                @media (min-width: 1024px) {
                  .message-content {
                    font-size: 1rem !important;
                    line-height: 1.6 !important;
                  }
                }
              `}</style>
              {message.content}
            </div>
          ) : (
            <FormattedMessage content={message.content} />
          )}
        </div>

        {/* Realtime Timestamp & Status */}
        <div
          className="flex items-center gap-1 transition-opacity duration-200"
          style={{
            fontSize: '0.6875rem',
            color: 'var(--gray-500)',
            paddingLeft: isUser ? '0' : '0.5rem',
            paddingRight: isUser ? '0.5rem' : '0',
            marginTop: '0.125rem',
            opacity: 0.7
          }}
        >
          <span>{currentTime}</span>
          
          {/* Status Indicator untuk pesan user */}
          {isUser && message.status && (
            <>
              {message.status === 'sending' && (
                <div 
                  className="rounded-full animate-spin" 
                  style={{
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderColor: 'var(--gray-400)',
                    borderTopColor: 'transparent',
                    height: '10px',
                    width: '10px'
                  }}
                />
              )}
              {message.status === 'sent' && (
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    height: '12px',
                    width: '12px',
                    color: 'var(--gray-500)'
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {message.status === 'error' && (
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    height: '12px',
                    width: '12px',
                    color: 'var(--red-500)'
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
              gap: '0.5rem'
            }}>
              <style>{`
                @media (min-width: 640px) {
                  .message-group { gap: 0.625rem !important; }
                }
                @media (min-width: 1024px) {
                  .message-group { gap: 0.75rem !important; }
                }
              `}</style>
              {group.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  shouldAnimate={!animatedMessages.has(message.id)}
                  staggerDelay={messages.slice(-5).findIndex(m => m.id === message.id) >= 0 
                    ? messages.slice(-5).findIndex(m => m.id === message.id) * 50 
                    : 0}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Loading Indicator - Modern bubble style */}
        {isLoading && (
          <div 
            className="flex justify-start animate-slide-up"
            role="status"
            aria-live="polite"
            aria-label="Asisten sedang mengetik"
          >
            <div className="bg-[var(--gray-100)] shadow-sm" style={{
              maxWidth: '85%',
              padding: '0.75rem 1rem',
              borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <style>{`
                @media (min-width: 640px) {
                  .flex.justify-start > div {
                    padding: 0.875rem 1.125rem !important;
                    border-radius: 1.5rem 1.5rem 1.5rem 0.375rem !important;
                  }
                }
              `}</style>
              <div className="flex items-center" style={{
                gap: '0.375rem'
              }}>
                <div className="flex" aria-hidden="true" style={{
                  gap: '0.25rem'
                }}>
                  <div className="rounded-full bg-[var(--gray-500)] animate-bounce-dots [animation-delay:-0.32s]" style={{
                    height: '7px',
                    width: '7px'
                  }}></div>
                  <div className="rounded-full bg-[var(--gray-500)] animate-bounce-dots [animation-delay:-0.16s]" style={{
                    height: '7px',
                    width: '7px'
                  }}></div>
                  <div className="rounded-full bg-[var(--gray-500)] animate-bounce-dots" style={{
                    height: '7px',
                    width: '7px'
                  }}></div>
                </div>
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
