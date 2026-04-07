import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { ArrowRight } from '../../assets/icons'
import { serviceCategories } from '../../data/services'
import { BrowserMockup, PhoneMockup } from '../mockups'

export function ServicesGrid() {
  const homeServices = serviceCategories.filter((s) => s.showOnHome)

  return (
    <section className="bg-surface py-[100px] relative section-divider-top overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-14">
          <SectionLabel>What We Build</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            One partner.<br />
            <span className="text-purple-glow">Every solution.</span>
          </h2>
        </MotionReveal>

        <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {homeServices.map((service) => (
            <StaggerItem key={service.slug}>
              <Link to={`/services#${service.slug}`} className="block h-full">
                <div className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden h-full transition-all duration-500 hover:border-gold/40 hover:bg-card-hover card-glow">
                  {/* Compact mockup */}
                  <div className="flex justify-center py-6 px-6 bg-deep/30">
                    {service.device === 'phone' ? (
                      <PhoneMockup
                        src={service.illustration}
                        srcs={service.illustrations}
                        alt={service.title}
                        className="w-[120px]"
                      />
                    ) : (
                      <BrowserMockup
                        src={service.illustration}
                        alt={service.title}
                        className="w-full max-w-[360px]"
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-sans font-medium text-[14px] text-gold uppercase tracking-[2px]">
                        {service.title}
                      </h4>
                      <ArrowRight className="w-3.5 h-3.5 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="font-sans font-light text-sm text-grey-light leading-[1.6]">
                      {service.tagline}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <MotionReveal delay={0.2} className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-sans text-base text-purple-glow hover:text-purple-bright transition-colors duration-200 mb-8 group/all"
          >
            See all services
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/all:translate-x-1" />
          </Link>
        </MotionReveal>

        <MotionReveal delay={0.3} className="text-center">
          <WhatsAppButton message="Hi Polaris! I'm interested in learning more about your services. Can we chat?" />
        </MotionReveal>
      </Container>
    </section>
  )
}
