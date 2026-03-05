import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { timelineSteps } from '../../data/timeline'

export function HowItWorks() {
  return (
    <section className="bg-void py-[100px] relative overflow-x-clip section-divider-top">
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(124,92,191,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="text-center mb-16 max-w-[600px] mx-auto">
          <SectionLabel centered>How It Works</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white leading-[1.15]">
            Three steps from confusion<br />
            <span className="text-gold">to clarity.</span>
          </h2>
        </MotionReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden xl:block absolute top-[88px] left-[16.67%] right-[16.67%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-purple-core/60 via-purple-bright/40 to-purple-core/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-core/40 via-purple-bright/20 to-purple-core/40 blur-sm" />
          </div>

          <StaggerContainer stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {timelineSteps.map((step) => (
              <StaggerItem key={step.number}>
                <div className="group text-center relative">
                  {/* Large step number */}
                  <div className="relative inline-block mb-4">
                    <span className="font-serif text-[96px] font-light leading-none text-transparent bg-clip-text bg-gradient-to-b from-border/80 to-border/30">
                      {step.number}
                    </span>
                  </div>

                  {/* Dot on timeline */}
                  <div className="relative mx-auto mb-8 z-[2]">
                    <div className="w-4 h-4 bg-purple-core rounded-full mx-auto shadow-[0_0_24px_rgba(124,92,191,0.5)]" />
                    <div className="absolute inset-0 w-4 h-4 bg-purple-core rounded-full mx-auto animate-ping opacity-20" />
                  </div>

                  {/* Content card */}
                  <div className="bg-card border border-border rounded-2xl p-7 transition-all duration-500 group-hover:border-purple-core/50 group-hover:bg-card-hover card-glow">
                    <h4 className="font-sans font-normal text-[13px] text-purple-glow uppercase tracking-[2px] mb-4">
                      {step.title}
                    </h4>
                    <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8] mb-6">
                      {step.description}
                    </p>
                    <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-[12px] text-gold tracking-widest uppercase bg-gold/[0.05]">
                      {step.tag}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </section>
  )
}
