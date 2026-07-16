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

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'meals' | 'body' | 'pet' | 'games'

const ACCENT = '#65A30D'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'meals', label: 'Meals' },
  { key: 'body', label: 'Body' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

export default function Health() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<HealthData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('today')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [mealForm, setMealForm] = useState({ mealType: 'breakfast' as MealType, food: '', calories: '' })
  const [weightForm, setWeightForm] = useState('')
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

  const logDays = new Set(data.meals.map(m => m.date))
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
        showToast('+10 XP, weight logged!')
      } else {
        setData(d => d ? { ...d, weights: nextWeights } : d)
        showToast('Weight logged!')
      }
      setWeightForm('')
    } catch {
      showToast('Failed to log weight', false)
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
      await dbSaveGoals(userId, { calorieTarget, waterTarget })
      setData(d => d ? { ...d, goals: { calorieTarget, waterTarget } } : d)
      showToast('Targets updated!')
    } catch {
      showToast('Failed to save targets', false)
    }
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

  const mealsTodayList = data.meals.filter(m => m.date === todayStr())
  const dailyChallenges = [
    { id: 'meals2', title: 'Log 2 meals', emoji: '🍽️', xp: 15, met: mealsTodayList.length >= 2 },
    { id: 'water6', title: 'Drink 6 glasses of water', emoji: '💧', xp: 15, met: (data.waterByDate[todayStr()] ?? 0) >= 6 },
    { id: 'main3', title: 'Log all 3 main meals', emoji: '🥗', xp: 30, met: (['breakfast', 'lunch', 'dinner'] as const).every(t => mealsTodayList.some(m => m.mealType === t)) },
  ]

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
          Health & Meals <StreakBadge streak={dayStreak} />
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
              { label: 'Calories today', value: `${kcalToday} / ${data.goals.calorieTarget}`, color: overTarget ? BAD_COLOR : ACCENT },
              { label: 'Water today', value: `${waterToday}/${data.goals.waterTarget}`, color: waterToday >= data.goals.waterTarget ? GOOD_COLOR : '#0284C7' },
              { label: 'Weight', value: latestWeight ? `${latestWeight.weightKg} kg` : '—', color: INK },
              { label: 'Meal streak', value: String(streak), color: '#D97706' },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-6 overflow-x-auto scrollbar-hidden gap-5" style={{ borderBottom: `1px solid ${INK}12` }}>
            {MAIN_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="pb-2.5 font-nunito text-sm whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  color: mainTab === t.key ? INK : MUTED,
                  fontWeight: mainTab === t.key ? 600 : 400,
                  borderBottom: mainTab === t.key ? `2px solid ${ACCENT}` : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TODAY ────────────────────────────────────────── */}
          {mainTab === 'today' && (
            <div className="space-y-5 max-w-xl">

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

              {todayMeals.length > 0 && (
                <div>
                  <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Today's meals</div>
                  <div>
                    {todayMeals.map((m, i) => {
                      const mt = MEAL_TYPES.find(t => t.key === m.mealType)!
                      return (
                        <div key={m.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                          <span className="text-lg flex-shrink-0">{mt.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{m.food}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>{mt.label}</div>
                          </div>
                          {m.calories != null && <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: ACCENT }}>{m.calories} kcal</span>}
                          <button onClick={() => handleDeleteMeal(m.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MEALS (history) ──────────────────────────────── */}
          {mainTab === 'meals' && (
            <div className="max-w-xl">
              {mealDays.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No meals yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Log your first meal in the Today tab</div>
                </div>
              )}
              {mealDays.map(day => {
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
              })}
            </div>
          )}

          {/* ── BODY ─────────────────────────────────────────── */}
          {mainTab === 'body' && (
            <div className="space-y-8 max-w-xl">

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

              {data.weights.length > 0 && (
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
              )}

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
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
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
          )}

          {mainTab === 'games' && (
            <div className="max-w-xl">
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
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
              <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>Today</div>
              <NProgress pct={kcalPct} accent={overTarget ? BAD_COLOR : ACCENT} height={5} />
              <div className="flex justify-between font-nunito text-xs mt-1.5" style={{ color: MUTED }}>
                <span>{kcalToday} kcal</span>
                <span>{waterToday}/{data.goals.waterTarget} water</span>
              </div>
            </div>
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Meals earn +8 XP, up to {MEAL_XP_CAP} a day, water is +2 per glass, and logging all 3 main meals adds a +15 bonus.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
