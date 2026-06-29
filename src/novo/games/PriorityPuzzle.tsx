import { useState } from 'react'

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
const LABELS: Record<number, string> = {
  1: '🔴 Urgent', 2: '🔴 Critical', 3: '🔴 Blocker', 4: '🟠 High',
  5: '🟠 Important', 6: '🟠 Needed', 7: '🟡 Normal', 8: '🟡 Medium',
  9: '🟡 Todo', 10: '🟢 Low', 11: '🟢 Later', 12: '🟢 Someday',
  13: '⚪ Idea', 14: '⚪ Maybe', 15: '⚪ Optional', 0: '',
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  // Ensure solvability: count inversions; if odd, swap first two non-zero
  const flatWithout0 = a.filter(x => x !== 0)
  let inv = 0
  for (let i = 0; i < flatWithout0.length; i++)
    for (let j = i + 1; j < flatWithout0.length; j++)
      if (flatWithout0[i] > flatWithout0[j]) inv++
  const zeroRow = Math.floor(a.indexOf(0) / 4)
  const fromBottom = 4 - zeroRow
  const solvable = (inv % 2 === 0) === (fromBottom % 2 === 1)
  if (!solvable) {
    const i0 = a.findIndex(x => x !== 0)
    const i1 = a.findIndex((x, i) => x !== 0 && i > i0);
    [a[i0], a[i1]] = [a[i1], a[i0]]
  }
  return a
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function PriorityPuzzle({ onXPEarned }: Props) {
  const [tiles, setTiles] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [_startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null)

  const initGame = () => {
    const shuffled = shuffle(SOLVED)
    setTiles(shuffled)
    setMoves(0)
    setDone(false)
    setStartTime(Date.now())
    setPlaying(true)
    const _id = setInterval(() => setElapsed(Math.floor((Date.now() - Date.now()) / 1000)), 1000)
    // restart timer properly
    const start = Date.now()
    setStartTime(start)
    const tid = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    if (timerId) clearInterval(timerId)
    setTimerId(tid)
  }

  const click = (idx: number) => {
    if (!playing || done) return
    const zeroIdx = tiles.indexOf(0)
    const row = Math.floor(idx / 4), col = idx % 4
    const zRow = Math.floor(zeroIdx / 4), zCol = zeroIdx % 4
    const adjacent =
      (Math.abs(row - zRow) === 1 && col === zCol) ||
      (Math.abs(col - zCol) === 1 && row === zRow)
    if (!adjacent) return

    const newTiles = [...tiles]
    newTiles[zeroIdx] = newTiles[idx]
    newTiles[idx] = 0
    setTiles(newTiles)
    setMoves(m => m + 1)

    if (JSON.stringify(newTiles) === JSON.stringify(SOLVED)) {
      setPlaying(false)
      setDone(true)
      if (timerId) clearInterval(timerId)
    }
  }

  const xpEarned = Math.max(20, 100 - Math.floor(moves / 2))

  const handleClaim = () => {
    onXPEarned(xpEarned)
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {playing && (
        <div className="flex gap-6 font-fredoka text-base text-gray-600">
          <span>Moves: <span className="text-indigo-500 font-bold">{moves}</span></span>
          <span>Time: <span className="text-amber-500 font-bold">{elapsed}s</span></span>
        </div>
      )}

      {!playing && !done && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="text-5xl">🧩</div>
          <div className="font-fredoka text-xl text-gray-700">Priority Puzzle!</div>
          <p className="text-sm text-gray-500 text-center px-2">Slide tiles to sort tasks from Urgent (red) to Optional (white). Fewer moves = more XP!</p>
          <button onClick={initGame} className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-fredoka text-lg rounded-full shadow transition">
            Shuffle & Play! 🎮
          </button>
        </div>
      )}

      {playing && (
        <div className="grid grid-cols-4 gap-1 p-2 bg-violet-50 rounded-2xl border-2 border-violet-200">
          {tiles.map((val, idx) => (
            <button
              key={idx}
              className={`h-14 w-full rounded-xl text-xs font-nunito font-bold transition-all border-2 ${
                val === 0
                  ? 'bg-transparent border-transparent'
                  : 'bg-white border-violet-200 hover:border-violet-400 hover:bg-violet-50 shadow active:scale-95'
              }`}
              style={{ lineHeight: 1.2, padding: '2px 4px' }}
              onClick={() => click(idx)}
            >
              {val !== 0 ? LABELS[val] : ''}
            </button>
          ))}
        </div>
      )}

      {done && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-5xl">🏆</div>
          <div className="font-fredoka text-2xl text-gray-800">Sorted!</div>
          <div className="font-nunito text-gray-600">{moves} moves in {elapsed}s</div>
          <div className="font-nunito text-sm text-emerald-600 font-bold">+{xpEarned} XP!</div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
            <button onClick={initGame} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Play Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
