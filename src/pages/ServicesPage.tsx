import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { WhatsAppButton } from '../components/ui/WhatsAppButton'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'
import { ArrowRight } from '../assets/icons'
import { serviceCategories } from '../data/services'
import { BrowserMockup, PhoneMockup } from '../components/mockups'

export function ServicesPage() {
  const location = useLocation()
  const [activeSlug, setActiveSlug] = useState(serviceCategories[0].slug)

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      const match = serviceCategories.find((s) => s.slug === hash)
      if (match) setActiveSlug(match.slug)
    }
  }, [location.hash])

  const activeCategory = serviceCategories.find((s) => s.slug === activeSlug) ?? serviceCategories[0]

  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">Services</p>
            <h1 className="font-serif font-light text-[32px] sm:text-[48px] md:text-[72px] text-white leading-[1.1] mb-6">
              Discover how we can<br />
              <span className="text-purple-glow">grow your business.</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              From diagnosis to deployment. One trusted partner for every solution your business needs.
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
                  {activeCategory.device === 'phone' ? (
                    <div className="flex justify-center">
                      <PhoneMockup
                        src={activeCategory.illustration}
                        srcs={activeCategory.illustrations}
                        alt={activeCategory.title}
                        className="w-[280px] md:w-[320px]"
                      />
                    </div>
                  ) : (
                    <BrowserMockup
                      src={activeCategory.illustration}
                      alt={activeCategory.title}
                    />
                  )}
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
                <p className="font-sans text-[12px] tracking-[3px] uppercase text-grey mb-6">What's included</p>
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
