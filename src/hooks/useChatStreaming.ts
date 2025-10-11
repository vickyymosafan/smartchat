'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  send: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  stop: () => void;
  append: (message: Message) => void;
  retry: (messageId: string) => Promise<void>;
}

export function useChat(
  initialMessages: Message[] = [],
  sessionId?: string
): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  const sendWithStreaming = useCallback(
    async (content: string, messageId: string): Promise<void> => {
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 408 || response.status === 504) {
            throw new Error('Koneksi timeout. Silakan coba lagi.');
          } else if (response.status === 429) {
            throw new Error(
              'Terlalu banyak permintaan. Tunggu sebentar dan coba lagi.'
            );
          } else if (response.status >= 500) {
            throw new Error('Server sedang bermasalah. Silakan coba lagi.');
          } else {
            throw new Error(`Terjadi kesalahan (${response.status})`);
          }
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Stream tidak tersedia');
        }

        const assistantMessageId = generateMessageId();
        streamingMessageIdRef.current = assistantMessageId;

        setMessages(prev => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            createdAt: Date.now(),
          },
        ]);

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.done) {
                streamingMessageIdRef.current = null;
                break;
              }

              if (data.content) {
                accumulatedContent += data.content;

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }

        setError(null);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, meta: { ...msg.meta, error: false } }
              : msg
          )
        );
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request dibatalkan');
          return;
        }

        let errorMessage =
          err.message || 'Terjadi kesalahan saat mengirim pesan';

        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage =
            'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        setError(errorMessage);

        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, meta: { ...msg.meta, error: true } }
              : msg
          )
        );

        toast.error(errorMessage, { duration: 5000 });

        throw err;
      } finally {
        abortControllerRef.current = null;
        streamingMessageIdRef.current = null;
      }
    },
    [sessionId]
  );

  const send = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) {
        setError('Pesan tidak boleh kosong');
        toast.error('Pesan tidak boleh kosong');
        return;
      }

      setError(null);
      setIsLoading(true);

      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content: content.trim(),
        createdAt: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        await sendWithStreaming(content.trim(), userMessage.id);
      } catch (err) {
        // Error already handled
      } finally {
        setIsLoading(false);
      }
    },
    [sendWithStreaming]
  );

  const regenerate = useCallback(async (): Promise<void> => {
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (!lastUserMessage) {
      setError('Tidak ada pesan untuk di-regenerate');
      return;
    }

    setMessages(prev => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    await send(lastUserMessage.content);
  }, [messages, send]);

  const stop = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      if (streamingMessageIdRef.current) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: msg.content + ' [dihentikan]' }
              : msg
          )
        );
        streamingMessageIdRef.current = null;
      }
    }
  }, []);

  const append = useCallback((message: Message): void => {
    setMessages(prev => [...prev, message]);
  }, []);

  const retry = useCallback(
    async (messageId: string): Promise<void> => {
      const failedMessage = messages.find(msg => msg.id === messageId);

      if (!failedMessage || failedMessage.role !== 'user') {
        toast.error('Pesan tidak ditemukan');
        return;
      }

      setError(null);
      setIsLoading(true);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, meta: { ...msg.meta, error: false } }
            : msg
        )
      );

      try {
        await sendWithStreaming(failedMessage.content, messageId);
      } catch (err) {
        // Error already handled
      } finally {
        setIsLoading(false);
      }
    },
    [messages, sendWithStreaming]
  );

  return {
    messages,
    isLoading,
    error,
    send,
    regenerate,
    stop,
    append,
    retry,
  };
}
