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
 * Lazy load ChatShell (NEW UI) untuk code splitting
 */
export const LazyChatShell = dynamic(
  () =>
    import('@/components/chat/ChatShell').then(mod => ({
      default: mod.ChatShell,
    })),
  {
    ssr: false, // Chat interface menggunakan browser APIs
  }
);

/**
 * Lazy load CommandPalette - Only loaded when opened
 */
export const LazyCommandPalette = dynamic(
  () =>
    import('@/components/chat/CommandPalette').then(mod => ({
      default: mod.CommandPalette,
    })),
  {
    ssr: false,
    loading: () => null, // No loading state needed for modal
  }
);

/**
 * Lazy load SidePanel - Only loaded when opened
 */
export const LazySidePanel = dynamic(
  () =>
    import('@/components/chat/SidePanel').then(mod => ({
      default: mod.SidePanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="hidden h-full w-80 border-r bg-background md:block" />
    ),
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

/**
 * Preload CommandPalette saat user hover di TopBar atau tekan Ctrl
 */
export function preloadCommandPalette() {
  preloadComponent(() => import('@/components/chat/CommandPalette'));
}

/**
 * Preload SidePanel saat user hover di sidebar toggle button
 */
export function preloadSidePanel() {
  preloadComponent(() => import('@/components/chat/SidePanel'));
}
