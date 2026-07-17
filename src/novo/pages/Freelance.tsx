import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFreelanceData,
  addClient as dbAddClient,
  deleteClient as dbDeleteClient,
  addProject as dbAddProject,
  updateProjectStatus as dbUpdateProjectStatus,
  deleteProject as dbDeleteProject,
  addWorkLog as dbAddWorkLog,
  deleteWorkLog as dbDeleteWorkLog,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { FREELANCE_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import InboxZero from '../games/InboxZero'
import GigJuggler from '../games/GigJuggler'
import ScheduleFit from '../games/ScheduleFit'
import type { FreelanceData, RateType } from '../types'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'projects' | 'earnings' | 'pet' | 'games'

const ACCENT = '#0284C7'
const GOOD_COLOR = '#16A34A'
const WORK_LOG_XP_CAP = 5

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 86400000)
}

export default function Freelance() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<FreelanceData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [clientForm, setClientForm] = useState({ name: '', contact: '' })
  const [projectForm, setProjectForm] = useState({ clientId: '', name: '', deadline: '', rateType: 'fixed' as RateType, rate: '' })
  const [logForm, setLogForm] = useState({ projectId: '', hours: '', amount: '', note: '' })
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getFreelanceData(userId).then(setData)
    getStreak(userId, 'freelance').then(setStreak)
    getBadges(userId, 'freelance').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'freelance', data.character).then(c => {
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
  const month = todayStr().slice(0, 7)
  const monthEarnings = data.workLogs.filter(w => w.date.startsWith(month)).reduce((s, w) => s + w.amount, 0)
  const activeProjects = data.projects.filter(p => p.status === 'active')
  const nextDeadline = activeProjects
    .filter(p => p.deadline && daysUntil(p.deadline) >= 0)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))[0]

  const petStage = getStageFromXP(FREELANCE_STAGES, data.character.xp)

  const clientById = (id: string) => data.clients.find(c => c.id === id)
  const projectById = (id: string) => data.projects.find(p => p.id === id)

  const earningsByClient = data.clients
    .map(c => ({
      client: c,
      total: data.workLogs
        .filter(w => projectById(w.projectId)?.clientId === c.id)
        .reduce((s, w) => s + w.amount, 0),
    }))
    .filter(e => e.total > 0)
    .sort((a, b) => b.total - a.total)
  const maxClientEarnings = Math.max(...earningsByClient.map(e => e.total), 1)

  const applyXP = (xpGain: number, patch: Partial<FreelanceData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'freelance', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddClient = async () => {
    if (!clientForm.name) return
    try {
      const client = await dbAddClient(userId, clientForm)
      applyXP(5, { clients: [...data.clients, client] })
      setClientForm({ name: '', contact: '' })
      showToast('+5 XP, client added!')
    } catch {
      showToast('Failed to add client', false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    setData(d => d ? {
      ...d,
      clients: d.clients.filter(c => c.id !== id),
      projects: d.projects.filter(p => p.clientId !== id),
    } : d)
    await dbDeleteClient(id)
  }

  const handleAddProject = async () => {
    if (!projectForm.clientId || !projectForm.name) return
    try {
      const project = await dbAddProject(userId, {
        clientId: projectForm.clientId,
        name: projectForm.name,
        deadline: projectForm.deadline || undefined,
        rateType: projectForm.rateType,
        rate: Math.abs(Number(projectForm.rate)) || 0,
      })
      applyXP(5, { projects: [...data.projects, project] })
      setProjectForm({ clientId: '', name: '', deadline: '', rateType: 'fixed', rate: '' })
      showToast('+5 XP, project added!')
    } catch {
      showToast('Failed to add project', false)
    }
  }

  const handleToggleProjectDone = async (id: string) => {
    const project = projectById(id)
    if (!project) return
    const newStatus = project.status === 'active' ? 'done' : 'active'
    const nextProjects = data.projects.map(p => p.id === id ? { ...p, status: newStatus } : p) as typeof data.projects
    try {
      await dbUpdateProjectStatus(id, newStatus)
      if (newStatus === 'done') {
        const late = !!project.deadline && project.deadline < todayStr()
        applyXP(late ? 10 : 30, { projects: nextProjects })
        showToast(late ? '+10 XP. Shipped, but past the deadline' : '+30 XP, project shipped!')
      } else {
        applyXP(-30, { projects: nextProjects })
        showToast('−30 XP, project reopened', false)
      }
    } catch {
      showToast('Failed to update project', false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    const project = projectById(id)
    const abandoned = project?.status === 'active' && data.workLogs.some(w => w.projectId === id)
    if (abandoned) {
      applyXP(-10, {
        projects: data.projects.filter(p => p.id !== id),
        workLogs: data.workLogs.filter(w => w.projectId !== id),
      })
      showToast('−10 XP, active project abandoned', false)
    } else {
      setData(d => d ? {
        ...d,
        projects: d.projects.filter(p => p.id !== id),
        workLogs: d.workLogs.filter(w => w.projectId !== id),
      } : d)
    }
    await dbDeleteProject(id)
  }

  const handleAddWorkLog = async () => {
    if (!logForm.projectId) return
    const project = projectById(logForm.projectId)
    const hours = logForm.hours ? Math.abs(Number(logForm.hours)) : undefined
    let amount = logForm.amount ? Math.abs(Number(logForm.amount)) : 0
    if (!amount && hours && project?.rateType === 'hourly') amount = hours * project.rate
    if (!amount) return

    const todayLogs = data.workLogs.filter(w => w.date === todayStr()).length
    const firstToday = todayLogs === 0
    const xpGain = (todayLogs < WORK_LOG_XP_CAP ? 10 : 0) + (firstToday ? 15 : 0)
    try {
      const log = await dbAddWorkLog(userId, {
        projectId: logForm.projectId, hours, amount, note: logForm.note, date: todayStr(),
      })
      if (xpGain > 0) {
        applyXP(xpGain, { workLogs: [log, ...data.workLogs] })
        showToast(firstToday ? `+${xpGain} XP, first log today!` : `+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, workLogs: [log, ...d.workLogs] } : d)
        showToast('Logged. Daily XP cap reached')
      }
      setLogForm(f => ({ ...f, hours: '', amount: '', note: '' }))
    } catch {
      showToast('Failed to log work', false)
    }
  }

  const handleDeleteWorkLog = async (id: string) => {
    setData(d => d ? { ...d, workLogs: d.workLogs.filter(w => w.id !== id) } : d)
    await dbDeleteWorkLog(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const recentLogs = data.workLogs.slice(0, 3)

  const petCard = (
    <Character
      type="freelance"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: '#FFFFFF', color: INK }

  const logsToday = data.workLogs.filter(l => l.date === todayStr())
  const dailyChallenges = [
    { id: 'log1', title: 'Log work once', emoji: '💼', xp: 15, met: logsToday.length >= 1 },
    { id: 'log2', title: 'Log work twice', emoji: '🚀', xp: 25, met: logsToday.length >= 2 },
    { id: 'hours2', title: 'Log 2+ hours', emoji: '⏰', xp: 20, met: logsToday.reduce((sum, l) => sum + (l.hours ?? 0), 0) >= 2 },
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
          Freelance Hub <StreakBadge streak={streak} />
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
              { label: 'This month', value: formatRp(monthEarnings), color: GOOD_COLOR },
              { label: 'Active projects', value: String(activeProjects.length), color: ACCENT },
              { label: 'Clients', value: String(data.clients.length), color: INK },
              { label: 'Next deadline', value: nextDeadline ? `${daysUntil(nextDeadline.deadline!)}d` : '—', color: nextDeadline && daysUntil(nextDeadline.deadline!) <= 3 ? '#DC2626' : INK },
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

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <>
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-8">
              {activeProjects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Active projects</div>
                    <button onClick={() => setMainTab('projects')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      Manage
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {activeProjects.map(p => {
                      const days = p.deadline ? daysUntil(p.deadline) : null
                      const urgent = days !== null && days <= 3
                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{p.name}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>
                              {clientById(p.clientId)?.name ?? 'No client'} · {p.rateType === 'hourly' ? `${formatRp(p.rate)}/h` : formatRp(p.rate)}
                            </div>
                          </div>
                          {days !== null && (
                            <span className="font-nunito text-xs flex-shrink-0" style={{ color: urgent ? '#DC2626' : ACCENT }}>
                              {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recentLogs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Recent work</div>
                    <button onClick={() => setMainTab('earnings')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      See all
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recentLogs.map(w => (
                      <div key={w.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm truncate" style={{ color: INK }}>
                            {projectById(w.projectId)?.name ?? 'Unknown'}{w.note ? ` · ${w.note}` : ''}
                          </div>
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{w.date}{w.hours ? ` · ${w.hours}h` : ''}</div>
                        </div>
                        <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: GOOD_COLOR }}>+{formatRp(w.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.clients.length === 0 && (
              <div className="py-10 text-center">
                <div className="font-nunito text-sm" style={{ color: INK }}>Welcome to your hub</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add your first client in the Projects tab to get rolling</div>
              </div>
            )}
            </>
          )}

          {/* ── PROJECTS ─────────────────────────────────────── */}
          {mainTab === 'projects' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <Panel tone="tint" accent={ACCENT} className="p-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Client name" value={clientForm.name}
                    onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Contact (optional)" value={clientForm.contact}
                    onChange={e => setClientForm(f => ({ ...f, contact: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                  <NButton onClick={handleAddClient} disabled={!clientForm.name} accent={ACCENT}>Add</NButton>
                </div>
              </Panel>

              {data.clients.length > 0 && (
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={projectForm.clientId}
                      onChange={e => setProjectForm(f => ({ ...f, clientId: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    >
                      <option value="">Client…</option>
                      {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input
                      type="text" placeholder="Project name" value={projectForm.name}
                      onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={projectForm.deadline}
                      onChange={e => setProjectForm(f => ({ ...f, deadline: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                    <div className="flex gap-2">
                      <select
                        value={projectForm.rateType}
                        onChange={e => setProjectForm(f => ({ ...f, rateType: e.target.value as RateType }))}
                        className="px-2 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      >
                        <option value="fixed">Fixed</option>
                        <option value="hourly">Hourly</option>
                      </select>
                      <input
                        type="number" placeholder={projectForm.rateType === 'hourly' ? 'Rp/hour' : 'Price (Rp)'}
                        value={projectForm.rate}
                        onChange={e => setProjectForm(f => ({ ...f, rate: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <NButton onClick={handleAddProject} disabled={!projectForm.clientId || !projectForm.name} accent={ACCENT} className="w-full">
                    Create project
                  </NButton>
                </Panel>
              )}
            </div>

            <div>
              {data.projects.map((p, i) => {
                const done = p.status === 'done'
                return (
                  <div key={p.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                    <button
                      onClick={() => handleToggleProjectDone(p.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors"
                      style={{ background: done ? GOOD_COLOR : `${INK}08`, color: done ? '#fff' : 'inherit' }}
                    >
                      {done ? '✓' : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-nunito font-medium text-sm truncate" style={{ color: INK, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}>{p.name}</div>
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>
                        {clientById(p.clientId)?.name ?? 'No client'} · {p.rateType === 'hourly' ? `${formatRp(p.rate)}/h` : formatRp(p.rate)}
                        {p.deadline ? ` · due ${p.deadline}` : ''}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProject(p.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                  </div>
                )
              })}

              {data.clients.length > 0 && (
                <div className="mt-6">
                  <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Clients</div>
                  <div className="space-y-2">
                    {data.clients.map(c => (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-nunito text-sm" style={{ color: INK }}>{c.name}</span>
                          {c.contact && <span className="font-nunito text-xs ml-2" style={{ color: MUTED }}>{c.contact}</span>}
                        </div>
                        <span className="font-nunito text-xs flex-shrink-0" style={{ color: MUTED }}>
                          {data.projects.filter(p => p.clientId === c.id).length} projects
                        </span>
                        <button onClick={() => handleDeleteClient(c.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* ── EARNINGS ─────────────────────────────────────── */}
          {mainTab === 'earnings' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <Panel tone="tint" accent={ACCENT} className="p-4">
                {activeProjects.length === 0 ? (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>Add an active project first in the Projects tab.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={logForm.projectId}
                        onChange={e => setLogForm(f => ({ ...f, projectId: e.target.value }))}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none col-span-3 md:col-span-1"
                        style={inputStyle}
                      >
                        <option value="">Project…</option>
                        {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input
                        type="number" placeholder="Hours (opt.)" value={logForm.hours}
                        onChange={e => setLogForm(f => ({ ...f, hours: e.target.value }))}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="number" placeholder="Earned (Rp)" value={logForm.amount}
                        onChange={e => setLogForm(f => ({ ...f, amount: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddWorkLog()}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Note (optional)" value={logForm.note}
                        onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddWorkLog()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <NButton onClick={handleAddWorkLog} disabled={!logForm.projectId || (!logForm.amount && !logForm.hours)} accent={ACCENT}>Log</NButton>
                    </div>
                    <div className="font-nunito text-xs mt-2" style={{ color: MUTED }}>
                      Hourly project + hours means the amount is auto-calculated from the rate.
                    </div>
                  </>
                )}
              </Panel>

              {earningsByClient.length > 0 && (
                <div className="mt-6">
                  <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Earnings by client</div>
                  <div className="space-y-3">
                    {earningsByClient.map(({ client, total }) => (
                      <div key={client.id}>
                        <div className="flex justify-between font-nunito text-xs mb-1.5">
                          <span style={{ color: INK }}>{client.name}</span>
                          <span style={{ color: MUTED }}>{formatRp(total)}</span>
                        </div>
                        <NProgress pct={(total / maxClientEarnings) * 100} accent={ACCENT} height={4} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {data.workLogs.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-medium text-sm truncate" style={{ color: INK }}>
                      {projectById(w.projectId)?.name ?? 'Unknown'}{w.note ? ` · ${w.note}` : ''}
                    </div>
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>{w.date}{w.hours ? ` · ${w.hours}h` : ''}</div>
                  </div>
                  <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: GOOD_COLOR }}>+{formatRp(w.amount)}</span>
                  <button onClick={() => handleDeleteWorkLog(w.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                </div>
              ))}

              {data.workLogs.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No work logged yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Log your first session above, every log feeds your pet</div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="freelance" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="freelance"
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
              {gameTab === 'clicker' && <InboxZero onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <GigJuggler onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <ScheduleFit onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {nextDeadline && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Next deadline</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{nextDeadline.name}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{nextDeadline.deadline} · {daysUntil(nextDeadline.deadline!)} days left</div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Work logs earn +10 XP, up to 5 per day, the day's first log adds +15, and shipping a project earns +30.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
