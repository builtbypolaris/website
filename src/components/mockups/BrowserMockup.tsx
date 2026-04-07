import { motion } from 'motion/react'

interface LaptopMockupProps {
  src: string
  alt: string
  className?: string
}

export function BrowserMockup({ src, alt, className = '' }: LaptopMockupProps) {
  return (
    <div className={`relative [perspective:1400px] ${className}`}>
      <motion.div
        animate={{
          rotateX: [2, -1, 2],
          rotateY: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* === SCREEN === */}
        <div className="relative">
          {/* Screen outer shell — dark aluminum */}
          <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
            {/* Webcam dot */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />

            {/* Screen bezel */}
            <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
              <img
                src={src}
                alt={alt}
                className="w-full aspect-[16/10] object-contain bg-white block"
              />
            </div>
          </div>

          {/* Screen bottom edge / chin */}
          <div className="h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
        </div>

        {/* === HINGE === */}
        <div className="relative mx-auto w-[94%]">
          <div className="h-[8px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        </div>

        {/* === KEYBOARD BASE === */}
        <div className="relative mx-auto w-[108%] -ml-[4%]">
          <div className="h-[14px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
            {/* Trackpad line */}
            <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
          </div>
          {/* Rubber feet shadow */}
          <div className="absolute -bottom-[2px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full" />
        </div>

        {/* Glass reflection on screen */}
        <div className="absolute top-0 left-0 right-0 h-[60%] rounded-t-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      </motion.div>

      {/* Ground shadow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-[50px] bg-[radial-gradient(ellipse,rgba(0,0,0,0.2)_0%,transparent_70%)] blur-lg" />
    </div>
  )
}
