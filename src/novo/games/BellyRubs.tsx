import { useState, useEffect, useRef } from 'react'

type Want = 'feed' | 'play' | 'bath'

interface PopPet {
  id: number
  emoji: string
  want: Want
  x: number
  y: number
  expiresAt: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const WANT_META: Record<Want, { emoji: string; label: string }> = {
  feed: { emoji: '🍖', label: 'Feed' },
  play: { emoji: '🎾', label: 'Play' },
  bath: { emoji: '🛁', label: 'Bath' },
}
const PET_EMOJIS = ['🐶', '🐱', '🐰', '🐹', '🦜']
const WANTS: Want[] = ['feed', 'play', 'bath']

export default function BellyRubs({ onXPEarned }: Props) {
  const [pets, setPets] = useState<PopPet[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const petId = useRef(0)

  const start = () => {
    setPets([])
    setScore(0)
    setCombo(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Pets pop up asking for care; they leave disappointed if ignored
  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      const lifetime = Math.max(1600, 3000 - (30 - timeLeft) * 45)
      setPets(prev => [...prev.slice(-3), {
        id: petId.current++,
        emoji: PET_EMOJIS[Math.floor(Math.random() * PET_EMOJIS.length)],
        want: WANTS[Math.floor(Math.random() * 3)],
        x: 12 + Math.random() * 70,
        y: 14 + Math.random() * 40,
        expiresAt: Date.now() + lifetime,
      }])
    }, 1100)
    const expire = setInterval(() => {
      const now = Date.now()
      setPets(prev => {
        const gone = prev.filter(p => p.expiresAt <= now)
        if (gone.length > 0) setCombo(0)
        return prev.filter(p => p.expiresAt > now)
      })
    }, 200)
    return () => { clearInterval(spawn); clearInterval(expire) }
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

  const act = (want: Want) => {
    if (!playing) return
    setPets(prev => {
      // Serve the oldest pet wanting this action
      const target = prev.find(p => p.want === want)
      if (target) {
        setCombo(c => {
          const next = c + 1
          const multiplier = Math.min(5, 1 + Math.floor(next / 4))
          setScore(s => s + 10 * multiplier)
          return next
        })
        setFlash('ok')
        setTimeout(() => setFlash(null), 150)
        return prev.filter(p => p.id !== target.id)
      }
      setScore(s => Math.max(0, s - 5))
      setCombo(0)
      setFlash('no')
      setTimeout(() => setFlash(null), 200)
      return prev
    })
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(combo / 4))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-yellow-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Care ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'ok' ? '#FEF9C3' : flash === 'no' ? '#FEE2E2' : 'linear-gradient(to bottom, #FEFCE8, #FEF9C3)',
          borderColor: '#FDE68A',
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🐕</div>
            <div className="font-fredoka text-xl text-gray-700">Belly Rubs!</div>
            <p className="text-sm text-gray-500 text-center px-4">Pets pop up asking for care. Hit the right button before they wander off!</p>
            <button onClick={start} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <>
            {pets.map(p => (
              <div key={p.id} className="absolute bounce-in pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <div className="relative">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="absolute -top-5 -right-4 bg-white rounded-full px-1.5 py-0.5 border border-yellow-300 text-sm">
                    {WANT_META[p.want].emoji}
                  </div>
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 48 }}>
              {WANTS.map(w => (
                <button
                  key={w}
                  onClick={() => act(w)}
                  className="flex-1 border-t-2 border-x border-yellow-200 bg-white font-fredoka text-sm text-gray-600 transition active:bg-yellow-100 flex items-center justify-center gap-1"
                >
                  <span className="text-lg">{WANT_META[w].emoji}</span> {WANT_META[w].label}
                </button>
              ))}
            </div>
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">💛</div>
            <div className="font-fredoka text-2xl text-gray-800">Happy pack!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-yellow-600">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Right care = 10 × combo · Wrong care −5 · Ignored pets break the combo | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
