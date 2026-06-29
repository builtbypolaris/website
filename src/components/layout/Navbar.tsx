import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useScrolled } from '../../hooks/useScrolled'
import { useMobileMenu } from '../../hooks/useMobileMenu'
import { useNavItems } from '../../data/navigation'
import { useT, useLocale, buildLocalePath, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, LOCALE_SHORT_LABELS, type Locale } from '../../i18n'

const WA_HEALTH_CHECK = `https://wa.me/6285190846591?text=${encodeURIComponent('Hi Polaris, can I get a free healthcheck for my business?')}`

export function Navbar() {
  const scrolled = useScrolled()
  const { isOpen, toggle, close } = useMobileMenu()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const t = useT()
  const locale = useLocale()
  const navItems = useNavItems()
  const homePath = buildLocalePath('/', locale)

  function selectLocale(target: Locale) {
    localStorage.setItem(LOCALE_STORAGE_KEY, target)
    if (target !== locale) navigate(buildLocalePath(pathname, target))
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] border-b border-[rgba(255,255,255,0.04)] backdrop-blur-[20px] transition-all duration-300 ${
        scrolled ? 'bg-[rgba(9,9,15,0.97)]' : 'bg-[rgba(9,9,15,0.92)]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 flex md:grid md:grid-cols-3 items-center h-[52px] gap-4">
        {/* Logo — left column */}
        <div className="flex-1 md:flex-none flex justify-start">
          <Link to={homePath}>
            <img src="/images/logo/logo-dark.png" alt="Polaris Studio" className="h-14 w-auto object-contain translate-y-0.5" />
          </Link>
        </div>

        {/* Nav links — center column */}
        <div className="hidden md:flex items-center justify-center gap-5">
          {navItems.map((item) => {
            const isActive = item.to === homePath ? pathname === homePath : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`min-w-[64px] flex justify-center text-[14px] tracking-wide transition-colors duration-200 group ${
                  isActive ? 'text-white' : 'text-grey-light hover:text-white'
                }`}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-purple-core to-purple-bright rounded-full transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              </Link>
            )
          })}
        </div>

        {/* CTA + language toggle — right column (desktop) */}
        <div className="hidden md:flex justify-end items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            {SUPPORTED_LOCALES.map(option => (
              <button
                key={option}
                onClick={() => selectLocale(option)}
                className={`w-9 py-1 rounded-full text-[12px] font-sans font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  option === locale
                    ? 'bg-purple-core/30 text-purple-bright'
                    : 'text-grey-light hover:text-white'
                }`}
              >
                {LOCALE_SHORT_LABELS[option]}
              </button>
            ))}
          </div>
          <Button href={WA_HEALTH_CHECK} className="!py-2 !px-4 !text-[13px] !w-[128px] !text-center">
            {t.nav.cta}
          </Button>
        </div>

        {/* Hamburger — mobile only, right side */}
        <button
          className={`md:hidden flex flex-col gap-[5px] cursor-pointer bg-none border-none p-1 hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? 'flex' : 'hidden'
        } fixed top-[52px] left-0 w-full bg-[rgba(9,9,15,0.98)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.04)] p-8 flex-col gap-6 items-center md:hidden`}
      >
        {navItems.map((item) => {
          const isActive = item.to === homePath ? pathname === homePath : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className={`text-base transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-grey-light hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
        <Button href={WA_HEALTH_CHECK} className="mt-2">
          {t.nav.mobileCta}
        </Button>
        <div className="pt-4 border-t border-border/40 w-full flex justify-center">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            {SUPPORTED_LOCALES.map(option => (
              <button
                key={option}
                onClick={() => { selectLocale(option); close() }}
                className={`w-12 py-1.5 rounded-full text-[12px] font-sans font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  option === locale
                    ? 'bg-purple-core/30 text-purple-bright'
                    : 'text-grey-light hover:text-white'
                }`}
              >
                {LOCALE_SHORT_LABELS[option]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
