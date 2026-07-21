import { supabase } from '../supabase'
import type { CharacterState, TemplateId } from '../../types'

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

export const DEFAULT_CHARACTER: CharacterState = { xp: 0, happiness: 80, prestige: 0 }

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
  cause: 'social' | 'environment' | null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
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

export async function getCharacter(userId: string, trackerType: TemplateId): Promise<CharacterState> {
  const { data } = await supabase
    .from('characters')
    .select('xp, happiness, prestige')
    .eq('user_id', userId)
    .eq('tracker_type', trackerType)
    .maybeSingle()
  return data ?? DEFAULT_CHARACTER
}

export async function saveCharacter(userId: string, trackerType: TemplateId, c: CharacterState) {
  await supabase
    .from('characters')
    .upsert({ user_id: userId, tracker_type: trackerType, xp: c.xp, happiness: c.happiness, prestige: c.prestige })
}

export async function getAllCharacters(userId: string): Promise<Partial<Record<TemplateId, CharacterState>>> {
  const { data } = await supabase
    .from('characters')
    .select('tracker_type, xp, happiness, prestige')
    .eq('user_id', userId)
  const map: Partial<Record<TemplateId, CharacterState>> = {}
  for (const r of data ?? []) {
    map[r.tracker_type as TemplateId] = { xp: r.xp, happiness: r.happiness, prestige: r.prestige }
  }
  return map
}

// ── Utility ──────────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}
