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
import { awardXP, getStreak, getBadges, type StreakRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { BadgeWall } from '../components/BadgeWall'
import { useAuth } from '../contexts/AuthContext'
import { PET_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
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

const EVENT_XP_CAP = 10  // XP-earning care events per day

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'care' | 'health' | 'games'

const ACCENT = '#CA8A04'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

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
  const { celebrate, layer } = useCelebrations()

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'pet').then(setStreak)
    getBadges(userId, 'pet').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getPetData(userId).then(d => {
      setData(d)
      setSelectedPetId(d.pets[0]?.id ?? null)
      if (d.pets.length === 0) setShowPetForm(true)
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
      showToast(`${species.emoji} Welcome to the pack, ${newPet.name}!`)
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
        showToast(`${eventMeta(type).emoji} Logged! (daily XP cap reached)`)
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
        const xpGain = 15 + (onTime ? 5 : 0)
        applyXP(xpGain, { careItems: nextItems })
        showToast(onTime ? `+${xpGain} XP — done on time!` : `+${xpGain} XP — done!`)
      } else {
        setData(d => d ? { ...d, careItems: nextItems } : d)
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
      showToast('+10 XP — weight logged!')
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

  const todayEvents = petEvents.filter(e => e.eventAt.startsWith(today))

  // Weight trend
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
          className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition flex items-center gap-1.5"
          style={selectedPetId === p.id
            ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
            : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `3px solid ${CARD_BORDER}` }}
        >
          {p.emoji} {p.name}
        </button>
      ))}
      <button
        onClick={() => setShowPetForm(s => !s)}
        className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition"
        style={{ background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `1px dashed ${CARD_BORDER}` }}
      >
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
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }

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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">🐾 Pet Care <StreakBadge streak={streak} /></div>
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

          <div className="lg:hidden mb-4"><BadgeWall earned={earnedBadges} accent={ACCENT} /></div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Pets', value: String(data.pets.length), color: ACCENT },
              { label: 'Care today', value: String(careToday), color: GOOD_COLOR },
              { label: 'Next due', value: nextDue ? `${daysUntil(nextDue.dueDate)}d` : overdueItems.length > 0 ? 'Overdue!' : '—', color: overdueItems.length > 0 ? BAD_COLOR : '#09090F' },
              { label: 'Weight', value: latestWeight ? `${latestWeight.weightKg} kg` : '—', color: '#09090F' },
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
              { key: 'today',  label: '🍖 Today' },
              { key: 'care',   label: '📋 Care' },
              { key: 'health', label: '🩺 Health' },
              { key: 'games',  label: '🎮 Games' },
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

          {/* ── TODAY ────────────────────────────────────────── */}
          {mainTab === 'today' && (
            <div className="space-y-4">

              {petSelector && (
                <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  {petSelector}
                </div>
              )}

              {/* Add pet form */}
              {showPetForm && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                    {data.pets.length === 0 ? 'Add Your First Pet' : 'Add Another Pet'}
                  </div>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {SPECIES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setPetForm(f => ({ ...f, species: s.key }))}
                        className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition flex items-center gap-1"
                        style={petForm.species === s.key
                          ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                          : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `3px solid ${CARD_BORDER}` }}
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
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                      style={inputStyle}
                    />
                    <input
                      type="date" value={petForm.birthdate}
                      onChange={e => setPetForm(f => ({ ...f, birthdate: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={handleAddPet}
                    disabled={!petForm.name}
                    className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Add Pet
                  </button>
                </div>
              )}

              {pet && (
                <>
                  {/* Quick log */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      Quick Log — {pet.emoji} {pet.name}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-3">
                      {EVENT_META.map(m => (
                        <button
                          key={m.key}
                          onClick={() => handleLogEvent(m.key)}
                          className="py-3 rounded-xl font-nunito text-xs font-semibold transition active:scale-95 flex flex-col items-center gap-1"
                          style={{ background: ACCENT + '10', color: ACCENT, border: `3px solid ${ACCENT}30` }}
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
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Today's Care</div>
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

          {/* ── CARE (reminders) ─────────────────────────────── */}
          {mainTab === 'care' && (
            <div className="space-y-4">
              {!pet ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">📋</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Add a pet first</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Head to the Today tab to add your pet</div>
                </div>
              ) : (
                <>
                  {/* Add care item */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      New Reminder — {pet.emoji} {pet.name}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Vaccine, grooming, checkup…" value={careForm.title}
                        onChange={e => setCareForm(f => ({ ...f, title: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddCareItem()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <input
                        type="date" value={careForm.dueDate}
                        onChange={e => setCareForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddCareItem}
                        disabled={!careForm.title || !careForm.dueDate}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Care items */}
                  {data.careItems.map(item => {
                    const itemPet = petById(item.petId)
                    const overdue = !item.done && item.dueDate < today
                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 rounded-xl flex items-center gap-3"
                        style={{ background: CARD_BG, border: `3px solid ${item.done ? GOOD_COLOR + '60' : overdue ? '#FCA5A5' : CARD_BORDER}` }}
                      >
                        <button
                          onClick={() => handleToggleCareItem(item.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 transition"
                          style={item.done
                            ? { background: GOOD_COLOR, color: '#fff' }
                            : { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                        >
                          {item.done ? '✓' : ''}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`font-nunito font-semibold text-sm truncate ${item.done ? 'line-through text-[#09090F]/40' : 'text-[#09090F]'}`}>
                            {itemPet?.emoji ?? '🐾'} {item.title}
                          </div>
                          <div className="text-xs font-nunito" style={{ color: overdue ? BAD_COLOR : 'rgba(9,9,15,0.5)' }}>
                            {overdue ? `Overdue — was due ${item.dueDate}` : `Due ${item.dueDate}${!item.done && item.dueDate >= today ? ` (${daysUntil(item.dueDate)}d)` : ''}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCareItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}

                  {data.careItems.length === 0 && (
                    <div className="text-center py-8 rounded-xl text-xs text-[#09090F]/40 font-nunito" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      No reminders yet — never miss a vaccine again
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── HEALTH (weight) ──────────────────────────────── */}
          {mainTab === 'health' && (
            <div className="space-y-4">
              {!pet ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">🩺</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Add a pet first</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Head to the Today tab to add your pet</div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      Log Weight — {pet.emoji} {pet.name}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" step="0.01" placeholder="Weight (kg)" value={weightForm}
                        onChange={e => setWeightForm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddWeight}
                        disabled={!weightForm}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {trendWeights.length >= 2 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Weight Trend</div>
                        <span className="text-xs font-nunito text-[#09090F]/50">
                          {trendWeights[0].weightKg} → {trendWeights[trendWeights.length - 1].weightKg} kg
                        </span>
                      </div>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                        <polyline
                          points={trendPoints}
                          fill="none"
                          stroke={ACCENT}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="flex justify-between text-[10px] font-nunito text-[#09090F]/40">
                        <span>{trendWeights[0].date}</span>
                        <span>{trendWeights[trendWeights.length - 1].date}</span>
                      </div>
                    </div>
                  )}

                  {petWeights.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Entries</div>
                      <div className="space-y-2">
                        {[...petWeights].reverse().slice(0, 10).map(w => (
                          <div key={w.id} className="flex items-center gap-3">
                            <span className="font-nunito text-sm text-[#09090F] flex-1">{w.date}</span>
                            <span className="font-nunito font-semibold text-sm" style={{ color: ACCENT }}>{w.weightKg} kg</span>
                            <button
                              onClick={() => handleDeleteWeight(w.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.pets.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Manage</div>
                      <button
                        onClick={() => handleDeletePet(pet.id)}
                        className="text-xs font-nunito text-[#09090F]/40 hover:text-red-500 transition"
                      >
                        Remove {pet.name}'s profile
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Companion Pet</span>
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
              {gameTab === 'clicker' && <BellyRubs onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <PuppyHerd onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <FoodPuzzle onXPEarned={handleXPEarned} />}
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
            <BadgeWall earned={earnedBadges} accent={ACCENT} />
            {nextDue && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Next Due</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{petById(nextDue.petId)?.emoji ?? '🐾'} {nextDue.title}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">{nextDue.dueDate} · {daysUntil(nextDue.dueDate)} days</div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FEF9C3', border: '1px solid #FDE68A' }}>
              <strong className="text-yellow-700">Pet tip:</strong>{' '}
              <span className="text-yellow-800">Care logs earn +5 XP (first {EVENT_XP_CAP}/day), finished reminders +15 (+5 on time), and weight entries +10!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
