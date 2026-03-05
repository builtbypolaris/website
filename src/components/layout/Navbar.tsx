import { Link, useLocation } from 'react-router-dom'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { useScrolled } from '../../hooks/useScrolled'
import { useMobileMenu } from '../../hooks/useMobileMenu'
import { navItems } from '../../data/navigation'

export function Navbar() {
  const scrolled = useScrolled()
  const { isOpen, toggle, close } = useMobileMenu()
  const { pathname } = useLocation()

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] border-b border-border/50 backdrop-blur-[16px] transition-all duration-300 ${
        scrolled ? 'bg-deep/[0.97]' : 'bg-deep/80'
      }`}
    >
      <Container className="flex items-center justify-between h-[72px]">
        <Link to="/" className="block">
          <img
            src="/logo-dark.png"
            alt="Polaris — Your Business Compass"
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm tracking-wide transition-colors duration-200 group ${
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

        <div className="hidden md:block">
          <Button to="/contact" className="!py-2.5 !px-5.5 !text-[13px]">
            Get Your Free Diagnosis
          </Button>
        </div>

        <button
          className={`md:hidden flex flex-col gap-[5px] cursor-pointer bg-none border-none p-1 hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white rounded-sm transition-all duration-300" />
        </button>
      </Container>

      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? 'flex' : 'hidden'
        } fixed top-[72px] left-0 w-full bg-deep/[0.98] backdrop-blur-[16px] border-b border-border p-8 flex-col gap-6 items-center md:hidden`}
      >
        {navItems.map((item) => {
          const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
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
        <Button to="/contact" className="mt-2">
          Get Your Free Diagnosis
        </Button>
      </div>
    </nav>
  )
}
