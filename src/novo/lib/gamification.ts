import { supabase } from './supabase'
import { addXP, saveCharacter, todayStr, PRESTIGE_XP } from './storage/core'
import { getStageFromXP } from '../data/creatures'
import { TEMPLATE_MAP } from '../data/templates'
import { missionDefsFor, getMissionDef, BADGE_MAP, type MissionDef } from '../data/missions'
import type { CharacterState, TemplateId } from '../types'

// ── Types ────────────────────────────────────────────────────

export type Cause = 'social' | 'environment'

export type Celebration =
  | { type: 'evolve'; fromEmoji: string; toEmoji: string; toName: string; accent: string }
  | { type: 'crown'; cycles: number; cause: Cause | null }
  | { type: 'mission'; title: string; bonusXP: number }
  | { type: 'streak'; days: number; bonusXP: number }
  | { type: 'badge'; badgeId: string; label: string; emoji: string }

export interface AwardResult {
  character: CharacterState
  celebrations: Celebration[]
  streak: StreakRow
}

export interface MissionRow {
  missionId: string
  weekStart: string
  trackerType: TemplateId | null
  progress: number
  target: number
  completedAt: string | null
  def: MissionDef | null
}

export interface StreakRow {
  current: number
  best: number
  lastActive: string | null
}

const STREAK_MILESTONES: Record<number, number> = { 7: 25, 30: 100, 100: 300 }

// Completing a weekly mission pays bonus XP (missions accelerate pet
// cycles; crowns come from completed cycles, i.e. prestige).
export const MISSION_BONUS_XP = 100

// Pet happiness multiplies positive XP: a thriving pet earns more,
// a neglected one earns less.
export function happinessMultiplier(happiness: number): number {
  if (happiness >= 80) return 1.25
  if (happiness <= 30) return 0.75
  return 1
}

// ── Week helpers ─────────────────────────────────────────────

export function getWeekStart(): string {
  const now = new Date()
  const day = (now.getUTCDay() + 6) % 7 // Monday = 0
  const monday = new Date(now.getTime() - day * 86400000)
  return monday.toISOString().split('T')[0]
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0]
}

// ── Weekly mission provisioning ──────────────────────────────

export async function ensureWeeklyMissions(userId: string, ownedIds: TemplateId[]) {
  const week = getWeekStart()
  const rows = missionDefsFor(ownedIds).map(d => ({
    user_id: userId,
    mission_id: d.missionId,
    week_start: week,
    tracker_type: d.trackerType,
    progress: 0,
    target: d.target,
  }))
  if (rows.length === 0) return
  await supabase.from('missions').upsert(rows, {
    onConflict: 'user_id,mission_id,week_start',
    ignoreDuplicates: true,
  })
}

export async function getWeekMissions(userId: string): Promise<MissionRow[]> {
  const { data } = await supabase
    .from('missions')
    .select('mission_id, week_start, tracker_type, progress, target, completed_at')
    .eq('user_id', userId)
    .eq('week_start', getWeekStart())
  return (data ?? []).map(r => ({
    missionId: r.mission_id,
    weekStart: r.week_start,
    trackerType: r.tracker_type as TemplateId | null,
    progress: r.progress,
    target: r.target,
    completedAt: r.completed_at,
    def: getMissionDef(r.mission_id),
  }))
}

// ── Streaks / crowns / impact ────────────────────────────────

export async function getStreaks(userId: string): Promise<Partial<Record<TemplateId, StreakRow>>> {
  const { data } = await supabase
    .from('streaks')
    .select('tracker_type, current, best, last_active')
    .eq('user_id', userId)
  const map: Partial<Record<TemplateId, StreakRow>> = {}
  for (const r of data ?? []) {
    map[r.tracker_type as TemplateId] = { current: r.current, best: r.best, lastActive: r.last_active }
  }
  return map
}

export async function getStreak(userId: string, trackerId: TemplateId): Promise<StreakRow | null> {
  const { data } = await supabase
    .from('streaks')
    .select('current, best, last_active')
    .eq('user_id', userId)
    .eq('tracker_type', trackerId)
    .maybeSingle()
  return data ? { current: data.current, best: data.best, lastActive: data.last_active } : null
}

export async function setCause(userId: string, cause: Cause) {
  await supabase.from('profiles').update({ cause }).eq('id', userId)
}

export async function getImpactTotals(): Promise<{ social: number; environment: number }> {
  const { data } = await supabase.rpc('impact_totals')
  const row = Array.isArray(data) ? data[0] : data
  return { social: Number(row?.social ?? 0), environment: Number(row?.environment ?? 0) }
}

async function getCause(userId: string): Promise<Cause | null> {
  const { data } = await supabase.from('profiles').select('cause').eq('id', userId).maybeSingle()
  return (data?.cause as Cause | null) ?? null
}

// Crowns are derived, never stored: 1 completed pet cycle (prestige) = 1 crown.
export function getCrowns(characters: Partial<Record<TemplateId, CharacterState>>): number {
  return Object.values(characters).reduce((sum, c) => sum + (c?.prestige ?? 0), 0)
}

// Pets lose happiness on idle days (−8 per full missed day, floor 10).
// Called on tracker page load; a localStorage guard makes it run at most
// once per tracker per day (StrictMode double-mounts can't double-decay).
export async function applyHappinessDecay(
  userId: string,
  trackerId: TemplateId,
  character: CharacterState,
): Promise<CharacterState> {
  const guard = `novo-decay-${trackerId}-${todayStr()}`
  if (localStorage.getItem(guard)) return character
  localStorage.setItem(guard, '1')
  const streak = await getStreak(userId, trackerId)
  if (!streak?.lastActive) return character
  const missedDays = Math.floor((Date.parse(todayStr()) - Date.parse(streak.lastActive)) / 86400000) - 1
  if (missedDays <= 0) return character
  const happiness = Math.max(10, character.happiness - missedDays * 8)
  if (happiness === character.happiness) return character
  const decayed = { ...character, happiness }
  await saveCharacter(userId, trackerId, decayed)
  return decayed
}

// ── Achievements ─────────────────────────────────────────────

export async function getBadges(userId: string, trackerId?: TemplateId): Promise<{ trackerType: TemplateId; badgeId: string }[]> {
  let q = supabase.from('achievements').select('tracker_type, badge_id').eq('user_id', userId)
  if (trackerId) q = q.eq('tracker_type', trackerId)
  const { data } = await q
  return (data ?? []).map(r => ({ trackerType: r.tracker_type as TemplateId, badgeId: r.badge_id }))
}

// ── The choke point: every XP award in the app goes through here ──
// Handles: character XP + save, streak upkeep + milestone bonuses,
// weekly mission progress + crown minting, achievement badges, and
// returns celebrations for the UI layer to play.

export async function awardXP(
  userId: string,
  trackerId: TemplateId,
  character: CharacterState,
  gain: number,
  kind: 'log' | 'game' = 'log',
): Promise<AwardResult> {
  const celebrations: Celebration[] = []
  const today = todayStr()

  // 1. Streak upkeep (also tells us if this is the first log of the day)
  const prev = await getStreak(userId, trackerId)
  const firstLogToday = prev?.lastActive !== today
  let current = 1
  if (prev) {
    if (prev.lastActive === today) current = prev.current
    else if (prev.lastActive === yesterdayStr()) current = prev.current + 1
  }
  const best = Math.max(prev?.best ?? 0, current)
  await supabase.from('streaks').upsert(
    { user_id: userId, tracker_type: trackerId, current, best, last_active: today },
    { onConflict: 'user_id,tracker_type' },
  )
  let bonusXP = 0
  if (firstLogToday && STREAK_MILESTONES[current]) {
    bonusXP = STREAK_MILESTONES[current]
    celebrations.push({ type: 'streak', days: current, bonusXP })
  }

  // 2. Happiness multiplies positive gains (streak/mission bonuses excluded)
  const effGain = gain > 0 ? Math.round(gain * happinessMultiplier(character.happiness)) : gain
  const progressGain = effGain + bonusXP

  // 3. Weekly missions — completing one pays bonus XP (not a crown)
  const missions = await getWeekMissions(userId)
  let missionBonus = 0
  for (const m of missions) {
    if (m.completedAt || !m.def) continue
    let delta = 0
    if (m.def.kind === 'xp' && (m.trackerType === trackerId || m.trackerType === null)) delta = progressGain
    else if (m.def.kind === 'days' && m.trackerType === trackerId && firstLogToday) delta = 1
    else if (m.def.kind === 'games' && kind === 'game') delta = 1
    if (delta === 0) continue

    const progress = Math.max(0, Math.min(m.target, m.progress + delta))
    const done = progress >= m.target
    await supabase
      .from('missions')
      .update({ progress, completed_at: done ? new Date().toISOString() : null })
      .eq('user_id', userId)
      .eq('mission_id', m.missionId)
      .eq('week_start', m.weekStart)
    if (done) {
      missionBonus += MISSION_BONUS_XP
      celebrations.push({ type: 'mission', title: m.def.title, bonusXP: MISSION_BONUS_XP })
    }
  }

  // 4. Character XP (single addXP so the prestige rollover stays correct)
  const template = TEMPLATE_MAP[trackerId]
  const stageBefore = getStageFromXP(template.stages, character.xp)
  const next = addXP(character, effGain + bonusXP + missionBonus)
  await saveCharacter(userId, trackerId, next)
  if (next.prestige > (character.prestige ?? 0)) {
    // A full pet cycle completed — this is the crown moment 👑
    const cause = await getCause(userId)
    celebrations.push({ type: 'crown', cycles: next.prestige, cause })
  } else {
    const stageAfter = getStageFromXP(template.stages, next.xp)
    if (stageAfter.id > stageBefore.id) {
      celebrations.push({
        type: 'evolve',
        fromEmoji: stageBefore.emoji,
        toEmoji: stageAfter.emoji,
        toName: stageAfter.name,
        accent: template.accent,
      })
    }
  }

  // 5. Achievement badges
  const earned = new Set((await getBadges(userId, trackerId)).map(b => b.badgeId))
  const totalXP = next.xp + next.prestige * PRESTIGE_XP
  const stageNow = getStageFromXP(template.stages, next.xp)
  const candidates: string[] = ['first-log']
  if (totalXP >= 100) candidates.push('xp-100')
  if (totalXP >= 1000) candidates.push('xp-1000')
  if (stageNow.id >= 4 || next.prestige > 0) candidates.push('stage-5')
  if (next.prestige > 0) candidates.push('prestige')
  if (current >= 7) candidates.push('streak-7')
  if (current >= 30) candidates.push('streak-30')
  if (kind === 'game') candidates.push('gamer')
  const fresh = candidates.filter(id => !earned.has(id))
  if (fresh.length > 0) {
    await supabase.from('achievements').upsert(
      fresh.map(badge_id => ({ user_id: userId, tracker_type: trackerId, badge_id })),
      { onConflict: 'user_id,tracker_type,badge_id', ignoreDuplicates: true },
    )
    for (const id of fresh) {
      const def = BADGE_MAP[id]
      if (def) celebrations.push({ type: 'badge', badgeId: id, label: def.label, emoji: def.emoji })
    }
  }

  return { character: next, celebrations, streak: { current, best, lastActive: today } }
}
