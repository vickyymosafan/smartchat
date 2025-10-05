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
        block: 'end'
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
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${
          isSystem ? 'justify-center' : ''
        }`}
      >
        <div
          className={`
            max-w-[85%] rounded-lg px-4 py-3 shadow-sm
            ${isUser 
              ? 'bg-blue-500 text-white' 
              : isSystem 
                ? 'bg-slate-100 text-slate-600 text-sm italic'
                : 'bg-white border border-slate-200 text-slate-900'
            }
            sm:max-w-[75%] md:max-w-[65%]
          `}
        >
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-base">
            {message.content}
          </div>

          {/* Message Footer dengan Timestamp dan Status */}
          <div
            className={`
              mt-2 flex items-center justify-between text-xs
              ${isUser ? 'text-blue-100' : isSystem ? 'text-slate-500' : 'text-slate-500'}
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
                    <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-blue-200 border-t-transparent" />
                    <span>Mengirim...</span>
                  </div>
                )}
                {message.status === 'sent' && (
                  <div className="flex items-center">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {message.status === 'error' && (
                  <div className="flex items-center text-red-200">
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Gagal</span>
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
    <div key={key} className="flex items-center justify-center py-4">
      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {formatTimestamp(date, false)}
      </div>
    </div>
  );

  /**
   * Group messages by date untuk menampilkan date separator
   */
  const groupMessagesByDate = () => {
    const grouped: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString();
      const existingGroup = grouped.find(group => group.date === dateKey);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        grouped.push({
          date: dateKey,
          messages: [message]
        });
      }
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6"
    >
      <div className="mx-auto max-w-4xl">
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                <svg 
                  className="h-8 w-8 text-slate-400" 
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
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Mulai Percakapan
              </h3>
              <p className="text-slate-600 max-w-sm">
                Kirim pesan pertama Anda untuk memulai percakapan dengan asisten AI.
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
            <div className="space-y-4">
              {group.messages.map((message, messageIndex) => 
                renderMessage(message, messages.indexOf(message))
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-white border border-slate-200 px-4 py-3 shadow-sm sm:max-w-[75%] md:max-w-[65%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                </div>
                <span className="text-sm text-slate-500">Asisten sedang mengetik...</span>
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