import { useMemo } from 'react'
import type { NavItem } from '../types'
import { useT, useLocale, buildLocalePath } from '../i18n'

/**
 * Returns the navbar items with the right `to` paths for the active locale.
 *
 * - On English (`/`): paths are `/`, `/services`, etc.
 * - On Indonesian (`/id`): paths are `/id`, `/id/services`, etc.
 *
 * Labels come from the translation file (`t.nav.*`).
 *
 * Components should use this hook instead of importing a static array, so
 * the navbar always points to the current-language version of each page.
 */
export function useNavItems(): NavItem[] {
  const t = useT()
  const locale = useLocale()
  return useMemo(() => {
    return [
      { label: t.nav.home, to: buildLocalePath('/', locale) },
      { label: t.nav.services, to: buildLocalePath('/services', locale) },
      { label: t.nav.about, to: buildLocalePath('/about', locale) },
      { label: t.nav.insights, to: buildLocalePath('/insights', locale) },
      { label: t.nav.contact, to: buildLocalePath('/contact', locale) },
    ]
  }, [t.nav, locale])
}
