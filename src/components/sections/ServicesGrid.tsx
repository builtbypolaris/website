import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { ArrowRight } from '../../assets/icons'
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

        {/* Health Check - full width hero card */}
        <MotionReveal className="mb-5">
          <Link to="/services#health-check" className="block">
            <div className="group relative bg-card border border-gold/30 rounded-2xl overflow-hidden transition-all duration-500 hover:border-gold/60 hover:bg-card-hover card-glow">
              {/* FREE badge */}
              <div className="absolute top-5 right-5 z-10">
                <span className="inline-block px-3 py-1 text-[11px] font-sans font-medium tracking-[2px] uppercase bg-gold/15 text-gold border border-gold/30 rounded-full">
                  {healthCheck.highlight}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-stretch">
                {/* Illustration side */}
                <div className="md:w-[40%] bg-deep/50 flex items-center justify-center p-6">
                  <img src={healthCheck.illustration} alt={healthCheck.title} className="w-full max-w-[240px] h-auto rounded-lg" />
                </div>

                {/* Content side */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                    <healthCheck.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-sans font-medium text-[15px] text-gold uppercase tracking-[2px] mb-2">
                    {healthCheck.title}
                  </h4>
                  <p className="font-sans font-light text-sm text-grey-light leading-[1.7] max-w-[480px]">
                    {healthCheck.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>
        </MotionReveal>

        {/* Remaining 4 services - 2x2 grid */}
        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((service) => (
            <StaggerItem key={service.title}>
              <Link to={`/services#${service.slug}`} className="block h-full">
                <div className="group relative bg-card border border-gold/30 rounded-2xl overflow-hidden h-full transition-all duration-500 hover:border-gold/60 hover:bg-card-hover card-glow flex flex-col">
                  {/* Illustration area */}
                  <div className="bg-deep/50 flex items-center justify-center p-6 pt-8">
                    <img src={service.illustration} alt={service.title} className="w-full max-w-[240px] h-auto rounded-lg" />
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h4 className="font-sans font-medium text-[14px] text-gold uppercase tracking-[2px]">
                        {service.title}
                      </h4>
                      <span className="font-sans text-[13px] text-gold/70 tracking-wide group-hover:text-gold transition-colors duration-200 inline-flex items-center gap-1.5 flex-shrink-0">
                        View more
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                    <p className="font-sans font-light text-sm text-grey-light leading-[1.6]">
                      {service.tagline}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <MotionReveal delay={0.3} className="mt-14 text-center">
          <WhatsAppButton message="Hi Polaris! I'm interested in learning more about your services. Can we chat?" />
        </MotionReveal>
      </Container>
    </section>
  )
}
