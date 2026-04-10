import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCALE_STORAGE_KEY } from './types'

/**
 * Headless component that auto-redirects new visitors to their preferred
 * language version of the site on first visit.
 *
 * Behavior:
 * 1. Only runs once on initial mount (guarded by a ref).
 * 2. Only acts when the user lands on the root path `/`.
 *    - If they landed on `/id` or some other URL directly, we trust the URL
 *      and don't override.
 * 3. Checks `localStorage` first:
 *    - If the user already chose `'id'`, redirect them to `/id`.
 *    - If they already chose `'en'`, leave them at `/`.
 *    - If no stored preference, fall through to browser language detection.
 * 4. Browser language detection:
 *    - If `navigator.language` starts with `'id'`, persist `'id'` to
 *      localStorage and redirect to `/id`.
 *    - Otherwise do nothing (English is the default at the root).
 *
 * The localStorage entry is the source of truth once it exists. The language
 * switcher in the footer/mobile menu is the only other place that writes to
 * it (Phase 3). This means the user can always override the auto-detect by
 * clicking the switcher, and their choice sticks across visits.
 *
 * Renders nothing.
 */
export function LocaleAutoDetect() {
  const navigate = useNavigate()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (window.location.pathname !== '/') return

    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'id') {
      navigate('/id', { replace: true })
      return
    }
    if (stored === 'en') return

    // No stored preference yet. Check the browser's preferred language.
    const browserLang = (navigator.language ?? '').toLowerCase()
    if (browserLang.startsWith('id')) {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'id')
      navigate('/id', { replace: true })
    }
    // If they're not Indonesian-speaking, leave them on `/` and don't write
    // anything to localStorage — they'll stay on English by default.
  }, [navigate])

  return null
}
