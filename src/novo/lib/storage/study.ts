import { supabase } from '../supabase'
import type { CharacterState, StudyData, StudySession, Subject } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getStudyData(userId: string): Promise<StudyData> {
  const [character, { data: subjectRows }, { data: sessionRows }] = await Promise.all([
    getCharacter(userId, 'study'),
    supabase.from('subjects').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('study_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const subjects: Subject[] = (subjectRows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    color: r.color ?? '#C4B5FD',
    examDate: r.exam_date ?? undefined,
    createdAt: r.created_at,
  }))
  const sessions: StudySession[] = (sessionRows ?? []).map(r => ({
    id: r.id,
    subjectId: r.subject_id,
    durationMinutes: r.duration_minutes,
    notes: r.notes ?? '',
    date: r.date,
  }))
  return { subjects, sessions, character }
}

export async function addSubject(
  userId: string,
  s: { name: string; color: string; examDate?: string },
): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: userId, name: s.name, color: s.color, exam_date: s.examDate ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, color: data.color ?? '#C4B5FD', examDate: data.exam_date ?? undefined, createdAt: data.created_at }
}

export async function updateSubject(id: string, patch: Partial<{ name: string; color: string; examDate: string | null }>) {
  await supabase.from('subjects').update({
    name: patch.name,
    color: patch.color,
    exam_date: patch.examDate,
  }).eq('id', id)
}

export async function deleteSubject(id: string) {
  await supabase.from('subjects').delete().eq('id', id)
}

export async function addStudySession(
  userId: string,
  s: { subjectId: string; durationMinutes: number; notes: string; date: string },
): Promise<StudySession> {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, subject_id: s.subjectId, duration_minutes: s.durationMinutes, notes: s.notes, date: s.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, subjectId: data.subject_id, durationMinutes: data.duration_minutes, notes: data.notes ?? '', date: data.date }
}

export async function deleteStudySession(id: string) {
  await supabase.from('study_sessions').delete().eq('id', id)
}

export async function saveStudyCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'study', c)
}
