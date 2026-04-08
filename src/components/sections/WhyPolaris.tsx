import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'

const differentiators = [
  {
    title: 'Diagnostic-first',
    description: 'We start by listening, diagnose the real problem, then build what actually fixes it.',
  },
  {
    title: 'One Relationship',
    description: 'You never re-explain your business to a new person. One team, one partner.',
  },
  {
    title: 'Ongoing Partnership',
    description: 'We grow with you, not just deliver and disappear. Long-term technology partner.',
  },
  {
    title: 'Outcome-driven',
    description: 'We care about your outcome, not just the invoice. Results over revenue.',
  },
  {
    title: 'AI-powered efficiency',
    description: 'We leverage cutting-edge AI to deliver faster, better, and at a fraction of traditional costs.',
  },
]

export function WhyPolaris() {
  return (
    <section className="bg-deep py-[100px] relative section-divider-top">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-14">
          <SectionLabel>Why Polaris</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            What makes us<br />
            <span className="text-purple-glow">different.</span>
          </h2>
        </MotionReveal>

        <StaggerContainer stagger={0.1} className="space-y-4">
          {differentiators.map((item) => (
            <StaggerItem key={item.title}>
              <div className="flex items-start gap-4 py-4 border-b border-border/30 last:border-0">
                <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                <div>
                  <h4 className="font-sans font-medium text-base text-white mb-1">{item.title}</h4>
                  <p className="font-sans font-light text-sm text-grey-light leading-[1.7]">{item.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
