import { supabase } from '../supabase'
import type { CharacterState, Habit, HabitData } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getHabitData(userId: string): Promise<HabitData> {
  const [character, { data: habitRows }] = await Promise.all([
    getCharacter(userId, 'habit'),
    supabase.from('habits').select('*, habit_completions(completed_date)').eq('user_id', userId).order('created_at'),
  ])
  const habits: Habit[] = (habitRows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    frequency: r.frequency,
    createdAt: r.created_at,
    completions: (r.habit_completions as { completed_date: string }[]).map(c => c.completed_date),
  }))
  return { habits, character }
}

export async function addHabit(userId: string, h: Omit<Habit, 'id' | 'createdAt' | 'completions'>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, name: h.name, icon: h.icon, frequency: h.frequency })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, icon: data.icon, frequency: data.frequency, createdAt: data.created_at, completions: [] }
}

export async function updateHabit(id: string, patch: Partial<{ name: string; icon: string; frequency: string }>) {
  await supabase.from('habits').update(patch).eq('id', id)
}

export async function deleteHabit(id: string) {
  await supabase.from('habits').delete().eq('id', id)
}

export async function toggleHabitCompletion(habitId: string, userId: string, date: string, completed: boolean) {
  if (completed) {
    await supabase.from('habit_completions').upsert({ habit_id: habitId, user_id: userId, completed_date: date })
  } else {
    await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_date', date)
  }
}

export async function saveHabitCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'habit', c)
}
