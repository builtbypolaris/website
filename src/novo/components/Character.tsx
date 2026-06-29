import { useState, useEffect, useRef } from 'react'
import type { TemplateId, CreatureStage } from '../types'
import {
  FINANCIAL_STAGES, TODO_STAGES, HABIT_STAGES,
  getStageFromXP, getNextStage,
} from '../data/creatures'
import { PRESTIGE_XP } from '../lib/storage'

const STAGES_MAP: Record<TemplateId, CreatureStage[]> = {
  financial: FINANCIAL_STAGES,
  todo: TODO_STAGES,
  habit: HABIT_STAGES,
}

const MAX_STAGE_XP = 6000  // xpRequired of stage 9

const MOODS = ['Happy', 'Excited', 'Sleepy', 'Playful']
const MESSAGES: Record<TemplateId, string[]> = {
  financial: ['Save more, worry less!', 'Money loves company!', 'Track every rupiah!', 'Your wallet is growing!'],
  todo: ['Tasks done = power gained!', 'Check! Check! Check!', "Let's conquer today!", 'One task at a time!'],
  habit: ['Consistency is key!', 'Another day, another habit!', 'You are unstoppable!', 'Streaks make champions!'],
}

interface Props {
  type: TemplateId
  xp: number
  happiness: number
  prestige?: number
  onEvolution?: (stage: CreatureStage) => void
  onPrestige?: (prestige: number) => void
}

export default function Character({ type, xp, happiness, prestige = 0, onEvolution, onPrestige }: Props) {
  const stages = STAGES_MAP[type]
  const currentStage = getStageFromXP(stages, xp)
  const nextStage = getNextStage(stages, currentStage.id)
  const isMaxLevel = !nextStage

  const prevXPRef = useRef(xp)
  const prevPrestigeRef = useRef(prestige)
  const [isEvolving, setIsEvolving] = useState(false)
  const [isPrestiging, setIsPrestiging] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleMsg, setBubbleMsg] = useState('')
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([])

  // Prestige detection
  useEffect(() => {
    if (prestige > prevPrestigeRef.current) {
      setIsPrestiging(true)
      spawnSparkles(12)
      onPrestige?.(prestige)
      setTimeout(() => setIsPrestiging(false), 2500)
    }
    prevPrestigeRef.current = prestige
  }, [prestige])

  // Evolution detection
  useEffect(() => {
    const prevStage = getStageFromXP(stages, prevXPRef.current)
    if (currentStage.id > prevStage.id) {
      setIsEvolving(true)
      spawnSparkles(8)
      onEvolution?.(currentStage)
      setTimeout(() => setIsEvolving(false), 1500)
    }
    prevXPRef.current = xp
  }, [xp])

  // Random speech bubble
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = MESSAGES[type]
      setBubbleMsg(msgs[Math.floor(Math.random() * msgs.length)])
      setShowBubble(true)
      setTimeout(() => setShowBubble(false), 3000)
    }, 8000)
    return () => clearInterval(interval)
  }, [type])

  function spawnSparkles(count = 8) {
    const emojis = ['✨', '🌟', '💫', '⭐', '🎉', '🎊']
    setSparkles(Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 180 - 40,
      y: Math.random() * 180 - 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    })))
    setTimeout(() => setSparkles([]), 2000)
  }

  // XP bar
  const xpForCurrent = currentStage.xpRequired
  const xpForNext = nextStage?.xpRequired ?? MAX_STAGE_XP
  const progressToNext = nextStage
    ? Math.min(100, ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100)
    : 0

  // Prestige bar (only at max level)
  const xpIntoMax = Math.max(0, xp - MAX_STAGE_XP)
  const xpNeededForPrestige = PRESTIGE_XP - MAX_STAGE_XP  // 500
  const prestigeProgress = Math.min(100, (xpIntoMax / xpNeededForPrestige) * 100)

  const size = 80 + currentStage.id * 12
  const happinessEmoji = happiness >= 80 ? '😍' : happiness >= 50 ? '😊' : happiness >= 30 ? '😐' : '😢'
  const moodLabel = MOODS[Math.floor(happiness / 25)]

  const prestigeBadge = prestige > 0
    ? (prestige <= 3 ? '⭐'.repeat(prestige) : `⭐×${prestige}`)
    : null

  return (
    <div className="flex flex-col items-center gap-3 select-none">

      {/* Prestige flash */}
      {isPrestiging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 25%, #EC4899 50%, #F59E0B 75%, #7C3AED 100%)',
            opacity: 0.75,
          }} />
          <div className="relative z-10 text-center bounce-in">
            <div className="text-8xl mb-3">🌟</div>
            <div
              className="font-fredoka font-bold mb-2"
              style={{ fontSize: 52, color: '#fff', textShadow: '0 0 40px #FFD700, 0 0 80px #FFD700' }}
            >
              PRESTIGE!
            </div>
            <div className="font-nunito font-bold text-yellow-200 text-xl mb-1">
              {prestigeBadge} Prestige {prestige}
            </div>
            <div className="font-nunito text-white/70 text-sm">Your pet is reborn stronger!</div>
          </div>
        </div>
      )}

      {/* Evolution flash */}
      {isEvolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="evolution-flash absolute inset-0" style={{ background: currentStage.color, opacity: 0.5 }} />
          <div className="relative z-10 text-center bounce-in">
            <div className="text-7xl mb-2">{currentStage.emoji}</div>
            <div className="font-fredoka text-4xl font-bold" style={{ color: currentStage.glow, textShadow: `0 0 20px ${currentStage.glow}` }}>
              EVOLVED!
            </div>
            <div className="text-xl font-nunito font-bold text-gray-800 mt-1">{currentStage.name}</div>
          </div>
        </div>
      )}

      {/* Character display */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full animate-pulseGlow"
          style={{
            width: size + 40,
            height: size + 40,
            background: `radial-gradient(circle, ${currentStage.color}99, transparent 70%)`,
          }}
        />
        {sparkles.map(s => (
          <div
            key={s.id}
            className="absolute text-lg pointer-events-none"
            style={{
              left: '50%', top: '50%',
              transform: `translate(${s.x}px, ${s.y}px)`,
              animation: 'particleFloat 1.5s ease-out forwards',
            }}
          >
            {s.emoji}
          </div>
        ))}
        <div
          className="animate-float relative z-10 cursor-pointer"
          style={{ fontSize: size, lineHeight: 1 }}
          onClick={() => spawnSparkles()}
          title="Click me!"
        >
          {currentStage.emoji}
        </div>
        <div className="absolute -top-2 -right-2 text-xl z-20">{happinessEmoji}</div>
      </div>

      {/* Speech bubble */}
      {showBubble && (
        <div
          className="bounce-in relative bg-white rounded-2xl px-3 py-1.5 text-xs font-nunito font-bold text-gray-700 shadow-md border-2 max-w-40 text-center"
          style={{ borderColor: currentStage.color }}
        >
          {bubbleMsg}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${currentStage.color}`,
            }}
          />
        </div>
      )}

      {/* Name + mood + prestige badge */}
      <div className="text-center">
        <div className="font-fredoka font-semibold text-lg text-gray-800 flex items-center justify-center gap-1.5">
          {currentStage.name}
          {prestigeBadge && (
            <span className="text-sm leading-none" title={`Prestige ${prestige}`}>{prestigeBadge}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 font-nunito">
          Stage {currentStage.id} · {moodLabel}
          {prestige > 0 && <span className="ml-1" style={{ color: '#7C3AED' }}>· P{prestige}</span>}
        </div>
      </div>

      {/* XP bar */}
      <div className="w-full max-w-48">
        {!isMaxLevel ? (
          <>
            <div className="flex justify-between text-xs text-gray-500 font-nunito mb-1">
              <span>{xp} XP</span>
              <span>Next: {xpForNext} XP</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div className="h-full xp-bar-fill rounded-full transition-all duration-500" style={{ width: `${progressToNext}%` }} />
            </div>
            <div className="text-center text-xs text-gray-400 mt-1 font-nunito">
              {xpForNext - xp} XP to {nextStage!.name}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-xs font-nunito mb-1">
              <span className="text-yellow-500 font-bold">MAX LEVEL ✨</span>
              <span className="text-gray-500">{xp} XP</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${prestigeProgress}%`,
                  background: 'linear-gradient(to right, #7C3AED, #EC4899, #F59E0B)',
                }}
              />
            </div>
            <div className="text-center text-xs mt-1 font-nunito font-bold" style={{ color: '#7C3AED' }}>
              {PRESTIGE_XP - xp} XP to Prestige ⭐
            </div>
          </>
        )}
      </div>
    </div>
  )
}
