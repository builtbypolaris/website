/**
 * i18n barrel export. Import everything you need from here:
 *
 *   import { useT, useLocale, LocaleProvider } from '@/i18n'
 */
export { LocaleProvider, useLocale } from './LocaleContext'
export { LocaleAutoDetect } from './LocaleAutoDetect'
export { useT } from './useT'
export { buildLocalePath, stripLocalePrefix } from './paths'
export { SITE_URL, DEFAULT_OG_IMAGE } from './config'
export type { Locale } from './types'
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_PATH_PREFIX,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  LOCALE_STORAGE_KEY,
} from './types'
