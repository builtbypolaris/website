import { useState, useEffect, useCallback } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const COLS = 5
const ROWS = 4

// Each shape is a list of [row, col] offsets from the anchor cell
const SHAPES: { name: string; cells: [number, number][]; color: string }[] = [
  { name: 'Meeting (1×2)', cells: [[0, 0], [0, 1]], color: '#7DD3FC' },
  { name: 'Sprint (1×3)', cells: [[0, 0], [0, 1], [0, 2]], color: '#86EFAC' },
  { name: 'Deep work (2×2)', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: '#FDBA74' },
  { name: 'Call (2×1)', cells: [[0, 0], [1, 0]], color: '#F0ABFC' },
]

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)]
}

export default function ScheduleFit({ onXPEarned }: Props) {
  const [board, setBoard] = useState<(string | null)[]>([])  // color per cell
  const [shape, setShape] = useState(SHAPES[0])
  const [score, setScore] = useState(0)
  const [placed, setPlaced] = useState(0)
  const [shake, setShake] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const start = () => {
    setBoard(Array(COLS * ROWS).fill(null))
    setShape(randomShape())
    setScore(0)
    setPlaced(0)
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

  const canPlace = useCallback((anchor: number, cells: [number, number][], b: (string | null)[]) => {
    const ar = Math.floor(anchor / COLS)
    const ac = anchor % COLS
    return cells.every(([dr, dc]) => {
      const r = ar + dr
      const c = ac + dc
      return r < ROWS && c < COLS && b[r * COLS + c] === null
    })
  }, [])

  const anyFit = useCallback((cells: [number, number][], b: (string | null)[]) => {
    for (let i = 0; i < b.length; i++) {
      if (canPlace(i, cells, b)) return true
    }
    return false
  }, [canPlace])

  const place = (anchor: number) => {
    if (!playing) return
    if (!canPlace(anchor, shape.cells, board)) {
      setShake(true)
      setTimeout(() => setShake(false), 300)
      return
    }
    const ar = Math.floor(anchor / COLS)
    const ac = anchor % COLS
    const next = [...board]
    for (const [dr, dc] of shape.cells) {
      next[(ar + dr) * COLS + (ac + dc)] = shape.color
    }
    let gained = 15
    // Bonus for each fully-booked row
    for (let r = 0; r < ROWS; r++) {
      const wasFull = board.slice(r * COLS, r * COLS + COLS).every(c => c !== null)
      const isFull = next.slice(r * COLS, r * COLS + COLS).every(c => c !== null)
      if (isFull && !wasFull) gained += 30
    }
    setScore(s => s + gained)
    setPlaced(p => p + 1)

    const nextShape = randomShape()
    if (!anyFit(nextShape.cells, next)) {
      // Week is packed — fresh week, bonus
      setScore(s => s + 20)
      setBoard(Array(COLS * ROWS).fill(null))
    } else {
      setBoard(next)
    }
    setShape(nextShape)
  }

  const skip = () => {
    if (!playing) return
    setScore(s => Math.max(0, s - 5))
    setShape(randomShape())
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-sky-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{placed} booked</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-sky-200 overflow-hidden select-none"
        style={{
          minHeight: 220,
          background: 'linear-gradient(to bottom, #F0F9FF, #E0F2FE)',
          animation: shake ? 'shake 0.3s' : undefined,
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🗓️</div>
            <div className="font-fredoka text-xl text-gray-700">Schedule Fit!</div>
            <p className="text-sm text-gray-500 text-center px-4">Pack jobs into your week — tap where the block's top-left corner goes!</p>
            <button onClick={start} className="px-6 py-2 bg-sky-400 hover:bg-sky-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="p-3 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-nunito text-xs text-gray-500">Next:</span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-sky-200">
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${Math.max(...shape.cells.map(c => c[1])) + 1}, 12px)` }}
                >
                  {Array.from({ length: (Math.max(...shape.cells.map(c => c[0])) + 1) * (Math.max(...shape.cells.map(c => c[1])) + 1) }).map((_, i) => {
                    const cols = Math.max(...shape.cells.map(c => c[1])) + 1
                    const r = Math.floor(i / cols)
                    const c = i % cols
                    const on = shape.cells.some(([dr, dc]) => dr === r && dc === c)
                    return <div key={i} className="w-3 h-3 rounded-sm" style={{ background: on ? shape.color : 'transparent' }} />
                  })}
                </div>
                <span className="font-nunito text-[10px] text-gray-500 ml-1">{shape.name}</span>
              </div>
              <button onClick={skip} className="font-nunito text-[10px] text-gray-400 underline">skip −5</button>
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {board.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => place(i)}
                  className="rounded-md transition active:scale-95"
                  style={{
                    width: 42, height: 30,
                    background: cell ?? 'white',
                    border: cell ? '1px solid rgba(0,0,0,0.08)' : '1px dashed #BAE6FD',
                  }}
                />
              ))}
            </div>
            <div className="font-nunito text-[10px] text-gray-400">Mon — Fri · 4 slots a day</div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">📆</div>
            <div className="font-fredoka text-2xl text-gray-800">Week planned!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-sky-500">{score}</span> · {placed} jobs booked</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Place block +15 · Full row +30 · Packed week +20 & resets | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
