import { useEffect } from 'react'

export interface AlternateLink {
  /** BCP-47 language code, e.g. 'en', 'id', or 'x-default' */
  hreflang: string
  /** Absolute URL to the alternate version of this page */
  href: string
}

export interface DocumentHeadOptions {
  /** Page title shown in the browser tab and used for og:title */
  title?: string
  /** Meta description and og:description */
  description?: string
  /** Absolute canonical URL for this page */
  canonical?: string
  /** Hreflang alternates for this page (include the current locale + others) */
  alternates?: AlternateLink[]
  /** Optional og:image URL */
  ogImage?: string
  /** Optional og:locale (e.g. 'en_US' or 'id_ID') */
  ogLocale?: string
}

/**
 * Imperatively manages document head tags for the current page.
 *
 * Sets:
 * - `<title>`
 * - `<meta name="description">`
 * - `<meta property="og:title">` and `<meta property="og:description">`
 * - `<meta property="og:image">` (if provided)
 * - `<meta property="og:locale">` (if provided)
 * - `<link rel="canonical">`
 * - `<link rel="alternate" hreflang="...">` (one per alternate, plus optional x-default)
 *
 * Why not react-helmet-async? It works fine for an SPA but adds another
 * dependency and a context provider. Imperative DOM updates inside an effect
 * are simpler and have no measurable downside for our use case.
 *
 * Usage:
 *   useDocumentHead({
 *     title: 'Services — Polaris',
 *     description: 'What we build at Polaris.',
 *     canonical: 'https://www.builtbypolaris.com/services',
 *     alternates: [
 *       { hreflang: 'en', href: 'https://www.builtbypolaris.com/services' },
 *       { hreflang: 'id', href: 'https://www.builtbypolaris.com/id/services' },
 *       { hreflang: 'x-default', href: 'https://www.builtbypolaris.com/services' },
 *     ],
 *   })
 */
export function useDocumentHead(options: DocumentHeadOptions) {
  const { title, description, canonical, alternates, ogImage, ogLocale } = options

  useEffect(() => {
    if (title) {
      document.title = title
      setMetaTag('og:title', title, 'property')
    }

    if (description) {
      setMetaTag('description', description, 'name')
      setMetaTag('og:description', description, 'property')
    }

    if (canonical) {
      setLinkTag('canonical', canonical)
      setMetaTag('og:url', canonical, 'property')
    }

    if (ogImage) {
      setMetaTag('og:image', ogImage, 'property')
    }

    if (ogLocale) {
      setMetaTag('og:locale', ogLocale, 'property')
    }

    // Replace all hreflang alternates atomically. We remove old ones first
    // so that navigating between pages doesn't leave stale alternates behind.
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove())

    if (alternates && alternates.length > 0) {
      for (const alt of alternates) {
        const link = document.createElement('link')
        link.rel = 'alternate'
        link.hreflang = alt.hreflang
        link.href = alt.href
        document.head.appendChild(link)
      }
    }
    // We use JSON.stringify on alternates so the effect re-runs only when
    // contents actually change, not on every render that creates a new array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, JSON.stringify(alternates), ogImage, ogLocale])
}

/**
 * Find or create a `<meta>` tag and set its content.
 * Uses `name` for standard meta tags and `property` for Open Graph tags.
 */
function setMetaTag(key: string, content: string, attr: 'name' | 'property') {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Find or create a `<link>` tag with the given rel and set its href.
 */
function setLinkTag(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = rel
    document.head.appendChild(tag)
  }
  tag.href = href
}
