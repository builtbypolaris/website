import { supabase } from '../supabase'
import type { Baby, BabyData, BabyEvent, CharacterState, GrowthEntry, Milestone } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getBabyData(userId: string): Promise<BabyData> {
  const [character, { data: babyRows }, { data: eventRows }, { data: growthRows }, { data: milestoneRows }] = await Promise.all([
    getCharacter(userId, 'baby'),
    supabase.from('babies').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('baby_events').select('*').eq('user_id', userId).order('event_at', { ascending: false }).limit(500),
    supabase.from('growth_entries').select('*').eq('user_id', userId).order('date'),
    supabase.from('milestones').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const babies: Baby[] = (babyRows ?? []).map(r => ({
    id: r.id, name: r.name, emoji: r.emoji ?? '👶', birthdate: r.birthdate,
  }))
  const events: BabyEvent[] = (eventRows ?? []).map(r => ({
    id: r.id, babyId: r.baby_id, eventType: r.event_type, eventAt: r.event_at, note: r.note ?? '',
  }))
  const growth: GrowthEntry[] = (growthRows ?? []).map(r => ({
    id: r.id, babyId: r.baby_id, date: r.date,
    weightKg: r.weight_kg != null ? Number(r.weight_kg) : undefined,
    heightCm: r.height_cm != null ? Number(r.height_cm) : undefined,
  }))
  const milestones: Milestone[] = (milestoneRows ?? []).map(r => ({
    id: r.id, babyId: r.baby_id, title: r.title, date: r.date,
  }))
  return { babies, events, growth, milestones, character }
}

export async function addBaby(userId: string, b: { name: string; emoji: string; birthdate: string }): Promise<Baby> {
  const { data, error } = await supabase
    .from('babies')
    .insert({ user_id: userId, name: b.name, emoji: b.emoji, birthdate: b.birthdate })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, emoji: data.emoji ?? '👶', birthdate: data.birthdate }
}

export async function deleteBaby(id: string) {
  await supabase.from('babies').delete().eq('id', id)
}

export async function addBabyEvent(
  userId: string,
  e: { babyId: string; eventType: string; note: string },
): Promise<BabyEvent> {
  const { data, error } = await supabase
    .from('baby_events')
    .insert({ user_id: userId, baby_id: e.babyId, event_type: e.eventType, note: e.note })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, babyId: data.baby_id, eventType: data.event_type, eventAt: data.event_at, note: data.note ?? '' }
}

export async function deleteBabyEvent(id: string) {
  await supabase.from('baby_events').delete().eq('id', id)
}

export async function addGrowthEntry(
  userId: string,
  g: { babyId: string; date: string; weightKg?: number; heightCm?: number },
): Promise<GrowthEntry> {
  const { data, error } = await supabase
    .from('growth_entries')
    .insert({ user_id: userId, baby_id: g.babyId, date: g.date, weight_kg: g.weightKg ?? null, height_cm: g.heightCm ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return {
    id: data.id, babyId: data.baby_id, date: data.date,
    weightKg: data.weight_kg != null ? Number(data.weight_kg) : undefined,
    heightCm: data.height_cm != null ? Number(data.height_cm) : undefined,
  }
}

export async function deleteGrowthEntry(id: string) {
  await supabase.from('growth_entries').delete().eq('id', id)
}

export async function addMilestone(userId: string, m: { babyId: string; title: string; date: string }): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .insert({ user_id: userId, baby_id: m.babyId, title: m.title, date: m.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, babyId: data.baby_id, title: data.title, date: data.date }
}

export async function deleteMilestone(id: string) {
  await supabase.from('milestones').delete().eq('id', id)
}

export async function saveBabyCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'baby', c)
}
