import { useState, useEffect, useRef } from 'react'

interface Note {
  id: number
  lane: number
  y: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const LANE_X = ['20%', '50%', '80%']
const HIT_Y = 78
const NOTE_EMOJI = ['🎵', '🎶', '♪']

export default function LullabyKeys({ onXPEarned }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [hitFlash, setHitFlash] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const noteId = useRef(0)

  const start = () => {
    setNotes([])
    setScore(0)
    setStreak(0)
    setHitFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Notes fall down the three keys
  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      setNotes(prev => [...prev.slice(-8), {
        id: noteId.current++,
        lane: Math.floor(Math.random() * 3),
        y: 0,
      }])
    }, Math.max(500, 850 - (30 - timeLeft) * 12))
    const move = setInterval(() => {
      setNotes(prev => {
        // A note sliding past the hit line unplayed breaks the streak
        const missed = prev.some(n => n.y + 2.4 >= 100)
        if (missed) setStreak(0)
        return prev.map(n => ({ ...n, y: n.y + 2.4 })).filter(n => n.y < 100)
      })
    }, 45)
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

  const pressKey = (lane: number) => {
    if (!playing) return
    setHitFlash(lane)
    setTimeout(() => setHitFlash(null), 150)
    setNotes(prev => {
      // A hit counts when a note in this lane is close to the line
      const target = prev.find(n => n.lane === lane && Math.abs(n.y - HIT_Y) < 12)
      if (target) {
        setStreak(st => {
          const next = st + 1
          const multiplier = Math.min(5, 1 + Math.floor(next / 5))
          setScore(s => s + 10 * multiplier)
          return next
        })
        return prev.filter(n => n.id !== target.id)
      }
      // Pressed with nothing there. Wakes the baby a little
      setStreak(0)
      setScore(s => Math.max(0, s - 3))
      return prev
    })
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(streak / 5))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-fuchsia-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Melody ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-fuchsia-200 overflow-hidden select-none"
        style={{ height: 220, background: 'linear-gradient(to bottom, #FDF4FF, #FAE8FF)' }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🎹</div>
            <div className="font-fredoka text-xl text-gray-700">Lullaby Keys!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap the key when a note reaches the line. Keep the lullaby flowing!</p>
            <button onClick={start} className="px-6 py-2 bg-fuchsia-400 hover:bg-fuchsia-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <>
            {/* Lane guides + hit line */}
            {[1, 2].map(i => (
              <div key={i} className="absolute top-0 border-l border-dashed border-fuchsia-200" style={{ left: `${i * 33.3}%`, bottom: 48 }} />
            ))}
            <div className="absolute left-0 right-0 h-0.5 bg-fuchsia-400" style={{ top: `${HIT_Y}%` }} />

            {/* Notes */}
            {notes.map(n => (
              <div
                key={n.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: LANE_X[n.lane], top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {NOTE_EMOJI[n.id % 3]}
              </div>
            ))}

            {/* Keys */}
            <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 44 }}>
              {[0, 1, 2].map(lane => (
                <button
                  key={lane}
                  onClick={() => pressKey(lane)}
                  className="flex-1 border-t-2 border-x border-fuchsia-200 font-fredoka text-lg transition"
                  style={{ background: hitFlash === lane ? '#F0ABFC' : 'white' }}
                >
                  {['🌙', '⭐', '☁️'][lane]}
                </button>
              ))}
            </div>
          </>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">😴</div>
            <div className="font-fredoka text-2xl text-gray-800">Baby's asleep!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-fuchsia-600">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        On-beat = 10 × melody streak · Off-beat −3 & streak reset | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
