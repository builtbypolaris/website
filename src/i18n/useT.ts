import { useLocale } from './LocaleContext'
import { en } from './locales/en'
import { id } from './locales/id'

/**
 * Returns the translation object for the active locale.
 *
 * Usage:
 *   const t = useT()
 *   return <h1>{t.hero.title}</h1>
 *
 * Because `id.ts` is typed as `EnTranslations`, the returned object always
 * has the same shape. TypeScript autocomplete works for any nested key.
 */
export function useT() {
  const locale = useLocale()
  return locale === 'id' ? id : en
}
