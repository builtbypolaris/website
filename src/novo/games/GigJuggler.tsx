import { useState, useEffect, useRef } from 'react'

interface Gig {
  id: number
  emoji: string
  level: number   // 0-100
  rate: number    // drain per tick
}

interface Props {
  onXPEarned: (xp: number) => void
}

const GIG_EMOJIS = ['🎨', '💻', '📱', '📝']

export default function GigJuggler({ onXPEarned }: Props) {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'cycle' | 'drop' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const droppedInWindow = useRef(false)

  const makeGigs = (): Gig[] =>
    GIG_EMOJIS.map((emoji, i) => ({
      id: i,
      emoji,
      level: 60 + Math.random() * 40,
      rate: 0.8 + Math.random() * 0.9,
    }))

  const start = () => {
    setGigs(makeGigs())
    setScore(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
    droppedInWindow.current = false
  }

  // Drain the gigs; drains speed up over time
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const speedup = 1 + (30 - timeLeft) / 40
      setGigs(prev => prev.map(g => {
        const next = g.level - g.rate * speedup
        if (next <= 0 && g.level > 0) {
          // Project dropped!
          droppedInWindow.current = true
          setScore(s => Math.max(0, s - 20))
          setFlash('drop')
          setTimeout(() => setFlash(null), 300)
          return { ...g, level: 50, rate: 0.8 + Math.random() * 0.9 }
        }
        return { ...g, level: Math.max(0, next) }
      }))
    }, 100)
    return () => clearInterval(interval)
  }, [playing, timeLeft])

  // Every 5s: if nothing was dropped in that window, bonus
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      if (!droppedInWindow.current) {
        setScore(s => s + 15)
        setFlash('cycle')
        setTimeout(() => setFlash(null), 300)
      }
      droppedInWindow.current = false
    }, 5000)
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

  const refill = (id: number) => {
    setGigs(prev => prev.map(g => g.id === id ? { ...g, level: 100 } : g))
    setScore(s => s + 2)
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const barColor = (level: number) => level > 50 ? '#16A34A' : level > 25 ? '#EAB308' : '#DC2626'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-sky-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'cycle' ? '#DCFCE7' : flash === 'drop' ? '#FEE2E2' : 'linear-gradient(to bottom, #F0F9FF, #E0F2FE)',
          borderColor: '#BAE6FD',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🤹</div>
            <div className="font-fredoka text-xl text-gray-700">Gig Juggler!</div>
            <p className="text-sm text-gray-500 text-center px-4">Four projects, one you. Tap a project to work on it — let none hit zero!</p>
            <button onClick={start} className="px-6 py-2 bg-sky-400 hover:bg-sky-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 p-3 grid grid-cols-2 gap-2">
            {gigs.map(g => (
              <button
                key={g.id}
                onClick={() => refill(g.id)}
                className="rounded-xl bg-white border-2 border-sky-100 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-sky-300"
              >
                <span className="text-2xl" style={{ filter: g.level <= 25 ? 'saturate(2)' : 'none' }}>
                  {g.level <= 25 ? '😰' : g.emoji}
                </span>
                <div className="w-4/5 h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${g.level}%`, background: barColor(g.level), transition: 'width 0.1s linear' }}
                  />
                </div>
                <span className="font-nunito text-[10px] text-gray-400">tap to work</span>
              </button>
            ))}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🎪</div>
            <div className="font-fredoka text-2xl text-gray-800">Shift over!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-sky-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Tap to work +2 · 5s with no drops +15 · Dropped project −20 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
