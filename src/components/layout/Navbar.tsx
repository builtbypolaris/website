import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { useScrolled } from '../../hooks/useScrolled'
import { useMobileMenu } from '../../hooks/useMobileMenu'
import { useNavItems } from '../../data/navigation'
import { useT, useLocale, buildLocalePath } from '../../i18n'

export function Navbar() {
  const scrolled = useScrolled()
  const { isOpen, toggle, close } = useMobileMenu()
  const { pathname } = useLocation()
  const t = useT()
  const locale = useLocale()
  const navItems = useNavItems()
  const homePath = buildLocalePath('/', locale)
  const contactPath = buildLocalePath('/contact', locale)

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] border-b border-border/50 backdrop-blur-[16px] transition-all duration-300 ${
        scrolled ? 'bg-deep/[0.97]' : 'bg-deep/80'
      }`}
    >
      {/*
        Three-column flex layout: logo (left), nav (center), CTA (right).
        Each column is flex-1 so they share the available width equally,
        which means the nav is geometrically centered AND can never overlap
        with the logo or button no matter how long the labels get. The
        previous absolute-positioned nav broke when the Indonesian CTA
        button label was longer than the English one.
      */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 flex items-center h-[88px] gap-4">
        {/* Logo — left column */}
        <div className="flex-1 flex justify-start">
          <Link to={homePath} className="block">
            <img
              src="/images/logo/logo-dark.png"
              alt="Polaris — Your Business Compass"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* Nav links — center column */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-10">
          {navItems.map((item) => {
            const isActive = item.to === homePath ? pathname === homePath : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-[15px] tracking-wide transition-colors duration-200 group whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-grey-light hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-purple-core to-purple-bright rounded-full transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        {/* CTA — right column (desktop) */}
        <div className="hidden md:flex flex-1 justify-end">
          <Button to={contactPath} className="!py-3 !px-6 !text-[13px] whitespace-nowrap">
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
        } fixed top-[88px] left-0 w-full bg-deep/[0.98] backdrop-blur-[16px] border-b border-border p-8 flex-col gap-6 items-center md:hidden`}
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
        <Button to={contactPath} className="mt-2">
          {t.nav.mobileCta}
        </Button>
        <div className="pt-4 border-t border-border/40 w-full flex justify-center">
          <LanguageSwitcher variant="mobile" onSelect={close} />
        </div>
      </div>
    </nav>
  )
}
