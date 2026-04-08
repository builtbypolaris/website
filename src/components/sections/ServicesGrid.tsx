import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { ArrowRight } from '../../assets/icons'
import { SEODashboard } from '../mockups/SEODashboard'
import { CRMDashboard } from '../mockups/CRMDashboard'

const showcases = [
  {
    tab: 'Website',
    title: 'Website Development',
    tagline: 'Your digital storefront, built right. Fast, secure, and scalable.',
    video: '/videos/stevia-cookies.mp4',
    device: 'laptop' as const,
    slug: 'website-development',
  },
  {
    tab: 'SEO & Content',
    title: 'SEO & Content Creation',
    tagline: 'Your brand\'s visibility, powered by AI and guided by strategy.',
    component: 'seo' as const,
    device: 'laptop' as const,
    slug: 'seo-content-creation',
  },
  {
    tab: 'Business Operation',
    title: 'Business Operation',
    tagline: 'Your back-office, digitized. Run your business from one place.',
    component: 'crm' as const,
    device: 'laptop' as const,
    slug: 'business-operation',
  },
  {
    tab: 'Invitation',
    title: 'Others & Custom Solutions',
    tagline: 'If you can describe the problem, we can build the solution.',
    video: '/videos/mak-gien-invitation.mp4',
    device: 'phone' as const,
    slug: 'others',
  },
]

export function ServicesGrid() {
  const [active, setActive] = useState(0)
  const current = showcases[active]

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % showcases.length)
  }, [])

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + showcases.length) % showcases.length)
  }, [])

  // Auto-advance
  useEffect(() => {
    const timeout = setTimeout(goNext, 8000)
    return () => clearTimeout(timeout)
  }, [active, goNext])

  // Preload all videos on mount
  useEffect(() => {
    showcases.forEach((s) => {
      if (s.video) {
        const v = document.createElement('video')
        v.preload = 'auto'
        v.src = s.video
      }
    })
  }, [])

  return (
    <section className="bg-surface py-[100px] relative section-divider-top overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-10">
          <SectionLabel>What We Build</SectionLabel>
          <h2 className="font-serif font-light text-[32px] sm:text-[40px] md:text-[48px] text-white mb-5 leading-[1.15]">
            One partner.<br />
            <span className="text-purple-glow">Every solution.</span>
          </h2>
        </MotionReveal>

        {/* Tabs */}
        <MotionReveal className="mb-8">
          <div className="flex overflow-x-auto border-b border-border/40 scrollbar-hidden">
            {showcases.map((s, i) => (
              <button
                key={s.tab}
                onClick={() => setActive(i)}
                className={`relative px-3 sm:px-4 py-3 font-sans text-[11px] sm:text-[12px] tracking-[1px] sm:tracking-[1.5px] uppercase transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  i === active ? 'text-white font-medium' : 'text-grey hover:text-white/80'
                }`}
              >
                {s.tab}
                {i === active && (
                  <motion.div
                    layoutId="showcaseTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-glow to-gold"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </MotionReveal>

        {/* Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Device showcase */}
              <div className="w-full lg:w-[62%] relative">
                {/* Arrows */}
                <button
                  onClick={goPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card/80 border border-border/40 flex items-center justify-center text-grey hover:text-white hover:border-gold/40 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card/80 border border-border/40 flex items-center justify-center text-grey hover:text-white hover:border-gold/40 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 sm:w-4 sm:h-4" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {current.device === 'laptop' ? (
                  <div className="relative">
                    <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                      <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
                        {current.video ? (
                          <video key={current.video} muted playsInline autoPlay loop className="w-full aspect-[16/10] object-cover bg-white block">
                            <source src={current.video} type="video/mp4" />
                          </video>
                        ) : current.component === 'seo' ? (
                          <div className="w-full aspect-[16/10] overflow-hidden">
                            <SEODashboard key={active} />
                          </div>
                        ) : current.component === 'crm' ? (
                          <div className="w-full aspect-[16/10] overflow-hidden">
                            <CRMDashboard key={active} />
                          </div>
                        ) : null}
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
                ) : (
                  <div className="flex justify-center">
                    <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_40px_120px_rgba(0,0,0,0.5)] w-[180px] sm:w-[240px] md:w-[280px]">
                      <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
                      <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
                      <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
                      <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
                      <div className="relative rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80">
                        {current.video && (
                          <video key={current.video} muted playsInline autoPlay loop className="w-full aspect-[9/19.5] object-cover">
                            <source src={current.video} type="video/mp4" />
                          </video>
                        )}
                        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
                      </div>
                      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="w-full lg:w-[38%]">
                <h3 className="font-serif font-light text-[24px] sm:text-[28px] md:text-[32px] text-white mb-3 leading-[1.2]">
                  {current.title}
                </h3>
                <p className="font-sans font-light text-base text-grey-light leading-[1.8] mb-6 max-w-[400px]">
                  {current.tagline}
                </p>
                <Link
                  to={`/services#${current.slug}`}
                  className="inline-flex items-center gap-2 font-sans text-sm text-gold hover:text-gold-soft transition-colors duration-200 group/link"
                >
                  Explore {current.tab}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <MotionReveal delay={0.2} className="mt-14 flex flex-col items-center gap-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-sans text-base text-purple-glow hover:text-purple-bright transition-colors duration-200 group/all"
          >
            See all services
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/all:translate-x-1" />
          </Link>
          <WhatsAppButton message="Hi Polaris! I'm interested in learning more about your services. Can we chat?" />
        </MotionReveal>
      </Container>
    </section>
  )
}
