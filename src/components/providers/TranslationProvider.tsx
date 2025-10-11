'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale, Dictionary } from '@/lib/i18n/types';

interface TranslationContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const translation = useTranslation();

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to access translation context
 * Must be used within TranslationProvider
 */
export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      'useTranslationContext must be used within TranslationProvider'
    );
  }
  return context;
}
