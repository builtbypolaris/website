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
  saveBabyCharacter as dbSaveCharacter,
  addXP, todayStr,
} from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { BABY_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
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

const EVENT_XP_CAP = 10  // XP-earning events per day

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'history' | 'growth' | 'games'

const ACCENT = '#A21CAF'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E4E2'
const INPUT_BG = '#F0EEE8'

function eventMeta(type: BabyEventType) { return EVENT_META.find(m => m.key === type)! }
function eventTime(e: BabyEvent) { return new Date(e.eventAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }

function babyAge(birthdate: string): string {
  const days = Math.floor((Date.now() - new Date(birthdate).getTime()) / 86400000)
  if (days < 0) return 'soon!'
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

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getBabyData(userId).then(d => {
      setData(d)
      setSelectedBabyId(d.babies[0]?.id ?? null)
      if (d.babies.length === 0) setShowBabyForm(true)
    })
  }, [userId])

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

  // ── Core stats (for the selected baby) ────────────────────
  const baby = data.babies.find(b => b.id === selectedBabyId) ?? null
  const babyEvents = baby ? data.events.filter(e => e.babyId === baby.id) : []
  const todayEvents = babyEvents.filter(e => e.eventAt.startsWith(today))
  const feedsToday = todayEvents.filter(e => e.eventType === 'feeding').length
  const diapersToday = todayEvents.filter(e => e.eventType === 'diaper').length

  // Sleep today: paired sleep_start → sleep_end intervals touching today
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

  const applyXP = (xpGain: number, patch: Partial<BabyData>) => {
    const newCharacter = addXP(data.character, xpGain)
    setData(d => d ? { ...d, ...patch, character: newCharacter } : d)
    dbSaveCharacter(userId, newCharacter)
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
      showToast(`Welcome, ${newBaby.name}! 💕`)
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
        showToast(`${eventMeta(type).emoji} Logged! (daily XP cap reached)`)
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
      showToast('+15 XP — growing strong! 🌱')
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
      showToast('+25 XP — milestone unlocked! 🎉')
    } catch {
      showToast('Failed to add milestone', false)
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    setData(d => d ? { ...d, milestones: d.milestones.filter(m => m.id !== id) } : d)
    await dbDeleteMilestone(id)
  }

  const handleXPEarned = (xp: number) => {
    const newCharacter = addXP(data.character, xp)
    setData(d => d ? { ...d, character: newCharacter } : d)
    dbSaveCharacter(userId, newCharacter)
    showToast(`+${xp} XP from game!`)
  }

  // Events grouped by day for history
  const eventDays = [...new Set(babyEvents.map(e => e.eventAt.slice(0, 10)))].sort((a, b) => b.localeCompare(a)).slice(0, 14)

  const babySelector = data.babies.length > 0 && (
    <div className="flex gap-1.5 flex-wrap items-center">
      {data.babies.map(b => (
        <button
          key={b.id}
          onClick={() => setSelectedBabyId(b.id)}
          className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition flex items-center gap-1.5"
          style={selectedBabyId === b.id
            ? { background: ACCENT + '18', color: ACCENT, border: `1px solid ${ACCENT}` }
            : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `1px solid ${CARD_BORDER}` }}
        >
          {b.emoji} {b.name} · {babyAge(b.birthdate)}
        </button>
      ))}
      <button
        onClick={() => setShowBabyForm(s => !s)}
        className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition"
        style={{ background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `1px dashed ${CARD_BORDER}` }}
      >
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
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>

      {toast && (
        <div
          className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg font-nunito text-white text-sm bounce-in"
          style={{ background: toast.good ? '#16A34A' : '#DC2626' }}
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
        <div className="font-nunito font-bold text-[#09090F] text-sm md:text-base">👶 Baby Tracker</div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-nunito text-[#09090F]/50 bg-black/5 px-2.5 py-1.5 rounded-lg">
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-8" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            {petCard}
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Feeds today', value: `${feedsToday} 🍼`, color: ACCENT },
              { label: 'Sleep today', value: `${(sleepMs / 3600000).toFixed(1)}h${isAsleep ? ' 😴' : ''}`, color: '#0284C7' },
              { label: 'Diapers today', value: `${diapersToday} 🧷`, color: '#D97706' },
              { label: 'Age', value: baby ? babyAge(baby.birthdate) : '—', color: '#09090F' },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="font-nunito font-bold text-sm md:text-base mb-0.5 truncate" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-5 overflow-x-auto scrollbar-hidden" style={{ borderBottom: '1px solid #E5E4E2' }}>
            {([
              { key: 'today',   label: '🍼 Today' },
              { key: 'history', label: '📖 History' },
              { key: 'growth',  label: '🌱 Growth' },
              { key: 'games',   label: '🎮 Games' },
            ] as { key: MainTab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="px-3 md:px-4 py-2.5 font-nunito text-sm transition border-b-2 -mb-px whitespace-nowrap flex-shrink-0"
                style={{
                  borderBottomColor: mainTab === t.key ? ACCENT : 'transparent',
                  color: mainTab === t.key ? '#09090F' : 'rgba(9,9,15,0.4)',
                  fontWeight: mainTab === t.key ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TODAY ────────────────────────────────────────── */}
          {mainTab === 'today' && (
            <div className="space-y-4">

              {babySelector && (
                <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  {babySelector}
                </div>
              )}

              {/* Add baby form */}
              {showBabyForm && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                    {data.babies.length === 0 ? 'Add Your Little One' : 'Add Another Baby'}
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    {BABY_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setBabyForm(f => ({ ...f, emoji: e }))}
                        className="w-9 h-9 rounded-lg text-lg transition"
                        style={babyForm.emoji === e
                          ? { background: ACCENT + '20', border: `1px solid ${ACCENT}` }
                          : { background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text" placeholder="Name" value={babyForm.name}
                      onChange={e => setBabyForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={babyForm.birthdate}
                      onChange={e => setBabyForm(f => ({ ...f, birthdate: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={handleAddBaby}
                    disabled={!babyForm.name || !babyForm.birthdate}
                    className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT }}
                  >
                    Add Baby
                  </button>
                </div>
              )}

              {baby && (
                <>
                  {/* Last feed banner */}
                  {lastFeed && (
                    <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#FAE8FF', border: '1px solid #F0ABFC' }}>
                      <span className="text-xl">🍼</span>
                      <span className="font-nunito text-xs text-fuchsia-900">
                        Last feed <strong>{timeAgo(lastFeed.eventAt)}</strong>
                        {isAsleep && <> · {baby.name} is sleeping 😴</>}
                      </span>
                    </div>
                  )}

                  {/* Quick log */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      Quick Log — {baby.emoji} {baby.name}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {EVENT_META.map(m => (
                        <button
                          key={m.key}
                          onClick={() => handleLogEvent(m.key)}
                          className="py-3 rounded-xl font-nunito text-xs font-semibold transition active:scale-95 flex flex-col items-center gap-1"
                          style={{ background: ACCENT + '10', color: ACCENT, border: `1px solid ${ACCENT}30` }}
                        >
                          <span className="text-xl">{m.emoji}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text" placeholder="Note for the next log (optional)" value={eventNote}
                      onChange={e => setEventNote(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                      style={inputStyle}
                    />
                  </div>

                  {/* Today's timeline */}
                  {todayEvents.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                      <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Today's Timeline</div>
                      <div className="space-y-2">
                        {todayEvents.map(e => {
                          const m = eventMeta(e.eventType)
                          return (
                            <div key={e.id} className="flex items-center gap-3">
                              <span className="font-nunito text-xs font-bold w-11 flex-shrink-0" style={{ color: ACCENT }}>{eventTime(e)}</span>
                              <span className="text-lg flex-shrink-0">{m.emoji}</span>
                              <span className="font-nunito text-sm text-[#09090F] flex-1 truncate">{m.label}{e.note ? ` · ${e.note}` : ''}</span>
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                              >
                                ✕
                              </button>
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
            <div className="space-y-4">
              {!baby || eventDays.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">📖</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No events yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Quick-log feeds, sleep and diapers in the Today tab</div>
                </div>
              ) : (
                eventDays.map(day => {
                  const events = babyEvents.filter(e => e.eventAt.startsWith(day))
                  return (
                    <div key={day} className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                          {day === today ? 'Today' : day}
                        </div>
                        <span className="text-xs font-nunito text-[#09090F]/50">
                          🍼{events.filter(e => e.eventType === 'feeding').length} · 🧷{events.filter(e => e.eventType === 'diaper').length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {events.map(e => {
                          const m = eventMeta(e.eventType)
                          return (
                            <div key={e.id} className="flex items-center gap-3">
                              <span className="font-nunito text-xs font-bold w-11 flex-shrink-0" style={{ color: ACCENT }}>{eventTime(e)}</span>
                              <span className="text-base flex-shrink-0">{m.emoji}</span>
                              <span className="font-nunito text-sm text-[#09090F] flex-1 truncate">{m.label}{e.note ? ` · ${e.note}` : ''}</span>
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
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
                })
              )}
            </div>
          )}

          {/* ── GROWTH ───────────────────────────────────────── */}
          {mainTab === 'growth' && (
            <div className="space-y-4">
              {!baby ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">🌱</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Add a baby first</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Head to the Today tab to add your little one</div>
                </div>
              ) : (
                <>
                  {/* Log growth */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      Growth Entry — {baby.emoji} {baby.name}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" step="0.01" placeholder="Weight (kg)" value={growthForm.weight}
                        onChange={e => setGrowthForm(f => ({ ...f, weight: e.target.value }))}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <input
                        type="number" step="0.1" placeholder="Height (cm)" value={growthForm.height}
                        onChange={e => setGrowthForm(f => ({ ...f, height: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddGrowth()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddGrowth}
                        disabled={!growthForm.weight && !growthForm.height}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT }}
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {/* Growth entries */}
                  {babyGrowth.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                      <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Entries</div>
                      <div className="space-y-2">
                        {[...babyGrowth].reverse().map(g => (
                          <div key={g.id} className="flex items-center gap-3">
                            <span className="font-nunito text-sm text-[#09090F] flex-1">{g.date}</span>
                            {g.weightKg != null && <span className="font-nunito font-semibold text-sm" style={{ color: ACCENT }}>{g.weightKg} kg</span>}
                            {g.heightCm != null && <span className="font-nunito font-semibold text-sm text-[#09090F]/60">{g.heightCm} cm</span>}
                            <button
                              onClick={() => handleDeleteGrowth(g.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Milestones</div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text" placeholder="First smile, first steps…" value={milestoneForm}
                        onChange={e => setMilestoneForm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddMilestone}
                        disabled={!milestoneForm}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT }}
                      >
                        +25 XP
                      </button>
                    </div>
                    <div className="space-y-2">
                      {babyMilestones.map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <span className="text-lg flex-shrink-0">🏆</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{m.title}</div>
                            <div className="text-xs text-[#09090F]/40 font-nunito">{m.date}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteMilestone(m.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {babyMilestones.length === 0 && (
                        <div className="text-xs text-[#09090F]/40 font-nunito">No milestones yet — every first counts!</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Baby Pet</span>
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
              {gameTab === 'clicker' && <LullabyKeys onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <BubbleBath onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <BlockStacker onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}>
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
              {petCard}
            </div>
            {baby && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Little One</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{baby.emoji} {baby.name}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">
                  {babyAge(baby.birthdate)} old · born {baby.birthdate}
                </div>
                {data.babies.length > 1 && (
                  <button
                    onClick={() => handleDeleteBaby(baby.id)}
                    className="mt-2 text-xs font-nunito text-[#09090F]/30 hover:text-red-500 transition"
                  >
                    Remove profile
                  </button>
                )}
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FAE8FF', border: '1px solid #F0ABFC' }}>
              <strong className="text-fuchsia-700">Pet tip:</strong>{' '}
              <span className="text-fuchsia-800">Events earn +5 XP (first {EVENT_XP_CAP}/day), growth entries +15, and milestones +25!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
