import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStudyData,
  addSubject as dbAddSubject,
  updateSubject as dbUpdateSubject,
  deleteSubject as dbDeleteSubject,
  addStudySession as dbAddSession,
  deleteStudySession as dbDeleteSession,
  saveStudyCharacter as dbSaveCharacter,
  addXP, todayStr,
} from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { STUDY_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import FocusBurst from '../games/FocusBurst'
import DeadlineDodge from '../games/DeadlineDodge'
import FlashOrder from '../games/FlashOrder'
import type { StudyData } from '../types'

const SUBJECT_COLORS = ['#6D28D9', '#0284C7', '#16A34A', '#D97706', '#DC2626', '#DB2777', '#0D9488']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'study' | 'subjects' | 'games'

const ACCENT = '#6D28D9'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E4E2'
const INPUT_BG = '#F0EEE8'

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!userId) return
    getStudyData(userId).then(setData)
  }, [userId])

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

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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
    const xpGain = Math.min(30, Math.floor(minutes / 5)) + (firstToday ? 10 : 0)
    try {
      const sess = await dbAddSession(userId, { subjectId, durationMinutes: minutes, notes, date: todayStr() })
      const newCharacter = addXP(data.character, xpGain)
      setData(d => d ? { ...d, sessions: [sess, ...d.sessions], character: newCharacter } : d)
      dbSaveCharacter(userId, newCharacter)
      showToast(firstToday ? `+${xpGain} XP (first session today!)` : `+${xpGain} XP!`)
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
    setData(d => d ? {
      ...d,
      subjects: d.subjects.filter(s => s.id !== id),
      sessions: d.sessions.filter(s => s.subjectId !== id),
    } : d)
    await dbDeleteSubject(id)
  }

  const handleXPEarned = (xp: number) => {
    const newCharacter = addXP(data.character, xp)
    setData(d => d ? { ...d, character: newCharacter } : d)
    dbSaveCharacter(userId, newCharacter)
    showToast(`+${xp} XP from game!`)
  }

  const recentSessions = data.sessions.slice(0, 8)

  const petCard = (
    <Character
      type="study"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

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
        <div className="font-nunito font-bold text-[#09090F] text-sm md:text-base">📚 Study Tracker</div>
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
              { label: 'This week', value: fmtHours(weekMinutes), color: ACCENT },
              { label: 'Total hours', value: fmtHours(totalMinutes), color: '#09090F' },
              { label: 'Day streak', value: `${streak}🔥`, color: '#D97706' },
              { label: 'Next exam', value: nextExam ? `${daysUntil(nextExam.examDate!)}d` : '—', color: nextExam && daysUntil(nextExam.examDate!) <= 7 ? '#DC2626' : '#16A34A' },
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
              { key: 'overview', label: '📊 Overview' },
              { key: 'study',    label: '⏱️ Study' },
              { key: 'subjects', label: '📚 Subjects' },
              { key: 'games',    label: '🎮 Games' },
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

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-4">

              {upcomingExams.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Upcoming Exams</div>
                  <div className="space-y-2.5">
                    {upcomingExams.map(s => {
                      const days = daysUntil(s.examDate!)
                      const urgent = days <= 7
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{s.name}</div>
                            <div className="text-xs text-[#09090F]/40 font-nunito">{s.examDate} · {fmtHours(minutesFor(s.id))} studied</div>
                          </div>
                          <span
                            className="font-nunito font-bold text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                            style={urgent
                              ? { background: '#FEE2E2', color: '#DC2626' }
                              : { background: ACCENT + '15', color: ACCENT }}
                          >
                            {days === 0 ? 'Today!' : `${days} day${days === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recentSessions.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Recent Sessions</div>
                    <button onClick={() => setMainTab('study')} className="text-xs font-nunito transition hover:opacity-70" style={{ color: ACCENT }}>
                      Log more →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recentSessions.slice(0, 3).map(sess => {
                      const subj = subjectById(sess.subjectId)
                      return (
                        <div key={sess.id} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: subj?.color ?? '#9CA3AF' }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-nunito text-sm text-[#09090F] truncate">{subj?.name ?? 'Unknown'}{sess.notes ? ` · ${sess.notes}` : ''}</div>
                            <div className="text-xs text-[#09090F]/40 font-nunito">{sess.date}</div>
                          </div>
                          <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: ACCENT }}>
                            {sess.durationMinutes} min
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {data.subjects.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">📚</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No subjects yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add your subjects in the Subjects tab, then start logging study time</div>
                </div>
              )}
            </div>
          )}

          {/* ── STUDY (timer + log) ──────────────────────────── */}
          {mainTab === 'study' && (
            <div className="space-y-4">

              {/* Timer */}
              <div className="rounded-xl p-4 md:p-5 text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Study Timer</div>
                <div
                  className="font-nunito font-black mb-4"
                  style={{ fontSize: 56, lineHeight: 1, color: timerRunning ? ACCENT : '#09090F', fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmtTimer(timerSeconds)}
                </div>
                <div className="flex justify-center gap-2">
                  {!timerRunning && timerSeconds === 0 && (
                    <button
                      onClick={() => setTimerRunning(true)}
                      className="px-6 py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                      style={{ background: ACCENT }}
                    >
                      ▶ Start
                    </button>
                  )}
                  {timerRunning && (
                    <button
                      onClick={() => setTimerRunning(false)}
                      className="px-6 py-2.5 font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                      style={{ background: INPUT_BG, color: '#09090F', border: `1px solid ${CARD_BORDER}` }}
                    >
                      ⏸ Pause
                    </button>
                  )}
                  {!timerRunning && timerSeconds > 0 && (
                    <button
                      onClick={() => setTimerRunning(true)}
                      className="px-6 py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                      style={{ background: ACCENT }}
                    >
                      ▶ Resume
                    </button>
                  )}
                  {timerSeconds > 0 && (
                    <button
                      onClick={handleStopTimer}
                      className="px-6 py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition active:scale-95"
                      style={{ background: '#DC2626' }}
                    >
                      ⏹ Stop & log
                    </button>
                  )}
                </div>
              </div>

              {/* Log form */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Log Session</div>
                {data.subjects.length === 0 ? (
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add a subject first in the Subjects tab.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={logForm.subjectId}
                        onChange={e => setLogForm(f => ({ ...f, subjectId: e.target.value }))}
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                        style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
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
                        className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={logForm.notes}
                        onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleLogManual()}
                        className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                        style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                      />
                      <button
                        onClick={handleLogManual}
                        disabled={!logForm.subjectId || !logForm.minutes}
                        className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                        style={{ background: ACCENT }}
                      >
                        Log
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Session history */}
              {recentSessions.length > 0 && (
                <div className="space-y-2">
                  {recentSessions.map(sess => {
                    const subj = subjectById(sess.subjectId)
                    return (
                      <div key={sess.id} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: subj?.color ?? '#9CA3AF' }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{subj?.name ?? 'Unknown'}</div>
                          <div className="text-xs text-[#09090F]/50 font-nunito">{sess.date}{sess.notes ? ` · ${sess.notes}` : ''}</div>
                        </div>
                        <span className="font-nunito font-bold text-sm flex-shrink-0" style={{ color: ACCENT }}>{sess.durationMinutes} min</span>
                        <button
                          onClick={() => handleDeleteSession(sess.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SUBJECTS ─────────────────────────────────────── */}
          {mainTab === 'subjects' && (
            <div className="space-y-4">

              {/* Add subject */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>New Subject</div>
                <div className="flex gap-1.5 mb-2">
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSubjectForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-lg transition"
                      style={{ background: c, outline: subjectForm.color === c ? `2px solid #09090F` : 'none', outlineOffset: 2 }}
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
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <input
                    type="date"
                    value={subjectForm.examDate}
                    onChange={e => setSubjectForm(f => ({ ...f, examDate: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                </div>
                <button
                  onClick={handleAddSubject}
                  disabled={!subjectForm.name}
                  className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                  style={{ background: ACCENT }}
                >
                  Add Subject
                </button>
                <div className="text-xs text-[#09090F]/30 font-nunito mt-2">Exam date is optional — set it to get a countdown.</div>
              </div>

              {data.subjects.map(s => {
                const mins = minutesFor(s.id)
                return (
                  <div key={s.id} className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-bold text-sm text-[#09090F] truncate">{s.name}</div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">
                          {fmtHours(mins)} total
                          {s.examDate && ` · exam ${s.examDate} (${daysUntil(s.examDate) >= 0 ? `${daysUntil(s.examDate)}d left` : 'passed'})`}
                        </div>
                      </div>
                      <input
                        type="date"
                        value={s.examDate ?? ''}
                        onChange={e => handleSetExamDate(s.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg font-nunito text-xs text-[#09090F] outline-none flex-shrink-0"
                        style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                      />
                      <button
                        onClick={() => handleDeleteSubject(s.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(mins / maxSubjectMinutes) * 100}%`, background: s.color }}
                      />
                    </div>
                  </div>
                )
              })}

              {data.subjects.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">📚</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No subjects yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add your first subject above to start tracking study time</div>
                </div>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Study Pet</span>
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
              {gameTab === 'clicker' && <FocusBurst onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <DeadlineDodge onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <FlashOrder onXPEarned={handleXPEarned} />}
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
            {nextExam && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Next Exam</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{nextExam.name}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">
                  {nextExam.examDate} · {daysUntil(nextExam.examDate!)} days left
                </div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE' }}>
              <strong className="text-violet-700">Pet tip:</strong>{' '}
              <span className="text-violet-800">Every 5 minutes studied = 1 XP (max 30/session). First session of the day earns +10 bonus XP!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
