import { motion } from 'motion/react'

const TAGS = [
  { icon: '❤️', text: '+124 likes',   x: '22%', delay: 0,   repeat: 8 },
  { icon: '👁',  text: '2.4K views',   x: '58%', delay: 2,   repeat: 8 },
  { icon: '💬', text: '+18 comments', x: '20%', delay: 4,   repeat: 8 },
  { icon: '📤', text: '+52 shares',   x: '56%', delay: 6,   repeat: 8 },
]

function FloatingTag({
  icon, text, x, delay, repeat,
}: { icon: string; text: string; x: string; delay: number; repeat: number }) {
  return (
    <motion.div
      style={{ position: 'absolute', bottom: '22%', left: x, transform: 'translateX(-50%)', zIndex: 10 }}
      initial={{ opacity: 0, y: 0, scale: 0.85 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -18, -48, -68], scale: [0.85, 1, 1, 0.95] }}
      transition={{ duration: 2.6, delay, repeat: Infinity, repeatDelay: repeat, ease: 'easeOut' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        borderRadius: 999,
        padding: '5px 11px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#111', letterSpacing: 0.1 }}>{text}</span>
      </div>
    </motion.div>
  )
}

export function AnimatedSocialMedia() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Ken Burns on the PNG */}
      <motion.img
        src="/images/services/social-media-content-creation.png"
        alt="Social Media Content"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating engagement tags */}
      {TAGS.map(tag => (
        <FloatingTag key={tag.text} {...tag} />
      ))}
    </div>
  )
}
