'use client';

import { cn } from '@/lib/utils';

/**
 * LoadingSkeleton Component
 * Provides skeleton loading states for better perceived performance
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
    />
  );
}

/**
 * MessageSkeleton - Loading state for messages
 */
export function MessageSkeleton({
  variant = 'assistant',
}: {
  variant?: 'user' | 'assistant';
}) {
  if (variant === 'user') {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] space-y-2">
          <Skeleton className="h-16 w-full rounded-2xl rounded-br-md" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] space-y-2">
        <div className="space-y-2 rounded-2xl rounded-bl-md border bg-muted p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatListSkeleton - Loading state for chat history
 */
export function ChatListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * TopBarSkeleton - Loading state for top bar
 */
export function TopBarSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
    </header>
  );
}
