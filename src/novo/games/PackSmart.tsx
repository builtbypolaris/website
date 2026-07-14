import { useState, useEffect } from 'react'

interface Item {
  id: number
  emoji: string
  name: string
  kg: number
  value: number
  packed: boolean
}

interface Props {
  onXPEarned: (xp: number) => void
}

const LIMIT_KG = 10

const ITEM_POOL: { emoji: string; name: string }[] = [
  { emoji: '📷', name: 'Camera' }, { emoji: '👟', name: 'Sneakers' }, { emoji: '🧥', name: 'Jacket' },
  { emoji: '📚', name: 'Books' }, { emoji: '🧴', name: 'Toiletries' }, { emoji: '🎁', name: 'Souvenirs' },
  { emoji: '💻', name: 'Laptop' }, { emoji: '🩴', name: 'Sandals' }, { emoji: '🎧', name: 'Headphones' },
  { emoji: '☂️', name: 'Umbrella' }, { emoji: '🧦', name: 'Socks' }, { emoji: '🕶️', name: 'Shades' },
]

function makeItems(): Item[] {
  const shuffled = [...ITEM_POOL].sort(() => Math.random() - 0.5).slice(0, 6)
  return shuffled.map((it, i) => ({
    id: i,
    ...it,
    kg: 1 + Math.floor(Math.random() * 5),
    value: (1 + Math.floor(Math.random() * 5)) * 10,
    packed: false,
  }))
}

export default function PackSmart({ onXPEarned }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const [trips, setTrips] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const start = () => {
    setItems(makeItems())
    setScore(0)
    setTrips(0)
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

  const packedKg = items.filter(i => i.packed).reduce((s, i) => s + i.kg, 0)
  const packedValue = items.filter(i => i.packed).reduce((s, i) => s + i.value, 0)

  const toggle = (id: number) => {
    if (!playing) return
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      if (!i.packed && packedKg + i.kg > LIMIT_KG) return i  // too heavy, won't fit
      return { ...i, packed: !i.packed }
    }))
  }

  const fly = () => {
    if (!playing || packedValue === 0) return
    setScore(s => s + packedValue)
    setTrips(t => t + 1)
    setItems(makeItems())
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-orange-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{trips} flights</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-orange-200 overflow-hidden select-none"
        style={{ minHeight: 220, background: 'linear-gradient(to bottom, #FFF7ED, #FFEDD5)' }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🧳</div>
            <div className="font-fredoka text-xl text-gray-700">Pack Smart!</div>
            <p className="text-sm text-gray-500 text-center px-4">Fit the most valuable stuff under the {LIMIT_KG}kg limit, then fly!</p>
            <button onClick={start} className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="p-3 flex flex-col gap-2">
            {/* Weight bar */}
            <div>
              <div className="flex justify-between font-nunito text-xs text-gray-500 mb-1">
                <span>Suitcase: {packedKg}/{LIMIT_KG} kg</span>
                <span>Value: <strong className="text-orange-500">{packedValue}</strong></span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-white border border-orange-200">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${(packedKg / LIMIT_KG) * 100}%`, background: packedKg >= LIMIT_KG ? '#DC2626' : '#F97316' }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-2 gap-1.5">
              {items.map(i => (
                <button
                  key={i.id}
                  onClick={() => toggle(i.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition active:scale-[0.97]"
                  style={{
                    background: i.packed ? '#FFEDD5' : 'white',
                    border: i.packed ? '2px solid #F97316' : '2px solid #FED7AA',
                    opacity: !i.packed && packedKg + i.kg > LIMIT_KG ? 0.4 : 1,
                  }}
                >
                  <span className="text-xl">{i.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito text-[11px] font-bold text-gray-700 truncate">{i.name}</div>
                    <div className="font-nunito text-[10px] text-gray-400">{i.kg}kg · {i.value}pts</div>
                  </div>
                  {i.packed && <span className="text-orange-500 text-xs">✓</span>}
                </button>
              ))}
            </div>

            <button
              onClick={fly}
              disabled={packedValue === 0}
              className="w-full py-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-fredoka text-base transition disabled:opacity-40 active:scale-[0.99]"
            >
              ✈️ Fly! (+{packedValue})
            </button>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🌍</div>
            <div className="font-fredoka text-2xl text-gray-800">World tour done!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-orange-500">{score}</span> · {trips} flights</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Pack under {LIMIT_KG}kg · Fly banks the packed value · New items each flight | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
