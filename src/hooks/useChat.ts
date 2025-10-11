'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';

/**
 * Interface untuk return value dari useChat hook
 */
export interface UseChatReturn {
  /** Daftar pesan dalam chat */
  messages: Message[];
  /** Status loading saat mengirim atau menerima pesan */
  isLoading: boolean;
  /** Pesan error jika terjadi kesalahan */
  error: string | null;
  /** Function untuk mengirim pesan baru */
  send: (content: string) => Promise<void>;
  /** Function untuk regenerate pesan terakhir */
  regenerate: () => Promise<void>;
  /** Function untuk membatalkan request yang sedang berjalan */
  stop: () => void;
  /** Function untuk menambahkan pesan secara manual */
  append: (message: Message) => void;
  /** Function untuk retry pesan yang gagal */
  retry: (messageId: string) => Promise<void>;
}

/**
 * Hook untuk mengelola state dan logic chat
 * Menyediakan fungsi untuk send, regenerate, stop, dan append messages
 *
 * @param initialMessages - Pesan awal (opsional)
 * @param sessionId - ID sesi chat (opsional)
 * @returns UseChatReturn object dengan messages, loading state, dan functions
 */
export function useChat(
  initialMessages: Message[] = [],
  sessionId?: string
): UseChatReturn {
  // State management
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk AbortController untuk cancel requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref untuk tracking retry attempts per message
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());

  /**
   * Generate unique message ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  /**
   * Sleep utility untuk exponential backoff
   */
  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * Calculate retry delay dengan exponential backoff
   * 1s → 2s → 4s
   */
  const getRetryDelay = (attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt), 4000);
  };

  /**
   * Send message ke API dan handle response dengan retry logic
   */
  const sendWithRetry = useCallback(
    async (
      content: string,
      messageId: string,
      retryAttempt: number = 0
    ): Promise<void> => {
      // Create AbortController untuk cancel request
      abortControllerRef.current = new AbortController();

      try {
        // Call API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            metadata: {
              userAgent: navigator.userAgent,
              platform:
                typeof window !== 'undefined'
                  ? (window.navigator as any).userAgentData?.platform || 'web'
                  : 'web',
            },
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          // Handle specific HTTP errors
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

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Gagal mengirim pesan');
        }

        // Create assistant message
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: data.data?.response || 'Tidak ada response',
          createdAt: Date.now(),
        };

        // Add assistant message to state
        setMessages(prev => [...prev, assistantMessage]);

        // Clear retry attempts for this message
        retryAttemptsRef.current.delete(messageId);

        // Clear error state
        setError(null);

        // Remove error flag from user message
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, meta: { ...msg.meta, error: false } }
              : msg
          )
        );
      } catch (err: any) {
        // Handle abort
        if (err.name === 'AbortError') {
          console.log('Request dibatalkan');
          return;
        }

        // Determine if we should retry
        const maxRetries = 3;
        const shouldRetry = retryAttempt < maxRetries;

        // Handle network errors
        let errorMessage =
          err.message || 'Terjadi kesalahan saat mengirim pesan';

        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage =
            'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        setError(errorMessage);

        // Mark user message as error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, meta: { ...msg.meta, error: true } }
              : msg
          )
        );

        // Show toast notification
        if (shouldRetry) {
          const delay = getRetryDelay(retryAttempt);
          toast.error(
            `${errorMessage} Mencoba lagi dalam ${delay / 1000} detik...`,
            {
              duration: delay,
            }
          );

          // Wait for exponential backoff delay
          await sleep(delay);

          // Retry
          retryAttemptsRef.current.set(messageId, retryAttempt + 1);
          return sendWithRetry(content, messageId, retryAttempt + 1);
        } else {
          // Max retries reached
          toast.error(`${errorMessage} Klik tombol retry untuk mencoba lagi.`, {
            duration: 5000,
          });
        }

        throw err;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [sessionId]
  );

  /**
   * Send message ke API dan handle response
   */
  const send = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) {
        setError('Pesan tidak boleh kosong');
        toast.error('Pesan tidak boleh kosong');
        return;
      }

      // Clear previous error
      setError(null);
      setIsLoading(true);

      // Create user message
      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content: content.trim(),
        createdAt: Date.now(),
      };

      // Add user message to state
      setMessages(prev => [...prev, userMessage]);

      try {
        await sendWithRetry(content.trim(), userMessage.id, 0);
      } catch (err) {
        // Error already handled in sendWithRetry
      } finally {
        setIsLoading(false);
      }
    },
    [sendWithRetry]
  );

  /**
   * Regenerate pesan terakhir dari assistant
   * Mengirim ulang pesan user terakhir untuk mendapatkan response baru
   */
  const regenerate = useCallback(async (): Promise<void> => {
    // Find last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (!lastUserMessage) {
      setError('Tidak ada pesan untuk di-regenerate');
      return;
    }

    // Remove last assistant message if exists
    setMessages(prev => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Resend last user message
    await send(lastUserMessage.content);
  }, [messages, send]);

  /**
   * Stop/cancel ongoing request
   */
  const stop = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  /**
   * Append message manually ke chat
   * Berguna untuk menambahkan system messages atau pre-populated messages
   */
  const append = useCallback((message: Message): void => {
    setMessages(prev => [...prev, message]);
  }, []);

  /**
   * Retry failed message
   * Mencoba mengirim ulang pesan yang gagal
   */
  const retry = useCallback(
    async (messageId: string): Promise<void> => {
      // Find the failed message
      const failedMessage = messages.find(msg => msg.id === messageId);

      if (!failedMessage || failedMessage.role !== 'user') {
        toast.error('Pesan tidak ditemukan');
        return;
      }

      // Clear retry attempts for fresh start
      retryAttemptsRef.current.delete(messageId);

      // Clear error state
      setError(null);
      setIsLoading(true);

      // Remove error flag from message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, meta: { ...msg.meta, error: false } }
            : msg
        )
      );

      try {
        await sendWithRetry(failedMessage.content, messageId, 0);
      } catch (err) {
        // Error already handled in sendWithRetry
      } finally {
        setIsLoading(false);
      }
    },
    [messages, sendWithRetry]
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
