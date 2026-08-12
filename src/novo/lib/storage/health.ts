import { supabase } from '../supabase'
import type { CharacterState, ExerciseLog, HealthData, HealthGoals, Meal, Measurement, WeightLog } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getHealthData(userId: string): Promise<HealthData> {
  const [character, { data: mealRows }, { data: waterRows }, { data: weightRows }, { data: goalRow }, { data: measurementRows }, { data: exerciseRows }] = await Promise.all([
    getCharacter(userId, 'health'),
    supabase.from('meals').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(500),
    supabase.from('water_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    supabase.from('weight_logs').select('*').eq('user_id', userId).order('date'),
    supabase.from('health_goals').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('weightloss_measurements').select('*').eq('user_id', userId).order('date'),
    supabase.from('weightloss_exercise_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(200),
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
  const measurements: Measurement[] = (measurementRows ?? []).map(r => ({
    id: r.id, date: r.date,
    waistCm: r.waist_cm ?? undefined, chestCm: r.chest_cm ?? undefined, hipsCm: r.hips_cm ?? undefined,
    armsCm: r.arms_cm ?? undefined, thighsCm: r.thighs_cm ?? undefined,
  }))
  const exerciseLogs: ExerciseLog[] = (exerciseRows ?? []).map(r => ({
    id: r.id, date: r.date, activity: r.activity, durationMin: r.duration_min, caloriesBurned: r.calories_burned ?? undefined,
  }))
  const goals: HealthGoals = goalRow
    ? {
        calorieTarget: goalRow.calorie_target, waterTarget: goalRow.water_target,
        goalWeightKg: goalRow.goal_weight_kg ?? undefined, heightCm: goalRow.height_cm ?? undefined, targetDate: goalRow.target_date ?? undefined,
      }
    : { calorieTarget: 2000, waterTarget: 8 }
  return { meals, waterByDate, weights, measurements, exerciseLogs, goals, character }
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
  await supabase.from('health_goals').upsert({
    user_id: userId, calorie_target: g.calorieTarget, water_target: g.waterTarget,
    goal_weight_kg: g.goalWeightKg ?? null, height_cm: g.heightCm ?? null, target_date: g.targetDate ?? null,
  })
}

export async function addMeasurement(
  userId: string,
  m: { date: string; waistCm?: number; chestCm?: number; hipsCm?: number; armsCm?: number; thighsCm?: number },
): Promise<Measurement> {
  const { data, error } = await supabase
    .from('weightloss_measurements')
    .insert({
      user_id: userId, date: m.date,
      waist_cm: m.waistCm ?? null, chest_cm: m.chestCm ?? null, hips_cm: m.hipsCm ?? null,
      arms_cm: m.armsCm ?? null, thighs_cm: m.thighsCm ?? null,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return {
    id: data.id, date: data.date,
    waistCm: data.waist_cm ?? undefined, chestCm: data.chest_cm ?? undefined, hipsCm: data.hips_cm ?? undefined,
    armsCm: data.arms_cm ?? undefined, thighsCm: data.thighs_cm ?? undefined,
  }
}

export async function deleteMeasurement(id: string) {
  await supabase.from('weightloss_measurements').delete().eq('id', id)
}

export async function addExerciseLog(
  userId: string,
  e: { date: string; activity: string; durationMin: number; caloriesBurned?: number },
): Promise<ExerciseLog> {
  const { data, error } = await supabase
    .from('weightloss_exercise_logs')
    .insert({ user_id: userId, date: e.date, activity: e.activity, duration_min: e.durationMin, calories_burned: e.caloriesBurned ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, date: data.date, activity: data.activity, durationMin: data.duration_min, caloriesBurned: data.calories_burned ?? undefined }
}

export async function deleteExerciseLog(id: string) {
  await supabase.from('weightloss_exercise_logs').delete().eq('id', id)
}

export async function saveHealthCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'health', c)
}
