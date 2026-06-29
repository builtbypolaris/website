import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { MotionReveal } from '../ui/MotionReveal'
import { useT } from '../../i18n'

const WA_HEALTH_CHECK = `https://wa.me/6285190846591?text=${encodeURIComponent('Hi Polaris, can I get a free healthcheck for my business?')}`

export function CtaSection() {
  const t = useT()
  return (
    <section className="bg-[#09090F] pt-[120px] pb-[16px] text-center border-t border-[rgba(255,255,255,0.04)]">
      <Container>
        <MotionReveal>
          <h2 className="font-serif font-black text-[40px] sm:text-[52px] md:text-[64px] text-white leading-[0.95] -tracking-[0.025em] mb-6">
            {t.cta.titleLine1}<br />
            <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{t.cta.titleLine2}</em>
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <p className="font-sans text-[15px] text-grey-light max-w-[320px] mx-auto mb-10 leading-[1.7]">
            {t.cta.description}
          </p>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <Button
            variant="primary"
            href={WA_HEALTH_CHECK}
          >
            {t.cta.primary}
          </Button>
        </MotionReveal>
      </Container>
    </section>
  )
}
