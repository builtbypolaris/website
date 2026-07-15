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
import InboxZero from '../games/InboxZero'
import GigJuggler from '../games/GigJuggler'
import ScheduleFit from '../games/ScheduleFit'
import type { FreelanceData, RateType } from '../types'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'projects' | 'earnings' | 'pet' | 'games'

const ACCENT = '#0284C7'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const GOOD_COLOR = '#16A34A'

const WORK_LOG_XP_CAP = 5  // XP-earning work logs per day

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

  // Idle-day happiness decay — guarded to once per tracker per day
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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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
      showToast('+5 XP — client added!')
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
      showToast('+5 XP — project added!')
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
        showToast(late ? '+10 XP — shipped, but past the deadline' : '+30 XP — project shipped! 🚀')
      } else {
        // Re-opening takes back the ship reward (anti-farming)
        applyXP(-30, { projects: nextProjects })
        showToast('−30 XP — project reopened', false)
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
      showToast('−10 XP — active project abandoned', false)
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
    // Hourly project + hours but no amount → derive it from the rate
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
        showToast(firstToday ? `+${xpGain} XP (first log today!)` : `+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, workLogs: [log, ...d.workLogs] } : d)
        showToast('Logged! (daily XP cap reached)')
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
    showToast(`${title} — +${xp} XP!`)
  }

  const recentLogs = data.workLogs.slice(0, 3)

  const petCard = (
    <Character
      type="freelance"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }

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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">💼 Freelance Hub <StreakBadge streak={streak} /></div>
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
              { label: 'This month', value: formatRp(monthEarnings), color: GOOD_COLOR },
              { label: 'Active projects', value: String(activeProjects.length), color: ACCENT },
              { label: 'Clients', value: String(data.clients.length), color: '#09090F' },
              { label: 'Next deadline', value: nextDeadline ? `${daysUntil(nextDeadline.deadline!)}d` : '—', color: nextDeadline && daysUntil(nextDeadline.deadline!) <= 3 ? '#DC2626' : '#09090F' },
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
              { key: 'overview', label: '📊 Overview' },
              { key: 'projects', label: '📁 Projects' },
              { key: 'earnings', label: '💵 Earnings' },
              { key: 'pet', label: '🐾 Pet' },
              { key: 'games',    label: '🎮 Games' },
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

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-4">

              {activeProjects.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Active Projects</div>
                    <button onClick={() => setMainTab('projects')} className="text-xs font-nunito transition hover:opacity-70" style={{ color: ACCENT }}>
                      Manage →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {activeProjects.map(p => {
                      const days = p.deadline ? daysUntil(p.deadline) : null
                      const urgent = days !== null && days <= 3
                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{p.name}</div>
                            <div className="text-xs text-[#09090F]/40 font-nunito">
                              {clientById(p.clientId)?.name ?? '—'} · {p.rateType === 'hourly' ? `${formatRp(p.rate)}/h` : formatRp(p.rate)}
                            </div>
                          </div>
                          {days !== null && (
                            <span
                              className="font-nunito font-bold text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                              style={urgent
                                ? { background: '#FEE2E2', color: '#DC2626' }
                                : { background: ACCENT + '15', color: ACCENT }}
                            >
                              {days < 0 ? 'Overdue!' : days === 0 ? 'Due today!' : `${days}d left`}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recentLogs.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Recent Work</div>
                    <button onClick={() => setMainTab('earnings')} className="text-xs font-nunito transition hover:opacity-70" style={{ color: ACCENT }}>
                      See all →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recentLogs.map(w => (
                      <div key={w.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm text-[#09090F] truncate">
                            {projectById(w.projectId)?.name ?? 'Unknown'}{w.note ? ` · ${w.note}` : ''}
                          </div>
                          <div className="text-xs text-[#09090F]/40 font-nunito">{w.date}{w.hours ? ` · ${w.hours}h` : ''}</div>
                        </div>
                        <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: GOOD_COLOR }}>
                          +{formatRp(w.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.clients.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">💼</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Welcome to your hub</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add your first client in the Projects tab to get rolling</div>
                </div>
              )}
            </div>
          )}

          {/* ── PROJECTS ─────────────────────────────────────── */}
          {mainTab === 'projects' && (
            <div className="space-y-4">

              {/* Add client */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>New Client</div>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Client name" value={clientForm.name}
                    onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Contact (optional)" value={clientForm.contact}
                    onChange={e => setClientForm(f => ({ ...f, contact: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddClient()}
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <button
                    onClick={handleAddClient}
                    disabled={!clientForm.name}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Add project */}
              {data.clients.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>New Project</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={projectForm.clientId}
                      onChange={e => setProjectForm(f => ({ ...f, clientId: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    >
                      <option value="">Client…</option>
                      {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input
                      type="text" placeholder="Project name" value={projectForm.name}
                      onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={projectForm.deadline}
                      onChange={e => setProjectForm(f => ({ ...f, deadline: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                    <div className="flex gap-2">
                      <select
                        value={projectForm.rateType}
                        onChange={e => setProjectForm(f => ({ ...f, rateType: e.target.value as RateType }))}
                        className="px-2 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
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
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddProject}
                    disabled={!projectForm.clientId || !projectForm.name}
                    className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Create Project
                  </button>
                </div>
              )}

              {/* Project list */}
              {data.projects.map(p => {
                const done = p.status === 'done'
                return (
                  <div key={p.id} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: CARD_BG, border: `3px solid ${done ? GOOD_COLOR + '60' : CARD_BORDER}` }}>
                    <button
                      onClick={() => handleToggleProjectDone(p.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 transition"
                      style={done
                        ? { background: GOOD_COLOR, color: '#fff' }
                        : { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                    >
                      {done ? '✓' : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`font-nunito font-semibold text-sm truncate ${done ? 'line-through text-[#09090F]/40' : 'text-[#09090F]'}`}>{p.name}</div>
                      <div className="text-xs text-[#09090F]/50 font-nunito">
                        {clientById(p.clientId)?.name ?? '—'} · {p.rateType === 'hourly' ? `${formatRp(p.rate)}/h` : formatRp(p.rate)}
                        {p.deadline ? ` · due ${p.deadline}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

              {/* Client list */}
              {data.clients.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Clients</div>
                  <div className="space-y-2">
                    {data.clients.map(c => (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-nunito font-semibold text-sm text-[#09090F]">{c.name}</span>
                          {c.contact && <span className="font-nunito text-xs text-[#09090F]/40 ml-2">{c.contact}</span>}
                        </div>
                        <span className="font-nunito text-xs text-[#09090F]/40 flex-shrink-0">
                          {data.projects.filter(p => p.clientId === c.id).length} projects
                        </span>
                        <button
                          onClick={() => handleDeleteClient(c.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EARNINGS ─────────────────────────────────────── */}
          {mainTab === 'earnings' && (
            <div className="space-y-4">

              {/* Log work */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Log Work</div>
                {activeProjects.length === 0 ? (
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add an active project first in the Projects tab.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={logForm.projectId}
                        onChange={e => setLogForm(f => ({ ...f, projectId: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none col-span-3 md:col-span-1"
                        style={inputStyle}
                      >
                        <option value="">Project…</option>
                        {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input
                        type="number" placeholder="Hours (opt.)" value={logForm.hours}
                        onChange={e => setLogForm(f => ({ ...f, hours: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <input
                        type="number" placeholder="Earned (Rp)" value={logForm.amount}
                        onChange={e => setLogForm(f => ({ ...f, amount: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddWorkLog()}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Note (optional)" value={logForm.note}
                        onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddWorkLog()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddWorkLog}
                        disabled={!logForm.projectId || (!logForm.amount && !logForm.hours)}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                      >
                        Log
                      </button>
                    </div>
                    <div className="text-xs text-[#09090F]/30 font-nunito mt-2">
                      Hourly project + hours = amount auto-calculated from the rate.
                    </div>
                  </>
                )}
              </div>

              {/* Per-client earnings */}
              {earningsByClient.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Earnings by Client</div>
                  <div className="space-y-3">
                    {earningsByClient.map(({ client, total }) => (
                      <div key={client.id}>
                        <div className="flex justify-between text-xs font-nunito mb-1.5">
                          <span className="font-semibold text-[#09090F]">{client.name}</span>
                          <span className="text-[#09090F]/60">{formatRp(total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(total / maxClientEarnings) * 100}%`, background: ACCENT + '99' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log list */}
              {data.workLogs.map(w => (
                <div key={w.id} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">
                      {projectById(w.projectId)?.name ?? 'Unknown'}{w.note ? ` · ${w.note}` : ''}
                    </div>
                    <div className="text-xs text-[#09090F]/50 font-nunito">{w.date}{w.hours ? ` · ${w.hours}h` : ''}</div>
                  </div>
                  <span className="font-nunito font-bold text-sm flex-shrink-0" style={{ color: GOOD_COLOR }}>+{formatRp(w.amount)}</span>
                  <button
                    onClick={() => handleDeleteWorkLog(w.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {data.workLogs.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">💵</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No work logged yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Log your first session above — every log feeds your pet!</div>
                </div>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
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
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Freelance Pet</span>
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
              {gameTab === 'clicker' && <InboxZero onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <GigJuggler onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <ScheduleFit onXPEarned={handleXPEarned} />}
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
            {nextDeadline && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Next Deadline</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{nextDeadline.name}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">
                  {nextDeadline.deadline} · {daysUntil(nextDeadline.deadline!)} days left
                </div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#E0F2FE', border: '1px solid #BAE6FD' }}>
              <strong className="text-sky-700">Pet tip:</strong>{' '}
              <span className="text-sky-800">Work logs earn +10 XP (first 5 per day), the day's first log +15 bonus, and shipping a project +30!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
