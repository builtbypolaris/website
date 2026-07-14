import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

export default function MoonTrace({ onXPEarned }: Props) {
  const [moonPos, setMoonPos] = useState({ x: 50, y: 50 })
  const [fill, setFill] = useState(0)
  const [holding, setHolding] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [flash, setFlash] = useState<'full' | 'pop' | 'early' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const holdingRef = useRef(false)
  holdingRef.current = holding

  const newMoon = () => {
    setMoonPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 55 })
    setFill(0)
  }

  const start = () => {
    newMoon()
    setScore(0)
    setStreak(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
    setHolding(false)
  }

  // Fill while holding; overfill pops the moon
  useEffect(() => {
    if (!playing || !holding) return
    const interval = setInterval(() => {
      setFill(f => {
        const speed = 2.2 + Math.min(2, streak * 0.25)
        const next = f + speed
        if (next >= 112) {
          // Popped!
          setScore(s => Math.max(0, s - 5))
          setStreak(0)
          setFlash('pop')
          setTimeout(() => setFlash(null), 300)
          setHolding(false)
          newMoon()
          return 0
        }
        return next
      })
    }, 40)
    return () => clearInterval(interval)
  }, [playing, holding, streak])

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

  const release = () => {
    if (!playing || !holdingRef.current) return
    setHolding(false)
    if (fill >= 88 && fill <= 112) {
      const bonus = Math.min(5, 1 + Math.floor(streak / 3))
      setScore(s => s + 10 * bonus)
      setStreak(st => st + 1)
      setFlash('full')
    } else if (fill > 0) {
      setStreak(0)
      setFlash('early')
    }
    setTimeout(() => setFlash(null), 300)
    newMoon()
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(streak / 3))
  const moonSize = 34 + (fill / 100) * 26

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-rose-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Glow ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'full' ? '#FCE7F3' : flash === 'pop' || flash === 'early' ? '#FEE2E2' : 'linear-gradient(to bottom, #1E1B4B, #312E81)',
          borderColor: '#FBCFE8',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: 'linear-gradient(to bottom, #FFF1F2, #FFE4E6)' }}>
            <div className="text-5xl">🌙</div>
            <div className="font-fredoka text-xl text-gray-700">Moon Trace!</div>
            <p className="text-sm text-gray-500 text-center px-4">Hold to fill each moon to full — release right at the brim, don't pop it!</p>
            <button onClick={start} className="px-6 py-2 bg-rose-400 hover:bg-rose-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <button
            className="absolute inset-0 cursor-pointer"
            onPointerDown={() => setHolding(true)}
            onPointerUp={release}
            onPointerLeave={release}
          >
            {/* Stars */}
            {[15, 35, 60, 80, 25, 70].map((x, i) => (
              <span key={i} className="absolute text-xs" style={{ left: `${x}%`, top: `${(i * 17) % 80 + 5}%`, opacity: 0.5 }}>✦</span>
            ))}

            {/* The moon */}
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                left: `${moonPos.x}%`,
                top: `${moonPos.y}%`,
                width: moonSize,
                height: moonSize,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, #FEF9C3 ${fill}%, #4C1D95 ${fill}%)`,
                boxShadow: fill >= 88 ? '0 0 24px rgba(254,240,138,0.9)' : '0 0 10px rgba(254,240,138,0.3)',
                border: '2px solid rgba(254,240,138,0.5)',
                transition: 'box-shadow 0.15s',
              }}
            >
              <span className="font-nunito font-bold text-[10px]" style={{ color: fill > 55 ? '#78350F' : '#FEF9C3' }}>
                {Math.min(100, Math.round(fill))}%
              </span>
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center font-nunito text-[10px] text-purple-200">
              hold to fill · release at 90-100%
            </div>
          </button>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🌕</div>
            <div className="font-fredoka text-2xl text-gray-800">Night's over!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-rose-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Full moon = 10 × glow streak · Pop −5 · Early release resets streak | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
