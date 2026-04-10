import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Locale } from './types'
import { DEFAULT_LOCALE } from './types'

interface LocaleContextValue {
  locale: Locale
}

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE })

/**
 * Derives the active locale from the current URL pathname.
 *
 * - `/id` or `/id/...` → `'id'`
 * - everything else    → `'en'` (default)
 *
 * The URL is the single source of truth for the current locale. There's no
 * separate state to keep in sync — when the user navigates, the locale
 * updates automatically because this provider listens to `useLocation`.
 *
 * Side effect: also keeps `document.documentElement.lang` in sync with the
 * active locale, which matters for accessibility and SEO.
 *
 * Must be rendered inside a `<BrowserRouter>` because it depends on
 * `useLocation`.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const locale: Locale = pathname === '/id' || pathname.startsWith('/id/') ? 'id' : 'en'

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <LocaleContext.Provider value={{ locale }}>{children}</LocaleContext.Provider>
}

/**
 * Returns the currently active locale (`'en'` or `'id'`).
 *
 * Usage:
 *   const locale = useLocale()
 *   if (locale === 'id') { ... }
 */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale
}
