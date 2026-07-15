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

const MEAL_XP_CAP = 4  // XP-earning meals per day

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'meals' | 'body' | 'pet' | 'games'

const ACCENT = '#65A30D'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

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
  const waterXPAwarded = useRef(0)  // highest glass count XP was awarded for today (per session)

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

  // Idle-day happiness decay — guarded to once per tracker per day
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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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

  // Weight trend line (last 20 entries)
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
    // Bonus for completing all 3 main meals today
    if (mealForm.mealType !== 'snack' && !mainsBefore.has(mealForm.mealType) && mainsBefore.size === 2) {
      xpGain += 15
    }
    // A meal that blows past 120% of the calorie target turns into a penalty
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
          : xpGain >= 23 ? `+${xpGain} XP, all 3 meals logged! 🎉`
          : `+${xpGain} XP!`,
          xpGain > 0,
        )
      } else {
        setData(d => d ? { ...d, meals: [meal, ...d.meals] } : d)
        showToast('Logged! (daily XP cap reached)')
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
        showToast(next === data.goals.waterTarget ? '+2 XP, hydration goal hit! 💧' : '+2 XP!')
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

  // Meals grouped by day (latest 14 days present in data)
  const mealDays = [...new Set(data.meals.map(m => m.date))].sort((a, b) => b.localeCompare(a)).slice(0, 14)

  const petCard = (
    <Character
      type="health"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }

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
        <div
          className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl font-nunito font-black text-white text-sm bounce-in"
          style={{ background: toast.good ? '#16A34A' : '#DC2626', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-30 flex-shrink-0"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button
          onClick={() => navigate('/studios/dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-lg font-nunito text-[#09090F]/50 hover:text-[#09090F] hover:bg-black/5 transition"
        >
          ←
        </button>
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">🥗 Health & Meals <StreakBadge streak={dayStreak} /></div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-nunito text-[#09090F]/50 bg-black/5 px-2.5 py-1.5 rounded-lg">
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-8" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
            <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            {petCard}
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Calories today', value: `${kcalToday} / ${data.goals.calorieTarget}`, color: overTarget ? BAD_COLOR : ACCENT },
              { label: 'Water today', value: `${waterToday}/${data.goals.waterTarget} 💧`, color: waterToday >= data.goals.waterTarget ? GOOD_COLOR : '#0284C7' },
              { label: 'Weight', value: latestWeight ? `${latestWeight.weightKg} kg` : '—', color: '#09090F' },
              { label: 'Meal streak', value: `${streak}🔥`, color: '#D97706' },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="font-nunito font-black text-base md:text-xl mb-0.5 truncate" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px] font-nunito font-black uppercase tracking-widest text-[#09090F]/45">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-5 overflow-x-auto scrollbar-hidden gap-1.5 py-1">
            {([
              { key: 'today', label: '☀️ Today' },
              { key: 'meals', label: '🍽️ Meals' },
              { key: 'body',  label: '⚖️ Body' },
              { key: 'pet', label: '🐾 Pet' },
              { key: 'games', label: '🎮 Games' },
            ] as { key: MainTab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="px-3 md:px-4 py-2 rounded-xl font-nunito text-sm transition whitespace-nowrap flex-shrink-0"
                style={mainTab === t.key
                  ? { background: ACCENT, color: '#FFFFFF', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F', fontWeight: 800 }
                  : { color: 'rgba(9,9,15,0.45)', border: '2.5px solid transparent', fontWeight: 700 }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TODAY ────────────────────────────────────────── */}
          {mainTab === 'today' && (
            <div className="space-y-4">

              {/* Log meal */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Log a Meal</div>
                <div className="flex gap-1.5 mb-3">
                  {MEAL_TYPES.map(mt => (
                    <button
                      key={mt.key}
                      onClick={() => setMealForm(f => ({ ...f, mealType: mt.key }))}
                      className="flex-1 py-2 rounded-lg font-nunito text-xs font-semibold transition flex flex-col items-center gap-0.5"
                      style={mealForm.mealType === mt.key
                        ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                        : { background: INPUT_BG, color: 'rgba(9,9,15,0.4)', border: `3px solid ${CARD_BORDER}` }}
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
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <input
                    type="number" placeholder="kcal" value={mealForm.calories}
                    onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
                    className="w-24 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <button
                    onClick={handleAddMeal}
                    disabled={!mealForm.food}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Log
                  </button>
                </div>

                {/* Calorie progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-nunito mb-1.5">
                    <span className="text-[#09090F]/60">Calories</span>
                    <span style={{ color: overTarget ? BAD_COLOR : ACCENT }}>
                      {kcalToday} / {data.goals.calorieTarget} kcal{overTarget ? ', over target' : ''}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${kcalPct}%`, background: overTarget ? BAD_COLOR : ACCENT }}
                    />
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Water</div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleWater(-1)}
                    disabled={waterToday === 0}
                    className="w-10 h-10 rounded-xl font-nunito font-bold text-lg transition disabled:opacity-30 active:scale-95"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  >
                    −
                  </button>
                  <div className="flex-1 flex gap-1 justify-center flex-wrap">
                    {Array.from({ length: Math.max(data.goals.waterTarget, waterToday) }).map((_, i) => (
                      <span key={i} className="text-xl" style={{ opacity: i < waterToday ? 1 : 0.2 }}>💧</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleWater(1)}
                    className="w-10 h-10 rounded-xl font-nunito font-bold text-lg text-white transition active:scale-95"
                    style={{ background: '#0284C7' }}
                  >
                    +
                  </button>
                </div>
                <div className="text-center text-xs text-[#09090F]/40 font-nunito mt-2">
                  {waterToday}/{data.goals.waterTarget} glasses · +2 XP per glass
                </div>
              </div>

              {/* Today's meals */}
              {todayMeals.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Today's Meals</div>
                  <div className="space-y-2.5">
                    {todayMeals.map(m => {
                      const mt = MEAL_TYPES.find(t => t.key === m.mealType)!
                      return (
                        <div key={m.id} className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0">{mt.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm text-[#09090F] truncate">{m.food}</div>
                            <div className="text-xs text-[#09090F]/40 font-nunito">{mt.label}</div>
                          </div>
                          {m.calories != null && (
                            <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: ACCENT }}>{m.calories} kcal</span>
                          )}
                          <button
                            onClick={() => handleDeleteMeal(m.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                          >
                            ✕
                          </button>
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
            <div className="space-y-4">
              {mealDays.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">🍽️</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No meals yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Log your first meal in the Today tab</div>
                </div>
              )}
              {mealDays.map(day => {
                const meals = data.meals.filter(m => m.date === day)
                const kcal = meals.reduce((s, m) => s + (m.calories ?? 0), 0)
                return (
                  <div key={day} className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>
                        {day === today ? 'Today' : day}
                      </div>
                      <span className="text-xs font-nunito text-[#09090F]/50">{kcal} kcal</span>
                    </div>
                    <div className="space-y-2">
                      {meals.map(m => {
                        const mt = MEAL_TYPES.find(t => t.key === m.mealType)!
                        return (
                          <div key={m.id} className="flex items-center gap-3">
                            <span className="text-lg flex-shrink-0">{mt.emoji}</span>
                            <span className="font-nunito text-sm text-[#09090F] flex-1 truncate">{m.food}</span>
                            {m.calories != null && <span className="font-nunito text-xs text-[#09090F]/50 flex-shrink-0">{m.calories} kcal</span>}
                            <button
                              onClick={() => handleDeleteMeal(m.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                            >
                              ✕
                            </button>
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
            <div className="space-y-4">

              {/* Log weight */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Log Weight</div>
                <div className="flex gap-2">
                  <input
                    type="number" step="0.1" placeholder="Weight (kg)" value={weightForm}
                    onChange={e => setWeightForm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <button
                    onClick={handleAddWeight}
                    disabled={!weightForm}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Log
                  </button>
                </div>
              </div>

              {/* Trend */}
              {trendWeights.length >= 2 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Weight Trend</div>
                    <span className="text-xs font-nunito text-[#09090F]/50">
                      {trendWeights[0].weightKg} → {trendWeights[trendWeights.length - 1].weightKg} kg
                    </span>
                  </div>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                    <polyline
                      points={trendPoints}
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] font-nunito text-[#09090F]/40">
                    <span>{trendWeights[0].date}</span>
                    <span>{trendWeights[trendWeights.length - 1].date}</span>
                  </div>
                </div>
              )}

              {/* Weight entries */}
              {data.weights.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Entries</div>
                  <div className="space-y-2">
                    {[...data.weights].reverse().slice(0, 10).map(w => (
                      <div key={w.id} className="flex items-center gap-3">
                        <span className="font-nunito text-sm text-[#09090F] flex-1">{w.date}</span>
                        <span className="font-nunito font-semibold text-sm" style={{ color: ACCENT }}>{w.weightKg} kg</span>
                        <button
                          onClick={() => handleDeleteWeight(w.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Targets */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Daily Targets</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-xs text-[#09090F]/50 font-nunito mb-1">Calories (kcal)</div>
                    <input
                      type="number" value={goalsForm.calories}
                      onChange={e => setGoalsForm(f => ({ ...f, calories: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-[#09090F]/50 font-nunito mb-1">Water (glasses)</div>
                    <input
                      type="number" value={goalsForm.water}
                      onChange={e => setGoalsForm(f => ({ ...f, water: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveGoals}
                  className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                  style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                >
                  Save Targets
                </button>
              </div>
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
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
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Health Pet</span>
              </div>
              <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={{ background: INPUT_BG }}>
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="flex-1 py-2 rounded-lg font-nunito text-sm transition"
                    style={gameTab === g
                      ? { background: ACCENT, color: '#FFFFFF', border: '2.5px solid #09090F', boxShadow: '2px 2px 0 #09090F' }
                      : { color: 'rgba(9,9,15,0.4)' }}
                  >
                    {g === 'clicker' ? '👆 Clicker' : g === 'arcade' ? '🕹️ Arcade' : '🧩 Puzzle'}
                  </button>
                ))}
              </div>
              {gameTab === 'clicker' && <CalorieBalance onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <JumpRope onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <PlateBuilder onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}>
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
              {petCard}
            </div>
            <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Today</div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: '#E5E4E2' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${kcalPct}%`, background: overTarget ? BAD_COLOR : ACCENT }} />
              </div>
              <div className="flex justify-between text-xs font-nunito">
                <span className="text-[#09090F]/60">{kcalToday} kcal</span>
                <span className="text-[#09090F]/50">💧 {waterToday}/{data.goals.waterTarget}</span>
              </div>
            </div>
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#ECFCCB', border: '1px solid #D9F99D' }}>
              <strong className="text-lime-700">Pet tip:</strong>{' '}
              <span className="text-lime-800">Meals earn +8 XP (first {MEAL_XP_CAP}/day), water +2 per glass, and logging all 3 main meals gives a +15 bonus!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
