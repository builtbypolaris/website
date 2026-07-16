import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCycleData,
  startPeriod as dbStartPeriod,
  endPeriod as dbEndPeriod,
  upsertCycleLog as dbUpsertLog,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { CYCLE_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import MoonTrace from '../games/MoonTrace'
import CalmCurrent from '../games/CalmCurrent'
import SymmetryBloom from '../games/SymmetryBloom'
import type { CycleData, CycleLog } from '../types'

const SYMPTOMS = ['cramps', 'headache', 'bloating', 'fatigue', 'acne', 'mood swings', 'tender', 'cravings']
const FLOW_LEVELS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Light' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Heavy' },
]
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'calendar' | 'insights' | 'pet' | 'games'

const ACCENT = '#E11D48'
const PERIOD_COLOR = '#FB7185'
const PREDICT_COLOR = '#FDA4AF'
const FERTILE_COLOR = '#C4B5FD'

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'insights', label: 'Insights' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function addDays(date: string, n: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default function Cycle() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<CycleData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('today')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [logForm, setLogForm] = useState<{ flow: number; symptoms: string[]; note: string }>({ flow: 0, symptoms: [], note: '' })
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  const today = todayStr()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'cycle').then(setStreak)
    getBadges(userId, 'cycle').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getCycleData(userId).then(d => {
      setData(d)
      const todayLog = d.logs.find(l => l.date === todayStr())
      if (todayLog) setLogForm({ flow: todayLog.flow, symptoms: todayLog.symptoms, note: todayLog.note })
    })
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'cycle', data.character).then(c => {
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

  // ── Cycle math ────────────────────────────────────────────
  const sortedPeriods = [...data.periods].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const starts = sortedPeriods.map(p => p.startDate)
  const lastStart = starts[starts.length - 1]
  const ongoing = sortedPeriods.length > 0 && !sortedPeriods[sortedPeriods.length - 1].endDate
    ? sortedPeriods[sortedPeriods.length - 1]
    : null

  const recentStarts = starts.slice(-7)
  const gaps = recentStarts.slice(1).map((s, i) => diffDays(recentStarts[i], s)).filter(g => g > 0)
  const avgCycle = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28

  const endedPeriods = sortedPeriods.filter(p => p.endDate)
  const periodLens = endedPeriods.map(p => diffDays(p.startDate, p.endDate!) + 1).filter(l => l > 0 && l < 15)
  const avgPeriodLen = periodLens.length > 0 ? Math.round(periodLens.reduce((a, b) => a + b, 0) / periodLens.length) : 5

  const cycleDay = lastStart ? diffDays(lastStart, today) + 1 : null
  const predictedStart = lastStart ? addDays(lastStart, avgCycle) : null
  const nextIn = predictedStart ? diffDays(today, predictedStart) : null
  const fertileStart = predictedStart ? addDays(predictedStart, -16) : null
  const fertileEnd = predictedStart ? addDays(predictedStart, -12) : null

  const phase = !cycleDay ? null
    : ongoing ? 'Menstrual'
    : cycleDay <= avgPeriodLen ? 'Menstrual'
    : fertileStart && today >= fertileStart && fertileEnd && today <= fertileEnd ? 'Fertile window'
    : cycleDay < avgCycle - 16 ? 'Follicular'
    : 'Luteal'

  const isPeriodDay = (date: string) =>
    sortedPeriods.some(p => {
      const end = p.endDate ?? (p === ongoing ? today : addDays(p.startDate, avgPeriodLen - 1))
      return date >= p.startDate && date <= end
    })
  const isPredictedDay = (date: string) =>
    !!predictedStart && date >= predictedStart && date <= addDays(predictedStart, avgPeriodLen - 1)
  const isFertileDay = (date: string) =>
    !!fertileStart && !!fertileEnd && date >= fertileStart && date <= fertileEnd

  const petStage = getStageFromXP(CYCLE_STAGES, data.character.xp)

  const symptomCounts = SYMPTOMS
    .map(s => ({ symptom: s, count: data.logs.filter(l => l.symptoms.includes(s)).length }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)

  const applyXP = (xpGain: number, patch: Partial<CycleData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    void awardXP(userId, 'cycle', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleStartPeriod = async () => {
    if (ongoing || lastStart === today) return
    try {
      const period = await dbStartPeriod(userId, today)
      applyXP(15, { periods: [...data.periods, period] })
      showToast('+15 XP, period logged. Take care of yourself')
    } catch {
      showToast('Failed to log period', false)
    }
  }

  const handleEndPeriod = async () => {
    if (!ongoing) return
    try {
      await dbEndPeriod(ongoing.id, today)
      const nextPeriods = data.periods.map(p => p.id === ongoing.id ? { ...p, endDate: today } : p)
      applyXP(10, { periods: nextPeriods })
      showToast('+10 XP, period ended')
    } catch {
      showToast('Failed to update period', false)
    }
  }

  const saveLog = async (date: string, form: { flow: number; symptoms: string[]; note: string }) => {
    const isNew = !data.logs.some(l => l.date === date)
    const hasYesterday = data.logs.some(l => l.date === addDays(date, -1))
    const xpGain = isNew ? 8 + (hasYesterday ? 5 : 0) : 0
    const log: CycleLog = { date, ...form }
    try {
      await dbUpsertLog(userId, log)
      const nextLogs = [log, ...data.logs.filter(l => l.date !== date)]
      if (xpGain > 0) {
        applyXP(xpGain, { logs: nextLogs })
        showToast(hasYesterday ? `+${xpGain} XP, daily streak!` : `+${xpGain} XP!`)
      } else {
        setData(d => d ? { ...d, logs: nextLogs } : d)
        showToast('Log updated!')
      }
    } catch {
      showToast('Failed to save log', false)
    }
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, {}, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, {})
    showToast(`${title}: +${xp} XP!`)
  }

  const toggleSymptom = (s: string) =>
    setLogForm(f => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s] }))

  // ── Calendar cells for viewMonth ──────────────────────────
  const year = viewMonth.getFullYear()
  const monthIdx = viewMonth.getMonth()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7
  const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
  const calendarCells: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`),
  ]

  const selectedLog = selectedDay ? data.logs.find(l => l.date === selectedDay) : null

  const petCard = (
    <Character
      type="cycle"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const todayCycleLog = data.logs.find(l => l.date === todayStr())
  const dailyChallenges = [
    { id: 'log', title: 'Log today', emoji: '🌸', xp: 10, met: !!todayCycleLog },
    { id: 'symptom', title: 'Track a symptom', emoji: '📋', xp: 15, met: (todayCycleLog?.symptoms.length ?? 0) > 0 },
    { id: 'note', title: 'Add a note', emoji: '✍️', xp: 10, met: (todayCycleLog?.note ?? '').trim().length > 0 },
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
          Cycle <StreakBadge streak={streak} />
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
              { label: 'Cycle day', value: cycleDay !== null ? `Day ${cycleDay}` : '—', color: ACCENT },
              { label: 'Next period', value: nextIn !== null ? (nextIn <= 0 ? 'Due now' : `${nextIn}d`) : '—', color: nextIn !== null && nextIn <= 3 ? '#DC2626' : INK },
              { label: 'Avg cycle', value: `${avgCycle}d`, color: INK },
              { label: 'Avg period', value: `${avgPeriodLen}d`, color: INK },
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

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-nunito font-semibold text-base" style={{ color: INK }}>
                    {cycleDay !== null ? `Cycle day ${cycleDay}` : 'No periods logged yet'}
                  </div>
                  <div className="font-nunito text-xs" style={{ color: ACCENT }}>{phase ? `${phase} phase` : 'Log your first period to start tracking'}</div>
                </div>
                {ongoing ? (
                  <NButton onClick={handleEndPeriod} variant="ghost" accent={ACCENT} style={{ background: `${ACCENT}18` }}>
                    Period ended today
                  </NButton>
                ) : (
                  <NButton onClick={handleStartPeriod} disabled={lastStart === today} accent={ACCENT}>
                    Period started today
                  </NButton>
                )}
              </div>
              {nextIn !== null && nextIn > 0 && (
                <div className="font-nunito text-xs -mt-3" style={{ color: MUTED }}>
                  Next period estimated in <strong style={{ color: ACCENT }}>{nextIn} days</strong> ({predictedStart})
                  {fertileStart && fertileEnd && <> · fertile window ≈ {fertileStart.slice(5)} to {fertileEnd.slice(5)}</>}
                </div>
              )}

              <Panel tone="tint" accent={ACCENT} className="p-4 md:p-5">
                <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>Flow</div>
                <div className="flex gap-1.5 mb-4">
                  {FLOW_LEVELS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setLogForm(prev => ({ ...prev, flow: f.value }))}
                      className="flex-1 py-2 rounded-full font-nunito text-xs transition-colors"
                      style={logForm.flow === f.value ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>Symptoms</div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {SYMPTOMS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors"
                      style={logForm.symptoms.includes(s) ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Note (optional)" value={logForm.note}
                    onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && saveLog(today, logForm)}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <NButton onClick={() => saveLog(today, logForm)} accent={ACCENT}>Save</NButton>
                </div>
              </Panel>

              <p className="text-center font-nunito text-xs" style={{ color: `${INK}44` }}>
                Predictions are estimates based on your logged cycles. Not medical advice.
              </p>
            </div>
          )}

          {/* ── CALENDAR ─────────────────────────────────────── */}
          {mainTab === 'calendar' && (
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setViewMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d })} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>
                  ←
                </button>
                <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{MONTH_NAMES[monthIdx]} {year}</div>
                <button onClick={() => setViewMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d })} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center font-nunito text-[10px] py-1" style={{ color: MUTED }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((date, i) => {
                  if (!date) return <div key={`blank-${i}`} />
                  const period = isPeriodDay(date)
                  const predicted = !period && isPredictedDay(date)
                  const fertile = !period && !predicted && isFertileDay(date)
                  const hasLog = data.logs.some(l => l.date === date)
                  const isToday = date === today
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                      className="aspect-square rounded-lg font-nunito text-xs flex flex-col items-center justify-center transition-colors relative"
                      style={{
                        background: period ? PERIOD_COLOR : fertile ? `${FERTILE_COLOR}55` : selectedDay === date ? `${INK}08` : 'transparent',
                        border: predicted ? `2px dashed ${PREDICT_COLOR}` : isToday ? `2px solid ${ACCENT}` : 'none',
                        color: period ? '#fff' : INK,
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {Number(date.slice(8))}
                      {hasLog && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: period ? '#fff' : ACCENT }} />}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 flex-wrap mt-4">
                {[
                  { color: PERIOD_COLOR, label: 'Period' },
                  { color: PREDICT_COLOR, label: 'Predicted', dashed: true },
                  { color: `${FERTILE_COLOR}80`, label: 'Fertile window' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background: l.dashed ? 'transparent' : l.color, border: l.dashed ? `2px dashed ${l.color}` : 'none' }} />
                    <span className="font-nunito text-[10px]" style={{ color: MUTED }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {selectedDay && (
                <div className="mt-6">
                  <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>{selectedDay}</div>
                  {selectedLog ? (
                    <div className="space-y-1">
                      <div className="font-nunito text-sm" style={{ color: INK }}>Flow: {FLOW_LEVELS[selectedLog.flow].label}</div>
                      {selectedLog.symptoms.length > 0 && <div className="font-nunito text-sm" style={{ color: MUTED }}>{selectedLog.symptoms.map(s => `#${s}`).join(' ')}</div>}
                      {selectedLog.note && <div className="font-nunito text-xs" style={{ color: MUTED }}>{selectedLog.note}</div>}
                    </div>
                  ) : (
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>No log for this day.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── INSIGHTS ─────────────────────────────────────── */}
          {mainTab === 'insights' && (
            <div className="space-y-8 max-w-xl">
              {starts.length < 2 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>Not enough data yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Log at least two periods to unlock cycle insights</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                      { label: 'Average cycle', value: `${avgCycle} days`, color: ACCENT },
                      { label: 'Average period', value: `${avgPeriodLen} days`, color: ACCENT },
                      { label: 'Cycles tracked', value: String(gaps.length), color: INK },
                      { label: 'Daily logs', value: String(data.logs.length), color: INK },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-nunito font-bold text-lg leading-none" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>Recent cycles</div>
                    <div className="space-y-3">
                      {recentStarts.slice(0, -1).map((s, i) => {
                        const len = diffDays(s, recentStarts[i + 1])
                        return (
                          <div key={s} className="flex items-center gap-3">
                            <span className="font-nunito text-sm flex-1" style={{ color: INK }}>{s}</span>
                            <div className="flex-1">
                              <NProgress pct={Math.min(100, (len / 40) * 100)} accent={ACCENT} height={4} />
                            </div>
                            <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: ACCENT }}>{len}d</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {symptomCounts.length > 0 && (
                    <div>
                      <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>Most common symptoms</div>
                      <div className="space-y-3">
                        {symptomCounts.slice(0, 5).map(s => (
                          <div key={s.symptom}>
                            <div className="flex justify-between font-nunito text-xs mb-1.5">
                              <span style={{ color: INK }}>#{s.symptom}</span>
                              <span style={{ color: MUTED }}>{s.count} day{s.count === 1 ? '' : 's'}</span>
                            </div>
                            <NProgress pct={(s.count / symptomCounts[0].count) * 100} accent={ACCENT} height={4} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <p className="text-center font-nunito text-xs" style={{ color: `${INK}44` }}>
                Estimates only, cycles vary. This is not medical advice.
              </p>
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="cycle" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="cycle"
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
              {gameTab === 'clicker' && <MoonTrace onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <CalmCurrent onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <SymmetryBloom onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {cycleDay !== null && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Current phase</div>
                <div className="font-nunito font-bold text-lg" style={{ color: INK }}>{phase}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>Day {cycleDay} of ~{avgCycle}</div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Daily logs earn +8 XP with a +5 streak bonus, period start +15, period end +10. Your data stays private to your account.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
