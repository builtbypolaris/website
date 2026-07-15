import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

export default function FocusBurst({ onXPEarned }: Props) {
  const [marker, setMarker] = useState(0)
  const [zoneStart, setZoneStart] = useState(40)
  const [zoneWidth, setZoneWidth] = useState(24)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const dirRef = useRef(1)

  const start = () => {
    setMarker(0)
    setZoneStart(40)
    setZoneWidth(24)
    setScore(0)
    setStreak(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
    dirRef.current = 1
  }

  // Oscillate the focus marker. Speeds up with streak
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setMarker(m => {
        const speed = 2.2 + Math.min(3, streak * 0.3)
        let next = m + dirRef.current * speed
        if (next >= 100) { next = 100; dirRef.current = -1 }
        if (next <= 0) { next = 0; dirRef.current = 1 }
        return next
      })
    }, 30)
    return () => clearInterval(interval)
  }, [playing, streak])

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

  const tap = () => {
    if (!playing) return
    const inZone = marker >= zoneStart && marker <= zoneStart + zoneWidth
    if (inZone) {
      const multiplier = Math.min(5, 1 + Math.floor(streak / 3))
      setScore(s => s + 10 * multiplier)
      setStreak(s => s + 1)
      setFlash('hit')
      // Move the zone and shrink it slightly as focus sharpens
      setZoneStart(8 + Math.random() * (84 - zoneWidth))
      setZoneWidth(w => Math.max(10, w - 1))
    } else {
      setScore(s => Math.max(0, s - 5))
      setStreak(0)
      setZoneWidth(24)
      setFlash('miss')
    }
    setTimeout(() => setFlash(null), 250)
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(streak / 3))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-violet-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Focus ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'hit' ? '#EDE9FE' : flash === 'miss' ? '#FEE2E2' : 'linear-gradient(to bottom, #F5F3FF, #EDE9FE)',
          borderColor: '#DDD6FE',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🎯</div>
            <div className="font-fredoka text-xl text-gray-700">Focus Burst!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap when the marker is inside the focus zone. Streaks multiply your score!</p>
            <button onClick={start} className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <button className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer" onClick={tap}>
            <div className="text-4xl">{streak >= 6 ? '🤓' : streak >= 3 ? '📚' : '🧠'}</div>

            {/* Focus meter */}
            <div className="relative w-4/5 h-6 rounded-full" style={{ background: '#DDD6FE' }}>
              <div
                className="absolute top-0 bottom-0 rounded-full"
                style={{ left: `${zoneStart}%`, width: `${zoneWidth}%`, background: '#34D399' }}
              />
              <div
                className="absolute top-[-6px] bottom-[-6px] w-1.5 rounded-full"
                style={{ left: `${marker}%`, background: '#6D28D9', transform: 'translateX(-50%)' }}
              />
            </div>

            <div className="font-nunito text-sm text-gray-500">Tap anywhere! Streak: {streak}</div>
          </button>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🧘</div>
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
        In-zone tap = 10pts × streak bonus · Miss = −5 & streak reset | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
