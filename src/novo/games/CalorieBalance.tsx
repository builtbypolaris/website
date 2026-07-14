import { useState, useEffect, useRef } from 'react'

interface Food {
  id: number
  emoji: string
  junk: boolean
  x: number
  y: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const HEALTHY = ['🥗', '🍎', '🥦', '🍌', '🥕']
const JUNK = ['🍔', '🍟', '🍩', '🍕', '🧁']

export default function CalorieBalance({ onXPEarned }: Props) {
  const [foods, setFoods] = useState<Food[]>([])
  const [tilt, setTilt] = useState(0)  // −100 (healthy side) … +100 (junk side)
  const [score, setScore] = useState(0)
  const [tipped, setTipped] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const foodId = useRef(0)

  const start = () => {
    setFoods([])
    setTilt(0)
    setScore(0)
    setTipped(false)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Spawn foods drifting down toward the seesaw
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const junk = Math.random() < 0.55
      const pool = junk ? JUNK : HEALTHY
      setFoods(prev => [...prev.slice(-8), {
        id: foodId.current++,
        emoji: pool[Math.floor(Math.random() * pool.length)],
        junk,
        x: junk ? 55 + Math.random() * 35 : 10 + Math.random() * 35,
        y: 0,
      }])
    }, 800)
    return () => clearInterval(interval)
  }, [playing])

  // Foods fall; landing shifts the balance. Healthy left = good tilt, junk right = bad tilt.
  useEffect(() => {
    if (!playing || tipped) return
    const interval = setInterval(() => {
      setFoods(prev => {
        const landed = prev.filter(f => f.y + 2.4 >= 72)
        if (landed.length > 0) {
          setTilt(t => {
            const delta = landed.reduce((s, f) => s + (f.junk ? 18 : -12), 0)
            const next = Math.max(-100, Math.min(130, t + delta))
            if (next >= 100) {
              // Tipped into junk territory!
              setScore(sc => Math.max(0, sc - 20))
              setTipped(true)
              setTimeout(() => { setTipped(false); setTilt(0) }, 900)
              return 100
            }
            return next
          })
        }
        return prev.map(f => ({ ...f, y: f.y + 2.4 })).filter(f => f.y < 72)
      })
    }, 60)
    return () => clearInterval(interval)
  }, [playing, tipped])

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

  const smack = (f: Food) => {
    if (tipped) return
    setFoods(prev => prev.filter(x => x.id !== f.id))
    if (f.junk) setScore(s => s + 10)
    else {
      // Knocked away good food — small penalty
      setScore(s => Math.max(0, s - 5))
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const angle = (tilt / 100) * 14

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-lime-600">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none"
        style={{
          height: 220,
          background: tipped ? '#FEE2E2' : 'linear-gradient(to bottom, #F7FEE7, #ECFCCB)',
          borderColor: '#D9F99D',
          transition: 'background 0.3s',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">⚖️</div>
            <div className="font-fredoka text-xl text-gray-700">Calorie Balance!</div>
            <p className="text-sm text-gray-500 text-center px-4">Swat the junk food out of the air before it tips your balance!</p>
            <button onClick={start} className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <>
            {foods.map(f => (
              <button
                key={f.id}
                onClick={() => smack(f)}
                className="absolute text-2xl hover:scale-125 transition-transform cursor-pointer select-none"
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              >
                {f.emoji}
              </button>
            ))}

            {/* Seesaw */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5 pointer-events-none">
              <div
                className="h-2.5 rounded-full flex justify-between items-center px-3"
                style={{
                  background: '#84CC16',
                  transform: `rotate(${angle}deg)`,
                  transition: 'transform 0.25s',
                }}
              >
                <span className="text-base -translate-y-4">🥗</span>
                <span className="text-base -translate-y-4">🍔</span>
              </div>
              <div className="mx-auto w-0 h-0" style={{
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderBottom: '20px solid #65A30D',
              }} />
            </div>

            {tipped && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="font-fredoka text-xl text-red-500 bounce-in">💥 TIPPED! −20</span>
              </div>
            )}
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🥇</div>
            <div className="font-fredoka text-2xl text-gray-800">Balanced!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-lime-600">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Swat junk +10 · Swat healthy −5 · Beam tips −20 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
