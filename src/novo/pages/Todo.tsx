import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addTask as dbAddTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getTodoData,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import Character from '../components/Character'
import TaskTap from '../games/TaskTap'
import TaskRush from '../games/TaskRush'
import PriorityPuzzle from '../games/PriorityPuzzle'
import type { CharacterState, TodoData, Task, Priority } from '../types'

const ACCENT = '#16A34A'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const BAR_MAX_H = 80

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'tasks' | 'analytics' | 'pet' | 'games'
type FilterTab = 'all' | 'active' | 'done'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bar: string }> = {
  high:   { label: 'High',   color: '#DC2626', bar: '#FEE2E2' },
  medium: { label: 'Medium', color: '#B45309', bar: '#FEF3C7' },
  low:    { label: 'Low',    color: '#2563EB', bar: '#DBEAFE' },
}
const PRIORITY_XP: Record<Priority, number> = { high: 25, medium: 15, low: 10 }
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Todo() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<TodoData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('tasks')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDue, setNewDue] = useState('')
  const [toast, setToast] = useState('')
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'todo').then(setStreak)
    getBadges(userId, 'todo').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getTodoData(userId).then(setData)
  }, [userId])

  // Idle-day happiness decay — guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'todo', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const runAward = (before: CharacterState, gain: number, kind: 'log' | 'game' = 'log') => {
    void awardXP(userId, 'todo', before, gain, kind).then(r => {
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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
      </div>
    )
  }

  const totalTasks = data.tasks.length
  const doneTasks = data.tasks.filter(t => t.completed).length
  const activeTasks = totalTasks - doneTasks
  const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    return { key, label: DAY_LABELS[d.getDay()] }
  })
  const dailyCompleted = last7Days.map(({ key, label }) => ({
    label,
    count: data.tasks.filter(t => t.completedAt === key).length,
  }))
  const maxDaily = Math.max(...dailyCompleted.map(d => d.count), 1)

  const priorityDist = (['high', 'medium', 'low'] as Priority[]).map(p => ({
    priority: p,
    total: data.tasks.filter(t => t.priority === p).length,
    done: data.tasks.filter(t => t.priority === p && t.completed).length,
  })).filter(p => p.total > 0)

  const handleAddTask = async () => {
    if (!newTitle.trim()) return
    try {
      const task = await dbAddTask(userId, {
        title: newTitle.trim(),
        completed: false,
        priority: newPriority,
        dueDate: newDue || undefined,
      })
      setData(d => d ? { ...d, tasks: [task, ...d.tasks] } : d)
      setNewTitle('')
      setNewDue('')
    } catch {
      showToast('Failed to add task')
    }
  }

  const handleToggleTask = async (id: string) => {
    if (!data) return
    const task = data.tasks.find(t => t.id === id)
    if (!task) return

    const nowCompleted = !task.completed
    const completedAt = nowCompleted ? todayStr() : undefined

    let xpTotal = 0
    if (nowCompleted) {
      const overdue = !!(task.dueDate && task.dueDate < todayStr())
      const xp = overdue ? 5 : PRIORITY_XP[task.priority]
      xpTotal = xp
      const wouldAllDone = data.tasks.every(t => t.id === id || t.completed)
      if (wouldAllDone && data.tasks.length >= 3) {
        xpTotal += 30
        showToast(`+${xp} XP! +30 ALL DONE bonus!`)
      } else {
        showToast(overdue ? `+${xp} XP — it was overdue, finish on time for more!` : `+${xp} XP!`)
      }
    }

    const before = data.character
    setData(d => d ? {
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: nowCompleted, completedAt } : t),
      character: nowCompleted ? addXP(before, xpTotal) : d.character,
    } : d)

    await dbUpdateTask(id, { completed: nowCompleted, completedAt })
    if (nowCompleted) runAward(before, xpTotal)
  }

  const handleDeleteTask = async (id: string) => {
    const task = data.tasks.find(t => t.id === id)
    const abandoned = !!task && !task.completed
    const before = data.character
    setData(d => d ? {
      ...d,
      tasks: d.tasks.filter(t => t.id !== id),
      character: abandoned ? addXP(before, -5) : d.character,
    } : d)
    await dbDeleteTask(id)
    if (abandoned) {
      runAward(before, -5)
      showToast('−5 XP — task abandoned')
    }
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
    showToast(`${title} — +${xp} XP!`)
  }

  const isOverdue = (t: Task) => !!(t.dueDate && !t.completed && t.dueDate < todayStr())
  const isDueToday = (t: Task) => t.dueDate === todayStr() && !t.completed

  const dueToday = data.tasks.filter(isDueToday).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  const filtered = data.tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  const overdueCount = data.tasks.filter(isOverdue).length

  const renderTask = (task: Task) => {
    const pc = PRIORITY_CONFIG[task.priority]
    const overdue = isOverdue(task)
    const dueT = isDueToday(task)
    return (
      <div
        key={task.id}
        className="px-4 py-3 rounded-xl flex items-start gap-3 transition"
        style={{
          background: CARD_BG,
          border: `3px solid ${overdue ? '#FCA5A5' : dueT ? '#86EFAC' : CARD_BORDER}`,
          opacity: task.completed ? 0.55 : 1,
        }}
      >
        <button
          onClick={() => handleToggleTask(task.id)}
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition"
          style={{
            background: task.completed ? ACCENT : 'transparent',
            borderColor: task.completed ? ACCENT : '#C5E8D0',
          }}
        >
          {task.completed && <span className="text-white text-xs font-black">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`font-nunito font-semibold text-sm ${task.completed ? 'line-through text-[#09090F]/40' : 'text-[#09090F]'}`}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pc.color + '80' }} />
            <span className="text-xs font-nunito" style={{ color: pc.color }}>{pc.label}</span>
            {task.dueDate && (
              <span className="text-xs font-nunito" style={{ color: overdue ? '#DC2626' : dueT ? ACCENT : 'rgba(9,9,15,0.4)' }}>
                {overdue ? '⚠ Overdue' : dueT ? '📅 Today' : task.dueDate}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => handleDeleteTask(task.id)} className="text-[#09090F]/40 hover:text-red-500 transition text-sm flex-shrink-0">✕</button>
      </div>
    )
  }

  const doneToday = data.tasks.filter(t => t.completedAt === todayStr())
  const dailyChallenges = [
    { id: 'done1', title: 'Complete a task', emoji: '✅', xp: 10, met: doneToday.length >= 1 },
    { id: 'done3', title: 'Complete 3 tasks', emoji: '🔥', xp: 25, met: doneToday.length >= 3 },
    { id: 'high', title: 'Finish a high-priority task', emoji: '⚡', xp: 20, met: doneToday.some(t => t.priority === 'high') },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}
      {toast && (
        <div className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl font-nunito font-black text-white text-sm bounce-in" style={{ background: '#7C3AED', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}>
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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-base flex items-center gap-2">✅ To-Do List <StreakBadge streak={streak} /></div>
        <div className="w-16" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
            <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            <Character
              type="todo"
              xp={data.character.xp}
              happiness={data.character.happiness}
              onEvolution={s => showToast(`Evolved to ${s.name}!`)}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: 'Total', value: String(totalTasks), color: '#09090F' },
              { label: 'Active', value: String(activeTasks), color: '#B45309' },
              { label: 'Done', value: String(doneTasks), color: ACCENT },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3.5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="font-nunito font-black text-2xl mb-0.5" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px] font-nunito font-black uppercase tracking-widest text-[#09090F]/45">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 py-1">
            {(['tasks', 'analytics', 'pet', 'games'] as MainTab[]).map(t => (
              <button
                key={t}
                onClick={() => setMainTab(t)}
                className="px-4 py-2 rounded-xl font-nunito text-sm transition"
                style={mainTab === t
                  ? { background: ACCENT, color: '#FFFFFF', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F', fontWeight: 800 }
                  : { color: 'rgba(9,9,15,0.45)', border: '2.5px solid transparent', fontWeight: 700 }}
              >
                {t === 'tasks' ? '📋 Tasks' : t === 'analytics' ? '📊 Analytics' : t === 'pet' ? '🐾 Pet' : '🎮 Games'}
              </button>
            ))}
          </div>

          {/* TASKS TAB */}
          {mainTab === 'tasks' && (
            <div className="space-y-3">
              {/* Add task form */}
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  className="w-full rounded-lg px-3 py-2.5 font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30 mb-2"
                  style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as Priority)}
                    className="flex-1 min-w-[130px] px-3 py-2 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  >
                    <option value="high">🔴 High (+25 XP)</option>
                    <option value="medium">🟡 Medium (+15 XP)</option>
                    <option value="low">🟢 Low (+10 XP)</option>
                  </select>
                  <input
                    type="date"
                    value={newDue}
                    onChange={e => setNewDue(e.target.value)}
                    className="flex-1 min-w-[130px] px-3 py-2 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!newTitle.trim()}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Due today pinned section */}
              {dueToday.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>
                    📅 Due Today ({dueToday.length})
                  </div>
                  {dueToday.map(renderTask)}
                </div>
              )}

              {/* Filter pills */}
              <div className="flex gap-2">
                {(['all', 'active', 'done'] as FilterTab[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg font-nunito text-xs font-semibold transition"
                    style={filter === f
                      ? { background: ACCENT, color: '#fff', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }
                      : { background: CARD_BG, color: 'rgba(9,9,15,0.4)', border: `3px solid ${CARD_BORDER}` }}
                  >
                    {f === 'all' ? `All (${totalTasks})` : f === 'active' ? `Active (${activeTasks})` : `Done (${doneTasks})`}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-4xl mb-3">
                    {filter === 'done' ? '🎯' : totalTasks === 0 ? '✨' : '✅'}
                  </div>
                  <div className="font-nunito font-bold text-[#09090F] mb-1">
                    {filter === 'done' ? 'Nothing completed yet' : totalTasks === 0 ? 'No tasks yet' : 'All clear!'}
                  </div>
                  <div className="text-sm text-[#09090F]/50 font-nunito">
                    {filter === 'done' ? 'Complete a task to see it here' : totalTasks === 0 ? 'Add your first task above to get started' : 'All active tasks are done'}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(renderTask)}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {mainTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Completion Rate', value: `${rate}%`, sub: `${doneTasks} of ${totalTasks} tasks done` },
                  { label: 'Active Tasks', value: String(activeTasks), sub: activeTasks === 0 ? 'All done! 🎉' : `${activeTasks} remaining` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-1" style={{ color: ACCENT }}>{s.label}</div>
                    <div className="font-nunito font-bold text-3xl text-[#09090F]">{s.value}</div>
                    <div className="text-xs font-nunito text-[#09090F]/50 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                  7-Day Completion
                </div>
                {dailyCompleted.every(d => d.count === 0) ? (
                  <div className="text-center py-6 text-[#09090F]/40 font-nunito text-sm">
                    Complete tasks to see your daily velocity
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-1" style={{ height: BAR_MAX_H + 32 }}>
                    {dailyCompleted.map(({ label, count }) => (
                      <div key={label} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-nunito text-[#09090F]/50">{count > 0 ? count : ''}</span>
                        <div
                          className="w-full rounded-t-md transition-all duration-500"
                          style={{
                            height: count > 0 ? Math.max(8, (count / maxDaily) * BAR_MAX_H) : 4,
                            background: count > 0 ? ACCENT : '#E5E4E2',
                          }}
                        />
                        <span className="text-xs font-nunito text-[#09090F]/50">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                  By Priority
                </div>
                {priorityDist.length === 0 ? (
                  <div className="text-center py-4 text-[#09090F]/40 font-nunito text-sm">Add tasks to see priority breakdown</div>
                ) : (
                  priorityDist.map(({ priority, total, done }) => {
                    const pc = PRIORITY_CONFIG[priority]
                    return (
                      <div key={priority} className="mb-4 last:mb-0">
                        <div className="flex justify-between text-sm font-nunito mb-1.5">
                          <span style={{ color: pc.color }}>{pc.label}</span>
                          <span className="text-[#09090F]/50">{done}/{total} done</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: pc.bar }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${total ? (done / total) * 100 : 0}%`, background: pc.color }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {overdueCount > 0 && (
                <div className="rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <div className="font-nunito font-bold text-red-700 text-sm mb-1">
                    ⚠ {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs font-nunito text-red-600">
                    Head to the Tasks tab to catch up.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAMES TAB */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="todo" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="todo"
                character={data.character}
                streak={streak}
                earnedBadges={earnedBadges}
                missions={missions}
                onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
              />
            </div>
          )}

          {mainTab === 'games' && (
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP goes to your Task Pet</span>
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
              {gameTab === 'clicker' && <TaskTap onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <TaskRush onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <PriorityPuzzle onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside
          className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto"
          style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}
        >
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Your Pet
              </div>
              <Character
                type="todo"
                xp={data.character.xp}
                happiness={data.character.happiness}
                prestige={data.character.prestige}
                onEvolution={s => showToast(`Evolved to ${s.name}!`)}
                onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`)}
              />
            </div>
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }}>
              <strong className="text-green-700">Pet tip:</strong>{' '}
              <span className="text-green-800">Complete high-priority tasks for 25 XP each. Finish ALL tasks for +30 bonus XP!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
