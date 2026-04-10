import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  buildLocalePath,
  useLocale,
  type Locale,
} from '../../i18n'

interface LanguageSwitcherProps {
  /** Visual variant. `'footer'` is the dark dropdown used in the site footer.
   *  `'mobile'` is the inline pill used inside the mobile menu. */
  variant?: 'footer' | 'mobile'
  /** Optional callback fired after a language is picked (e.g. close mobile menu). */
  onSelect?: () => void
}

/**
 * Language switcher dropdown.
 *
 * Behavior:
 * - Reads the active locale from `useLocale()` (URL-derived).
 * - On click, navigates to the equivalent path in the target locale, e.g.
 *   `/services` ⇄ `/id/services`.
 * - Persists the user's choice to `localStorage` so the auto-detect doesn't
 *   override them on subsequent visits.
 * - Closes when the user clicks outside or presses Escape.
 *
 * Two visual variants:
 * - `footer` (default): a compact dropdown that opens upward, suitable for
 *   the dark footer.
 * - `mobile`: a row of pill buttons rendered inline (no dropdown). Used
 *   inside the mobile menu where space is generous and tapping is preferred
 *   over a nested popover.
 */
export function LanguageSwitcher({ variant = 'footer', onSelect }: LanguageSwitcherProps) {
  const locale = useLocale()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function selectLocale(target: Locale) {
    setOpen(false)
    onSelect?.()
    // Always persist the user's explicit choice so auto-detect doesn't fight them.
    localStorage.setItem(LOCALE_STORAGE_KEY, target)
    if (target === locale) return
    navigate(buildLocalePath(pathname, target))
  }

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2">
        {SUPPORTED_LOCALES.map((option) => {
          const isActive = option === locale
          return (
            <button
              key={option}
              onClick={() => selectLocale(option)}
              className={`px-4 py-2 rounded-full font-sans text-[12px] tracking-[2px] uppercase transition-colors duration-200 ${
                isActive
                  ? 'bg-purple-core/20 text-purple-bright border border-purple-core/40'
                  : 'border border-border/60 text-grey-light hover:border-purple-core/30 hover:text-white'
              }`}
            >
              {LOCALE_SHORT_LABELS[option]}
            </button>
          )
        })}
      </div>
    )
  }

  // Footer variant: a compact dropdown that opens upward.
  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2.5 border border-border/60 rounded-lg text-sm text-grey-light hover:border-purple-core/40 hover:text-white transition-colors duration-200 font-sans cursor-pointer"
      >
        <GlobeIcon className="w-4 h-4" />
        <span>{LOCALE_LABELS[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full mb-2 left-0 min-w-full bg-card border border-border rounded-lg shadow-[0_-8px_24px_rgba(0,0,0,0.3)] overflow-hidden z-50"
        >
          {SUPPORTED_LOCALES.map((option) => {
            const isActive = option === locale
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => selectLocale(option)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-sans transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-core/15 text-purple-bright'
                      : 'text-grey-light hover:bg-card-hover hover:text-white'
                  }`}
                >
                  {LOCALE_LABELS[option]}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/**
 * Simple globe icon used in the footer dropdown trigger.
 * Inline SVG to avoid pulling in another icon dependency.
 */
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18" />
      <path d="M12 3a14 14 0 000 18" />
    </svg>
  )
}
