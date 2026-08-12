import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getHealthData,
  addMeal as dbAddMeal,
  deleteMeal as dbDeleteMeal,
  setWaterGlasses as dbSetWater,
  addWeightLog as dbAddWeight,
  deleteWeightLog as dbDeleteWeight,
  saveHealthGoals as dbSaveGoals,
  addMeasurement as dbAddMeasurement,
  deleteMeasurement as dbDeleteMeasurement,
  addExerciseLog as dbAddExercise,
  deleteExerciseLog as dbDeleteExercise,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { HEALTH_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import CalorieBalance from '../games/CalorieBalance'
import JumpRope from '../games/JumpRope'
import PlateBuilder from '../games/PlateBuilder'
import type { HealthData, MealType } from '../types'

const MEAL_TYPES: { key: MealType; emoji: string; label: string }[] = [
  { key: 'breakfast', emoji: '🍳', label: 'Breakfast' },
  { key: 'lunch',     emoji: '🍛', label: 'Lunch' },
  { key: 'dinner',    emoji: '🍲', label: 'Dinner' },
  { key: 'snack',     emoji: '🍪', label: 'Snack' },
]

const MEAL_XP_CAP = 4
const MEASURE_XP_CAP = 5
const EXERCISE_XP_CAP = 3

type GameTab = 'clicker' | 'arcade' | 'puzzle'

const ACCENT = '#65A30D'
const MEASURE_ACCENT = '#0EA5E9'
const EXERCISE_ACCENT = '#F59E0B'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

function weeksBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (7 * 86400000)
}

// Vertical position (0-100) for a point along the winding journey path,
// so flags/avatar visually sit on the same wave the SVG line draws.
function pathY(pct: number): number {
  return 50 - Math.sin((pct / 100) * Math.PI * 2) * 28
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#0284C7' }
  if (bmi < 25) return { label: 'Normal', color: GOOD_COLOR }
  if (bmi < 30) return { label: 'Overweight', color: '#D97706' }
  return { label: 'Obese', color: BAD_COLOR }
}

export default function Health() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<HealthData | null>(null)
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalPlanForm, setGoalPlanForm] = useState({ goalWeight: '', height: '', targetDate: '' })
  const [weightForm, setWeightForm] = useState('')
  const [measurementForm, setMeasurementForm] = useState({ waist: '', chest: '', hips: '', arms: '', thighs: '' })
  const [exerciseForm, setExerciseForm] = useState({ activity: '', duration: '', calories: '' })
  const [showMealsSection, setShowMealsSection] = useState(false)
  const [mealForm, setMealForm] = useState({ mealType: 'breakfast' as MealType, food: '', calories: '' })
  const [goalsForm, setGoalsForm] = useState({ calories: '', water: '' })
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [dayStreak, setDayStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()
  const waterXPAwarded = useRef(0)

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'health').then(setDayStreak)
    getBadges(userId, 'health').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getHealthData(userId).then(d => {
      setData(d)
      setGoalsForm({ calories: String(d.goals.calorieTarget), water: String(d.goals.waterTarget) })
      setGoalPlanForm({
        goalWeight: d.goals.goalWeightKg != null ? String(d.goals.goalWeightKg) : '',
        height: d.goals.heightCm != null ? String(d.goals.heightCm) : '',
        targetDate: d.goals.targetDate ?? '',
      })
      setEditingGoal(d.goals.goalWeightKg == null)
      waterXPAwarded.current = d.waterByDate[todayStr()] ?? 0
    })
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'health', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const today = todayStr()
  const todayMeals = data.meals.filter(m => m.date === today)
  const kcalToday = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)
  const waterToday = data.waterByDate[today] ?? 0
  const latestWeight = data.weights[data.weights.length - 1]
  const startWeight = data.weights[0]

  // Streak now spans any kind of activity, not just meals — an
  // exercise-only user should still build a real streak.
  const logDays = new Set([
    ...data.meals.map(m => m.date),
    ...data.weights.map(w => w.date),
    ...data.exerciseLogs.map(e => e.date),
    ...data.measurements.map(m => m.date),
  ])
  let streak = 0
  const cursor = new Date()
  if (!logDays.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (logDays.has(cursor.toISOString().split('T')[0])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const petStage = getStageFromXP(HEALTH_STAGES, data.character.xp)

  const kcalPct = data.goals.calorieTarget > 0 ? Math.min(100, (kcalToday / data.goals.calorieTarget) * 100) : 0
  const overTarget = kcalToday > data.goals.calorieTarget

  const trendWeights = data.weights.slice(-20)
  const wMin = Math.min(...trendWeights.map(w => w.weightKg), Infinity)
  const wMax = Math.max(...trendWeights.map(w => w.weightKg), -Infinity)
  const trendPoints = trendWeights.map((w, i) => {
    const x = trendWeights.length > 1 ? (i / (trendWeights.length - 1)) * 100 : 50
    const y = wMax > wMin ? 90 - ((w.weightKg - wMin) / (wMax - wMin)) * 80 : 50
    return `${x},${y}`
  }).join(' ')

  // ── Goal journey — progress %, BMI, pace projection ────────
  const goalWeight = data.goals.goalWeightKg
  const hasGoal = goalWeight != null && startWeight != null && latestWeight != null
  const currentWeight = latestWeight?.weightKg
  let progressPct = 0
  if (hasGoal && currentWeight != null) {
    progressPct = startWeight!.weightKg !== goalWeight
      ? ((startWeight!.weightKg - currentWeight) / (startWeight!.weightKg - goalWeight!)) * 100
      : (currentWeight <= goalWeight! ? 100 : 0)
    progressPct = Math.max(0, Math.min(100, progressPct))
  }
  const toGoKg = hasGoal && currentWeight != null ? Math.max(0, currentWeight - goalWeight!) : null

  const heightM = data.goals.heightCm ? data.goals.heightCm / 100 : null
  const bmi = heightM && currentWeight != null ? currentWeight / (heightM * heightM) : null

  const recentWeights = data.weights.slice(-6)
  let recentPaceKgWeek: number | null = null
  if (recentWeights.length >= 2) {
    const weeks = weeksBetween(recentWeights[0].date, recentWeights[recentWeights.length - 1].date)
    if (weeks > 0) recentPaceKgWeek = (recentWeights[0].weightKg - recentWeights[recentWeights.length - 1].weightKg) / weeks
  }
  let paceInsight: string | null = null
  if (hasGoal && data.goals.targetDate && currentWeight != null) {
    const weeksLeft = weeksBetween(today, data.goals.targetDate)
    const kgToGo = currentWeight - goalWeight!
    if (kgToGo <= 0) {
      paceInsight = "You've reached your goal weight! 🎉"
    } else if (weeksLeft > 0) {
      const neededPace = kgToGo / weeksLeft
      paceInsight = recentPaceKgWeek != null
        ? recentPaceKgWeek >= neededPace * 0.85
          ? `On track — losing ~${recentPaceKgWeek.toFixed(1)}kg/week, you need ~${neededPace.toFixed(1)}kg/week`
          : `Behind pace — losing ~${recentPaceKgWeek.toFixed(1)}kg/week, you need ~${neededPace.toFixed(1)}kg/week to hit your date`
        : `You'll need to lose ~${neededPace.toFixed(1)}kg/week to hit your target date`
    }
  }

  const applyXP = (xpGain: number, patch: Partial<HealthData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'health', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setDayStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleSaveGoalPlan = async () => {
    const goalWeightKg = goalPlanForm.goalWeight ? Math.abs(Number(goalPlanForm.goalWeight)) : undefined
    const heightCm = goalPlanForm.height ? Math.abs(Number(goalPlanForm.height)) : undefined
    const targetDate = goalPlanForm.targetDate || undefined
    try {
      const nextGoals = { ...data.goals, goalWeightKg, heightCm, targetDate }
      await dbSaveGoals(userId, nextGoals)
      setData(d => d ? { ...d, goals: nextGoals } : d)
      setEditingGoal(false)
      showToast('Goal updated!')
    } catch {
      showToast('Failed to save goal', false)
    }
  }

  const handleAddMeal = async () => {
    if (!mealForm.food) return
    const calories = mealForm.calories ? Math.abs(Number(mealForm.calories)) : undefined
    const firstToday = todayMeals.length === 0
    const mainsBefore = new Set(todayMeals.map(m => m.mealType).filter(t => t !== 'snack'))
    let xpGain = (todayMeals.length < MEAL_XP_CAP ? 8 : 0) + (firstToday ? 5 : 0)
    if (mealForm.mealType !== 'snack' && !mainsBefore.has(mealForm.mealType) && mainsBefore.size === 2) {
      xpGain += 15
    }
    const caloriesAfter = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0) + (calories ?? 0)
    if (caloriesAfter > data.goals.calorieTarget * 1.2) {
      xpGain = -5
    }
    try {
      const meal = await dbAddMeal(userId, { mealType: mealForm.mealType, food: mealForm.food, calories, date: today })
      if (xpGain !== 0) {
        applyXP(xpGain, { meals: [meal, ...data.meals] })
        showToast(
          xpGain < 0 ? `${xpGain} XP. That's over 120% of your calorie target`
          : xpGain >= 23 ? `+${xpGain} XP, all 3 meals logged!`
          : `+${xpGain} XP!`,
          xpGain > 0,
        )
      } else {
        setData(d => d ? { ...d, meals: [meal, ...d.meals] } : d)
        showToast('Logged. Daily XP cap reached')
      }
      setMealForm(f => ({ ...f, food: '', calories: '' }))
    } catch {
      showToast('Failed to log meal', false)
    }
  }

  const handleDeleteMeal = async (id: string) => {
    setData(d => d ? { ...d, meals: d.meals.filter(m => m.id !== id) } : d)
    await dbDeleteMeal(id)
  }

  const handleWater = async (delta: 1 | -1) => {
    const next = Math.max(0, waterToday + delta)
    const xpEligible = delta === 1 && next > waterXPAwarded.current && next <= data.goals.waterTarget
    try {
      await dbSetWater(userId, today, next)
      if (xpEligible) {
        waterXPAwarded.current = next
        applyXP(2, { waterByDate: { ...data.waterByDate, [today]: next } })
        showToast(next === data.goals.waterTarget ? '+2 XP, hydration goal hit!' : '+2 XP!')
      } else {
        setData(d => d ? { ...d, waterByDate: { ...d.waterByDate, [today]: next } } : d)
      }
    } catch {
      showToast('Failed to update water', false)
    }
  }

  const handleAddWeight = async () => {
    const kg = Math.abs(Number(weightForm))
    if (!kg || isNaN(kg)) return
    const alreadyToday = data.weights.some(w => w.date === today)
    try {
      const entry = await dbAddWeight(userId, { weightKg: kg, date: today })
      const nextWeights = [...data.weights, entry].sort((a, b) => a.date.localeCompare(b.date))
      if (!alreadyToday) {
        applyXP(10, { weights: nextWeights })
        showToast('+10 XP, weigh-in logged!')
      } else {
        setData(d => d ? { ...d, weights: nextWeights } : d)
        showToast('Weigh-in logged!')
      }
      setWeightForm('')
    } catch {
      showToast('Failed to log weigh-in', false)
    }
  }

  const handleDeleteWeight = async (id: string) => {
    setData(d => d ? { ...d, weights: d.weights.filter(w => w.id !== id) } : d)
    await dbDeleteWeight(id)
  }

  const handleSaveGoals = async () => {
    const calorieTarget = Math.abs(Number(goalsForm.calories)) || 2000
    const waterTarget = Math.abs(Number(goalsForm.water)) || 8
    try {
      const nextGoals = { ...data.goals, calorieTarget, waterTarget }
      await dbSaveGoals(userId, nextGoals)
      setData(d => d ? { ...d, goals: nextGoals } : d)
      showToast('Targets updated!')
    } catch {
      showToast('Failed to save targets', false)
    }
  }

  const handleAddMeasurement = async () => {
    const { waist, chest, hips, arms, thighs } = measurementForm
    if (!waist && !chest && !hips && !arms && !thighs) return
    const sessionKey = `novo-health-measure-${today}`
    const addedToday = Number(sessionStorage.getItem(sessionKey) ?? '0')
    const xpGain = addedToday < MEASURE_XP_CAP ? 5 : 0
    try {
      const m = await dbAddMeasurement(userId, {
        date: today,
        waistCm: waist ? Number(waist) : undefined,
        chestCm: chest ? Number(chest) : undefined,
        hipsCm: hips ? Number(hips) : undefined,
        armsCm: arms ? Number(arms) : undefined,
        thighsCm: thighs ? Number(thighs) : undefined,
      })
      sessionStorage.setItem(sessionKey, String(addedToday + 1))
      if (xpGain > 0) {
        applyXP(xpGain, { measurements: [...data.measurements, m] })
        showToast(`+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, measurements: [...d.measurements, m] } : d)
        showToast('Logged. Daily XP cap reached')
      }
      setMeasurementForm({ waist: '', chest: '', hips: '', arms: '', thighs: '' })
    } catch {
      showToast('Failed to log measurement', false)
    }
  }

  const handleDeleteMeasurement = async (id: string) => {
    setData(d => d ? { ...d, measurements: d.measurements.filter(m => m.id !== id) } : d)
    await dbDeleteMeasurement(id)
  }

  const handleAddExercise = async () => {
    if (!exerciseForm.activity || !exerciseForm.duration) return
    const sessionKey = `novo-health-exercise-${today}`
    const addedToday = Number(sessionStorage.getItem(sessionKey) ?? '0')
    const xpGain = addedToday < EXERCISE_XP_CAP ? 10 : 0
    try {
      const e = await dbAddExercise(userId, {
        date: today,
        activity: exerciseForm.activity,
        durationMin: Math.abs(Number(exerciseForm.duration)) || 0,
        caloriesBurned: exerciseForm.calories ? Math.abs(Number(exerciseForm.calories)) : undefined,
      })
      sessionStorage.setItem(sessionKey, String(addedToday + 1))
      if (xpGain > 0) {
        applyXP(xpGain, { exerciseLogs: [e, ...data.exerciseLogs] })
        showToast(`+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, exerciseLogs: [e, ...d.exerciseLogs] } : d)
        showToast('Logged. Daily XP cap reached')
      }
      setExerciseForm({ activity: '', duration: '', calories: '' })
    } catch {
      showToast('Failed to log exercise', false)
    }
  }

  const handleDeleteExercise = async (id: string) => {
    setData(d => d ? { ...d, exerciseLogs: d.exerciseLogs.filter(e => e.id !== id) } : d)
    await dbDeleteExercise(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const mealDays = [...new Set(data.meals.map(m => m.date))].sort((a, b) => b.localeCompare(a)).slice(0, 14)

  const petCard = (
    <Character
      type="health"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: '#FFFFFF', color: INK }

  const exerciseToday = data.exerciseLogs.filter(e => e.date === today)
  const measurementsToday = data.measurements.filter(m => m.date === today)
  const weighedInToday = data.weights.some(w => w.date === today)
  const dailyChallenges = [
    { id: 'weighin', title: "Log today's weigh-in", emoji: '⚖️', xp: 10, met: weighedInToday },
    { id: 'exercise', title: 'Log an exercise session', emoji: '🏃', xp: 15, met: exerciseToday.length >= 1 },
    { id: 'mealOrMeasure', title: 'Log a meal or a measurement', emoji: '📏', xp: 15, met: todayMeals.length >= 1 || measurementsToday.length >= 1 },
  ]

  const milestones = [0, 25, 50, 75, 100]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}

      {toast && (
        <div className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-2xl font-nunito font-semibold text-white text-sm bounce-in" style={{ background: toast.good ? '#16A34A' : '#DC2626' }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-30 flex-shrink-0"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>
          Back
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2" style={{ color: INK }}>
          Weight Loss Tracker <StreakBadge streak={dayStreak} />
        </div>
        <div className="hidden lg:flex items-center gap-1.5 font-nunito text-xs" style={{ color: MUTED }}>
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-10" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">{petCard}</div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { label: 'Current weight', value: currentWeight != null ? `${currentWeight} kg` : '—', color: INK },
              { label: 'To go', value: toGoKg != null ? `${toGoKg.toFixed(1)} kg` : '—', color: ACCENT },
              { label: 'BMI', value: bmi != null ? bmi.toFixed(1) : '—', color: bmi != null ? bmiCategory(bmi).color : INK },
              { label: 'Streak', value: String(streak), color: '#D97706' },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* ── JOURNEY PATH — the hero, no tabs ───────────────── */}
          <Panel tone="tint" accent={ACCENT} className="p-5 mb-8 max-w-5xl">
            <div className="font-nunito font-semibold text-sm mb-4 flex items-center gap-1.5" style={{ color: INK }}>
              🧭 Your journey
            </div>

            {hasGoal ? (
              <>
                <div className="relative mb-2" style={{ height: 110 }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                    <polyline
                      points={Array.from({ length: 51 }, (_, i) => `${i * 2},${pathY(i * 2)}`).join(' ')}
                      fill="none" stroke={`${ACCENT}45`} strokeWidth="2" vectorEffect="non-scaling-stroke"
                      strokeDasharray="4 3" strokeLinecap="round"
                    />
                  </svg>
                  {milestones.map(m => (
                    <div
                      key={m}
                      className="absolute text-lg -translate-x-1/2 -translate-y-1/2 transition-opacity"
                      style={{ left: `${m}%`, top: `${pathY(m)}%`, opacity: progressPct >= m ? 1 : 0.35 }}
                      title={m === 0 ? `Start: ${startWeight!.weightKg}kg` : m === 100 ? `Goal: ${goalWeight}kg` : `${m}%`}
                    >
                      {m === 0 ? '🚩' : m === 100 ? '🏁' : '🚩'}
                    </div>
                  ))}
                  <div
                    className="absolute text-2xl -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                    style={{ left: `${progressPct}%`, top: `${pathY(progressPct)}%` }}
                    title={`${currentWeight}kg — you are here`}
                  >
                    {petStage.emoji}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-nunito text-xs" style={{ color: MUTED }}>{startWeight!.weightKg}kg start</span>
                  <span className="font-nunito font-bold text-sm" style={{ color: ACCENT }}>{Math.round(progressPct)}% of the way there</span>
                  <span className="font-nunito text-xs" style={{ color: MUTED }}>{goalWeight}kg goal</span>
                </div>

                {paceInsight && (
                  <div className="font-nunito text-xs mt-3 pt-3" style={{ color: INK, borderTop: `1px solid ${INK}0D` }}>
                    {paceInsight}
                  </div>
                )}

                {!editingGoal ? (
                  <button onClick={() => setEditingGoal(true)} className="font-nunito text-xs mt-3 transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                    Edit goal
                  </button>
                ) : null}
              </>
            ) : (
              <div className="font-nunito text-sm mb-3" style={{ color: MUTED }}>
                Set a goal weight to start your journey — log a weigh-in below too, so your path has a starting point.
              </div>
            )}

            {editingGoal && (
              <div className="mt-4 pt-4" style={{ borderTop: hasGoal ? `1px solid ${INK}0D` : 'none' }}>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="number" step="0.1" placeholder="Goal weight (kg)" value={goalPlanForm.goalWeight}
                    onChange={e => setGoalPlanForm(f => ({ ...f, goalWeight: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none" style={inputStyle}
                  />
                  <input
                    type="number" placeholder="Height (cm)" value={goalPlanForm.height}
                    onChange={e => setGoalPlanForm(f => ({ ...f, height: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none" style={inputStyle}
                  />
                  <input
                    type="date" value={goalPlanForm.targetDate}
                    onChange={e => setGoalPlanForm(f => ({ ...f, targetDate: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none" style={inputStyle}
                  />
                </div>
                <NButton onClick={handleSaveGoalPlan} disabled={!goalPlanForm.goalWeight} accent={ACCENT}>Save goal</NButton>
              </div>
            )}
          </Panel>

          {/* ── WEIGH-INS ───────────────────────────────────────── */}
          <div className="max-w-5xl mb-8">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>⚖️ Weigh-ins</div>
            <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-6">
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <div className="flex gap-2">
                    <input
                      type="number" step="0.1" placeholder="Weight (kg)" value={weightForm}
                      onChange={e => setWeightForm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                      className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                    <NButton onClick={handleAddWeight} disabled={!weightForm} accent={ACCENT}>Log</NButton>
                  </div>
                </Panel>

                {trendWeights.length >= 2 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Weight trend</div>
                      <span className="font-nunito text-xs" style={{ color: MUTED }}>
                        {trendWeights[0].weightKg} → {trendWeights[trendWeights.length - 1].weightKg} kg
                      </span>
                    </div>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                      <polyline points={trendPoints} fill="none" stroke={ACCENT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    <div className="flex justify-between font-nunito text-[10px]" style={{ color: MUTED }}>
                      <span>{trendWeights[0].date}</span>
                      <span>{trendWeights[trendWeights.length - 1].date}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                {data.weights.length > 0 ? (
                  <div>
                    <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Entries</div>
                    <div>
                      {[...data.weights].reverse().slice(0, 10).map((w, i) => (
                        <div key={w.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                          <span className="font-nunito text-sm flex-1" style={{ color: INK }}>{w.date}</span>
                          <span className="font-nunito font-medium text-sm" style={{ color: ACCENT }}>{w.weightKg} kg</span>
                          <button onClick={() => handleDeleteWeight(w.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>No weigh-ins yet, log one to the left</div>
                )}
              </div>
            </div>
          </div>

          {/* ── MEASUREMENTS ────────────────────────────────────── */}
          <div className="max-w-5xl mb-8">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>📏 Measurements</div>
            <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <Panel tone="tint" accent={MEASURE_ACCENT} className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {([
                    ['waist', 'Waist'], ['chest', 'Chest'], ['hips', 'Hips'], ['arms', 'Arms'], ['thighs', 'Thighs'],
                  ] as const).map(([key, label]) => (
                    <input
                      key={key}
                      type="number" step="0.1" placeholder={`${label} (cm)`}
                      value={measurementForm[key]}
                      onChange={e => setMeasurementForm(f => ({ ...f, [key]: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                  ))}
                </div>
                <NButton onClick={handleAddMeasurement} accent={MEASURE_ACCENT} className="w-full">Log measurements</NButton>
              </Panel>

              <div>
                {data.measurements.length > 0 ? (
                  <div>
                    {[...data.measurements].reverse().slice(0, 6).map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm" style={{ color: INK }}>{m.date}</div>
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>
                            {[
                              m.waistCm != null && `Waist ${m.waistCm}cm`,
                              m.chestCm != null && `Chest ${m.chestCm}cm`,
                              m.hipsCm != null && `Hips ${m.hipsCm}cm`,
                              m.armsCm != null && `Arms ${m.armsCm}cm`,
                              m.thighsCm != null && `Thighs ${m.thighsCm}cm`,
                            ].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteMeasurement(m.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>No measurements yet — fill in whichever you track</div>
                )}
              </div>
            </div>
          </div>

          {/* ── EXERCISE ────────────────────────────────────────── */}
          <div className="max-w-5xl mb-8">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🏃 Exercise</div>
            <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <Panel tone="tint" accent={EXERCISE_ACCENT} className="p-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text" placeholder="Activity (e.g. Run)" value={exerciseForm.activity}
                    onChange={e => setExerciseForm(f => ({ ...f, activity: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="number" placeholder="Minutes" value={exerciseForm.duration}
                    onChange={e => setExerciseForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-24 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Calories burned (optional)" value={exerciseForm.calories}
                    onChange={e => setExerciseForm(f => ({ ...f, calories: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                  <NButton onClick={handleAddExercise} disabled={!exerciseForm.activity || !exerciseForm.duration} accent={EXERCISE_ACCENT}>Log</NButton>
                </div>
              </Panel>

              <div>
                {data.exerciseLogs.length > 0 ? (
                  <div>
                    {data.exerciseLogs.slice(0, 8).map((e, i) => (
                      <div key={e.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm truncate" style={{ color: INK }}>{e.activity}</div>
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{e.date} · {e.durationMin} min{e.caloriesBurned != null ? ` · ${e.caloriesBurned} kcal` : ''}</div>
                        </div>
                        <button onClick={() => handleDeleteExercise(e.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>No workouts logged yet</div>
                )}
              </div>
            </div>
          </div>

          {/* ── MEALS & WATER — optional, demoted, collapsed by default ── */}
          <div className="max-w-5xl mb-8">
            <button
              onClick={() => setShowMealsSection(s => !s)}
              className="font-nunito font-semibold text-sm mb-3 flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: MUTED }}
            >
              🍽️ Meals & water (optional) {showMealsSection ? '▲' : '▼'}
            </button>

            {showMealsSection && (
              <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-5">
                  <Panel tone="tint" accent={ACCENT} className="p-4 md:p-5">
                    <div className="flex gap-1.5 mb-3">
                      {MEAL_TYPES.map(mt => (
                        <button
                          key={mt.key}
                          onClick={() => setMealForm(f => ({ ...f, mealType: mt.key }))}
                          className="flex-1 py-2 rounded-xl font-nunito text-xs transition-colors flex flex-col items-center gap-0.5"
                          style={{ background: mealForm.mealType === mt.key ? `${ACCENT}25` : 'transparent', color: mealForm.mealType === mt.key ? ACCENT : MUTED }}
                        >
                          <span className="text-base">{mt.emoji}</span>
                          {mt.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="What did you eat?" value={mealForm.food}
                        onChange={e => setMealForm(f => ({ ...f, food: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="number" placeholder="kcal" value={mealForm.calories}
                        onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
                        className="w-24 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <NButton onClick={handleAddMeal} disabled={!mealForm.food} accent={ACCENT}>Log</NButton>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between font-nunito text-xs mb-1.5">
                        <span style={{ color: MUTED }}>Calories</span>
                        <span style={{ color: overTarget ? BAD_COLOR : ACCENT }}>
                          {kcalToday} / {data.goals.calorieTarget} kcal{overTarget ? ', over target' : ''}
                        </span>
                      </div>
                      <NProgress pct={kcalPct} accent={overTarget ? BAD_COLOR : ACCENT} height={5} />
                    </div>
                  </Panel>

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Water</div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleWater(-1)}
                        disabled={waterToday === 0}
                        className="w-9 h-9 rounded-full font-nunito font-bold text-lg transition-opacity disabled:opacity-30"
                        style={{ background: `${INK}08`, color: INK }}
                      >
                        −
                      </button>
                      <div className="flex-1 flex gap-1 justify-center flex-wrap">
                        {Array.from({ length: Math.max(data.goals.waterTarget, waterToday) }).map((_, i) => (
                          <span key={i} className="text-lg" style={{ opacity: i < waterToday ? 1 : 0.2 }}>💧</span>
                        ))}
                      </div>
                      <button onClick={() => handleWater(1)} className="w-9 h-9 rounded-full font-nunito font-bold text-lg text-white" style={{ background: '#0284C7' }}>
                        +
                      </button>
                    </div>
                    <div className="text-center font-nunito text-xs mt-2" style={{ color: MUTED }}>
                      {waterToday}/{data.goals.waterTarget} glasses · +2 XP per glass
                    </div>
                  </div>

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Daily targets</div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <div className="font-nunito text-xs mb-1" style={{ color: MUTED }}>Calories (kcal)</div>
                        <input
                          type="number" value={goalsForm.calories}
                          onChange={e => setGoalsForm(f => ({ ...f, calories: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={{ background: '#F0EEE8', color: INK }}
                        />
                      </div>
                      <div>
                        <div className="font-nunito text-xs mb-1" style={{ color: MUTED }}>Water (glasses)</div>
                        <input
                          type="number" value={goalsForm.water}
                          onChange={e => setGoalsForm(f => ({ ...f, water: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={{ background: '#F0EEE8', color: INK }}
                        />
                      </div>
                    </div>
                    <NButton onClick={handleSaveGoals} accent={ACCENT} className="w-full">Save targets</NButton>
                  </div>
                </div>

                <div>
                  {mealDays.length === 0 ? (
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>No meals logged yet</div>
                  ) : (
                    mealDays.map(day => {
                      const meals = data.meals.filter(m => m.date === day)
                      const kcal = meals.reduce((s, m) => s + (m.calories ?? 0), 0)
                      return (
                        <div key={day} className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{day === today ? 'Today' : day}</div>
                            <span className="font-nunito text-xs" style={{ color: MUTED }}>{kcal} kcal</span>
                          </div>
                          <div>
                            {meals.map((m, i) => {
                              const mt = MEAL_TYPES.find(t => t.key === m.mealType)!
                              return (
                                <div key={m.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                                  <span className="text-base flex-shrink-0">{mt.emoji}</span>
                                  <span className="font-nunito text-sm flex-1 truncate" style={{ color: INK }}>{m.food}</span>
                                  {m.calories != null && <span className="font-nunito text-xs flex-shrink-0" style={{ color: MUTED }}>{m.calories} kcal</span>}
                                  <button onClick={() => handleDeleteMeal(m.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── COMPANION ───────────────────────────────────────── */}
          <div className="max-w-2xl mb-8">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🐾 Companion</div>
            <div className="space-y-4">
              <DailyChallenges trackerId="health" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="health"
                character={data.character}
                streak={dayStreak}
                earnedBadges={earnedBadges}
                missions={missions}
                onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
              />
            </div>
          </div>

          {/* ── GAMES ───────────────────────────────────────────── */}
          <div className="max-w-xl">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🎮 Games</div>
            <div className="flex items-center gap-5 mb-5" style={{ borderBottom: `1px solid ${INK}12` }}>
              {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                <button
                  key={g}
                  onClick={() => setGameTab(g)}
                  className="pb-2.5 font-nunito text-sm transition-colors"
                  style={{
                    color: gameTab === g ? INK : MUTED,
                    fontWeight: gameTab === g ? 600 : 400,
                    borderBottom: gameTab === g ? `2px solid ${ACCENT}` : '2px solid transparent',
                  }}
                >
                  {g === 'clicker' ? 'Clicker' : g === 'arcade' ? 'Arcade' : 'Puzzle'}
                </button>
              ))}
            </div>
            {gameTab === 'clicker' && <CalorieBalance onXPEarned={handleXPEarned} />}
            {gameTab === 'arcade' && <JumpRope onXPEarned={handleXPEarned} />}
            {gameTab === 'puzzle' && <PlateBuilder onXPEarned={handleXPEarned} />}
          </div>
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
              <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>Journey</div>
              {hasGoal ? (
                <>
                  <NProgress pct={progressPct} accent={ACCENT} height={5} />
                  <div className="flex justify-between font-nunito text-xs mt-1.5" style={{ color: MUTED }}>
                    <span>{Math.round(progressPct)}% there</span>
                    <span>{toGoKg?.toFixed(1)}kg to go</span>
                  </div>
                </>
              ) : (
                <div className="font-nunito text-xs" style={{ color: MUTED }}>Set a goal weight to track progress</div>
              )}
            </div>
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Weigh-ins earn +10 XP, exercise +10 (up to {EXERCISE_XP_CAP}/day), measurements +5 (up to {MEASURE_XP_CAP}/day) — meals and water still work too, just optional.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
