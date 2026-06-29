import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useServiceCategories } from '../../data/services'
import { useT, useLocale, buildLocalePath } from '../../i18n'
import { VideoWithPoster } from '../ui/VideoWithPoster'
import { SEODashboard } from '../mockups/SEODashboard'
import { CRMDashboard } from '../mockups/CRMDashboard'
import { PackagesDashboard } from '../mockups/PackagesDashboard'
import { MobileAppMockup } from '../mockups/MobileAppMockup'
import { AnimatedSocialMedia } from '../mockups/AnimatedSocialMedia'

const GRADIENTS: Record<string, string> = {
  'website-development':    'linear-gradient(135deg, #F97316 0%, #FB923C 18%, #EC4899 48%, #A855F7 75%, #7C3AED 100%)',
  'application-development':'linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #A855F7 100%)',
  'seo-content-creation':   'linear-gradient(135deg, #065F46 0%, #059669 30%, #10B981 65%, #34D399 100%)',
  'content-creation':       'linear-gradient(135deg, #EA580C 0%, #F97316 20%, #EC4899 52%, #A855F7 78%, #7C3AED 100%)',
  'business-operation':     'linear-gradient(135deg, #1E3A8A 0%, #2563EB 40%, #38BDF8 100%)',
  'others':                 'linear-gradient(135deg, #1F2937 0%, #374151 40%, #6B7280 100%)',
  'packages':               'linear-gradient(135deg, #78350F 0%, #B45309 40%, #F59E0B 100%)',
}

const SHOWCASES: Record<string, { type: 'video' | 'component'; src?: string; component?: 'seo' | 'crm' | 'packages' | 'mobile-app' | 'social-media' }> = {
  'website-development':    { type: 'video',     src: '/videos/stevia-cookies.mp4' },
  'seo-content-creation':   { type: 'component', component: 'seo' },
  'content-creation':       { type: 'component', component: 'social-media' },
  'business-operation':     { type: 'component', component: 'crm' },
  'application-development':{ type: 'component', component: 'mobile-app' },
  'others':                 { type: 'video',     src: '/videos/mak-gien-invitation.mp4' },
  'packages':               { type: 'component', component: 'packages' },
}

const WA_HEALTH_CHECK = `https://wa.me/6285190846591?text=${encodeURIComponent('Hi Polaris, can I get a free healthcheck for my business?')}`

function SubRow({ index, sub, activeSlug }: { index: number; sub: { name: string; description: string }; activeSlug: string; whatsappMessage: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [activeSlug])

  return (
    <div className={`border-b border-[#09090F]/10 transition-colors duration-200 ${open ? 'bg-[#7C3AED]/[0.03]' : 'hover:bg-[#09090F]/[0.02]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-5 py-6 px-2 text-left group cursor-pointer"
      >
        <span className="font-sans text-[11px] font-bold tracking-[1px] text-[#7C3AED]/70 w-6 flex-shrink-0 tabular-nums">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-serif text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#09090F] flex-1 leading-tight">
          {sub.name}
        </span>
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 text-[18px] font-light leading-none ${
            open
              ? 'border-[#7C3AED] text-[#7C3AED] bg-[#7C3AED]/10'
              : 'border-[#09090F]/20 text-[#09090F]/50 group-hover:border-[#7C3AED]/50 group-hover:text-[#7C3AED]'
          }`}
          style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s ease, color 0.2s, border-color 0.2s, background 0.2s' }}
        >
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-11 pb-7 pr-14 flex flex-col sm:flex-row sm:items-end gap-5">
              <p className="font-sans text-[15px] text-[#09090F]/60 leading-[1.85] flex-1 max-w-[560px]">
                {sub.description}
              </p>
              <a
                href={`https://wa.me/6285190846591?text=${encodeURIComponent(`Hi Polaris! I'm interested in ${sub.name}. Can we discuss?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#09090F] text-white font-sans text-[13px] font-semibold hover:bg-[#7C3AED] transition-colors duration-300 whitespace-nowrap"
              >
                Enquire →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props {
  activeSlug: string
  onSelect: (slug: string) => void
}

export function ServicesBento({ activeSlug, onSelect }: Props) {
  const serviceCategories = useServiceCategories()
  const t = useT()
  const locale = useLocale()

  const activeCategory = serviceCategories.find((c) => c.slug === activeSlug) ?? serviceCategories[0]
  const gradient = GRADIENTS[activeSlug] ?? GRADIENTS['website-development']
  const override = SHOWCASES[activeSlug]

  function renderContent() {
    // Phone services — centered phone frame on dark bg
    if (activeCategory.device === 'phone') {
      return (
        <div className="w-full h-full bg-[#0d0d14] flex items-center justify-center">
          <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] h-[420px] aspect-[9/19.5]">
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
            <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
            <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
            <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
            <div className="relative rounded-[1.6rem] sm:rounded-[2.55rem] overflow-hidden ring-1 ring-black/80 h-full">
              {override?.type === 'component' && (
                <div className="absolute inset-0 origin-top-left w-[250%] h-[250%] scale-[0.4] sm:w-[200%] sm:h-[200%] sm:scale-50 md:w-full md:h-full md:scale-100">
                  {override.component === 'mobile-app' && <MobileAppMockup key={activeSlug} />}
                  {override.component === 'social-media' && <AnimatedSocialMedia />}
                </div>
              )}
              {override?.type === 'video' && (
                <VideoWithPoster src={override.src!} className="h-full aspect-[9/19.5] object-cover" />
              )}
              {!override && (
                <img src={activeCategory.illustration} alt={activeCategory.title} className="h-full object-cover" />
              )}
              <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
            </div>
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      )
    }

    // Laptop services — fill the panel directly (no device chrome)
    if (override?.type === 'video') {
      return <VideoWithPoster src={override.src!} className="w-full h-full object-cover block" />
    }

    if (override?.type === 'component') {
      return (
        <div className="w-full h-full overflow-hidden">
          {override.component === 'seo' && <SEODashboard key={activeSlug} />}
          {override.component === 'crm' && <CRMDashboard key={activeSlug} />}
          {override.component === 'packages' && <PackagesDashboard key={activeSlug} />}
        </div>
      )
    }

    // Fallback
    return <img src={activeCategory.illustration} alt={activeCategory.title} className="w-full h-full object-cover" />
  }

  return (
    <section className="bg-[#F5F4F2] py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">

        <div className="mb-10 flex items-end justify-between">
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, color: '#09090F' }}>
            {t.servicesBento.titleLine1}<br />
            <em style={{ fontStyle: 'italic', color: '#7C3AED', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>
              {t.servicesBento.titleLine2}
            </em>
          </h2>
          <Link to={buildLocalePath('/services', locale)} className="hidden md:block font-sans text-sm text-[#09090F]/30 hover:text-[#09090F]/70 transition-colors duration-200">
            {t.servicesBento.seeAll} →
          </Link>
        </div>

        <div className="flex overflow-x-auto border-b border-[#09090F]/10 mb-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {serviceCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onSelect(cat.slug)}
              className={`relative flex items-center gap-2 px-5 py-4 font-sans text-[15px] font-bold whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                activeSlug === cat.slug
                  ? 'text-[#09090F]'
                  : 'text-[#09090F]/35 hover:text-[#09090F]/65'
              }`}
            >
              {cat.title}
              {activeSlug === cat.slug && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#09090F] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Gradient panel */}
        <div
          className="rounded-2xl overflow-hidden mt-0"
          style={{ background: gradient, padding: '20px', position: 'relative', isolation: 'isolate' }}
        >
          {/* SVG grain */}
          <svg
            aria-hidden
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, mixBlendMode: 'soft-light', opacity: 0.6 }}
          >
            <filter id="grain-f" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" />
            </filter>
            <rect x="0" y="0" width="100%" height="100%" filter="url(#grain-f)" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="rounded-xl overflow-hidden"
              style={{ height: 560, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sub-service accordion rows */}
        <div className="mt-10 border-t border-[#09090F]/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug + '-rows'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeCategory.subServices.map((sub, i) => (
                <SubRow key={sub.name} index={i + 1} sub={sub} activeSlug={activeSlug} whatsappMessage={activeCategory.whatsappMessage} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Section CTA */}
        <div className="mt-12 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="font-sans text-[11px] font-bold tracking-[3px] uppercase text-[#7C3AED] mb-3">Free Diagnostic</p>
            <h3 className="font-serif font-bold text-[28px] sm:text-[34px] text-[#09090F] leading-[1.1] mb-3">
              Not sure where<br className="hidden sm:block" /> to start?
            </h3>
            <p className="font-sans text-[14px] text-[#09090F]/50 leading-[1.75] max-w-[380px]">
              Book a free Business Health Check and we'll tell you exactly what to focus on.
            </p>
          </div>
          <a
            href={WA_HEALTH_CHECK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-[#09090F] text-white font-sans text-[14px] font-semibold rounded-full hover:bg-[#7C3AED] transition-colors duration-300 self-start md:self-center"
          >
            Get Your Free Health Check
          </a>
        </div>

        <div className="mt-10 md:hidden text-center">
          <Link to={buildLocalePath('/services', locale)} className="font-sans text-sm text-[#09090F]/40 hover:text-[#09090F]/70 transition-colors">
            {t.servicesBento.seeAll} →
          </Link>
        </div>
      </div>
    </section>
  )
}
