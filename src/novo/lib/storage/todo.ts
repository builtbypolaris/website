import { supabase } from '../supabase'
import type { CharacterState, Task, TodoData } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getTodoData(userId: string): Promise<TodoData> {
  const [character, { data: rows }] = await Promise.all([
    getCharacter(userId, 'todo'),
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])
  const tasks: Task[] = (rows ?? []).map(r => ({
    id: r.id,
    title: r.title,
    completed: r.completed,
    priority: r.priority,
    dueDate: r.due_date ?? undefined,
    createdAt: r.created_at,
    completedAt: r.completed_at ?? undefined,
  }))
  return { tasks, character }
}

export async function addTask(userId: string, t: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, title: t.title, completed: t.completed, priority: t.priority, due_date: t.dueDate ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, title: data.title, completed: data.completed, priority: data.priority, dueDate: data.due_date ?? undefined, createdAt: data.created_at }
}

export async function updateTask(id: string, patch: Partial<{ title: string; completed: boolean; priority: string; dueDate: string; completedAt: string }>) {
  await supabase.from('tasks').update({
    title: patch.title,
    completed: patch.completed,
    priority: patch.priority,
    due_date: patch.dueDate ?? null,
    completed_at: patch.completedAt ?? null,
  }).eq('id', id)
}

export async function deleteTask(id: string) {
  await supabase.from('tasks').delete().eq('id', id)
}

export async function saveTodoCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'todo', c)
}
