import { Hero } from '../components/sections/Hero'
import { TrustBar } from '../components/sections/TrustBar'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { ProblemSection } from '../components/sections/ProblemSection'
import { HowItWorks } from '../components/sections/HowItWorks'

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <ProblemSection />
      <HowItWorks />
    </>
  )
}
