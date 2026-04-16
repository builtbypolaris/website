import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { useT } from '../../i18n'

export function ResultsShowcase() {
  const t = useT()
  const items = t.resultsShowcase.items

  return (
    <section className="bg-deep py-[100px] relative section-divider-top">
      {/* Atmospheric gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,92,191,0.05)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-16">
          <SectionLabel>{t.resultsShowcase.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            {t.resultsShowcase.titleLine1}{' '}
            <span className="text-purple-glow">{t.resultsShowcase.titleLine2}</span>
          </h2>
          <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
            {t.resultsShowcase.subtitle}
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.15} className="flex flex-col gap-6">
          {items.map((item, i) => (
            <StaggerItem key={item.value}>
              <div className="group relative">
                <div className="relative bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-8 items-start">
                    {/* Left — the value */}
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="font-serif text-[40px] font-light leading-none text-white/15 select-none">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="w-8 h-px bg-gradient-to-r from-purple-core to-transparent mb-2" />
                          <div className="font-sans font-normal text-[11px] tracking-[2px] text-purple-glow uppercase">
                            {item.value}
                          </div>
                        </div>
                      </div>
                      <p className="font-sans font-light text-sm text-grey-light leading-[1.7] max-w-[420px]">
                        {item.valueDescription}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />

                    {/* Right — the proof */}
                    <div className="flex flex-col justify-between h-full">
                      {/* Metric */}
                      <div className="mb-4">
                        <div className="font-serif font-light text-[32px] text-gold leading-none mb-1">
                          {item.metric}
                        </div>
                        <div className="font-sans font-light text-[12px] text-grey-light/70 uppercase tracking-[1px]">
                          {item.metricLabel}
                        </div>
                      </div>

                      {/* Quote */}
                      <blockquote className="border-l-2 border-purple-core/30 pl-4">
                        <p className="font-sans font-light text-sm text-grey-light leading-[1.7] italic">
                          "{item.quote}"
                        </p>
                        <footer className="mt-2 font-sans text-[12px] text-grey-light/60">
                          — {item.attribution}
                        </footer>
                      </blockquote>
                    </div>
                  </div>

                  {/* Bottom glow on hover */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-core/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
