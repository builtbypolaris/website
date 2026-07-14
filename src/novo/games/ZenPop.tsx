import { useState, useEffect, useRef, useCallback } from 'react'

interface Bubble {
  id: number
  x: number
  y: number
  speed: number
  stress: boolean
  flashing: boolean
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function ZenPop({ onXPEarned }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [chain, setChain] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const bubbleId = useRef(0)

  const start = () => {
    setBubbles([])
    setScore(0)
    setChain(0)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn bubbles rising from the bottom
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setBubbles(prev => [...prev.slice(-14), {
        id: bubbleId.current++,
        x: 5 + Math.random() * 85,
        y: 100,
        speed: 1.2 + Math.random() * 1.6,
        stress: Math.random() < 0.3,
        flashing: false,
      }])
    }, 550)
    return () => clearInterval(interval)
  }, [playing])

  // Float bubbles up; a calm bubble escaping breaks the chain
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setBubbles(prev => {
        const escapedCalm = prev.some(b => !b.stress && b.y - b.speed <= -8)
        if (escapedCalm) setChain(0)
        return prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -8)
      })
    }, 60)
    return () => clearInterval(interval)
  }, [playing])

  // Stress bubbles flash on/off — pop them only while flashing
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setBubbles(prev => prev.map(b => b.stress ? { ...b, flashing: !b.flashing } : b))
    }, 500)
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

  const pop = useCallback((b: Bubble) => {
    setBubbles(prev => prev.filter(x => x.id !== b.id))
    if (b.stress) {
      if (b.flashing) {
        setScore(s => s + 20)
      } else {
        setScore(s => Math.max(0, s - 10))
        setChain(0)
      }
    } else {
      setChain(c => {
        const next = c + 1
        const bonus = Math.min(5, 1 + Math.floor(next / 4))
        setScore(s => s + 10 * bonus)
        return next
      })
    }
  }, [])

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const chainBonus = Math.min(5, 1 + Math.floor(chain / 4))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-pink-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Chain ×{chainBonus}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-pink-50 to-rose-100 rounded-2xl border-2 border-pink-200 overflow-hidden select-none"
        style={{ height: 220 }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🫧</div>
            <div className="font-fredoka text-xl text-gray-700">Zen Pop!</div>
            <p className="text-sm text-gray-500 text-center px-4">Pop calm bubbles to chain — pop angry ones only while they glow!</p>
            <button onClick={start} className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && bubbles.map(b => (
          <button
            key={b.id}
            className="absolute text-2xl hover:scale-125 transition-transform cursor-pointer select-none"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              filter: b.stress && b.flashing ? 'drop-shadow(0 0 8px #F59E0B)' : 'none',
              transform: b.stress && b.flashing ? 'scale(1.2)' : undefined,
            }}
            onClick={() => pop(b)}
          >
            {b.stress ? '😤' : '🫧'}
          </button>
        ))}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🧘</div>
            <div className="font-fredoka text-2xl text-gray-800">So zen!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-pink-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        🫧 +10 × chain · 😤 glowing +20, calm −10 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
