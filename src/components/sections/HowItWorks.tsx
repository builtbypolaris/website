import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { useTimelineSteps } from '../../data/timeline'
import { useT } from '../../i18n'

export function HowItWorks() {
  const t = useT()
  const timelineSteps = useTimelineSteps()
  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(124,92,191,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="mb-16 max-w-[600px]">
          <SectionLabel>{t.howItWorks.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[28px] sm:text-[36px] md:text-[48px] text-white leading-[1.15]">
            {t.howItWorks.titleLine1}<br />
            <span className="text-gold">{t.howItWorks.titleLine2}</span>
          </h2>
        </MotionReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line — spans from center of col1 to center of col3 */}
          <div className="hidden xl:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-purple-core/60 via-purple-bright/40 to-purple-core/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-core/40 via-purple-bright/20 to-purple-core/40 blur-sm" />
          </div>

          <StaggerContainer stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {timelineSteps.map((step) => (
              <StaggerItem key={step.number}>
                <div className="group relative flex flex-col items-center">
                  {/* Step number */}
                  <div className="mb-2">
                    <span className="font-serif text-[32px] font-light leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/50 to-white/15">
                      {step.number}
                    </span>
                  </div>

                  {/* Dot on timeline */}
                  <div className="relative mb-5 z-[2]">
                    <div className="w-3 h-3 bg-purple-core rounded-full shadow-[0_0_16px_rgba(124,92,191,0.5)]" />
                    <div className="absolute inset-0 w-3 h-3 bg-purple-core rounded-full animate-ping opacity-20" />
                  </div>

                  {/* Content card */}
                  <div className="w-full bg-card border border-border rounded-2xl p-5 transition-all duration-500 group-hover:border-purple-core/50 group-hover:bg-card-hover card-glow">
                    <h4 className="font-sans font-normal text-[11px] text-purple-glow uppercase tracking-[2px] mb-3">
                      {step.title}
                    </h4>
                    <p className="font-sans font-light text-sm text-grey-light leading-[1.8] mb-5">
                      {step.description}
                    </p>
                    <span className="inline-block px-4 py-1.5 border border-gold/30 rounded-full text-[11px] text-gold tracking-widest uppercase bg-gold/[0.05]">
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
