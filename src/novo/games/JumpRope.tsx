import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

// The rope sweeps a full circle; jump (tap) when it passes the bottom.
export default function JumpRope({ onXPEarned }: Props) {
  const [angle, setAngle] = useState(0)          // 0-360, 180 = bottom
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [jumping, setJumping] = useState(false)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const jumpedThisPass = useRef(false)
  const streakRef = useRef(0)
  streakRef.current = streak

  const start = () => {
    setAngle(0)
    setScore(0)
    setStreak(0)
    setJumping(false)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
    jumpedThisPass.current = false
  }

  // Sweep the rope; speed ramps with streak
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setAngle(a => {
        const speed = 4 + Math.min(5, streakRef.current * 0.4)
        const next = (a + speed) % 360
        // Passed the bottom without a jump → trip!
        if (a < 180 && next >= 180 && !jumpedThisPass.current) {
          setStreak(0)
          setScore(s => Math.max(0, s - 5))
          setFlash('miss')
          setTimeout(() => setFlash(null), 250)
        }
        if (a > next) jumpedThisPass.current = false  // wrapped past 0 — new pass
        return next
      })
    }, 30)
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

  const jump = () => {
    if (!playing || jumping) return
    setJumping(true)
    setTimeout(() => setJumping(false), 350)
    // Successful if the rope is near the bottom (150°-210°) and not already used this pass
    if (angle >= 150 && angle <= 210 && !jumpedThisPass.current) {
      jumpedThisPass.current = true
      setStreak(st => {
        const next = st + 1
        const multiplier = Math.min(5, 1 + Math.floor(next / 5))
        setScore(s => s + 10 * multiplier)
        return next
      })
      setFlash('hit')
      setTimeout(() => setFlash(null), 200)
    } else if (angle < 150 || angle > 210) {
      // Jumped at the wrong moment
      setStreak(0)
      setScore(s => Math.max(0, s - 3))
      setFlash('miss')
      setTimeout(() => setFlash(null), 250)
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const multiplier = Math.min(5, 1 + Math.floor(streak / 5))
  const rad = ((angle - 90) * Math.PI) / 180
  const ropeX = 50 + Math.cos(rad) * 38
  const ropeY = 50 + Math.sin(rad) * 38

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-lime-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Streak {streak} ×{multiplier}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none cursor-pointer transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'hit' ? '#ECFCCB' : flash === 'miss' ? '#FEE2E2' : 'linear-gradient(to bottom, #F7FEE7, #ECFCCB)',
          borderColor: '#D9F99D',
        }}
        onPointerDown={jump}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🤸</div>
            <div className="font-fredoka text-xl text-gray-700">Jump Rope!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap to jump exactly when the rope swings past your feet!</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Rope circle guide */}
            <div
              className="absolute rounded-full border-2 border-dashed"
              style={{ left: '50%', top: '50%', width: '66%', paddingTop: '66%', transform: 'translate(-50%, -50%)', borderColor: '#D9F99D' }}
            />
            {/* Bottom marker */}
            <div className="absolute left-1/2 -translate-x-1/2 font-nunito text-[10px] text-lime-700" style={{ top: '86%' }}>
              ⬇ jump zone ⬇
            </div>
            {/* Rope tip */}
            <div
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: `${ropeX}%`, top: `${ropeY}%`,
                transform: 'translate(-50%, -50%)',
                background: '#65A30D',
                boxShadow: '0 0 8px rgba(101,163,13,0.6)',
              }}
            />
            {/* Jumper */}
            <div
              className="absolute left-1/2 -translate-x-1/2 text-4xl transition-all duration-150"
              style={{ top: jumping ? '38%' : '48%' }}
            >
              {streak >= 10 ? '🤸' : '🏃'}
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">💦</div>
            <div className="font-fredoka text-2xl text-gray-800">Workout done!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-lime-600">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={e => { e.stopPropagation(); handleClaim() }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Timed jump = 10 × streak bonus · Trip/mistime = streak reset | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
