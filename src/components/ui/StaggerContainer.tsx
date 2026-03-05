import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  stagger?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={`min-w-0 ${className}`}
    >
      {children}
    </motion.div>
  )
}
