import { Container } from '../ui/Container'
import { MotionReveal } from '../ui/MotionReveal'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { DeviceFrame } from '../ui/DeviceFrame'
import type { ServiceCategory } from '../../types'

interface ServiceShowcaseProps {
  service: ServiceCategory
  index: number
}

export function ServiceShowcase({ service, index }: ServiceShowcaseProps) {
  const isEven = index % 2 === 0
  const isHealthCheck = index === 0

  return (
    <section
      id={service.slug}
      className={`${isEven ? 'bg-void' : 'bg-surface'} py-[80px] relative section-divider-top`}
    >
      {isHealthCheck && (
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_60%)] pointer-events-none" />
      )}

      <Container>
        {/* Two-column row */}
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-stretch`}>
          {/* Photo side */}
          <MotionReveal className="w-full lg:w-[45%] flex">
            <div className="bg-deep/50 border border-gold/20 rounded-2xl flex items-center justify-center flex-1 p-8">
              <DeviceFrame src={service.illustration} alt={service.title} className="w-full max-w-[360px]" />
            </div>
          </MotionReveal>

          {/* Content side */}
          <MotionReveal delay={0.15} className="w-full lg:w-[55%]">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <service.icon className="w-6 h-6" />
              </div>
              {isHealthCheck && service.highlight && (
                <span className="inline-block px-3 py-1 text-[11px] font-sans font-medium tracking-[2px] uppercase bg-gold/15 text-gold border border-gold/30 rounded-full">
                  {service.highlight}
                </span>
              )}
              <WhatsAppButton message={service.whatsappMessage} className="text-[13px] !px-5 !py-2.5" />
            </div>

            <h3 className="font-serif font-light text-[36px] text-white mb-3 leading-[1.2]">
              {service.title}
            </h3>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] mb-6 max-w-[540px]">
              {service.description}
            </p>

            {/* Sub-services */}
            <div className="space-y-4">
              {service.subServices.map((sub) => (
                <div key={sub.name} className="bg-card border border-border/60 rounded-xl p-4">
                  <h5 className="font-sans font-normal text-[15px] text-white mb-1.5">{sub.name}</h5>
                  <p className="font-sans font-light text-sm text-grey-light leading-[1.6]">
                    {sub.description}
                  </p>
                </div>
              ))}
            </div>
          </MotionReveal>
        </div>
      </Container>
    </section>
  )
}
