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
import { INK, MUTED, Panel, NButton, NProgress, StableLabel } from '../components/ui'
import TaskTap from '../games/TaskTap'
import TaskRush from '../games/TaskRush'
import PriorityPuzzle from '../games/PriorityPuzzle'
import type { CharacterState, TodoData, Task, Priority, TaskStatus, Recurrence, Subtask } from '../types'
import { TODO_T, RECURRENCE_WORD, PRIORITY_WORD, MONTH_NAMES, DAY_NAMES, type Lang, type TodoDict } from './Todo.i18n'

const ACCENT = '#16A34A'
const BAR_MAX_H = 80
const LANG_KEY = 'novo-lang'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'tasks' | 'projects' | 'calendar' | 'analytics' | 'pet' | 'games'
type FilterTab = 'all' | 'active' | 'done'

const MAIN_TAB_KEYS: MainTab[] = ['overview', 'tasks', 'projects', 'calendar', 'analytics', 'pet', 'games']
const STATUS_COLUMN_KEYS: TaskStatus[] = ['todo', 'in_progress', 'done']

const PRIORITY_COLOR: Record<Priority, { color: string; bar: string }> = {
  high:   { color: '#DC2626', bar: '#FEE2E2' },
  medium: { color: '#B45309', bar: '#FEF3C7' },
  low:    { color: '#2563EB', bar: '#DBEAFE' },
}
const PRIORITY_XP: Record<Priority, number> = { high: 25, medium: 15, low: 10 }

function fmtTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function TourCoachmark({ step, steps, targetEl, tr, onNext, onSkip }: {
  step: number
  steps: { tab: MainTab; text: string }[]
  targetEl: HTMLButtonElement | null
  tr: TodoDict
  onNext: () => void
  onSkip: () => void
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const place = () => {
      if (!targetEl) return
      const r = targetEl.getBoundingClientRect()
      setPos({ top: r.bottom + 10, left: r.left + r.width / 2 })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [targetEl, step])

  if (!pos) return null
  const last = step === steps.length - 1

  return (
    <div className="fixed bounce-in" style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9990, width: 260 }}>
      <Panel tone="fill" accent={ACCENT} className="p-4">
        <div className="font-nunito text-xs text-white/70 mb-1.5">{step + 1} / {steps.length}</div>
        <div className="font-nunito text-sm text-white leading-relaxed mb-3">{steps[step].text}</div>
        <div className="flex items-center justify-between">
          <button onClick={onSkip} className="font-nunito text-xs text-white/60 hover:text-white/90 transition-colors">
            {tr.tourSkip}
          </button>
          <NButton onClick={onNext} style={{ background: '#FFFFFF', color: ACCENT }} size="sm">
            {last ? tr.tourDone : tr.tourNext}
          </NButton>
        </div>
      </Panel>
    </div>
  )
}

export default function Todo() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<TodoData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [taskView, setTaskView] = useState<'list' | 'board'>('list')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDue, setNewDue] = useState('')
  const [newRecurrence, setNewRecurrence] = useState<Recurrence>('none')
  const [newProject, setNewProject] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [calendarCursor, setCalendarCursor] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [calendarQuickTitle, setCalendarQuickTitle] = useState('')
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
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'en')
  const [tourStep, setTourStep] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { celebrate, layer } = useCelebrations()

  const tr = TODO_T[lang]
  const changeLang = (l: Lang) => { localStorage.setItem(LANG_KEY, l); setLang(l) }

  const tabLabelKey = (key: MainTab): keyof TodoDict => ({
    overview: 'tabOverview', tasks: 'tabTasks', projects: 'tabProjects', calendar: 'tabCalendar', analytics: 'tabAnalytics', pet: 'tabPet', games: 'tabGames',
  } as const)[key]
  const MAIN_TABS = MAIN_TAB_KEYS.map(key => ({ key, label: tr[tabLabelKey(key)] as string, enLabel: TODO_T.en[tabLabelKey(key)] as string, idLabel: TODO_T.id[tabLabelKey(key)] as string }))
  const STATUS_COLUMNS = STATUS_COLUMN_KEYS.map(key => ({
    key,
    label: { todo: tr.colTodo, in_progress: tr.colInProgress, done: tr.colDone }[key],
  }))
  const priorityConfig = (p: Priority) => ({ label: PRIORITY_WORD[lang][p], ...PRIORITY_COLOR[p] })
  const MONTH_LABELS = MONTH_NAMES[lang]
  const DAY_LABELS = DAY_NAMES[lang]

  const TOUR_STEPS: { tab: MainTab; text: string }[] = [
    { tab: 'overview', text: tr.tourOverview },
    { tab: 'tasks', text: tr.tourTasks },
    { tab: 'projects', text: tr.tourProjects },
    { tab: 'calendar', text: tr.tourCalendar },
    { tab: 'analytics', text: tr.tourAnalytics },
    { tab: 'pet', text: tr.tourPet },
    { tab: 'games', text: tr.tourGames },
  ]
  const introKey = (uid: string) => `novo-intro-todo-seen-${uid}`

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
    if (!localStorage.getItem(introKey(userId))) setTourStep(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (tourStep === null) return
    setMainTab(TOUR_STEPS[tourStep].tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep])

  const endTour = () => {
    localStorage.setItem(introKey(userId), '1')
    setTourStep(null)
  }
  const advanceTour = () => {
    if (tourStep === null) return
    if (tourStep >= TOUR_STEPS.length - 1) endTour()
    else setTourStep(tourStep + 1)
  }
  const handleTabClick = (key: MainTab) => {
    setMainTab(key)
    if (tourStep !== null) endTour()
  }

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
        <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.loading}</div>
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
        project: newProject.trim() || undefined,
        dueDate,
      })
      setData(d => d ? { ...d, tasks: [task, ...d.tasks] } : d)
      setNewTitle('')
      setNewDue('')
      setNewRecurrence('none')
      setNewProject('')
    } catch {
      showToast(tr.failedToAddTask)
    }
  }

  const handleCalendarQuickAdd = async (dateStr: string) => {
    if (!calendarQuickTitle.trim()) return
    try {
      const task = await dbAddTask(userId, {
        title: calendarQuickTitle.trim(),
        completed: false,
        priority: 'medium',
        recurrence: 'none',
        dueDate: dateStr,
      })
      setData(d => d ? { ...d, tasks: [task, ...d.tasks] } : d)
      setCalendarQuickTitle('')
    } catch {
      showToast(tr.failedToAddTask)
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
        ? tr.recurSuffix(nextDue === todayStr() ? tr.wordToday : task.recurrence === 'daily' ? tr.wordTomorrow : nextDue)
        : ''

      const wouldAllDone = data.tasks.every(t => t.id === id || t.completed)
      if (wouldAllDone && data.tasks.length >= 3) {
        xpTotal += 30
        showToast(tr.allDoneBonus(xp, recurSuffix))
      } else {
        showToast((overdue ? tr.overdueToast(xp) : tr.normalToast(xp)) + recurSuffix)
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
          project: task.project,
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
      showToast(tr.taskAbandoned)
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
      showToast(tr.failedToAddStep)
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
    showToast(tr.xpFromGame(xp))
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(tr.challengeClaimed(title, xp))
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

  // Overview: what's coming up right after today (not today, not overdue — those already have their own sections).
  const nextUp = data.tasks
    .filter(t => !t.completed && !!t.dueDate && t.dueDate! > todayStr())
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 3)

  // Projects: derived from whatever's already on tasks — no separate managed entity.
  const knownProjects = Array.from(new Set(data.tasks.map(t => t.project).filter((p): p is string => !!p))).sort()
  const projectStats = knownProjects.map(name => {
    const tasks = data.tasks.filter(t => t.project === name)
    return { name, total: tasks.length, done: tasks.filter(t => t.completed).length }
  })
  const unsortedTasks = data.tasks.filter(t => !t.project)
  const projectTaskSort = (a: Task, b: Task) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return priorityRank[a.priority] - priorityRank[b.priority]
  }
  const projectTasks = selectedProject === '__unsorted__'
    ? [...unsortedTasks].sort(projectTaskSort)
    : selectedProject
      ? data.tasks.filter(t => t.project === selectedProject).sort(projectTaskSort)
      : []

  // Calendar: a plain month grid, no library.
  const calendarMonthStart = new Date(calendarCursor.year, calendarCursor.month, 1)
  const daysInMonth = new Date(calendarCursor.year, calendarCursor.month + 1, 0).getDate()
  const leadingBlanks = calendarMonthStart.getDay()
  const calendarDateStr = (day: number) => {
    const mm = String(calendarCursor.month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${calendarCursor.year}-${mm}-${dd}`
  }
  const tasksOnDay = (dateStr: string) => data.tasks.filter(t => t.dueDate === dateStr)
  const selectedDayTasks = selectedDay ? tasksOnDay(selectedDay) : []
  const goToMonth = (delta: number) => {
    setSelectedDay(null)
    setCalendarCursor(c => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const renderAddTaskForm = () => (
    <Panel tone="tint" accent={ACCENT} className="p-4">
      <input
        type="text"
        placeholder={tr.formTitlePlaceholder}
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
        className="w-full rounded-xl px-3 py-2.5 font-nunito text-sm outline-none mb-2"
        style={{ background: '#FFFFFF', color: INK }}
      />
      <input
        type="text"
        list="todo-known-projects"
        placeholder={tr.formProjectPlaceholder}
        value={newProject}
        onChange={e => setNewProject(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
        className="w-full rounded-xl px-3 py-2.5 font-nunito text-sm outline-none mb-2"
        style={{ background: '#FFFFFF', color: INK }}
      />
      <datalist id="todo-known-projects">
        {knownProjects.map(p => <option key={p} value={p} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as Priority)}
          className="px-3 py-2 rounded-xl font-nunito text-sm outline-none"
          style={{ background: '#FFFFFF', color: INK }}
        >
          <option value="high">{tr.priorityHighOpt}</option>
          <option value="medium">{tr.priorityMediumOpt}</option>
          <option value="low">{tr.priorityLowOpt}</option>
        </select>
        <input
          type="date"
          value={newDue}
          onChange={e => setNewDue(e.target.value)}
          className="px-3 py-2 rounded-xl font-nunito text-sm outline-none"
          style={{ background: '#FFFFFF', color: INK }}
        />
        <select
          value={newRecurrence}
          onChange={e => setNewRecurrence(e.target.value as Recurrence)}
          className="px-3 py-2 rounded-xl font-nunito text-sm outline-none"
          style={{ background: '#FFFFFF', color: INK }}
        >
          <option value="none">{tr.repeatsNever}</option>
          <option value="daily">{tr.repeatsDaily}</option>
          <option value="weekly">{tr.repeatsWeekly}</option>
        </select>
        <NButton onClick={handleAddTask} disabled={!newTitle.trim()} accent={ACCENT}>{tr.add}</NButton>
      </div>
      {newRecurrence !== 'none' && (
        <div className="font-nunito text-xs mt-2" style={{ color: MUTED }}>
          {tr.repeatsCaption}
        </div>
      )}
    </Panel>
  )

  const renderTask = (task: Task, i: number) => {
    const pc = priorityConfig(task.priority)
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
                  {overdue ? tr.overdue : dueT ? tr.today : task.dueDate}
                </span>
              )}
              {task.recurrence !== 'none' && (
                <span style={{ color: MUTED }}>{tr.repeats(RECURRENCE_WORD[lang][task.recurrence])}</span>
              )}
              {task.subtasks.length > 0 && (
                <span style={{ color: MUTED }}>{tr.steps(doneSubtasks, task.subtasks.length)}</span>
              )}
              {task.project && (
                <span style={{ color: MUTED }}>{task.project}</span>
              )}
            </div>
          </div>
          {!task.completed && (
            <button onClick={() => setFocusTaskId(task.id)} className="font-nunito text-xs flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
              {tr.focus}
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
                placeholder={tr.addAStep}
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask(task.id)}
                className="flex-1 px-2.5 py-1.5 rounded-lg font-nunito text-xs outline-none"
                style={{ background: '#F0EEE8', color: INK }}
              />
              <button onClick={() => handleAddSubtask(task.id)} className="font-nunito text-xs px-2 flex-shrink-0" style={{ color: ACCENT }}>{tr.add}</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCard = (task: Task) => {
    const pc = priorityConfig(task.priority)
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
                {overdue ? tr.overdue : dueT ? tr.today : task.dueDate}
              </span>
            )}
            {task.recurrence !== 'none' && <span style={{ color: MUTED }}>{tr.repeats(RECURRENCE_WORD[lang][task.recurrence])}</span>}
            {task.subtasks.length > 0 && <span style={{ color: MUTED }}>{tr.steps(doneSubtasks, task.subtasks.length)}</span>}
            {task.project && <span style={{ color: MUTED }}>{task.project}</span>}
          </div>
          {task.status !== 'done' && (
            <button onClick={() => setFocusTaskId(task.id)} className="font-nunito text-xs mt-2 transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
              {tr.focus}
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
    { id: 'done1', title: tr.challengeCompleteATask, emoji: '✅', xp: 10, met: doneToday.length >= 1 },
    { id: 'done3', title: tr.challengeComplete3Tasks, emoji: '🔥', xp: 25, met: doneToday.length >= 3 },
    { id: 'high', title: tr.challengeFinishHighPriority, emoji: '⚡', xp: 20, met: doneToday.some(t => t.priority === 'high') },
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
            <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>{tr.focusingOn}</div>
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
                <NButton onClick={() => setFocusRunning(false)} variant="ghost" accent={ACCENT} className="flex-1">{tr.pause}</NButton>
              ) : (
                <NButton onClick={() => setFocusRunning(true)} variant="ghost" accent={ACCENT} className="flex-1">{focusSeconds > 0 ? tr.resume : tr.start}</NButton>
              )}
              <NButton
                onClick={() => { handleToggleTask(focusTask.id); closeFocus() }}
                accent={ACCENT}
                className="flex-1"
              >
                {tr.markDone}
              </NButton>
            </div>
            <button onClick={closeFocus} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>
              {tr.close}
            </button>
          </div>
        </div>
      )}

      {tourStep !== null && (
        <TourCoachmark step={tourStep} steps={TOUR_STEPS} targetEl={tabRefs.current[tourStep] ?? null} tr={tr} onNext={advanceTour} onSkip={endTour} />
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-30 gap-3"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: MUTED }}>
          <StableLabel a={TODO_T.en.back} b={TODO_T.id.back} active={lang === 'en' ? 'a' : 'b'} />
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2 flex-shrink-0" style={{ color: INK }}>
          {tr.headerTitle} <StreakBadge streak={streak} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setTourStep(0)} className="hidden md:block font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>
            <StableLabel a={TODO_T.en.howThisWorks} b={TODO_T.id.howThisWorks} active={lang === 'en' ? 'a' : 'b'} />
          </button>
          <div className="flex rounded-full overflow-hidden" style={{ background: `${INK}08` }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="px-2.5 py-1 font-nunito text-xs font-semibold transition-colors"
                style={lang === l ? { background: ACCENT, color: '#FFFFFF' } : { color: MUTED }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">
            <Character type="todo" xp={data.character.xp} happiness={data.character.happiness} onEvolution={s => showToast(tr.evolved(s.name))} />
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { key: 'total', en: TODO_T.en.metricTotal, id: TODO_T.id.metricTotal, value: String(totalTasks), color: INK },
              { key: 'active', en: TODO_T.en.metricActive, id: TODO_T.id.metricActive, value: String(activeTasks), color: '#B45309' },
              { key: 'done', en: TODO_T.en.metricDone, id: TODO_T.id.metricDone, value: String(doneTasks), color: ACCENT },
            ].map(m => (
              <div key={m.key}>
                <div className="font-nunito font-bold text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                  <StableLabel a={m.en} b={m.id} active={lang === 'en' ? 'a' : 'b'} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap mb-6 gap-x-5 gap-y-2" style={{ borderBottom: `1px solid ${INK}12` }}>
            {MAIN_TABS.map((t, i) => {
              const isTourTarget = tourStep !== null && TOUR_STEPS[tourStep].tab === t.key
              return (
                <button
                  key={t.key}
                  ref={el => { tabRefs.current[i] = el }}
                  onClick={() => handleTabClick(t.key)}
                  className="pb-2.5 font-nunito text-sm transition-colors"
                  style={{
                    color: mainTab === t.key ? INK : MUTED,
                    fontWeight: mainTab === t.key ? 600 : 400,
                    borderBottom: mainTab === t.key ? `2px solid ${ACCENT}` : isTourTarget ? `2px solid ${ACCENT}80` : '2px solid transparent',
                  }}
                >
                  <StableLabel a={t.enLabel} b={t.idLabel} active={lang === 'en' ? 'a' : 'b'} />
                </button>
              )
            })}
          </div>

          {/* OVERVIEW TAB — the landing view: what's due, quick add, what's next */}
          {mainTab === 'overview' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-6">
                {(overdueCount > 0 || dueToday.length > 0) && (
                  <div className="space-y-1">
                    {overdueCount > 0 && (
                      <div className="font-nunito text-xs" style={{ color: '#DC2626' }}>
                        {tr.overdueTasksLine(overdueCount)}
                      </div>
                    )}
                  </div>
                )}
                {renderAddTaskForm()}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>
                    {tr.dueToday(dueToday.length)}
                  </div>
                  {dueToday.length > 0 ? (
                    dueToday.map((t, i) => renderTask(t, i))
                  ) : (
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.nothingDueToday}</div>
                  )}
                </div>

                {nextUp.length > 0 && (
                  <div>
                    <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.nextUp}</div>
                    {nextUp.map((t, i) => renderTask(t, i))}
                  </div>
                )}

                {dueToday.length === 0 && nextUp.length === 0 && overdueCount === 0 && (
                  <div className="font-nunito text-sm" style={{ color: MUTED }}>
                    {tr.nothingOnHorizon}
                  </div>
                )}
              </div>
            </div>
          )}

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
                    <StableLabel
                      a={v === 'list' ? TODO_T.en.viewList : TODO_T.en.viewBoard}
                      b={v === 'list' ? TODO_T.id.viewList : TODO_T.id.viewBoard}
                      active={lang === 'en' ? 'a' : 'b'}
                    />
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
                          {tr.dueToday(dueToday.length)}
                        </div>
                        {dueToday.map((t, i) => renderTask(t, i))}
                      </div>
                    )}

                    {/* Due this week pinned section */}
                    {dueThisWeek.length > 0 && (
                      <div className="mb-4">
                        <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>
                          {tr.dueThisWeek(dueThisWeek.length)}
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
                          {f === 'all' ? tr.filterAll(totalTasks) : f === 'active' ? tr.filterActive(activeTasks) : tr.filterDone(doneTasks)}
                        </button>
                      ))}
                    </div>

                    {filtered.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="font-nunito text-sm" style={{ color: INK }}>
                          {filter === 'done' ? tr.nothingCompletedYet : totalTasks === 0 ? tr.noTasksYet : tr.allClear}
                        </div>
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                          {filter === 'done' ? tr.completeATaskToSeeItHere : totalTasks === 0 ? tr.addFirstTask : tr.allActiveTasksDone}
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
                          {somedayOpen ? tr.hideSomeday(someday.length) : tr.someday(someday.length)}
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
                              {col.key === 'todo' ? tr.nothingHere : tr.dragTaskHere}
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

          {/* PROJECTS TAB — group tasks by whatever "Project" was typed on the add form */}
          {mainTab === 'projects' && (
            <div className="max-w-5xl">
              {knownProjects.length === 0 && unsortedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noTasksYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.addTaskToGetStarted}</div>
                </div>
              ) : knownProjects.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noProjectsYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                    {tr.typeProjectHint}
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.projectsHeading}</div>
                    <div className="space-y-4">
                      {projectStats.map(p => {
                        const pct = p.total ? (p.done / p.total) * 100 : 0
                        const active = selectedProject === p.name
                        return (
                          <div key={p.name} onClick={() => setSelectedProject(active ? null : p.name)} className="cursor-pointer">
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <span className="font-nunito text-sm" style={{ color: active ? ACCENT : INK, fontWeight: active ? 600 : 400 }}>{p.name}</span>
                              <span className="font-nunito text-xs" style={{ color: MUTED }}>{tr.doneOfTotal(p.done, p.total)}</span>
                            </div>
                            <NProgress pct={pct} accent={ACCENT} height={4} />
                          </div>
                        )
                      })}
                    </div>
                    {unsortedTasks.length > 0 && (
                      <button
                        onClick={() => setSelectedProject(selectedProject === '__unsorted__' ? null : '__unsorted__')}
                        className="font-nunito text-xs mt-5 pt-4 block w-full text-left transition-opacity hover:opacity-70"
                        style={{ color: selectedProject === '__unsorted__' ? ACCENT : MUTED, borderTop: `1px solid ${INK}0D` }}
                      >
                        {tr.unsorted(unsortedTasks.length)}
                      </button>
                    )}
                  </div>

                  <div>
                    {selectedProject ? (
                      <>
                        <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>
                          {selectedProject === '__unsorted__' ? tr.unsortedHeading : selectedProject}
                        </div>
                        {projectTasks.length > 0 ? (
                          <div>{projectTasks.map((t, i) => renderTask(t, i))}</div>
                        ) : (
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.nothingHere}</div>
                        )}
                      </>
                    ) : (
                      <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.clickProjectHint}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CALENDAR TAB — plain month grid, no library */}
          {mainTab === 'calendar' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => goToMonth(-1)} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>{tr.prev}</button>
                <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>
                  {MONTH_LABELS[calendarCursor.month]} {calendarCursor.year}
                </div>
                <button onClick={() => goToMonth(1)} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>{tr.next}</button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="font-nunito text-xs text-center py-1" style={{ color: MUTED }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-6">
                {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = calendarDateStr(day)
                  const dayTasks = tasksOnDay(dateStr)
                  const isToday = dateStr === todayStr()
                  const isSelected = dateStr === selectedDay
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className="rounded-xl p-2 text-left transition-colors"
                      style={{
                        background: isSelected ? ACCENT : isToday ? `${ACCENT}14` : 'transparent',
                        minHeight: 52,
                      }}
                    >
                      <div className="font-nunito text-xs" style={{ color: isSelected ? '#FFFFFF' : INK, fontWeight: isToday ? 700 : 400 }}>
                        {day}
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="font-nunito text-[10px] mt-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : MUTED }}>
                          {tr.taskCount(dayTasks.length)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedDay && (
                <div>
                  <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>
                    {selectedDay}
                  </div>
                  {selectedDayTasks.length > 0 ? (
                    <div className="mb-3">{selectedDayTasks.map((t, i) => renderTask(t, i))}</div>
                  ) : (
                    <div className="font-nunito text-xs mb-3" style={{ color: MUTED }}>{tr.nothingDueThisDay}</div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={tr.calendarQuickAddPlaceholder}
                      value={calendarQuickTitle}
                      onChange={e => setCalendarQuickTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCalendarQuickAdd(selectedDay)}
                      className="flex-1 px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: `${INK}05`, color: INK }}
                    />
                    <NButton onClick={() => handleCalendarQuickAdd(selectedDay)} disabled={!calendarQuickTitle.trim()} accent={ACCENT}>{tr.add}</NButton>
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
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.completionRate(doneTasks, totalTasks)}</div>
                </div>
                <div>
                  <div className="font-nunito font-bold text-2xl leading-none" style={{ color: INK }}>{activeTasks}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{activeTasks === 0 ? tr.allDone : tr.activeTasksRemaining}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.sevenDayCompletion}</div>
                  {dailyCompleted.every(d => d.count === 0) ? (
                    <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.completeTasksToSeeVelocity}</div>
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
                  <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.byPriority}</div>
                  {priorityDist.length === 0 ? (
                    <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.addTasksToSeePriorityBreakdown}</div>
                  ) : (
                    <div className="space-y-3">
                      {priorityDist.map(({ priority, total, done }) => {
                        const pc = priorityConfig(priority)
                        return (
                          <div key={priority}>
                            <div className="flex justify-between font-nunito text-xs mb-1.5">
                              <span style={{ color: pc.color }}>{pc.label}</span>
                              <span style={{ color: MUTED }}>{tr.doneOfTotal(done, total)}</span>
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
                  {tr.overdueCta(overdueCount)}
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
                    <StableLabel
                      a={g === 'clicker' ? TODO_T.en.gameClicker : g === 'arcade' ? TODO_T.en.gameArcade : TODO_T.en.gamePuzzle}
                      b={g === 'clicker' ? TODO_T.id.gameClicker : g === 'arcade' ? TODO_T.id.gameArcade : TODO_T.id.gamePuzzle}
                      active={lang === 'en' ? 'a' : 'b'}
                    />
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
              onEvolution={s => showToast(tr.evolved(s.name))}
              onPrestige={p => showToast(tr.prestige(p))}
            />
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              {tr.sidebarTip}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
