/**
 * Lazy loaded components untuk optimasi bundle size
 * Menggunakan Next.js dynamic imports dengan loading states
 */

'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy load PWA components yang memerlukan browser APIs
 */
export const LazyPWAInstallPrompt = dynamic(
  () => import('@/components/PWAInstallPrompt'),
  {
    ssr: false,
  }
);

export const LazyPWAProvider = dynamic(
  () => import('@/components/PWAProvider'),
  {
    ssr: false,
  }
);

/**
 * Lazy load Toast components untuk optimasi bundle
 */
export const LazyToastContainer = dynamic(
  () => import('@/components/ToastContainer')
);

/**
 * Lazy load Chat components untuk code splitting
 */
export const LazyChatInterface = dynamic(
  () => import('@/components/ChatInterface'),
  {
    ssr: false, // Chat interface menggunakan browser APIs
  }
);

/**
 * Preload component untuk meningkatkan perceived performance
 * Gunakan ini untuk preload components yang kemungkinan akan digunakan
 */
export function preloadComponent(importFn: () => Promise<any>) {
  // Preload hanya di browser dan saat idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    });
  }
}
