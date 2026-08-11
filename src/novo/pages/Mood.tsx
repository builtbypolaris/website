import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMoodData,
  addMoodEntry as dbAddEntry,
  deleteMoodEntry as dbDeleteEntry,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { MOOD_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress, StableLabel } from '../components/ui'
import ZenPop from '../games/ZenPop'
import CloudGlide from '../games/CloudGlide'
import EmojiFlow from '../games/EmojiFlow'
import type { CharacterState, MoodData, MoodEntry, MoodLevel } from '../types'
import { MOOD_T, MOOD_LABEL, TAG_WORD, WEEKDAY_SHORT, type Lang, type MoodDict } from './Mood.i18n'

const MOOD_META: { level: MoodLevel; emoji: string; color: string }[] = [
  { level: 1, emoji: '😢', color: '#DC2626' },
  { level: 2, emoji: '😕', color: '#F97316' },
  { level: 3, emoji: '😐', color: '#EAB308' },
  { level: 4, emoji: '😊', color: '#84CC16' },
  { level: 5, emoji: '😄', color: '#16A34A' },
]

const TAGS = ['work', 'family', 'health', 'social', 'study', 'other']
const XP_CHECKINS_PER_DAY = 3
const LANG_KEY = 'novo-lang'

type GameTab = 'clicker' | 'arcade' | 'puzzle'

const ACCENT = '#DB2777'

const introKey = (userId: string) => `novo-intro-mood-seen-${userId}`
const customTagsKey = (userId: string) => `novo-mood-custom-tags-${userId}`

function entryDate(e: MoodEntry) { return e.entryAt.slice(0, 10) }
function entryTime(e: MoodEntry) { return new Date(e.entryAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
function moodMeta(level: number) { return MOOD_META[Math.min(4, Math.max(0, level - 1))] }
function moodLevelClamped(level: number): 1 | 2 | 3 | 4 | 5 { return Math.min(5, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5 }
function daysAgoStr(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }

function TourCoachmark({ step, steps, targetEl, tr, onNext, onSkip }: {
  step: number
  steps: { text: string }[]
  targetEl: HTMLElement | null
  tr: MoodDict
  onNext: () => void
  onSkip: () => void
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const BOX_WIDTH = 260

  useEffect(() => {
    if (!targetEl) return
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const margin = 12
    const place = () => {
      const r = targetEl.getBoundingClientRect()
      const boxH = boxRef.current?.offsetHeight ?? 140
      // Prefer below the target, but flip above it if that would run off
      // the bottom of the viewport — fixed positioning means there's no
      // scroll that could otherwise bring an off-screen coachmark into view.
      let top = r.bottom + 10
      if (top + boxH > window.innerHeight - margin) top = r.top - boxH - 10
      top = Math.max(margin, Math.min(top, window.innerHeight - boxH - margin))
      let left = r.left + r.width / 2
      left = Math.max(BOX_WIDTH / 2 + margin, Math.min(left, window.innerWidth - BOX_WIDTH / 2 - margin))
      setPos({ top, left })
    }
    const t = setTimeout(place, 260)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { clearTimeout(t); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [targetEl, step])

  if (!pos) return null
  const last = step === steps.length - 1

  return (
    <div ref={boxRef} className="fixed bounce-in" style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9990, width: BOX_WIDTH }}>
      <Panel tone="fill" accent={ACCENT} className="p-4">
        <div className="font-nunito text-xs text-white/70 mb-1.5">{step + 1} / {steps.length}</div>
        <div className="font-nunito text-sm text-white leading-relaxed mb-3">{steps[step].text}</div>
        <div className="flex items-center justify-between">
          <button onClick={onSkip} className="font-nunito text-xs text-white/60 hover:text-white/90 transition-colors">
            {tr.tourSkip}
          </button>
          <NButton onClick={onNext} style={{ background: '#FFFFFF', color: ACCENT }} size="sm">
            {last ? tr.tourDone : tr.tourNext}
          </NButton>
        </div>
      </Panel>
    </div>
  )
}

function avgMood(entries: MoodEntry[]): number | null {
  if (entries.length === 0) return null
  return entries.reduce((s, e) => s + e.mood, 0) / entries.length
}

export default function Mood() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<MoodData | null>(null)
  const [expanded, setExpanded] = useState<'pet' | 'trends' | 'games' | null>(null)
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [checkin, setCheckin] = useState<{ mood: MoodLevel | null; tags: string[]; note: string }>({ mood: null, tags: [], note: '' })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [dayStreak, setDayStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'en')
  const [tourStep, setTourStep] = useState<number | null>(null)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const expandedRef = useRef<HTMLDivElement | null>(null)
  const { celebrate, layer } = useCelebrations()

  const tr = MOOD_T[lang]
  const changeLang = (l: Lang) => { localStorage.setItem(LANG_KEY, l); setLang(l) }
  const tagLabel = (tag: string) => TAG_WORD[lang][tag] ?? tag
  const moodLabel = (level: number) => MOOD_LABEL[lang][moodLevelClamped(level)]
  const WEEKDAYS = WEEKDAY_SHORT[lang]

  // Tour walks the bento cards top to bottom instead of switching tabs —
  // there's nothing hidden to reveal, just cards to scroll to and highlight.
  const TOUR_STEPS: { text: string }[] = [
    { text: tr.tourOverview },
    { text: tr.tourHistory },
    { text: tr.tourTrends },
    { text: tr.tourPet },
    { text: tr.tourGames },
  ]

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'mood').then(setDayStreak)
    getBadges(userId, 'mood').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getMoodData(userId).then(setData)
    if (!localStorage.getItem(introKey(userId))) setTourStep(0)
    try { setCustomTags(JSON.parse(localStorage.getItem(customTagsKey(userId)) ?? '[]')) } catch { setCustomTags([]) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const endTour = () => {
    localStorage.setItem(introKey(userId), '1')
    setTourStep(null)
  }
  const advanceTour = () => {
    if (tourStep === null) return
    if (tourStep >= TOUR_STEPS.length - 1) endTour()
    else setTourStep(tourStep + 1)
  }

  const addCustomTag = () => {
    const t = newTagInput.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    setNewTagInput('')
    if (!t || TAGS.includes(t) || customTags.includes(t)) return
    const next = [...customTags, t]
    setCustomTags(next)
    localStorage.setItem(customTagsKey(userId), JSON.stringify(next))
  }
  const removeCustomTag = (tag: string) => {
    const next = customTags.filter(t => t !== tag)
    setCustomTags(next)
    localStorage.setItem(customTagsKey(userId), JSON.stringify(next))
    setCheckin(c => ({ ...c, tags: c.tags.filter(t => t !== tag) }))
  }

  const toggleExpanded = (key: 'pet' | 'trends' | 'games') => setExpanded(e => e === key ? null : key)

  // Expanding a card renders its content below the whole grid, which can be
  // off-screen — scroll it into view so tapping visibly does something.
  useEffect(() => {
    if (!expanded) return
    const t = setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    return () => clearTimeout(t)
  }, [expanded])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'mood', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

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
        <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.loading}</div>
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
    const endDow = (end.getDay() + 6) % 7
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

  // Derived from actual logged entries (not the fixed TAGS catalog) so a
  // removed custom tag still shows correctly in historical breakdowns.
  const distinctTags = Array.from(new Set(data.entries.flatMap(e => e.tags)))
  const tagAvgs = distinctTags
    .map(tag => {
      const entries = data.entries.filter(e => e.tags.includes(tag))
      return { tag, avg: avgMood(entries), count: entries.length }
    })
    .filter(t => t.count > 0)
    .sort((a, b) => b.avg! - a.avg!)

  // ── Insights — short, personalized takeaways from data already above ──
  const insights: string[] = []
  if (data.entries.length >= 5) {
    if (bestDay && bestDay.count >= 2) insights.push(tr.insightHappiestDay(bestDay.label))
    if (worstDay && worstDay.count >= 2 && worstDay.label !== bestDay?.label) insights.push(tr.insightToughestDay(worstDay.label))
    if (tagAvgs.length >= 2) {
      const topTag = tagAvgs[0]
      const bottomTag = tagAvgs[tagAvgs.length - 1]
      if (topTag.count >= 2) insights.push(tr.insightBestTag(tagLabel(topTag.tag)))
      if (bottomTag.count >= 2 && bottomTag.tag !== topTag.tag) insights.push(tr.insightWorstTag(tagLabel(bottomTag.tag)))
    }
    const notedEntries = data.entries.filter(e => e.note.trim().length > 0)
    const unnotedEntries = data.entries.filter(e => e.note.trim().length === 0)
    const notedAvg = avgMood(notedEntries)
    const unnotedAvg = avgMood(unnotedEntries)
    if (notedAvg !== null && unnotedAvg !== null && notedEntries.length >= 3 && unnotedEntries.length >= 3) {
      const diff = notedAvg - unnotedAvg
      if (diff >= 0.3) insights.push(tr.insightNotes(diff.toFixed(1)))
    }
    if (dayStreak && dayStreak.best >= 3) insights.push(tr.insightBestStreak(dayStreak.best))
  }
  const topInsights = insights.slice(0, 3)

  // ── On this day — a memory from a week or month ago ───────
  const weekAgoEntries = data.entries.filter(e => entryDate(e) === daysAgoStr(7))
  const monthAgoEntries = data.entries.filter(e => entryDate(e) === daysAgoStr(30))

  // ── Mood distribution — all-time share of each level ──────
  const moodDistribution = ([1, 2, 3, 4, 5] as const).map(level => ({
    level,
    count: data.entries.filter(e => e.mood === level).length,
  })).filter(d => d.count > 0)

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
      showToast(xpGain > 0 ? tr.checkedInXp(xpGain) : tr.checkedInCapped)
    } catch {
      showToast(tr.failedToSaveCheckin, false)
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
    showToast(tr.xpFromGame(xp))
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(tr.challengeClaimed(title, xp))
  }

  const toggleTag = (tag: string) =>
    setCheckin(c => ({ ...c, tags: c.tags.includes(tag) ? c.tags.filter(t => t !== tag) : [...c.tags, tag] }))

  const selectedDayEntries = selectedDay ? data.entries.filter(e => entryDate(e) === selectedDay) : []

  const entryRow = (e: MoodEntry, i: number) => {
    const meta = moodMeta(e.mood)
    return (
      <div key={e.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
        <div className="text-xl flex-shrink-0">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-nunito font-medium text-sm" style={{ color: meta.color }}>
            {moodLabel(e.mood)}
            {e.tags.length > 0 && <span className="ml-2 font-normal font-nunito text-xs" style={{ color: MUTED }}>{e.tags.map(t => `#${tagLabel(t)}`).join(' ')}</span>}
          </div>
          <div className="font-nunito text-xs truncate" style={{ color: MUTED }}>
            {entryDate(e)} {entryTime(e)}{e.note ? ` · ${e.note}` : ''}
          </div>
        </div>
        <button onClick={() => handleDeleteEntry(e.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
      </div>
    )
  }

  const petCard = (
    <Character
      type="mood"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(tr.evolved(s.name), true)}
      onPrestige={p => showToast(tr.prestige(p), true)}
    />
  )

  const entriesToday = data.entries.filter(e => e.entryAt.startsWith(todayStr()))
  const dailyChallenges = [
    { id: 'checkin', title: tr.challengeCheckinOnce, emoji: '🌤️', xp: 10, met: entriesToday.length >= 1 },
    { id: 'note', title: tr.challengeNote, emoji: '✍️', xp: 15, met: entriesToday.some(e => e.note.trim().length > 0) },
    { id: 'tags', title: tr.challengeTags, emoji: '🏷️', xp: 15, met: entriesToday.some(e => e.tags.length >= 2) },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}

      {tourStep !== null && (
        <TourCoachmark step={tourStep} steps={TOUR_STEPS} targetEl={sectionRefs.current[tourStep] ?? null} tr={tr} onNext={advanceTour} onSkip={endTour} />
      )}

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
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: MUTED }}>
          <StableLabel a={MOOD_T.en.back} b={MOOD_T.id.back} active={lang === 'en' ? 'a' : 'b'} />
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2 flex-shrink-0" style={{ color: INK }}>
          <StableLabel a={MOOD_T.en.headerTitle} b={MOOD_T.id.headerTitle} active={lang === 'en' ? 'a' : 'b'} /> <StreakBadge streak={dayStreak} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs font-nunito" style={{ color: MUTED }}>
            <span>{petStage.emoji}</span>
            <span>{data.character.xp} XP</span>
            <button onClick={() => setTourStep(0)} className="transition-opacity hover:opacity-70" style={{ color: MUTED }}>
              <StableLabel a={MOOD_T.en.howThisWorks} b={MOOD_T.id.howThisWorks} active={lang === 'en' ? 'a' : 'b'} />
            </button>
          </div>
          <div className="flex rounded-full overflow-hidden" style={{ background: `${INK}08` }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="px-2.5 py-1 font-nunito text-xs font-semibold transition-colors"
                style={lang === l ? { background: ACCENT, color: '#FFFFFF' } : { color: MUTED }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        {/* Metrics */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
          {[
            { key: 'avg7', en: MOOD_T.en.avgMood7d, id: MOOD_T.id.avgMood7d, value: avg7 !== null ? `${moodMeta(Math.round(avg7)).emoji} ${avg7.toFixed(1)}` : '—', color: avg7 !== null ? moodMeta(Math.round(avg7)).color : INK },
            { key: 'streak', en: MOOD_T.en.dayStreak, id: MOOD_T.id.dayStreak, value: String(streak), color: '#D97706' },
            { key: 'today', en: MOOD_T.en.todayHeading, id: MOOD_T.id.todayHeading, value: tr.checkInCount(todayEntries.length), color: ACCENT },
            { key: 'total', en: MOOD_T.en.totalEntries, id: MOOD_T.id.totalEntries, value: String(data.entries.length), color: INK },
          ].map(m => (
            <div key={m.key}>
              <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
              <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                <StableLabel a={m.en} b={m.id} active={lang === 'en' ? 'a' : 'b'} />
              </div>
            </div>
          ))}
        </div>

        {/* ── BENTO GRID — no tabs, everything's a card on one page ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-6xl">

          {/* Check-in hero — the featured card, tints to whichever mood is picked */}
          <div ref={el => { sectionRefs.current[0] = el }} className="md:col-span-2">
            <Panel
              tone="tint"
              accent={checkin.mood ? moodMeta(checkin.mood).color : ACCENT}
              className="p-5 md:p-6 rounded-3xl h-full transition-colors duration-300"
              style={tourStep === 0 ? { boxShadow: `0 0 0 3px ${ACCENT}80` } : undefined}
            >
              <div className="font-nunito font-bold text-base mb-4 flex items-center gap-2" style={{ color: INK }}>
                <span className="text-xl">🌤️</span> {tr.howAreYouFeeling}
              </div>

              <div className="flex justify-between gap-1 mb-4 max-w-sm mx-auto">
                {MOOD_META.map(m => (
                  <button
                    key={m.level}
                    onClick={() => setCheckin(c => ({ ...c, mood: m.level }))}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-150 hover:scale-110"
                    style={{ background: checkin.mood === m.level ? `${m.color}20` : 'transparent' }}
                  >
                    <span className="text-3xl md:text-4xl" style={{ filter: checkin.mood && checkin.mood !== m.level ? 'grayscale(0.7)' : 'none' }}>
                      {m.emoji}
                    </span>
                    <span className="font-nunito text-[10px] font-medium" style={{ color: checkin.mood === m.level ? m.color : MUTED }}>
                      <StableLabel a={MOOD_LABEL.en[m.level]} b={MOOD_LABEL.id[m.level]} active={lang === 'en' ? 'a' : 'b'} />
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 flex-wrap items-center mb-3">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full font-nunito text-xs transition-colors"
                    style={checkin.tags.includes(tag) ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                  >
                    #<StableLabel a={TAG_WORD.en[tag]} b={TAG_WORD.id[tag]} active={lang === 'en' ? 'a' : 'b'} />
                  </button>
                ))}
                {customTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="pl-3 pr-2 py-1.5 rounded-full font-nunito text-xs transition-colors flex items-center gap-1"
                    style={checkin.tags.includes(tag) ? { background: ACCENT, color: '#FFFFFF' } : { background: '#FFFFFF', color: MUTED }}
                  >
                    #{tag}
                    <span
                      onClick={e => { e.stopPropagation(); removeCustomTag(tag) }}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </span>
                  </button>
                ))}
                <div className="flex items-center rounded-full overflow-hidden" style={{ background: '#FFFFFF' }}>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                    placeholder={tr.addTagPlaceholder}
                    className="pl-3 pr-1 py-1.5 font-nunito text-xs outline-none w-20"
                    style={{ color: INK }}
                  />
                  <button onClick={addCustomTag} className="pr-3 pl-1 font-nunito text-xs font-bold" style={{ color: ACCENT }}>+</button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={tr.notePlaceholder}
                  value={checkin.note}
                  onChange={e => setCheckin(c => ({ ...c, note: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCheckin()}
                  className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                  style={{ background: '#FFFFFF', color: INK }}
                />
                <NButton onClick={handleCheckin} disabled={!checkin.mood} accent={ACCENT}>{tr.checkInButton}</NButton>
              </div>
              {todayEntries.length >= XP_CHECKINS_PER_DAY && (
                <div className="font-nunito text-xs mt-2" style={{ color: MUTED }}>
                  {tr.dailyCapReached(XP_CHECKINS_PER_DAY)}
                </div>
              )}

              {todayEntries.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                  <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.todayHeading}</div>
                  <div>{todayEntries.map((e, i) => entryRow(e, i))}</div>
                </div>
              )}

              {data.entries.length === 0 && (
                <div className="py-6 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noCheckinsYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.noCheckinsYetSub}</div>
                </div>
              )}
            </Panel>
          </div>

          {/* Pet — tap to open the full pet room */}
          <div ref={el => { sectionRefs.current[3] = el }}>
            <Panel
              tone="tint"
              accent={ACCENT}
              onClick={() => toggleExpanded('pet')}
              className="p-5 rounded-3xl h-full"
              style={tourStep === 3 ? { boxShadow: `0 0 0 3px ${ACCENT}80` } : undefined}
            >
              <div className="font-nunito font-bold text-sm mb-2" style={{ color: INK }}>{tr.petCardTitle}</div>
              {petCard}
              <div className="font-nunito text-xs font-semibold mt-3 pt-3 flex items-center justify-center gap-1" style={{ color: ACCENT, borderTop: `1px solid ${INK}0D` }}>
                {expanded === 'pet' ? tr.tapToCollapse : tr.tapToOpen} <span>{expanded === 'pet' ? '▲' : '▼'}</span>
              </div>
            </Panel>
          </div>

          {/* Heatmap */}
          <div ref={el => { sectionRefs.current[1] = el }} className="md:col-span-2">
            <Panel
              tone="tint"
              accent="#7C3AED"
              className="p-5 rounded-3xl"
              style={tourStep === 1 ? { boxShadow: `0 0 0 3px ${ACCENT}80` } : undefined}
            >
              <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.last12Weeks}</div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
                  {WEEKDAYS.map(d => (
                    <div key={d} className="h-5 flex items-center font-nunito text-[9px]" style={{ color: MUTED }}>{d}</div>
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
                          className="w-5 h-5 rounded-full transition-opacity"
                          style={{
                            background: future ? 'transparent' : meta ? meta.color : `${INK}0D`,
                            opacity: future ? 0 : meta ? 0.85 : 1,
                            outline: selectedDay === day ? `2px solid ${ACCENT}` : 'none',
                            cursor: future ? 'default' : 'pointer',
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="font-nunito text-[10px]" style={{ color: MUTED }}>
                  <StableLabel a={MOOD_LABEL.en[1]} b={MOOD_LABEL.id[1]} active={lang === 'en' ? 'a' : 'b'} />
                </span>
                {MOOD_META.map(m => (
                  <div key={m.level} className="w-4 h-4 rounded-full" style={{ background: m.color, opacity: 0.85 }} />
                ))}
                <span className="font-nunito text-[10px]" style={{ color: MUTED }}>
                  <StableLabel a={MOOD_LABEL.en[5]} b={MOOD_LABEL.id[5]} active={lang === 'en' ? 'a' : 'b'} />
                </span>
              </div>

              {selectedDay && (
                <div className="mt-6">
                  <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{selectedDay}</div>
                  {selectedDayEntries.length > 0
                    ? <div>{selectedDayEntries.map((e, i) => entryRow(e, i))}</div>
                    : <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.noCheckinsOnDay}</div>}
                </div>
              )}

              {!selectedDay && (
                <div className="font-nunito text-xs mt-4" style={{ color: MUTED }}>{tr.tapDayToSeeCheckins}</div>
              )}
            </Panel>
          </div>

          {/* Trends snapshot — tap for the full breakdown */}
          <div ref={el => { sectionRefs.current[2] = el }}>
            <Panel
              tone="tint"
              accent="#0EA5E9"
              onClick={() => toggleExpanded('trends')}
              className="p-5 rounded-3xl h-full"
              style={tourStep === 2 ? { boxShadow: `0 0 0 3px ${ACCENT}80` } : undefined}
            >
              <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.trendsCardTitle}</div>
              {data.entries.length === 0 ? (
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.checkInToUnlockTrends}</div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { en: MOOD_T.en.avgLast7, id: MOOD_T.id.avgLast7, value: avg7 !== null ? `${moodMeta(Math.round(avg7)).emoji} ${avg7.toFixed(1)}` : '—', color: avg7 !== null ? moodMeta(Math.round(avg7)).color : INK },
                    { en: MOOD_T.en.avgLast30, id: MOOD_T.id.avgLast30, value: avg30 !== null ? `${moodMeta(Math.round(avg30)).emoji} ${avg30.toFixed(1)}` : '—', color: avg30 !== null ? moodMeta(Math.round(avg30)).color : INK },
                    { en: MOOD_T.en.bestDay, id: MOOD_T.id.bestDay, value: bestDay ? bestDay.label : '—', color: '#16A34A' },
                    { en: MOOD_T.en.toughestDay, id: MOOD_T.id.toughestDay, value: worstDay ? worstDay.label : '—', color: '#DC2626' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="font-nunito font-bold text-base leading-none" style={{ color: s.color }}>{s.value}</div>
                      <div className="font-nunito text-[10px] mt-1" style={{ color: MUTED }}>
                        <StableLabel a={s.en} b={s.id} active={lang === 'en' ? 'a' : 'b'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {moodDistribution.length > 0 && (
                <div className="mt-4">
                  <div className="font-nunito text-[10px] mb-1.5" style={{ color: MUTED }}>{tr.moodDistribution}</div>
                  <div className="flex h-2.5 rounded-full overflow-hidden" style={{ background: `${INK}0D` }}>
                    {moodDistribution.map(d => (
                      <div
                        key={d.level}
                        title={`${moodLabel(d.level)}: ${d.count}`}
                        style={{ width: `${(d.count / data.entries.length) * 100}%`, background: moodMeta(d.level).color }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="font-nunito text-xs font-semibold mt-4 pt-3 flex items-center gap-1" style={{ color: '#0EA5E9', borderTop: `1px solid ${INK}0D` }}>
                {expanded === 'trends' ? tr.tapToCollapse : tr.tapForBreakdown} <span>{expanded === 'trends' ? '▲' : '▼'}</span>
              </div>
            </Panel>
          </div>

          {/* Insights — short, personalized takeaways */}
          <div>
            <Panel tone="tint" accent="#9333EA" className="p-5 rounded-3xl h-full">
              <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.insightsCardTitle}</div>
              {topInsights.length > 0 ? (
                <div className="space-y-2.5">
                  {topInsights.map((line, i) => (
                    <div key={i} className="font-nunito text-xs leading-relaxed" style={{ color: INK }}>{line}</div>
                  ))}
                </div>
              ) : (
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.insightsEmptyState}</div>
              )}
            </Panel>
          </div>

          {/* On this day — a memory from a week or month ago */}
          <div>
            <Panel tone="tint" accent="#0D9488" className="p-5 rounded-3xl h-full">
              <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.onThisDayCardTitle}</div>
              {weekAgoEntries.length === 0 && monthAgoEntries.length === 0 ? (
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.onThisDayEmpty}</div>
              ) : (
                <div>
                  {weekAgoEntries.length > 0 && (
                    <div>
                      <div className="font-nunito text-[10px]" style={{ color: MUTED }}>{tr.onThisDayWeekAgo}</div>
                      {weekAgoEntries.map(e => entryRow(e, 0))}
                    </div>
                  )}
                  {monthAgoEntries.length > 0 && (
                    <div className={weekAgoEntries.length > 0 ? 'mt-3 pt-3' : ''} style={weekAgoEntries.length > 0 ? { borderTop: `1px solid ${INK}0D` } : undefined}>
                      <div className="font-nunito text-[10px]" style={{ color: MUTED }}>{tr.onThisDayMonthAgo}</div>
                      {monthAgoEntries.map(e => entryRow(e, 0))}
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>

          {/* Games teaser — tap to play */}
          <div ref={el => { sectionRefs.current[4] = el }}>
            <Panel
              tone="tint"
              accent="#F59E0B"
              onClick={() => toggleExpanded('games')}
              className="p-5 rounded-3xl h-full flex flex-col justify-between gap-3"
              style={tourStep === 4 ? { boxShadow: `0 0 0 3px ${ACCENT}80` } : undefined}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎮</span>
                <div>
                  <div className="font-nunito font-bold text-sm" style={{ color: INK }}>{tr.gamesCardTitle}</div>
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.gamesCardSub}</div>
                </div>
              </div>
              <div className="font-nunito text-xs font-semibold flex-shrink-0 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                {expanded === 'games' ? tr.tapToCollapse : tr.tapToPlay} <span>{expanded === 'games' ? '▲' : '▼'}</span>
              </div>
            </Panel>
          </div>
        </div>

        {/* ── EXPANDED SECTIONS — progressive disclosure below the grid ── */}
        <div ref={expandedRef} />
        {expanded === 'pet' && (
          <div className="mt-5 max-w-2xl space-y-4">
            <DailyChallenges trackerId="mood" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
            <PetRoom
              userId={userId}
              trackerId="mood"
              character={data.character}
              streak={dayStreak}
              earnedBadges={earnedBadges}
              missions={missions}
              onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
            />
          </div>
        )}

        {expanded === 'trends' && (
          <div className="mt-5 max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-8">
            <div>
              <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.moodByWeekday}</div>
              <div className="space-y-3">
                {weekdayAvgs.map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-nunito text-xs mb-1.5">
                      <span style={{ color: INK }}>{w.label}</span>
                      <span style={{ color: MUTED }}>
                        {w.avg !== null ? `${moodMeta(Math.round(w.avg)).emoji} ${w.avg.toFixed(1)} · ${tr.entryCount(w.count)}` : tr.noData}
                      </span>
                    </div>
                    <NProgress pct={w.avg !== null ? (w.avg / 5) * 100 : 0} accent={w.avg !== null ? moodMeta(Math.round(w.avg)).color : MUTED} height={4} />
                  </div>
                ))}
              </div>
            </div>

            {tagAvgs.length > 0 && (
              <div>
                <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.moodByTag}</div>
                <div className="space-y-3">
                  {tagAvgs.map(t => (
                    <div key={t.tag}>
                      <div className="flex justify-between font-nunito text-xs mb-1.5">
                        <span style={{ color: INK }}>#{tagLabel(t.tag)}</span>
                        <span style={{ color: MUTED }}>
                          {moodMeta(Math.round(t.avg!)).emoji} {t.avg!.toFixed(1)} · {tr.entryCount(t.count)}
                        </span>
                      </div>
                      <NProgress pct={(t.avg! / 5) * 100} accent={moodMeta(Math.round(t.avg!)).color} height={4} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {expanded === 'games' && (
          <div className="mt-5 max-w-xl">
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
                  <StableLabel
                    a={g === 'clicker' ? MOOD_T.en.gameClicker : g === 'arcade' ? MOOD_T.en.gameArcade : MOOD_T.en.gamePuzzle}
                    b={g === 'clicker' ? MOOD_T.id.gameClicker : g === 'arcade' ? MOOD_T.id.gameArcade : MOOD_T.id.gamePuzzle}
                    active={lang === 'en' ? 'a' : 'b'}
                  />
                </button>
              ))}
            </div>
            {gameTab === 'clicker' && <ZenPop onXPEarned={handleXPEarned} />}
            {gameTab === 'arcade' && <CloudGlide onXPEarned={handleXPEarned} />}
            {gameTab === 'puzzle' && <EmojiFlow onXPEarned={handleXPEarned} />}
          </div>
        )}
      </div>
    </div>
  )
}
