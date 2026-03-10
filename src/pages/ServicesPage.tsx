import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { SectionLabel } from '../components/ui/SectionLabel'
import { StaggerContainer, StaggerItem } from '../components/ui/StaggerContainer'
import { ArrowRight } from '../assets/icons'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { CtaSection } from '../components/sections/CtaSection'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'
import { serviceCategories } from '../data/services'

export function ServicesPage() {
  return (
    <div className="pt-[88px]">
      {/* Services page hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">Services</p>
            <h1 className="font-serif font-light text-[72px] text-white leading-[1.1] mb-6">
              Technology that<br />
              <span className="text-purple-glow">actually works for you.</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              From diagnosis to deployment. One trusted partner for every solution your business needs.
            </p>
          </MotionReveal>
        </Container>
      </section>

      <ServicesGrid />

      {/* Detailed service sections */}
      {serviceCategories.map((category, idx) => (
        <section
          key={category.title}
          id={category.title.toLowerCase().replace(/\s+/g, '-')}
          className={`${idx % 2 === 0 ? 'bg-void' : 'bg-surface'} py-[80px] relative section-divider-top`}
        >
          <Container>
            <MotionReveal className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-core/10 border border-purple-core/20 flex items-center justify-center">
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <SectionLabel>{category.title}</SectionLabel>
                </div>
              </div>
              <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[640px]">
                {category.description}
              </p>
            </MotionReveal>

            {/* Tier cards */}
            <StaggerContainer stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.tiers.map((tier) => (
                <StaggerItem key={tier.name}>
                  <div className="group relative bg-card border border-border rounded-2xl p-6 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow">
                    <h4 className="font-sans font-normal text-[13px] text-white mb-2">
                      {tier.name}
                    </h4>
                    <div className="font-sans text-[12px] text-gold tracking-wider uppercase mb-3">
                      {tier.price}
                    </div>
                    {tier.description && (
                      <p className="font-sans font-light text-sm text-grey-light leading-[1.7]">
                        {tier.description}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Link to pricing */}
            {category.link === '/pricing' && (
              <MotionReveal delay={0.2} className="mt-6">
                <Link
                  to="/pricing"
                  className="font-sans text-[13px] text-purple-bright tracking-wide hover:text-purple-glow transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                >
                  See full pricing details
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </MotionReveal>
            )}
          </Container>
        </section>
      ))}

      <CtaSection />
    </div>
  )
}
