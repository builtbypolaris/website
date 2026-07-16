import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { INK, MUTED, PAPER } from './ui'
import type { Celebration } from '../lib/gamification'

// ── Confetti (self-contained canvas burst, no deps) ──────────

function ConfettiBurst({ colors, onDone }: { colors: string[]; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface P { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number; shape: 0 | 1 }
    const parts: P[] = []
    const cx = canvas.width / 2
    const cy = canvas.height * 0.4
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 11
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 7,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        shape: Math.random() > 0.5 ? 0 : 1,
      })
    }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = now - start
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.28
        p.vx *= 0.99
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - t / 2200)
        if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      }
      if (t < 2200) raf = requestAnimationFrame(tick)
      else onDoneRef.current()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [colors])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} />
}

// ── Individual celebration toasts — flat accent fill, no border/rotation ──

function toastStyle(accent: string): React.CSSProperties {
  return { background: accent, color: '#FFFFFF' }
}

function MissionCard({ c }: { c: Extract<Celebration, { type: 'mission' }> }) {
  return (
    <div className="bounce-in rounded-2xl px-4 py-3" style={toastStyle('#7C3AED')}>
      <div className="font-nunito font-semibold text-sm">Mission complete, +{c.bonusXP} XP</div>
      <div className="font-nunito text-xs text-white/80">{c.title}</div>
    </div>
  )
}

function StreakCard({ c }: { c: Extract<Celebration, { type: 'streak' }> }) {
  return (
    <div className="bounce-in rounded-2xl px-4 py-3" style={toastStyle('#EA580C')}>
      <div className="font-nunito font-semibold text-sm">{c.days}-day streak</div>
      <div className="font-nunito text-xs text-white/80">Bonus +{c.bonusXP} XP</div>
    </div>
  )
}

function BadgeCard({ c }: { c: Extract<Celebration, { type: 'badge' }> }) {
  return (
    <div className="bounce-in rounded-2xl px-4 py-3" style={toastStyle('#0284C7')}>
      <div className="font-nunito font-semibold text-sm">{c.emoji} Badge unlocked</div>
      <div className="font-nunito text-xs text-white/80">{c.label}</div>
    </div>
  )
}

// ── Modals ─────────────────────────────────────────────────

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ zIndex: 9998, background: 'rgba(20,18,27,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bounce-in rounded-3xl px-8 py-10 text-center max-w-sm w-full"
        style={{ background: PAPER }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function EvolveModal({ c, onClose }: { c: Extract<Celebration, { type: 'evolve' }>; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-4xl opacity-40">{c.fromEmoji}</span>
        <span className="text-7xl animate-float">{c.toEmoji}</span>
      </div>
      <div className="font-nunito text-xs mb-1" style={{ color: c.accent }}>Evolved</div>
      <div className="font-nunito font-semibold text-2xl mb-6" style={{ color: INK }}>{c.toName}</div>
      <button
        onClick={onClose}
        className="font-nunito font-semibold text-sm px-6 py-3 rounded-full transition-opacity hover:opacity-90"
        style={{ background: c.accent, color: '#FFFFFF' }}
      >
        Let's go
      </button>
    </ModalShell>
  )
}

function CrownModal({ c, onClose }: { c: Extract<Celebration, { type: 'crown' }>; onClose: () => void }) {
  const impact =
    c.cause === 'environment' ? '1 plant will be planted 🌱'
    : c.cause === 'social' ? '1 person will receive help 💛'
    : 'Pick your cause on the Impact page to direct it'
  const impactColor = c.cause === 'social' ? '#DB2777' : c.cause === 'environment' ? '#16A34A' : MUTED
  return (
    <ModalShell onClose={onClose}>
      <div className="text-7xl mb-4 animate-float">👑</div>
      <div className="font-nunito text-xs mb-1" style={{ color: '#B45309' }}>Cycle {c.cycles} complete</div>
      <div className="font-nunito font-semibold text-2xl mb-2" style={{ color: INK }}>Crown earned</div>
      <div className="font-nunito text-sm mb-6" style={{ color: impactColor }}>{impact}</div>
      <button
        onClick={onClose}
        className="font-nunito font-semibold text-sm px-6 py-3 rounded-full transition-opacity hover:opacity-90"
        style={{ background: '#F59E0B', color: '#14121B' }}
      >
        Next cycle
      </button>
    </ModalShell>
  )
}

// ── The layer + hook ─────────────────────────────────────────
// const { celebrate, layer } = useCelebrations()
// …render {layer} once at page root, call celebrate(result.celebrations).

const CONFETTI_COLORS = ['#7C3AED', '#F59E0B', '#16A34A', '#DB2777', '#0284C7', '#EA580C']

export function useCelebrations(): { celebrate: (cs: Celebration[]) => void; layer: ReactNode } {
  const [toasts, setToasts] = useState<{ key: number; c: Celebration }[]>([])
  const [modal, setModal] = useState<Celebration | null>(null)
  const [confetti, setConfetti] = useState(0)
  const keyRef = useRef(0)

  const celebrate = useCallback((cs: Celebration[]) => {
    if (cs.length === 0) return
    const big = cs.find(c => c.type === 'crown') ?? cs.find(c => c.type === 'evolve')
    if (big) setModal(big)
    if (cs.some(c => c.type === 'evolve' || c.type === 'crown')) {
      setConfetti(n => n + 1)
    }
    const small = cs.filter(c => c.type === 'mission' || c.type === 'streak' || c.type === 'badge')
    if (small.length > 0) {
      const stamped = small.map(c => ({ key: ++keyRef.current, c }))
      setToasts(t => [...t, ...stamped])
      for (const s of stamped) {
        setTimeout(() => setToasts(t => t.filter(x => x.key !== s.key)), 5000)
      }
    }
  }, [])

  const layer = (
    <>
      {confetti > 0 && <ConfettiBurst key={confetti} colors={CONFETTI_COLORS} onDone={() => setConfetti(0)} />}
      {toasts.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center px-4" style={{ zIndex: 9997, maxWidth: 420, width: '100%' }}>
          {toasts.map(({ key, c }) => (
            c.type === 'mission' ? <MissionCard key={key} c={c} />
            : c.type === 'streak' ? <StreakCard key={key} c={c} />
            : c.type === 'badge' ? <BadgeCard key={key} c={c} />
            : null
          ))}
        </div>
      )}
      {modal?.type === 'evolve' && <EvolveModal c={modal} onClose={() => setModal(null)} />}
      {modal?.type === 'crown' && <CrownModal c={modal} onClose={() => setModal(null)} />}
    </>
  )

  return { celebrate, layer }
}
