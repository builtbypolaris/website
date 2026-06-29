import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { ArrowRight } from '../../assets/icons'
import { useServiceCategories } from '../../data/services'
import { useT, useLocale, buildLocalePath } from '../../i18n'

const SERVICE_SLUGS = [
  'website-development',
  'seo-content-creation',
  'content-creation',
  'business-operation',
  'application-development',
]

export function ServicesGrid() {
  const t = useT()
  const locale = useLocale()
  const allServices = useServiceCategories()
  const services = SERVICE_SLUGS.map((slug) => allServices.find((s) => s.slug === slug)!)

  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      <Container>
        <MotionReveal className="max-w-[600px] mb-16">
          <SectionLabel>{t.servicesGrid.sectionLabel}</SectionLabel>
          <h2 className="font-serif text-[40px] sm:text-[52px] md:text-[64px] text-white leading-[1.0]">
            {t.servicesGrid.titleLine1}<br />
            <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{t.servicesGrid.titleLine2}</em>
          </h2>
        </MotionReveal>

        {/* Interactive service list */}
        <MotionReveal delay={0.1}>
          <div className="border-t border-white/[0.06]">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                to={`${buildLocalePath('/services', locale)}#${service.slug}`}
                className="group flex items-center gap-5 md:gap-8 py-6 md:py-7 border-b border-white/[0.06] relative overflow-hidden transition-colors duration-300 hover:bg-white/[0.02]"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-core to-purple-bright origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r-full" />

                {/* Number */}
                <span className="font-sans text-[12px] md:text-[13px] text-grey/40 w-8 flex-shrink-0 pl-3 md:pl-5">
                  0{i + 1}
                </span>

                {/* Service name */}
                <h3 className="font-serif font-bold text-[22px] sm:text-[28px] md:text-[36px] lg:text-[42px] text-white group-hover:text-purple-glow transition-colors duration-300 flex-1 leading-none">
                  {service.title}
                </h3>

                {/* Tagline — visible on hover, desktop only */}
                <p className="hidden lg:block font-sans text-[13px] text-grey-light max-w-[240px] text-right opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                  {service.tagline}
                </p>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-grey/30 group-hover:text-purple-core group-hover:translate-x-2 transition-all duration-300 flex-shrink-0 mr-3 md:mr-5" />
              </Link>
            ))}
          </div>
        </MotionReveal>

        {/* Footer */}
        <MotionReveal delay={0.2} className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            to={buildLocalePath('/services', locale)}
            className="inline-flex items-center gap-2 font-sans font-bold text-base text-purple-core hover:text-purple-bright transition-colors duration-200 group/all"
          >
            {t.servicesGrid.seeAllServices}
            <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform duration-200" />
          </Link>
          <WhatsAppButton message={t.servicesGrid.whatsappMessage} />
        </MotionReveal>
      </Container>
    </section>
  )
}
