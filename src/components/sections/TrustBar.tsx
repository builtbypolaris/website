import { motion } from 'motion/react'
import { Container } from '../ui/Container'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'

const tags = ['E-Commerce', 'F&B', 'Healthcare', 'Education', 'Professional Services']

export function TrustBar() {
  return (
    <section className="bg-void border-y border-border/50 py-10">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 justify-center">
          <p className="font-sans font-light text-[13px] text-grey tracking-[2px] uppercase flex-shrink-0">
            Trusted across
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
        </div>
      </Container>
    </section>
  )
}
