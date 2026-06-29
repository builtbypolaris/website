import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { Button } from '../ui/Button'
import { useT, useLocale, buildLocalePath } from '../../i18n'

export function FeaturedWork() {
  const t = useT()
  const locale = useLocale()
  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      <Container>
        <MotionReveal className="max-w-[600px] mb-14">
          <SectionLabel>{t.featuredWork.sectionLabel}</SectionLabel>
          <h2 className="font-serif text-[40px] sm:text-[52px] md:text-[64px] text-white leading-[1.0]">
            {t.featuredWork.titleLine1}<br />
            <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{t.featuredWork.titleLine2}</em>
          </h2>
          <p className="font-sans text-[14px] text-grey-light mt-4">{t.featuredWork.subtitle}</p>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {t.featuredWork.projects.map((project) => (
              <div
                key={project.name}
                className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 hover:border-purple-core/30 transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-sans text-[11px] font-bold tracking-[2px] uppercase text-purple-glow bg-purple-core/10 px-3 py-1 rounded-full border border-purple-core/20">
                    {project.tag}
                  </span>
                  <span className="font-sans text-[11px] text-grey/40">{project.duration}</span>
                </div>
                <h3 className="font-serif font-bold text-[22px] text-white leading-tight mb-5">
                  {project.name}
                </h3>
                <div className="space-y-2.5">
                  {project.outcomes.map((outcome) => (
                    <div key={outcome} className="flex items-center gap-2.5">
                      <span className="w-1 h-1 rounded-full bg-purple-core flex-shrink-0" />
                      <span className="font-sans text-[13px] text-grey-light">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <Button to={buildLocalePath('/contact', locale)}>{t.featuredWork.cta}</Button>
        </MotionReveal>
      </Container>
    </section>
  )
}
