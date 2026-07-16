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
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import StampRush from '../games/StampRush'
import BaggageDrop from '../games/BaggageDrop'
import PackSmart from '../games/PackSmart'
import type { TravelData, Trip } from '../types'

const TRIP_EMOJIS = ['✈️', '🏝️', '🗻', '🏙️', '🚂', '🛳️', '🏕️', '🕌']
const EXPENSE_CATS = [
  { key: 'transport',  label: 'Transport' },
  { key: 'stay',       label: 'Stay' },
  { key: 'food',       label: 'Food' },
  { key: 'activities', label: 'Activities' },
  { key: 'shopping',   label: 'Shopping' },
  { key: 'other',      label: 'Other' },
]

const ITEM_XP_CAP = 5
const XP_AWARDED_KEY = 'novo-travel-trip-xp'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'trips' | 'itinerary' | 'budget' | 'pet' | 'games'

const ACCENT = '#EA580C'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'trips', label: 'Trips' },
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'budget', label: 'Budget' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

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
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
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
    if (t.endDate < today) return { label: 'Completed', color: MUTED }
    if (t.startDate <= today) return { label: 'Ongoing', color: GOOD_COLOR }
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

          {/* ── TRIPS ────────────────────────────────────────── */}
          {mainTab === 'trips' && (
            <div className="max-w-xl">

              <Panel tone="tint" accent={ACCENT} className="p-4 mb-5">
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

              {data.trips.map((t, i) => {
                const spent = tripSpent(t)
                const pct = t.budget > 0 ? Math.min(100, (spent / t.budget) * 100) : 0
                const over = t.budget > 0 && spent > t.budget
                const status = tripStatus(t)
                const selected = t.id === selectedTripId
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTripId(t.id)}
                    className="py-4 cursor-pointer"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl flex-shrink-0">{t.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm truncate" style={{ color: selected ? ACCENT : INK }}>
                          {t.destination}
                        </div>
                        <div className="font-nunito text-xs" style={{ color: MUTED }}>{t.startDate} to {t.endDate}</div>
                      </div>
                      <span className="font-nunito text-xs flex-shrink-0" style={{ color: status.color }}>{status.label}</span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteTrip(t.id) }} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                    </div>
                    {t.budget > 0 && (
                      <>
                        <NProgress pct={pct} accent={over ? BAD_COLOR : ACCENT} height={4} />
                        <div className="flex justify-between font-nunito text-xs mt-1" style={{ color: MUTED }}>
                          <span>{formatRp(spent)} spent</span>
                          <span style={{ color: over ? BAD_COLOR : undefined }}>{over ? 'Over budget' : `of ${formatRp(t.budget)}`}</span>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {data.trips.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No trips yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Plan your first adventure above, finishing a trip under budget earns +50 XP</div>
                </div>
              )}
            </div>
          )}

          {/* ── ITINERARY ────────────────────────────────────── */}
          {mainTab === 'itinerary' && (
            <div className="max-w-xl">
              {!selectedTrip ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No trip selected</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Create or select a trip in the Trips tab first</div>
                </div>
              ) : (
                <>
                  <Panel tone="tint" accent={ACCENT} className="p-4 mb-5">
                    <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>
                      Add to {selectedTrip.emoji} {selectedTrip.destination}
                    </div>
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

                  {itemDays.map(day => (
                    <div key={day} className="mb-6">
                      <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>
                        {day} {day === today && '· Today'}
                      </div>
                      <div>
                        {selectedItems.filter(i => i.day === day).map((i, idx) => (
                          <div key={i.id} className="flex items-center gap-3 py-2" style={{ borderTop: idx === 0 ? 'none' : `1px solid ${INK}0D` }}>
                            <span className="font-nunito text-xs font-medium flex-shrink-0 w-12" style={{ color: ACCENT }}>{i.time ?? '—'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-nunito text-sm truncate" style={{ color: INK }}>{i.title}</div>
                              {i.location && <div className="font-nunito text-xs" style={{ color: MUTED }}>{i.location}</div>}
                            </div>
                            <button onClick={() => handleDeleteItem(i.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {selectedItems.length === 0 && (
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>No itinerary items yet, plan your days above</div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── BUDGET ───────────────────────────────────────── */}
          {mainTab === 'budget' && (
            <div className="max-w-xl">
              {!selectedTrip ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No trip selected</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Create or select a trip in the Trips tab first</div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>
                      {selectedTrip.emoji} {selectedTrip.destination} budget
                    </div>
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

                  <Panel tone="tint" accent={ACCENT} className="p-4 mb-6">
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
                </>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
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
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
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
              New trips earn +20 XP, expenses +8, and finishing a trip under budget earns +50.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
