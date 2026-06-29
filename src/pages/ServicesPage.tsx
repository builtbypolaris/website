import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { Constellation } from '../components/ui/Constellation'
import { ServicesBento } from '../components/sections/ServicesBento'
import { useServiceCategories } from '../data/services'
import { useT } from '../i18n'
import { usePageHead } from '../hooks/usePageHead'


export function ServicesPage() {
  const t = useT()
  usePageHead({
    title: t.meta.services.title,
    description: t.meta.services.description,
  })
  const serviceCategories = useServiceCategories()
  const location = useLocation()
  const [activeSlug, setActiveSlug] = useState(serviceCategories[0].slug)

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      const match = serviceCategories.find((s) => s.slug === hash)
      if (match) setActiveSlug(match.slug)
    }
  }, [location.hash, serviceCategories])

  return (
    <div className="pt-[64px]">
      {/* Hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <Constellation />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-core/[0.07] rounded-full blur-[120px]" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[860px] mx-auto text-center">
            <h1 className="font-serif font-black text-[52px] sm:text-[68px] md:text-[84px] lg:text-[96px] text-white leading-[0.92] -tracking-[0.03em] mb-8">
              {t.services.page.titleLine1}<br />
              <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>
                {t.services.page.titleLine2}
              </em>
            </h1>
            <p className="font-sans text-[16px] text-grey-light leading-[1.75] max-w-[480px] mx-auto">
              {t.services.page.subtitle}
            </p>
          </MotionReveal>
        </Container>
      </section>

      <ServicesBento activeSlug={activeSlug} onSelect={setActiveSlug} />
    </div>
  )
}
