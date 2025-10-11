export {
  getDictionary,
  isValidLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
} from './dictionaries';
export { useTranslation } from '@/hooks/useTranslation';
export {
  TranslationProvider,
  useTranslationContext,
} from '@/components/providers/TranslationProvider';
export type { Locale, Dictionary } from './types';
