import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMoodData,
  addMoodEntry as dbAddEntry,
  deleteMoodEntry as dbDeleteEntry,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, type StreakRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { BadgeWall } from '../components/BadgeWall'
import { useAuth } from '../contexts/AuthContext'
import { MOOD_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import ZenPop from '../games/ZenPop'
import CloudGlide from '../games/CloudGlide'
import EmojiFlow from '../games/EmojiFlow'
import type { CharacterState, MoodData, MoodEntry, MoodLevel } from '../types'

const MOOD_META: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 1, emoji: '😢', label: 'Awful', color: '#DC2626' },
  { level: 2, emoji: '😕', label: 'Bad',   color: '#F97316' },
  { level: 3, emoji: '😐', label: 'Okay',  color: '#EAB308' },
  { level: 4, emoji: '😊', label: 'Good',  color: '#84CC16' },
  { level: 5, emoji: '😄', label: 'Great', color: '#16A34A' },
]

const TAGS = ['work', 'family', 'health', 'social', 'study', 'other']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const XP_CHECKINS_PER_DAY = 3

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'history' | 'trends' | 'games'

const ACCENT = '#DB2777'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'

function entryDate(e: MoodEntry) { return e.entryAt.slice(0, 10) }
function entryTime(e: MoodEntry) { return new Date(e.entryAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
function moodMeta(level: number) { return MOOD_META[Math.min(4, Math.max(0, level - 1))] }

function avgMood(entries: MoodEntry[]): number | null {
  if (entries.length === 0) return null
  return entries.reduce((s, e) => s + e.mood, 0) / entries.length
}

export default function Mood() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<MoodData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [checkin, setCheckin] = useState<{ mood: MoodLevel | null; tags: string[]; note: string }>({ mood: null, tags: [], note: '' })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [dayStreak, setDayStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'mood').then(setDayStreak)
    getBadges(userId, 'mood').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getMoodData(userId).then(setData)
  }, [userId])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  const runAward = (before: CharacterState, gain: number, kind: 'log' | 'game' = 'log') => {
    void awardXP(userId, 'mood', before, gain, kind).then(r => {
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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const today = todayStr()
  const todayEntries = data.entries.filter(e => entryDate(e) === today)

  const daysWithEntries = new Set(data.entries.map(entryDate))
  let streak = 0
  const cursor = new Date()
  if (!daysWithEntries.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (daysWithEntries.has(cursor.toISOString().split('T')[0])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const entriesSince = (days: number) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return data.entries.filter(e => new Date(e.entryAt) >= cutoff)
  }
  const avg7 = avgMood(entriesSince(7))
  const avg30 = avgMood(entriesSince(30))

  const petStage = getStageFromXP(MOOD_STAGES, data.character.xp)

  // ── Heatmap: last 12 full weeks aligned Mon-Sun ───────────
  const heatmapWeeks: string[][] = (() => {
    const end = new Date()
    // Push end to the coming Sunday so the current partial week renders
    const endDow = (end.getDay() + 6) % 7  // 0 = Monday
    end.setDate(end.getDate() + (6 - endDow))
    const weeks: string[][] = []
    for (let w = 11; w >= 0; w--) {
      const week: string[] = []
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - w * 7 - d)
        week.push(day.toISOString().split('T')[0])
      }
      weeks.push(week)
    }
    return weeks
  })()

  const dayAvg: Record<string, number> = {}
  for (const e of data.entries) {
    const d = entryDate(e)
    dayAvg[d] = dayAvg[d] ?? 0
  }
  for (const d of Object.keys(dayAvg)) {
    dayAvg[d] = avgMood(data.entries.filter(e => entryDate(e) === d))!
  }

  // ── Trends ────────────────────────────────────────────────
  const weekdayAvgs = WEEKDAYS.map((label, i) => {
    const entries = data.entries.filter(e => (new Date(e.entryAt).getDay() + 6) % 7 === i)
    return { label, avg: avgMood(entries), count: entries.length }
  })
  const rankedWeekdays = weekdayAvgs.filter(w => w.avg !== null).sort((a, b) => b.avg! - a.avg!)
  const bestDay = rankedWeekdays[0]
  const worstDay = rankedWeekdays[rankedWeekdays.length - 1]

  const tagAvgs = TAGS
    .map(tag => {
      const entries = data.entries.filter(e => e.tags.includes(tag))
      return { tag, avg: avgMood(entries), count: entries.length }
    })
    .filter(t => t.count > 0)
    .sort((a, b) => b.avg! - a.avg!)

  // ── Actions ───────────────────────────────────────────────
  const handleCheckin = async () => {
    if (!checkin.mood) return
    const xpEligible = todayEntries.length < XP_CHECKINS_PER_DAY
    const firstToday = todayEntries.length === 0
    const xpGain = (xpEligible ? 10 : 0) + (firstToday ? 5 : 0)
    try {
      const entry = await dbAddEntry(userId, { mood: checkin.mood, tags: checkin.tags, note: checkin.note })
      const before = data.character
      setData(d => d ? { ...d, entries: [entry, ...d.entries], character: xpGain > 0 ? addXP(before, xpGain) : d.character } : d)
      if (xpGain > 0) runAward(before, xpGain)
      setCheckin({ mood: null, tags: [], note: '' })
      showToast(xpGain > 0 ? `Checked in! +${xpGain} XP` : 'Checked in! (daily XP cap reached)')
    } catch {
      showToast('Failed to save check-in', false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    setData(d => d ? { ...d, entries: d.entries.filter(e => e.id !== id) } : d)
    await dbDeleteEntry(id)
  }

  const handleXPEarned = (xp: number) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const toggleTag = (tag: string) =>
    setCheckin(c => ({ ...c, tags: c.tags.includes(tag) ? c.tags.filter(t => t !== tag) : [...c.tags, tag] }))

  const selectedDayEntries = selectedDay ? data.entries.filter(e => entryDate(e) === selectedDay) : []

  const entryRow = (e: MoodEntry) => {
    const meta = moodMeta(e.mood)
    return (
      <div key={e.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
        <div className="text-2xl flex-shrink-0">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-nunito font-semibold text-sm" style={{ color: meta.color }}>
            {meta.label}
            {e.tags.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[#09090F]/40">{e.tags.map(t => `#${t}`).join(' ')}</span>
            )}
          </div>
          <div className="text-xs text-[#09090F]/50 font-nunito truncate">
            {entryDate(e)} {entryTime(e)}{e.note ? ` · ${e.note}` : ''}
          </div>
        </div>
        <button
          onClick={() => handleDeleteEntry(e.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
        >
          ✕
        </button>
      </div>
    )
  }

  const petCard = (
    <Character
      type="mood"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

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
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">🌤️ Mood Tracker <StreakBadge streak={dayStreak} /></div>
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
              { label: 'Avg mood (7d)', value: avg7 !== null ? `${moodMeta(Math.round(avg7)).emoji} ${avg7.toFixed(1)}` : '—', color: avg7 !== null ? moodMeta(Math.round(avg7)).color : '#09090F' },
              { label: 'Day streak', value: `${streak}🔥`, color: '#D97706' },
              { label: 'Today', value: `${todayEntries.length} check-in${todayEntries.length === 1 ? '' : 's'}`, color: ACCENT },
              { label: 'Total entries', value: String(data.entries.length), color: '#09090F' },
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
              { key: 'overview', label: '☀️ Check-in' },
              { key: 'history',  label: '📆 History' },
              { key: 'trends',   label: '📈 Trends' },
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

          {/* ── CHECK-IN (overview) ──────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-4">

              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>How are you feeling?</div>

                <div className="flex justify-between gap-1 mb-4 max-w-sm mx-auto">
                  {MOOD_META.map(m => (
                    <button
                      key={m.level}
                      onClick={() => setCheckin(c => ({ ...c, mood: m.level }))}
                      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition active:scale-95"
                      style={checkin.mood === m.level
                        ? { background: m.color + '18', border: `2px solid ${m.color}` }
                        : { background: INPUT_BG, border: `2px solid transparent` }}
                    >
                      <span className="text-2xl md:text-3xl" style={{ filter: checkin.mood && checkin.mood !== m.level ? 'grayscale(0.7)' : 'none' }}>
                        {m.emoji}
                      </span>
                      <span className="text-[10px] font-nunito font-semibold" style={{ color: checkin.mood === m.level ? m.color : 'rgba(9,9,15,0.4)' }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full font-nunito text-xs font-semibold transition"
                      style={checkin.tags.includes(tag)
                        ? { background: ACCENT + '18', color: ACCENT, border: `3px solid ${ACCENT}` }
                        : { background: INPUT_BG, color: 'rgba(9,9,15,0.45)', border: `3px solid ${CARD_BORDER}` }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note (optional)"
                    value={checkin.note}
                    onChange={e => setCheckin(c => ({ ...c, note: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleCheckin()}
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={handleCheckin}
                    disabled={!checkin.mood}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Check in
                  </button>
                </div>
                {todayEntries.length >= XP_CHECKINS_PER_DAY && (
                  <div className="text-xs text-[#09090F]/30 font-nunito mt-2">
                    Daily XP cap reached ({XP_CHECKINS_PER_DAY} check-ins) — more check-ins still count, just no XP.
                  </div>
                )}
              </div>

              {todayEntries.length > 0 && (
                <div>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2 px-1" style={{ color: ACCENT }}>Today</div>
                  <div className="space-y-2">{todayEntries.map(entryRow)}</div>
                </div>
              )}

              {data.entries.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">🌤️</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No check-ins yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Tap an emoji above and log your first mood — your sky pet is waiting!</div>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY (heatmap) ────────────────────────────── */}
          {mainTab === 'history' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                  Last 12 Weeks
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
                    {WEEKDAYS.map(d => (
                      <div key={d} className="h-5 flex items-center text-[9px] font-nunito text-[#09090F]/30">{d}</div>
                    ))}
                  </div>
                  {heatmapWeeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
                      {week.map(day => {
                        const avg = dayAvg[day]
                        const meta = avg !== undefined ? moodMeta(Math.round(avg)) : null
                        const future = day > today
                        return (
                          <button
                            key={day}
                            onClick={() => !future && setSelectedDay(selectedDay === day ? null : day)}
                            title={avg !== undefined ? `${day}: avg ${avg.toFixed(1)}` : day}
                            className="w-5 h-5 rounded transition"
                            style={{
                              background: future ? 'transparent' : meta ? meta.color : '#EDECE9',
                              opacity: future ? 0 : meta ? 0.85 : 1,
                              outline: selectedDay === day ? `2px solid ${ACCENT}` : 'none',
                              outlineOffset: 1,
                              cursor: future ? 'default' : 'pointer',
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: CARD_BORDER }}>
                  <span className="text-[10px] font-nunito text-[#09090F]/40">Awful</span>
                  {MOOD_META.map(m => (
                    <div key={m.level} className="w-4 h-4 rounded" style={{ background: m.color, opacity: 0.85 }} />
                  ))}
                  <span className="text-[10px] font-nunito text-[#09090F]/40">Great</span>
                </div>
              </div>

              {selectedDay && (
                <div>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2 px-1" style={{ color: ACCENT }}>
                    {selectedDay}
                  </div>
                  {selectedDayEntries.length > 0
                    ? <div className="space-y-2">{selectedDayEntries.map(entryRow)}</div>
                    : (
                      <div className="text-center py-8 rounded-xl text-xs text-[#09090F]/40 font-nunito" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                        No check-ins on this day
                      </div>
                    )}
                </div>
              )}

              {!selectedDay && (
                <div className="text-center text-xs text-[#09090F]/30 font-nunito">Tap a day to see its check-ins</div>
              )}
            </div>
          )}

          {/* ── TRENDS ───────────────────────────────────────── */}
          {mainTab === 'trends' && (
            <div className="space-y-4">
              {data.entries.length === 0 ? (
                <div className="text-center py-14 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-4xl mb-3">📈</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No data yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Check in a few times to unlock trends</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Avg last 7 days', value: avg7 !== null ? `${moodMeta(Math.round(avg7)).emoji} ${avg7.toFixed(1)}` : '—', color: avg7 !== null ? moodMeta(Math.round(avg7)).color : '#09090F' },
                      { label: 'Avg last 30 days', value: avg30 !== null ? `${moodMeta(Math.round(avg30)).emoji} ${avg30.toFixed(1)}` : '—', color: avg30 !== null ? moodMeta(Math.round(avg30)).color : '#09090F' },
                      { label: 'Best day', value: bestDay ? `${bestDay.label} (${bestDay.avg!.toFixed(1)})` : '—', color: '#16A34A' },
                      { label: 'Toughest day', value: worstDay ? `${worstDay.label} (${worstDay.avg!.toFixed(1)})` : '—', color: '#DC2626' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3.5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                        <div className="font-nunito font-bold text-lg mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                      Mood by Weekday
                    </div>
                    <div className="space-y-3">
                      {weekdayAvgs.map(w => (
                        <div key={w.label}>
                          <div className="flex justify-between text-xs font-nunito mb-1.5">
                            <span className="font-semibold text-[#09090F]">{w.label}</span>
                            <span className="text-[#09090F]/60">
                              {w.avg !== null ? `${moodMeta(Math.round(w.avg)).emoji} ${w.avg.toFixed(1)} · ${w.count} entr${w.count === 1 ? 'y' : 'ies'}` : 'no data'}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: w.avg !== null ? `${(w.avg / 5) * 100}%` : 0,
                                background: w.avg !== null ? moodMeta(Math.round(w.avg)).color : 'transparent',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {tagAvgs.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                        Mood by Tag
                      </div>
                      <div className="space-y-3">
                        {tagAvgs.map(t => (
                          <div key={t.tag}>
                            <div className="flex justify-between text-xs font-nunito mb-1.5">
                              <span className="font-semibold text-[#09090F]">#{t.tag}</span>
                              <span className="text-[#09090F]/60">
                                {moodMeta(Math.round(t.avg!)).emoji} {t.avg!.toFixed(1)} · {t.count} entr{t.count === 1 ? 'y' : 'ies'}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(t.avg! / 5) * 100}%`, background: moodMeta(Math.round(t.avg!)).color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
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
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Mood Pet</span>
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
              {gameTab === 'clicker' && <ZenPop onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <CloudGlide onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <EmojiFlow onXPEarned={handleXPEarned} />}
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
            <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Streak</div>
              <div className="font-nunito font-bold text-2xl text-[#09090F]">{streak} day{streak === 1 ? '' : 's'} 🔥</div>
              <div className="text-xs text-[#09090F]/50 font-nunito">Check in daily to keep it going</div>
            </div>
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FCE7F3', border: '1px solid #FBCFE8' }}>
              <strong className="text-pink-700">Pet tip:</strong>{' '}
              <span className="text-pink-800">Each check-in earns +10 XP (first {XP_CHECKINS_PER_DAY} per day), and the first of the day gets +5 bonus!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
