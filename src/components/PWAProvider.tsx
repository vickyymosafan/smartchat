'use client';

import { useEffect, useState } from 'react';
import {
  registerServiceWorker,
  addNetworkStatusListener,
  getNetworkStatus,
  type ServiceWorkerConfig,
} from '@/lib/serviceWorker';

interface PWAProviderProps {
  children: React.ReactNode;
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(getNetworkStatus());

    // Listen untuk perubahan status network
    const removeNetworkListener = addNetworkStatusListener(setIsOnline);

    // Konfigurasi service worker
    const swConfig: ServiceWorkerConfig = {
      onSuccess: registration => {
        console.log('PWA: Service Worker berhasil didaftarkan');
        setSwRegistration(registration);
      },
      onUpdate: registration => {
        console.log('PWA: Update tersedia');
        setSwRegistration(registration);
        setUpdateAvailable(true);
      },
      onError: error => {
        console.error('PWA: Error saat mendaftarkan Service Worker:', error);
      },
    };

    // Registrasi service worker
    registerServiceWorker(swConfig);

    // Listen untuk custom events dari service worker
    const handleSyncComplete = (event: CustomEvent) => {
      console.log('PWA: Background sync selesai:', event.detail);
      // Bisa dispatch action ke state management atau show notification
    };

    const handleCacheUpdated = (event: CustomEvent) => {
      console.log('PWA: Cache diperbarui:', event.detail);
    };

    window.addEventListener(
      'sw-sync-complete',
      handleSyncComplete as EventListener
    );
    window.addEventListener(
      'sw-cache-updated',
      handleCacheUpdated as EventListener
    );

    // Cleanup
    return () => {
      removeNetworkListener();
      window.removeEventListener(
        'sw-sync-complete',
        handleSyncComplete as EventListener
      );
      window.removeEventListener(
        'sw-cache-updated',
        handleCacheUpdated as EventListener
      );
    };
  }, []);

  // Provide PWA context ke children components
  useEffect(() => {
    // Set CSS custom properties untuk PWA status
    document.documentElement.style.setProperty(
      '--pwa-online',
      isOnline ? '1' : '0'
    );

    // Add class ke body untuk styling conditional
    if (isOnline) {
      document.body.classList.remove('pwa-offline');
      document.body.classList.add('pwa-online');
    } else {
      document.body.classList.remove('pwa-online');
      document.body.classList.add('pwa-offline');
    }
  }, [isOnline]);

  return (
    <>
      {children}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
          📡 Anda sedang offline. Pesan akan dikirim saat koneksi tersedia.
        </div>
      )}

      {/* Update available notification */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg p-4 shadow-lg z-50 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Update Tersedia</p>
              <p className="text-sm opacity-90">
                Versi baru aplikasi sudah siap
              </p>
            </div>
            <button
              onClick={() => {
                // Skip waiting dan reload
                if (swRegistration?.waiting) {
                  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }}
              className="ml-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
}
