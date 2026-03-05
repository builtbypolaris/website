import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { ValuesGrid } from '../components/sections/ValuesGrid'
import { AboutSection } from '../components/sections/AboutSection'

export function AboutPage() {
  return (
    <div className="pt-[72px]">
      {/* About page hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.08)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">About Us</p>
            <h1 className="font-serif font-light text-[72px] text-white leading-[1.1] mb-6">
              Built to bring<br />
              <span className="text-purple-glow">clarity, not complexity.</span>
            </h1>
            <p className="font-sans font-light text-[14px] text-grey-light leading-[1.8] max-w-[540px]">
              We&rsquo;re a diagnostic-first IT consultancy based in Jakarta. We find the real problem before building anything.
            </p>
          </MotionReveal>
        </Container>
      </section>
      <ValuesGrid />
      <AboutSection />
    </div>
  )
}
