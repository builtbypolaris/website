import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Container } from '../ui/Container'
import { MotionReveal } from '../ui/MotionReveal'
import { WhatsAppButton } from '../ui/WhatsAppButton'
import { DeviceFrame } from '../ui/DeviceFrame'
import { ChevronDown } from '../../assets/icons'
import type { ServiceCategory } from '../../types'

interface ServiceShowcaseProps {
  service: ServiceCategory
  index: number
}

export function ServiceShowcase({ service, index }: ServiceShowcaseProps) {
  const isEven = index % 2 === 0
  const isHealthCheck = index === 0
  const isCustom = service.slug === 'custom-solutions'
  const hasCollapsiblePricing = !isHealthCheck && !isCustom

  const [showPricing, setShowPricing] = useState(false)

  const bulletColor = 'bg-gold'
  const iconBg = 'bg-gold/10 border-gold/20'

  return (
    <section
      id={service.slug}
      className={`${isEven ? 'bg-void' : 'bg-surface'} py-[80px] relative section-divider-top`}
    >
      {isHealthCheck && (
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.04)_0%,transparent_60%)] pointer-events-none" />
      )}

      <Container>
        {/* Two-column row - illustration stretches to match content height */}
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-stretch`}>
          {/* Photo side - fills full height */}
          <MotionReveal className="w-full lg:w-[45%] flex">
            <div className="bg-deep/50 border border-gold/20 rounded-2xl flex items-center justify-center flex-1 p-8">
              <DeviceFrame src={service.illustration} alt={service.title} className="w-full max-w-[360px]" />
            </div>
          </MotionReveal>

          {/* Content side */}
          <MotionReveal delay={0.15} className="w-full lg:w-[55%]">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center`}>
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

            {/* Feature bullets */}
            <ul className="mb-6 space-y-2.5">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bulletColor}`} />
                  <span className="font-sans font-light text-sm text-grey-light leading-[1.6]">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Show Pricing toggle (inline, no pricing cards here) */}
            {hasCollapsiblePricing && (
              <button
                onClick={() => setShowPricing(!showPricing)}
                className="group/pricing flex items-center gap-3 w-full cursor-pointer mb-6"
              >
                <span className="font-sans text-base text-white group-hover/pricing:text-purple-glow transition-colors duration-200">
                  {showPricing ? 'Hide Pricing' : 'Show Pricing'}
                </span>
                <span className="flex-1 h-px bg-gradient-to-r from-white/25 to-transparent" />
                <motion.span
                  animate={{ rotate: showPricing ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex text-white/50 group-hover/pricing:text-white transition-colors duration-200"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>
            )}

            {/* Custom - always show single tier */}
            {isCustom && (
              <div className="bg-card border border-purple-core/20 rounded-xl p-5 mb-6">
                <h5 className="font-sans font-normal text-[15px] text-white mb-2">{service.tiers[0].name}</h5>
                <div className="font-sans text-[13px] text-gold tracking-wider uppercase mb-3">
                  {service.tiers[0].price}
                </div>
                <p className="font-sans font-light text-sm text-grey-light leading-[1.7]">
                  {service.tiers[0].description}
                </p>
              </div>
            )}

          </MotionReveal>
        </div>

        {/* Pricing cards - full width below both columns */}
        {hasCollapsiblePricing && (
          <AnimatePresence>
            {showPricing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-8">
                  {service.tiers.map((tier) => (
                    <div key={tier.name} className="bg-card border border-border rounded-xl p-4">
                      <h5 className="font-sans font-normal text-[13px] text-white mb-1">{tier.name}</h5>
                      <div className="font-sans text-[12px] text-gold tracking-wider uppercase mb-2">
                        {tier.price}
                      </div>
                      {tier.description && (
                        <p className="font-sans font-light text-[13px] text-grey leading-[1.6]">
                          {tier.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Container>
    </section>
  )
}
