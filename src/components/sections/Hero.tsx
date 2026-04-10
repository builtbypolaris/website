import { motion } from 'motion/react'
import { Button } from '../ui/Button'
import { VideoWithPoster } from '../ui/VideoWithPoster'
import { ConstellationCanvas } from '../canvas/ConstellationCanvas'
import { StarMascot } from '../canvas/StarMascot'
import { useT, useLocale, buildLocalePath } from '../../i18n'

const cascade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export function Hero() {
  const t = useT()
  const locale = useLocale()
  return (
    <section className="min-h-screen relative bg-void overflow-hidden pt-[88px] flex items-center">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.10)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_70%)] pointer-events-none" />

      <ConstellationCanvas />
      {/* Star mascot hidden on mobile so it doesn't overlap devices */}
      <div className="hidden sm:block">
        <StarMascot />
      </div>

      <div className="relative z-[2] w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-6 py-8 lg:py-12">
        {/* Text */}
        <div className="w-full lg:w-[45%] text-center lg:text-left">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="inline-flex items-center gap-2 sm:gap-3 mb-5 sm:mb-7 px-3 sm:px-5 py-2 border border-border/60 rounded-full"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-core shadow-[0_0_8px_rgba(124,92,191,0.6)]" />
            <span className="text-[10px] sm:text-[12px] text-grey-light tracking-[2px] sm:tracking-[3px] uppercase font-sans">{t.hero.badge}</span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="font-serif font-light text-[42px] sm:text-[48px] md:text-[56px] lg:text-[68px] text-white mb-4 sm:mb-6 -tracking-[1px] leading-[1.08]"
          >
            {t.hero.titleLine1}<br />
            {t.hero.titleLine2}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow via-purple-bright to-gold">{t.hero.titleLine3}</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="font-sans font-light text-[13px] sm:text-[14px] text-grey-light max-w-[440px] mx-auto lg:mx-0 mb-6 sm:mb-8 leading-[1.75]"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="flex gap-3 sm:gap-4 flex-wrap justify-center lg:justify-start"
          >
            <Button to={buildLocalePath('/contact', locale)}>{t.hero.ctaPrimary}</Button>
            <Button variant="ghost" to={buildLocalePath('/services', locale)}>{t.hero.ctaSecondary}</Button>
          </motion.div>
        </div>

        {/* Devices — stacked on mobile, side by side on desktop */}
        <motion.div
          className="w-full lg:w-[55%] flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 sm:gap-5 lg:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Laptop */}
          <div className="w-full sm:flex-1 overflow-hidden">
            <div className="relative">
              <div className="bg-[#1e1e22] rounded-t-lg sm:rounded-t-xl pt-2 sm:pt-3 px-2 sm:px-3 pb-2 sm:pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                <div className="absolute top-[4px] sm:top-[6px] left-1/2 -translate-x-1/2 w-[4px] sm:w-[5px] h-[4px] sm:h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                <div className="rounded-[3px] sm:rounded-[4px] overflow-hidden ring-1 ring-black/50">
                  <VideoWithPoster
                    src="/videos/stevia-cookies.mp4"
                    className="w-[500px] h-[240px] sm:h-[280px] lg:h-[270px] object-cover block"
                  />
                </div>
              </div>
              <div className="h-[3px] sm:h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
              <div className="relative mx-auto w-[94%]">
                <div className="h-[5px] sm:h-[7px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm" />
              </div>
              <div className="relative mx-auto w-[108%] -ml-[4%]">
                <div className="h-[8px] sm:h-[12px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <div className="absolute bottom-[1px] sm:bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
                </div>
              </div>
            </div>
            <p className="font-sans font-medium text-[11px] sm:text-[13px] text-gold uppercase tracking-[2px] mt-3 sm:mt-4 text-center sm:text-left">{t.hero.laptopLabel}</p>
            <p className="font-sans font-light text-[10px] sm:text-[12px] text-grey-light mt-0.5 text-center sm:text-left">{t.hero.laptopSubLabel}</p>
          </div>

          {/* Phone — height matched to laptop */}
          <div className="flex-shrink-0">
            <div className="relative rounded-[2.2rem] sm:rounded-[2.5rem] bg-[#2c2c2e] p-[4px] sm:p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-[280px] sm:h-[280px] lg:h-[340px]">
              <div className="absolute inset-0 rounded-[2.2rem] sm:rounded-[2.5rem] ring-1 ring-inset ring-white/[0.1] pointer-events-none" />
              <div className="absolute -left-[1.5px] sm:-left-[2px] top-[22%] w-[2px] sm:w-[3px] h-[16px] sm:h-[20px] bg-[#3a3a3c] rounded-l" />
              <div className="absolute -left-[1.5px] sm:-left-[2px] top-[33%] w-[2px] sm:w-[3px] h-[28px] sm:h-[34px] bg-[#3a3a3c] rounded-l" />
              <div className="absolute -right-[1.5px] sm:-right-[2px] top-[30%] w-[2px] sm:w-[3px] h-[32px] sm:h-[40px] bg-[#3a3a3c] rounded-r" />

              <div className="relative rounded-[1.8rem] sm:rounded-[2.1rem] bg-black overflow-hidden ring-1 ring-black/80 h-full">
                <VideoWithPoster
                  src="/videos/mak-gien-invitation.mp4"
                  className="h-full aspect-[9/19.5] object-cover"
                />
                <div className="absolute bottom-[3px] sm:bottom-[5px] left-1/2 -translate-x-1/2 w-[50px] sm:w-[70px] h-[3px] bg-black/40 rounded-full z-20" />
              </div>

              <div className="absolute inset-0 rounded-[2.2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            </div>
            <p className="font-sans font-medium text-[11px] sm:text-[13px] text-gold uppercase tracking-[2px] mt-3 sm:mt-4 text-center">{t.hero.phoneLabel}</p>
            <p className="font-sans font-light text-[10px] sm:text-[12px] text-grey-light mt-0.5 text-center">{t.hero.phoneSubLabel}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
