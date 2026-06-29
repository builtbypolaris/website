import { WebsiteVideoMockup } from '../mockups/WebsiteVideoMockup'
import { CRMDashboard } from '../mockups/CRMDashboard'
import { SocialMediaVideoMockup } from '../mockups/SocialMediaVideoMockup'
import { useT } from '../../i18n'

const ROWS = [
  { Component: WebsiteVideoMockup, bg: '#FFFFFF', flip: false },
  { Component: CRMDashboard,       bg: '#F5F3FF', flip: true  },
  { Component: SocialMediaVideoMockup, bg: '#FFF8F2', flip: false },
]

export function ServiceFeatures() {
  const t = useT()

  return (
    <div>
      {t.serviceFeatures.features.map((feature, i) => {
        const { Component, bg, flip } = ROWS[i]

        const textBlock = (
          <div className="w-full lg:w-[42%] flex flex-col justify-center">
            <p className="font-sans text-[11px] font-bold tracking-[3px] uppercase text-[#7C3AED] mb-5">
              {feature.label}
            </p>
            <h2 className="font-serif font-black text-[36px] sm:text-[44px] md:text-[52px] text-[#09090F] leading-[1.0] -tracking-[0.025em] mb-5">
              {feature.headLine1}<br />
              <em style={{ fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif", color: '#09090F' }}>
                {feature.headLine2}
              </em>
            </h2>
            <p className="font-sans text-[15px] text-[#09090F]/55 leading-[1.8] max-w-[400px]">
              {feature.description}
            </p>
          </div>
        )

        const visualBlock = (
          <div className="w-full lg:w-[55%]">
            <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.06] aspect-video lg:aspect-auto lg:h-[380px]">
              <Component />
            </div>
          </div>
        )

        return (
          <section key={i} style={{ background: bg }} className="py-16 md:py-24 border-b border-black/[0.05]">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className={`flex flex-col gap-12 lg:gap-16 ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
                {textBlock}
                {visualBlock}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
