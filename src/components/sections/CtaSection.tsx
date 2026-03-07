import { motion } from 'motion/react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { CtaStar } from '../../assets/icons'
import { MotionReveal } from '../ui/MotionReveal'

export function CtaSection() {
  return (
    <section className="relative py-[100px] text-center overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f3d] via-[#2d1b69] to-purple-core" />

      {/* Radial glow overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(184,159,240,0.12)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(201,169,110,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <Container className="relative z-[2]">
        {/* Star icon with floating animation */}
        <MotionReveal className="mb-8">
          <div className="relative w-14 h-14 mx-auto">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CtaStar className="w-full h-full relative z-[1]" />
            </motion.div>
            <div className="absolute inset-0 bg-purple-glow/20 rounded-full blur-xl" />
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            Ready to find your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-mist via-white to-gold-soft">true north?</span>
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <p className="font-sans font-light text-base text-purple-mist/80 max-w-[500px] mx-auto mb-4 leading-[1.8]">
            Start with a Business Health Check. 3 days. A clear written report. And finally, direction.
          </p>
          <p className="font-sans text-[14px] text-gold tracking-widest uppercase mb-10">
            Rp 2.5 &ndash; 5 juta
          </p>
        </MotionReveal>

        <MotionReveal delay={0.3}>
          <Button
            variant="white"
            href="mailto:builtbypolaris@gmail.com?subject=Business Health Check"
            className="!text-[15px] !py-4 !px-9"
          >
            Book Your Business Health Check
          </Button>
          <p className="mt-6 font-sans text-sm text-purple-soft/70">
            Or email us at{' '}
            <a
              href="mailto:builtbypolaris@gmail.com"
              className="text-white/90 border-b border-white/20 hover:border-white/60 transition-colors duration-200"
            >
              builtbypolaris@gmail.com
            </a>
          </p>
        </MotionReveal>
      </Container>
    </section>
  )
}
