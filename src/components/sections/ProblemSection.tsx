import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { problems } from '../../data/problems'

export function ProblemSection() {
  return (
    <section className="bg-deep py-[100px] relative overflow-x-clip section-divider-top">
      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[680px] mb-16">
          <SectionLabel>Why Polaris</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            Most businesses don&rsquo;t have a technology problem.
            <span className="block text-purple-glow">They have a clarity problem.</span>
          </h2>
          <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8] max-w-[560px]">
            They jump to solutions before defining the question. We start with diagnosis, not a sales pitch.
          </p>
        </MotionReveal>

        <StaggerContainer stagger={0.15} className="flex flex-col gap-5">
          {problems.map((problem, i) => (
            <StaggerItem key={problem.title}>
              <div
                className={`group relative ${
                  i === 1 ? 'md:ml-[15%] md:max-w-[75%]' : i === 2 ? 'md:ml-[8%] md:max-w-[82%]' : ''
                }`}
              >
                <div className="relative bg-card border border-border rounded-2xl p-7 transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden">
                  {/* Large decorative quote mark */}
                  <div className="absolute top-4 right-8 font-serif text-[120px] leading-none text-purple-core/[0.07] pointer-events-none select-none">
                    &ldquo;
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-core/10 border border-purple-core/20 flex items-center justify-center">
                      <problem.icon className="w-7 h-7" />
                    </div>

                    {/* Content */}
                    <div className="relative z-[1]">
                      <h4 className="font-serif font-light text-[22px] md:text-[26px] text-white mb-3 leading-snug">
                        {problem.title}
                      </h4>
                      <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8] max-w-[540px]">
                        {problem.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-core/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
