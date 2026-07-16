import { useState } from 'react'
import Character from './Character'
import { BadgeWall } from './BadgeWall'
import { MissionsPanel } from './MissionsPanel'
import { INK, MUTED, Panel, NButton, NProgress } from './ui'
import { saveCharacter, PRESTIGE_XP, todayStr } from '../lib/storage'
import { happinessMultiplier, type StreakRow, type MissionRow } from '../lib/gamification'
import { TEMPLATE_MAP } from '../data/templates'
import { getStageFromXP } from '../data/creatures'
import type { CharacterState, TemplateId } from '../types'

// The Pet Room: interactive pet care, cycle progress toward the next
// crown, streak, badges, and this tracker's missions. One loud panel
// (the pet itself) — everything else is plain text and inline bars.

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
  } catch { /* corrupted entry, start fresh */ }
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
    onCharacter(updated)
    void saveCharacter(userId, trackerId, updated)
  }

  const moodLabel = character.happiness >= 80 ? 'thriving' : character.happiness >= 55 ? 'content' : character.happiness > 30 ? 'okay' : 'neglected'

  const relevantMissions = missions.filter(m => m.trackerType === trackerId || m.trackerType === null)

  return (
    <div className="space-y-6">
      {/* The pet, its happiness, and care actions — the one loud panel */}
      <Panel accent={accent} tone="fill" className="p-6">
        <div className="flex justify-center mb-4">
          <Character type={trackerId} xp={character.xp} happiness={character.happiness} prestige={character.prestige} />
        </div>

        <div className="flex items-center justify-between text-white/85 font-nunito text-xs mb-1.5">
          <span>Happiness, {moodLabel}</span>
          <span>×{mult} XP</span>
        </div>
        <NProgress pct={character.happiness} accent="#FFFFFF" track="rgba(255,255,255,0.25)" height={5} />

        <div className="flex gap-3 mt-4">
          <NButton
            variant="ghost"
            accent="#FFFFFF"
            size="sm"
            disabled={care.pets >= PETS_PER_DAY || character.happiness >= 100}
            onClick={() => doCare('pet')}
            className="flex-1"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            Pet (+5, {PETS_PER_DAY - care.pets} left)
          </NButton>
          <NButton
            variant="ghost"
            accent="#FFFFFF"
            size="sm"
            disabled={care.treats >= TREATS_PER_DAY || character.happiness >= 100}
            onClick={() => doCare('treat')}
            className="flex-1"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            Treat (+15, {TREATS_PER_DAY - care.treats} left)
          </NButton>
        </div>
      </Panel>

      {/* Crown cycle */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-nunito font-semibold text-sm" style={{ color: INK }}>Cycle to next crown</span>
          <span className="font-nunito text-xs" style={{ color: MUTED }}>{character.prestige} complete</span>
        </div>
        <NProgress pct={cyclePct} accent="#F59E0B" height={6} />
        <div className="font-nunito text-xs mt-1.5" style={{ color: MUTED }}>
          {character.xp.toLocaleString()} / {PRESTIGE_XP.toLocaleString()} XP. A finished cycle earns a crown, worth one plant or one person helped.
        </div>

        <div className="flex items-end gap-2 mt-4">
          {template.stages.map(st => {
            const reached = character.xp >= st.xpRequired
            const isCurrent = st.id === stage.id
            return (
              <div key={st.id} title={st.name} className="text-center" style={{ opacity: reached ? 1 : 0.3 }}>
                <div style={{ fontSize: isCurrent ? 26 : 16, filter: reached ? 'none' : 'grayscale(1)' }}>
                  {st.emoji}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak */}
      {(streak?.current ?? 0) > 0 && (
        <div className="font-nunito text-sm" style={{ color: INK }}>
          🔥 {streak!.current}-day streak, best {streak!.best}
        </div>
      )}

      <BadgeWall earned={earnedBadges} accent={accent} />

      {relevantMissions.length > 0 && <MissionsPanel missions={relevantMissions} accent={accent} title="This week's missions" />}
    </div>
  )
}
