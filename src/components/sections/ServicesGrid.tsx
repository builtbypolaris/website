import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { ArrowRight } from '../../assets/icons'
import { Button } from '../ui/Button'
import { serviceCategories } from '../../data/services'

export function ServicesGrid() {
  const healthCheck = serviceCategories[0]
  const rest = serviceCategories.slice(1)

  return (
    <section className="bg-surface py-[100px] relative section-divider-top">
      {/* Atmospheric glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-16">
          <SectionLabel>What We Build</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            One partner.<br />
            <span className="text-purple-glow">Every solution.</span>
          </h2>
        </MotionReveal>

        {/* Health Check — full width hero card */}
        <MotionReveal className="mb-5">
          <div className="group relative bg-card border border-gold/30 rounded-2xl p-7 transition-all duration-500 hover:border-gold/60 hover:bg-card-hover card-glow overflow-hidden">
            {/* GRATIS badge */}
            <div className="absolute top-5 right-5">
              <span className="inline-block px-3 py-1 text-[11px] font-sans font-medium tracking-[2px] uppercase bg-gold/15 text-gold border border-gold/30 rounded-full">
                {healthCheck.highlight}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <healthCheck.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans font-normal text-[11px] text-gold uppercase tracking-[2px] mb-2">
                  {healthCheck.title}
                </h4>
                <p className="font-sans font-light text-sm text-grey-light leading-[1.7] mb-3 max-w-[600px]">
                  {healthCheck.tagline}
                </p>
                <div className="font-sans text-[11px] text-gold tracking-widest uppercase">
                  {healthCheck.tiers[0].price}
                </div>
              </div>
              <Link
                to={healthCheck.link}
                className="font-sans text-[12px] text-purple-bright tracking-wide hover:text-purple-glow transition-colors duration-200 inline-flex items-center gap-1.5 group/link flex-shrink-0"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </MotionReveal>

        {/* Remaining 4 services — 2×2 grid */}
        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((service, i) => (
            <StaggerItem key={service.title}>
              <div className="group relative bg-card border border-border rounded-2xl p-5 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                {/* Decorative number */}
                <div className="absolute -top-1 -right-1 font-serif text-[52px] font-light leading-none text-white/20 pointer-events-none select-none">
                  {String(i + 2).padStart(2, '0')}
                </div>

                <div className="w-10 h-10 mb-4 rounded-xl bg-purple-core/10 border border-purple-core/20 flex items-center justify-center">
                  <service.icon className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-normal text-[11px] text-purple-glow uppercase tracking-[2px] mb-2">
                  {service.title}
                </h4>
                <p className="font-sans font-light text-sm text-grey-light leading-[1.7] mb-4">
                  {service.tagline}
                </p>
                <div className="font-sans text-[11px] text-gold tracking-widest uppercase mb-4">
                  {service.tiers[0].price}
                </div>
                <Link
                  to={service.link}
                  className="font-sans text-[12px] text-purple-bright tracking-wide hover:text-purple-glow transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                >
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-core/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <MotionReveal delay={0.3} className="mt-14 text-center">
          <Button to="/contact">Get Your Free Health Check</Button>
        </MotionReveal>
      </Container>
    </section>
  )
}
