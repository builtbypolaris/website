import { motion } from 'motion/react'
import { Button } from '../ui/Button'
import { ConstellationCanvas } from '../canvas/ConstellationCanvas'
import { StarMascot } from '../canvas/StarMascot'

const cascade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export function Hero() {
  return (
    <section className="min-h-screen relative bg-void overflow-hidden pt-[88px] flex items-center">
      {/* Atmospheric glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,92,191,0.10)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_70%)] pointer-events-none" />

      <ConstellationCanvas />
      <StarMascot />

      <div className="relative z-[2] w-full max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-10 lg:gap-6 py-12">
        {/* Left — Text */}
        <div className="w-full lg:w-[45%]">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="inline-flex items-center gap-3 mb-7 px-5 py-2 border border-border/60 rounded-full"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-core shadow-[0_0_8px_rgba(124,92,191,0.6)]" />
            <span className="text-[12px] text-grey-light tracking-[3px] uppercase font-sans">Diagnostic-First Consultancy</span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="font-serif font-light text-[48px] lg:text-[60px] text-white mb-6 -tracking-[1px] leading-[1.08]"
          >
            Your Business,<br />
            Finally Pointed<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow via-purple-bright to-gold">True North.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="font-sans font-light text-[15px] text-grey-light max-w-[440px] mb-8 leading-[1.75]"
          >
            We&rsquo;re not another tech agency selling packages.
            We diagnose what&rsquo;s really holding your business back &mdash;
            then build exactly what fixes it.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cascade}
            className="flex gap-4 flex-wrap"
          >
            <Button to="/contact">Get Your Free Health Check</Button>
            <Button variant="ghost" to="/services">See How It Works</Button>
          </motion.div>
        </div>

        {/* Right — Devices */}
        <motion.div
          className="w-full lg:w-[55%] flex items-end justify-center gap-5 lg:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Laptop */}
          <div className="flex-1 max-w-[500px]">
            <div className="relative">
              <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
                  <video muted playsInline autoPlay loop className="w-full aspect-[16/10] object-cover bg-white block">
                    <source src="/videos/stevia-cookies.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
              <div className="h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
              <div className="relative mx-auto w-[94%]">
                <div className="h-[7px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm" />
              </div>
              <div className="relative mx-auto w-[108%] -ml-[4%]">
                <div className="h-[12px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
                </div>
              </div>
            </div>
            <p className="font-sans font-medium text-[13px] text-gold uppercase tracking-[2px] mt-4">F&B Website</p>
            <p className="font-sans font-light text-[12px] text-grey-light mt-0.5">Website Development</p>
          </div>

          {/* Phone */}
          <div className="flex-shrink-0">
            <div className="relative rounded-[2.5rem] bg-[#2c2c2e] p-[5px] shadow-[0_30px_80px_rgba(0,0,0,0.5)] w-[170px] md:w-[200px]">
              <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/[0.1] pointer-events-none" />
              <div className="absolute -left-[2px] top-[22%] w-[3px] h-[20px] bg-[#3a3a3c] rounded-l" />
              <div className="absolute -left-[2px] top-[33%] w-[3px] h-[34px] bg-[#3a3a3c] rounded-l" />
              <div className="absolute -right-[2px] top-[30%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-r" />

              <div className="relative rounded-[2.1rem] bg-black overflow-hidden ring-1 ring-black/80">
                <video muted playsInline autoPlay loop className="w-full aspect-[9/19.5] object-cover">
                  <source src="/videos/mak-gien-invitation.mp4" type="video/mp4" />
                </video>
                <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[70px] h-[3px] bg-black/40 rounded-full z-20" />
              </div>

              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            </div>
            <p className="font-sans font-medium text-[13px] text-gold uppercase tracking-[2px] mt-4 text-center">Digital Invitation</p>
            <p className="font-sans font-light text-[12px] text-grey-light mt-0.5 text-center">Online Invitation</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
