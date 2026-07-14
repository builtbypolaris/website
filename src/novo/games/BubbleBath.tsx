import { useState, useEffect, useRef } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

export default function BubbleBath({ onXPEarned }: Props) {
  const [pressure, setPressure] = useState(0)
  const [holding, setHolding] = useState(false)
  const [surging, setSurging] = useState(false)
  const [score, setScore] = useState(0)
  const [fills, setFills] = useState(0)
  const [flash, setFlash] = useState<'good' | 'overflow' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const holdingRef = useRef(false)
  holdingRef.current = holding

  const start = () => {
    setPressure(0)
    setHolding(false)
    setSurging(false)
    setScore(0)
    setFills(0)
    setFlash(null)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // Pressure rises while holding; random surges spike it fast
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      if (!holdingRef.current) return
      setPressure(p => {
        const rate = surging ? 5.5 : 1.6 + fills * 0.15
        const next = p + rate
        if (next >= 100) {
          // Overflow!
          setScore(s => Math.max(0, s - 15))
          setFlash('overflow')
          setTimeout(() => setFlash(null), 400)
          setHolding(false)
          setSurging(false)
          return 0
        }
        return next
      })
    }, 60)
    return () => clearInterval(interval)
  }, [playing, surging, fills])

  // Random surge events while holding
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      if (holdingRef.current && Math.random() < 0.35) {
        setSurging(true)
        setTimeout(() => setSurging(false), 700)
      }
    }, 1200)
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

  const release = () => {
    if (!playing || !holdingRef.current) return
    setHolding(false)
    setSurging(false)
    if (pressure >= 70) {
      // A good fill — the higher the braver
      const bonus = pressure >= 90 ? 30 : 20
      setScore(s => s + bonus)
      setFills(f => f + 1)
      setFlash('good')
      setTimeout(() => setFlash(null), 300)
    }
    setPressure(0)
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-fuchsia-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{fills} baths</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 overflow-hidden select-none cursor-pointer transition-colors duration-200"
        style={{
          height: 220,
          background: flash === 'good' ? '#FAE8FF' : flash === 'overflow' ? '#FEE2E2' : 'linear-gradient(to bottom, #FDF4FF, #FAE8FF)',
          borderColor: '#F0ABFC',
        }}
        onPointerDown={() => playing && setHolding(true)}
        onPointerUp={release}
        onPointerLeave={release}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🛁</div>
            <div className="font-fredoka text-xl text-gray-700">Bubble Bath!</div>
            <p className="text-sm text-gray-500 text-center px-4">Hold to fill the tub — release before it overflows! Watch for surges!</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-6 py-2 bg-fuchsia-400 hover:bg-fuchsia-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            {surging && (
              <div className="font-fredoka text-lg text-red-500 bounce-in">💨 SURGE!</div>
            )}

            {/* Tub */}
            <div className="relative w-40 h-24 rounded-b-3xl border-4 border-t-0 overflow-hidden" style={{ borderColor: '#E879F9', background: 'white' }}>
              <div
                className="absolute bottom-0 left-0 right-0 transition-all"
                style={{
                  height: `${pressure}%`,
                  background: pressure >= 85 ? '#F87171' : pressure >= 70 ? '#4ADE80' : '#A5F3FC',
                }}
              />
              {pressure >= 40 && <span className="absolute text-lg" style={{ left: '20%', bottom: `${pressure - 15}%` }}>🫧</span>}
              {pressure >= 60 && <span className="absolute text-sm" style={{ left: '65%', bottom: `${pressure - 10}%` }}>🫧</span>}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-2xl">{pressure >= 70 ? '😄' : '👶'}</span>
            </div>

            {/* Zones */}
            <div className="w-40 flex font-nunito text-[9px] text-gray-500">
              <div style={{ width: '70%' }} className="text-center">filling…</div>
              <div style={{ width: '20%' }} className="text-center text-green-600 font-bold">good!</div>
              <div style={{ width: '10%' }} className="text-center text-red-500 font-bold">!!</div>
            </div>
            <div className="w-40 h-2 rounded-full overflow-hidden flex" style={{ background: '#F5D0FE' }}>
              <div style={{ width: `${pressure}%`, background: pressure >= 85 ? '#DC2626' : pressure >= 70 ? '#16A34A' : '#D946EF' }} className="transition-all" />
            </div>

            <div className="font-nunito text-[10px] text-fuchsia-400">
              {holding ? 'release in the green zone!' : 'hold anywhere to fill'}
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🧼</div>
            <div className="font-fredoka text-2xl text-gray-800">Squeaky clean!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-fuchsia-600">{score}</span> · {fills} baths</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={e => { e.stopPropagation(); handleClaim() }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Release at 70-89% = +20 · 90-99% = +30 · Overflow −15 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
