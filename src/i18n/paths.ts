import type { Locale } from './types'

/**
 * Strips a locale prefix from a pathname, returning the canonical English path.
 *
 * Examples:
 *   '/id'              → '/'
 *   '/id/services'     → '/services'
 *   '/id/insights/foo' → '/insights/foo'
 *   '/services'        → '/services'
 *   '/'                → '/'
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/id') return '/'
  if (pathname.startsWith('/id/')) return pathname.slice(3)
  return pathname
}

/**
 * Builds the equivalent path in the target locale.
 *
 * The function preserves the rest of the path structure so users can switch
 * languages on any page and stay on the same page in the new language.
 *
 * Examples:
 *   ('/services', 'id')        → '/id/services'
 *   ('/id/services', 'en')     → '/services'
 *   ('/insights/foo', 'id')    → '/id/insights/foo'
 *   ('/id', 'en')              → '/'
 *   ('/', 'id')                → '/id'
 *
 * Note: this assumes blog post slugs are the same across locales (which they
 * are in v1 — see Phase 5 of the i18n plan). If we add locale-specific slugs
 * later, this function will need a slug-mapping lookup.
 */
export function buildLocalePath(pathname: string, target: Locale): string {
  const canonical = stripLocalePrefix(pathname)

  if (target === 'en') return canonical
  if (canonical === '/') return '/id'
  return `/id${canonical}`
}
