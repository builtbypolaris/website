import { useState, useEffect } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const ROWS = 4
const HALF = 3  // columns per half

function makePattern(cellCount: number): Set<number> {
  // Random cells in the left half (index = row * HALF + col)
  const all = Array.from({ length: ROWS * HALF }, (_, i) => i)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return new Set(all.slice(0, cellCount))
}

export default function SymmetryBloom({ onXPEarned }: Props) {
  const [pattern, setPattern] = useState<Set<number>>(new Set())
  const [marks, setMarks] = useState<Set<number>>(new Set())
  const [level, setLevel] = useState(3)
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [flash, setFlash] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const start = () => {
    setPattern(makePattern(3))
    setMarks(new Set())
    setLevel(3)
    setScore(0)
    setSolved(0)
    setTimeLeft(45)
    setDone(false)
    setPlaying(true)
  }

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

  const toggle = (i: number) => {
    if (!playing) return
    const next = new Set(marks)
    if (next.has(i)) next.delete(i)
    else next.add(i)

    // The mirror of left cell (row, col) is right cell (row, HALF-1-col). Same index space
    const target = new Set([...pattern].map(p => {
      const r = Math.floor(p / HALF)
      const c = p % HALF
      return r * HALF + (HALF - 1 - c)
    }))
    if (next.size === target.size && [...next].every(m => target.has(m))) {
      const gained = 30 + level * 2
      setScore(s => s + gained)
      setSolved(n => n + 1)
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
      const nextLevel = Math.min(8, level + 1)
      setLevel(nextLevel)
      setPattern(makePattern(nextLevel))
      setMarks(new Set())
    } else {
      setMarks(next)
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-rose-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{solved} bloomed</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-rose-200 overflow-hidden select-none transition-colors duration-300"
        style={{ height: 220, background: flash ? '#FCE7F3' : 'linear-gradient(to bottom, #FFF1F2, #FFE4E6)' }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🌸</div>
            <div className="font-fredoka text-xl text-gray-700">Symmetry Bloom!</div>
            <p className="text-sm text-gray-500 text-center px-4">Mirror the left half of the flower onto the right side!</p>
            <button onClick={start} className="px-6 py-2 bg-rose-400 hover:bg-rose-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {/* Left half. The pattern to mirror */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${HALF}, 1fr)` }}>
              {Array.from({ length: ROWS * HALF }).map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: pattern.has(i) ? '#FDA4AF' : 'white', border: '1px solid #FECDD3' }}
                >
                  {pattern.has(i) ? '🌸' : ''}
                </div>
              ))}
            </div>

            {/* Mirror line */}
            <div className="w-0.5 self-stretch my-6 rounded-full" style={{ background: '#FB7185' }} />

            {/* Right half. The player's side */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${HALF}, 1fr)` }}>
              {Array.from({ length: ROWS * HALF }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition active:scale-90"
                  style={{ background: marks.has(i) ? '#FDA4AF' : 'white', border: '1px solid #FECDD3' }}
                >
                  {marks.has(i) ? '🌸' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">💐</div>
            <div className="font-fredoka text-2xl text-gray-800">Garden's full!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-rose-500">{score}</span> · {solved} flowers</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Perfect mirror = +30 & grows · Tap to toggle petals | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
