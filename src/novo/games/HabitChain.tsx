import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const WINDOW_MS = 2200

export default function HabitChain({ onXPEarned }: Props) {
  const [chain, setChain] = useState(0)
  const [best, setBest] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [_lastClick, setLastClick] = useState(0)
  const [pulseOk, setPulseOk] = useState(false)
  const [pulseBad, setPulseBad] = useState(false)
  const [progress, setProgress] = useState(100)
  const chainRef = useRef(0)
  const lastClickRef = useRef(0)

  const start = () => {
    setChain(0)
    chainRef.current = 0
    setBest(0)
    setTimeLeft(60)
    setLastClick(Date.now())
    lastClickRef.current = Date.now()
    setProgress(100)
    setDone(false)
    setPlaying(true)
  }

  // Timer countdown
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPlaying(false); setDone(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing])

  // Progress bar decay (2.2s window)
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastClickRef.current
      const pct = Math.max(0, 100 - (elapsed / WINDOW_MS) * 100)
      setProgress(pct)

      // Auto-break chain if window expires
      if (elapsed > WINDOW_MS && chainRef.current > 0) {
        setChain(0)
        chainRef.current = 0
        setPulseBad(true)
        setTimeout(() => setPulseBad(false), 400)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [playing])

  const tap = () => {
    if (!playing) return
    const now = Date.now()
    const gap = now - lastClickRef.current

    if (gap > WINDOW_MS && chainRef.current > 0) {
      // Missed window - chain breaks
      setChain(0)
      chainRef.current = 0
      setPulseBad(true)
      setTimeout(() => setPulseBad(false), 400)
    } else {
      // Good tap
      const newChain = chainRef.current + 1
      chainRef.current = newChain
      setChain(newChain)
      setBest(b => Math.max(b, newChain))
      setPulseOk(true)
      setTimeout(() => setPulseOk(false), 300)
    }

    lastClickRef.current = now
    setLastClick(now)
  }

  const xpEarned = best * 3

  const handleClaim = () => {
    onXPEarned(xpEarned)
    setDone(false)
  }

  const ringColor = pulseBad ? '#FCA5A5' : pulseOk ? '#6EE7B7' : chain > 0 ? '#F9A8D4' : '#E5E7EB'

  return (
    <div className="flex flex-col items-center gap-3">
      {!playing && !done && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="text-5xl">⛓️</div>
          <div className="font-fredoka text-xl text-gray-700">Habit Chain!</div>
          <p className="text-sm text-gray-500 text-center px-4">Tap the button within 2.2 seconds each time to keep the chain going! Breaking the chain resets to 0.</p>
          <button onClick={start} className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-fredoka text-lg rounded-full shadow transition">
            Start Chain! 🎮
          </button>
        </div>
      )}

      {playing && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8 font-fredoka text-base text-gray-600">
            <span>Chain: <span className="text-pink-500 font-bold text-xl">{chain}</span></span>
            <span>Best: <span className="text-purple-500 font-bold">{best}</span></span>
            <span>Time: <span className={timeLeft <= 10 ? 'text-red-500' : 'text-gray-500'}>{timeLeft}s</span></span>
          </div>

          {/* Progress window bar */}
          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-none"
              style={{
                width: `${progress}%`,
                background: progress > 60 ? '#6EE7B7' : progress > 30 ? '#FDE68A' : '#FCA5A5',
              }}
            />
          </div>
          <p className="text-xs text-gray-400">Tap before the bar runs out!</p>

          {/* Big tap button */}
          <button
            onClick={tap}
            className="rounded-full flex items-center justify-center text-5xl font-bold shadow-lg active:scale-95 transition-all select-none"
            style={{
              width: 130,
              height: 130,
              background: `radial-gradient(circle, white, ${ringColor}55)`,
              border: `6px solid ${ringColor}`,
              boxShadow: pulseOk ? `0 0 30px ${ringColor}` : pulseBad ? '0 0 20px #FCA5A5' : '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            {pulseBad ? '💔' : chain > 10 ? '🔥' : chain > 5 ? '⚡' : '💗'}
          </button>

          <div className="text-sm text-gray-500 font-nunito">
            {chain > 15 ? 'INCREDIBLE! 🔥🔥🔥' : chain > 10 ? 'On fire! 🔥' : chain > 5 ? 'Great rhythm! ⚡' : 'Keep tapping!'}
          </div>
        </div>
      )}

      {done && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-5xl">⛓️</div>
          <div className="font-fredoka text-2xl">Chain ended!</div>
          <div className="font-nunito text-gray-600">Best chain: <span className="font-bold text-pink-500">{best}</span></div>
          <div className="font-nunito text-sm text-emerald-600">+{xpEarned} XP earned!</div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
            <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Retry</button>
          </div>
        </div>
      )}
    </div>
  )
}
