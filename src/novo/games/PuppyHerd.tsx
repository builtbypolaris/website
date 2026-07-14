import { useState, useEffect, useRef } from 'react'

interface Stray {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const PEN = { x: 50, y: 52, r: 24 }  // percent-space pen circle
const STRAY_EMOJIS = ['🐑', '🐤', '🐇']

export default function PuppyHerd({ onXPEarned }: Props) {
  const [strays, setStrays] = useState<Stray[]>([])
  const [dog, setDog] = useState({ x: 50, y: 85 })
  const [score, setScore] = useState(0)
  const [allInside, setAllInside] = useState(true)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const dogRef = useRef({ x: 50, y: 85 })
  dogRef.current = dog

  const start = () => {
    setStrays(Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: PEN.x + (Math.random() - 0.5) * 20,
      y: PEN.y + (Math.random() - 0.5) * 20,
      vx: 0, vy: 0,
    })))
    setDog({ x: 50, y: 85 })
    setScore(0)
    setAllInside(true)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Strays wander outward; the dog repels them back toward the pen
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setStrays(prev => {
        const moved = prev.map(s => {
          // Wander: random drift biased away from the pen center
          const awayX = (s.x - PEN.x) * 0.004
          const awayY = (s.y - PEN.y) * 0.004
          let vx = s.vx * 0.9 + (Math.random() - 0.5) * 0.5 + awayX
          let vy = s.vy * 0.9 + (Math.random() - 0.5) * 0.5 + awayY
          // The dog scares strays back toward the pen when close
          const dDog = Math.hypot(s.x - dogRef.current.x, s.y - dogRef.current.y)
          if (dDog < 16) {
            const toPenX = (PEN.x - s.x)
            const toPenY = (PEN.y - s.y)
            const mag = Math.hypot(toPenX, toPenY) || 1
            vx += (toPenX / mag) * 1.6
            vy += (toPenY / mag) * 1.6
          }
          return {
            ...s,
            x: Math.min(96, Math.max(4, s.x + vx)),
            y: Math.min(92, Math.max(6, s.y + vy)),
            vx, vy,
          }
        })
        const inside = moved.every(s => Math.hypot(s.x - PEN.x, s.y - PEN.y) < PEN.r)
        setAllInside(inside)
        if (inside) setScore(sc => sc + 2)
        return moved
      })
    }, 100)
    return () => clearInterval(interval)
  }, [playing])

  // Timer
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPlaying(false)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing])

  const sendDog = (clientX: number, clientY: number) => {
    if (!playing || !areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    setDog({
      x: Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(92, Math.max(6, ((clientY - rect.top) / rect.height) * 100)),
    })
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-yellow-600">{score}</span></div>
        <div className="font-fredoka text-sm" style={{ color: allInside ? '#16A34A' : '#DC2626' }}>
          {allInside ? 'herd safe ✓' : 'strays loose!'}
        </div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm rounded-2xl border-2 border-yellow-200 overflow-hidden select-none touch-none cursor-pointer"
        style={{ height: 220, background: 'linear-gradient(to bottom, #F0FDF4, #DCFCE7)' }}
        onPointerDown={e => sendDog(e.clientX, e.clientY)}
        onPointerMove={e => e.buttons > 0 && sendDog(e.clientX, e.clientY)}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-yellow-50">
            <div className="text-5xl">🐕</div>
            <div className="font-fredoka text-xl text-gray-700">Puppy Herd!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap to send the pup — chase the wanderers back into the pen!</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <>
            {/* Pen */}
            <div
              className="absolute rounded-full border-4 border-dashed pointer-events-none"
              style={{
                left: `${PEN.x}%`, top: `${PEN.y}%`,
                width: `${PEN.r * 2}%`, paddingTop: `${PEN.r * 2}%`,
                transform: 'translate(-50%, -50%)',
                borderColor: allInside ? '#4ADE80' : '#FCA5A5',
                background: allInside ? 'rgba(74,222,128,0.08)' : 'rgba(252,165,165,0.08)',
                transition: 'border-color 0.3s',
              }}
            />

            {/* Strays */}
            {strays.map((s, i) => (
              <div
                key={s.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {STRAY_EMOJIS[i % STRAY_EMOJIS.length]}
              </div>
            ))}

            {/* Dog */}
            <div
              className="absolute text-3xl pointer-events-none transition-all duration-200"
              style={{ left: `${dog.x}%`, top: `${dog.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              🐕
            </div>
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🏅</div>
            <div className="font-fredoka text-2xl text-gray-800">Good dog!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-yellow-600">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={e => { e.stopPropagation(); handleClaim() }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        +2 per moment the whole herd is penned · Tap/drag to move the pup | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
