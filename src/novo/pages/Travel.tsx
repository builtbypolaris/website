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
import StampRush from '../games/StampRush'
import BaggageDrop from '../games/BaggageDrop'
import PackSmart from '../games/PackSmart'
import type { TravelData, Trip } from '../types'

const TRIP_EMOJIS = ['✈️', '🏝️', '🗻', '🏙️', '🚂', '🛳️', '🏕️', '🕌']
const EXPENSE_CATS = [
  { key: 'transport',  emoji: '🚕', label: 'Transport' },
  { key: 'stay',       emoji: '🏨', label: 'Stay' },
  { key: 'food',       emoji: '🍜', label: 'Food' },
  { key: 'activities', emoji: '🎟️', label: 'Activities' },
  { key: 'shopping',   emoji: '🛍️', label: 'Shopping' },
  { key: 'other',      emoji: '📦', label: 'Other' },
]

const ITEM_XP_CAP = 5  // XP-earning itinerary items per day
const XP_AWARDED_KEY = 'novo-travel-trip-xp'  // localStorage: trip ids already given completion XP

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'trips' | 'itinerary' | 'budget' | 'pet' | 'games'

const ACCENT = '#EA580C'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 86400000)
}

export default function Travel() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<TravelData | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('trips')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [tripForm, setTripForm] = useState({ destination: '', emoji: TRIP_EMOJIS[0], startDate: '', endDate: '', budget: '' })
  const [itemForm, setItemForm] = useState({ day: '', time: '', title: '', location: '' })
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: EXPENSE_CATS[0].key, note: '' })
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
    })
  }, [userId])

  // Idle-day happiness decay — guarded to once per tracker per day
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
    showToast(`+${totalXP} XP — trip${finished.length > 1 ? 's' : ''} completed! 🎉`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data === null])

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
  const selectedTrip = data.trips.find(t => t.id === selectedTripId) ?? null
  const upcomingTrip = data.trips.filter(t => t.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  const totalBudget = data.trips.reduce((s, t) => s + t.budget, 0)
  const totalSpent = data.expenses.reduce((s, e) => s + e.amount, 0)

  const tripSpent = (trip: Trip) => data.expenses.filter(e => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0)

  const petStage = getStageFromXP(TRAVEL_STAGES, data.character.xp)

  const selectedItems = selectedTrip ? data.items.filter(i => i.tripId === selectedTrip.id) : []
  const itemDays = [...new Set(selectedItems.map(i => i.day))].sort()
  const selectedExpenses = selectedTrip ? data.expenses.filter(e => e.tripId === selectedTrip.id) : []
  const selectedSpent = selectedExpenses.reduce((s, e) => s + e.amount, 0)

  const catTotals = EXPENSE_CATS
    .map(c => ({ ...c, total: selectedExpenses.filter(e => e.category === c.key).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

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
      showToast('+20 XP — trip planned! ✈️')
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
    } : d)
    if (selectedTripId === id) setSelectedTripId(null)
    await dbDeleteTrip(id)
  }

  const handleAddItem = async () => {
    if (!selectedTrip || !itemForm.day || !itemForm.title) return
    // Cap: count items created today across all trips (approximation: use added-this-session + DB has no created date on camelCase... items have no createdAt in type; use daily cap on session adds)
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
        showToast('Added! (daily XP cap reached)')
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
      // Spending past the trip budget costs XP instead of earning it
      const spentAfter = data.expenses.filter(e => e.tripId === selectedTrip.id).reduce((s, e) => s + e.amount, 0) + amount
      const overBudget = selectedTrip.budget > 0 && spentAfter > selectedTrip.budget
      applyXP(overBudget ? -5 : 8, { expenses: [expense, ...data.expenses] })
      setExpenseForm(f => ({ ...f, amount: '', note: '' }))
      showToast(overBudget ? '−5 XP — this trip is over budget now' : '+8 XP!', !overBudget)
    } catch {
      showToast('Failed to log expense', false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    setData(d => d ? { ...d, expenses: d.expenses.filter(e => e.id !== id) } : d)
    await dbDeleteExpense(id)
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title} — +${xp} XP!`)
  }

  const petCard = (
    <Character
      type="travel"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const inputStyle = { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }

  const tripStatus = (t: Trip) => {
    if (t.endDate < today) return { label: 'Completed', color: '#9CA3AF' }
    if (t.startDate <= today) return { label: 'Ongoing! 🎒', color: GOOD_COLOR }
    return { label: `In ${daysUntil(t.startDate)} days`, color: ACCENT }
  }

  const expensesToday = data.expenses.filter(e => e.date === todayStr())
  const dailyChallenges = [
    { id: 'exp1', title: 'Log an expense', emoji: '🧾', xp: 15, met: expensesToday.length >= 1 },
    { id: 'exp2', title: 'Log 2 expenses', emoji: '💳', xp: 25, met: expensesToday.length >= 2 },
    { id: 'plan', title: 'Plan an itinerary item for today', emoji: '🗺️', xp: 10, met: data.items.some(i => i.day === todayStr()) },
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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">✈️ Travel Planner <StreakBadge streak={streak} /></div>
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
              { label: 'Next trip', value: upcomingTrip ? (upcomingTrip.startDate <= today ? 'Now! 🎒' : `${daysUntil(upcomingTrip.startDate)}d`) : '—', color: ACCENT },
              { label: 'Trips planned', value: String(data.trips.length), color: '#09090F' },
              { label: 'Total budget', value: formatRp(totalBudget), color: '#09090F' },
              { label: 'Total spent', value: formatRp(totalSpent), color: totalSpent > totalBudget && totalBudget > 0 ? BAD_COLOR : GOOD_COLOR },
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
              { key: 'trips',     label: '🌍 Trips' },
              { key: 'itinerary', label: '🗓️ Itinerary' },
              { key: 'budget',    label: '💰 Budget' },
              { key: 'pet', label: '🐾 Pet' },
              { key: 'games',     label: '🎮 Games' },
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

          {/* ── TRIPS ────────────────────────────────────────── */}
          {mainTab === 'trips' && (
            <div className="space-y-4">

              {/* Add trip */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Plan a Trip</div>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {TRIP_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setTripForm(f => ({ ...f, emoji: e }))}
                      className="w-9 h-9 rounded-lg text-lg transition"
                      style={tripForm.emoji === e
                        ? { background: ACCENT + '20', border: `3px solid ${ACCENT}` }
                        : { background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text" placeholder="Destination" value={tripForm.destination}
                    onChange={e => setTripForm(f => ({ ...f, destination: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <input
                    type="number" placeholder="Budget (Rp)" value={tripForm.budget}
                    onChange={e => setTripForm(f => ({ ...f, budget: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={inputStyle}
                  />
                  <div>
                    <div className="text-[10px] text-[#09090F]/40 font-nunito mb-0.5 px-1">Start</div>
                    <input
                      type="date" value={tripForm.startDate}
                      onChange={e => setTripForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#09090F]/40 font-nunito mb-0.5 px-1">End</div>
                    <input
                      type="date" value={tripForm.endDate}
                      onChange={e => setTripForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTrip}
                  disabled={!tripForm.destination || !tripForm.startDate || !tripForm.endDate}
                  className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                  style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                >
                  Create Trip (+20 XP)
                </button>
              </div>

              {/* Trip cards */}
              {data.trips.map(t => {
                const spent = tripSpent(t)
                const pct = t.budget > 0 ? Math.min(100, (spent / t.budget) * 100) : 0
                const over = t.budget > 0 && spent > t.budget
                const status = tripStatus(t)
                const selected = t.id === selectedTripId
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTripId(t.id)}
                    className="rounded-xl p-4 md:p-5 cursor-pointer transition"
                    style={{ background: CARD_BG, border: `2px solid ${selected ? ACCENT : CARD_BORDER}` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{t.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-bold text-sm text-[#09090F] truncate">
                          {t.destination}
                          {selected && <span className="ml-2 text-xs font-normal" style={{ color: ACCENT }}>● selected</span>}
                        </div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">{t.startDate} → {t.endDate}</div>
                      </div>
                      <span className="font-nunito font-bold text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: status.color + '18', color: status.color }}>
                        {status.label}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteTrip(t.id) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    {t.budget > 0 && (
                      <>
                        <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#E5E4E2' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: over ? BAD_COLOR : ACCENT }} />
                        </div>
                        <div className="flex justify-between text-xs text-[#09090F]/40 font-nunito">
                          <span>{formatRp(spent)} spent</span>
                          <span style={{ color: over ? BAD_COLOR : undefined }}>{over ? 'Over budget!' : `of ${formatRp(t.budget)}`}</span>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {data.trips.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">🌍</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No trips yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Plan your first adventure above — finishing a trip under budget earns +50 XP!</div>
                </div>
              )}
            </div>
          )}

          {/* ── ITINERARY ────────────────────────────────────── */}
          {mainTab === 'itinerary' && (
            <div className="space-y-4">
              {!selectedTrip ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">🗓️</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No trip selected</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Create or select a trip in the Trips tab first</div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      Add to {selectedTrip.emoji} {selectedTrip.destination}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="date" min={selectedTrip.startDate} max={selectedTrip.endDate} value={itemForm.day}
                        onChange={e => setItemForm(f => ({ ...f, day: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="time" value={itemForm.time}
                        onChange={e => setItemForm(f => ({ ...f, time: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                        style={inputStyle}
                      />
                      <input
                        type="text" placeholder="Activity" value={itemForm.title}
                        onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <input
                        type="text" placeholder="Location (optional)" value={itemForm.location}
                        onChange={e => setItemForm(f => ({ ...f, location: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                    </div>
                    <button
                      onClick={handleAddItem}
                      disabled={!itemForm.day || !itemForm.title}
                      className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                      style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                    >
                      Add to Itinerary
                    </button>
                  </div>

                  {itemDays.map(day => (
                    <div key={day} className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                        {day} {day === today && '· Today'}
                      </div>
                      <div className="space-y-2">
                        {selectedItems.filter(i => i.day === day).map(i => (
                          <div key={i.id} className="flex items-center gap-3">
                            <span className="font-nunito text-xs font-bold flex-shrink-0 w-12" style={{ color: ACCENT }}>{i.time ?? '—'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-nunito text-sm text-[#09090F] truncate">{i.title}</div>
                              {i.location && <div className="text-xs text-[#09090F]/40 font-nunito">📍 {i.location}</div>}
                            </div>
                            <button
                              onClick={() => handleDeleteItem(i.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {selectedItems.length === 0 && (
                    <div className="text-center py-8 rounded-xl text-xs text-[#09090F]/40 font-nunito" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      No itinerary items yet — plan your days above
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── BUDGET ───────────────────────────────────────── */}
          {mainTab === 'budget' && (
            <div className="space-y-4">
              {!selectedTrip ? (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">💰</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No trip selected</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Create or select a trip in the Trips tab first</div>
                </div>
              ) : (
                <>
                  {/* Budget bar */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                      {selectedTrip.emoji} {selectedTrip.destination} Budget
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-nunito font-black text-2xl" style={{ color: selectedTrip.budget > 0 && selectedSpent > selectedTrip.budget ? BAD_COLOR : '#09090F' }}>
                        {formatRp(selectedSpent)}
                      </span>
                      {selectedTrip.budget > 0 && <span className="font-nunito text-sm text-[#09090F]/40">of {formatRp(selectedTrip.budget)}</span>}
                    </div>
                    {selectedTrip.budget > 0 && (
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, (selectedSpent / selectedTrip.budget) * 100)}%`,
                            background: selectedSpent > selectedTrip.budget ? BAD_COLOR : ACCENT,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Log expense */}
                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Log Expense</div>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {EXPENSE_CATS.map(c => (
                        <button
                          key={c.key}
                          onClick={() => setExpenseForm(f => ({ ...f, category: c.key }))}
                          className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition"
                          style={expenseForm.category === c.key
                            ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                            : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `3px solid ${CARD_BORDER}` }}
                        >
                          {c.emoji} {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" placeholder="Amount (Rp)" value={expenseForm.amount}
                        onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                        className="w-32 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <input
                        type="text" placeholder="Note (optional)" value={expenseForm.note}
                        onChange={e => setExpenseForm(f => ({ ...f, note: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleAddExpense}
                        disabled={!expenseForm.amount}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {catTotals.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>By Category</div>
                      <div className="space-y-3">
                        {catTotals.map(c => (
                          <div key={c.key}>
                            <div className="flex justify-between text-xs font-nunito mb-1.5">
                              <span className="font-semibold text-[#09090F]">{c.emoji} {c.label}</span>
                              <span className="text-[#09090F]/60">
                                {selectedSpent > 0 ? Math.round((c.total / selectedSpent) * 100) : 0}% · {formatRp(c.total)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${selectedSpent > 0 ? (c.total / selectedSpent) * 100 : 0}%`, background: ACCENT + '99' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expense list */}
                  {selectedExpenses.map(e => {
                    const cat = EXPENSE_CATS.find(c => c.key === e.category)
                    return (
                      <div key={e.id} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                        <span className="text-lg flex-shrink-0">{cat?.emoji ?? '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{e.note || cat?.label || e.category}</div>
                          <div className="text-xs text-[#09090F]/50 font-nunito">{e.date}</div>
                        </div>
                        <span className="font-nunito font-bold text-sm flex-shrink-0" style={{ color: BAD_COLOR }}>−{formatRp(e.amount)}</span>
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'pet' && (
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
          )}

          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Travel Pet</span>
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
              {gameTab === 'clicker' && <StampRush onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <BaggageDrop onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <PackSmart onXPEarned={handleXPEarned} />}
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
            {upcomingTrip && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Next Adventure</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{upcomingTrip.emoji} {upcomingTrip.destination}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">
                  {upcomingTrip.startDate <= today ? 'Happening now!' : `${daysUntil(upcomingTrip.startDate)} days to go`}
                </div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FFEDD5', border: '1px solid #FED7AA' }}>
              <strong className="text-orange-700">Pet tip:</strong>{' '}
              <span className="text-orange-800">New trips earn +20 XP, expenses +8, and finishing a trip under budget +50!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
