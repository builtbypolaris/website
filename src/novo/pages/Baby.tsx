import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getBabyData,
  addBaby as dbAddBaby,
  deleteBaby as dbDeleteBaby,
  addBabyEvent as dbAddEvent,
  deleteBabyEvent as dbDeleteEvent,
  addGrowthEntry as dbAddGrowth,
  deleteGrowthEntry as dbDeleteGrowth,
  addMilestone as dbAddMilestone,
  deleteMilestone as dbDeleteMilestone,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { BABY_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton } from '../components/ui'
import LullabyKeys from '../games/LullabyKeys'
import BubbleBath from '../games/BubbleBath'
import BlockStacker from '../games/BlockStacker'
import type { BabyData, BabyEvent, BabyEventType } from '../types'

const BABY_EMOJIS = ['👶', '🍼', '🧸', '🐣', '🌟', '🦄']
const EVENT_META: { key: BabyEventType; emoji: string; label: string }[] = [
  { key: 'feeding',     emoji: '🍼', label: 'Feed' },
  { key: 'sleep_start', emoji: '😴', label: 'Sleep' },
  { key: 'sleep_end',   emoji: '⏰', label: 'Wake' },
  { key: 'diaper',      emoji: '🧷', label: 'Diaper' },
  { key: 'pumping',     emoji: '🤱', label: 'Pump' },
]

const EVENT_XP_CAP = 10

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'history' | 'growth' | 'pet' | 'games'

const ACCENT = '#A21CAF'
const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'history', label: 'History' },
  { key: 'growth', label: 'Growth' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function eventMeta(type: BabyEventType) { return EVENT_META.find(m => m.key === type)! }
function eventTime(e: BabyEvent) { return new Date(e.eventAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }

function babyAge(birthdate: string): string {
  const days = Math.floor((Date.now() - new Date(birthdate).getTime()) / 86400000)
  if (days < 0) return 'soon'
  if (days < 60) return `${days}d`
  if (days < 730) return `${Math.floor(days / 30.44)}mo`
  return `${Math.floor(days / 365.25)}y`
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ${mins % 60}m ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Baby() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<BabyData | null>(null)
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('today')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [babyForm, setBabyForm] = useState({ name: '', emoji: BABY_EMOJIS[0], birthdate: '' })
  const [showBabyForm, setShowBabyForm] = useState(false)
  const [eventNote, setEventNote] = useState('')
  const [growthForm, setGrowthForm] = useState({ weight: '', height: '' })
  const [milestoneForm, setMilestoneForm] = useState('')
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'baby').then(setStreak)
    getBadges(userId, 'baby').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getBabyData(userId).then(d => {
      setData(d)
      setSelectedBabyId(d.babies[0]?.id ?? null)
      if (d.babies.length === 0) setShowBabyForm(true)
    })
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'baby', data.character).then(c => {
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

  // ── Core stats (for the selected baby) ────────────────────
  const baby = data.babies.find(b => b.id === selectedBabyId) ?? null
  const babyEvents = baby ? data.events.filter(e => e.babyId === baby.id) : []
  const todayEvents = babyEvents.filter(e => e.eventAt.startsWith(today))
  const feedsToday = todayEvents.filter(e => e.eventType === 'feeding').length
  const diapersToday = todayEvents.filter(e => e.eventType === 'diaper').length

  const chronological = [...babyEvents].sort((a, b) => a.eventAt.localeCompare(b.eventAt))
  let sleepMs = 0
  let sleepStart: string | null = null
  for (const e of chronological) {
    if (e.eventType === 'sleep_start') sleepStart = e.eventAt
    if (e.eventType === 'sleep_end' && sleepStart) {
      if (sleepStart.startsWith(today) || e.eventAt.startsWith(today)) {
        sleepMs += new Date(e.eventAt).getTime() - new Date(sleepStart).getTime()
      }
      sleepStart = null
    }
  }
  const isAsleep = sleepStart !== null && chronological.length > 0 &&
    chronological[chronological.length - 1].eventType === 'sleep_start'

  const lastFeed = babyEvents.find(e => e.eventType === 'feeding')

  const babyGrowth = baby ? data.growth.filter(g => g.babyId === baby.id) : []
  const babyMilestones = baby ? data.milestones.filter(m => m.babyId === baby.id) : []

  const petStage = getStageFromXP(BABY_STAGES, data.character.xp)

  const applyXP = (xpGain: number, patch: Partial<BabyData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'baby', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddBaby = async () => {
    if (!babyForm.name || !babyForm.birthdate) return
    try {
      const newBaby = await dbAddBaby(userId, babyForm)
      setData(d => d ? { ...d, babies: [...d.babies, newBaby] } : d)
      setSelectedBabyId(newBaby.id)
      setBabyForm({ name: '', emoji: BABY_EMOJIS[0], birthdate: '' })
      setShowBabyForm(false)
      showToast(`Welcome, ${newBaby.name}!`)
    } catch {
      showToast('Failed to add baby', false)
    }
  }

  const handleDeleteBaby = async (id: string) => {
    setData(d => d ? {
      ...d,
      babies: d.babies.filter(b => b.id !== id),
      events: d.events.filter(e => e.babyId !== id),
      growth: d.growth.filter(g => g.babyId !== id),
      milestones: d.milestones.filter(m => m.babyId !== id),
    } : d)
    if (selectedBabyId === id) setSelectedBabyId(data.babies.find(b => b.id !== id)?.id ?? null)
    await dbDeleteBaby(id)
  }

  const handleLogEvent = async (type: BabyEventType) => {
    if (!baby) return
    const allTodayEvents = data.events.filter(e => e.eventAt.startsWith(today))
    const firstToday = allTodayEvents.length === 0
    const xpGain = (allTodayEvents.length < EVENT_XP_CAP ? 5 : 0) + (firstToday ? 5 : 0)
    try {
      const event = await dbAddEvent(userId, { babyId: baby.id, eventType: type, note: eventNote })
      if (xpGain > 0) {
        applyXP(xpGain, { events: [event, ...data.events] })
        showToast(`${eventMeta(type).emoji} +${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, events: [event, ...d.events] } : d)
        showToast(`${eventMeta(type).emoji} Logged. Daily XP cap reached`)
      }
      setEventNote('')
    } catch {
      showToast('Failed to log event', false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    setData(d => d ? { ...d, events: d.events.filter(e => e.id !== id) } : d)
    await dbDeleteEvent(id)
  }

  const handleAddGrowth = async () => {
    if (!baby) return
    const weightKg = growthForm.weight ? Math.abs(Number(growthForm.weight)) : undefined
    const heightCm = growthForm.height ? Math.abs(Number(growthForm.height)) : undefined
    if (!weightKg && !heightCm) return
    try {
      const entry = await dbAddGrowth(userId, { babyId: baby.id, date: today, weightKg, heightCm })
      applyXP(15, { growth: [...data.growth, entry] })
      setGrowthForm({ weight: '', height: '' })
      showToast('+15 XP, growing strong!')
    } catch {
      showToast('Failed to log growth', false)
    }
  }

  const handleDeleteGrowth = async (id: string) => {
    setData(d => d ? { ...d, growth: d.growth.filter(g => g.id !== id) } : d)
    await dbDeleteGrowth(id)
  }

  const handleAddMilestone = async () => {
    if (!baby || !milestoneForm) return
    try {
      const milestone = await dbAddMilestone(userId, { babyId: baby.id, title: milestoneForm, date: today })
      applyXP(25, { milestones: [milestone, ...data.milestones] })
      setMilestoneForm('')
      showToast('+25 XP, milestone unlocked!')
    } catch {
      showToast('Failed to add milestone', false)
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    setData(d => d ? { ...d, milestones: d.milestones.filter(m => m.id !== id) } : d)
    await dbDeleteMilestone(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const eventDays = [...new Set(babyEvents.map(e => e.eventAt.slice(0, 10)))].sort((a, b) => b.localeCompare(a)).slice(0, 14)

  const babySelector = data.babies.length > 0 && (
    <div className="flex gap-1.5 flex-wrap items-center">
      {data.babies.map(b => (
        <button
          key={b.id}
          onClick={() => setSelectedBabyId(b.id)}
          className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors flex items-center gap-1.5"
          style={selectedBabyId === b.id ? { background: ACCENT, color: '#FFFFFF' } : { background: `${INK}08`, color: MUTED }}
        >
          {b.emoji} {b.name} · {babyAge(b.birthdate)}
        </button>
      ))}
      <button onClick={() => setShowBabyForm(s => !s)} className="px-3 py-1.5 rounded-full font-nunito text-xs" style={{ color: MUTED }}>
        + Add
      </button>
    </div>
  )

  const petCard = (
    <Character
      type="baby"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: '#FFFFFF', color: INK }

  const babyEventsToday = data.events.filter(e => e.eventAt.startsWith(todayStr()))
  const dailyChallenges = [
    { id: 'ev3', title: 'Log 3 events', emoji: '🍼', xp: 15, met: babyEventsToday.length >= 3 },
    { id: 'feed', title: 'Log a feeding', emoji: '🥛', xp: 10, met: babyEventsToday.some(e => e.eventType === 'feeding') },
    { id: 'ev5', title: 'Log 5 events', emoji: '👶', xp: 25, met: babyEventsToday.length >= 5 },
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
          Baby <StreakBadge streak={streak} />
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
              { label: 'Feeds today', value: String(feedsToday), color: ACCENT },
              { label: 'Sleep today', value: `${(sleepMs / 3600000).toFixed(1)}h${isAsleep ? ', asleep' : ''}`, color: '#0284C7' },
              { label: 'Diapers today', value: String(diapersToday), color: '#D97706' },
              { label: 'Age', value: baby ? babyAge(baby.birthdate) : '—', color: INK },
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
            <div className="space-y-6 max-w-xl">

              {babySelector}

              {showBabyForm && (
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <div className="flex gap-1.5 mb-2">
                    {BABY_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setBabyForm(f => ({ ...f, emoji: e }))}
                        className="w-9 h-9 rounded-full text-lg transition-opacity"
                        style={{ opacity: babyForm.emoji === e ? 1 : 0.4 }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text" placeholder="Name" value={babyForm.name}
                      onChange={e => setBabyForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={babyForm.birthdate}
                      onChange={e => setBabyForm(f => ({ ...f, birthdate: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <NButton onClick={handleAddBaby} disabled={!babyForm.name || !babyForm.birthdate} accent={ACCENT} className="w-full">
                    Add baby
                  </NButton>
                </Panel>
              )}

              {baby && (
                <>
                  {lastFeed && (
                    <div className="font-nunito text-xs" style={{ color: ACCENT }}>
                      Last feed {timeAgo(lastFeed.eventAt)}{isAsleep && <> · {baby.name} is sleeping</>}
                    </div>
                  )}

                  <Panel tone="tint" accent={ACCENT} className="p-4 md:p-5">
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {EVENT_META.map(m => (
                        <button
                          key={m.key}
                          onClick={() => handleLogEvent(m.key)}
                          className="py-3 rounded-xl font-nunito text-xs transition-opacity hover:opacity-70 flex flex-col items-center gap-1"
                          style={{ background: '#FFFFFF', color: ACCENT }}
                        >
                          <span className="text-xl">{m.emoji}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text" placeholder="Note for the next log (optional)" value={eventNote}
                      onChange={e => setEventNote(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                  </Panel>

                  {todayEvents.length > 0 && (
                    <div>
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Today's timeline</div>
                      <div>
                        {todayEvents.map((e, i) => {
                          const m = eventMeta(e.eventType)
                          return (
                            <div key={e.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                              <span className="font-nunito text-xs font-medium w-11 flex-shrink-0" style={{ color: ACCENT }}>{eventTime(e)}</span>
                              <span className="text-base flex-shrink-0">{m.emoji}</span>
                              <span className="font-nunito text-sm flex-1 truncate" style={{ color: INK }}>{m.label}{e.note ? ` · ${e.note}` : ''}</span>
                              <button onClick={() => handleDeleteEvent(e.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── HISTORY ──────────────────────────────────────── */}
          {mainTab === 'history' && (
            <div className="max-w-xl">
              {!baby || eventDays.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No events yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Quick-log feeds, sleep and diapers in the Today tab</div>
                </div>
              ) : (
                eventDays.map(day => {
                  const events = babyEvents.filter(e => e.eventAt.startsWith(day))
                  return (
                    <div key={day} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{day === today ? 'Today' : day}</div>
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>
                          {events.filter(e => e.eventType === 'feeding').length} feeds · {events.filter(e => e.eventType === 'diaper').length} diapers
                        </span>
                      </div>
                      <div>
                        {events.map((e, i) => {
                          const m = eventMeta(e.eventType)
                          return (
                            <div key={e.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                              <span className="font-nunito text-xs font-medium w-11 flex-shrink-0" style={{ color: ACCENT }}>{eventTime(e)}</span>
                              <span className="text-base flex-shrink-0">{m.emoji}</span>
                              <span className="font-nunito text-sm flex-1 truncate" style={{ color: INK }}>{m.label}{e.note ? ` · ${e.note}` : ''}</span>
                              <button onClick={() => handleDeleteEvent(e.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── GROWTH ───────────────────────────────────────── */}
          {mainTab === 'growth' && (
            <div className="max-w-xl">
              {!baby ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>Add a baby first</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Head to the Today tab to add your little one</div>
                </div>
              ) : (
                <div className="space-y-8">
                  <Panel tone="tint" accent={ACCENT} className="p-4">
                    <div className="flex gap-2">
                      <input
                        type="number" step="0.01" placeholder="Weight (kg)" value={growthForm.weight}
                        onChange={e => setGrowthForm(f => ({ ...f, weight: e.target.value }))}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="number" step="0.1" placeholder="Height (cm)" value={growthForm.height}
                        onChange={e => setGrowthForm(f => ({ ...f, height: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddGrowth()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <NButton onClick={handleAddGrowth} disabled={!growthForm.weight && !growthForm.height} accent={ACCENT}>Log</NButton>
                    </div>
                  </Panel>

                  {babyGrowth.length > 0 && (
                    <div>
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Entries</div>
                      <div>
                        {[...babyGrowth].reverse().map((g, i) => (
                          <div key={g.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                            <span className="font-nunito text-sm flex-1" style={{ color: INK }}>{g.date}</span>
                            {g.weightKg != null && <span className="font-nunito font-medium text-sm" style={{ color: ACCENT }}>{g.weightKg} kg</span>}
                            {g.heightCm != null && <span className="font-nunito text-sm" style={{ color: MUTED }}>{g.heightCm} cm</span>}
                            <button onClick={() => handleDeleteGrowth(g.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Milestones</div>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text" placeholder="First smile, first steps…" value={milestoneForm}
                        onChange={e => setMilestoneForm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={{ background: '#F0EEE8', color: INK }}
                      />
                      <NButton onClick={handleAddMilestone} disabled={!milestoneForm} accent={ACCENT}>+25 XP</NButton>
                    </div>
                    <div>
                      {babyMilestones.map((m, i) => (
                        <div key={m.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{m.title}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>{m.date}</div>
                          </div>
                          <button onClick={() => handleDeleteMilestone(m.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                        </div>
                      ))}
                      {babyMilestones.length === 0 && (
                        <div className="font-nunito text-xs" style={{ color: MUTED }}>No milestones yet, every first counts</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="baby" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="baby"
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
              {gameTab === 'clicker' && <LullabyKeys onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <BubbleBath onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <BlockStacker onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {baby && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Little one</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{baby.emoji} {baby.name}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{babyAge(baby.birthdate)} old, born {baby.birthdate}</div>
                {data.babies.length > 1 && (
                  <button onClick={() => handleDeleteBaby(baby.id)} className="mt-2 font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>
                    Remove profile
                  </button>
                )}
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Events earn +5 XP, up to {EVENT_XP_CAP} a day, growth entries +15, and milestones +25.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
