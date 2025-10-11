'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Interface untuk konfigurasi keyboard shortcut
 */
export interface ShortcutConfig {
  /** Key yang harus ditekan (e.g., 'k', 'n', '/') */
  key: string;
  /** Apakah Ctrl (Windows/Linux) atau Cmd (Mac) harus ditekan */
  ctrl?: boolean;
  /** Apakah Shift harus ditekan */
  shift?: boolean;
  /** Apakah Alt harus ditekan */
  alt?: boolean;
  /** Handler function yang akan dipanggil saat shortcut match */
  handler: (event: KeyboardEvent) => void;
  /** Deskripsi shortcut untuk dokumentasi */
  description: string;
  /** Apakah shortcut harus disabled (optional) */
  disabled?: boolean;
}

/**
 * Utility function untuk check apakah user menggunakan Mac
 */
const isMac = () => {
  if (typeof window === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
};

/**
 * Utility function untuk format shortcut key untuk display
 * Contoh: { key: 'k', ctrl: true } => 'Ctrl+K' atau 'Cmd+K' (Mac)
 */
export const formatShortcut = (config: ShortcutConfig): string => {
  const parts: string[] = [];

  if (config.ctrl) {
    parts.push(isMac() ? 'Cmd' : 'Ctrl');
  }

  if (config.shift) {
    parts.push('Shift');
  }

  if (config.alt) {
    parts.push('Alt');
  }

  parts.push(config.key.toUpperCase());

  return parts.join('+');
};

/**
 * Hook untuk mengelola global keyboard shortcuts
 *
 * Hook ini menyediakan:
 * - Event listener untuk keydown events
 * - Matching key combinations dengan shortcuts config
 * - Prevent default behavior untuk matched shortcuts
 * - Support untuk Ctrl/Cmd, Shift, Alt modifiers
 * - Automatic cleanup on unmount
 *
 * @param shortcuts - Array of ShortcutConfig objects
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     ctrl: true,
 *     handler: () => openCommandPalette(),
 *     description: 'Open command palette',
 *   },
 *   {
 *     key: '/',
 *     handler: () => focusComposer(),
 *     description: 'Focus message input',
 *   },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  enabled: boolean = true
) {
  // Store shortcuts in ref to avoid recreating event listener on every render
  const shortcutsRef = useRef<ShortcutConfig[]>(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  /**
   * Check if a keyboard event matches a shortcut config
   */
  const matchesShortcut = useCallback(
    (event: KeyboardEvent, config: ShortcutConfig): boolean => {
      // Check if shortcut is disabled
      if (config.disabled) {
        return false;
      }

      // Check key match (case-insensitive)
      if (event.key.toLowerCase() !== config.key.toLowerCase()) {
        return false;
      }

      // Check Ctrl/Cmd modifier
      // On Mac, use metaKey (Cmd), on Windows/Linux use ctrlKey
      const ctrlPressed = isMac() ? event.metaKey : event.ctrlKey;
      if (config.ctrl && !ctrlPressed) {
        return false;
      }
      if (!config.ctrl && ctrlPressed) {
        return false;
      }

      // Check Shift modifier
      if (config.shift && !event.shiftKey) {
        return false;
      }
      if (!config.shift && event.shiftKey) {
        return false;
      }

      // Check Alt modifier
      if (config.alt && !event.altKey) {
        return false;
      }
      if (!config.alt && event.altKey) {
        return false;
      }

      return true;
    },
    []
  );

  /**
   * Handle keydown event
   * Check if event matches any shortcut and call handler
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if shortcuts are disabled
      if (!enabled) {
        return;
      }

      // Skip if user is typing in an input/textarea (unless it's a special shortcut like '/')
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Find matching shortcut
      for (const config of shortcutsRef.current) {
        if (matchesShortcut(event, config)) {
          // For '/' shortcut, allow it even in input elements
          // For other shortcuts, skip if in input element
          if (isInputElement && config.key !== '/') {
            continue;
          }

          // Prevent default behavior
          event.preventDefault();

          // Call handler
          try {
            config.handler(event);
          } catch (error) {
            console.error('Error executing keyboard shortcut handler:', error);
          }

          // Stop processing other shortcuts
          break;
        }
      }
    },
    [enabled, matchesShortcut]
  );

  /**
   * Setup and cleanup event listener
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Hook untuk mendapatkan list of all available shortcuts
 * Berguna untuk menampilkan shortcuts documentation
 */
export function useShortcutsList(shortcuts: ShortcutConfig[]) {
  return shortcuts
    .filter(config => !config.disabled)
    .map(config => ({
      keys: formatShortcut(config),
      description: config.description,
    }));
}
