import { supabase } from '../supabase'
import type { CharacterState, CycleData, CycleLog, Period } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getCycleData(userId: string): Promise<CycleData> {
  const [character, { data: periodRows }, { data: logRows }] = await Promise.all([
    getCharacter(userId, 'cycle'),
    supabase.from('periods').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    supabase.from('cycle_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(400),
  ])
  const periods: Period[] = (periodRows ?? []).map(r => ({
    id: r.id, startDate: r.start_date, endDate: r.end_date ?? undefined,
  }))
  const logs: CycleLog[] = (logRows ?? []).map(r => ({
    date: r.date, flow: r.flow, symptoms: r.symptoms ?? [], note: r.note ?? '',
  }))
  return { periods, logs, character }
}

export async function startPeriod(userId: string, startDate: string): Promise<Period> {
  const { data, error } = await supabase
    .from('periods')
    .insert({ user_id: userId, start_date: startDate })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, startDate: data.start_date, endDate: data.end_date ?? undefined }
}

export async function endPeriod(id: string, endDate: string) {
  await supabase.from('periods').update({ end_date: endDate }).eq('id', id)
}

export async function deletePeriod(id: string) {
  await supabase.from('periods').delete().eq('id', id)
}

export async function upsertCycleLog(userId: string, log: CycleLog) {
  await supabase.from('cycle_logs').upsert({
    user_id: userId, date: log.date, flow: log.flow, symptoms: log.symptoms, note: log.note,
  })
}

export async function deleteCycleLog(userId: string, date: string) {
  await supabase.from('cycle_logs').delete().eq('user_id', userId).eq('date', date)
}

export async function saveCycleCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'cycle', c)
}
