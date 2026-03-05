import { motion } from 'motion/react'
import { Button } from '../ui/Button'
import { ChevronDown } from '../../assets/icons'
import { ConstellationCanvas } from '../canvas/ConstellationCanvas'

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
    <section className="min-h-screen flex items-center justify-center text-center relative bg-void overflow-hidden pt-[72px]">
      {/* Multi-layered atmospheric glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(124,92,191,0.10)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_70%)] pointer-events-none" />

      <ConstellationCanvas />

      <div className="relative z-[2] max-w-[820px] px-10">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="inline-flex items-center gap-3 mb-8 px-5 py-2 border border-border/60 rounded-full"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-core shadow-[0_0_8px_rgba(124,92,191,0.6)]" />
          <span className="text-[12px] text-grey-light tracking-[3px] uppercase font-sans">Diagnostic-First Consultancy</span>
        </motion.div>

        {/* Heading — 72px serif weight 300 */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="font-serif font-light text-[72px] text-white mb-7 -tracking-[1px] leading-[1.08]"
        >
          Your Business,<br />
          Finally Pointed<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow via-purple-bright to-gold">True North.</span>
        </motion.h1>

        {/* Subtitle — 14px DM Sans weight 300 */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="font-sans font-light text-[16px] text-grey-light max-w-[540px] mx-auto mb-11 leading-[1.75]"
        >
          We&rsquo;re not another tech agency selling packages.<br />
          We diagnose what&rsquo;s really holding your business back &mdash;<br />
          then build exactly what fixes it.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button to="/contact">Start With a Free Diagnosis</Button>
          <Button variant="ghost" to="/services">See How It Works</Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-[2] animate-[bounce_2s_infinite]">
        <ChevronDown className="w-6 h-6 text-grey" />
      </div>
    </section>
  )
}
