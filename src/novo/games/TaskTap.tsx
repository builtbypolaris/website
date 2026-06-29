import { useState, useEffect, useRef, useCallback } from 'react'

interface Bubble {
  id: number
  x: number
  y: number
  label: string
  size: number
  born: number
  lifespan: number
}

const TASKS = ['Design', 'Write', 'Code', 'Review', 'Plan', 'Email', 'Meeting', 'Fix bug', 'Deploy', 'Test', 'Research', 'Call']

interface Props {
  onXPEarned: (xp: number) => void
}

export default function TaskTap({ onXPEarned }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const idRef = useRef(0)
  const nowRef = useRef(Date.now())

  const start = () => {
    setBubbles([])
    setScore(0)
    setMissed(0)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn bubbles
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const label = TASKS[Math.floor(Math.random() * TASKS.length)]
      const size = 48 + Math.floor(Math.random() * 24)
      setBubbles(prev => [
        ...prev.slice(-12),
        {
          id: idRef.current++,
          x: 5 + Math.random() * 80,
          y: 5 + Math.random() * 80,
          label,
          size,
          born: Date.now(),
          lifespan: 2000 + Math.random() * 1500,
        },
      ])
    }, 700)
    return () => clearInterval(interval)
  }, [playing])

  // Expire bubbles + track misses
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      nowRef.current = Date.now()
      setBubbles(prev => {
        const expired = prev.filter(b => nowRef.current - b.born > b.lifespan)
        if (expired.length > 0) setMissed(m => m + expired.length)
        return prev.filter(b => nowRef.current - b.born <= b.lifespan)
      })
    }, 200)
    return () => clearInterval(interval)
  }, [playing])

  // Timer
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPlaying(false); setDone(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing])

  const tapBubble = useCallback((id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id))
    setScore(s => s + 15)
  }, [])

  const xpEarned = Math.max(5, Math.floor((score - missed * 5) / 5))

  const handleClaim = () => {
    onXPEarned(xpEarned)
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-base text-gray-700">Tapped: <span className="text-emerald-500">{score}</span></div>
        <div className="font-fredoka text-base text-gray-700">Missed: <span className="text-red-400">{missed}</span></div>
        <div className="font-fredoka text-base text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 overflow-hidden"
        style={{ height: 220 }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-5xl">✅</div>
            <div className="font-fredoka text-xl text-gray-700">Task Tap!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap task bubbles before they disappear!</p>
            <button onClick={start} className="px-6 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && bubbles.map(bubble => {
          const age = Date.now() - bubble.born
          const opacity = Math.max(0.3, 1 - age / bubble.lifespan)
          return (
            <button
              key={bubble.id}
              className="absolute rounded-full bg-white border-2 border-emerald-400 shadow font-nunito font-bold text-gray-700 hover:scale-110 hover:bg-emerald-50 transition-all cursor-pointer select-none flex items-center justify-center"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                fontSize: bubble.size * 0.22,
                opacity,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => tapBubble(bubble.id)}
            >
              {bubble.label}
            </button>
          )
        })}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur">
            <div className="text-4xl">⏱️</div>
            <div className="font-fredoka text-2xl">Time's up!</div>
            <div className="font-nunito text-gray-600">
              Tapped: <span className="text-emerald-500 font-bold">{score}</span> · Missed: <span className="text-red-400 font-bold">{missed}</span>
            </div>
            <div className="font-nunito text-sm text-emerald-600">+{xpEarned} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
