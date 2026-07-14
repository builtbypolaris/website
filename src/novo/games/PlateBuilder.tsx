import { useState, useEffect, useRef } from 'react'

type Category = 'veg' | 'protein' | 'carb'

interface ConveyorFood {
  id: number
  emoji: string
  category: Category
  x: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const FOODS: Record<Category, string[]> = {
  veg: ['🥦', '🥕', '🥬', '🍅', '🌽'],
  protein: ['🍗', '🍳', '🐟', '🥩', '🫘'],
  carb: ['🍚', '🍞', '🍜', '🥔', '🌾'],
}

const CAT_LABEL: Record<Category, string> = { veg: 'Veg', protein: 'Protein', carb: 'Carb' }

function randomOrder(): Record<Category, number> {
  return {
    veg: 1 + Math.floor(Math.random() * 2),
    protein: 1,
    carb: 1 + (Math.random() < 0.3 ? 1 : 0),
  }
}

export default function PlateBuilder({ onXPEarned }: Props) {
  const [order, setOrder] = useState<Record<Category, number>>({ veg: 2, protein: 1, carb: 1 })
  const [plate, setPlate] = useState<Record<Category, number>>({ veg: 0, protein: 0, carb: 0 })
  const [conveyor, setConveyor] = useState<ConveyorFood[]>([])
  const [score, setScore] = useState(0)
  const [served, setServed] = useState(0)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const foodId = useRef(0)

  const start = () => {
    setOrder(randomOrder())
    setPlate({ veg: 0, protein: 0, carb: 0 })
    setConveyor([])
    setScore(0)
    setServed(0)
    setFlash(null)
    setTimeLeft(45)
    setDone(false)
    setPlaying(true)
  }

  // Conveyor: foods slide right → left
  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      const cats: Category[] = ['veg', 'protein', 'carb']
      const category = cats[Math.floor(Math.random() * 3)]
      const pool = FOODS[category]
      setConveyor(prev => [...prev.slice(-8), {
        id: foodId.current++,
        emoji: pool[Math.floor(Math.random() * pool.length)],
        category,
        x: 104,
      }])
    }, 750)
    const move = setInterval(() => {
      setConveyor(prev => prev.map(f => ({ ...f, x: f.x - 1.8 })).filter(f => f.x > -10))
    }, 40)
    return () => { clearInterval(spawn); clearInterval(move) }
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

  const grab = (f: ConveyorFood) => {
    setConveyor(prev => prev.filter(x => x.id !== f.id))
    if (plate[f.category] < order[f.category]) {
      const nextPlate = { ...plate, [f.category]: plate[f.category] + 1 }
      const complete = (['veg', 'protein', 'carb'] as Category[]).every(c => nextPlate[c] >= order[c])
      if (complete) {
        setScore(s => s + 40)
        setServed(n => n + 1)
        setPlate({ veg: 0, protein: 0, carb: 0 })
        setOrder(randomOrder())
        setFlash('good')
        setTimeout(() => setFlash(null), 350)
      } else {
        setPlate(nextPlate)
        setScore(s => s + 2)
      }
    } else {
      // Plate doesn't need this category
      setScore(s => Math.max(0, s - 5))
      setFlash('bad')
      setTimeout(() => setFlash(null), 250)
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-lime-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{served} served</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'good' ? '#ECFCCB' : flash === 'bad' ? '#FEE2E2' : 'linear-gradient(to bottom, #F7FEE7, #ECFCCB)',
          borderColor: '#D9F99D',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🍽️</div>
            <div className="font-fredoka text-xl text-gray-700">Plate Builder!</div>
            <p className="text-sm text-gray-500 text-center px-4">Grab foods off the conveyor to complete each balanced plate order!</p>
            <button onClick={start} className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex flex-col">
            {/* Order ticket */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <span className="font-nunito text-xs text-gray-500">Order:</span>
              {(['veg', 'protein', 'carb'] as Category[]).map(c => (
                <div
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-white border font-nunito text-xs font-bold"
                  style={{
                    borderColor: plate[c] >= order[c] ? '#65A30D' : '#D9F99D',
                    color: plate[c] >= order[c] ? '#65A30D' : '#6B7280',
                  }}
                >
                  {CAT_LABEL[c]} {plate[c]}/{order[c]}
                </div>
              ))}
            </div>

            {/* Conveyor */}
            <div className="relative flex-1">
              <div className="absolute left-0 right-0 h-1 bg-lime-200" style={{ top: '58%' }} />
              {conveyor.map(f => (
                <button
                  key={f.id}
                  onClick={() => grab(f)}
                  className="absolute text-3xl hover:scale-125 transition-transform cursor-pointer"
                  style={{ left: `${f.x}%`, top: '42%', transform: 'translateX(-50%)' }}
                >
                  {f.emoji}
                </button>
              ))}
            </div>

            {/* Plate */}
            <div className="pb-3 flex justify-center">
              <div className="px-5 py-1.5 rounded-full bg-white border-2 border-lime-200 font-nunito text-xs text-gray-500">
                🍽️ Complete plate = +40
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">👨‍🍳</div>
            <div className="font-fredoka text-2xl text-gray-800">Kitchen closed!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-lime-600">{score}</span> · {served} plates</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Needed food +2 · Complete plate +40 · Wrong grab −5 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
