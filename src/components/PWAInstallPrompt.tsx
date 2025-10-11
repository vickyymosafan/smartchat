'use client';

import { useState, useEffect } from 'react';
import { isPWA, isPWASupported } from '@/lib/serviceWorker';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function PWAInstallPrompt({
  onInstall,
  onDismiss,
  className = '',
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Cek apakah sudah berjalan sebagai PWA
    setIsStandalone(isPWA());

    // Deteksi iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Cek apakah user sudah pernah dismiss prompt
    const wasDismissed =
      localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(wasDismissed);

    // Listen untuk beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show prompt jika belum pernah di-dismiss dan belum standalone
      if (!wasDismissed && !isPWA()) {
        setShowPrompt(true);
      }
    };

    // Listen untuk appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA berhasil diinstall');
      setShowPrompt(false);
      setDeferredPrompt(null);

      // Tampilkan toast success
      toast.success(
        'Sekarang Anda dapat mengakses aplikasi dari home screen.',
        { duration: 6000 }
      );

      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Untuk iOS, show prompt setelah delay jika belum standalone
    if (iOS && !isPWA() && !wasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show setelah 3 detik

      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      // Android/Chrome install
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('User menerima install prompt');
          toast.info(
            'Aplikasi sedang diinstall ke perangkat Anda.',
            { duration: 4000 }
          );
          onInstall?.();
        } else {
          console.log('User menolak install prompt');
          handleDismiss();
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error saat install PWA:', error);
        toast.error(
          'Terjadi kesalahan saat menginstall aplikasi. Silakan coba lagi.',
          { duration: 5000 }
        );
      }
    } else if (isIOS) {
      // iOS - show instructions
      // Tidak ada action khusus, instruksi sudah ditampilkan
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // Jangan tampilkan jika sudah standalone, tidak didukung, atau sudah di-dismiss
  if (isStandalone || !isPWASupported() || dismissed || !showPrompt) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 max-w-sm mx-auto ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📱</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Install Aplikasi Chat
          </h3>

          {isIOS ? (
            <div className="text-xs text-gray-600 space-y-2">
              <p>Untuk install di iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  Tap tombol Share <span className="inline-block">📤</span>
                </li>
                <li>Pilih &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; untuk konfirmasi</li>
              </ol>
            </div>
          ) : (
            <p className="text-xs text-gray-600 mb-3">
              Install aplikasi untuk akses cepat dan pengalaman yang lebih baik
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mt-3">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
        >
          {isIOS ? 'Mengerti' : 'Nanti Saja'}
        </button>
      </div>
    </div>
  );
}

// Hook untuk menggunakan PWA install status
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWA());
    setCanInstall(isPWASupported() && !isPWA());

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { canInstall, isInstalled };
}

// Komponen untuk tombol install manual
interface PWAInstallButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function PWAInstallButton({
  children,
  className = '',
  variant = 'primary',
}: PWAInstallButtonProps) {
  const { canInstall, isInstalled } = usePWAInstall();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA install diterima');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error install PWA:', error);
    }
  };

  if (isInstalled || !canInstall) {
    return null;
  }

  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children || (
        <>
          <span className="mr-2">📱</span>
          Install App
        </>
      )}
    </button>
  );
}
