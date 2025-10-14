'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Download,
  Trash2,
  Info,
  Check,
  Smartphone,
  Zap,
  Wifi,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearHistory?: () => void;
}

/**
 * SettingsSheet Component
 * 
 * Menampilkan settings aplikasi dengan fitur:
 * - Install PWA (Progressive Web App)
 * - Clear chat history
 * - About information
 */
export function SettingsSheet({
  open,
  onOpenChange,
  onClearHistory,
}: SettingsSheetProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  /**
   * Detect PWA install capability and status
   */
  useEffect(() => {
    // Check if already running as PWA
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isPWA);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast.success('Aplikasi berhasil diinstall!', {
        description: 'Sekarang Anda dapat mengakses SmartChat dari home screen.',
        duration: 5000,
      });
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

  /**
   * Handle PWA install
   */
  const handleInstall = async () => {
    if (!deferredPrompt && !isIOS) {
      toast.error('Install tidak tersedia', {
        description: 'Browser Anda tidak mendukung instalasi PWA.',
      });
      return;
    }

    if (deferredPrompt) {
      try {
        // Show install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('User accepted install');
          toast.info('Aplikasi sedang diinstall...', {
            duration: 3000,
          });
        } else {
          console.log('User dismissed install');
        }

        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.error('Error installing PWA:', error);
        toast.error('Gagal menginstall aplikasi', {
          description: 'Terjadi kesalahan. Silakan coba lagi.',
        });
      }
    }
  };

  /**
   * Handle clear history
   */
  const handleClearHistory = () => {
    if (
      window.confirm(
        'Hapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      onClearHistory?.();
      toast.success('Riwayat chat berhasil dihapus');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[90vw] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px] overflow-y-auto p-0"
      >
        <SheetHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4">
          <SheetTitle className="text-base sm:text-lg">Pengaturan</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            Kelola preferensi dan pengaturan aplikasi Anda
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Install App Section */}
          {!isInstalled && (canInstall || isIOS) && (
            <section>
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Install Aplikasi</h3>

              {/* Install Card */}
              <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                      Install SmartChat
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                      Dapatkan pengalaman terbaik dengan menginstall aplikasi
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Akses cepat dari home screen</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Bekerja offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Notifikasi real-time</span>
                  </div>
                </div>

                {/* iOS Instructions */}
                {isIOS && (
                  <div className="bg-white/50 dark:bg-white/5 rounded-md p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                    <p className="text-[11px] sm:text-xs font-medium flex items-center gap-2">
                      <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      Cara install di iOS:
                    </p>
                    <ol className="text-[11px] sm:text-xs space-y-0.5 sm:space-y-1 pl-4 sm:pl-5 list-decimal text-muted-foreground">
                      <li>Tap tombol Share di browser</li>
                      <li>Pilih &quot;Add to Home Screen&quot;</li>
                      <li>Tap &quot;Add&quot; untuk konfirmasi</li>
                    </ol>
                  </div>
                )}

                {/* Install Button */}
                {!isIOS && deferredPrompt && (
                  <Button
                    onClick={handleInstall}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs sm:text-sm h-8 sm:h-9"
                    size="sm"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Install Sekarang
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Already Installed Message */}
          {isInstalled && (
            <section>
              <div className="rounded-lg border bg-green-50 dark:bg-green-900/30 p-3 sm:p-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-green-900 dark:text-green-200 mb-0.5 sm:mb-1">
                      Aplikasi Terinstall
                    </h4>
                    <p className="text-[11px] sm:text-xs text-green-700 dark:text-green-300 leading-snug">
                      SmartChat sudah terinstall di perangkat Anda
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Actions Section */}
          <section>
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Tindakan</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10"
                onClick={handleClearHistory}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Hapus Riwayat Chat
              </Button>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Tentang</h3>
            <div className="rounded-lg border p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm">SmartChat</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap">
                {`/**
                * SmartChat v1.0.0
                * Intelligent chat platform powered by AI
                * Tech stack: Next.js 15, Tailwind CSS
                * Developer: Vicky Mosafan
                * UX Support: Riyan
                * (c) 2025 SmartChat. All rights reserved.
                */`}
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
