import { useState, useEffect, useCallback } from 'react'

type Cell = 0 | 1 // 0=path, 1=wall

const MAZES: Cell[][][] = [
  [
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
]

interface Props {
  onXPEarned: (xp: number) => void
}

export default function HabitMaze({ onXPEarned }: Props) {
  const [maze, setMaze] = useState<Cell[][]>([])
  const [pos, setPos] = useState({ r: 0, c: 0 })
  const [moves, setMoves] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const ROWS = 7, COLS = 7

  const start = () => {
    const m = MAZES[Math.floor(Math.random() * MAZES.length)]
    setMaze(m)
    setPos({ r: 0, c: 0 })
    setMoves(0)
    setStartTime(Date.now())
    setElapsed(0)
    setDone(false)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500)
    return () => clearInterval(interval)
  }, [playing, startTime])

  const move = useCallback((dr: number, dc: number) => {
    if (!playing || done) return
    setPos(p => {
      const nr = p.r + dr, nc = p.c + dc
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return p
      if (maze[nr]?.[nc] === 1) return p
      setMoves(m => m + 1)
      if (nr === ROWS - 1 && nc === COLS - 1) {
        setPlaying(false)
        setDone(true)
      }
      return { r: nr, c: nc }
    })
  }, [playing, done, maze])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1, 0) }
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1, 0) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(0, -1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); move(0, 1) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [move])

  const xpEarned = Math.max(10, 60 - Math.floor(moves / 3))

  const handleClaim = () => {
    onXPEarned(xpEarned)
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {playing && (
        <div className="flex gap-6 font-fredoka text-base text-gray-600">
          <span>Moves: <span className="text-teal-500 font-bold">{moves}</span></span>
          <span>Time: <span className="text-amber-500 font-bold">{elapsed}s</span></span>
        </div>
      )}

      {!playing && !done && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="text-5xl">🌿</div>
          <div className="font-fredoka text-xl text-gray-700">Habit Maze!</div>
          <p className="text-sm text-gray-500 text-center px-2">Navigate 🏃 from top-left to ⭐ bottom-right. Use arrow keys or the buttons below!</p>
          <button onClick={start} className="px-6 py-2 bg-teal-400 hover:bg-teal-500 text-white font-fredoka text-lg rounded-full shadow transition">
            Enter Maze! 🎮
          </button>
        </div>
      )}

      {(playing || done) && maze.length > 0 && (
        <div
          className="grid gap-0.5 p-2 bg-teal-50 rounded-2xl border-2 border-teal-200"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = pos.r === r && pos.c === c
              const isGoal = r === ROWS - 1 && c === COLS - 1
              const isStart = r === 0 && c === 0
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center text-sm rounded-md transition-colors ${
                    cell === 1
                      ? 'bg-teal-700'
                      : isPlayer
                      ? 'bg-teal-100'
                      : isGoal
                      ? 'bg-yellow-100'
                      : isStart
                      ? 'bg-green-100'
                      : 'bg-white border border-teal-100'
                  }`}
                  style={{ width: 34, height: 34 }}
                >
                  {isPlayer ? '🏃' : isGoal ? '⭐' : isStart && !isPlayer ? '' : ''}
                </div>
              )
            })
          )}
        </div>
      )}

      {playing && (
        <div className="grid grid-cols-3 gap-1 mt-1">
          <div />
          <button onClick={() => move(-1, 0)} className="h-9 w-9 bg-teal-100 hover:bg-teal-200 rounded-xl text-lg font-bold">↑</button>
          <div />
          <button onClick={() => move(0, -1)} className="h-9 w-9 bg-teal-100 hover:bg-teal-200 rounded-xl text-lg font-bold">←</button>
          <button onClick={() => move(1, 0)} className="h-9 w-9 bg-teal-100 hover:bg-teal-200 rounded-xl text-lg font-bold">↓</button>
          <button onClick={() => move(0, 1)} className="h-9 w-9 bg-teal-100 hover:bg-teal-200 rounded-xl text-lg font-bold">→</button>
        </div>
      )}

      {done && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="text-4xl">🏆</div>
          <div className="font-fredoka text-2xl">Escaped!</div>
          <div className="font-nunito text-gray-600">{moves} moves in {elapsed}s</div>
          <div className="font-nunito text-sm text-emerald-600">+{xpEarned} XP!</div>
          <div className="flex gap-2">
            <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
            <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">New Maze</button>
          </div>
        </div>
      )}
    </div>
  )
}
