import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const ROWS = 8
const LEAF_ROW = 6  // which river row the leaf floats on

export default function CalmCurrent({ onXPEarned }: Props) {
  const [leafX, setLeafX] = useState(50)
  const [phase, setPhase] = useState(0)
  const [width, setWidth] = useState(34)
  const [score, setScore] = useState(0)
  const [inside, setInside] = useState(true)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const leafXRef = useRef(50)
  leafXRef.current = leafX

  const start = () => {
    setLeafX(50)
    setPhase(0)
    setWidth(34)
    setScore(0)
    setInside(true)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  const riverCenter = (row: number, ph: number) =>
    50 + Math.sin(ph / 40 + row * 0.7) * 22 + Math.sin(ph / 90 + row * 0.3) * 8

  // The river winds; the banks narrow; points accrue while the leaf stays in the water
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPhase(p => p + 2)
      setWidth(w => Math.max(14, w - 0.03))
      const center = riverCenter(LEAF_ROW, phase + 2)
      const isIn = Math.abs(leafXRef.current - center) < width / 2
      setInside(isIn)
      if (isIn) setScore(s => s + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [playing, phase, width])

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
    if (!playing || !areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setLeafX(Math.min(96, Math.max(4, pct)))
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-rose-500">{score}</span></div>
        <div className="font-fredoka text-sm" style={{ color: inside ? '#16A34A' : '#DC2626' }}>{inside ? 'floating ✓' : 'beached!'}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm rounded-2xl border-2 border-rose-200 overflow-hidden select-none touch-none"
        style={{ height: 220, background: '#FDF2F8' }}
        onMouseMove={e => track(e.clientX)}
        onTouchMove={e => track(e.touches[0].clientX)}
        onTouchStart={e => track(e.touches[0].clientX)}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-rose-50">
            <div className="text-5xl">🍃</div>
            <div className="font-fredoka text-xl text-gray-700">Calm Current!</div>
            <p className="text-sm text-gray-500 text-center px-4">Guide the leaf along the winding river. The banks narrow as you go!</p>
            <button onClick={start} className="px-6 py-2 bg-rose-400 hover:bg-rose-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <>
            {/* River segments */}
            {Array.from({ length: ROWS }).map((_, row) => {
              const center = riverCenter(row, phase)
              return (
                <div
                  key={row}
                  className="absolute rounded-full"
                  style={{
                    left: `${center - width / 2}%`,
                    width: `${width}%`,
                    top: `${(row / ROWS) * 100}%`,
                    height: `${100 / ROWS + 2}%`,
                    background: 'linear-gradient(to bottom, #A5B4FC55, #818CF855)',
                    transition: 'left 0.1s linear, width 0.3s',
                  }}
                />
              )
            })}

            {/* Leaf */}
            <div
              className="absolute text-2xl pointer-events-none"
              style={{
                left: `${leafX}%`,
                top: `${(LEAF_ROW / ROWS) * 100}%`,
                transform: `translateX(-50%) rotate(${Math.sin(phase / 20) * 20}deg)`,
                filter: inside ? 'none' : 'grayscale(1)',
              }}
            >
              🍃
            </div>

            <div className="absolute bottom-1 left-0 right-0 text-center font-nunito text-[10px] text-rose-300">
              move with mouse / finger
            </div>
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🏞️</div>
            <div className="font-fredoka text-2xl text-gray-800">Journey's end!</div>
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
        +1 per moment afloat · Banks narrow over time | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
