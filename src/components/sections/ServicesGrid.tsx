import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { ArrowRight } from '../../assets/icons'
import { serviceCategories } from '../../data/services'

export function ServicesGrid() {
  const homeServices = serviceCategories.filter((s) => s.showOnHome)

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

        {/* Services grid */}
        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeServices.map((service) => (
            <StaggerItem key={service.title}>
              <Link to={`/services#${service.slug}`} className="block h-full">
                <div className="group relative bg-card border border-gold/30 rounded-2xl overflow-hidden h-full transition-all duration-500 hover:border-gold/60 hover:bg-card-hover card-glow flex flex-col">
                  <div className="px-5 py-5 flex-1 flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                      <service.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-sans font-medium text-[14px] text-gold uppercase tracking-[2px] mb-2">
                      {service.title}
                    </h4>
                    <p className="font-sans font-light text-sm text-grey-light leading-[1.6] mb-4 flex-1">
                      {service.tagline}
                    </p>
                    <span className="font-sans text-[13px] text-gold/70 tracking-wide group-hover:text-gold transition-colors duration-200 inline-flex items-center gap-1.5 mt-auto">
                      Learn more
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* See all services link */}
        <MotionReveal delay={0.2} className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-sans text-base text-purple-glow hover:text-purple-bright transition-colors duration-200"
          >
            See all services
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </MotionReveal>

        <MotionReveal delay={0.3} className="mt-10 text-center">
          <WhatsAppButton message="Hi Polaris! I'm interested in learning more about your services. Can we chat?" />
        </MotionReveal>
      </Container>
    </section>
  )
}
