// Service Worker registration dan management utilities

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

// Registrasi service worker
export async function registerServiceWorker(
  config?: ServiceWorkerConfig
): Promise<ServiceWorkerRegistration | null> {
  // Cek apakah browser mendukung service worker
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker tidak didukung di browser ini');
    return null;
  }

  // Hanya registrasi di production atau saat PWA diaktifkan
  if (
    process.env.NODE_ENV !== 'production' &&
    !process.env.NEXT_PUBLIC_ENABLE_PWA
  ) {
    console.log('Service Worker dinonaktifkan di development mode');
    return null;
  }

  try {
    console.log('Mendaftarkan Service Worker...');

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker berhasil didaftarkan:', registration.scope);

    // Handle update tersedia
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Update tersedia
            console.log('Update Service Worker tersedia');
            config?.onUpdate?.(registration);
          } else {
            // Service Worker berhasil diinstall untuk pertama kali
            console.log('Service Worker berhasil diinstall');
            config?.onSuccess?.(registration);
          }
        }
      });
    });

    // Listen untuk pesan dari service worker
    navigator.serviceWorker.addEventListener(
      'message',
      handleServiceWorkerMessage
    );

    return registration;
  } catch (error) {
    console.error('Gagal mendaftarkan Service Worker:', error);
    config?.onError?.(error as Error);
    return null;
  }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('Service Worker berhasil di-unregister:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Gagal unregister Service Worker:', error);
    return false;
  }
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service Worker update dimulai');
    }
  } catch (error) {
    console.error('Gagal update Service Worker:', error);
  }
}

// Skip waiting dan activate service worker baru
export function skipWaitingAndActivate(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready.then(registration => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Reload halaman setelah service worker baru aktif
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Handle pesan dari service worker
function handleServiceWorkerMessage(event: MessageEvent): void {
  const { data } = event;

  switch (data.type) {
    case 'SYNC_COMPLETE':
      console.log('Background sync selesai:', data.data);
      // Dispatch custom event untuk komponen React
      window.dispatchEvent(
        new CustomEvent('sw-sync-complete', {
          detail: data.data,
        })
      );
      break;

    case 'CACHE_UPDATED':
      console.log('Cache diperbarui:', data.data);
      window.dispatchEvent(
        new CustomEvent('sw-cache-updated', {
          detail: data.data,
        })
      );
      break;

    default:
      console.log('Pesan dari Service Worker:', data);
  }
}

// Cek status online/offline
export function getNetworkStatus(): boolean {
  return navigator.onLine;
}

// Listen perubahan status network
export function addNetworkStatusListener(
  callback: (isOnline: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Request background sync untuk pesan offline
export async function requestBackgroundSync(
  tag: string = 'background-sync-messages'
): Promise<void> {
  if (
    !('serviceWorker' in navigator) ||
    !('sync' in window.ServiceWorkerRegistration.prototype)
  ) {
    console.warn('Background Sync tidak didukung');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // Type assertion untuk sync API yang belum fully supported di TypeScript
    const syncManager = (registration as any).sync;
    if (syncManager) {
      await syncManager.register(tag);
      console.log('Background sync didaftarkan:', tag);
    }
  } catch (error) {
    console.error('Gagal mendaftarkan background sync:', error);
  }
}

// Cek apakah app berjalan sebagai PWA
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Cek apakah device mendukung PWA
export function isPWASupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get service worker registration
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error('Gagal mendapatkan Service Worker registration:', error);
    return null;
  }
}

// Utility untuk menyimpan pesan offline
export function saveOfflineMessage(message: any): void {
  try {
    const offlineMessages = JSON.parse(
      localStorage.getItem('offline-messages') || '[]'
    );
    offlineMessages.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      offline: true,
    });
    localStorage.setItem('offline-messages', JSON.stringify(offlineMessages));

    // Request background sync
    requestBackgroundSync();
  } catch (error) {
    console.error('Gagal menyimpan pesan offline:', error);
  }
}

// Utility untuk mengambil pesan offline
export function getOfflineMessages(): any[] {
  try {
    return JSON.parse(localStorage.getItem('offline-messages') || '[]');
  } catch (error) {
    console.error('Gagal mengambil pesan offline:', error);
    return [];
  }
}

// Utility untuk menghapus pesan offline
export function removeOfflineMessage(messageId: string): void {
  try {
    const offlineMessages = getOfflineMessages();
    const filteredMessages = offlineMessages.filter(
      msg => msg.id !== messageId
    );
    localStorage.setItem('offline-messages', JSON.stringify(filteredMessages));
  } catch (error) {
    console.error('Gagal menghapus pesan offline:', error);
  }
}

// Clear semua pesan offline
export function clearOfflineMessages(): void {
  try {
    localStorage.removeItem('offline-messages');
  } catch (error) {
    console.error('Gagal menghapus semua pesan offline:', error);
  }
}
