import { useState, useEffect, useRef } from 'react'

interface Item {
  id: number
  lane: number
  y: number
  bad: boolean
}

interface Props {
  onXPEarned: (xp: number) => void
}

const LANE_X = ['16%', '50%', '84%']

export default function VaultDash({ onXPEarned }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [lane, setLane] = useState(1)
  const [score, setScore] = useState(0)
  const [stunned, setStunned] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const itemId = useRef(0)
  const laneRef = useRef(1)
  const stunnedRef = useRef(false)
  laneRef.current = lane
  stunnedRef.current = stunned

  const start = () => {
    setItems([])
    setLane(1)
    setScore(0)
    setStunned(false)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn items. Speed of the game comes from a shrinking spawn interval feel via elapsed time
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => [...prev.slice(-10), {
        id: itemId.current++,
        lane: Math.floor(Math.random() * 3),
        y: 0,
        bad: Math.random() < 0.35,
      }])
    }, 700)
    return () => clearInterval(interval)
  }, [playing])

  // Move items + collisions at the piggy row
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => {
        const kept: Item[] = []
        for (const it of prev) {
          const speedBoost = 1 + (30 - Math.max(timeLeft, 1)) / 30  // ramps up as time passes
          const ny = it.y + 2.2 * speedBoost
          if (ny >= 78 && ny < 92 && it.lane === laneRef.current) {
            if (it.bad) {
              if (!stunnedRef.current) {
                setScore(s => Math.max(0, s - 20))
                setStunned(true)
                setTimeout(() => setStunned(false), 800)
              }
            } else {
              setScore(s => s + 10)
            }
            continue  // consumed
          }
          if (ny < 100) kept.push({ ...it, y: ny })
        }
        return kept
      })
    }, 60)
    return () => clearInterval(interval)
  }, [playing, timeLeft])

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

  const move = (dir: -1 | 1) => {
    if (stunned) return
    setLane(l => Math.min(2, Math.max(0, l + dir)))
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-teal-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-emerald-50 to-teal-100 rounded-2xl border-2 border-teal-200 overflow-hidden select-none"
        style={{ height: 220 }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🐖</div>
            <div className="font-fredoka text-xl text-gray-700">Vault Dash!</div>
            <p className="text-sm text-gray-500 text-center px-4">Slide between lanes. Collect coins, dodge the shopping carts!</p>
            <button onClick={start} className="px-6 py-2 bg-teal-400 hover:bg-teal-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {/* Lane guides */}
        {playing && [1, 2].map(i => (
          <div key={i} className="absolute top-0 bottom-0 border-l border-dashed border-teal-200" style={{ left: `${i * 33.3}%` }} />
        ))}

        {playing && items.map(it => (
          <div
            key={it.id}
            className="absolute text-2xl pointer-events-none"
            style={{ left: LANE_X[it.lane], top: `${it.y}%`, transform: 'translateX(-50%)' }}
          >
            {it.bad ? '🛒' : '🪙'}
          </div>
        ))}

        {/* Piggy */}
        {playing && (
          <div
            className="absolute text-4xl transition-all duration-150"
            style={{
              left: LANE_X[lane],
              top: '78%',
              transform: 'translateX(-50%)',
              filter: stunned ? 'grayscale(1)' : 'none',
              opacity: stunned ? 0.6 : 1,
            }}
          >
            🐖
          </div>
        )}

        {/* Touch controls: tap left/right half to move */}
        {playing && (
          <>
            <button className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize" onClick={() => move(-1)} aria-label="Move left" />
            <button className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize" onClick={() => move(1)} aria-label="Move right" />
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🎉</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-teal-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Tap left / right side to switch lanes · 🪙 +10 · 🛒 −20 & stun | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
