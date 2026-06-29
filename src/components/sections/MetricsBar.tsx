import { Container } from '../ui/Container'
import { MotionReveal } from '../ui/MotionReveal'
import { useT } from '../../i18n'

export function MetricsBar() {
  const t = useT()
  return (
    <section className="bg-[#F5F4F2] py-[80px]">
      <Container>
        <MotionReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {t.metricsBar.stats.map((stat) => (
              <div key={stat.number} className="text-center">
                <div className="font-serif font-black text-[52px] md:text-[64px] text-[#09090F] leading-none -tracking-[0.02em]">
                  {stat.number}
                </div>
                <div className="font-sans text-[13px] text-[#09090F]/50 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </MotionReveal>
      </Container>
    </section>
  )
}
