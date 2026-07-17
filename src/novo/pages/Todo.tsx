import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addTask as dbAddTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  addSubtask as dbAddSubtask,
  toggleSubtask as dbToggleSubtask,
  deleteSubtask as dbDeleteSubtask,
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
import type { CharacterState, TodoData, Task, Priority, TaskStatus, Recurrence, Subtask } from '../types'

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

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
]

function fmtTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Todo() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<TodoData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('tasks')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [taskView, setTaskView] = useState<'list' | 'board'>('list')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDue, setNewDue] = useState('')
  const [newRecurrence, setNewRecurrence] = useState<Recurrence>('none')
  const [toast, setToast] = useState('')
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [somedayOpen, setSomedayOpen] = useState(false)
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null)
  const [focusSeconds, setFocusSeconds] = useState(0)
  const [focusRunning, setFocusRunning] = useState(false)
  const focusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { celebrate, layer } = useCelebrations()

  // Focus mode timer tick — same pattern as Study tracker's session timer
  useEffect(() => {
    if (focusRunning) {
      focusTimerRef.current = setInterval(() => setFocusSeconds(s => s + 1), 1000)
    }
    return () => { if (focusTimerRef.current) clearInterval(focusTimerRef.current) }
  }, [focusRunning])

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
      // Repeating tasks need a start date to advance from — default to today
      // rather than silently failing to repeat if the field was left blank.
      const dueDate = newDue || (newRecurrence !== 'none' ? todayStr() : undefined)
      const task = await dbAddTask(userId, {
        title: newTitle.trim(),
        completed: false,
        priority: newPriority,
        recurrence: newRecurrence,
        dueDate,
      })
      setData(d => d ? { ...d, tasks: [task, ...d.tasks] } : d)
      setNewTitle('')
      setNewDue('')
      setNewRecurrence('none')
    } catch {
      showToast('Failed to add task')
    }
  }

  // statusOverride lets the board's drag-and-drop land a task in a specific
  // column (e.g. dropped straight onto "In progress") instead of the default
  // todo/done swap the plain checkbox uses.
  const handleToggleTask = async (id: string, statusOverride?: TaskStatus) => {
    if (!data) return
    const task = data.tasks.find(t => t.id === id)
    if (!task) return

    const nowCompleted = !task.completed
    const completedAt = nowCompleted ? todayStr() : undefined
    const nextStatus: TaskStatus = statusOverride ?? (nowCompleted ? 'done' : 'todo')

    let xpTotal = 0
    let nextDue: string | null = null
    if (nowCompleted) {
      const overdue = !!(task.dueDate && task.dueDate < todayStr())
      const xp = overdue ? 5 : PRIORITY_XP[task.priority]
      xpTotal = xp

      // Completing a repeating task creates the next occurrence right away —
      // visible in the toast, never a silent background respawn.
      if (task.recurrence !== 'none') {
        const base = task.dueDate ? new Date(`${task.dueDate}T00:00:00`) : new Date()
        base.setDate(base.getDate() + (task.recurrence === 'daily' ? 1 : 7))
        nextDue = base.toISOString().split('T')[0]
      }
      const recurSuffix = nextDue
        ? ` Next one: ${nextDue === todayStr() ? 'today' : task.recurrence === 'daily' ? 'tomorrow' : nextDue}.`
        : ''

      const wouldAllDone = data.tasks.every(t => t.id === id || t.completed)
      if (wouldAllDone && data.tasks.length >= 3) {
        xpTotal += 30
        showToast(`+${xp} XP! +30 all-done bonus!${recurSuffix}`)
      } else {
        showToast((overdue ? `+${xp} XP. It was overdue, finish on time for more!` : `+${xp} XP!`) + recurSuffix)
      }
    }

    const before = data.character
    setData(d => d ? {
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: nowCompleted, completedAt, status: nextStatus } : t),
      character: nowCompleted ? addXP(before, xpTotal) : d.character,
    } : d)

    await dbUpdateTask(id, { completed: nowCompleted, completedAt: completedAt ?? null, status: nextStatus })
    if (nowCompleted) runAward(before, xpTotal)

    if (nowCompleted && nextDue) {
      try {
        const nextTask = await dbAddTask(userId, {
          title: task.title,
          completed: false,
          priority: task.priority,
          recurrence: task.recurrence,
          dueDate: nextDue,
        })
        const clones: Subtask[] = []
        for (let i = 0; i < task.subtasks.length; i++) {
          clones.push(await dbAddSubtask(nextTask.id, userId, task.subtasks[i].title, i))
        }
        setData(d => d ? { ...d, tasks: [{ ...nextTask, subtasks: clones }, ...d.tasks] } : d)
      } catch {
        // Next occurrence failed to create — not fatal, the completed task itself already saved fine.
      }
    }
  }

  // Board drag-and-drop: only crosses into/out of Done through the exact same
  // logic as the checkbox above, so dragging and ticking always earn identically.
  // A pure To do <-> In progress move is organizational only — no XP, no toast.
  const handleDropOnColumn = async (status: TaskStatus, taskId: string) => {
    if (!data) return
    const task = data.tasks.find(t => t.id === taskId)
    if (!task || task.status === status) return

    if (status === 'done' || task.status === 'done') {
      await handleToggleTask(taskId, status)
      return
    }
    setData(d => d ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, status } : t) } : d)
    await dbUpdateTask(taskId, { status })
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

  // Subtasks are organizational only — no XP, no toast, matches the
  // "config action, not judged" precedent from Financial's budgets.
  const handleAddSubtask = async (taskId: string) => {
    if (!data || !subtaskInput.trim()) return
    const task = data.tasks.find(t => t.id === taskId)
    if (!task) return
    try {
      const sub = await dbAddSubtask(taskId, userId, subtaskInput.trim(), task.subtasks.length)
      setData(d => d ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t) } : d)
      setSubtaskInput('')
    } catch {
      showToast('Failed to add step')
    }
  }

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!data) return
    const task = data.tasks.find(t => t.id === taskId)
    const sub = task?.subtasks.find(s => s.id === subtaskId)
    if (!sub) return
    const completed = !sub.completed
    setData(d => d ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed } : s) } : t) } : d)
    await dbToggleSubtask(subtaskId, completed)
  }

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    setData(d => d ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } : t) } : d)
    await dbDeleteSubtask(subtaskId)
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
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekFromNowStr = weekFromNow.toISOString().split('T')[0]
  const isDueThisWeek = (t: Task) => !!t.dueDate && !t.completed && t.dueDate > todayStr() && t.dueDate <= weekFromNowStr

  const priorityRank = { high: 0, medium: 1, low: 2 } as const
  const dueToday = data.tasks.filter(isDueToday).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
  const dueThisWeek = data.tasks.filter(isDueThisWeek).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  // Someday: active tasks with no due date at all. They live in their own
  // section instead of the main list so undated, no-rush items don't crowd
  // out things that actually have a deadline.
  const isSomeday = (t: Task) => !t.completed && !t.dueDate
  const someday = data.tasks.filter(isSomeday)

  const filtered = data.tasks.filter(t => {
    if (filter === 'done') return t.completed
    if (isSomeday(t)) return false
    if (filter === 'active') return !t.completed
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  const overdueCount = data.tasks.filter(isOverdue).length

  const renderAddTaskForm = () => (
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
        <select
          value={newRecurrence}
          onChange={e => setNewRecurrence(e.target.value as Recurrence)}
          className="flex-1 min-w-[130px] px-3 py-2 rounded-xl font-nunito text-sm outline-none"
          style={{ background: '#FFFFFF', color: INK }}
        >
          <option value="none">Repeats: Never</option>
          <option value="daily">Repeats: Daily</option>
          <option value="weekly">Repeats: Weekly</option>
        </select>
        <NButton onClick={handleAddTask} disabled={!newTitle.trim()} accent={ACCENT}>Add</NButton>
      </div>
      {newRecurrence !== 'none' && (
        <div className="font-nunito text-xs mt-2" style={{ color: MUTED }}>
          Repeating tasks need a start date — defaults to today if left blank.
        </div>
      )}
    </Panel>
  )

  const renderTask = (task: Task, i: number) => {
    const pc = PRIORITY_CONFIG[task.priority]
    const overdue = isOverdue(task)
    const dueT = isDueToday(task)
    const doneSubtasks = task.subtasks.filter(s => s.completed).length
    const expanded = expandedTaskId === task.id
    return (
      <div key={task.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
        <div className="flex items-start gap-3 py-3" style={{ opacity: task.completed ? 0.5 : 1 }}>
          <button
            onClick={() => handleToggleTask(task.id)}
            className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: task.completed ? ACCENT : 'transparent', borderColor: task.completed ? ACCENT : '#C5E8D0' }}
          >
            {task.completed && <span className="text-white text-xs">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setExpandedTaskId(expanded ? null : task.id)}
              className="font-nunito font-medium text-sm text-left"
              style={{ color: INK, textDecoration: task.completed ? 'line-through' : 'none' }}
            >
              {task.title}
            </button>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap font-nunito text-xs">
              <span style={{ color: pc.color }}>{pc.label}</span>
              {task.dueDate && (
                <span style={{ color: overdue ? '#DC2626' : dueT ? ACCENT : MUTED }}>
                  {overdue ? 'Overdue' : dueT ? 'Today' : task.dueDate}
                </span>
              )}
              {task.recurrence !== 'none' && (
                <span style={{ color: MUTED }}>Repeats {task.recurrence}</span>
              )}
              {task.subtasks.length > 0 && (
                <span style={{ color: MUTED }}>{doneSubtasks}/{task.subtasks.length} steps</span>
              )}
            </div>
          </div>
          {!task.completed && (
            <button onClick={() => setFocusTaskId(task.id)} className="font-nunito text-xs flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
              Focus
            </button>
          )}
          <button onClick={() => handleDeleteTask(task.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
        </div>
        {expanded && (
          <div className="pl-8 pb-3">
            {task.subtasks.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1">
                <button
                  onClick={() => handleToggleSubtask(task.id, s.id)}
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ background: s.completed ? ACCENT : 'transparent', borderColor: s.completed ? ACCENT : '#C5E8D0' }}
                >
                  {s.completed && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
                </button>
                <span className="font-nunito text-xs flex-1" style={{ color: INK, textDecoration: s.completed ? 'line-through' : 'none' }}>{s.title}</span>
                <button onClick={() => handleDeleteSubtask(task.id, s.id)} className="text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
              </div>
            ))}
            <div className="flex gap-2 mt-1.5">
              <input
                type="text"
                placeholder="Add a step"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask(task.id)}
                className="flex-1 px-2.5 py-1.5 rounded-lg font-nunito text-xs outline-none"
                style={{ background: '#F0EEE8', color: INK }}
              />
              <button onClick={() => handleAddSubtask(task.id)} className="font-nunito text-xs px-2 flex-shrink-0" style={{ color: ACCENT }}>Add</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCard = (task: Task) => {
    const pc = PRIORITY_CONFIG[task.priority]
    const overdue = isOverdue(task)
    const dueT = isDueToday(task)
    const doneSubtasks = task.subtasks.filter(s => s.completed).length
    return (
      <div
        key={task.id}
        draggable
        onDragStart={() => setDraggedId(task.id)}
        onDragEnd={() => setDraggedId(null)}
        className="cursor-grab active:cursor-grabbing"
        style={{ opacity: draggedId === task.id ? 0.4 : 1 }}
      >
        <Panel tone="tint" accent={pc.color} className="p-3 mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-nunito font-medium text-sm" style={{ color: INK }}>{task.title}</div>
            <button onClick={() => handleDeleteTask(task.id)} className="text-xs flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap font-nunito text-xs">
            <span style={{ color: pc.color }}>{pc.label}</span>
            {task.dueDate && (
              <span style={{ color: overdue ? '#DC2626' : dueT ? ACCENT : MUTED }}>
                {overdue ? 'Overdue' : dueT ? 'Today' : task.dueDate}
              </span>
            )}
            {task.recurrence !== 'none' && <span style={{ color: MUTED }}>Repeats {task.recurrence}</span>}
            {task.subtasks.length > 0 && <span style={{ color: MUTED }}>{doneSubtasks}/{task.subtasks.length} steps</span>}
          </div>
          {task.status !== 'done' && (
            <button onClick={() => setFocusTaskId(task.id)} className="font-nunito text-xs mt-2 transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
              Focus
            </button>
          )}
        </Panel>
      </div>
    )
  }

  const focusTask = focusTaskId ? data.tasks.find(t => t.id === focusTaskId) ?? null : null

  const closeFocus = () => {
    setFocusTaskId(null)
    setFocusRunning(false)
    setFocusSeconds(0)
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

      {/* FOCUS MODE — one task, the timer, mark done. Same XP as anywhere else. */}
      {focusTask && (
        <div className="fixed inset-0 flex items-center justify-center p-5" style={{ zIndex: 9990, background: 'rgba(20,18,27,0.85)' }}>
          <div className="bounce-in rounded-3xl p-8 max-w-sm w-full text-center" style={{ background: '#FAF9F6' }}>
            <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>Focusing on</div>
            <div className="font-nunito font-semibold text-lg mb-6" style={{ color: INK }}>{focusTask.title}</div>
            <div className="font-nunito font-bold mb-6" style={{ color: ACCENT, fontSize: 56 }}>{fmtTimer(focusSeconds)}</div>

            {focusTask.subtasks.length > 0 && (
              <div className="text-left mb-6">
                {focusTask.subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <button
                      onClick={() => handleToggleSubtask(focusTask.id, s.id)}
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ background: s.completed ? ACCENT : 'transparent', borderColor: s.completed ? ACCENT : '#C5E8D0' }}
                    >
                      {s.completed && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
                    </button>
                    <span className="font-nunito text-xs" style={{ color: INK, textDecoration: s.completed ? 'line-through' : 'none' }}>{s.title}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-3">
              {focusRunning ? (
                <NButton onClick={() => setFocusRunning(false)} variant="ghost" accent={ACCENT} className="flex-1">Pause</NButton>
              ) : (
                <NButton onClick={() => setFocusRunning(true)} variant="ghost" accent={ACCENT} className="flex-1">{focusSeconds > 0 ? 'Resume' : 'Start'}</NButton>
              )}
              <NButton
                onClick={() => { handleToggleTask(focusTask.id); closeFocus() }}
                accent={ACCENT}
                className="flex-1"
              >
                Mark done
              </NButton>
            </div>
            <button onClick={closeFocus} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>
              Close
            </button>
          </div>
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
            <div className="max-w-6xl">
              {/* List / Board toggle */}
              <div className="flex gap-2 mb-6">
                {(['list', 'board'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setTaskView(v)}
                    className="px-4 py-2 rounded-full font-nunito text-sm font-semibold transition-all"
                    style={taskView === v
                      ? { background: ACCENT, color: '#FFFFFF', boxShadow: `0 3px 10px ${ACCENT}50` }
                      : { background: `${INK}08`, color: MUTED }}
                  >
                    {v === 'list' ? 'List' : 'Board'}
                  </button>
                ))}
              </div>

              {taskView === 'list' ? (
                <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
                  {/* Add task form */}
                  <div>
                    {renderAddTaskForm()}
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

                    {/* Due this week pinned section */}
                    {dueThisWeek.length > 0 && (
                      <div className="mb-4">
                        <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>
                          Due this week ({dueThisWeek.length})
                        </div>
                        {dueThisWeek.map((t, i) => renderTask(t, i))}
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

                    {/* Someday — undated, no-rush tasks, collapsed by default */}
                    {someday.length > 0 && filter !== 'done' && (
                      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                        <button
                          onClick={() => setSomedayOpen(o => !o)}
                          className="font-nunito text-sm font-semibold transition-opacity hover:opacity-70"
                          style={{ color: MUTED }}
                        >
                          {somedayOpen ? `Hide someday (${someday.length})` : `Someday (${someday.length}) — no due date`}
                        </button>
                        {somedayOpen && <div className="mt-2">{someday.map((t, i) => renderTask(t, i))}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Add task form — same form, same place, regardless of view */}
                  <div className="max-w-xl mb-6">
                    {renderAddTaskForm()}
                  </div>

                  {/* Board — drag a card to another column to move it */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {STATUS_COLUMNS.map(col => {
                      const colTasks = data.tasks
                        .filter(t => t.status === col.key)
                        .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
                      return (
                        <div
                          key={col.key}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => draggedId && handleDropOnColumn(col.key, draggedId)}
                          className="rounded-2xl p-3 min-h-[120px]"
                          style={{ background: `${INK}05` }}
                        >
                          <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>
                            {col.label} ({colTasks.length})
                          </div>
                          {colTasks.map(renderCard)}
                          {colTasks.length === 0 && (
                            <div className="font-nunito text-xs py-4 text-center" style={{ color: MUTED }}>
                              {col.key === 'todo' ? 'Nothing here' : 'Drag a task here'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
