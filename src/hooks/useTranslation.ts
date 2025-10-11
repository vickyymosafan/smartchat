'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Locale, Dictionary } from '@/lib/i18n/types';
import {
  getDictionary,
  isValidLocale,
  DEFAULT_LOCALE,
} from '@/lib/i18n/dictionaries';

const LOCALE_STORAGE_KEY = 'smartchat-locale';

/**
 * Detect user's preferred locale from localStorage or browser settings
 */
function detectLocale(): Locale {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (isValidLocale(browserLang)) {
      return browserLang;
    }
  }

  // Default to Bahasa Indonesia
  return DEFAULT_LOCALE;
}

/**
 * Interpolate variables in translation strings
 * Example: "Hello {name}" with { name: "World" } => "Hello World"
 */
function interpolate(
  text: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return text;

  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}

interface UseTranslationReturn {
  locale: Locale;
  dictionary: Dictionary | null;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

/**
 * Hook for accessing translations
 *
 * @example
 * const { t, locale, setLocale } = useTranslation();
 *
 * // Simple translation
 * t('common.send') // => "Kirim" (in Indonesian)
 *
 * // With interpolation
 * t('chat.composer.characterCount', { current: 100, max: 5000 }) // => "100/5000"
 */
export function useTranslation(): UseTranslationReturn {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dictionary when locale changes
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true);
      try {
        const dict = await getDictionary(locale);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        // Fallback to default locale if loading fails
        if (locale !== DEFAULT_LOCALE) {
          const fallbackDict = await getDictionary(DEFAULT_LOCALE);
          setDictionary(fallbackDict);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, [locale]);

  // Detect and set initial locale
  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
  }, []);

  // Translation function with nested key support
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      if (!dictionary) return key;

      // Navigate nested keys (e.g., "chat.composer.placeholder")
      const keys = key.split('.');
      let value: any = dictionary;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      return interpolate(value, vars);
    },
    [dictionary]
  );

  // Set locale and persist to localStorage
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  return {
    locale,
    dictionary,
    t,
    setLocale,
    isLoading,
  };
}
