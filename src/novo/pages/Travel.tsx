import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getTravelData,
  addTrip as dbAddTrip,
  deleteTrip as dbDeleteTrip,
  addItineraryItem as dbAddItem,
  deleteItineraryItem as dbDeleteItem,
  addTripExpense as dbAddExpense,
  deleteTripExpense as dbDeleteExpense,
  addPackingItem as dbAddPacking,
  setPackingItemPacked as dbSetPackingPacked,
  deletePackingItem as dbDeletePacking,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { TRAVEL_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import StampRush from '../games/StampRush'
import BaggageDrop from '../games/BaggageDrop'
import PackSmart from '../games/PackSmart'
import type { TravelData, Trip, PackingItem } from '../types'

const PAGE_BG = '#F5F4F2'
const TRIP_EMOJIS = ['✈️', '🏝️', '🗻', '🏙️', '🚂', '🛳️', '🏕️', '🕌']
const EXPENSE_CATS = [
  { key: 'transport',  label: 'Transport' },
  { key: 'stay',       label: 'Stay' },
  { key: 'food',       label: 'Food' },
  { key: 'activities', label: 'Activities' },
  { key: 'shopping',   label: 'Shopping' },
  { key: 'other',      label: 'Other' },
]
const PACKING_CATS = [
  { key: 'clothes',     label: 'Clothes',     emoji: '👕' },
  { key: 'documents',   label: 'Documents',   emoji: '📄' },
  { key: 'electronics', label: 'Electronics', emoji: '🔌' },
  { key: 'toiletries',  label: 'Toiletries',  emoji: '🧴' },
  { key: 'other',       label: 'Other',       emoji: '🎒' },
]

const ITEM_XP_CAP = 5
const PACKING_ADD_XP_CAP = 5
const XP_AWARDED_KEY = 'novo-travel-trip-xp'
const packedAwardedKey = (userId: string) => `novo-travel-packed-awarded-${userId}`

type GameTab = 'clicker' | 'arcade' | 'puzzle'

const ACCENT = '#EA580C'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'
const STAMP_COLOR = '#7C3AED'

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 86400000)
}

// How far along the "runway" a trip's plane sits: 0% at trip creation,
// 100% once departure day arrives (or has passed).
function prepProgress(trip: Trip): number {
  const created = new Date(trip.createdAt).getTime()
  const start = new Date(trip.startDate + 'T00:00:00').getTime()
  const now = new Date(todayStr() + 'T00:00:00').getTime()
  if (now >= start || start <= created) return 100
  return Math.max(0, Math.min(100, ((now - created) / (start - created)) * 100))
}

export default function Travel() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<TravelData | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [tripForm, setTripForm] = useState({ destination: '', emoji: TRIP_EMOJIS[0], startDate: '', endDate: '', budget: '' })
  const [itemForm, setItemForm] = useState({ day: '', time: '', title: '', location: '' })
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: EXPENSE_CATS[0].key, note: '' })
  const [packingForm, setPackingForm] = useState({ text: '', category: PACKING_CATS[0].key })
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'travel').then(setStreak)
    getBadges(userId, 'travel').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getTravelData(userId).then(d => {
      setData(d)
      const upcoming = d.trips.filter(t => t.endDate >= todayStr()).sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
      setSelectedTripId(upcoming?.id ?? d.trips[0]?.id ?? null)
      setShowCreateForm(d.trips.length === 0)
    })
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'travel', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  // Award completion XP once per finished trip (tracked per device in localStorage)
  useEffect(() => {
    if (!data || !userId) return
    const awarded: string[] = JSON.parse(localStorage.getItem(XP_AWARDED_KEY) ?? '[]')
    const finished = data.trips.filter(t => t.endDate < today && !awarded.includes(t.id))
    if (finished.length === 0) return
    let totalXP = 0
    for (const trip of finished) {
      const spent = data.expenses.filter(e => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0)
      totalXP += trip.budget > 0 && spent <= trip.budget ? 50 : 25
    }
    localStorage.setItem(XP_AWARDED_KEY, JSON.stringify([...awarded, ...finished.map(t => t.id)]))
    applyXP(totalXP, {})
    showToast(`+${totalXP} XP, trip${finished.length > 1 ? 's' : ''} completed!`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data === null])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: PAGE_BG }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const selectedTrip = data.trips.find(t => t.id === selectedTripId) ?? null
  const upcomingTrip = data.trips.filter(t => t.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  const completedTrips = data.trips.filter(t => t.endDate < today).sort((a, b) => b.endDate.localeCompare(a.endDate))
  const totalBudget = data.trips.reduce((s, t) => s + t.budget, 0)
  const totalSpent = data.expenses.reduce((s, e) => s + e.amount, 0)

  const tripSpent = (trip: Trip) => data.expenses.filter(e => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0)

  const petStage = getStageFromXP(TRAVEL_STAGES, data.character.xp)

  const selectedItems = selectedTrip ? data.items.filter(i => i.tripId === selectedTrip.id) : []
  const itemDays = [...new Set(selectedItems.map(i => i.day))].sort()
  const selectedExpenses = selectedTrip ? data.expenses.filter(e => e.tripId === selectedTrip.id) : []
  const selectedSpent = selectedExpenses.reduce((s, e) => s + e.amount, 0)
  const selectedPacking = selectedTrip ? data.packingItems.filter(p => p.tripId === selectedTrip.id) : []
  const packedCount = selectedPacking.filter(p => p.packed).length
  const packedPct = selectedPacking.length > 0 ? Math.round((packedCount / selectedPacking.length) * 100) : 0

  const catTotals = EXPENSE_CATS
    .map(c => ({ ...c, total: selectedExpenses.filter(e => e.category === c.key).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  // "Ready to fly" — packing progress + whether the day-by-day plan and
  // budget even exist yet, averaged into one number worth chasing.
  const readiness = selectedTrip
    ? Math.round((packedPct + (selectedItems.length > 0 ? 100 : 0) + (selectedTrip.budget > 0 ? 100 : 0)) / 3)
    : 0

  const applyXP = (xpGain: number, patch: Partial<TravelData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'travel', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddTrip = async () => {
    const { destination, emoji, startDate, endDate, budget } = tripForm
    if (!destination || !startDate || !endDate || endDate < startDate) return
    try {
      const trip = await dbAddTrip(userId, {
        destination, emoji, startDate, endDate, budget: Math.abs(Number(budget)) || 0,
      })
      applyXP(20, { trips: [...data.trips, trip] })
      setSelectedTripId(trip.id)
      setTripForm({ destination: '', emoji: TRIP_EMOJIS[0], startDate: '', endDate: '', budget: '' })
      setShowCreateForm(false)
      showToast('+20 XP, trip planned!')
    } catch {
      showToast('Failed to create trip', false)
    }
  }

  const handleDeleteTrip = async (id: string) => {
    setData(d => d ? {
      ...d,
      trips: d.trips.filter(t => t.id !== id),
      items: d.items.filter(i => i.tripId !== id),
      expenses: d.expenses.filter(e => e.tripId !== id),
      packingItems: d.packingItems.filter(p => p.tripId !== id),
    } : d)
    if (selectedTripId === id) setSelectedTripId(null)
    await dbDeleteTrip(id)
  }

  const handleAddItem = async () => {
    if (!selectedTrip || !itemForm.day || !itemForm.title) return
    const sessionKey = `novo-travel-items-${today}`
    const addedToday = Number(sessionStorage.getItem(sessionKey) ?? '0')
    const xpGain = addedToday < ITEM_XP_CAP ? 5 : 0
    try {
      const item = await dbAddItem(userId, {
        tripId: selectedTrip.id,
        day: itemForm.day,
        time: itemForm.time || undefined,
        title: itemForm.title,
        location: itemForm.location,
      })
      sessionStorage.setItem(sessionKey, String(addedToday + 1))
      if (xpGain > 0) {
        applyXP(xpGain, { items: [...data.items, item] })
        showToast(`+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, items: [...d.items, item] } : d)
        showToast('Added. Daily XP cap reached')
      }
      setItemForm(f => ({ ...f, time: '', title: '', location: '' }))
    } catch {
      showToast('Failed to add item', false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    setData(d => d ? { ...d, items: d.items.filter(i => i.id !== id) } : d)
    await dbDeleteItem(id)
  }

  const handleAddExpense = async () => {
    if (!selectedTrip || !expenseForm.amount || isNaN(Number(expenseForm.amount))) return
    try {
      const amount = Math.abs(Number(expenseForm.amount))
      const expense = await dbAddExpense(userId, {
        tripId: selectedTrip.id,
        amount,
        category: expenseForm.category,
        note: expenseForm.note,
        date: today,
      })
      const spentAfter = data.expenses.filter(e => e.tripId === selectedTrip.id).reduce((s, e) => s + e.amount, 0) + amount
      const overBudget = selectedTrip.budget > 0 && spentAfter > selectedTrip.budget
      applyXP(overBudget ? -5 : 8, { expenses: [expense, ...data.expenses] })
      setExpenseForm(f => ({ ...f, amount: '', note: '' }))
      showToast(overBudget ? '−5 XP, this trip is over budget now' : '+8 XP!', !overBudget)
    } catch {
      showToast('Failed to log expense', false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    setData(d => d ? { ...d, expenses: d.expenses.filter(e => e.id !== id) } : d)
    await dbDeleteExpense(id)
  }

  const handleAddPacking = async () => {
    if (!selectedTrip || !packingForm.text.trim()) return
    const sessionKey = `novo-travel-packing-add-${today}`
    const addedToday = Number(sessionStorage.getItem(sessionKey) ?? '0')
    const xpGain = addedToday < PACKING_ADD_XP_CAP ? 3 : 0
    try {
      const item = await dbAddPacking(userId, { tripId: selectedTrip.id, text: packingForm.text.trim(), category: packingForm.category })
      sessionStorage.setItem(sessionKey, String(addedToday + 1))
      if (xpGain > 0) {
        applyXP(xpGain, { packingItems: [...data.packingItems, item] })
      } else {
        setData(d => d ? { ...d, packingItems: [...d.packingItems, item] } : d)
      }
      setPackingForm(f => ({ ...f, text: '' }))
    } catch {
      showToast('Failed to add item', false)
    }
  }

  // XP for actually packing something only ever fires once per item, ever —
  // guarded in localStorage so unchecking and rechecking can't farm it.
  const handleTogglePacked = async (item: PackingItem) => {
    const nextPacked = !item.packed
    setData(d => d ? { ...d, packingItems: d.packingItems.map(p => p.id === item.id ? { ...p, packed: nextPacked } : p) } : d)
    await dbSetPackingPacked(item.id, nextPacked)
    if (nextPacked) {
      sessionStorage.setItem(`novo-travel-packed-today-${today}`, String(Number(sessionStorage.getItem(`novo-travel-packed-today-${today}`) ?? '0') + 1))
      const awarded: string[] = JSON.parse(localStorage.getItem(packedAwardedKey(userId)) ?? '[]')
      if (!awarded.includes(item.id)) {
        localStorage.setItem(packedAwardedKey(userId), JSON.stringify([...awarded, item.id]))
        applyXP(2, {})
      }
    }
  }

  const handleDeletePacking = async (id: string) => {
    setData(d => d ? { ...d, packingItems: d.packingItems.filter(p => p.id !== id) } : d)
    await dbDeletePacking(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const petCard = (
    <Character
      type="travel"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: '#FFFFFF', color: INK }

  const tripStatus = (t: Trip) => {
    if (t.endDate < today) return { short: '✓', label: 'Completed', color: MUTED }
    if (t.startDate <= today) return { short: 'NOW', label: 'Ongoing', color: GOOD_COLOR }
    const d = daysUntil(t.startDate)
    return { short: String(d), label: d === 1 ? 'day to go' : 'days to go', color: ACCENT }
  }

  const packedTodayCount = Number(sessionStorage.getItem(`novo-travel-packed-today-${today}`) ?? '0')
  const expensesToday = data.expenses.filter(e => e.date === todayStr())
  const dailyChallenges = [
    { id: 'exp1', title: 'Log an expense', emoji: '🧾', xp: 15, met: expensesToday.length >= 1 },
    { id: 'plan', title: 'Plan an itinerary item for today', emoji: '🗺️', xp: 10, met: data.items.some(i => i.day === todayStr()) },
    { id: 'pack1', title: 'Pack an item', emoji: '🧳', xp: 15, met: packedTodayCount >= 1 },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: PAGE_BG }}>
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
          Travel Planner <StreakBadge streak={streak} />
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
              { label: 'Next trip', value: upcomingTrip ? (upcomingTrip.startDate <= today ? 'Now' : `${daysUntil(upcomingTrip.startDate)}d`) : '—', color: ACCENT },
              { label: 'Trips planned', value: String(data.trips.length), color: INK },
              { label: 'Total budget', value: formatRp(totalBudget), color: INK },
              { label: 'Total spent', value: formatRp(totalSpent), color: totalSpent > totalBudget && totalBudget > 0 ? BAD_COLOR : GOOD_COLOR },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* ── BOARDING PASS CAROUSEL — trip picker, no tabs ─────── */}
          <div className="flex gap-3 overflow-x-auto pb-3 mb-2 scrollbar-hidden">
            {data.trips.map(t => {
              const status = tripStatus(t)
              const selected = t.id === selectedTripId
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTripId(t.id)}
                  className="relative flex-shrink-0 w-[280px] rounded-2xl overflow-hidden text-left transition-transform hover:-translate-y-0.5"
                  style={{
                    background: selected ? ACCENT : '#FFFFFF',
                    boxShadow: selected ? `0 8px 24px ${ACCENT}45` : '0 1px 3px rgba(0,0,0,0.08)',
                    border: selected ? 'none' : `1px solid ${INK}12`,
                  }}
                >
                  <div className="flex">
                    <div className="flex-1 min-w-0 p-4">
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="font-nunito font-bold text-sm truncate" style={{ color: selected ? '#FFFFFF' : INK }}>
                        {t.destination}
                      </div>
                      <div className="font-nunito text-xs mt-0.5" style={{ color: selected ? 'rgba(255,255,255,0.8)' : MUTED }}>
                        {t.startDate} → {t.endDate}
                      </div>
                      {t.budget > 0 && (
                        <div className="mt-2">
                          <NProgress
                            pct={Math.min(100, (tripSpent(t) / t.budget) * 100)}
                            accent={selected ? '#FFFFFF' : tripSpent(t) > t.budget ? BAD_COLOR : ACCENT}
                            track={selected ? 'rgba(255,255,255,0.25)' : `${INK}10`}
                            height={4}
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative flex-shrink-0" style={{ borderLeft: `2px dashed ${selected ? 'rgba(255,255,255,0.4)' : `${INK}22`}` }}>
                      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full" style={{ background: PAGE_BG }} />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full" style={{ background: PAGE_BG }} />
                    </div>
                    <div className="flex-shrink-0 w-[74px] flex flex-col items-center justify-center p-2 text-center">
                      <div className="font-nunito font-bold text-lg leading-none" style={{ color: selected ? '#FFFFFF' : status.color }}>
                        {status.short}
                      </div>
                      <div className="font-nunito text-[9px] mt-1 leading-tight" style={{ color: selected ? 'rgba(255,255,255,0.75)' : MUTED }}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                  <span
                    onClick={e => { e.stopPropagation(); handleDeleteTrip(t.id) }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-70"
                    style={{ color: selected ? 'rgba(255,255,255,0.8)' : MUTED }}
                  >
                    ✕
                  </span>
                </button>
              )
            })}

            <button
              onClick={() => setShowCreateForm(s => !s)}
              className="flex-shrink-0 w-[140px] rounded-2xl flex flex-col items-center justify-center gap-2 py-6 transition-colors"
              style={{ border: `2px dashed ${ACCENT}60`, color: ACCENT, background: showCreateForm ? `${ACCENT}10` : 'transparent' }}
            >
              <span className="text-3xl leading-none">+</span>
              <span className="font-nunito text-sm font-semibold">New trip</span>
            </button>
          </div>

          {/* ── CREATE TRIP ────────────────────────────────────── */}
          {showCreateForm && (
            <Panel tone="tint" accent={ACCENT} className="p-4 mb-6 max-w-xl">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {TRIP_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setTripForm(f => ({ ...f, emoji: e }))}
                    className="w-9 h-9 rounded-full text-lg transition-opacity"
                    style={{ opacity: tripForm.emoji === e ? 1 : 0.4 }}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text" placeholder="Destination" value={tripForm.destination}
                  onChange={e => setTripForm(f => ({ ...f, destination: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                  style={inputStyle}
                />
                <input
                  type="number" placeholder="Budget (Rp)" value={tripForm.budget}
                  onChange={e => setTripForm(f => ({ ...f, budget: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                  style={inputStyle}
                />
                <div>
                  <div className="font-nunito text-[10px] mb-0.5 px-1" style={{ color: MUTED }}>Start</div>
                  <input
                    type="date" value={tripForm.startDate}
                    onChange={e => setTripForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div className="font-nunito text-[10px] mb-0.5 px-1" style={{ color: MUTED }}>End</div>
                  <input
                    type="date" value={tripForm.endDate}
                    onChange={e => setTripForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
              <NButton onClick={handleAddTrip} disabled={!tripForm.destination || !tripForm.startDate || !tripForm.endDate} accent={ACCENT} className="w-full">
                Create trip (+20 XP)
              </NButton>
            </Panel>
          )}

          {/* ── PASSPORT STAMPS — completed trips, purely a payoff ── */}
          {completedTrips.length > 0 && (
            <div className="mb-6">
              <div className="font-nunito font-semibold text-xs mb-2" style={{ color: MUTED }}>
                🛂 Passport — {completedTrips.length} trip{completedTrips.length === 1 ? '' : 's'} completed
              </div>
              <div className="flex flex-wrap gap-2">
                {completedTrips.map(t => (
                  <div
                    key={t.id}
                    title={`${t.destination} · ${t.startDate}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `${STAMP_COLOR}12`,
                      border: `2px dashed ${STAMP_COLOR}70`,
                      transform: `rotate(${(t.id.charCodeAt(0) % 7) - 3}deg)`,
                    }}
                  >
                    {t.emoji}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.trips.length === 0 && !showCreateForm && (
            <div className="py-10 text-center">
              <div className="font-nunito text-sm" style={{ color: INK }}>No trips yet</div>
              <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Tap "New trip" above to plan your first adventure</div>
            </div>
          )}

          {/* ── SELECTED TRIP JOURNAL — one continuous page, no tabs ── */}
          {selectedTrip && (
            <div className="max-w-5xl space-y-8">

              {/* Countdown runway + readiness meter */}
              <Panel tone="tint" accent={ACCENT} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <div className="font-nunito font-bold text-base" style={{ color: INK }}>
                    {selectedTrip.emoji} {selectedTrip.destination}
                  </div>
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>
                    {tripStatus(selectedTrip).label === 'Completed' ? '✓ Trip complete' : tripStatus(selectedTrip).label === 'Ongoing' ? 'Happening now!' : `${daysUntil(selectedTrip.startDate)} days to departure`}
                  </div>
                </div>

                {/* runway */}
                <div className="relative h-6 mb-1">
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t-2 border-dashed" style={{ borderColor: `${ACCENT}40` }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg transition-all duration-700"
                    style={{ left: `${prepProgress(selectedTrip)}%` }}
                  >
                    ✈️
                  </div>
                </div>
                <div className="flex justify-between font-nunito text-[10px] mb-4" style={{ color: MUTED }}>
                  <span>Planned</span>
                  <span>Departure {selectedTrip.startDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">🧳</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between font-nunito text-xs mb-1">
                      <span style={{ color: INK }}>Ready to fly</span>
                      <span style={{ color: MUTED }}>{readiness}%</span>
                    </div>
                    <NProgress pct={readiness} accent={readiness >= 100 ? GOOD_COLOR : ACCENT} height={5} />
                  </div>
                </div>
              </Panel>

              {/* Packing list */}
              <div>
                <div className="font-nunito font-semibold text-sm mb-3 flex items-center gap-1.5" style={{ color: INK }}>
                  🧳 Packing list
                  {selectedPacking.length > 0 && (
                    <span className="font-nunito text-xs font-normal" style={{ color: MUTED }}>({packedCount}/{selectedPacking.length} packed)</span>
                  )}
                </div>
                <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <Panel tone="tint" accent={ACCENT} className="p-4">
                      {selectedPacking.length > 0 && <NProgress pct={packedPct} accent={ACCENT} height={5} />}
                      <div className="flex gap-1.5 mb-2 mt-3 flex-wrap">
                        {PACKING_CATS.map(c => (
                          <button
                            key={c.key}
                            onClick={() => setPackingForm(f => ({ ...f, category: c.key }))}
                            className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors"
                            style={packingForm.category === c.key ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                          >
                            {c.emoji} {c.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text" placeholder="Add an item (e.g. Passport)" value={packingForm.text}
                          onChange={e => setPackingForm(f => ({ ...f, text: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddPacking()}
                          className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <NButton onClick={handleAddPacking} disabled={!packingForm.text.trim()} accent={ACCENT}>Add</NButton>
                      </div>
                    </Panel>
                  </div>

                  <div>
                    {PACKING_CATS.filter(c => selectedPacking.some(p => p.category === c.key)).map(c => (
                      <div key={c.key} className="mb-4">
                        <div className="font-nunito text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{c.emoji} {c.label}</div>
                        {selectedPacking.filter(p => p.category === c.key).map((p, i) => (
                          <div key={p.id} className="flex items-center gap-2.5 py-1.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                            <button
                              onClick={() => handleTogglePacked(p)}
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                              style={{ background: p.packed ? ACCENT : '#FFFFFF', border: `1px solid ${p.packed ? ACCENT : `${INK}33`}` }}
                            >
                              {p.packed && <span className="text-white text-[11px] leading-none">✓</span>}
                            </button>
                            <span
                              className="flex-1 font-nunito text-sm min-w-0 truncate"
                              style={{ color: p.packed ? MUTED : INK, textDecoration: p.packed ? 'line-through' : 'none' }}
                            >
                              {p.text}
                            </span>
                            <button onClick={() => handleDeletePacking(p.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                          </div>
                        ))}
                      </div>
                    ))}
                    {selectedPacking.length === 0 && (
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>Nothing on your list yet, add what you need above</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Itinerary timeline */}
              <div>
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🗓️ Itinerary</div>
                <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <Panel tone="tint" accent={ACCENT} className="p-4">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="date" min={selectedTrip.startDate} max={selectedTrip.endDate} value={itemForm.day}
                          onChange={e => setItemForm(f => ({ ...f, day: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <input
                          type="time" value={itemForm.time}
                          onChange={e => setItemForm(f => ({ ...f, time: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <input
                          type="text" placeholder="Activity" value={itemForm.title}
                          onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                          className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <input
                          type="text" placeholder="Location (optional)" value={itemForm.location}
                          onChange={e => setItemForm(f => ({ ...f, location: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                          className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                      <NButton onClick={handleAddItem} disabled={!itemForm.day || !itemForm.title} accent={ACCENT} className="w-full">
                        Add to itinerary
                      </NButton>
                    </Panel>
                  </div>

                  <div>
                    {itemDays.map((day, di) => (
                      <div key={day} className="relative pl-5" style={{ borderLeft: di === itemDays.length - 1 ? 'none' : `2px dashed ${ACCENT}40`, paddingBottom: di === itemDays.length - 1 ? 0 : 20 }}>
                        <div className="absolute -left-[7px] top-0.5 w-3.5 h-3.5 rounded-full" style={{ background: ACCENT }} />
                        <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>
                          Day {di + 1} · {day} {day === today && '· Today'}
                        </div>
                        {selectedItems.filter(i => i.day === day).map(i => (
                          <div key={i.id} className="flex items-start gap-3 mb-2">
                            <span className="font-nunito text-xs font-medium flex-shrink-0 w-12 pt-0.5" style={{ color: ACCENT }}>{i.time ?? '—'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-nunito text-sm truncate" style={{ color: INK }}>{i.title}</div>
                              {i.location && <div className="font-nunito text-xs" style={{ color: MUTED }}>📍 {i.location}</div>}
                            </div>
                            <button onClick={() => handleDeleteItem(i.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                          </div>
                        ))}
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>No itinerary items yet, plan your days above</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div>
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🧾 Budget</div>
                <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-nunito font-bold text-2xl" style={{ color: selectedTrip.budget > 0 && selectedSpent > selectedTrip.budget ? BAD_COLOR : INK }}>
                          {formatRp(selectedSpent)}
                        </span>
                        {selectedTrip.budget > 0 && <span className="font-nunito text-sm" style={{ color: MUTED }}>of {formatRp(selectedTrip.budget)}</span>}
                      </div>
                      {selectedTrip.budget > 0 && (
                        <NProgress pct={(selectedSpent / selectedTrip.budget) * 100} accent={selectedSpent > selectedTrip.budget ? BAD_COLOR : ACCENT} height={5} />
                      )}
                    </div>

                    <Panel tone="tint" accent={ACCENT} className="p-4">
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        {EXPENSE_CATS.map(c => (
                          <button
                            key={c.key}
                            onClick={() => setExpenseForm(f => ({ ...f, category: c.key }))}
                            className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors"
                            style={expenseForm.category === c.key ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number" placeholder="Amount (Rp)" value={expenseForm.amount}
                          onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                          className="w-32 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <input
                          type="text" placeholder="Note (optional)" value={expenseForm.note}
                          onChange={e => setExpenseForm(f => ({ ...f, note: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                          className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                          style={inputStyle}
                        />
                        <NButton onClick={handleAddExpense} disabled={!expenseForm.amount} accent={ACCENT}>Log</NButton>
                      </div>
                    </Panel>
                  </div>

                  <div>
                    {catTotals.length > 0 && (
                      <div className="mb-6">
                        <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>By category</div>
                        <div className="space-y-3">
                          {catTotals.map(c => (
                            <div key={c.key}>
                              <div className="flex justify-between font-nunito text-xs mb-1.5">
                                <span style={{ color: INK }}>{c.label}</span>
                                <span style={{ color: MUTED }}>
                                  {selectedSpent > 0 ? Math.round((c.total / selectedSpent) * 100) : 0}% · {formatRp(c.total)}
                                </span>
                              </div>
                              <NProgress pct={selectedSpent > 0 ? (c.total / selectedSpent) * 100 : 0} accent={ACCENT} height={4} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedExpenses.map((e, i) => {
                      const cat = EXPENSE_CATS.find(c => c.key === e.category)
                      return (
                        <div key={e.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{e.note || cat?.label || e.category}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>{e.date}</div>
                          </div>
                          <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: BAD_COLOR }}>−{formatRp(e.amount)}</span>
                          <button onClick={() => handleDeleteExpense(e.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Travel companion */}
              <div>
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🐾 Travel companion</div>
                <div className="space-y-4 max-w-2xl">
                  <DailyChallenges trackerId="travel" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
                  <PetRoom
                    userId={userId}
                    trackerId="travel"
                    character={data.character}
                    streak={streak}
                    earnedBadges={earnedBadges}
                    missions={missions}
                    onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
                  />
                </div>
              </div>

              {/* Games */}
              <div>
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>🎮 Layover games</div>
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
                  {gameTab === 'clicker' && <StampRush onXPEarned={handleXPEarned} />}
                  {gameTab === 'arcade' && <BaggageDrop onXPEarned={handleXPEarned} />}
                  {gameTab === 'puzzle' && <PackSmart onXPEarned={handleXPEarned} />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: PAGE_BG }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {upcomingTrip && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Next adventure</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{upcomingTrip.emoji} {upcomingTrip.destination}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>
                  {upcomingTrip.startDate <= today ? 'Happening now' : `${daysUntil(upcomingTrip.startDate)} days to go`}
                </div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              New trips earn +20 XP, expenses +8, packing an item +2, and finishing a trip under budget earns +50.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
