import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { useProblems } from '../../data/problems'
import { useT } from '../../i18n'

export function ProblemSection() {
  const t = useT()
  const problems = useProblems()

  return (
    <section className="bg-[#09090F] py-[100px] relative section-divider-top">
      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[680px] mb-14">
          <SectionLabel>{t.problemSection.sectionLabel}</SectionLabel>
          <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[48px] text-white mb-5 leading-[1.05]">
            {t.problemSection.titleLine1}
            <em className="block" style={{ color: '#7C3AED', fontStyle: 'italic' }}>
              {t.problemSection.titleLine2}
            </em>
          </h2>
          <p className="font-sans text-base text-grey-light leading-[1.8] max-w-[560px]">
            {t.problemSection.subtitle}
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((problem) => (
            <StaggerItem key={problem.title}>
              <div className="group relative h-full">
                <div
                  className="relative h-full rounded-2xl p-6 overflow-hidden border"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.06)',
                    transition: 'border-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.30)'
                    const bar = e.currentTarget.querySelector<HTMLElement>('[data-accent]')
                    if (bar) bar.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    const bar = e.currentTarget.querySelector<HTMLElement>('[data-accent]')
                    if (bar) bar.style.opacity = '0'
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    data-accent
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, #7C3AED, #A78BFA)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />

                  {/* Icon */}
                  <div className="mb-5 w-10 h-10 rounded-xl bg-purple-core/10 border border-purple-core/20 flex items-center justify-center flex-shrink-0">
                    <problem.icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-[18px] text-white mb-3 leading-snug">
                    {problem.title}
                  </h4>

                  {/* Description */}
                  <p className="font-sans text-[13px] text-grey-light leading-[1.8]">
                    {problem.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
