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
  Sun,
  Moon,
  Monitor,
  Check,
  Smartphone,
  Zap,
  Wifi,
  Bell,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
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
 * - Theme selection (Light/Dark/System)
 * - Clear chat history
 * - About information
 */
export function SettingsSheet({
  open,
  onOpenChange,
  onClearHistory,
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
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

  /**
   * Theme options
   */
  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Tema terang',
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Tema gelap',
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Ikuti sistem',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Pengaturan</SheetTitle>
          <SheetDescription>
            Kelola preferensi dan pengaturan aplikasi Anda
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Install App Section */}
          {!isInstalled && (canInstall || isIOS) && (
            <section>
              <h3 className="text-sm font-semibold mb-3">Install Aplikasi</h3>
              
              {/* Install Card */}
              <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">
                      Install SmartChat
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Dapatkan pengalaman terbaik dengan menginstall aplikasi
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="h-3.5 w-3.5 text-blue-600" />
                    <span>Akses cepat dari home screen</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Wifi className="h-3.5 w-3.5 text-blue-600" />
                    <span>Bekerja offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Bell className="h-3.5 w-3.5 text-blue-600" />
                    <span>Notifikasi real-time</span>
                  </div>
                </div>

                {/* iOS Instructions */}
                {isIOS && (
                  <div className="bg-white/50 dark:bg-black/20 rounded-md p-3 space-y-2">
                    <p className="text-xs font-medium flex items-center gap-2">
                      <Smartphone className="h-3.5 w-3.5" />
                      Cara install di iOS:
                    </p>
                    <ol className="text-xs space-y-1 pl-5 list-decimal text-muted-foreground">
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install Sekarang
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Already Installed Message */}
          {isInstalled && (
            <section>
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">
                      Aplikasi Terinstall
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      SmartChat sudah terinstall di perangkat Anda
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Tema</h3>
            <div className="space-y-2">
              {themeOptions.map(option => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                      'hover:bg-accent/50',
                      isActive
                        ? 'border-primary bg-accent'
                        : 'border-border bg-background'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Tindakan</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleClearHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Riwayat Chat
              </Button>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Tentang</h3>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Info className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">SmartChat</h4>
                  <p className="text-xs text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Platform chat cerdas dengan AI untuk percakapan yang lebih
                produktif dan efisien. Dibangun dengan Next.js 15 dan Tailwind
                CSS.
              </p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  © 2025 SmartChat. All rights reserved.
                </p>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
