import { useState, useEffect } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const DENOMS = [500, 1000, 2000, 5000, 10000, 20000]

function randomTarget(): number {
  // Always reachable: a random combination of 2-6 denominations
  const picks = 2 + Math.floor(Math.random() * 5)
  let total = 0
  for (let i = 0; i < picks; i++) {
    total += DENOMS[Math.floor(Math.random() * DENOMS.length)]
  }
  return total
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function ExactChange({ onXPEarned }: Props) {
  const [target, setTarget] = useState(0)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'bust' | null>(null)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const start = () => {
    setTarget(randomTarget())
    setCurrent(0)
    setScore(0)
    setSolved(0)
    setFlash(null)
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

  const addDenom = (d: number) => {
    if (!playing) return
    const next = current + d
    if (next === target) {
      setScore(s => s + 50)
      setSolved(n => n + 1)
      setCurrent(0)
      setTarget(randomTarget())
      setFlash('hit')
      setTimeout(() => setFlash(null), 350)
    } else if (next > target) {
      // Bust — lose points, hand resets
      setScore(s => Math.max(0, s - 10))
      setCurrent(0)
      setFlash('bust')
      setTimeout(() => setFlash(null), 350)
    } else {
      setCurrent(next)
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-teal-500">{score}</span></div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden transition-colors duration-300"
        style={{
          height: 220,
          background: flash === 'hit' ? '#D1FAE5' : flash === 'bust' ? '#FEE2E2' : 'linear-gradient(to bottom, #F0FDFA, #CCFBF1)',
          borderColor: '#99F6E4',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">💵</div>
            <div className="font-fredoka text-xl text-gray-700">Exact Change!</div>
            <p className="text-sm text-gray-500 text-center px-4">Hit the target amount exactly — going over busts your hand!</p>
            <button onClick={start} className="px-6 py-2 bg-teal-400 hover:bg-teal-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <div className="font-nunito text-xs text-gray-500 uppercase tracking-widest">Target</div>
            <div className="font-fredoka text-3xl text-gray-800">{formatRp(target)}</div>
            <div className="font-nunito text-sm text-gray-500">
              Your hand: <span className="font-bold" style={{ color: '#0D9488' }}>{formatRp(current)}</span>
              {current > 0 && <span className="text-gray-400"> · {formatRp(target - current)} to go</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 w-full max-w-[280px]">
              {DENOMS.map(d => (
                <button
                  key={d}
                  onClick={() => addDenom(d)}
                  className="py-2 rounded-xl bg-white border-2 border-teal-200 font-nunito font-bold text-xs text-gray-700 hover:border-teal-400 active:scale-95 transition"
                >
                  {d >= 1000 ? `${d / 1000}K` : d}
                </button>
              ))}
            </div>
            <div className="font-nunito text-xs text-gray-400 mt-1">Solved: {solved}</div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🧮</div>
            <div className="font-fredoka text-2xl text-gray-800">Time's up!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-teal-500">{score}</span> · {solved} solved</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Exact hit = +50 · Bust = −10 & hand resets | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
