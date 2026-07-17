import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStudyData,
  addSubject as dbAddSubject,
  updateSubject as dbUpdateSubject,
  deleteSubject as dbDeleteSubject,
  addStudySession as dbAddSession,
  deleteStudySession as dbDeleteSession,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { STUDY_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import FocusBurst from '../games/FocusBurst'
import DeadlineDodge from '../games/DeadlineDodge'
import FlashOrder from '../games/FlashOrder'
import type { CharacterState, StudyData } from '../types'

const SUBJECT_COLORS = ['#6D28D9', '#0284C7', '#16A34A', '#D97706', '#DC2626', '#DB2777', '#0D9488']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'study' | 'subjects' | 'pet' | 'games'

const ACCENT = '#6D28D9'
const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'study', label: 'Study' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function fmtHours(minutes: number) {
  const h = minutes / 60
  return h >= 10 ? `${Math.round(h)}h` : `${h.toFixed(1)}h`
}

function fmtTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 86400000)
}

export default function Study() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<StudyData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [subjectForm, setSubjectForm] = useState({ name: '', color: SUBJECT_COLORS[0], examDate: '' })
  const [logForm, setLogForm] = useState({ subjectId: '', minutes: '', notes: '' })
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [dayStreak, setDayStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'study').then(setDayStreak)
    getBadges(userId, 'study').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getStudyData(userId).then(setData)
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'study', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  // Study timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  const runAward = (before: CharacterState, gain: number, kind: 'log' | 'game' = 'log') => {
    void awardXP(userId, 'study', before, gain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setDayStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  const weekMinutes = data.sessions.filter(s => s.date >= weekAgoStr).reduce((s, x) => s + x.durationMinutes, 0)
  const totalMinutes = data.sessions.reduce((s, x) => s + x.durationMinutes, 0)

  // Daily streak: consecutive days with a session, counting back from today (or yesterday)
  const sessionDays = new Set(data.sessions.map(s => s.date))
  let streak = 0
  const cursor = new Date()
  if (!sessionDays.has(todayStr())) cursor.setDate(cursor.getDate() - 1)
  while (sessionDays.has(cursor.toISOString().split('T')[0])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const upcomingExams = data.subjects
    .filter(s => s.examDate && daysUntil(s.examDate) >= 0)
    .sort((a, b) => a.examDate!.localeCompare(b.examDate!))
  const nextExam = upcomingExams[0]

  const petStage = getStageFromXP(STUDY_STAGES, data.character.xp)

  const subjectById = (id: string) => data.subjects.find(s => s.id === id)
  const minutesFor = (subjectId: string) =>
    data.sessions.filter(s => s.subjectId === subjectId).reduce((s, x) => s + x.durationMinutes, 0)
  const maxSubjectMinutes = Math.max(...data.subjects.map(s => minutesFor(s.id)), 1)

  // ── Actions ───────────────────────────────────────────────
  const logSession = async (minutes: number, subjectId: string, notes: string) => {
    if (!subjectId || minutes <= 0) return false
    const firstToday = !data.sessions.some(s => s.date === todayStr())
    // Sessions under 10 minutes barely count, no first-of-day bonus either
    const xpGain = minutes < 10 ? 2 : Math.min(30, Math.floor(minutes / 5)) + (firstToday ? 10 : 0)
    try {
      const sess = await dbAddSession(userId, { subjectId, durationMinutes: minutes, notes, date: todayStr() })
      const before = data.character
      setData(d => d ? { ...d, sessions: [sess, ...d.sessions], character: addXP(before, xpGain) } : d)
      runAward(before, xpGain)
      showToast(firstToday ? `+${xpGain} XP, first session today!` : `+${xpGain} XP!`)
      return true
    } catch {
      showToast('Failed to save session', false)
      return false
    }
  }

  const handleLogManual = async () => {
    const minutes = Math.abs(Number(logForm.minutes))
    if (!logForm.subjectId || !minutes || isNaN(minutes)) return
    const ok = await logSession(minutes, logForm.subjectId, logForm.notes)
    if (ok) setLogForm(f => ({ ...f, minutes: '', notes: '' }))
  }

  const handleStopTimer = async () => {
    setTimerRunning(false)
    const minutes = Math.round(timerSeconds / 60)
    if (minutes < 1) {
      setTimerSeconds(0)
      showToast('Study at least a minute to log it!', false)
      return
    }
    setLogForm(f => ({ ...f, minutes: String(minutes) }))
    setTimerSeconds(0)
    showToast(`${minutes} min ready to log below!`)
  }

  const handleDeleteSession = async (id: string) => {
    setData(d => d ? { ...d, sessions: d.sessions.filter(s => s.id !== id) } : d)
    await dbDeleteSession(id)
  }

  const handleAddSubject = async () => {
    if (!subjectForm.name) return
    try {
      const subject = await dbAddSubject(userId, {
        name: subjectForm.name,
        color: subjectForm.color,
        examDate: subjectForm.examDate || undefined,
      })
      setData(d => d ? { ...d, subjects: [...d.subjects, subject] } : d)
      setSubjectForm({ name: '', color: SUBJECT_COLORS[0], examDate: '' })
      showToast('Subject added!')
    } catch {
      showToast('Failed to add subject', false)
    }
  }

  const handleSetExamDate = async (id: string, examDate: string) => {
    setData(d => d ? { ...d, subjects: d.subjects.map(s => s.id === id ? { ...s, examDate: examDate || undefined } : s) } : d)
    await dbUpdateSubject(id, { examDate: examDate || null })
  }

  const handleDeleteSubject = async (id: string) => {
    const hadSessions = data.sessions.some(s => s.subjectId === id)
    const before = data.character
    setData(d => d ? {
      ...d,
      subjects: d.subjects.filter(s => s.id !== id),
      sessions: d.sessions.filter(s => s.subjectId !== id),
      character: hadSessions ? addXP(before, -5) : d.character,
    } : d)
    await dbDeleteSubject(id)
    if (hadSessions) {
      runAward(before, -5)
      showToast('−5 XP, subject dropped with study history', false)
    }
  }

  const handleXPEarned = (xp: number) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(`${title}: +${xp} XP!`)
  }

  const recentSessions = data.sessions.slice(0, 8)

  const petCard = (
    <Character
      type="study"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const minutesToday = data.sessions.filter(s => s.date === todayStr()).reduce((sum, x) => sum + x.durationMinutes, 0)
  const dailyChallenges = [
    { id: 's1', title: 'Study once', emoji: '📖', xp: 10, met: data.sessions.some(s => s.date === todayStr()) },
    { id: 'm30', title: 'Study 30+ minutes', emoji: '⏱️', xp: 20, met: minutesToday >= 30 },
    { id: 'm60', title: 'Study 60+ minutes', emoji: '🎓', xp: 35, met: minutesToday >= 60 },
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
          Study <StreakBadge streak={dayStreak} />
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
              { label: 'This week', value: fmtHours(weekMinutes), color: ACCENT },
              { label: 'Total hours', value: fmtHours(totalMinutes), color: INK },
              { label: 'Day streak', value: String(streak), color: '#D97706' },
              { label: 'Next exam', value: nextExam ? `${daysUntil(nextExam.examDate!)}d` : '—', color: nextExam && daysUntil(nextExam.examDate!) <= 7 ? '#DC2626' : '#16A34A' },
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

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <>
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-8">
              {upcomingExams.length > 0 && (
                <div>
                  <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Upcoming exams</div>
                  <div className="space-y-2.5">
                    {upcomingExams.map(s => {
                      const days = daysUntil(s.examDate!)
                      const urgent = days <= 7
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{s.name}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>{s.examDate} · {fmtHours(minutesFor(s.id))} studied</div>
                          </div>
                          <span className="font-nunito text-xs flex-shrink-0" style={{ color: urgent ? '#DC2626' : ACCENT }}>
                            {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recentSessions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Recent sessions</div>
                    <button onClick={() => setMainTab('study')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      Log more
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recentSessions.slice(0, 3).map(sess => {
                      const subj = subjectById(sess.subjectId)
                      return (
                        <div key={sess.id} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: subj?.color ?? '#9CA3AF' }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm truncate" style={{ color: INK }}>{subj?.name ?? 'Unknown'}{sess.notes ? ` · ${sess.notes}` : ''}</div>
                            <div className="font-nunito text-xs" style={{ color: MUTED }}>{sess.date}</div>
                          </div>
                          <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: ACCENT }}>{sess.durationMinutes} min</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {data.subjects.length === 0 && (
              <div className="py-10 text-center">
                <div className="font-nunito text-sm" style={{ color: INK }}>No subjects yet</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add your subjects in the Subjects tab, then start logging study time</div>
              </div>
            )}
            </>
          )}

          {/* ── STUDY (timer + log) ──────────────────────────── */}
          {mainTab === 'study' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
            <div className="space-y-5">

              {/* Timer — the one loud panel on this tab */}
              <Panel accent={ACCENT} tone="fill" className="p-6 text-center">
                <div
                  className="font-nunito font-bold text-white mb-4"
                  style={{ fontSize: 56, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmtTimer(timerSeconds)}
                </div>
                <div className="flex justify-center gap-2">
                  {!timerRunning && timerSeconds === 0 && (
                    <NButton onClick={() => setTimerRunning(true)} variant="ghost" accent="#FFFFFF" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      Start
                    </NButton>
                  )}
                  {timerRunning && (
                    <NButton onClick={() => setTimerRunning(false)} variant="ghost" accent="#FFFFFF" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      Pause
                    </NButton>
                  )}
                  {!timerRunning && timerSeconds > 0 && (
                    <NButton onClick={() => setTimerRunning(true)} variant="ghost" accent="#FFFFFF" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      Resume
                    </NButton>
                  )}
                  {timerSeconds > 0 && (
                    <NButton onClick={handleStopTimer} accent="#FFFFFF" style={{ color: ACCENT }}>
                      Stop & log
                    </NButton>
                  )}
                </div>
              </Panel>

              {/* Log form */}
              <Panel tone="tint" accent={ACCENT} className="p-4">
                {data.subjects.length === 0 ? (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>Add a subject first in the Subjects tab.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={logForm.subjectId}
                        onChange={e => setLogForm(f => ({ ...f, subjectId: e.target.value }))}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={{ background: '#FFFFFF', color: INK }}
                      >
                        <option value="">Subject…</option>
                        {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Minutes"
                        value={logForm.minutes}
                        onChange={e => setLogForm(f => ({ ...f, minutes: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleLogManual()}
                        className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={{ background: '#FFFFFF', color: INK }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={logForm.notes}
                        onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleLogManual()}
                        className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                        style={{ background: '#FFFFFF', color: INK }}
                      />
                      <NButton onClick={handleLogManual} disabled={!logForm.subjectId || !logForm.minutes} accent={ACCENT}>Log</NButton>
                    </div>
                  </>
                )}
              </Panel>
            </div>

            {/* Session history */}
            <div>
              {recentSessions.length > 0 && (
                <div>
                  {recentSessions.map((sess, i) => {
                    const subj = subjectById(sess.subjectId)
                    return (
                      <div key={sess.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: subj?.color ?? '#9CA3AF' }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm truncate" style={{ color: INK }}>{subj?.name ?? 'Unknown'}</div>
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{sess.date}{sess.notes ? ` · ${sess.notes}` : ''}</div>
                        </div>
                        <span className="font-nunito font-medium text-sm flex-shrink-0" style={{ color: ACCENT }}>{sess.durationMinutes} min</span>
                        <button onClick={() => handleDeleteSession(sess.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            </div>
          )}

          {/* ── SUBJECTS ─────────────────────────────────────── */}
          {mainTab === 'subjects' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <Panel tone="tint" accent={ACCENT} className="p-4">
                <div className="flex gap-1.5 mb-2">
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSubjectForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-opacity"
                      style={{ background: c, opacity: subjectForm.color === c ? 1 : 0.45 }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Subject name"
                    value={subjectForm.name}
                    onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <input
                    type="date"
                    value={subjectForm.examDate}
                    onChange={e => setSubjectForm(f => ({ ...f, examDate: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                </div>
                <NButton onClick={handleAddSubject} disabled={!subjectForm.name} accent={ACCENT} className="w-full">Add subject</NButton>
                <div className="font-nunito text-xs mt-2" style={{ color: MUTED }}>Exam date is optional. Set it to get a countdown.</div>
              </Panel>
            </div>

            <div>
              {data.subjects.map((s, i) => {
                const mins = minutesFor(s.id)
                return (
                  <div key={s.id} className="py-4" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm truncate" style={{ color: INK }}>{s.name}</div>
                        <div className="font-nunito text-xs" style={{ color: MUTED }}>
                          {fmtHours(mins)} total
                          {s.examDate && ` · exam ${s.examDate} (${daysUntil(s.examDate) >= 0 ? `${daysUntil(s.examDate)}d left` : 'passed'})`}
                        </div>
                      </div>
                      <input
                        type="date"
                        value={s.examDate ?? ''}
                        onChange={e => handleSetExamDate(s.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg font-nunito text-xs outline-none flex-shrink-0"
                        style={{ background: '#F0EEE8', color: INK }}
                      />
                      <button onClick={() => handleDeleteSubject(s.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                    </div>
                    <NProgress pct={(mins / maxSubjectMinutes) * 100} accent={s.color} height={4} />
                  </div>
                )
              })}

              {data.subjects.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No subjects yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add your first subject above to start tracking study time</div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="study" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="study"
                character={data.character}
                streak={dayStreak}
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
              {gameTab === 'clicker' && <FocusBurst onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <DeadlineDodge onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <FlashOrder onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {nextExam && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Next exam</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{nextExam.name}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{nextExam.examDate} · {daysUntil(nextExam.examDate!)} days left</div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Every 5 minutes studied earns 1 XP, up to 30 per session. The first session of the day earns +10 bonus.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
