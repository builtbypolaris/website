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
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import TaskTap from '../games/TaskTap'
import TaskRush from '../games/TaskRush'
import PriorityPuzzle from '../games/PriorityPuzzle'
import type { CharacterState, TodoData, Task, Priority } from '../types'

const ACCENT = '#16A34A'
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

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

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

  // Idle-day happiness decay, guarded to once per tracker per day
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
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
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
        showToast(`+${xp} XP! +30 all-done bonus!`)
      } else {
        showToast(overdue ? `+${xp} XP. It was overdue, finish on time for more!` : `+${xp} XP!`)
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
      showToast('−5 XP, task abandoned')
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
    showToast(`${title}: +${xp} XP!`)
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

  const renderTask = (task: Task, i: number) => {
    const pc = PRIORITY_CONFIG[task.priority]
    const overdue = isOverdue(task)
    const dueT = isDueToday(task)
    return (
      <div
        key={task.id}
        className="flex items-start gap-3 py-3"
        style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D`, opacity: task.completed ? 0.5 : 1 }}
      >
        <button
          onClick={() => handleToggleTask(task.id)}
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: task.completed ? ACCENT : 'transparent', borderColor: task.completed ? ACCENT : '#C5E8D0' }}
        >
          {task.completed && <span className="text-white text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-nunito font-medium text-sm" style={{ color: INK, textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap font-nunito text-xs">
            <span style={{ color: pc.color }}>{pc.label}</span>
            {task.dueDate && (
              <span style={{ color: overdue ? '#DC2626' : dueT ? ACCENT : MUTED }}>
                {overdue ? 'Overdue' : dueT ? 'Today' : task.dueDate}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => handleDeleteTask(task.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
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
          To-Do <StreakBadge streak={streak} />
        </div>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">
            <Character type="todo" xp={data.character.xp} happiness={data.character.happiness} onEvolution={s => showToast(`Evolved to ${s.name}!`)} />
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { label: 'Total', value: String(totalTasks), color: INK },
              { label: 'Active', value: String(activeTasks), color: '#B45309' },
              { label: 'Done', value: String(doneTasks), color: ACCENT },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-6 gap-5" style={{ borderBottom: `1px solid ${INK}12` }}>
            {MAIN_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="pb-2.5 font-nunito text-sm transition-colors"
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

          {/* TASKS TAB */}
          {mainTab === 'tasks' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
              {/* Add task form */}
              <div>
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <input
                    type="text"
                    placeholder="What do you need to do?"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    className="w-full rounded-xl px-3 py-2.5 font-nunito text-sm outline-none mb-2"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as Priority)}
                      className="flex-1 min-w-[130px] px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    >
                      <option value="high">High (+25 XP)</option>
                      <option value="medium">Medium (+15 XP)</option>
                      <option value="low">Low (+10 XP)</option>
                    </select>
                    <input
                      type="date"
                      value={newDue}
                      onChange={e => setNewDue(e.target.value)}
                      className="flex-1 min-w-[130px] px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    />
                    <NButton onClick={handleAddTask} disabled={!newTitle.trim()} accent={ACCENT}>Add</NButton>
                  </div>
                </Panel>
              </div>

              <div>
                {/* Due today pinned section */}
                {dueToday.length > 0 && (
                  <div className="mb-4">
                    <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>
                      Due today ({dueToday.length})
                    </div>
                    {dueToday.map((t, i) => renderTask(t, i))}
                  </div>
                )}

                {/* Filter tabs */}
                <div className="flex gap-5 mb-2">
                  {(['all', 'active', 'done'] as FilterTab[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="font-nunito text-sm transition-colors"
                      style={{ color: filter === f ? INK : MUTED, fontWeight: filter === f ? 600 : 400 }}
                    >
                      {f === 'all' ? `All (${totalTasks})` : f === 'active' ? `Active (${activeTasks})` : `Done (${doneTasks})`}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="font-nunito text-sm" style={{ color: INK }}>
                      {filter === 'done' ? 'Nothing completed yet' : totalTasks === 0 ? 'No tasks yet' : 'All clear'}
                    </div>
                    <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                      {filter === 'done' ? 'Complete a task to see it here' : totalTasks === 0 ? 'Add your first task above to get started' : 'All active tasks are done'}
                    </div>
                  </div>
                ) : (
                  <div>{filtered.map((t, i) => renderTask(t, i))}</div>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {mainTab === 'analytics' && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <div className="font-nunito font-bold text-2xl leading-none" style={{ color: INK }}>{rate}%</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Completion rate, {doneTasks} of {totalTasks}</div>
                </div>
                <div>
                  <div className="font-nunito font-bold text-2xl leading-none" style={{ color: INK }}>{activeTasks}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{activeTasks === 0 ? 'All done' : 'Active tasks remaining'}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>7-day completion</div>
                  {dailyCompleted.every(d => d.count === 0) ? (
                    <div className="font-nunito text-sm" style={{ color: MUTED }}>Complete tasks to see your daily velocity</div>
                  ) : (
                    <div className="flex items-end justify-between gap-1" style={{ height: BAR_MAX_H + 32 }}>
                      {dailyCompleted.map(({ label, count }) => (
                        <div key={label} className="flex flex-col items-center gap-1 flex-1">
                          <span className="font-nunito text-xs" style={{ color: MUTED }}>{count > 0 ? count : ''}</span>
                          <div
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ height: count > 0 ? Math.max(8, (count / maxDaily) * BAR_MAX_H) : 4, background: count > 0 ? ACCENT : `${INK}12` }}
                          />
                          <span className="font-nunito text-xs" style={{ color: MUTED }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>By priority</div>
                  {priorityDist.length === 0 ? (
                    <div className="font-nunito text-sm" style={{ color: MUTED }}>Add tasks to see priority breakdown</div>
                  ) : (
                    <div className="space-y-3">
                      {priorityDist.map(({ priority, total, done }) => {
                        const pc = PRIORITY_CONFIG[priority]
                        return (
                          <div key={priority}>
                            <div className="flex justify-between font-nunito text-xs mb-1.5">
                              <span style={{ color: pc.color }}>{pc.label}</span>
                              <span style={{ color: MUTED }}>{done}/{total} done</span>
                            </div>
                            <NProgress pct={total ? (done / total) * 100 : 0} accent={pc.color} track={pc.bar} height={4} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {overdueCount > 0 && (
                <div className="font-nunito text-sm" style={{ color: '#DC2626' }}>
                  {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}. Head to the Tasks tab to catch up.
                </div>
              )}
            </div>
          )}

          {/* PET TAB */}
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
              {gameTab === 'clicker' && <TaskTap onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <TaskRush onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <PriorityPuzzle onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            <Character
              type="todo"
              xp={data.character.xp}
              happiness={data.character.happiness}
              prestige={data.character.prestige}
              onEvolution={s => showToast(`Evolved to ${s.name}!`)}
              onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`)}
            />
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Complete high-priority tasks for 25 XP each. Finish every task for a +30 bonus.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
