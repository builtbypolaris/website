import { useState, useEffect, useRef } from 'react'

interface Cart {
  id: number
  x: number
  speed: number
}

interface Suitcase {
  id: number
  x: number
  y: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function BaggageDrop({ onXPEarned }: Props) {
  const [clawX, setClawX] = useState(50)
  const [carts, setCarts] = useState<Cart[]>([])
  const [drops, setDrops] = useState<Suitcase[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const cartId = useRef(0)
  const dropId = useRef(0)
  const dirRef = useRef(1)

  const start = () => {
    setClawX(50)
    setCarts([])
    setDrops([])
    setScore(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
    dirRef.current = 1
  }

  // Claw auto-sweeps; speed ramps as time passes
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setClawX(x => {
        const speed = 1.6 + (30 - timeLeft) / 20
        let next = x + dirRef.current * speed
        if (next >= 92) { next = 92; dirRef.current = -1 }
        if (next <= 8) { next = 8; dirRef.current = 1 }
        return next
      })
    }, 40)
    return () => clearInterval(interval)
  }, [playing, timeLeft])

  // Carts roll through; suitcases fall
  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      setCarts(prev => [...prev.slice(-3), {
        id: cartId.current++,
        x: -12,
        speed: 1.3 + Math.random() * 1.2 + (30 - timeLeft) / 30,
      }])
    }, 1600)
    const move = setInterval(() => {
      setCarts(prev => prev.map(c => ({ ...c, x: c.x + c.speed })).filter(c => c.x < 112))
      setDrops(prev => {
        const kept: Suitcase[] = []
        for (const s of prev) {
          const ny = s.y + 4
          if (ny >= 72) {
            // Landed — did it hit a cart?
            setCarts(current => {
              const hit = current.find(c => Math.abs(c.x - s.x) < 10)
              if (hit) {
                setScore(sc => sc + 15)
                setFlash('hit')
              } else {
                setScore(sc => Math.max(0, sc - 5))
                setFlash('miss')
              }
              setTimeout(() => setFlash(null), 200)
              return current
            })
            continue
          }
          kept.push({ ...s, y: ny })
        }
        return kept
      })
    }, 40)
    return () => { clearInterval(spawn); clearInterval(move) }
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

  const drop = () => {
    if (!playing) return
    setDrops(prev => [...prev.slice(-4), { id: dropId.current++, x: clawX, y: 14 }])
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-orange-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none cursor-pointer transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'hit' ? '#FFEDD5' : flash === 'miss' ? '#FEE2E2' : 'linear-gradient(to bottom, #FFF7ED, #FFEDD5)',
          borderColor: '#FED7AA',
        }}
        onPointerDown={drop}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🧳</div>
            <div className="font-fredoka text-xl text-gray-700">Baggage Drop!</div>
            <p className="text-sm text-gray-500 text-center px-4">The claw sweeps on its own — tap to drop suitcases onto the moving carts!</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Claw rail */}
            <div className="absolute top-3 left-0 right-0 h-1 bg-orange-200" />
            {/* Claw */}
            <div className="absolute text-2xl" style={{ left: `${clawX}%`, top: 8, transform: 'translateX(-50%)' }}>
              🏗️
            </div>
            {/* Falling suitcases */}
            {drops.map(s => (
              <div key={s.id} className="absolute text-xl" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translateX(-50%)' }}>
                🧳
              </div>
            ))}
            {/* Belt */}
            <div className="absolute left-0 right-0 h-1.5 bg-orange-300" style={{ top: '78%' }} />
            {/* Carts */}
            {carts.map(c => (
              <div key={c.id} className="absolute text-2xl" style={{ left: `${c.x}%`, top: '68%', transform: 'translateX(-50%)' }}>
                🛺
              </div>
            ))}
            <div className="absolute bottom-2 left-0 right-0 text-center font-nunito text-[10px] text-orange-300">
              tap anywhere to release
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">✈️</div>
            <div className="font-fredoka text-2xl text-gray-800">All aboard!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-orange-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={e => { e.stopPropagation(); handleClaim() }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Landed on cart +15 · Missed the cart −5 · Everything speeds up | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
