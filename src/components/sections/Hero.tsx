import { motion } from 'motion/react'
import { Button } from '../ui/Button'
import { useT, useLocale, buildLocalePath } from '../../i18n'
import { Constellation } from '../ui/Constellation'

const WA_HEALTH_CHECK = `https://wa.me/6285190846591?text=${encodeURIComponent('Hi Polaris, can I get a free healthcheck for my business?')}`

const cascade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  const t = useT()
  const locale = useLocale()

  return (
    <section className="bg-void pt-[64px] overflow-hidden relative">
      {/* Constellation background */}
      <Constellation />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-core/[0.07] rounded-full blur-[140px]" />

      {/* Centered text block */}
      <div className="relative w-full max-w-[860px] mx-auto px-6 md:px-12 flex flex-col items-center text-center pt-20 lg:pt-28 pb-14">

        <motion.h1
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="font-serif font-black text-[56px] sm:text-[72px] md:text-[88px] lg:text-[100px] text-white leading-[0.92] -tracking-[0.03em] mb-8"
        >
          {t.hero.titleLine1} <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{t.hero.titleLine1Em}</em><br />
          {t.hero.titleLine2} <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{t.hero.titleLine2Em}</em>
        </motion.h1>

        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="font-sans text-[16px] text-grey-light max-w-[480px] mb-10 leading-[1.75]"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cascade}
          className="flex gap-4 flex-wrap justify-center"
        >
          <Button variant="gradient" href={WA_HEALTH_CHECK}>{t.hero.ctaPrimary}</Button>
          <Button variant="secondary" to={buildLocalePath('/services', locale)}>{t.hero.ctaSecondary} ↗</Button>
        </motion.div>
      </div>

    </section>
  )
}
