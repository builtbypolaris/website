import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'

export function ServicesPage() {
  return (
    <div className="pt-[88px]">
      {/* Services page hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">Services</p>
            <h1 className="font-serif font-light text-[72px] text-white leading-[1.1] mb-6">
              Technology that<br />
              <span className="text-purple-glow">actually works for you.</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              From diagnosis to deployment. One trusted partner for every solution your business needs.
            </p>
          </MotionReveal>
        </Container>
      </section>
      <ServicesGrid />
    </div>
  )
}
