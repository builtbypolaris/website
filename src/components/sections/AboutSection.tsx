import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import type { StatBox } from '../../types'

const stats: StatBox[] = [
  { title: 'Diagnostic-first', description: 'We start by listening, diagnose the real problem, then build what actually fixes it.' },
  { title: 'One Relationship', description: 'You never re-explain your business to a new person.' },
  { title: 'Ongoing Partnership', description: 'We grow with you, not just deliver and disappear.' },
  { title: 'All-female team', description: 'Indonesia-based, genuinely invested in your growth.' },
  { title: 'Outcome-driven', description: 'We care about your outcome, not just the invoice.' },
  { title: 'AI-powered efficiency', description: 'We leverage cutting-edge AI to deliver faster and better.' },
]

export function AboutSection() {
  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="mb-16">
          <SectionLabel>About Polaris</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-0 leading-[1.15] max-w-[700px]">
            Indonesia&rsquo;s diagnostic-first
            <span className="block text-purple-glow">technology consultancy.</span>
          </h2>
        </MotionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Story - left column with padding-right 60px */}
          <MotionReveal direction="left" className="lg:col-span-7 lg:pr-[60px]">
            {/* Pull quote */}
            <div className="relative pl-8 border-l-2 border-gold/40 mb-10">
              <p className="font-serif text-[24px] md:text-[28px] text-white/90 leading-[1.4] font-light">
                Too many Indonesian businesses were getting sold technology they didn&rsquo;t need.
              </p>
            </div>

            <div className="space-y-6">
              <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
                Expensive websites that didn&rsquo;t drive revenue. Automation that automated the wrong things. Tools that created more confusion than clarity.
              </p>
              <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
                We&rsquo;re different: we start by listening, diagnose the real problem, then build what actually fixes it. We&rsquo;re all-female, Indonesia-based, and genuinely invested in your growth.
              </p>
              <p className="font-sans font-light text-base text-white/80 leading-[1.8]">
                When you work with Polaris, you get a partner who cares about your outcome &mdash; not just the invoice.
              </p>
            </div>
          </MotionReveal>

          {/* Stats - right column */}
          <MotionReveal direction="right" className="lg:col-span-5">
            <StaggerContainer stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
