import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { VideoWithPoster } from '../ui/VideoWithPoster'
import { SEODashboard } from '../mockups/SEODashboard'
import { CRMDashboard } from '../mockups/CRMDashboard'
import { MobileAppMockup } from '../mockups/MobileAppMockup'
import { useT } from '../../i18n'

const SHOWCASE = [
  { type: 'video' as const, device: 'laptop' as const, src: '/videos/stevia-cookies.mp4' },
  { type: 'video' as const, device: 'laptop' as const, src: '/videos/mulia-plastik.mp4' },
  { type: 'video' as const, device: 'laptop' as const, src: '/videos/posyandu.mp4' },
  { type: 'video' as const, device: 'laptop' as const, src: '/videos/adhd-productivity.mp4' },
  { type: 'component' as const, device: 'phone' as const, component: 'mobile-app' as const },
  { type: 'component' as const, device: 'laptop' as const, component: 'crm' as const },
  { type: 'component' as const, device: 'laptop' as const, component: 'seo' as const },
  { type: 'video' as const, device: 'laptop' as const, src: '/videos/javanese-emotion.mp4' },
  { type: 'video' as const, device: 'phone' as const, src: '/videos/mak-gien-invitation.mp4' },
]

const ease = [0.22, 1, 0.36, 1] as const

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
        <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
          {children}
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

function PhoneFrame({ children, hasAspect }: { children: React.ReactNode; hasAspect?: boolean }) {
  return (
    <div className="flex justify-center">
      <div className={`relative rounded-[2rem] sm:rounded-[3rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-[350px] sm:h-[400px] md:h-[460px] ${hasAspect ? 'aspect-[9/19.5]' : ''}`}>
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
        <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
        <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
        <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />
        <div className="relative rounded-[1.6rem] sm:rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80 h-full">
          {children}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
        </div>
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export function WorkShowcase() {
  const t = useT()
  const projects = t.workShowcase.projects
  const [current, setCurrent] = useState(0)

  const go = useCallback(
    (dir: -1 | 1) => {
      setCurrent((prev) => (prev + dir + projects.length) % projects.length)
    },
    [projects.length],
  )

  const project = projects[current]
  const showcase = SHOWCASE[current]

  function renderDevice() {
    if (showcase.device === 'phone' && showcase.type === 'video') {
      return (
        <PhoneFrame>
          <VideoWithPoster src={showcase.src!} className="h-full aspect-[9/19.5] object-cover" />
        </PhoneFrame>
      )
    }

    if (showcase.device === 'phone' && showcase.type === 'component') {
      return (
        <PhoneFrame hasAspect>
          <div className="absolute inset-0 origin-top-left w-[250%] h-[250%] scale-[0.4] sm:w-[200%] sm:h-[200%] sm:scale-50 md:w-full md:h-full md:scale-100">
            {showcase.component === 'mobile-app' && <MobileAppMockup key={current} />}
          </div>
        </PhoneFrame>
      )
    }

    if (showcase.type === 'video') {
      return (
        <LaptopFrame>
          <VideoWithPoster src={showcase.src!} className="w-full aspect-[16/10] object-cover block" />
        </LaptopFrame>
      )
    }

    // Laptop with component
    return (
      <LaptopFrame>
        <div className="w-full aspect-[16/10] overflow-hidden relative">
          <div className="absolute inset-0 origin-top-left w-[200%] h-[200%] scale-50 lg:w-[140%] lg:h-[140%] lg:scale-[0.714]">
            {showcase.component === 'seo' ? <SEODashboard key={current} /> : <CRMDashboard key={current} />}
          </div>
        </div>
      </LaptopFrame>
    )
  }

  return (
    <section className="bg-void py-[100px] relative section-divider-top">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-16">
          <SectionLabel>{t.workShowcase.sectionLabel}</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            {t.workShowcase.titleLine1}{' '}
            <span className="text-purple-glow">{t.workShowcase.titleLine2}</span>
          </h2>
          <p className="font-sans font-light text-base text-grey-light leading-[1.8]">
            {t.workShowcase.subtitle}
          </p>
        </MotionReveal>

        {/* Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="flex flex-col items-center gap-8">
              {/* Device mockup — constrained width */}
              <motion.div
                className="w-full max-w-[560px] mx-auto"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
              >
                {renderDevice()}
              </motion.div>

              {/* Caption */}
              <div className="text-center">
                <span className="font-sans text-[10px] font-normal tracking-[2px] uppercase text-purple-bright bg-purple-core/10 border border-purple-core/20 rounded-full px-3 py-1">
                  {project.service}
                </span>
                <h3 className="font-serif font-light text-[24px] text-white leading-[1.3] mt-3">
                  {project.title}
                </h3>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {/* Dots */}
          <div className="flex gap-2">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-purple-core w-6'
                    : 'bg-white/20 hover:bg-white/40 w-2'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-3">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-grey-light hover:border-purple-core/50 hover:text-white transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => go(1)}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-grey-light hover:border-purple-core/50 hover:text-white transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
