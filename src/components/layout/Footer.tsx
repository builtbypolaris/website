import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { useNavItems } from '../../data/navigation'
import { socials } from '../../data/socials'
import { useT } from '../../i18n'

export function Footer() {
  const t = useT()
  const navItems = useNavItems()

  return (
    <footer className="bg-void border-t border-border/50 pt-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 md:gap-8 pb-8">
          {/* Brand */}
          <div>
            <img
              src="/images/logo/logo-dark.png"
              alt="Polaris"
              className="h-14 w-auto mb-5"
            />
            <p className="text-sm text-grey leading-relaxed max-w-[280px] mb-6">
              {t.footer.tagline}
            </p>
            <LanguageSwitcher variant="footer" />
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-sans font-normal text-[12px] tracking-[3px] uppercase text-grey mb-6">
              {t.footer.navigate}
            </h5>
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm text-grey-light mb-3 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-sans font-normal text-[12px] tracking-[3px] uppercase text-grey mb-6">
              {t.footer.getInTouch}
            </h5>
            <a
              href="mailto:builtbypolaris@gmail.com"
              className="text-sm text-grey-light mb-3 block hover:text-white transition-colors duration-200"
            >
              builtbypolaris@gmail.com
            </a>
            <p className="text-sm text-grey-light mb-3">{t.footer.location}</p>
            <div className="flex gap-3 mt-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 border border-border/60 rounded-lg flex items-center justify-center hover:border-purple-core/40 hover:bg-purple-core/10 transition-all duration-300"
                >
                  <social.icon className="w-[18px] h-[18px] text-grey-light" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 py-6 text-center text-[13px] text-grey/70">
          {t.footer.copyright}
        </div>
      </Container>
    </footer>
  )
}
