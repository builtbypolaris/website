import { useState, useEffect, useRef, useCallback } from 'react'

interface FallingItem {
  id: number
  x: number
  y: number
  type: 'task' | 'bomb'
  speed: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function TaskRush({ onXPEarned }: Props) {
  const [playerX, setPlayerX] = useState(45)
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const idRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())
  const playerXRef = useRef(45)
  const livesRef = useRef(3)
  const areaRef = useRef<HTMLDivElement>(null)

  const start = () => {
    setPlayerX(45)
    playerXRef.current = 45
    setItems([])
    setScore(0)
    setLives(3)
    livesRef.current = 3
    setTimeLeft(45)
    setDone(false)
    setPlaying(true)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key)
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Player move
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPlayerX(prev => {
        let next = prev
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) next = Math.max(0, prev - 3)
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) next = Math.min(90, prev + 3)
        playerXRef.current = next
        return next
      })
    }, 30)
    return () => clearInterval(interval)
  }, [playing])

  // Spawn
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => [
        ...prev.slice(-15),
        {
          id: idRef.current++,
          x: 5 + Math.random() * 85,
          y: 0,
          type: Math.random() > 0.35 ? 'task' : 'bomb',
          speed: 1.5 + Math.random() * 2,
        },
      ])
    }, 700)
    return () => clearInterval(interval)
  }, [playing])

  // Fall + collision
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => {
        const px = playerXRef.current
        const result: FallingItem[] = []
        let gain = 0
        let lost = 0

        for (const item of prev) {
          const newY = item.y + item.speed
          const hitX = Math.abs(item.x - px) < 14
          const hitY = newY >= 83 && newY <= 96

          if (hitX && hitY) {
            if (item.type === 'task') gain += 25
            else lost += 1
          } else if (newY < 100) {
            result.push({ ...item, y: newY })
          }
        }

        if (gain > 0) setScore(s => s + gain)
        if (lost > 0) {
          livesRef.current = Math.max(0, livesRef.current - lost)
          setLives(livesRef.current)
          if (livesRef.current <= 0) { setPlaying(false); setDone(true) }
        }
        return result
      })
    }, 40)
    return () => clearInterval(interval)
  }, [playing])

  // Timer
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

  const touchMove = useCallback((e: React.TouchEvent) => {
    if (!areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    const nx = Math.max(0, Math.min(90, x - 5))
    setPlayerX(nx)
    playerXRef.current = nx
  }, [])

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 5))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-base text-gray-700">Score: <span className="text-emerald-500">{score}</span></div>
        <div className="text-base">{Array.from({ length: 3 }, (_, i) => i < lives ? '💚' : '🖤').join('')}</div>
        <div className="font-fredoka text-base text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm bg-gradient-to-b from-blue-50 to-indigo-100 rounded-2xl border-2 border-indigo-200 overflow-hidden touch-none"
        style={{ height: 240 }}
        onTouchMove={touchMove}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-5xl">🌊</div>
            <div className="font-fredoka text-xl text-gray-700">Task Rush!</div>
            <p className="text-sm text-gray-500 text-center px-4">Catch ✅ tasks, dodge 💣 bombs! Use ← → or touch.</p>
            <button onClick={start} className="px-6 py-2 bg-indigo-400 hover:bg-indigo-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Rush! 🎮
            </button>
          </div>
        )}

        {playing && <>
          {items.map(item => (
            <div
              key={item.id}
              className="absolute text-2xl pointer-events-none select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {item.type === 'task' ? '✅' : '💣'}
            </div>
          ))}
          <div
            className="absolute text-3xl select-none"
            style={{ left: `${playerX}%`, bottom: '5%', transform: 'translateX(-50%)' }}
          >
            🧺
          </div>
        </>}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur">
            <div className="text-4xl">{lives > 0 ? '🎯' : '💥'}</div>
            <div className="font-fredoka text-2xl">{lives > 0 ? 'Great catch!' : 'Exploded!'}</div>
            <div className="font-nunito text-gray-600">Score: <span className="text-indigo-500 font-bold">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 5)} XP!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 font-nunito">Catch ✅ tasks (+25pts) · Dodge 💣 bombs (-1 life)</p>
    </div>
  )
}
