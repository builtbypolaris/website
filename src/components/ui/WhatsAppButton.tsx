import { motion } from 'motion/react'
import { WhatsApp } from '../../assets/icons'

interface WhatsAppButtonProps {
  message: string
  className?: string
  children?: React.ReactNode
}

const PHONE = '6281946494333'

export function WhatsAppButton({ message, className = '', children }: WhatsAppButtonProps) {
  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-8 py-4 font-sans text-sm font-medium tracking-wide rounded-xl cursor-pointer transition-all duration-300 text-center bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_32px_rgba(37,211,102,0.45)] hover:from-[#2be872] hover:to-[#15a084] ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <WhatsApp className="w-5 h-5" />
      {children || 'Contact Us Now'}
    </motion.a>
  )
}
