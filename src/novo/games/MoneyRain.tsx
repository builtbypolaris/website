import { useState, useEffect, useRef, useCallback } from 'react'

interface Coin {
  id: number
  x: number
  y: number
  value: number
  speed: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function MoneyRain({ onXPEarned }: Props) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const coinId = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)

  const start = () => {
    setCoins([])
    setScore(0)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn coins
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const newCoin: Coin = {
        id: coinId.current++,
        x: Math.random() * 85,
        y: 0,
        value: [10, 20, 50][Math.floor(Math.random() * 3)],
        speed: 1.5 + Math.random() * 2,
      }
      setCoins(prev => [...prev.slice(-20), newCoin])
    }, 600)
    return () => clearInterval(interval)
  }, [playing])

  // Move coins down
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setCoins(prev => prev
        .map(c => ({ ...c, y: c.y + c.speed }))
        .filter(c => c.y < 100)
      )
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

  const clickCoin = useCallback((id: number, value: number) => {
    setCoins(prev => prev.filter(c => c.id !== id))
    setScore(s => s + value)
  }, [])

  const handleClaim = () => {
    const xp = Math.floor(score / 10)
    onXPEarned(xp)
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-yellow-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm bg-gradient-to-b from-sky-50 to-blue-100 rounded-2xl border-2 border-sky-200 overflow-hidden"
        style={{ height: 220 }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-5xl">🌧️</div>
            <div className="font-fredoka text-xl text-gray-700">Money Rain!</div>
            <p className="text-sm text-gray-500 text-center px-4">Click falling coins before they disappear!</p>
            <button onClick={start} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && coins.map(coin => (
          <button
            key={coin.id}
            className="absolute text-2xl hover:scale-125 transition-transform bounce-in cursor-pointer select-none"
            style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
            onClick={() => clickCoin(coin.id, coin.value)}
          >
            {coin.value === 50 ? '💰' : coin.value === 20 ? '🟡' : '🪙'}
          </button>
        ))}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur">
            <div className="text-4xl">🎉</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-yellow-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        🪙 = 10pts &nbsp; 🟡 = 20pts &nbsp; 💰 = 50pts &nbsp;|&nbsp; Every 10 pts = 1 XP
      </p>
    </div>
  )
}
