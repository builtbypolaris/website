import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { useT } from '../../i18n'

export function AboutSection() {
  const t = useT()
  const stats = t.aboutSection.stats
  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="mb-16">
          <SectionLabel>{t.aboutSection.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-0 leading-[1.15] max-w-[700px]">
            {t.aboutSection.titleLine1}
            <span className="block text-purple-glow">{t.aboutSection.titleLine2}</span>
          </h2>
        </MotionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Stats - dominant, full width */}
          <MotionReveal direction="right" className="lg:col-span-12">
            <StaggerContainer stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <StaggerItem key={stat.title}>
                  <div className="group relative bg-card border border-border rounded-2xl p-5 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow">
                    <div className="flex items-start gap-3">
                      {/* Number indicator */}
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-core/10 border border-purple-core/20 flex items-center justify-center">
                        <span className="font-sans text-[11px] text-purple-bright font-normal">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-sans font-normal text-[12px] text-gold uppercase tracking-[1.5px] mb-1">
                          {stat.title}
                        </h5>
                        <p className="font-sans font-light text-sm text-grey-light leading-[1.7]">{stat.description}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </MotionReveal>
        </div>
      </Container>
    </section>
  )
}
