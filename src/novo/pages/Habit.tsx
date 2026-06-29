import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addHabit as dbAddHabit,
  deleteHabit as dbDeleteHabit,
  toggleHabitCompletion,
  getHabitData,
  saveHabitCharacter as dbSaveCharacter,
  addXP, todayStr,
} from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import Character from '../components/Character'
import HabitChain from '../games/HabitChain'
import HabitRun from '../games/HabitRun'
import HabitMaze from '../games/HabitMaze'
import type { HabitData } from '../types'

const ACCENT = '#2563EB'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E4E2'
const INPUT_BG = '#F0EEE8'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'analytics' | 'manage' | 'games'

const HABIT_ICONS = ['💪', '📚', '🧘', '🏃', '💧', '🍎', '😴', '✍️', '🎯', '🧹', '🌿', '🎨']

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

  useEffect(() => {
    if (!userId) return
    getHabitData(userId).then(setData)
  }, [userId])

  const today = todayStr()
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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

    let newCharacter = data.character
    let toastMsg = ''
    if (nowCompleted) {
      let xp = 20
      const streak = getStreak([...habit.completions, today])
      if (streak >= 30) { xp += 50; toastMsg = `+${xp} XP! 30-day streak bonus!` }
      else if (streak >= 7) { xp += 20; toastMsg = `+${xp} XP! 7-day streak bonus!` }
      else toastMsg = `+${xp} XP!`
      newCharacter = addXP(newCharacter, xp)

      const updatedHabits = data.habits.map(h => h.id === id ? { ...h, completions } : h)
      if (updatedHabits.every(h => h.completions.includes(today)) && data.habits.length >= 2) {
        newCharacter = addXP(newCharacter, 50)
        toastMsg = `All habits done! +50 bonus XP!`
      }
    }

    setData(d => d ? {
      ...d,
      habits: d.habits.map(h => h.id === id ? { ...h, completions } : h),
      character: newCharacter,
    } : d)

    if (toastMsg) showToast(toastMsg)

    await toggleHabitCompletion(id, userId, today, nowCompleted)
    if (nowCompleted) dbSaveCharacter(userId, newCharacter)
  }

  const handleDeleteHabit = async (id: string) => {
    setData(d => d ? { ...d, habits: d.habits.filter(h => h.id !== id) } : d)
    await dbDeleteHabit(id)
  }

  const handleXPEarned = (xp: number) => {
    const newCharacter = addXP(data.character, xp)
    setData(d => d ? { ...d, character: newCharacter } : d)
    dbSaveCharacter(userId, newCharacter)
    showToast(`+${xp} XP from game!`)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {toast && (
        <div className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg font-nunito text-white text-sm bounce-in" style={{ background: '#7C3AED' }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-30"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button
          onClick={() => navigate('/studios/dashboard')}
          className="font-nunito text-sm text-[#09090F]/50 hover:text-[#09090F] transition"
        >
          ← Dashboard
        </button>
        <div className="font-nunito font-bold text-[#09090F] text-base">🌱 Habit Tracker</div>
        <div className="w-16" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            <Character
              type="habit"
              xp={data.character.xp}
              happiness={data.character.happiness}
              onEvolution={s => showToast(`Evolved to ${s.name}!`)}
            />
          </div>

          {/* Today progress bar */}
          <div className="flex items-center gap-5 p-5 rounded-xl mb-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div>
              <div className="font-nunito font-black text-5xl leading-none" style={{ color: ACCENT }}>
                {todayDone}<span className="text-2xl text-[#09090F]/30">/{totalHabits}</span>
              </div>
              <div className="text-xs text-[#09090F]/50 font-nunito mt-1">habits today</div>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background: '#E5E4E2' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${totalHabits > 0 ? (todayDone / totalHabits) * 100 : 0}%`,
                    background: todayDone === totalHabits && totalHabits > 0 ? '#16A34A' : ACCENT,
                  }}
                />
              </div>
              {todayDone === totalHabits && totalHabits > 0 && (
                <div className="text-xs font-nunito font-bold text-green-600">Perfect day! 🎉</div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #E5E4E2' }}>
            {(['today', 'analytics', 'manage', 'games'] as MainTab[]).map(t => (
              <button
                key={t}
                onClick={() => setMainTab(t)}
                className="px-3 py-2.5 font-nunito text-sm transition border-b-2 -mb-px"
                style={{
                  borderBottomColor: mainTab === t ? ACCENT : 'transparent',
                  color: mainTab === t ? '#09090F' : 'rgba(9,9,15,0.4)',
                }}
              >
                {t === 'today' ? '☀️ Today' : t === 'analytics' ? '📊 Analytics' : t === 'manage' ? '📋 Habits' : '🎮 Games'}
              </button>
            ))}
          </div>

          {/* TODAY TAB */}
          {mainTab === 'today' && (
            <div className="space-y-2">
              {data.habits.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-4xl mb-3">🌱</div>
                  <div className="font-nunito font-bold text-[#09090F] mb-1">No habits yet</div>
                  <div className="text-sm text-[#09090F]/50 font-nunito mb-4">Set up habits to start tracking your daily wins</div>
                  <button
                    onClick={() => setMainTab('manage')}
                    className="px-4 py-2 rounded-lg font-nunito font-bold text-sm text-white transition"
                    style={{ background: ACCENT }}
                  >
                    Add your first habit
                  </button>
                </div>
              ) : (
                data.habits.map(habit => {
                  const done = habit.completions.includes(today)
                  const streak = getStreak(habit.completions)
                  return (
                    <div
                      key={habit.id}
                      className="px-4 py-3.5 rounded-xl flex items-center gap-3 cursor-pointer transition"
                      style={{
                        background: CARD_BG,
                        border: `1px solid ${done ? ACCENT + '50' : CARD_BORDER}`,
                      }}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                        style={{ background: done ? ACCENT : INPUT_BG, color: done ? '#fff' : 'inherit' }}
                      >
                        {done ? '✓' : habit.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-nunito font-semibold text-sm ${done ? 'text-[#09090F]/40 line-through' : 'text-[#09090F]'}`}>
                          {habit.name}
                        </div>
                        {streak > 0 && <div className="text-xs font-nunito text-orange-500">🔥 {streak} day streak</div>}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {last7.map(d => (
                          <div
                            key={d}
                            className="w-3 h-3 rounded-sm"
                            style={{ background: habit.completions.includes(d) ? ACCENT : '#E5E4E2' }}
                          />
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Perfect Days', value: String(perfectDays), sub: 'last 30 days', icon: '🌟' },
                  { label: 'Best Streak', value: String(overallBestStreak), sub: 'days in a row', icon: '🔥' },
                  { label: 'Total Completions', value: String(totalCompletions), sub: 'all time', icon: '✅' },
                  { label: 'Active Streak', value: String(currentBestStreak), sub: 'best current', icon: '⚡' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>{s.label}</div>
                    <div className="font-nunito font-bold text-3xl text-[#09090F]">{s.value}</div>
                    <div className="text-xs font-nunito text-[#09090F]/50 mt-0.5">{s.icon} {s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
                  30-Day Heatmap
                </div>
                <div className="text-xs font-nunito text-[#09090F]/40 mb-4">Darker = more habits completed that day</div>
                {totalHabits === 0 ? (
                  <div className="text-center py-4 text-[#09090F]/40 font-nunito text-sm">Add habits to see your heatmap</div>
                ) : (
                  <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                    {heatmapData.map(({ date, ratio }) => {
                      const opacity = ratio === 0 ? 0 : Math.max(0.15, ratio)
                      return (
                        <div
                          key={date}
                          className="rounded-sm aspect-square"
                          title={date}
                          style={{
                            background: ratio === 0 ? '#E5E4E2' : `rgba(37,99,235,${opacity})`,
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {data.habits.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                    Habit Breakdown
                  </div>
                  <div className="space-y-4">
                    {data.habits.map(habit => {
                      const streak = getStreak(habit.completions)
                      const best = getBestStreak(habit.completions)
                      const completionsLast30 = habit.completions.filter(d => last30.includes(d)).length
                      const rate30 = Math.round((completionsLast30 / 30) * 100)
                      return (
                        <div key={habit.id}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{habit.icon}</span>
                            <span className="font-nunito font-semibold text-sm text-[#09090F] flex-1">{habit.name}</span>
                            <span className="text-xs font-nunito text-orange-500">🔥 {streak}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: '#E5E4E2' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${rate30}%`, background: ACCENT }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-nunito text-[#09090F]/40">
                            <span>{rate30}% last 30 days</span>
                            <span>Best: {best} days</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANAGE TAB */}
          {mainTab === 'manage' && (
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {HABIT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className="text-xl p-1.5 rounded-lg transition"
                      style={{
                        background: newIcon === icon ? ACCENT + '20' : 'transparent',
                        outline: newIcon === icon ? `2px solid ${ACCENT}` : 'none',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Habit name..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                    className="flex-1 min-w-[160px] rounded-lg px-3 py-2 font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <select
                    value={newFreq}
                    onChange={e => setNewFreq(e.target.value as 'daily' | 'weekly')}
                    className="px-3 py-2 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <button
                    onClick={handleAddHabit}
                    disabled={!newName.trim()}
                    className="px-4 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40"
                    style={{ background: ACCENT }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {data.habits.length === 0 ? (
                <div className="text-center py-10 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-4xl mb-2">🌱</div>
                  <div className="font-nunito font-bold text-[#09090F] mb-1">No habits yet</div>
                  <div className="text-sm text-[#09090F]/50 font-nunito">Use the form above to add your first habit</div>
                </div>
              ) : (
                data.habits.map(habit => {
                  const streak = getStreak(habit.completions)
                  const done = habit.completions.includes(today)
                  return (
                    <div key={habit.id} className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{habit.icon}</span>
                        <div className="flex-1">
                          <div className="font-nunito font-semibold text-sm text-[#09090F]">{habit.name}</div>
                          <div className="text-xs text-[#09090F]/50 font-nunito capitalize">{habit.frequency}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-nunito font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: done ? ACCENT + '20' : INPUT_BG,
                              color: done ? ACCENT : 'rgba(9,9,15,0.4)',
                            }}
                          >
                            {done ? '✓ Done' : 'Pending'}
                          </span>
                          <button onClick={() => handleDeleteHabit(habit.id)} className="text-[#09090F]/40 hover:text-red-500 transition text-sm">✕</button>
                        </div>
                      </div>
                      <div className="flex gap-5 text-xs font-nunito mb-2">
                        <span className="text-[#09090F]/50">🔥 Streak: <strong className="text-orange-500">{streak}</strong></span>
                        <span className="text-[#09090F]/50">✅ Total: <strong style={{ color: ACCENT }}>{habit.completions.length}</strong></span>
                      </div>
                      <div className="flex gap-1">
                        {last7.map(d => (
                          <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
                            <div
                              className="w-full h-5 rounded-sm"
                              style={{ background: habit.completions.includes(d) ? ACCENT + '90' : '#E5E4E2' }}
                            />
                            <div className="text-[#09090F]/40" style={{ fontSize: 9 }}>
                              {['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(d).getDay()]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* GAMES TAB */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP goes to your Habit Pet</span>
              </div>
              <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={{ background: INPUT_BG }}>
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="flex-1 py-2 rounded-lg font-nunito text-sm transition"
                    style={gameTab === g
                      ? { background: CARD_BG, color: '#09090F', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                      : { color: 'rgba(9,9,15,0.4)' }}
                  >
                    {g === 'clicker' ? '👆 Clicker' : g === 'arcade' ? '🕹️ Arcade' : '🧩 Puzzle'}
                  </button>
                ))}
              </div>
              {gameTab === 'clicker' && <HabitChain onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <HabitRun onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <HabitMaze onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside
          className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto"
          style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}
        >
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Your Pet
              </div>
              <Character
                type="habit"
                xp={data.character.xp}
                happiness={data.character.happiness}
                prestige={data.character.prestige}
                onEvolution={s => showToast(`Evolved to ${s.name}!`)}
                onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`)}
              />
            </div>
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#DBEAFE', border: '1px solid #BFDBFE' }}>
              <strong className="text-blue-700">Pet tip:</strong>{' '}
              <span className="text-blue-800">Complete all habits daily for +50 XP bonus. 7-day streaks give +20 extra per habit!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
