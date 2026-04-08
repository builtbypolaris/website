import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface PhoneMockupProps {
  src: string
  alt: string
  srcs?: string[]
  className?: string
}

export function PhoneMockup({ src, alt, srcs, className = '' }: PhoneMockupProps) {
  const images = srcs && srcs.length > 1 ? srcs : [src]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className={`relative ${className}`}>
      {/* Outer shell */}
      <div className="relative rounded-[3rem] bg-[#2c2c2e] p-[5px] shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
        {/* Side buttons */}
        <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
        <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
        <div className="absolute -left-[2px] top-[47%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
        <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />

        {/* Screen */}
        <div className="relative rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80">
          <div className="relative w-full aspect-[9/19.5] overflow-hidden bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[currentIndex]}
                src={images[currentIndex]}
                alt={alt}
                className="absolute inset-0 w-full h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </div>

          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
        </div>
      </div>

      {/* Glass reflection */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
