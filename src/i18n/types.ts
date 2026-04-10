/**
 * Supported locales for the Polaris website.
 *
 * - `en` (English) — default, lives at the root path (`/`, `/services`, etc.)
 * - `id` (Indonesian) — lives under the `/id` prefix (`/id`, `/id/services`, etc.)
 *
 * Add a new locale by:
 * 1. Adding it to this union
 * 2. Creating `locales/<code>.ts` that mirrors the shape of `en.ts`
 * 3. Updating `useT` and `LocaleContext` to recognize the new prefix
 * 4. Updating the routes in `App.tsx` and the sitemap script
 */
export type Locale = 'en' | 'id'

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'id'] as const
export const DEFAULT_LOCALE: Locale = 'en'

/**
 * Locales that live under a URL prefix. The default locale (`en`) lives at
 * the root, so it has no prefix. Indonesian lives under `/id`.
 */
export const LOCALE_PATH_PREFIX: Record<Locale, string> = {
  en: '',
  id: '/id',
}

/**
 * Display labels shown in the language switcher dropdown.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
}

/**
 * Short codes used for the dropdown trigger.
 */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: 'EN',
  id: 'ID',
}

/**
 * localStorage key used to persist the user's locale preference.
 *
 * Set when:
 * - The auto-detect component decides to redirect a new visitor based on
 *   their browser language (so we don't keep doing it).
 * - The user clicks the language switcher in the footer or mobile menu.
 *
 * Never set automatically on every page navigation — that would prevent the
 * user from ever switching languages because the auto-detect would keep
 * sending them back.
 */
export const LOCALE_STORAGE_KEY = 'polaris-locale'
