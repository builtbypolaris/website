import { useState, useEffect, useRef, useCallback } from 'react'

interface Obstacle {
  id: number
  x: number
  type: 'cactus' | 'rock' | 'bird'
}

interface Props {
  onXPEarned: (xp: number) => void
}

const GROUND_Y = 72
const JUMP_FORCE = -14
const GRAVITY = 0.8

export default function HabitRun({ onXPEarned }: Props) {
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const [playerY, setPlayerY] = useState(GROUND_Y)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const velRef = useRef(0)
  const playerYRef = useRef(GROUND_Y)
  const idRef = useRef(0)
  const scoreRef = useRef(0)
  const speedRef = useRef(3)
  const areaRef = useRef<HTMLDivElement>(null)

  const start = () => {
    setPlayerY(GROUND_Y)
    playerYRef.current = GROUND_Y
    velRef.current = 0
    setObstacles([])
    setScore(0)
    scoreRef.current = 0
    speedRef.current = 3
    setDone(false)
    setPlaying(true)
  }

  const jump = useCallback(() => {
    if (!playing) return
    if (playerYRef.current >= GROUND_Y - 1) {
      velRef.current = JUMP_FORCE
    }
  }, [playing])

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [jump])

  // Game loop
  useEffect(() => {
    if (!playing) return

    let frameId: number
    let spawnCounter = 0

    const loop = () => {
      // Physics
      velRef.current += GRAVITY
      playerYRef.current = Math.min(GROUND_Y, playerYRef.current + velRef.current)
      if (playerYRef.current >= GROUND_Y) velRef.current = 0
      setPlayerY(playerYRef.current)

      // Score
      scoreRef.current += 1
      if (scoreRef.current % 10 === 0) setScore(Math.floor(scoreRef.current / 10))
      // Increase speed
      speedRef.current = 3 + Math.floor(scoreRef.current / 300) * 0.5

      // Spawn obstacles
      spawnCounter++
      if (spawnCounter > 80 + Math.random() * 60) {
        const types: Obstacle['type'][] = ['cactus', 'rock', 'bird']
        setObstacles(prev => [
          ...prev.slice(-5),
          { id: idRef.current++, x: 100, type: types[Math.floor(Math.random() * types.length)] },
        ])
        spawnCounter = 0
      }

      // Move obstacles + collision
      setObstacles(prev => {
        const speed = speedRef.current
        const survived: Obstacle[] = []
        let hit = false

        for (const obs of prev) {
          const newX = obs.x - speed * 0.5
          // Player is at x=10%, playerY%; obstacle at x=newX%
          const pxRange = Math.abs(newX - 10) < 5
          const isBird = obs.type === 'bird'
          const obstacleY = isBird ? 55 : GROUND_Y
          const pyRange = playerYRef.current >= obstacleY - 8

          if (pxRange && pyRange) { hit = true; break }
          if (newX > -10) survived.push({ ...obs, x: newX })
        }

        if (hit) {
          setPlaying(false)
          setDone(true)
          return []
        }
        return survived
      })

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [playing])

  const xpEarned = Math.max(5, score)

  const handleClaim = () => {
    onXPEarned(xpEarned)
    setDone(false)
  }

  const OBSTACLE_EMOJIS = { cactus: '🌵', rock: '🪨', bird: '🐦' }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-base text-gray-700">Score: <span className="text-orange-500">{score}</span></div>
        <div className="text-sm text-gray-400 font-nunito">Space / ↑ to jump</div>
      </div>

      <div
        ref={areaRef}
        className="relative w-full max-w-sm bg-gradient-to-b from-orange-50 to-amber-100 rounded-2xl border-2 border-orange-200 overflow-hidden cursor-pointer select-none"
        style={{ height: 160 }}
        onClick={jump}
      >
        {/* Ground line */}
        <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-orange-200" />

        {/* Clouds */}
        <div className="absolute text-xl opacity-40" style={{ top: '10%', left: '20%' }}>☁️</div>
        <div className="absolute text-base opacity-30" style={{ top: '5%', left: '60%' }}>☁️</div>

        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-4xl">🏃</div>
            <div className="font-fredoka text-xl text-gray-700">Habit Run!</div>
            <p className="text-xs text-gray-500 text-center px-4">Press Space / tap to jump over obstacles!</p>
            <button onClick={e => { e.stopPropagation(); start() }} className="px-5 py-1.5 bg-orange-400 hover:bg-orange-500 text-white font-fredoka text-base rounded-full shadow transition">
              Run! 🎮
            </button>
          </div>
        )}

        {playing && <>
          {/* Player */}
          <div
            className="absolute text-3xl"
            style={{ left: '10%', top: `${playerY}%`, transform: 'translate(-50%, -50%)' }}
          >
            🏃
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="absolute text-2xl"
              style={{
                left: `${obs.x}%`,
                top: obs.type === 'bird' ? '55%' : `${GROUND_Y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {OBSTACLE_EMOJIS[obs.type]}
            </div>
          ))}
        </>}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur">
            <div className="text-3xl">💥</div>
            <div className="font-fredoka text-xl">Crashed!</div>
            <div className="font-nunito text-gray-600">Score: <span className="font-bold text-orange-500">{score}</span></div>
            <div className="font-nunito text-xs text-emerald-600">+{xpEarned} XP!</div>
            <div className="flex gap-2">
              <button onClick={handleClaim} className="px-4 py-1 bg-emerald-400 text-white font-fredoka text-sm rounded-full">Claim!</button>
              <button onClick={e => { e.stopPropagation(); start() }} className="px-4 py-1 bg-gray-200 text-gray-700 font-fredoka text-sm rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 font-nunito">Dodge 🌵 cacti, 🪨 rocks, and 🐦 birds! Score 1 XP per 10 meters</p>
    </div>
  )
}
