import { useState, useEffect, useCallback } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const MOODS = ['😄', '😊', '😐', '😕', '😢', '🥰', '😴', '🤩']

type Cell = string | null

function makeBoard(cols: number, rows: number): Cell[] {
  const cellCount = cols * rows
  const pairCount = cellCount / 2
  const pool: string[] = []
  for (let i = 0; i < pairCount; i++) {
    pool.push(MOODS[i % MOODS.length])
  }
  const cells = [...pool, ...pool]
  // Fisher-Yates shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells
}

export default function EmojiFlow({ onXPEarned }: Props) {
  const [cols, setCols] = useState(4)
  const [board, setBoard] = useState<Cell[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [boardsCleared, setBoardsCleared] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const rows = 4

  const start = () => {
    setCols(4)
    setBoard(makeBoard(4, rows))
    setSelected(null)
    setScore(0)
    setBoardsCleared(0)
    setTimeLeft(60)
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

  // A pair is connectable when it shares a row or column with no tiles between
  const connectable = useCallback((a: number, b: number, cells: Cell[]) => {
    const [ar, ac] = [Math.floor(a / cols), a % cols]
    const [br, bc] = [Math.floor(b / cols), b % cols]
    if (ar === br) {
      const [lo, hi] = [Math.min(ac, bc), Math.max(ac, bc)]
      for (let c = lo + 1; c < hi; c++) {
        if (cells[ar * cols + c] !== null) return false
      }
      return true
    }
    if (ac === bc) {
      const [lo, hi] = [Math.min(ar, br), Math.max(ar, br)]
      for (let r = lo + 1; r < hi; r++) {
        if (cells[r * cols + ac] !== null) return false
      }
      return true
    }
    return false
  }, [cols])

  const tap = (i: number) => {
    if (!playing || board[i] === null) return
    if (selected === null) {
      setSelected(i)
      return
    }
    if (selected === i) {
      setSelected(null)
      return
    }
    if (board[selected] === board[i] && connectable(selected, i, board)) {
      const next = [...board]
      next[selected] = null
      next[i] = null
      setScore(s => s + 20)
      setSelected(null)
      if (next.every(c => c === null)) {
        // Board cleared. Bigger board, bonus points and bonus time
        const nextCols = Math.min(6, cols + 1)
        setBoardsCleared(n => n + 1)
        setScore(s => s + 50)
        setTimeLeft(t => t + 15)
        setCols(nextCols)
        setBoard(makeBoard(nextCols, rows))
      } else {
        setBoard(next)
      }
    } else {
      setWrong(i)
      setSelected(null)
      setTimeout(() => setWrong(null), 300)
    }
  }

  const shuffle = () => {
    if (!playing) return
    const remaining = board.filter((c): c is string => c !== null)
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[remaining[i], remaining[j]] = [remaining[j], remaining[i]]
    }
    let k = 0
    setBoard(board.map(c => (c === null ? null : remaining[k++])))
    setScore(s => Math.max(0, s - 10))
    setSelected(null)
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-pink-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Board {boardsCleared + 1}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-pink-200 overflow-hidden select-none"
        style={{ minHeight: 220, background: 'linear-gradient(to bottom, #FDF2F8, #FCE7F3)' }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🔗</div>
            <div className="font-fredoka text-xl text-gray-700">Emoji Flow!</div>
            <p className="text-sm text-gray-500 text-center px-4">Link matching moods along a clear row or column. Clear the board!</p>
            <button onClick={start} className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="p-3 flex flex-col items-center gap-2">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {board.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => tap(i)}
                  disabled={cell === null}
                  className="rounded-lg text-xl transition active:scale-90"
                  style={{
                    width: cols >= 6 ? 40 : 48,
                    height: cols >= 6 ? 40 : 44,
                    background: cell === null ? 'transparent' : 'white',
                    border: cell === null
                      ? '2px dashed rgba(219,39,119,0.12)'
                      : selected === i
                        ? '2px solid #DB2777'
                        : wrong === i
                          ? '2px solid #DC2626'
                          : '2px solid #FBCFE8',
                    boxShadow: selected === i ? '0 0 10px rgba(219,39,119,0.35)' : 'none',
                  }}
                >
                  {cell}
                </button>
              ))}
            </div>
            <button
              onClick={shuffle}
              className="mt-1 px-4 py-1.5 rounded-full bg-white border-2 border-pink-200 font-nunito font-bold text-xs text-gray-600 hover:border-pink-400 transition"
            >
              🔀 Shuffle (−10)
            </button>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">💞</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">
              Score: <span className="font-bold text-pink-500">{score}</span> · {boardsCleared} board{boardsCleared === 1 ? '' : 's'} cleared
            </div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Match = +20 · Clear board = +50 & +15s · Shuffle = −10 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
