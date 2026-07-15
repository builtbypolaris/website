import { useState } from 'react'
import Character from './Character'
import { NCard, NProgress, INK, hardShadow } from './ui'
import { BadgeWall } from './BadgeWall'
import { MissionsPanel } from './MissionsPanel'
import { saveCharacter, PRESTIGE_XP, todayStr } from '../lib/storage'
import { happinessMultiplier, type StreakRow, type MissionRow } from '../lib/gamification'
import { TEMPLATE_MAP } from '../data/templates'
import { getStageFromXP } from '../data/creatures'
import type { CharacterState, TemplateId } from '../types'

// The Pet Room: interactive pet care, evolution roadmap with the crown
// cycle counter, streak stats, badges, and this tracker's missions.
// Care actions are limited per day (tracked in localStorage).

const PETS_PER_DAY = 3
const TREATS_PER_DAY = 1

interface CareState { pets: number; treats: number }

function careKey(trackerId: TemplateId) {
  return `novo-care-${trackerId}-${todayStr()}`
}

function loadCare(trackerId: TemplateId): CareState {
  try {
    const raw = localStorage.getItem(careKey(trackerId))
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted entry — start fresh */ }
  return { pets: 0, treats: 0 }
}

export function PetRoom({
  userId,
  trackerId,
  character,
  streak,
  earnedBadges,
  missions,
  onCharacter,
}: {
  userId: string
  trackerId: TemplateId
  character: CharacterState
  streak: StreakRow | null
  earnedBadges: Set<string>
  missions: MissionRow[]
  onCharacter: (c: CharacterState) => void
}) {
  const [care, setCare] = useState<CareState>(() => loadCare(trackerId))
  const [wiggle, setWiggle] = useState(0)

  const template = TEMPLATE_MAP[trackerId]
  const accent = template.accent
  const stage = getStageFromXP(template.stages, character.xp)
  const mult = happinessMultiplier(character.happiness)
  const cyclePct = (character.xp / PRESTIGE_XP) * 100

  const doCare = (kind: 'pet' | 'treat') => {
    const next: CareState = { ...care, [kind === 'pet' ? 'pets' : 'treats']: (kind === 'pet' ? care.pets : care.treats) + 1 }
    const delta = kind === 'pet' ? 5 : 15
    const updated = { ...character, happiness: Math.min(100, character.happiness + delta) }
    setCare(next)
    localStorage.setItem(careKey(trackerId), JSON.stringify(next))
    setWiggle(w => w + 1)
    onCharacter(updated)
    void saveCharacter(userId, trackerId, updated)
  }

  const moodLabel = character.happiness >= 80 ? 'Thriving' : character.happiness >= 55 ? 'Content' : character.happiness > 30 ? 'Meh' : 'Neglected'
  const moodColor = character.happiness >= 80 ? '#16A34A' : character.happiness > 30 ? '#CA8A04' : '#DC2626'

  const relevantMissions = missions.filter(m => m.trackerType === trackerId || m.trackerType === null)

  return (
    <div className="space-y-4">
      {/* Interactive pet */}
      <NCard accent={accent} className="p-4 md:p-5">
        <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: accent }}>
          🐾 Pet Room
        </div>
        <div key={wiggle} className={wiggle > 0 ? 'bounce-in' : ''} onClick={() => setWiggle(w => w + 1)}>
          <Character
            type={trackerId}
            xp={character.xp}
            happiness={character.happiness}
            prestige={character.prestige}
          />
        </div>

        {/* Happiness + multiplier */}
        <div className="mt-4 rounded-xl p-3" style={{ background: '#F0EEE8', border: `2.5px solid ${INK}` }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-nunito font-black uppercase tracking-widest text-[10px]" style={{ color: INK }}>
              Happiness · {moodLabel}
            </span>
            <span className="font-nunito font-black text-xs" style={{ color: moodColor }}>
              {character.happiness}/100 · XP ×{mult}
            </span>
          </div>
          <NProgress pct={character.happiness} accent={moodColor} height={10} />
          <div className="font-nunito font-bold text-[10px] mt-1.5" style={{ color: `${INK}66` }}>
            {character.happiness >= 80
              ? 'Thriving pets earn 25% bonus XP!'
              : character.happiness <= 30
                ? 'A neglected pet earns 25% less XP. Log daily or give it some care.'
                : 'Keep happiness at 80+ for a 25% XP bonus.'}
          </div>
        </div>

        {/* Care actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => doCare('pet')}
            disabled={care.pets >= PETS_PER_DAY || character.happiness >= 100}
            className="py-2.5 rounded-xl font-nunito font-black uppercase tracking-wide text-xs transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
            style={{ background: '#FFFFFF', color: INK, border: `2.5px solid ${INK}`, boxShadow: hardShadow(3) }}
          >
            🤗 Pet · +5 ({PETS_PER_DAY - care.pets} left)
          </button>
          <button
            onClick={() => doCare('treat')}
            disabled={care.treats >= TREATS_PER_DAY || character.happiness >= 100}
            className="py-2.5 rounded-xl font-nunito font-black uppercase tracking-wide text-xs transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
            style={{ background: accent, color: '#FFFFFF', border: `2.5px solid ${INK}`, boxShadow: hardShadow(3) }}
          >
            🍬 Treat · +15 ({TREATS_PER_DAY - care.treats} left)
          </button>
        </div>
      </NCard>

      {/* Crown cycle */}
      <NCard className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: INK }}>
            👑 Crown cycle
          </div>
          <div className="font-nunito font-black text-xs px-2 py-0.5 rounded-lg" style={{ background: '#FEF3C7', border: `2px solid ${INK}`, color: INK }}>
            ×{character.prestige} complete
          </div>
        </div>
        <NProgress pct={cyclePct} accent="#F59E0B" height={14} />
        <div className="font-nunito font-bold text-[11px] mt-2" style={{ color: `${INK}66` }}>
          {character.xp.toLocaleString()} / {PRESTIGE_XP.toLocaleString()} XP. Finish the full 10-stage cycle to earn a crown.
          Every crown = 1 plant planted or 1 person helped.
        </div>

        {/* Evolution roadmap */}
        <div className="grid grid-cols-5 gap-1.5 mt-4">
          {template.stages.map(st => {
            const reached = character.xp >= st.xpRequired
            const isCurrent = st.id === stage.id
            return (
              <div
                key={st.id}
                title={`${st.name}: ${st.xpRequired.toLocaleString()} XP`}
                className="rounded-xl p-1.5 text-center"
                style={{
                  background: isCurrent ? `${accent}20` : reached ? '#FFFFFF' : '#F0EEE8',
                  border: `2.5px solid ${isCurrent ? accent : reached ? INK : `${INK}22`}`,
                  opacity: reached ? 1 : 0.45,
                }}
              >
                <div className="text-xl" style={{ filter: reached ? 'none' : 'grayscale(1)' }}>{reached ? st.emoji : '❓'}</div>
                <div className="font-nunito font-black text-[8px] uppercase" style={{ color: reached ? INK : `${INK}55` }}>
                  {reached ? st.name.split(' ')[0] : `${(st.xpRequired / 1000).toFixed(1)}k`}
                </div>
              </div>
            )
          })}
        </div>
      </NCard>

      {/* Streak */}
      <NCard className="p-4 md:p-5">
        <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: INK }}>
          🔥 Streak
        </div>
        <div className="flex gap-6">
          <div>
            <div className="font-nunito font-black text-2xl" style={{ color: (streak?.current ?? 0) > 0 ? '#EA580C' : `${INK}40` }}>
              {streak?.current ?? 0} 🔥
            </div>
            <div className="font-nunito font-black uppercase tracking-widest text-[10px]" style={{ color: `${INK}50` }}>Current</div>
          </div>
          <div>
            <div className="font-nunito font-black text-2xl" style={{ color: INK }}>{streak?.best ?? 0}</div>
            <div className="font-nunito font-black uppercase tracking-widest text-[10px]" style={{ color: `${INK}50` }}>Best</div>
          </div>
          <div className="flex-1 self-center font-nunito font-bold text-[11px]" style={{ color: `${INK}66` }}>
            {streak?.lastActive === todayStr()
              ? 'Logged today, streak safe!'
              : 'Log anything today to keep the flame alive.'}
          </div>
        </div>
      </NCard>

      <BadgeWall earned={earnedBadges} accent={accent} />

      {relevantMissions.length > 0 && <MissionsPanel missions={relevantMissions} accent={accent} title="This week's missions" />}
    </div>
  )
}
