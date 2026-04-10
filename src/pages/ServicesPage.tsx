import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { WhatsAppButton } from '../components/ui/WhatsAppButton'
import { VideoWithPoster } from '../components/ui/VideoWithPoster'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'
import { ArrowRight } from '../assets/icons'
import { useServiceCategories } from '../data/services'
import { BrowserMockup } from '../components/mockups'
import { SEODashboard } from '../components/mockups/SEODashboard'
import { CRMDashboard } from '../components/mockups/CRMDashboard'
import { PackagesDashboard } from '../components/mockups/PackagesDashboard'
import { MobileAppMockup } from '../components/mockups/MobileAppMockup'
import { useT } from '../i18n'
import { usePageHead } from '../hooks/usePageHead'

const showcaseOverrides: Record<string, { type: 'video' | 'component'; src?: string; component?: 'seo' | 'crm' | 'packages' | 'mobile-app' }> = {
  'website-development': { type: 'video', src: '/videos/stevia-cookies.mp4' },
  'seo-content-creation': { type: 'component', component: 'seo' },
  'business-operation': { type: 'component', component: 'crm' },
  'application-development': { type: 'component', component: 'mobile-app' },
  'others': { type: 'video', src: '/videos/mak-gien-invitation.mp4' },
  'packages': { type: 'component', component: 'packages' },
}

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

  const activeCategory = serviceCategories.find((s) => s.slug === activeSlug) ?? serviceCategories[0]

  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">{t.services.page.eyebrow}</p>
            <h1 className="font-serif font-light text-[32px] sm:text-[48px] md:text-[72px] text-white leading-[1.1] mb-6">
              {t.services.page.titleLine1}<br />
              <span className="text-purple-glow">{t.services.page.titleLine2}</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              {t.services.page.subtitle}
            </p>
          </MotionReveal>
        </Container>
      </section>

      {/* Tabs + content */}
      <section className="bg-surface py-[80px] relative section-divider-top overflow-hidden">
        <Container>
          {/* Tab bar */}
          <div className="flex overflow-x-auto mb-16 border-b border-border/40 scrollbar-hidden">
            {serviceCategories.map((cat) => {
              const isActive = cat.slug === activeSlug
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`relative px-3 py-3 font-sans text-[11px] tracking-[1.5px] uppercase transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive ? 'text-white font-medium' : 'text-grey hover:text-white/80'
                  }`}
                >
                  {cat.title}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-glow to-gold"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Hero showcase — big real image in device frame */}
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-16">
                {/* Device mockup */}
                <motion.div
                  className="w-full lg:w-[58%]"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {(() => {
                    const override = showcaseOverrides[activeCategory.slug]

                    // Phone device with component override
                    if (activeCategory.device === 'phone' && override?.type === 'component') {
                      return (
                        <div className="flex justify-center">
                          <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-[350px] sm:h-[400px] md:h-[460px] aspect-[9/19.5]">
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
                            <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
                            <div className="relative rounded-[1.6rem] sm:rounded-[2.55rem] overflow-hidden ring-1 ring-black/80 h-full">
                              <div className="absolute inset-0 origin-top-left w-[250%] h-[250%] scale-[0.4] sm:w-[200%] sm:h-[200%] sm:scale-50 md:w-full md:h-full md:scale-100">
                                {override.component === 'mobile-app' && <MobileAppMockup key={activeSlug} />}
                              </div>
                              <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
                            </div>
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                          </div>
                        </div>
                      )
                    }

                    // Phone device with video override
                    if (activeCategory.device === 'phone' && override?.type === 'video') {
                      return (
                        <div className="flex justify-center">
                          <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-[350px] sm:h-[400px] md:h-[460px]">
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
                            <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
                            <div className="relative rounded-[1.6rem] sm:rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80 h-full">
                              <VideoWithPoster src={override.src!} className="h-full aspect-[9/19.5] object-cover" />
                              <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
                            </div>
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                          </div>
                        </div>
                      )
                    }

                    // Laptop with video override
                    if (override?.type === 'video') {
                      return (
                        <div className="relative overflow-hidden">
                          <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                            <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
                              <VideoWithPoster src={override.src!} className="w-full aspect-[16/10] object-cover block" />
                            </div>
                          </div>
                          <div className="h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
                          <div className="relative mx-auto w-[94%]">
                            <div className="h-[8px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                          </div>
                          <div className="relative mx-auto w-[108%] -ml-[4%]">
                            <div className="h-[14px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                              <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
                            </div>
                          </div>
                          <div className="absolute top-0 left-0 right-0 h-[50%] rounded-t-xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                        </div>
                      )
                    }

                    // Laptop with animated component override
                    if (override?.type === 'component') {
                      return (
                        <div className="relative overflow-hidden">
                          <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                            <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
                              <div className="w-full aspect-[16/10] overflow-hidden relative">
                                <div className="absolute inset-0 origin-top-left w-[200%] h-[200%] scale-50 lg:w-[140%] lg:h-[140%] lg:scale-[0.714]">
                                  {override.component === 'seo' ? <SEODashboard key={activeSlug} /> : override.component === 'crm' ? <CRMDashboard key={activeSlug} /> : <PackagesDashboard key={activeSlug} />}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
                          <div className="relative mx-auto w-[94%]">
                            <div className="h-[8px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                          </div>
                          <div className="relative mx-auto w-[108%] -ml-[4%]">
                            <div className="h-[14px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                              <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
                            </div>
                          </div>
                          <div className="absolute top-0 left-0 right-0 h-[50%] rounded-t-xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                        </div>
                      )
                    }

                    // Fallback: phone with fixed height matching laptop
                    if (activeCategory.device === 'phone') {
                      return (
                        <div className="flex justify-center">
                          <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-[350px] sm:h-[400px] md:h-[460px]">
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
                            <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
                            <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
                            <div className="relative rounded-[1.6rem] sm:rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80 h-full">
                              <img
                                src={activeCategory.illustration}
                                alt={activeCategory.title}
                                className="h-full aspect-[9/19.5] object-cover"
                              />
                              <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
                            </div>
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                          </div>
                        </div>
                      )
                    }
                    return (
                      <BrowserMockup
                        src={activeCategory.illustration}
                        alt={activeCategory.title}
                      />
                    )
                  })()}
                </motion.div>

                {/* Description */}
                <div className="w-full lg:w-[42%]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <activeCategory.icon className="w-6 h-6" />
                    </div>
                    <h2 className="font-serif font-light text-[28px] sm:text-[36px] text-white leading-[1.2]">
                      {activeCategory.title}
                    </h2>
                  </div>
                  <p className="font-sans font-light text-base text-grey-light leading-[1.8] mb-8 max-w-[480px]">
                    {activeCategory.description}
                  </p>
                  <WhatsAppButton message={activeCategory.whatsappMessage} />
                </div>
              </div>

              {/* Sub-services */}
              <div>
                <p className="font-sans text-[12px] tracking-[3px] uppercase text-grey mb-6">{t.services.page.whatsIncluded}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeCategory.subServices.map((sub, i) => (
                    <motion.div
                      key={sub.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden h-full transition-all duration-500 hover:border-gold/40 hover:bg-card-hover card-glow flex flex-col">
                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="font-sans font-normal text-base text-white mb-2">
                            {sub.name}
                          </h4>
                          <p className="font-sans font-light text-sm text-grey-light leading-[1.7] flex-1">
                            {sub.description}
                          </p>
                          <a
                            href={`https://wa.me/6281946494333?text=${encodeURIComponent(`Hi Polaris! I'm interested in ${sub.name}. Can we discuss?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 font-sans text-[13px] text-gold/60 tracking-wide group-hover:text-gold transition-colors duration-200 inline-flex items-center gap-1.5"
                          >
                            {activeCategory.ctaLabel}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Container>
      </section>
    </div>
  )
}
