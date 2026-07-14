import { supabase } from '../supabase'
import type { CharacterState, ItineraryItem, TravelData, Trip, TripExpense } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getTravelData(userId: string): Promise<TravelData> {
  const [character, { data: tripRows }, { data: itemRows }, { data: expenseRows }] = await Promise.all([
    getCharacter(userId, 'travel'),
    supabase.from('trips').select('*').eq('user_id', userId).order('start_date'),
    supabase.from('itinerary_items').select('*').eq('user_id', userId).order('day').order('time'),
    supabase.from('trip_expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const trips: Trip[] = (tripRows ?? []).map(r => ({
    id: r.id, destination: r.destination, emoji: r.emoji ?? '✈️',
    startDate: r.start_date, endDate: r.end_date, budget: Number(r.budget), createdAt: r.created_at,
  }))
  const items: ItineraryItem[] = (itemRows ?? []).map(r => ({
    id: r.id, tripId: r.trip_id, day: r.day, time: r.time ?? undefined, title: r.title, location: r.location ?? '',
  }))
  const expenses: TripExpense[] = (expenseRows ?? []).map(r => ({
    id: r.id, tripId: r.trip_id, amount: Number(r.amount), category: r.category, note: r.note ?? '', date: r.date,
  }))
  return { trips, items, expenses, character }
}

export async function addTrip(
  userId: string,
  t: { destination: string; emoji: string; startDate: string; endDate: string; budget: number },
): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({ user_id: userId, destination: t.destination, emoji: t.emoji, start_date: t.startDate, end_date: t.endDate, budget: t.budget })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return {
    id: data.id, destination: data.destination, emoji: data.emoji ?? '✈️',
    startDate: data.start_date, endDate: data.end_date, budget: Number(data.budget), createdAt: data.created_at,
  }
}

export async function deleteTrip(id: string) {
  await supabase.from('trips').delete().eq('id', id)
}

export async function addItineraryItem(
  userId: string,
  i: { tripId: string; day: string; time?: string; title: string; location: string },
): Promise<ItineraryItem> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({ user_id: userId, trip_id: i.tripId, day: i.day, time: i.time ?? null, title: i.title, location: i.location })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, tripId: data.trip_id, day: data.day, time: data.time ?? undefined, title: data.title, location: data.location ?? '' }
}

export async function deleteItineraryItem(id: string) {
  await supabase.from('itinerary_items').delete().eq('id', id)
}

export async function addTripExpense(
  userId: string,
  e: { tripId: string; amount: number; category: string; note: string; date: string },
): Promise<TripExpense> {
  const { data, error } = await supabase
    .from('trip_expenses')
    .insert({ user_id: userId, trip_id: e.tripId, amount: e.amount, category: e.category, note: e.note, date: e.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, tripId: data.trip_id, amount: Number(data.amount), category: data.category, note: data.note ?? '', date: data.date }
}

export async function deleteTripExpense(id: string) {
  await supabase.from('trip_expenses').delete().eq('id', id)
}

export async function saveTravelCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'travel', c)
}
