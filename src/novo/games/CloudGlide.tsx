import { useState, useEffect, useRef } from 'react'

interface Obstacle {
  id: number
  x: number
  y: number
  ray: boolean
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function CloudGlide({ onXPEarned }: Props) {
  const [birdY, setBirdY] = useState(50)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [hurt, setHurt] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const obsId = useRef(0)
  const velocity = useRef(0)
  const birdYRef = useRef(50)
  const hurtRef = useRef(false)
  birdYRef.current = birdY
  hurtRef.current = hurt

  const start = () => {
    setBirdY(50)
    velocity.current = 0
    setObstacles([])
    setScore(0)
    setHurt(false)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  const flap = () => {
    if (!playing) return
    velocity.current = -2.6
  }

  // Physics: gravity + drift obstacles left + collisions at the smiley column (x ≈ 18)
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      velocity.current = Math.min(3, velocity.current + 0.22)
      setBirdY(y => Math.min(92, Math.max(2, y + velocity.current)))

      setObstacles(prev => {
        const kept: Obstacle[] = []
        for (const o of prev) {
          const nx = o.x - 2.4
          if (nx <= 22 && nx > 13 && Math.abs(o.y - birdYRef.current) < 12) {
            if (o.ray) {
              setScore(s => s + 10)
            } else if (!hurtRef.current) {
              setScore(s => Math.max(0, s - 15))
              setHurt(true)
              setTimeout(() => setHurt(false), 700)
            }
            continue
          }
          if (nx > -10) kept.push({ ...o, x: nx })
        }
        return kept
      })
    }, 50)
    return () => clearInterval(interval)
  }, [playing])

  // Spawn clouds and sun rays from the right
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setObstacles(prev => [...prev.slice(-12), {
        id: obsId.current++,
        x: 104,
        y: 6 + Math.random() * 82,
        ray: Math.random() < 0.45,
      }])
    }, 650)
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

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-pink-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-sky-100 to-rose-50 rounded-2xl border-2 border-pink-200 overflow-hidden select-none cursor-pointer"
        style={{ height: 220 }}
        onPointerDown={flap}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🌤️</div>
            <div className="font-fredoka text-xl text-gray-700">Cloud Glide!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap to flap! Collect sun rays, glide past the storm clouds.</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && obstacles.map(o => (
          <div
            key={o.id}
            className="absolute text-2xl pointer-events-none"
            style={{ left: `${o.x}%`, top: `${o.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {o.ray ? '☀️' : '🌩️'}
          </div>
        ))}

        {playing && (
          <div
            className="absolute text-3xl pointer-events-none"
            style={{
              left: '18%',
              top: `${birdY}%`,
              transform: 'translate(-50%, -50%)',
              filter: hurt ? 'grayscale(1)' : 'none',
              opacity: hurt ? 0.6 : 1,
            }}
          >
            {hurt ? '😖' : '😊'}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🌈</div>
            <div className="font-fredoka text-2xl text-gray-800">Smooth glide!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-pink-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={e => { e.stopPropagation(); handleClaim() }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Tap to flap · ☀️ +10 · 🌩️ −15 & dazed | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
