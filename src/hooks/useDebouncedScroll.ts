import { useRef, useCallback } from 'react';

/**
 * Hook untuk debounced scroll dengan requestAnimationFrame
 * Mengurangi frekuensi scroll events saat streaming untuk smooth performance
 *
 * @param callback - Function yang akan dipanggil setelah debounce
 * @param delay - Delay dalam milliseconds (recommended: 100-200ms)
 * @returns Object dengan debouncedScroll function dan cleanup function
 */
export function useDebouncedScroll(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const debouncedScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        callback();
      });
    }, delay);
  }, [callback, delay]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  return { debouncedScroll, cleanup };
}
