import { motion } from 'motion/react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-card border border-border rounded-2xl p-7 transition-all duration-300 hover:border-purple-core/50 hover:bg-card-hover card-glow overflow-hidden relative group ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-core via-purple-bright to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      {children}
    </motion.div>
  )
}
