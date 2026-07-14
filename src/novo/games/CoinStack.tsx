import { useState, useEffect, useRef, useCallback } from 'react'

interface FallingCoin {
  id: number
  x: number
  y: number
  speed: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function CoinStack({ onXPEarned }: Props) {
  const [coins, setCoins] = useState<FallingCoin[]>([])
  const [stack, setStack] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [toppled, setToppled] = useState(false)
  const coinId = useRef(0)

  const start = () => {
    setCoins([])
    setStack(0)
    setScore(0)
    setCombo(0)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn coins
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setCoins(prev => [...prev.slice(-8), {
        id: coinId.current++,
        x: 8 + Math.random() * 78,
        y: 0,
        speed: 1.6 + Math.random() * 1.8,
      }])
    }, 900)
    return () => clearInterval(interval)
  }, [playing])

  // Move coins down; a coin that hits the floor is a miss — combo resets and the tower topples a bit
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setCoins(prev => {
        const missed = prev.filter(c => c.y + c.speed >= 100)
        if (missed.length > 0) {
          setCombo(0)
          setStack(s => {
            if (s > 0) {
              setToppled(true)
              setTimeout(() => setToppled(false), 400)
            }
            return Math.max(0, s - 3)
          })
        }
        return prev
          .map(c => ({ ...c, y: c.y + c.speed }))
          .filter(c => c.y < 100)
      })
    }, 60)
    return () => clearInterval(interval)
  }, [playing])

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

  const catchCoin = useCallback((id: number) => {
    setCoins(prev => prev.filter(c => c.id !== id))
    setCombo(c => {
      const next = c + 1
      const multiplier = Math.min(5, 1 + Math.floor(next / 3))
      setScore(s => s + 10 * multiplier)
      return next
    })
    setStack(s => s + 1)
  }, [])

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(combo / 3))
  const towerBlocks = Math.min(10, stack)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-teal-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Combo ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-teal-50 to-emerald-100 rounded-2xl border-2 border-teal-200 overflow-hidden"
        style={{ height: 220 }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🪙</div>
            <div className="font-fredoka text-xl text-gray-700">Coin Stack!</div>
            <p className="text-sm text-gray-500 text-center px-4">Catch coins to build your tower — a dropped coin topples it!</p>
            <button onClick={start} className="px-6 py-2 bg-teal-400 hover:bg-teal-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && coins.map(coin => (
          <button
            key={coin.id}
            className="absolute text-2xl hover:scale-125 transition-transform cursor-pointer select-none"
            style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
            onClick={() => catchCoin(coin.id)}
          >
            🪙
          </button>
        ))}

        {/* Coin tower */}
        {(playing || done) && (
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center pointer-events-none select-none"
            style={{
              transform: toppled ? 'translateX(-50%) rotate(8deg)' : 'translateX(-50%)',
              transition: 'transform 0.15s',
            }}
          >
            {Array.from({ length: towerBlocks }).map((_, i) => (
              <span key={i} style={{ fontSize: 14, lineHeight: '11px' }}>🟡</span>
            ))}
            {stack > 10 && <span className="font-fredoka text-xs text-teal-600">+{stack - 10}</span>}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🏆</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-teal-500">{score}</span> · Tower: {stack}</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Catch = 10pts × combo (every 3 catches: +1×, max 5×) · Miss topples 3 coins | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
