import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const SYMBOLS = ['📐', '📚', '✏️', '🧪', '🌍', '🎨', '🎵', '⚗️', '🔬']

function makeSequence(len: number): string[] {
  return Array.from({ length: len }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
}

export default function FlashOrder({ onXPEarned }: Props) {
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'over'>('idle')
  const [sequence, setSequence] = useState<string[]>([])
  const [inputPos, setInputPos] = useState(0)
  const [level, setLevel] = useState(3)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [shake, setShake] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const showRound = (len: number) => {
    const seq = makeSequence(len)
    setSequence(seq)
    setInputPos(0)
    setPhase('show')
    // Longer sequences get a bit more study time
    timerRef.current = setTimeout(() => setPhase('input'), 900 + len * 350)
  }

  const start = () => {
    setScore(0)
    setLives(3)
    setLevel(3)
    showRound(3)
  }

  const pick = (symbol: string) => {
    if (phase !== 'input') return
    if (symbol === sequence[inputPos]) {
      const next = inputPos + 1
      if (next === sequence.length) {
        setScore(s => s + sequence.length * 10)
        const nextLevel = level + 1
        setLevel(nextLevel)
        showRound(nextLevel)
      } else {
        setInputPos(next)
      }
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 350)
      setLives(l => {
        if (l <= 1) {
          setPhase('over')
          return 0
        }
        // Retry the same length with a fresh sequence
        showRound(level)
        return l - 1
      })
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setPhase('idle')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-violet-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Length {level}</div>
        <div className="font-fredoka text-lg text-gray-700">{'❤️'.repeat(Math.max(0, lives))}</div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-violet-200 overflow-hidden select-none"
        style={{
          height: 220,
          background: 'linear-gradient(to bottom, #F5F3FF, #EDE9FE)',
          animation: shake ? 'shake 0.3s' : undefined,
        }}
      >
        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🧠</div>
            <div className="font-fredoka text-xl text-gray-700">Flash Order!</div>
            <p className="text-sm text-gray-500 text-center px-4">Memorize the sequence, then tap it back in order. It keeps growing!</p>
            <button onClick={start} className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {phase === 'show' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="font-nunito text-xs text-gray-500 uppercase tracking-widest">Memorize!</div>
            <div className="flex gap-2 flex-wrap justify-center px-4">
              {sequence.map((s, i) => (
                <span key={i} className="text-3xl bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {phase === 'input' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-1.5">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < inputPos ? '#34D399' : '#DDD6FE' }}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SYMBOLS.map(s => (
                <button
                  key={s}
                  onClick={() => pick(s)}
                  className="w-14 h-11 rounded-xl bg-white border-2 border-violet-200 text-xl hover:border-violet-400 active:scale-95 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">📖</div>
            <div className="font-fredoka text-2xl text-gray-800">Out of lives!</div>
            <div className="font-nunito text-lg text-gray-600">
              Score: <span className="font-bold text-violet-500">{score}</span> · Reached length {level}
            </div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Full sequence = length × 10 pts · 3 lives | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
