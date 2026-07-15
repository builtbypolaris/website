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
import MoonTrace from '../games/MoonTrace'
import CalmCurrent from '../games/CalmCurrent'
import SymmetryBloom from '../games/SymmetryBloom'
import type { CycleData, CycleLog } from '../types'

const SYMPTOMS = ['cramps', 'headache', 'bloating', 'fatigue', 'acne', 'mood swings', 'tender', 'cravings']
const FLOW_LEVELS = [
  { value: 0, label: 'None',   emoji: '·' },
  { value: 1, label: 'Light',  emoji: '💧' },
  { value: 2, label: 'Medium', emoji: '💧💧' },
  { value: 3, label: 'Heavy',  emoji: '💧💧💧' },
]
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'today' | 'calendar' | 'insights' | 'pet' | 'games'

const ACCENT = '#E11D48'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const PERIOD_COLOR = '#FB7185'
const PREDICT_COLOR = '#FDA4AF'
const FERTILE_COLOR = '#C4B5FD'

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

  // Idle-day happiness decay — guarded to once per tracker per day
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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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

  const recentStarts = starts.slice(-7)  // up to 6 gaps
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

  const phase = !cycleDay ? '—'
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
      showToast('+15 XP — period logged. Take care of yourself 💗')
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
      showToast('+10 XP — period ended')
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
        showToast(hasYesterday ? `+${xpGain} XP — daily streak!` : `+${xpGain} XP!`)
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
    showToast(`${title} — +${xp} XP!`)
  }

  const toggleSymptom = (s: string) =>
    setLogForm(f => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s] }))

  // ── Calendar cells for viewMonth ──────────────────────────
  const year = viewMonth.getFullYear()
  const monthIdx = viewMonth.getMonth()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7  // 0 = Monday
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
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">🌸 Cycle Tracker <StreakBadge streak={streak} /></div>
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
              { label: 'Cycle day', value: cycleDay !== null ? `Day ${cycleDay}` : '—', color: ACCENT },
              { label: 'Next period', value: nextIn !== null ? (nextIn <= 0 ? 'Due now' : `${nextIn}d`) : '—', color: nextIn !== null && nextIn <= 3 ? '#DC2626' : '#09090F' },
              { label: 'Avg cycle', value: `${avgCycle}d`, color: '#09090F' },
              { label: 'Avg period', value: `${avgPeriodLen}d`, color: '#09090F' },
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
              { key: 'today',    label: '🌷 Today' },
              { key: 'calendar', label: '📆 Calendar' },
              { key: 'insights', label: '📈 Insights' },
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

          {/* ── TODAY ────────────────────────────────────────── */}
          {mainTab === 'today' && (
            <div className="space-y-4">

              {/* Phase + period buttons */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="font-nunito font-bold text-lg text-[#09090F]">
                      {cycleDay !== null ? `Cycle day ${cycleDay}` : 'No periods logged yet'}
                    </div>
                    <div className="text-xs font-nunito" style={{ color: ACCENT }}>{phase !== '—' ? `${phase} phase` : 'Log your first period to start tracking'}</div>
                  </div>
                  {ongoing ? (
                    <button
                      onClick={handleEndPeriod}
                      className="px-4 py-2.5 font-nunito font-bold text-sm rounded-xl transition active:scale-95"
                      style={{ background: '#FECDD3', color: '#9F1239' }}
                    >
                      Period ended today
                    </button>
                  ) : (
                    <button
                      onClick={handleStartPeriod}
                      disabled={lastStart === today}
                      className="px-4 py-2.5 text-white font-nunito font-bold text-sm rounded-xl transition active:scale-95 disabled:opacity-40"
                      style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                    >
                      Period started today
                    </button>
                  )}
                </div>
                {nextIn !== null && nextIn > 0 && (
                  <div className="text-xs text-[#09090F]/50 font-nunito">
                    Next period estimated in <strong style={{ color: ACCENT }}>{nextIn} days</strong> ({predictedStart})
                    {fertileStart && fertileEnd && <> · fertile window ≈ {fertileStart.slice(5)} – {fertileEnd.slice(5)}</>}
                  </div>
                )}
              </div>

              {/* Daily log */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>How's today?</div>

                <div className="text-xs text-[#09090F]/50 font-nunito mb-2">Flow</div>
                <div className="flex gap-1.5 mb-4">
                  {FLOW_LEVELS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setLogForm(prev => ({ ...prev, flow: f.value }))}
                      className="flex-1 py-2 rounded-lg font-nunito text-xs font-semibold transition"
                      style={logForm.flow === f.value
                        ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                        : { background: INPUT_BG, color: 'rgba(9,9,15,0.4)', border: `3px solid ${CARD_BORDER}` }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[#09090F]/50 font-nunito mb-2">Symptoms</div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {SYMPTOMS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition"
                      style={logForm.symptoms.includes(s)
                        ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                        : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `3px solid ${CARD_BORDER}` }}
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
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={() => saveLog(today, logForm)}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Save
                  </button>
                </div>
              </div>

              <p className="text-center text-xs font-nunito text-[#09090F]/30">
                Predictions are estimates based on your logged cycles — not medical advice.
              </p>
            </div>
          )}

          {/* ── CALENDAR ─────────────────────────────────────── */}
          {mainTab === 'calendar' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setViewMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d })}
                    className="w-8 h-8 rounded-lg hover:bg-black/5 transition font-nunito text-[#09090F]/60"
                  >
                    ←
                  </button>
                  <div className="font-nunito font-bold text-sm text-[#09090F]">{MONTH_NAMES[monthIdx]} {year}</div>
                  <button
                    onClick={() => setViewMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d })}
                    className="w-8 h-8 rounded-lg hover:bg-black/5 transition font-nunito text-[#09090F]/60"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-nunito text-[#09090F]/40 py-1">{d}</div>
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
                        className="aspect-square rounded-lg font-nunito text-xs flex flex-col items-center justify-center transition relative"
                        style={{
                          background: period ? PERIOD_COLOR : fertile ? FERTILE_COLOR + '55' : selectedDay === date ? INPUT_BG : 'transparent',
                          border: predicted ? `2px dashed ${PREDICT_COLOR}` : isToday ? `2px solid ${ACCENT}` : `1px solid ${selectedDay === date ? CARD_BORDER : 'transparent'}`,
                          color: period ? '#fff' : '#09090F',
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >
                        {Number(date.slice(8))}
                        {hasLog && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: period ? '#fff' : ACCENT }} />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 flex-wrap mt-4 pt-3 border-t" style={{ borderColor: CARD_BORDER }}>
                  {[
                    { color: PERIOD_COLOR, label: 'Period' },
                    { color: PREDICT_COLOR, label: 'Predicted', dashed: true },
                    { color: FERTILE_COLOR + '80', label: 'Fertile window' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded" style={{ background: l.dashed ? 'transparent' : l.color, border: l.dashed ? `2px dashed ${l.color}` : 'none' }} />
                      <span className="text-[10px] font-nunito text-[#09090F]/50">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDay && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>{selectedDay}</div>
                  {selectedLog ? (
                    <div className="space-y-1.5">
                      <div className="font-nunito text-sm text-[#09090F]">
                        Flow: <strong>{FLOW_LEVELS[selectedLog.flow].label}</strong>
                      </div>
                      {selectedLog.symptoms.length > 0 && (
                        <div className="font-nunito text-sm text-[#09090F]/60">{selectedLog.symptoms.map(s => `#${s}`).join(' ')}</div>
                      )}
                      {selectedLog.note && <div className="font-nunito text-xs text-[#09090F]/50">{selectedLog.note}</div>}
                    </div>
                  ) : (
                    <div className="font-nunito text-xs text-[#09090F]/40">No log for this day.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── INSIGHTS ─────────────────────────────────────── */}
          {mainTab === 'insights' && (
            <div className="space-y-4">
              {starts.length < 2 ? (
                <div className="text-center py-14 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-4xl mb-3">🌷</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Not enough data yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Log at least two periods to unlock cycle insights</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Average cycle', value: `${avgCycle} days`, color: ACCENT },
                      { label: 'Average period', value: `${avgPeriodLen} days`, color: ACCENT },
                      { label: 'Cycles tracked', value: String(gaps.length), color: '#09090F' },
                      { label: 'Daily logs', value: String(data.logs.length), color: '#09090F' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3.5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                        <div className="font-nunito font-bold text-lg mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Recent Cycles</div>
                    <div className="space-y-2.5">
                      {recentStarts.slice(0, -1).map((s, i) => {
                        const len = diffDays(s, recentStarts[i + 1])
                        return (
                          <div key={s} className="flex items-center gap-3">
                            <span className="font-nunito text-sm text-[#09090F] flex-1">{s}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (len / 40) * 100)}%`, background: ACCENT + '99' }} />
                            </div>
                            <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: ACCENT }}>{len}d</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {symptomCounts.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Most Common Symptoms</div>
                      <div className="space-y-3">
                        {symptomCounts.slice(0, 5).map(s => (
                          <div key={s.symptom}>
                            <div className="flex justify-between text-xs font-nunito mb-1.5">
                              <span className="font-semibold text-[#09090F]">#{s.symptom}</span>
                              <span className="text-[#09090F]/60">{s.count} day{s.count === 1 ? '' : 's'}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(s.count / symptomCounts[0].count) * 100}%`, background: ACCENT + '99' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <p className="text-center text-xs font-nunito text-[#09090F]/30">
                Estimates only — cycles vary. This is not medical advice.
              </p>
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
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
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Cycle Pet</span>
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
              {gameTab === 'clicker' && <MoonTrace onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <CalmCurrent onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <SymmetryBloom onXPEarned={handleXPEarned} />}
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
            {cycleDay !== null && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Current Phase</div>
                <div className="font-nunito font-bold text-lg text-[#09090F]">{phase}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">Day {cycleDay} of ~{avgCycle}</div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FFE4E6', border: '1px solid #FECDD3' }}>
              <strong className="text-rose-700">Pet tip:</strong>{' '}
              <span className="text-rose-800">Daily logs earn +8 XP (+5 streak bonus), period start +15, period end +10. Your data stays private to your account.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
