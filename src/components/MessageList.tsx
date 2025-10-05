'use client';

import { useEffect, useRef } from 'react';
import { MessageListProps, Message } from '@/types/chat';
import { formatTimestamp, formatTimeOnly } from '@/lib/utils';

/**
 * Komponen MessageList untuk menampilkan daftar pesan chat
 * Menyediakan tampilan pesan dengan auto-scroll, diferensiasi visual, dan timestamp
 */
export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll ke pesan terbaru saat ada pesan baru
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages]);

  /**
   * Render individual message bubble
   */
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isLastMessage = index === messages.length - 1;

    return (
      <div
        key={message.id}
        className={`flex w-full px-1 ${isUser ? 'justify-end' : 'justify-start'} ${
          isSystem ? 'justify-center' : ''
        }`}
      >
        <div
          className={`
            max-w-[90%] rounded-2xl px-3 py-2 shadow-sm transition-all duration-200
            ${
              isUser
                ? 'bg-primary text-white rounded-br-md'
                : isSystem
                  ? 'bg-surface text-text-muted text-xs italic sm:text-sm'
                  : 'bg-background border border-border text-text rounded-bl-md'
            }
            sm:max-w-[80%] sm:px-4 sm:py-3 md:max-w-[70%] lg:max-w-[60%]
          `}
        >
          {/* Message Content */}
          <div className="text-body-medium whitespace-pre-wrap break-words leading-relaxed sm:text-body-large">
            {message.content}
          </div>

          {/* Message Footer dengan Timestamp dan Status */}
          <div
            className={`
              text-label-small mt-1.5 flex items-center justify-between sm:mt-2
              ${isUser ? 'text-primary-light' : isSystem ? 'text-text-muted' : 'text-text-muted'}
            `}
          >
            <span className="font-medium">
              {formatTimeOnly(message.timestamp)}
            </span>

            {/* Status Indicator untuk pesan user */}
            {isUser && (
              <div className="ml-2 flex items-center">
                {message.status === 'sending' && (
                  <div className="flex items-center">
                    <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-primary-light border-t-transparent" />
                    <span className="hidden sm:inline">Mengirim...</span>
                  </div>
                )}
                {message.status === 'sent' && (
                  <div className="flex items-center">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                  <div className="flex items-center text-error/80">
                    <svg
                      className="mr-1 h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Gagal</span>
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
    <div key={key} className="flex items-center justify-center py-3 sm:py-4">
      <div className="text-label-medium rounded-full bg-surface px-2 py-1 font-medium text-text-muted sm:px-3">
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
      className="chat-scroll flex-1 overflow-y-auto bg-surface px-2 py-4 sm:px-4 sm:py-6"
    >
      <div className="mx-auto w-full">
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface sm:h-16 sm:w-16">
                <svg
                  className="h-6 w-6 text-text-muted sm:h-8 sm:w-8"
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
              <h3 className="text-headline-medium mb-2 text-text sm:text-headline-large">
                Mulai Percakapan
              </h3>
              <p className="text-body-medium max-w-xs text-text-muted sm:max-w-sm sm:text-body-large">
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
            <div className="space-y-3 sm:space-y-4">
              {group.messages.map((message, messageIndex) =>
                renderMessage(message, messages.indexOf(message))
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start px-1">
            <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-background px-3 py-2 shadow-sm sm:max-w-[80%] sm:px-4 sm:py-3 md:max-w-[70%] lg:max-w-[60%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-text-muted"></div>
                </div>
                <span className="text-body-medium text-text-muted">
                  Asisten sedang mengetik...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
