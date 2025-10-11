'use client';

import { Suspense, lazy } from 'react';
import type { ChatInterfaceProps } from '@/types/chat';

/**
 * Lazy load both old and new UI components
 * Hanya load component yang dibutuhkan berdasarkan feature flag
 */
const OldChatInterface = lazy(() => import('./ChatInterface'));
const NewChatShell = lazy(() =>
  import('./chat/ChatShell').then(mod => ({ default: mod.ChatShell }))
);

/**
 * Loading fallback component
 * Menampilkan skeleton loader saat component sedang dimuat
 */
function ChatLoadingFallback() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-muted/50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-accent" />
          <p className="text-sm text-muted-foreground">
            Memuat aplikasi chat...
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatInterfaceWrapper - Wrapper component untuk conditional rendering
 *
 * Component ini bertanggung jawab untuk:
 * - Membaca feature flag dari environment variable
 * - Conditional rendering antara UI lama dan UI baru
 * - Lazy loading untuk optimasi bundle size
 * - Menyediakan loading state yang konsisten
 *
 * Feature Flag:
 * - NEXT_PUBLIC_ENABLE_NEW_UI=true → Render ChatShell (UI baru)
 * - NEXT_PUBLIC_ENABLE_NEW_UI=false → Render ChatInterface (UI lama)
 * - Default: false (UI lama) untuk gradual rollout
 *
 * @param initialMessages - Pesan awal untuk chat (opsional)
 */
export default function ChatInterfaceWrapper({
  initialMessages = [],
}: ChatInterfaceProps) {
  // Read feature flag dari environment variable
  // Default ke 'false' jika tidak ada untuk backward compatibility
  const enableNewUI = process.env.NEXT_PUBLIC_ENABLE_NEW_UI === 'true';

  // Log untuk debugging (hanya di development)
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[ChatInterfaceWrapper] Feature flag ENABLE_NEW_UI:',
      enableNewUI
    );
    console.log(
      '[ChatInterfaceWrapper] Rendering:',
      enableNewUI ? 'New UI (ChatShell)' : 'Old UI (ChatInterface)'
    );
  }

  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      {enableNewUI ? (
        // Render UI baru (ChatShell) dengan redesign
        <NewChatShell initialMessages={initialMessages} />
      ) : (
        // Render UI lama (ChatInterface) untuk backward compatibility
        <OldChatInterface initialMessages={initialMessages} />
      )}
    </Suspense>
  );
}

/**
 * Export utility function untuk check feature flag
 * Berguna untuk conditional logic di komponen lain
 */
export function isNewUIEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_NEW_UI === 'true';
}

/**
 * Export utility function untuk get UI version string
 * Berguna untuk logging dan analytics
 */
export function getUIVersion(): 'legacy' | 'redesign' {
  return process.env.NEXT_PUBLIC_ENABLE_NEW_UI === 'true'
    ? 'redesign'
    : 'legacy';
}
