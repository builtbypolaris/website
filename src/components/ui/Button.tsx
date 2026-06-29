import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'

type Variant = 'primary' | 'ghost' | 'secondary' | 'white' | 'gradient'

interface ButtonProps {
  variant?: Variant
  to?: string
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  primary:   'bg-purple-core text-white hover:bg-purple-bright shadow-[0_4px_20px_rgba(124,92,191,0.3)] hover:shadow-[0_6px_28px_rgba(124,92,191,0.45)]',
  ghost:     'bg-transparent border border-purple-core text-white hover:bg-purple-core/10',
  secondary: 'bg-transparent border border-white/30 text-white/80 hover:border-white/55 hover:text-white',
  white:     'bg-white text-deep hover:bg-purple-mist shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.25)]',
  gradient:  'text-[#09090F] font-bold',
}

const gradientBorderStyle: CSSProperties = {
  background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #3B82F6 0%, #7C3AED 50%, #F97316 100%) border-box',
  borderBottom: '4px solid transparent',
}

const MotionLink = motion.create(Link)

export function Button({ variant = 'primary', to, href, onClick, children, className = '' }: ButtonProps) {
  const base = `inline-block px-7 py-3.5 font-sans text-sm font-bold tracking-normal rounded-xl cursor-pointer transition-all duration-200 text-center ${variants[variant]} ${className}`
  const style = variant === 'gradient' ? gradientBorderStyle : undefined

  if (href) {
    return (
      <motion.a
        href={href}
        className={base}
        style={style}
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
        style={style}
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
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}
