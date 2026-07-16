import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPetData,
  addPet as dbAddPet,
  deletePet as dbDeletePet,
  addPetEvent as dbAddEvent,
  deletePetEvent as dbDeleteEvent,
  addPetCareItem as dbAddCareItem,
  setPetCareItemDone as dbSetCareItemDone,
  deletePetCareItem as dbDeleteCareItem,
  addPetWeight as dbAddWeight,
  deletePetWeight as dbDeleteWeight,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { PET_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton } from '../components/ui'
import BellyRubs from '../games/BellyRubs'
import PuppyHerd from '../games/PuppyHerd'
import FoodPuzzle from '../games/FoodPuzzle'
import type { PetData, PetEvent, PetEventType } from '../types'

const SPECIES = [
  { key: 'dog',     emoji: '🐶', label: 'Dog' },
  { key: 'cat',     emoji: '🐱', label: 'Cat' },
  { key: 'bird',    emoji: '🦜', label: 'Bird' },
  { key: 'fish',    emoji: '🐟', label: 'Fish' },
  { key: 'rabbit',  emoji: '🐰', label: 'Rabbit' },
  { key: 'hamster', emoji: '🐹', label: 'Hamster' },
  { key: 'other',   emoji: '🐾', label: 'Other' },
]
const EVENT_META: { key: PetEventType; emoji: string; label: string }[] = [
  { key: 'feeding',    emoji: '🍖', label: 'Feed' },
  { key: 'walk',       emoji: '🚶', label: 'Walk' },
  { key: 'grooming',   emoji: '🛁', label: 'Groom' },
  { key: 'medication', emoji: '💊', label: 'Meds' },
  { key: 'play',       emoji: '🎾', label: 'Play' },
  { key: 'vet',        emoji: '🩺', label: 'Vet' },
]

const EVENT_XP_CAP = 10

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'care' | 'health' | 'pet' | 'games'

const ACCENT = '#CA8A04'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'
const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'care', label: 'Care' },
  { key: 'health', label: 'Health' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function eventMeta(type: PetEventType) { return EVENT_META.find(m => m.key === type)! }
function eventTime(e: PetEvent) { return new Date(e.eventAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 86400000)
}

export default function Pet() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<PetData | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('today')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [petForm, setPetForm] = useState({ name: '', species: 'dog', birthdate: '' })
  const [showPetForm, setShowPetForm] = useState(false)
  const [eventNote, setEventNote] = useState('')
  const [careForm, setCareForm] = useState({ title: '', dueDate: '' })
  const [weightForm, setWeightForm] = useState('')
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'pet').then(setStreak)
    getBadges(userId, 'pet').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getPetData(userId).then(d => {
      setData(d)
      setSelectedPetId(d.pets[0]?.id ?? null)
      if (d.pets.length === 0) setShowPetForm(true)
    })
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'pet', data.character).then(c => {
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
  const pet = data.pets.find(p => p.id === selectedPetId) ?? null
  const petEvents = pet ? data.events.filter(e => e.petId === pet.id) : []
  const careToday = data.events.filter(e => e.eventAt.startsWith(today)).length
  const openCareItems = data.careItems.filter(i => !i.done)
  const nextDue = openCareItems.filter(i => i.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const overdueItems = openCareItems.filter(i => i.dueDate < today)
  const petWeights = pet ? data.weights.filter(w => w.petId === pet.id) : []
  const latestWeight = petWeights[petWeights.length - 1]

  const petStage = getStageFromXP(PET_STAGES, data.character.xp)

  const petById = (id: string) => data.pets.find(p => p.id === id)

  const applyXP = (xpGain: number, patch: Partial<PetData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'pet', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddPet = async () => {
    if (!petForm.name) return
    const species = SPECIES.find(s => s.key === petForm.species)!
    try {
      const newPet = await dbAddPet(userId, {
        name: petForm.name, species: petForm.species, emoji: species.emoji,
        birthdate: petForm.birthdate || undefined,
      })
      setData(d => d ? { ...d, pets: [...d.pets, newPet] } : d)
      setSelectedPetId(newPet.id)
      setPetForm({ name: '', species: 'dog', birthdate: '' })
      setShowPetForm(false)
      showToast(`Welcome to the pack, ${newPet.name}!`)
    } catch {
      showToast('Failed to add pet', false)
    }
  }

  const handleDeletePet = async (id: string) => {
    setData(d => d ? {
      ...d,
      pets: d.pets.filter(p => p.id !== id),
      events: d.events.filter(e => e.petId !== id),
      careItems: d.careItems.filter(i => i.petId !== id),
      weights: d.weights.filter(w => w.petId !== id),
    } : d)
    if (selectedPetId === id) setSelectedPetId(data.pets.find(p => p.id !== id)?.id ?? null)
    await dbDeletePet(id)
  }

  const handleLogEvent = async (type: PetEventType) => {
    if (!pet) return
    const allToday = data.events.filter(e => e.eventAt.startsWith(today))
    const firstToday = allToday.length === 0
    const xpGain = (allToday.length < EVENT_XP_CAP ? 5 : 0) + (firstToday ? 5 : 0)
    try {
      const event = await dbAddEvent(userId, { petId: pet.id, eventType: type, note: eventNote })
      if (xpGain > 0) {
        applyXP(xpGain, { events: [event, ...data.events] })
        showToast(`${eventMeta(type).emoji} +${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, events: [event, ...d.events] } : d)
        showToast(`${eventMeta(type).emoji} Logged. Daily XP cap reached`)
      }
      setEventNote('')
    } catch {
      showToast('Failed to log care', false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    setData(d => d ? { ...d, events: d.events.filter(e => e.id !== id) } : d)
    await dbDeleteEvent(id)
  }

  const handleAddCareItem = async () => {
    if (!pet || !careForm.title || !careForm.dueDate) return
    try {
      const item = await dbAddCareItem(userId, { petId: pet.id, title: careForm.title, dueDate: careForm.dueDate })
      setData(d => d ? { ...d, careItems: [...d.careItems, item].sort((a, b) => a.dueDate.localeCompare(b.dueDate)) } : d)
      setCareForm({ title: '', dueDate: '' })
      showToast('Reminder added!')
    } catch {
      showToast('Failed to add reminder', false)
    }
  }

  const handleToggleCareItem = async (id: string) => {
    const item = data.careItems.find(i => i.id === id)
    if (!item) return
    const nextDone = !item.done
    const nextItems = data.careItems.map(i => i.id === id ? { ...i, done: nextDone } : i)
    try {
      await dbSetCareItemDone(id, nextDone)
      if (nextDone) {
        const onTime = item.dueDate >= today
        const xpGain = onTime ? 20 : 5
        applyXP(xpGain, { careItems: nextItems })
        showToast(onTime ? `+${xpGain} XP, done on time!` : `+${xpGain} XP. Done late, watch those due dates`)
      } else {
        applyXP(-15, { careItems: nextItems })
        showToast('−15 XP, care item unchecked', false)
      }
    } catch {
      showToast('Failed to update', false)
    }
  }

  const handleDeleteCareItem = async (id: string) => {
    setData(d => d ? { ...d, careItems: d.careItems.filter(i => i.id !== id) } : d)
    await dbDeleteCareItem(id)
  }

  const handleAddWeight = async () => {
    if (!pet) return
    const kg = Math.abs(Number(weightForm))
    if (!kg || isNaN(kg)) return
    try {
      const entry = await dbAddWeight(userId, { petId: pet.id, date: today, weightKg: kg })
      const nextWeights = [...data.weights, entry].sort((a, b) => a.date.localeCompare(b.date))
      applyXP(10, { weights: nextWeights })
      setWeightForm('')
      showToast('+10 XP, weight logged!')
    } catch {
      showToast('Failed to log weight', false)
    }
  }

  const handleDeleteWeight = async (id: string) => {
    setData(d => d ? { ...d, weights: d.weights.filter(w => w.id !== id) } : d)
    await dbDeleteWeight(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const todayEvents = petEvents.filter(e => e.eventAt.startsWith(today))

  const trendWeights = petWeights.slice(-20)
  const wMin = Math.min(...trendWeights.map(w => w.weightKg), Infinity)
  const wMax = Math.max(...trendWeights.map(w => w.weightKg), -Infinity)
  const trendPoints = trendWeights.map((w, i) => {
    const x = trendWeights.length > 1 ? (i / (trendWeights.length - 1)) * 100 : 50
    const y = wMax > wMin ? 90 - ((w.weightKg - wMin) / (wMax - wMin)) * 80 : 50
    return `${x},${y}`
  }).join(' ')

  const petSelector = data.pets.length > 0 && (
    <div className="flex gap-1.5 flex-wrap items-center">
      {data.pets.map(p => (
        <button
          key={p.id}
          onClick={() => setSelectedPetId(p.id)}
          className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors flex items-center gap-1.5"
          style={selectedPetId === p.id ? { background: ACCENT, color: '#FFFFFF' } : { background: `${INK}08`, color: MUTED }}
        >
          {p.emoji} {p.name}
        </button>
      ))}
      <button onClick={() => setShowPetForm(s => !s)} className="px-3 py-1.5 rounded-full font-nunito text-xs" style={{ color: MUTED }}>
        + Add
      </button>
    </div>
  )

  const petCard = (
    <Character
      type="pet"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: '#FFFFFF', color: INK }

  const petEventsToday = data.events.filter(e => e.eventAt.startsWith(todayStr()))
  const dailyChallenges = [
    { id: 'ev2', title: 'Log 2 care events', emoji: '🐾', xp: 15, met: petEventsToday.length >= 2 },
    { id: 'fun', title: 'Walk or play today', emoji: '🎾', xp: 15, met: petEventsToday.some(e => e.eventType === 'walk' || e.eventType === 'play') },
    { id: 'ev4', title: 'Log 4 care events', emoji: '🏆', xp: 25, met: petEventsToday.length >= 4 },
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
          Pet Care <StreakBadge streak={streak} />
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
              { label: 'Pets', value: String(data.pets.length), color: ACCENT },
              { label: 'Care today', value: String(careToday), color: GOOD_COLOR },
              { label: 'Next due', value: nextDue ? `${daysUntil(nextDue.dueDate)}d` : overdueItems.length > 0 ? 'Overdue' : '—', color: overdueItems.length > 0 ? BAD_COLOR : INK },
              { label: 'Weight', value: latestWeight ? `${latestWeight.weightKg} kg` : '—', color: INK },
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

              {petSelector}

              {showPetForm && (
                <Panel tone="tint" accent={ACCENT} className="p-4">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {SPECIES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setPetForm(f => ({ ...f, species: s.key }))}
                        className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors flex items-center gap-1"
                        style={petForm.species === s.key ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text" placeholder="Name" value={petForm.name}
                      onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddPet()}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={petForm.birthdate}
                      onChange={e => setPetForm(f => ({ ...f, birthdate: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <NButton onClick={handleAddPet} disabled={!petForm.name} accent={ACCENT} className="w-full">Add pet</NButton>
                </Panel>
              )}

              {pet && (
                <>
                  <Panel tone="tint" accent={ACCENT} className="p-4 md:p-5">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-3">
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
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Today's care</div>
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

          {/* ── CARE (reminders) ─────────────────────────────── */}
          {mainTab === 'care' && (
            <div className="max-w-xl">
              {!pet ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>Add a pet first</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Head to the Today tab to add your pet</div>
                </div>
              ) : (
                <>
                  <Panel tone="tint" accent={ACCENT} className="p-4 mb-5">
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Vaccine, grooming, checkup…" value={careForm.title}
                        onChange={e => setCareForm(f => ({ ...f, title: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddCareItem()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="date" value={careForm.dueDate}
                        onChange={e => setCareForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <NButton onClick={handleAddCareItem} disabled={!careForm.title || !careForm.dueDate} accent={ACCENT}>Add</NButton>
                    </div>
                  </Panel>

                  {data.careItems.map((item, i) => {
                    const itemPet = petById(item.petId)
                    const overdue = !item.done && item.dueDate < today
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <button
                          onClick={() => handleToggleCareItem(item.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors"
                          style={{ background: item.done ? GOOD_COLOR : `${INK}08`, color: item.done ? '#fff' : 'inherit' }}
                        >
                          {item.done ? '✓' : ''}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito font-medium text-sm truncate" style={{ color: INK, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>
                            {itemPet?.emoji ?? '🐾'} {item.title}
                          </div>
                          <div className="font-nunito text-xs" style={{ color: overdue ? BAD_COLOR : MUTED }}>
                            {overdue ? `Overdue, was due ${item.dueDate}` : `Due ${item.dueDate}${!item.done && item.dueDate >= today ? ` (${daysUntil(item.dueDate)}d)` : ''}`}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCareItem(item.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                      </div>
                    )
                  })}

                  {data.careItems.length === 0 && (
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>No reminders yet, never miss a vaccine again</div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── HEALTH (weight) ──────────────────────────────── */}
          {mainTab === 'health' && (
            <div className="max-w-xl">
              {!pet ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>Add a pet first</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Head to the Today tab to add your pet</div>
                </div>
              ) : (
                <div className="space-y-8">
                  <Panel tone="tint" accent={ACCENT} className="p-4">
                    <div className="flex gap-2">
                      <input
                        type="number" step="0.01" placeholder="Weight (kg)" value={weightForm}
                        onChange={e => setWeightForm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={inputStyle}
                      />
                      <NButton onClick={handleAddWeight} disabled={!weightForm} accent={ACCENT}>Log</NButton>
                    </div>
                  </Panel>

                  {trendWeights.length >= 2 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Weight trend</div>
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>
                          {trendWeights[0].weightKg} → {trendWeights[trendWeights.length - 1].weightKg} kg
                        </span>
                      </div>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                        <polyline points={trendPoints} fill="none" stroke={ACCENT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                      <div className="flex justify-between font-nunito text-[10px]" style={{ color: MUTED }}>
                        <span>{trendWeights[0].date}</span>
                        <span>{trendWeights[trendWeights.length - 1].date}</span>
                      </div>
                    </div>
                  )}

                  {petWeights.length > 0 && (
                    <div>
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Entries</div>
                      <div>
                        {[...petWeights].reverse().slice(0, 10).map((w, i) => (
                          <div key={w.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                            <span className="font-nunito text-sm flex-1" style={{ color: INK }}>{w.date}</span>
                            <span className="font-nunito font-medium text-sm" style={{ color: ACCENT }}>{w.weightKg} kg</span>
                            <button onClick={() => handleDeleteWeight(w.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.pets.length > 0 && (
                    <button onClick={() => handleDeletePet(pet.id)} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: MUTED }}>
                      Remove {pet.name}'s profile
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="pet" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="pet"
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
              {gameTab === 'clicker' && <BellyRubs onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <PuppyHerd onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <FoodPuzzle onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {nextDue && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Next due</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{petById(nextDue.petId)?.emoji ?? '🐾'} {nextDue.title}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{nextDue.dueDate} · {daysUntil(nextDue.dueDate)} days</div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Care logs earn +5 XP, up to {EVENT_XP_CAP} a day, finished reminders +15 with +5 on time, and weight entries +10.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
