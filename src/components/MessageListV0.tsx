'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageListProps, Message } from '@/types/chat';
import { formatTimeOnly } from '@/lib/utils';

/**
 * v0.app Style MessageList Component
 * Clean, minimal, focused on content
 */
export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    }
  }, [messages]);

  // Handle scroll detection
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  /**
   * Render individual message bubble - v0.app style
   */
  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    if (isSystem) return null; // Hide system messages in v0.app style

    return (
      <div
        key={message.id}
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
        role="article"
        aria-label={`${isUser ? 'Pesan Anda' : 'Pesan dari asisten'}`}
      >
        <div
          className="message-bubble"
          style={{
            maxWidth: '85%',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--space-lg)',
            backgroundColor: isUser ? 'var(--message-user-bg)' : 'var(--message-assistant-bg)',
            color: isUser ? 'var(--message-user-text)' : 'var(--message-assistant-text)',
            border: isUser ? 'none' : '1px solid var(--message-assistant-border)',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="chat-scroll flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-label="Daftar pesan chat"
      style={{ 
        scrollBehavior: 'smooth',
        padding: 'var(--space-2xl) 0'
      }}
    >
      <div className="mx-auto w-full" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        {/* Empty State - v0.app style */}
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center animate-fade-in" style={{
            padding: 'var(--space-3xl) var(--space-md)',
            minHeight: '60vh'
          }}>
            <div className="text-center" style={{
              maxWidth: '400px'
            }}>
              <div className="mx-auto flex items-center justify-center" style={{
                marginBottom: 'var(--space-xl)',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--text-tertiary)'
              }}>
                <svg
                  style={{
                    height: '24px',
                    width: '24px'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem',
                lineHeight: '1.6'
              }}>
                Hi! I'm v0, Vercel's AI assistant. I can help you build web applications, create React components, work with Next.js, and much more.
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                marginTop: 'var(--space-md)'
              }}>
                What would you like to build today?
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => renderMessage(message))}

        {/* Loading Indicator - v0.app style with "Thinking" text */}
        {isLoading && (
          <div 
            className="flex justify-start animate-slide-up"
            role="status"
            aria-live="polite"
            aria-label="Asisten sedang berpikir"
          >
            <div style={{
              padding: 'var(--space-md) var(--space-lg)',
              borderRadius: 'var(--space-lg)',
              backgroundColor: 'var(--message-assistant-bg)',
              border: '1px solid var(--message-assistant-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              <svg
                style={{
                  height: '16px',
                  width: '16px',
                  flexShrink: 0
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Thinking</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed z-10 flex items-center justify-center rounded-full shadow-lg animate-slide-up touch-manipulation"
          style={{
            bottom: '7rem',
            right: '50%',
            transform: 'translateX(50%)',
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--gray-900)',
            color: 'var(--gray-50)',
            transition: 'all 200ms cubic-bezier(0, 0, 0.2, 1)',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-800)';
            e.currentTarget.style.transform = 'translateX(50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gray-900)';
            e.currentTarget.style.transform = 'translateX(50%) scale(1)';
          }}
          aria-label="Scroll ke bawah"
        >
          <svg
            style={{
              height: '20px',
              width: '20px'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
