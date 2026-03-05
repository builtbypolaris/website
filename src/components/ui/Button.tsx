import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

type Variant = 'primary' | 'ghost' | 'white'

interface ButtonProps {
  variant?: Variant
  to?: string
  href?: string
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  primary: 'bg-purple-core text-white hover:bg-purple-bright shadow-[0_4px_20px_rgba(124,92,191,0.3)] hover:shadow-[0_6px_28px_rgba(124,92,191,0.45)]',
  ghost: 'bg-transparent border border-purple-core text-white hover:bg-purple-core/10',
  white: 'bg-white text-deep hover:bg-purple-mist shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.25)]',
}

const MotionLink = motion.create(Link)

export function Button({ variant = 'primary', to, href, children, className = '' }: ButtonProps) {
  const base = `inline-block px-7 py-3.5 font-sans text-sm font-normal tracking-wide rounded-lg cursor-pointer transition-all duration-200 text-center ${variants[variant]} ${className}`

  if (href) {
    return (
      <motion.a
        href={href}
        className={base}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.a>
    )
  }

  if (to) {
    return (
      <MotionLink
        to={to}
        className={base}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      className={base}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}
