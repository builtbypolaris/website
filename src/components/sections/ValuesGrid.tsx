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
    <section className="bg-deep py-[60px] relative section-divider-top">
      <Container>
        <MotionReveal className="max-w-[600px] mb-8">
          <SectionLabel>{t.valuesGrid.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[36px] text-white mb-3 leading-[1.15]">
            {t.valuesGrid.titleLine1} <span className="text-purple-glow">{t.valuesGrid.titleLine2}</span>
          </h2>
          <p className="font-sans font-light text-sm text-grey-light leading-[1.8]">
            {t.valuesGrid.subtitle}
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.08} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((value) => (
            <StaggerItem key={value.number}>
              <div className="group relative h-full">
                <div className="relative bg-card border border-border rounded-xl p-4 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                  {/* Number + Value word */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-serif text-[20px] font-light leading-none text-white/50 select-none">
                      {value.number}
                    </span>
                    <div className="w-4 h-px bg-gradient-to-r from-purple-core to-transparent" />
                    <span className="font-sans font-normal text-[10px] tracking-[2px] text-purple-glow uppercase">
                      {value.word}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-sans font-light text-[13px] text-grey-light leading-[1.6] relative z-[1]">
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
