import { Hero } from '../components/sections/Hero'
import { TrustBar } from '../components/sections/TrustBar'
import { ProblemSection } from '../components/sections/ProblemSection'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { HowItWorks } from '../components/sections/HowItWorks'
import { CtaSection } from '../components/sections/CtaSection'

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <ServicesGrid />
      <HowItWorks />
      <CtaSection />
    </>
  )
}
