import { supabase } from '../supabase'
import type { CharacterState, HealthData, HealthGoals, Meal, WeightLog } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getHealthData(userId: string): Promise<HealthData> {
  const [character, { data: mealRows }, { data: waterRows }, { data: weightRows }, { data: goalRow }] = await Promise.all([
    getCharacter(userId, 'health'),
    supabase.from('meals').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(500),
    supabase.from('water_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    supabase.from('weight_logs').select('*').eq('user_id', userId).order('date'),
    supabase.from('health_goals').select('*').eq('user_id', userId).maybeSingle(),
  ])
  const meals: Meal[] = (mealRows ?? []).map(r => ({
    id: r.id, mealType: r.meal_type, food: r.food,
    calories: r.calories ?? undefined, date: r.date,
  }))
  const waterByDate: Record<string, number> = {}
  for (const r of waterRows ?? []) waterByDate[r.date] = r.glasses
  const weights: WeightLog[] = (weightRows ?? []).map(r => ({
    id: r.id, weightKg: Number(r.weight_kg), date: r.date,
  }))
  const goals: HealthGoals = goalRow
    ? { calorieTarget: goalRow.calorie_target, waterTarget: goalRow.water_target }
    : { calorieTarget: 2000, waterTarget: 8 }
  return { meals, waterByDate, weights, goals, character }
}

export async function addMeal(
  userId: string,
  m: { mealType: string; food: string; calories?: number; date: string },
): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .insert({ user_id: userId, meal_type: m.mealType, food: m.food, calories: m.calories ?? null, date: m.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, mealType: data.meal_type, food: data.food, calories: data.calories ?? undefined, date: data.date }
}

export async function deleteMeal(id: string) {
  await supabase.from('meals').delete().eq('id', id)
}

export async function setWaterGlasses(userId: string, date: string, glasses: number) {
  await supabase.from('water_logs').upsert({ user_id: userId, date, glasses })
}

export async function addWeightLog(userId: string, w: { weightKg: number; date: string }): Promise<WeightLog> {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({ user_id: userId, weight_kg: w.weightKg, date: w.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, weightKg: Number(data.weight_kg), date: data.date }
}

export async function deleteWeightLog(id: string) {
  await supabase.from('weight_logs').delete().eq('id', id)
}

export async function saveHealthGoals(userId: string, g: HealthGoals) {
  await supabase.from('health_goals').upsert({ user_id: userId, calorie_target: g.calorieTarget, water_target: g.waterTarget })
}

export async function saveHealthCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'health', c)
}
