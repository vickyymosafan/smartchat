'use client';

/**
 * EXAMPLE: TopBar with i18n integration
 *
 * This is an example showing how to integrate translations into the TopBar component.
 * To use this in production:
 * 1. Replace the content of TopBar.tsx with this file
 * 2. Import useTranslation hook
 * 3. Replace hardcoded strings with t() calls
 */

import { useEffect, useState } from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TopBarProps } from '@/types/chat';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * StatusChip Component with i18n
 */
interface StatusChipProps {
  isOnline: boolean;
}

function StatusChip({ isOnline }: StatusChipProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        isOnline
          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
          : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
      )}
    >
      <span
        className={cn('relative flex h-2 w-2', isOnline && 'animate-pulse')}
      >
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            isOnline ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            isOnline ? 'bg-green-600' : 'bg-red-600'
          )}
        />
      </span>
      <span className="hidden sm:inline">
        {/* BEFORE: {isOnline ? 'Online' : 'Offline'} */}
        {/* AFTER: Use translation keys */}
        {isOnline ? t('topBar.status.online') : t('topBar.status.offline')}
      </span>
    </div>
  );
}

/**
 * BrandLogo Component with i18n
 */
function BrandLogo() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      {/* BEFORE: <span className="text-lg font-semibold tracking-tight">SMARTCHAT</span> */}
      {/* AFTER: Use translation key */}
      <span className="text-lg font-semibold tracking-tight">
        {t('topBar.title')}
      </span>
    </div>
  );
}

/**
 * TopBar Component with i18n integration
 */
export function TopBarI18n({
  title,
  onSettingsClick,
  showSidebarToggle = false,
  onSidebarToggle,
}: TopBarProps) {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="shrink-0 lg:hidden"
              aria-label={t('topBar.toggleSidebar')} // TRANSLATED
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <BrandLogo />

          {title && (
            <>
              <div
                className="hidden h-6 w-px bg-border sm:block"
                aria-hidden="true"
              />
              <h1 className="hidden truncate text-sm font-medium text-muted-foreground sm:block">
                {title}
              </h1>
            </>
          )}
        </div>

        {/* Right section with Language Switcher */}
        <div className="flex shrink-0 items-center gap-2">
          <StatusChip isOnline={isOnline} />

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            aria-label={t('topBar.settings')} // TRANSLATED
            className="shrink-0"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Add Language Switcher */}
          <LanguageSwitcher />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
