import { useLocation } from 'react-router-dom'
import { useDocumentHead } from './useDocumentHead'
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildLocalePath,
  stripLocalePrefix,
  useLocale,
} from '../i18n'

interface PageHeadOptions {
  /** Page title (used for `<title>` and `og:title`) */
  title: string
  /** Meta description and `og:description` */
  description: string
  /** Optional `og:image` URL. Falls back to the default site image. */
  image?: string
}

/**
 * Convenience hook that sets the page's head tags with proper locale-aware
 * canonical and hreflang alternates.
 *
 * Behavior:
 * - `<title>` and meta description come from the arguments (caller passes
 *   the active-locale strings).
 * - **Canonical** = the absolute URL of the page the user is currently on
 *   (including any `/id` prefix). Each language version is its own canonical.
 * - **Hreflang alternates** point at the equivalent pages in every locale,
 *   plus an `x-default` (English) entry.
 * - **og:locale** is set to `en_US` or `id_ID`.
 * - **og:url** mirrors the canonical.
 * - **og:image** uses the provided image, or the site default.
 *
 * Usage:
 *   const t = useT()
 *   usePageHead({
 *     title: t.meta.services.title,
 *     description: t.meta.services.description,
 *   })
 *
 * Why a wrapper around useDocumentHead instead of just calling it directly?
 * Because every page needs the same canonical + hreflang logic, and writing
 * it inline in every component would be duplicative and error-prone.
 */
export function usePageHead({ title, description, image }: PageHeadOptions) {
  const locale = useLocale()
  const { pathname } = useLocation()

  // The canonical English path (no /id prefix). Used to build alternates.
  const canonicalPath = stripLocalePrefix(pathname)

  // Each language version's full URL.
  const enUrl = `${SITE_URL}${buildLocalePath(canonicalPath, 'en')}`
  const idUrl = `${SITE_URL}${buildLocalePath(canonicalPath, 'id')}`

  // The current page's canonical is itself — whichever language we're on.
  const canonical = locale === 'id' ? idUrl : enUrl

  useDocumentHead({
    title,
    description,
    canonical,
    ogImage: image ?? DEFAULT_OG_IMAGE,
    ogLocale: locale === 'id' ? 'id_ID' : 'en_US',
    alternates: [
      { hreflang: 'en', href: enUrl },
      { hreflang: 'id', href: idUrl },
      // x-default tells search engines which version to show users whose
      // language doesn't match either alternate. We default to English.
      { hreflang: 'x-default', href: enUrl },
    ],
  })
}
