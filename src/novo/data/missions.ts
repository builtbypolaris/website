import { TEMPLATE_MAP } from './templates'
import type { TemplateId } from '../types'

// ── Weekly mission catalog ───────────────────────────────────
// Missions are deterministic per week: every owned tracker gets an XP
// mission and an active-days mission, plus two global missions. Rows are
// upserted lazily (ensureWeeklyMissions) and progressed inside awardXP.
// Completing a mission = 1 crown 👑 = 1 plant planted / 1 person helped.

export type MissionKind = 'xp' | 'days' | 'games'

export interface MissionDef {
  missionId: string
  trackerType: TemplateId | null
  kind: MissionKind
  title: string
  emoji: string
  target: number
}

const TRACKER_XP_TARGET = 150
const TRACKER_DAYS_TARGET = 3
const GLOBAL_GAMES_TARGET = 6
const GLOBAL_XP_TARGET = 500

export const GLOBAL_MISSIONS: MissionDef[] = [
  { missionId: 'all-games', trackerType: null, kind: 'games', title: 'Play 6 mini-games', emoji: '🕹️', target: GLOBAL_GAMES_TARGET },
  { missionId: 'all-xp', trackerType: null, kind: 'xp', title: 'Earn 500 XP anywhere', emoji: '⚡', target: GLOBAL_XP_TARGET },
]

export function trackerMissions(id: TemplateId): MissionDef[] {
  const t = TEMPLATE_MAP[id]
  return [
    { missionId: `${id}-xp`, trackerType: id, kind: 'xp', title: `Earn ${TRACKER_XP_TARGET} XP in ${t.shortName}`, emoji: t.emoji, target: TRACKER_XP_TARGET },
    { missionId: `${id}-days`, trackerType: id, kind: 'days', title: `Log ${t.shortName} on ${TRACKER_DAYS_TARGET} different days`, emoji: '📅', target: TRACKER_DAYS_TARGET },
  ]
}

export function missionDefsFor(ownedIds: TemplateId[]): MissionDef[] {
  return [...ownedIds.flatMap(trackerMissions), ...GLOBAL_MISSIONS]
}

export function getMissionDef(missionId: string): MissionDef | null {
  const global = GLOBAL_MISSIONS.find(m => m.missionId === missionId)
  if (global) return global
  const dash = missionId.lastIndexOf('-')
  if (dash === -1) return null
  const trackerId = missionId.slice(0, dash) as TemplateId
  if (!TEMPLATE_MAP[trackerId]) return null
  return trackerMissions(trackerId).find(m => m.missionId === missionId) ?? null
}

// ── Badge catalog (generic, same 8 per tracker) ──────────────

export interface BadgeDef {
  id: string
  label: string
  emoji: string
  description: string
}

export const BADGES: BadgeDef[] = [
  { id: 'first-log', label: 'First Log', emoji: '🎯', description: 'Logged for the very first time' },
  { id: 'xp-100', label: 'Century', emoji: '💯', description: 'Reached 100 XP' },
  { id: 'xp-1000', label: 'Grinder', emoji: '⚡', description: 'Reached 1,000 XP' },
  { id: 'stage-5', label: 'Evolver', emoji: '🧬', description: 'Evolved to stage 5' },
  { id: 'prestige', label: 'Prestige', emoji: '⭐', description: 'Completed a full prestige' },
  { id: 'streak-7', label: 'On Fire', emoji: '🔥', description: 'Hit a 7-day streak' },
  { id: 'streak-30', label: 'Unstoppable', emoji: '🌋', description: 'Hit a 30-day streak' },
  { id: 'gamer', label: 'Arcade Kid', emoji: '🕹️', description: 'Claimed XP from a mini-game' },
]

export const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries(BADGES.map(b => [b.id, b]))
