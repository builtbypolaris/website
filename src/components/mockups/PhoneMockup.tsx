import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

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
    <div className={`relative [perspective:1200px] ${className}`}>
      <motion.div
        animate={{
          rotateY: [4, -4, 4],
          rotateX: [-2, 3, -2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Outer shell — titanium frame */}
        <div className="relative rounded-[3rem] bg-[#2c2c2e] p-[5px] shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]">
          {/* Titanium edge highlight */}
          <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
          {/* Side buttons */}
          <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
          <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
          <div className="absolute -left-[2px] top-[47%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
          <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />

          {/* Screen bezel — black inset */}
          <div className="relative rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80">
            {/* Screen with crossfade */}
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

            {/* Home indicator */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
          </div>
        </div>

        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* Ground shadow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[55%] h-[40px] bg-[radial-gradient(ellipse,rgba(0,0,0,0.3)_0%,transparent_70%)] blur-md" />
    </div>
  )
}
