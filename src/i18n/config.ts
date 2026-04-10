/**
 * Public production URL of the Polaris site. Used as the base for canonical
 * URLs, hreflang alternates, og:url, and the sitemap.
 *
 * Centralized here so the value lives in one place. If we ever move to a
 * different domain, only this constant changes (plus the matching value in
 * `scripts/build-sitemap.js` which runs at build time and can't import from
 * the browser bundle).
 */
export const SITE_URL = 'https://www.builtbypolaris.com'

/**
 * Default Open Graph image used when a page doesn't specify its own.
 * Lives in the public folder so it's served as a static asset.
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo/logo-dark.png`
