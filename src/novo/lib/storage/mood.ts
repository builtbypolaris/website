import { supabase } from '../supabase'
import type { CharacterState, MoodData, MoodEntry, MoodLevel } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getMoodData(userId: string): Promise<MoodData> {
  // Limit history to the last 12 months — enough for the heatmap and trends.
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)
  const [character, { data: rows }] = await Promise.all([
    getCharacter(userId, 'mood'),
    supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_at', cutoff.toISOString())
      .order('entry_at', { ascending: false }),
  ])
  const entries: MoodEntry[] = (rows ?? []).map(r => ({
    id: r.id,
    mood: r.mood as MoodLevel,
    tags: r.tags ?? [],
    note: r.note ?? '',
    entryAt: r.entry_at,
  }))
  return { entries, character }
}

export async function addMoodEntry(
  userId: string,
  e: { mood: MoodLevel; tags: string[]; note: string },
): Promise<MoodEntry> {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert({ user_id: userId, mood: e.mood, tags: e.tags, note: e.note })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, mood: data.mood as MoodLevel, tags: data.tags ?? [], note: data.note ?? '', entryAt: data.entry_at }
}

export async function deleteMoodEntry(id: string) {
  await supabase.from('mood_entries').delete().eq('id', id)
}

export async function saveMoodCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'mood', c)
}
