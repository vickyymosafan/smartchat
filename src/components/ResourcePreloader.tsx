/**
 * Komponen untuk preloading resources penting
 * Membantu meningkatkan perceived performance dengan memuat resources sebelum dibutuhkan
 */

'use client';

import { useEffect } from 'react';
import { preloadComponent } from '@/lib/lazyComponents';

interface ResourcePreloaderProps {
  /**
   * Preload components saat aplikasi idle
   */
  preloadComponents?: boolean;
  /**
   * Preload critical CSS dan fonts
   */
  preloadAssets?: boolean;
}

export default function ResourcePreloader({
  preloadComponents = true,
  preloadAssets = true,
}: ResourcePreloaderProps) {
  useEffect(() => {
    if (!preloadComponents) return;

    // Preload components yang kemungkinan akan digunakan
    const preloadTasks = [
      // PWA components
      () => import('@/components/PWAInstallPrompt'),
      () => import('@/components/PWAProvider'),

      // Toast components
      () => import('@/components/ToastContainer'),
      () => import('@/components/Toast'),

      // Chat service untuk API calls
      () => import('@/lib/chatService'),
    ];

    // Jalankan preload saat browser idle
    preloadTasks.forEach(task => preloadComponent(task));
  }, [preloadComponents]);

  useEffect(() => {
    if (!preloadAssets) return;

    // Preload critical fonts dan assets
    const preloadCriticalAssets = () => {
      // Preload manifest dan service worker
      if ('serviceWorker' in navigator) {
        // Preload service worker script
        fetch('/sw.js', { cache: 'force-cache' }).catch(() => {
          // Ignore errors
        });
      }

      // Preload manifest
      fetch('/manifest.json', { cache: 'force-cache' }).catch(() => {
        // Ignore errors
      });

      // Preload critical icons
      const criticalIcons = [
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/favicon.ico',
      ];

      criticalIcons.forEach(iconUrl => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = iconUrl;
        document.head.appendChild(link);
      });
    };

    // Jalankan preload saat browser idle atau setelah delay
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadCriticalAssets);
    } else {
      setTimeout(preloadCriticalAssets, 2000);
    }
  }, [preloadAssets]);

  // Komponen ini tidak render apapun
  return null;
}

/**
 * Hook untuk monitoring performance metrics
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals jika tersedia
    if ('web-vital' in window || 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const observeLCP = () => {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            console.log('LCP:', lastEntry.startTime);

            // Log ke analytics jika diperlukan
            if (lastEntry.startTime > 2500) {
              console.warn('LCP lebih dari 2.5s:', lastEntry.startTime);
            }
          });

          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP monitoring tidak didukung:', error);
        }
      };

      // First Input Delay (FID)
      const observeFID = () => {
        try {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              const fidValue = entry.processingStart - entry.startTime;
              console.log('FID:', fidValue);

              if (fidValue > 100) {
                console.warn('FID lebih dari 100ms:', fidValue);
              }
            });
          });

          observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID monitoring tidak didukung:', error);
        }
      };

      // Cumulative Layout Shift (CLS)
      const observeCLS = () => {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });

            console.log('CLS:', clsValue);

            if (clsValue > 0.1) {
              console.warn('CLS lebih dari 0.1:', clsValue);
            }
          });

          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS monitoring tidak didukung:', error);
        }
      };

      // Jalankan monitoring hanya di production
      if (process.env.NODE_ENV === 'production') {
        observeLCP();
        observeFID();
        observeCLS();
      }
    }
  }, []);
}

/**
 * Komponen untuk monitoring dan optimasi performance
 */
export function PerformanceMonitor() {
  usePerformanceMonitoring();

  return null;
}
