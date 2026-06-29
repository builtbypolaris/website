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
    <section className="bg-void py-[100px] relative">
      <Container>
        <MotionReveal className="mb-14 max-w-[600px]">
          <SectionLabel>{t.howItWorks.sectionLabel}</SectionLabel>
          <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[48px] text-white leading-[1.05]">
            {t.howItWorks.titleLine1}<br />
            <em style={{ color: '#7C3AED', fontStyle: 'italic' }}>{t.howItWorks.titleLine2}</em>
          </h2>
        </MotionReveal>

        <StaggerContainer stagger={0.13} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {timelineSteps.map((step) => (
            <StaggerItem key={step.number}>
              <div
                className="relative rounded-2xl p-6 h-full border overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                {/* Decorative step number — faint, top-right */}
                <div className="absolute top-4 right-5 font-serif text-[64px] font-black leading-none text-white/[0.07] select-none pointer-events-none">
                  {step.number}
                </div>

                {/* Tag badge — top-left */}
                <div className="mb-5">
                  <span className="inline-block px-3 py-1 border border-purple-core/30 rounded-full font-sans text-[11px] font-bold text-purple-glow tracking-wide bg-purple-core/[0.05]">
                    {step.tag}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-[20px] text-white mb-3 leading-snug pr-8">
                  {step.title}
                </h4>

                {/* Description */}
                <p className="font-sans text-[14px] text-grey-light leading-[1.8]">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
