'use client';

import { useEffect, useState } from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TopBarProps } from '@/types/chat';
import { ThemeToggle } from './ThemeToggle';
import { preloadSidePanel } from '@/lib/lazyComponents';

/**
 * StatusChip Component
 * Displays online/offline status indicator with animated dot
 */
interface StatusChipProps {
  isOnline: boolean;
}

function StatusChip({ isOnline }: StatusChipProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300',
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
            'absolute inline-flex h-full w-full rounded-full opacity-75 transition-colors duration-300',
            isOnline ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full transition-colors duration-300',
            isOnline ? 'bg-green-600' : 'bg-red-600'
          )}
        />
      </span>
      <span className="hidden sm:inline">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

/**
 * BrandLogo Component
 * Displays SMARTCHAT branding
 */
function BrandLogo() {
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
      <span className="text-lg font-semibold tracking-tight">SMARTCHAT</span>
    </div>
  );
}

/**
 * TopBar Component
 * Header component with branding, status, and action buttons
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - Brand logo and optional chat title
 * - Online/offline status indicator
 * - Settings button
 * - Theme toggle integration (placeholder for now)
 * - Responsive padding and layout
 * - 64px height for adequate touch targets
 */
export function TopBar({
  title,
  onSettingsClick,
  showSidebarToggle = false,
  onSidebarToggle,
}: TopBarProps) {
  // Detect online/offline status
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial status
    setIsOnline(navigator.onLine);

    // Listen to online/offline events
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
        {/* Left section: Sidebar toggle (mobile) + Brand + Title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              onMouseEnter={preloadSidePanel}
              onFocus={preloadSidePanel}
              className="shrink-0 lg:hidden"
              aria-label="Toggle sidebar"
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

        {/* Right section: Status + Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <StatusChip isOnline={isOnline} />

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="shrink-0"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* ThemeToggle untuk switch light/dark/system theme */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
