import { Hero } from '../components/sections/Hero'
import { TrustBar } from '../components/sections/TrustBar'
import { ServiceFeatures } from '../components/sections/ServiceFeatures'
import { CtaSection } from '../components/sections/CtaSection'
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
      <ServiceFeatures />
      <CtaSection />
    </>
  )
}
