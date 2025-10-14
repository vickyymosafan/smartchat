'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook untuk detect online/offline status
 * Mendengarkan event online dan offline dari browser
 * 
 * @returns isOnline - Boolean indicating online status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current online status
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online for SSR
  });

  useEffect(() => {
    // Event handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
