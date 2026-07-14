import { useState, useEffect, useRef } from 'react'

interface Falling {
  id: number
  x: number
  y: number
  speed: number
  kind: 'paper' | 'star' | 'distraction'
}

interface Props {
  onXPEarned: (xp: number) => void
}

const EMOJI: Record<Falling['kind'], string> = { paper: '📄', star: '🌟', distraction: '📱' }

export default function DeadlineDodge({ onXPEarned }: Props) {
  const [items, setItems] = useState<Falling[]>([])
  const [catcherX, setCatcherX] = useState(50)
  const [score, setScore] = useState(0)
  const [stunned, setStunned] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const itemId = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)
  const catcherRef = useRef(50)
  const stunnedRef = useRef(false)
  catcherRef.current = catcherX
  stunnedRef.current = stunned

  const start = () => {
    setItems([])
    setCatcherX(50)
    setScore(0)
    setStunned(false)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn falling items
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const r = Math.random()
      setItems(prev => [...prev.slice(-12), {
        id: itemId.current++,
        x: 6 + Math.random() * 84,
        y: 0,
        speed: 1.8 + Math.random() * 2,
        kind: r < 0.15 ? 'star' : r < 0.55 ? 'paper' : 'distraction',
      }])
    }, 650)
    return () => clearInterval(interval)
  }, [playing])

  // Move items + catch detection near the notebook row
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => {
        const kept: Falling[] = []
        for (const it of prev) {
          const ny = it.y + it.speed
          if (ny >= 80 && ny < 96 && Math.abs(it.x - catcherRef.current) < 11) {
            if (it.kind === 'distraction') {
              if (!stunnedRef.current) {
                setScore(s => Math.max(0, s - 15))
                setStunned(true)
                setTimeout(() => setStunned(false), 900)
              }
            } else if (!stunnedRef.current) {
              setScore(s => s + (it.kind === 'star' ? 30 : 10))
            }
            continue
          }
          if (ny < 100) kept.push({ ...it, y: ny })
        }
        return kept
      })
    }, 60)
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

  const track = (clientX: number) => {
    if (!playing || stunned || !areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setCatcherX(Math.min(94, Math.max(6, pct)))
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-violet-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm bg-gradient-to-b from-violet-50 to-purple-100 rounded-2xl border-2 border-violet-200 overflow-hidden select-none touch-none"
        style={{ height: 220 }}
        onMouseMove={e => track(e.clientX)}
        onTouchMove={e => track(e.touches[0].clientX)}
        onTouchStart={e => track(e.touches[0].clientX)}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">📓</div>
            <div className="font-fredoka text-xl text-gray-700">Deadline Dodge!</div>
            <p className="text-sm text-gray-500 text-center px-4">Slide your notebook to catch papers — dodge the phone notifications!</p>
            <button onClick={start} className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && items.map(it => (
          <div
            key={it.id}
            className="absolute text-2xl pointer-events-none"
            style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translateX(-50%)' }}
          >
            {EMOJI[it.kind]}
          </div>
        ))}

        {playing && (
          <div
            className="absolute text-4xl pointer-events-none"
            style={{
              left: `${catcherX}%`,
              top: '82%',
              transform: 'translateX(-50%)',
              filter: stunned ? 'grayscale(1)' : 'none',
              opacity: stunned ? 0.6 : 1,
              transition: 'left 0.05s linear',
            }}
          >
            {stunned ? '😵' : '📓'}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🎓</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-violet-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Move with mouse / finger · 📄 +10 · 🌟 +30 · 📱 −15 & stun | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
