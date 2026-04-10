import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { ArrowRight } from '../../assets/icons'
import { useT, useLocale, buildLocalePath } from '../../i18n'

export function TrustBar() {
  const t = useT()
  const locale = useLocale()
  const tags = t.trustBar.tags
  return (
    <section className="bg-void border-y border-border/50 py-10">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 justify-center">
          <p className="font-sans font-light text-[13px] text-grey tracking-[2px] uppercase flex-shrink-0">
            {t.trustBar.label}
          </p>
          <div className="w-px h-4 bg-border hidden md:block" />
          <StaggerContainer stagger={0.08} className="flex gap-3 flex-wrap justify-center">
            {tags.map((tag) => (
              <StaggerItem key={tag}>
                <motion.span
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="inline-block px-5 py-2 border border-border/60 rounded-full font-sans font-light text-[13px] text-grey-light tracking-wide hover:border-purple-core/30 hover:text-white transition-all duration-300 cursor-default"
                >
                  {tag}
                </motion.span>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <div className="w-px h-4 bg-border hidden md:block" />
          <Link
            to={buildLocalePath('/services', locale)}
            className="flex items-center gap-1.5 font-sans text-[13px] text-purple-glow hover:text-purple-bright transition-colors duration-200 tracking-wide flex-shrink-0 group/svc"
          >
            {t.trustBar.seeAllServices}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/svc:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  )
}
