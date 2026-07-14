import { supabase } from '../supabase'
import type { CharacterState, Pet, PetCareItem, PetData, PetEvent, PetWeight } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getPetData(userId: string): Promise<PetData> {
  const [character, { data: petRows }, { data: eventRows }, { data: careRows }, { data: weightRows }] = await Promise.all([
    getCharacter(userId, 'pet'),
    supabase.from('pets').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('pet_events').select('*').eq('user_id', userId).order('event_at', { ascending: false }).limit(500),
    supabase.from('pet_care_items').select('*').eq('user_id', userId).order('due_date'),
    supabase.from('pet_weights').select('*').eq('user_id', userId).order('date'),
  ])
  const pets: Pet[] = (petRows ?? []).map(r => ({
    id: r.id, name: r.name, species: r.species, emoji: r.emoji ?? '🐾', birthdate: r.birthdate ?? undefined,
  }))
  const events: PetEvent[] = (eventRows ?? []).map(r => ({
    id: r.id, petId: r.pet_id, eventType: r.event_type, eventAt: r.event_at, note: r.note ?? '',
  }))
  const careItems: PetCareItem[] = (careRows ?? []).map(r => ({
    id: r.id, petId: r.pet_id, title: r.title, dueDate: r.due_date, done: r.done,
  }))
  const weights: PetWeight[] = (weightRows ?? []).map(r => ({
    id: r.id, petId: r.pet_id, date: r.date, weightKg: Number(r.weight_kg),
  }))
  return { pets, events, careItems, weights, character }
}

export async function addPet(userId: string, p: { name: string; species: string; emoji: string; birthdate?: string }): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .insert({ user_id: userId, name: p.name, species: p.species, emoji: p.emoji, birthdate: p.birthdate ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, species: data.species, emoji: data.emoji ?? '🐾', birthdate: data.birthdate ?? undefined }
}

export async function deletePet(id: string) {
  await supabase.from('pets').delete().eq('id', id)
}

export async function addPetEvent(userId: string, e: { petId: string; eventType: string; note: string }): Promise<PetEvent> {
  const { data, error } = await supabase
    .from('pet_events')
    .insert({ user_id: userId, pet_id: e.petId, event_type: e.eventType, note: e.note })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, petId: data.pet_id, eventType: data.event_type, eventAt: data.event_at, note: data.note ?? '' }
}

export async function deletePetEvent(id: string) {
  await supabase.from('pet_events').delete().eq('id', id)
}

export async function addPetCareItem(userId: string, i: { petId: string; title: string; dueDate: string }): Promise<PetCareItem> {
  const { data, error } = await supabase
    .from('pet_care_items')
    .insert({ user_id: userId, pet_id: i.petId, title: i.title, due_date: i.dueDate })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, petId: data.pet_id, title: data.title, dueDate: data.due_date, done: data.done }
}

export async function setPetCareItemDone(id: string, done: boolean) {
  await supabase.from('pet_care_items').update({ done }).eq('id', id)
}

export async function deletePetCareItem(id: string) {
  await supabase.from('pet_care_items').delete().eq('id', id)
}

export async function addPetWeight(userId: string, w: { petId: string; date: string; weightKg: number }): Promise<PetWeight> {
  const { data, error } = await supabase
    .from('pet_weights')
    .insert({ user_id: userId, pet_id: w.petId, date: w.date, weight_kg: w.weightKg })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, petId: data.pet_id, date: data.date, weightKg: Number(data.weight_kg) }
}

export async function deletePetWeight(id: string) {
  await supabase.from('pet_weights').delete().eq('id', id)
}

export async function savePetCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'pet', c)
}
