import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect, useState } from 'react'

function useWindowWidth() {
  const [width, setWidth] = useState(1440)
  useEffect(() => {
    setWidth(window.innerWidth)
    const fn = () => setWidth(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return width
}

export function StarMascot() {
  const vw = useWindowWidth()
  const x = useMotionValue(-90)

  // Fade out before the CTA buttons area (left ~45% of viewport)
  const hideStart = vw * 0.08
  const showStart = vw * 0.92

  const opacity = useTransform(
    x,
    [hideStart - 40, hideStart, showStart, showStart + 40],
    [1, 0, 0, 1]
  )

  useEffect(() => {
    const startX = -90
    const endX = vw + 90
    const visibleDist = (hideStart - startX) + (endX - showStart)
    const duration = 20
    const t1 = (hideStart - startX) / visibleDist

    x.set(startX)
    const controls = animate(x, [startX, hideStart, showStart, endX], {
      duration,
      times: [0, t1, t1 + 0.001, 1],
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 5,
    })
    return () => controls.stop()
  }, [vw])

  return (
    <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
      <motion.div
        className="absolute"
        style={{ x, opacity, bottom: '52px' }}
      >
        {/* Body bob */}
        <motion.div
          animate={{ y: [0, -6, 0, -6, 0] }}
          transition={{ duration: 0.52, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="72" height="80" viewBox="0 0 52 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="mascot-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a96e" />
                <stop offset="50%" stopColor="#9b7ee0" />
                <stop offset="100%" stopColor="#7c5cbf" />
              </linearGradient>
              <linearGradient id="star-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(201,169,110,0.4)" />
                <stop offset="100%" stopColor="rgba(124,92,191,0.4)" />
              </linearGradient>
            </defs>

            {/* Shadow under feet */}
            <ellipse cx="26" cy="55" rx="13" ry="2.5" fill="rgba(201,169,110,0.15)" />

            {/* Glow aura */}
            <polygon
              points="26,2 31.9,11.9 43.1,14.4 35.5,23.1 36.6,34.6 26,30 15.4,34.6 16.5,23.1 8.9,14.4 20.1,11.9"
              fill="url(#star-glow-gradient)"
              filter="url(#mascot-glow)"
            />

            {/* Star body — gold to purple gradient */}
            <polygon
              points="26,2 31.9,11.9 43.1,14.4 35.5,23.1 36.6,34.6 26,30 15.4,34.6 16.5,23.1 8.9,14.4 20.1,11.9"
              fill="url(#star-gradient)"
            />

            {/* Inner highlight sheen */}
            <polygon
              points="26,5.5 30.5,13.5 40,15.5 33.5,22 34.2,31 26,26.5 17.8,31 18.5,22 12,15.5 21.5,13.5"
              fill="rgba(255,235,200,0.18)"
            />

            {/* Sparkle tip — golden */}
            <motion.circle
              cx="26" cy="2"
              fill="rgba(255,225,150,0.95)"
              initial={{ opacity: 1, r: 2 }}
              animate={{ opacity: [1, 0.2, 1], r: [2, 3, 2] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Left eye */}
            <circle cx="21" cy="18.5" r="2.6" fill="white" />
            <circle cx="21.9" cy="19.2" r="1.3" fill="#180d38" />
            <circle cx="22.8" cy="18.4" r="0.65" fill="white" />

            {/* Right eye */}
            <circle cx="31" cy="18.5" r="2.6" fill="white" />
            <circle cx="31.9" cy="19.2" r="1.3" fill="#180d38" />
            <circle cx="32.8" cy="18.4" r="0.65" fill="white" />

            {/* Smile */}
            <path
              d="M 19.5 24 Q 26 29.5 32.5 24"
              stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round"
            />

            {/* Rosy cheeks — golden tint */}
            <circle cx="17" cy="22.5" r="3.2" fill="rgba(201,169,110,0.25)" />
            <circle cx="35" cy="22.5" r="3.2" fill="rgba(201,169,110,0.25)" />

            {/* Left leg */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: 'center top' }}
              animate={{ rotate: [18, -18, 18] }}
              transition={{ duration: 0.52, repeat: Infinity, ease: 'easeInOut' }}
            >
              <rect x="17.5" y="33" width="7" height="13" rx="3.5" fill="#8b6d2e" />
              <ellipse cx="21" cy="46.5" rx="5.5" ry="3" fill="#7a5f28" />
            </motion.g>

            {/* Right leg */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: 'center top' }}
              animate={{ rotate: [-18, 18, -18] }}
              transition={{ duration: 0.52, repeat: Infinity, ease: 'easeInOut' }}
            >
              <rect x="27.5" y="33" width="7" height="13" rx="3.5" fill="#5a3d9e" />
              <ellipse cx="31" cy="46.5" rx="5.5" ry="3" fill="#4a2f8e" />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
