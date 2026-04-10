import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { useValues } from '../../data/values'
import { useT } from '../../i18n'

export function ValuesGrid() {
  const t = useT()
  const values = useValues()
  return (
    <section className="bg-deep py-[100px] relative section-divider-top">
      {/* Atmospheric gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,92,191,0.05)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-16">
          <SectionLabel>{t.valuesGrid.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            {t.valuesGrid.titleLine1} <span className="text-purple-glow">{t.valuesGrid.titleLine2}</span>
          </h2>
          <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
            {t.valuesGrid.subtitle}
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {values.map((value) => (
            <StaggerItem key={value.number}>
              <div className="group relative h-full">
                <div className="relative bg-card border border-border rounded-2xl p-5 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                  {/* Large faded number */}
                  <div className="font-serif text-[44px] font-light leading-none text-white/15 mb-2 select-none pointer-events-none">
                    {value.number}
                  </div>

                  {/* Accent line */}
                  <div className="w-8 h-px bg-gradient-to-r from-purple-core to-transparent mb-4" />

                  {/* Value word */}
                  <div className="font-sans font-normal text-[11px] tracking-[2px] text-purple-glow uppercase mb-3">
                    {value.word}
                  </div>

                  {/* Description */}
                  <p className="font-sans font-light text-sm text-grey-light leading-[1.7] relative z-[1] max-w-[400px]">
                    {value.description}
                  </p>

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
