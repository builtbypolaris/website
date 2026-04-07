import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { WhatsAppButton } from '../components/ui/WhatsAppButton'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'
import { ArrowRight } from '../assets/icons'
import { serviceCategories } from '../data/services'

export function ServicesPage() {
  const location = useLocation()
  const [activeSlug, setActiveSlug] = useState(serviceCategories[0].slug)

  // Handle hash navigation (e.g. /services#seo-content-creation)
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
            <h1 className="font-serif font-light text-[48px] md:text-[72px] text-white leading-[1.1] mb-6">
              Discover how we can<br />
              <span className="text-purple-glow">grow your business.</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              From diagnosis to deployment. One trusted partner for every solution your business needs.
            </p>
          </MotionReveal>
        </Container>
      </section>

      {/* Category tabs + content */}
      <section className="bg-surface py-[80px] relative section-divider-top">
        <Container>
          {/* Tab bar — single scrollable line */}
          <div className="flex overflow-x-auto mb-12 border-b border-border/40 scrollbar-hidden">
            {serviceCategories.map((cat) => {
              const isActive = cat.slug === activeSlug
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`relative px-3 py-3 font-sans text-[11px] tracking-[1.5px] uppercase transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-grey hover:text-white/80'
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

          {/* Active category content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Category header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                <div className="max-w-[600px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <activeCategory.icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-serif font-light text-[36px] text-white leading-[1.2]">
                      {activeCategory.title}
                    </h2>
                  </div>
                  <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
                    {activeCategory.description}
                  </p>
                </div>
                <WhatsAppButton message={activeCategory.whatsappMessage} className="flex-shrink-0" />
              </div>

              {/* Sub-service cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCategory.subServices.map((sub, i) => (
                  <motion.div
                    key={sub.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="group bg-card border border-border/60 rounded-2xl p-6 h-full transition-all duration-500 hover:border-gold/40 hover:bg-card-hover card-glow flex flex-col">
                      <h4 className="font-sans font-normal text-base text-white mb-2">
                        {sub.name}
                      </h4>
                      <p className="font-sans font-light text-sm text-grey-light leading-[1.7] flex-1">
                        {sub.description}
                      </p>
                      <a
                        href={`https://wa.me/6281946494333?text=${encodeURIComponent(activeCategory.whatsappMessage.replace('services', sub.name))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 font-sans text-[13px] text-gold/60 tracking-wide group-hover:text-gold transition-colors duration-200 inline-flex items-center gap-1.5"
                      >
                        {activeCategory.ctaLabel}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </Container>
      </section>
    </div>
  )
}
