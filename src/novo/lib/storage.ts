import { supabase } from './supabase'
import type { CharacterState, FinancialData, TodoData, HabitData, Transaction, Task, Habit } from '../types'

const GOOGLE_CLIENT_ID = '107776182677-kidufsq4cmomcgfjae25mo8viro3lo1a.apps.googleusercontent.com'

interface GISCredential { credential: string }
interface GISNotification { isNotDisplayed(): boolean; isSkippedMoment(): boolean }
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(cfg: { client_id: string; callback: (r: GISCredential) => void; auto_select?: boolean }): void
          prompt(cb?: (n: GISNotification) => void): void
          cancel(): void
          renderButton(parent: HTMLElement, options: { type?: string; theme?: string; size?: string; width?: number }): void
        }
      }
    }
  }
}

export const PRESTIGE_XP = 6500

// ── Auth ────────────────────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signInWithGoogle(): Promise<{ error: Error | null }> {
  return new Promise(resolve => {
    if (!window.google?.accounts?.id) {
      resolve({ error: new Error('Google Sign-In not ready — please refresh the page.') })
      return
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      callback: async ({ credential }) => {
        const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: credential })
        resolve({ error: error ? new Error(error.message) : null })
      },
    })
    window.google.accounts.id.prompt(n => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        resolve({ error: new Error('Google sign-in was not shown. Try clearing site cookies and retry.') })
      }
    })
  })
}

export function mountGoogleButton(element: HTMLElement, onResult: (err: Error | null) => void): void {
  if (!window.google?.accounts?.id) {
    onResult(new Error('Google Sign-In not ready — please refresh the page.'))
    return
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    auto_select: false,
    callback: async ({ credential }) => {
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: credential })
      onResult(error ? new Error(error.message) : null)
    },
  })
  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    size: 'large',
    width: element.offsetWidth || 400,
  })
}

export async function logout() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
  return supabase.auth.onAuthStateChange(cb)
}

// ── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  full_name: string | null
  age: number | null
  location: string | null
  owned_templates: string[]
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function createProfile(
  userId: string,
  username: string,
  fullName: string,
  age: number | null,
  location: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    username,
    full_name: fullName,
    age,
    location,
    owned_templates: [],
  })
  return { error: error?.message ?? null }
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  return !!data
}

// ── Character helpers ────────────────────────────────────────────────────────

export function addXP(character: CharacterState, amount: number): CharacterState {
  const newXP = Math.max(0, character.xp + amount)
  const happinessDelta = amount > 0 ? 2 : -2
  const newHappiness = Math.min(100, Math.max(0, character.happiness + happinessDelta))
  const prestige = character.prestige ?? 0

  if (newXP >= PRESTIGE_XP) {
    return {
      xp: newXP - PRESTIGE_XP,
      happiness: Math.min(100, newHappiness + 20),
      prestige: prestige + 1,
    }
  }
  return { xp: newXP, happiness: newHappiness, prestige }
}

async function getCharacter(userId: string, trackerType: string): Promise<CharacterState> {
  const { data } = await supabase
    .from('characters')
    .select('xp, happiness, prestige')
    .eq('user_id', userId)
    .eq('tracker_type', trackerType)
    .single()
  return data ?? { xp: 0, happiness: 80, prestige: 0 }
}

async function saveCharacter(userId: string, trackerType: string, c: CharacterState) {
  await supabase
    .from('characters')
    .upsert({ user_id: userId, tracker_type: trackerType, xp: c.xp, happiness: c.happiness, prestige: c.prestige })
}

// ── Financial ────────────────────────────────────────────────────────────────

export async function getFinancialData(userId: string): Promise<FinancialData> {
  const [character, { data: rows }] = await Promise.all([
    getCharacter(userId, 'financial'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const transactions: Transaction[] = (rows ?? []).map(r => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    description: r.description ?? '',
    date: r.date,
  }))
  return { transactions, character }
}

export async function addTransaction(userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: userId, ...t })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, type: data.type, amount: data.amount, category: data.category, description: data.description ?? '', date: data.date }
}

export async function deleteTransaction(id: string) {
  await supabase.from('transactions').delete().eq('id', id)
}

export async function saveFinancialCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'financial', c)
}

// ── Todo ─────────────────────────────────────────────────────────────────────

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

// ── Habit ─────────────────────────────────────────────────────────────────────

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

// ── Payments ─────────────────────────────────────────────────────────────────

export async function createPaymentOrder(
  accessToken: string,
  plan: '1tracker' | '3trackers',
  tracker?: string,
): Promise<{ token: string; orderId: string }> {
  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ plan, tracker }),
    },
  )
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to create payment')
  }
  return resp.json()
}

// ── Utility ──────────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}
