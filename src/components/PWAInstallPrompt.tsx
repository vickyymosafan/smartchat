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
  const [isVisible, setIsVisible] = useState(false);

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
        // Delay sedikit untuk animasi smooth
        setTimeout(() => {
          setShowPrompt(true);
          setTimeout(() => setIsVisible(true), 50);
        }, 1000);
      }
    };

    // Listen untuk appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA berhasil diinstall');
      setIsVisible(false);
      setTimeout(() => setShowPrompt(false), 300);
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

    // Untuk iOS atau browser yang tidak support beforeinstallprompt
    // Show prompt langsung jika belum standalone dan belum dismissed
    if (!isPWA() && !wasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setIsVisible(true), 50);
      }, 1000); // Show setelah 1 detik untuk UX yang lebih baik

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
        setIsVisible(false);
        setTimeout(() => setShowPrompt(false), 300);
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
    setIsVisible(false);
    setTimeout(() => {
      setShowPrompt(false);
      setDismissed(true);
    }, 300);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // Jangan tampilkan jika sudah standalone, tidak didukung, atau sudah di-dismiss
  if (isStandalone || !isPWASupported() || dismissed || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        onClick={handleDismiss}
      />

      {/* Modal popup */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header dengan logo SmartChat */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 mb-4 relative">
              <img
                src="/smartchat-logo.png"
                alt="SmartChat Logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Install SmartChat
            </h2>
            <p className="text-gray-600 text-sm">
              Dapatkan pengalaman terbaik dengan menginstall aplikasi ke perangkat Anda
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm">⚡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Akses Cepat</p>
                <p className="text-xs text-gray-600">Buka langsung dari home screen</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mode Offline</p>
                <p className="text-xs text-gray-600">Tetap bisa digunakan tanpa internet</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm">🔔</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Notifikasi</p>
                <p className="text-xs text-gray-600">Dapatkan update pesan secara real-time</p>
              </div>
            </div>
          </div>

          {/* iOS specific instructions */}
          {isIOS && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Cara install di iPhone/iPad:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span className="flex-1">
                    Tap tombol Share <span className="inline-block mx-1">📤</span> di bawah
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span className="flex-1">Scroll dan pilih &quot;Add to Home Screen&quot;</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span className="flex-1">Tap &quot;Add&quot; untuk konfirmasi</span>
                </li>
              </ol>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Install Sekarang
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isIOS ? 'Mengerti' : 'Mungkin Nanti'}
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>
      </div>
    </>
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
