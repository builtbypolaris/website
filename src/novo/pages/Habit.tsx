import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addHabit as dbAddHabit,
  deleteHabit as dbDeleteHabit,
  toggleHabitCompletion,
  getHabitData,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak as getDayStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import HabitChain from '../games/HabitChain'
import HabitRun from '../games/HabitRun'
import HabitMaze from '../games/HabitMaze'
import type { CharacterState, HabitData } from '../types'

const ACCENT = '#2563EB'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'analytics' | 'manage' | 'pet' | 'games'

const HABIT_ICONS = ['💪', '📚', '🧘', '🏃', '💧', '🍎', '😴', '✍️', '🎯', '🧹', '🌿', '🎨']
const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'manage', label: 'Habits' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function getStreak(completions: string[]): number {
  if (!completions.length) return 0
  const sorted = [...completions].sort().reverse()
  let streak = 0
  const check = new Date()
  for (const d of sorted) {
    const dateStr = check.toISOString().split('T')[0]
    if (d === dateStr) { streak++; check.setDate(check.getDate() - 1) }
    else if (d < dateStr) break
  }
  return streak
}

function getBestStreak(completions: string[]): number {
  if (!completions.length) return 0
  const sorted = [...completions].sort()
  let best = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) { current++; best = Math.max(best, current) }
    else current = 1
  }
  return best
}

export default function Habit() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<HabitData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('today')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('💪')
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily')
  const [toast, setToast] = useState('')
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getDayStreak(userId, 'habit').then(setStreak)
    getBadges(userId, 'habit').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getHabitData(userId).then(setData)
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'habit', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  const today = todayStr()
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const runAward = (before: CharacterState, gain: number, kind: 'log' | 'game' = 'log') => {
    void awardXP(userId, 'habit', before, gain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const todayDone = data.habits.filter(h => h.completions.includes(today)).length
  const totalHabits = data.habits.length

  const heatmapData = last30.map(date => {
    const doneCount = data.habits.filter(h => h.completions.includes(date)).length
    return { date, doneCount, ratio: totalHabits > 0 ? doneCount / totalHabits : 0 }
  })
  const perfectDays = heatmapData.filter(d => totalHabits > 0 && d.doneCount === totalHabits).length
  const totalCompletions = data.habits.reduce((sum, h) => sum + h.completions.length, 0)
  const overallBestStreak = data.habits.length > 0
    ? Math.max(...data.habits.map(h => getBestStreak(h.completions)))
    : 0
  const currentBestStreak = data.habits.length > 0
    ? Math.max(...data.habits.map(h => getStreak(h.completions)))
    : 0

  const handleAddHabit = async () => {
    if (!newName.trim()) return
    try {
      const habit = await dbAddHabit(userId, { name: newName.trim(), icon: newIcon, frequency: newFreq })
      setData(d => d ? { ...d, habits: [...d.habits, habit] } : d)
      setNewName('')
    } catch {
      showToast('Failed to add habit')
    }
  }

  const handleToggleHabit = async (id: string) => {
    if (!data) return
    const habit = data.habits.find(h => h.id === id)
    if (!habit) return

    const isDone = habit.completions.includes(today)
    const nowCompleted = !isDone
    const completions = isDone
      ? habit.completions.filter(d => d !== today)
      : [...habit.completions, today]

    let xpTotal = 0
    let toastMsg = ''
    if (nowCompleted) {
      let xp = 20
      const habitStreak = getStreak([...habit.completions, today])
      if (habitStreak >= 30) { xp += 50; toastMsg = `+${xp} XP! 30-day streak bonus!` }
      else if (habitStreak >= 7) { xp += 20; toastMsg = `+${xp} XP! 7-day streak bonus!` }
      else toastMsg = `+${xp} XP!`
      xpTotal = xp

      const updatedHabits = data.habits.map(h => h.id === id ? { ...h, completions } : h)
      if (updatedHabits.every(h => h.completions.includes(today)) && data.habits.length >= 2) {
        xpTotal += 50
        toastMsg = 'All habits done! +50 bonus XP!'
      }
    }

    // Unchecking takes back the base reward so check/uncheck can't farm XP
    if (!nowCompleted) {
      xpTotal = -20
      toastMsg = '−20 XP, habit unchecked'
    }

    const before = data.character
    setData(d => d ? {
      ...d,
      habits: d.habits.map(h => h.id === id ? { ...h, completions } : h),
      character: addXP(before, xpTotal),
    } : d)

    if (toastMsg) showToast(toastMsg)

    await toggleHabitCompletion(id, userId, today, nowCompleted)
    runAward(before, xpTotal)
  }

  const handleDeleteHabit = async (id: string) => {
    setData(d => d ? { ...d, habits: d.habits.filter(h => h.id !== id) } : d)
    await dbDeleteHabit(id)
  }

  const handleXPEarned = (xp: number) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(`${title}: +${xp} XP!`)
  }

  const dailyChallenges = [
    { id: 'do1', title: 'Complete a habit', emoji: '💪', xp: 10, met: todayDone >= 1 },
    { id: 'do3', title: 'Complete 3 habits', emoji: '🔥', xp: 25, met: todayDone >= 3 },
    { id: 'all', title: 'Complete every habit', emoji: '🌟', xp: 30, met: totalHabits > 0 && todayDone === totalHabits },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}
      {toast && (
        <div className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-2xl font-nunito font-semibold text-white text-sm bounce-in" style={{ background: '#7C3AED' }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-30"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>
          Back
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2" style={{ color: INK }}>
          Habits <StreakBadge streak={streak} />
        </div>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">
            <Character type="habit" xp={data.character.xp} happiness={data.character.happiness} onEvolution={s => showToast(`Evolved to ${s.name}!`)} />
          </div>

          {/* Today progress — plain, one hero number */}
          <div className="flex items-center gap-5 mb-6">
            <div>
              <div className="font-nunito font-bold leading-none" style={{ color: ACCENT, fontSize: 44 }}>
                {todayDone}<span style={{ color: MUTED, fontSize: 22 }}>/{totalHabits}</span>
              </div>
              <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>habits today</div>
            </div>
            <div className="flex-1">
              <NProgress pct={totalHabits > 0 ? (todayDone / totalHabits) * 100 : 0} accent={todayDone === totalHabits && totalHabits > 0 ? '#16A34A' : ACCENT} height={6} />
              {todayDone === totalHabits && totalHabits > 0 && (
                <div className="font-nunito text-xs mt-1.5" style={{ color: '#16A34A' }}>Perfect day</div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 gap-5 overflow-x-auto scrollbar-hidden" style={{ borderBottom: `1px solid ${INK}12` }}>
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

          {/* TODAY TAB */}
          {mainTab === 'today' && (
            <div className="max-w-2xl">
              {data.habits.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm mb-3" style={{ color: INK }}>No habits yet</div>
                  <div className="font-nunito text-xs mb-4" style={{ color: MUTED }}>Set up habits to start tracking your daily wins</div>
                  <NButton onClick={() => setMainTab('manage')} accent={ACCENT}>Add your first habit</NButton>
                </div>
              ) : (
                data.habits.map((habit, i) => {
                  const done = habit.completions.includes(today)
                  const streak = getStreak(habit.completions)
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 py-3 cursor-pointer"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-colors"
                        style={{ background: done ? ACCENT : `${INK}08`, color: done ? '#fff' : 'inherit' }}
                      >
                        {done ? '✓' : habit.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm" style={{ color: INK, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}>
                          {habit.name}
                        </div>
                        {streak > 0 && <div className="font-nunito text-xs" style={{ color: '#EA580C' }}>{streak}-day streak</div>}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {last7.map(d => (
                          <div key={d} className="w-2.5 h-2.5 rounded-full" style={{ background: habit.completions.includes(d) ? ACCENT : `${INK}12` }} />
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {mainTab === 'analytics' && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { label: 'Perfect days, last 30', value: String(perfectDays) },
                  { label: 'Best streak', value: String(overallBestStreak) },
                  { label: 'Total completions', value: String(totalCompletions) },
                  { label: 'Active streak', value: String(currentBestStreak) },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-nunito font-bold text-xl leading-none" style={{ color: INK }}>{s.value}</div>
                    <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>30-day heatmap</div>
                  <div className="font-nunito text-xs mb-4" style={{ color: MUTED }}>Darker means more habits completed that day</div>
                  {totalHabits === 0 ? (
                    <div className="font-nunito text-sm" style={{ color: MUTED }}>Add habits to see your heatmap</div>
                  ) : (
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                      {heatmapData.map(({ date, ratio }) => {
                        const opacity = ratio === 0 ? 0 : Math.max(0.15, ratio)
                        return (
                          <div
                            key={date}
                            className="rounded-sm aspect-square"
                            title={date}
                            style={{ background: ratio === 0 ? `${INK}0D` : `rgba(37,99,235,${opacity})` }}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>

                {data.habits.length > 0 && (
                  <div>
                    <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>Habit breakdown</div>
                    <div className="space-y-4">
                      {data.habits.map(habit => {
                        const streak = getStreak(habit.completions)
                        const best = getBestStreak(habit.completions)
                        const completionsLast30 = habit.completions.filter(d => last30.includes(d)).length
                        const rate30 = Math.round((completionsLast30 / 30) * 100)
                        return (
                          <div key={habit.id}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base">{habit.icon}</span>
                              <span className="font-nunito text-sm flex-1" style={{ color: INK }}>{habit.name}</span>
                              <span className="font-nunito text-xs" style={{ color: '#EA580C' }}>{streak}-day</span>
                            </div>
                            <NProgress pct={rate30} accent={ACCENT} height={4} />
                            <div className="flex justify-between font-nunito text-xs mt-1" style={{ color: MUTED }}>
                              <span>{rate30}% last 30 days</span>
                              <span>Best {best} days</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANAGE TAB */}
          {mainTab === 'manage' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {HABIT_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className="text-xl p-1.5 rounded-lg transition-colors"
                        style={{ background: newIcon === icon ? `${ACCENT}25` : 'transparent' }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Habit name…"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                      className="flex-1 min-w-[160px] rounded-xl px-3 py-2 font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    />
                    <select
                      value={newFreq}
                      onChange={e => setNewFreq(e.target.value as 'daily' | 'weekly')}
                      className="px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <NButton onClick={handleAddHabit} disabled={!newName.trim()} accent={ACCENT}>Add</NButton>
                  </div>
                </Panel>
              </div>

              <div>
                {data.habits.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="font-nunito text-sm" style={{ color: INK }}>No habits yet</div>
                    <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Use the form above to add your first habit</div>
                  </div>
                ) : (
                  data.habits.map((habit, i) => {
                    const streak = getStreak(habit.completions)
                    const done = habit.completions.includes(today)
                    return (
                      <div key={habit.id} className="py-4" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{habit.icon}</span>
                          <div className="flex-1">
                            <div className="font-nunito font-medium text-sm" style={{ color: INK }}>{habit.name}</div>
                            <div className="font-nunito text-xs capitalize" style={{ color: MUTED }}>{habit.frequency}</div>
                          </div>
                          <span className="font-nunito text-xs" style={{ color: done ? ACCENT : MUTED }}>{done ? 'Done' : 'Pending'}</span>
                          <button onClick={() => handleDeleteHabit(habit.id)} className="text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                        </div>
                        <div className="flex gap-4 font-nunito text-xs mb-2" style={{ color: MUTED }}>
                          <span>Streak <strong style={{ color: '#EA580C' }}>{streak}</strong></span>
                          <span>Total <strong style={{ color: ACCENT }}>{habit.completions.length}</strong></span>
                        </div>
                        <div className="flex gap-1">
                          {last7.map(d => (
                            <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
                              <div className="w-full h-4 rounded-sm" style={{ background: habit.completions.includes(d) ? ACCENT : `${INK}0D` }} />
                              <div style={{ fontSize: 9, color: MUTED }}>{['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(d).getDay()]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* PET TAB */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="habit" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="habit"
                character={data.character}
                streak={streak}
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
              {gameTab === 'clicker' && <HabitChain onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <HabitRun onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <HabitMaze onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            <Character
              type="habit"
              xp={data.character.xp}
              happiness={data.character.happiness}
              prestige={data.character.prestige}
              onEvolution={s => showToast(`Evolved to ${s.name}!`)}
              onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`)}
            />
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Complete all habits daily for a +50 XP bonus. 7-day streaks add +20 extra per habit.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
