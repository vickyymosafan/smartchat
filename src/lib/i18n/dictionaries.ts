import type { Locale, Dictionary } from './types';

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  id: () => import('./dictionaries/id.json').then(module => module.default),
  en: () => import('./dictionaries/en.json').then(module => module.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === 'id' || locale === 'en';
}

export const DEFAULT_LOCALE: Locale = 'id';
export const SUPPORTED_LOCALES: Locale[] = ['id', 'en'];

export const LOCALE_NAMES: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};
