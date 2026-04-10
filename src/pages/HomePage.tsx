import { Hero } from '../components/sections/Hero'
import { TrustBar } from '../components/sections/TrustBar'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { ProblemSection } from '../components/sections/ProblemSection'
import { HowItWorks } from '../components/sections/HowItWorks'
import { useT } from '../i18n'
import { usePageHead } from '../hooks/usePageHead'

export function HomePage() {
  const t = useT()
  usePageHead({
    title: t.meta.home.title,
    description: t.meta.home.description,
  })
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
