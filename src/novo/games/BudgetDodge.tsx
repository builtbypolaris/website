import { useState, useEffect, useRef, useCallback } from 'react'

interface Item {
  id: number
  x: number
  y: number
  type: 'income' | 'expense'
  speed: number
}

const PLAYER_W = 10
const ITEM_SIZE = 6

interface Props {
  onXPEarned: (xp: number) => void
}

export default function BudgetDodge({ onXPEarned }: Props) {
  const [playerX, setPlayerX] = useState(45)
  const [items, setItems] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const itemId = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const playerXRef = useRef(45)
  const livesRef = useRef(3)

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

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key)
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Player movement
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

  // Spawn items
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => [
        ...prev.slice(-15),
        {
          id: itemId.current++,
          x: Math.random() * 85,
          y: 0,
          type: Math.random() > 0.4 ? 'income' : 'expense',
          speed: 1.5 + Math.random() * 2,
        },
      ])
    }, 800)
    return () => clearInterval(interval)
  }, [playing])

  // Move & collision
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setItems(prev => {
        const px = playerXRef.current
        const survived: Item[] = []
        let scoreGain = 0
        let livesLost = 0

        for (const item of prev) {
          const newY = item.y + item.speed
          // Collision: player is at y=88, item at y~88
          const hitX = Math.abs(item.x - px) < PLAYER_W + ITEM_SIZE / 2
          const hitY = newY >= 83 && newY <= 95

          if (hitX && hitY) {
            if (item.type === 'income') scoreGain += 20
            else livesLost += 1
          } else if (newY < 100) {
            survived.push({ ...item, y: newY })
          }
        }

        if (scoreGain > 0) setScore(s => s + scoreGain)
        if (livesLost > 0) {
          livesRef.current = Math.max(0, livesRef.current - livesLost)
          setLives(livesRef.current)
          if (livesRef.current <= 0) {
            setPlaying(false)
            setDone(true)
          }
        }
        return survived
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
    setPlayerX(Math.max(0, Math.min(90, x - 5)))
    playerXRef.current = Math.max(0, Math.min(90, x - 5))
  }, [])

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 5))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-base text-gray-700">Score: <span className="text-emerald-500">{score}</span></div>
        <div className="text-lg">{Array.from({ length: 3 }, (_, i) => i < lives ? '❤️' : '🖤').join('')}</div>
        <div className="font-fredoka text-base text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm bg-gradient-to-b from-indigo-50 to-purple-100 rounded-2xl border-2 border-purple-200 overflow-hidden touch-none"
        style={{ height: 240 }}
        onTouchMove={touchMove}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-5xl">🎯</div>
            <div className="font-fredoka text-xl text-gray-700">Budget Dodge!</div>
            <p className="text-sm text-gray-500 text-center px-4">Catch 💚 income stars, dodge 🔴 expense bombs!<br/>Use ← → arrow keys or touch to move.</p>
            <button onClick={start} className="px-6 py-2 bg-purple-400 hover:bg-purple-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && <>
          {items.map(item => (
            <div
              key={item.id}
              className="absolute text-xl pointer-events-none select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {item.type === 'income' ? '💚' : '💸'}
            </div>
          ))}
          <div
            className="absolute text-2xl select-none"
            style={{ left: `${playerX}%`, bottom: '6%', transform: 'translateX(-50%)' }}
          >
            🚀
          </div>
        </>}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur">
            <div className="text-4xl">{lives > 0 ? '🏆' : '💀'}</div>
            <div className="font-fredoka text-2xl">{lives > 0 ? 'Survived!' : 'Game Over!'}</div>
            <div className="font-nunito text-gray-600">Score: <span className="font-bold text-purple-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 5)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 font-nunito">Catch 💚 income (+20pts), dodge 💸 expenses (-1 life)</p>
    </div>
  )
}
