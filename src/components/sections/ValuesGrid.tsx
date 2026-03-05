import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { values } from '../../data/values'

export function ValuesGrid() {
  return (
    <section className="bg-deep py-[100px] relative overflow-x-clip section-divider-top">
      {/* Atmospheric gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,92,191,0.05)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <MotionReveal className="text-center max-w-[600px] mx-auto mb-16">
          <SectionLabel centered>Our Values</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            What we <span className="text-purple-glow">stand for.</span>
          </h2>
          <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8]">
            Four principles that guide every decision we make.
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {values.map((value, i) => (
            <StaggerItem key={value.number}>
              <div
                className={`group relative h-full ${
                  i % 2 === 1 ? 'md:translate-y-8' : ''
                }`}
              >
                <div className="relative bg-card border border-border rounded-2xl p-7 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                  {/* Large faded number — 64px Cormorant Garamond color #2e2a4a */}
                  <div className="font-serif text-[64px] font-light leading-none text-[#2e2a4a] mb-2 select-none pointer-events-none">
                    {value.number}
                  </div>

                  {/* Accent line */}
                  <div className="w-10 h-px bg-gradient-to-r from-purple-core to-transparent mb-6" />

                  {/* Value word — 13px DM Sans uppercase tracking 2px */}
                  <div className="font-sans font-normal text-[13px] tracking-[2px] text-purple-glow uppercase mb-4">
                    {value.word}
                  </div>

                  {/* Description — 14px DM Sans weight 300 line-height 1.8 */}
                  <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8] relative z-[1] max-w-[400px]">
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
