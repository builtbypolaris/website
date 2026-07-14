import { useState, useEffect, useRef } from 'react'

interface Passport {
  id: number
  flag: string
  x: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const FLAGS = ['🇮🇩', '🇯🇵', '🇰🇷', '🇫🇷', '🇮🇹', '🇧🇷', '🇦🇺', '🇹🇭', '🇹🇷', '🇪🇬']

function pickApproved(): string[] {
  const shuffled = [...FLAGS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export default function StampRush({ onXPEarned }: Props) {
  const [approved, setApproved] = useState<string[]>([])
  const [passports, setPassports] = useState<Passport[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const passportId = useRef(0)

  const start = () => {
    setApproved(pickApproved())
    setPassports([])
    setScore(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Passports slide in from the right
  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      setPassports(prev => [...prev.slice(-6), {
        id: passportId.current++,
        flag: FLAGS[Math.floor(Math.random() * FLAGS.length)],
        x: 104,
      }])
    }, 900)
    const move = setInterval(() => {
      setPassports(prev => prev.map(p => ({ ...p, x: p.x - 1.6 })).filter(p => p.x > -14))
    }, 40)
    return () => { clearInterval(spawn); clearInterval(move) }
  }, [playing])

  // The approved board rotates every 8 seconds
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => setApproved(pickApproved()), 8000)
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

  const stamp = (p: Passport) => {
    setPassports(prev => prev.filter(x => x.id !== p.id))
    if (approved.includes(p.flag)) {
      setScore(s => s + 10)
      setFlash('ok')
    } else {
      setScore(s => Math.max(0, s - 10))
      setFlash('no')
    }
    setTimeout(() => setFlash(null), 200)
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
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'ok' ? '#FFEDD5' : flash === 'no' ? '#FEE2E2' : 'linear-gradient(to bottom, #FFF7ED, #FFEDD5)',
          borderColor: '#FED7AA',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🛂</div>
            <div className="font-fredoka text-xl text-gray-700">Stamp Rush!</div>
            <p className="text-sm text-gray-500 text-center px-4">Stamp only passports from today's approved countries — the board changes!</p>
            <button onClick={start} className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex flex-col">
            {/* Approved board */}
            <div className="flex items-center justify-center gap-2 pt-3">
              <span className="font-nunito text-xs text-gray-500">✅ Approved today:</span>
              <div className="flex gap-1.5 px-3 py-1 rounded-lg bg-white border-2 border-orange-200">
                {approved.map(f => <span key={f} className="text-xl">{f}</span>)}
              </div>
            </div>

            {/* Desk with sliding passports */}
            <div className="relative flex-1">
              <div className="absolute left-0 right-0 bottom-10 h-1 bg-orange-200" />
              {passports.map(p => (
                <button
                  key={p.id}
                  onClick={() => stamp(p)}
                  className="absolute flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
                  style={{ left: `${p.x}%`, bottom: 44, transform: 'translateX(-50%)' }}
                >
                  <div className="w-12 h-14 rounded-md bg-red-900 flex flex-col items-center justify-center gap-0.5 shadow">
                    <span className="text-xl">{p.flag}</span>
                    <span className="text-[7px] text-red-200 font-nunito">PASSPORT</span>
                  </div>
                </button>
              ))}
              <div className="absolute bottom-2 left-0 right-0 text-center font-nunito text-[10px] text-orange-300">
                tap a passport to stamp it
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🛃</div>
            <div className="font-fredoka text-2xl text-gray-800">Border closed!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-orange-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Approved stamp +10 · Wrong stamp −10 · Board rotates every 8s | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
