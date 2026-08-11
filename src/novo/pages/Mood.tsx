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
type MainTab = 'overview' | 'history' | 'trends' | 'pet' | 'games'
const MAIN_TAB_KEYS: MainTab[] = ['overview', 'history', 'trends', 'pet', 'games']

const ACCENT = '#DB2777'

const introKey = (userId: string) => `novo-intro-mood-seen-${userId}`

function entryDate(e: MoodEntry) { return e.entryAt.slice(0, 10) }
function entryTime(e: MoodEntry) { return new Date(e.entryAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
function moodMeta(level: number) { return MOOD_META[Math.min(4, Math.max(0, level - 1))] }
function moodLevelClamped(level: number): 1 | 2 | 3 | 4 | 5 { return Math.min(5, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5 }

function TourCoachmark({ step, steps, targetEl, tr, onNext, onSkip }: {
  step: number
  steps: { tab: MainTab; text: string }[]
  targetEl: HTMLButtonElement | null
  tr: MoodDict
  onNext: () => void
  onSkip: () => void
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const place = () => {
      if (!targetEl) return
      const r = targetEl.getBoundingClientRect()
      setPos({ top: r.bottom + 10, left: r.left + r.width / 2 })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [targetEl, step])

  if (!pos) return null
  const last = step === steps.length - 1

  return (
    <div className="fixed bounce-in" style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9990, width: 260 }}>
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
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [checkin, setCheckin] = useState<{ mood: MoodLevel | null; tags: string[]; note: string }>({ mood: null, tags: [], note: '' })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [dayStreak, setDayStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'en')
  const [tourStep, setTourStep] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { celebrate, layer } = useCelebrations()

  const tr = MOOD_T[lang]
  const changeLang = (l: Lang) => { localStorage.setItem(LANG_KEY, l); setLang(l) }
  const tagLabel = (tag: string) => TAG_WORD[lang][tag] ?? tag
  const moodLabel = (level: number) => MOOD_LABEL[lang][moodLevelClamped(level)]
  const WEEKDAYS = WEEKDAY_SHORT[lang]

  const tabLabelKey = (key: MainTab): keyof MoodDict => ({
    overview: 'tabCheckin', history: 'tabHistory', trends: 'tabTrends', pet: 'tabPet', games: 'tabGames',
  } as const)[key]
  const MAIN_TABS = MAIN_TAB_KEYS.map(key => ({ key, label: tr[tabLabelKey(key)] as string, enLabel: MOOD_T.en[tabLabelKey(key)] as string, idLabel: MOOD_T.id[tabLabelKey(key)] as string }))

  const TOUR_STEPS: { tab: MainTab; text: string }[] = [
    { tab: 'overview', text: tr.tourOverview },
    { tab: 'history', text: tr.tourHistory },
    { tab: 'trends', text: tr.tourTrends },
    { tab: 'pet', text: tr.tourPet },
    { tab: 'games', text: tr.tourGames },
  ]

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'mood').then(setDayStreak)
    getBadges(userId, 'mood').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getMoodData(userId).then(setData)
    if (!localStorage.getItem(introKey(userId))) setTourStep(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (tourStep === null) return
    setMainTab(TOUR_STEPS[tourStep].tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep])

  const endTour = () => {
    localStorage.setItem(introKey(userId), '1')
    setTourStep(null)
  }
  const advanceTour = () => {
    if (tourStep === null) return
    if (tourStep >= TOUR_STEPS.length - 1) endTour()
    else setTourStep(tourStep + 1)
  }
  const handleTabClick = (key: MainTab) => {
    setMainTab(key)
    if (tourStep !== null) endTour()
  }

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
        <TourCoachmark step={tourStep} steps={TOUR_STEPS} targetEl={tabRefs.current[tourStep] ?? null} tr={tr} onNext={advanceTour} onSkip={endTour} />
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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">{petCard}</div>

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

          {/* Tabs */}
          <div className="flex mb-6 overflow-x-auto scrollbar-hidden gap-5" style={{ borderBottom: `1px solid ${INK}12` }}>
            {MAIN_TABS.map((t, i) => {
              const isTourTarget = tourStep !== null && TOUR_STEPS[tourStep].tab === t.key
              return (
                <button
                  key={t.key}
                  ref={el => { tabRefs.current[i] = el }}
                  onClick={() => handleTabClick(t.key)}
                  className="pb-2.5 font-nunito text-sm whitespace-nowrap flex-shrink-0 transition-colors"
                  style={{
                    color: mainTab === t.key ? INK : MUTED,
                    fontWeight: mainTab === t.key ? 600 : 400,
                    borderBottom: mainTab === t.key ? `2px solid ${ACCENT}` : isTourTarget ? `2px solid ${ACCENT}80` : '2px solid transparent',
                  }}
                >
                  <StableLabel a={t.enLabel} b={t.idLabel} active={lang === 'en' ? 'a' : 'b'} />
                </button>
              )
            })}
          </div>

          {/* ── CHECK-IN (overview) ──────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <Panel tone="tint" accent={ACCENT} className="p-4 md:p-5">
                  <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>{tr.howAreYouFeeling}</div>

                  <div className="flex justify-between gap-1 mb-4 max-w-sm mx-auto">
                    {MOOD_META.map(m => (
                      <button
                        key={m.level}
                        onClick={() => setCheckin(c => ({ ...c, mood: m.level }))}
                        className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors"
                        style={{ background: checkin.mood === m.level ? `${m.color}20` : 'transparent' }}
                      >
                        <span className="text-2xl md:text-3xl" style={{ filter: checkin.mood && checkin.mood !== m.level ? 'grayscale(0.7)' : 'none' }}>
                          {m.emoji}
                        </span>
                        <span className="font-nunito text-[10px] font-medium" style={{ color: checkin.mood === m.level ? m.color : MUTED }}>
                          <StableLabel a={MOOD_LABEL.en[m.level]} b={MOOD_LABEL.id[m.level]} active={lang === 'en' ? 'a' : 'b'} />
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-3">
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
                </Panel>
              </div>

              <div>
                {todayEntries.length > 0 && (
                  <div>
                    <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.todayHeading}</div>
                    <div>{todayEntries.map((e, i) => entryRow(e, i))}</div>
                  </div>
                )}

                {data.entries.length === 0 && (
                  <div className="py-10 text-center">
                    <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noCheckinsYet}</div>
                    <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.noCheckinsYetSub}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HISTORY (heatmap) ────────────────────────────── */}
          {mainTab === 'history' && (
            <div className="max-w-2xl">
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
                          className="w-5 h-5 rounded transition-opacity"
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
                  <div key={m.level} className="w-4 h-4 rounded" style={{ background: m.color, opacity: 0.85 }} />
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
            </div>
          )}

          {/* ── TRENDS ───────────────────────────────────────── */}
          {mainTab === 'trends' && (
            <div className="space-y-8 max-w-5xl">
              {data.entries.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noDataYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.checkInToUnlockTrends}</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                      { key: 'avg7', en: MOOD_T.en.avgLast7, id: MOOD_T.id.avgLast7, value: avg7 !== null ? `${moodMeta(Math.round(avg7)).emoji} ${avg7.toFixed(1)}` : '—', color: avg7 !== null ? moodMeta(Math.round(avg7)).color : INK },
                      { key: 'avg30', en: MOOD_T.en.avgLast30, id: MOOD_T.id.avgLast30, value: avg30 !== null ? `${moodMeta(Math.round(avg30)).emoji} ${avg30.toFixed(1)}` : '—', color: avg30 !== null ? moodMeta(Math.round(avg30)).color : INK },
                      { key: 'best', en: MOOD_T.en.bestDay, id: MOOD_T.id.bestDay, value: bestDay ? `${bestDay.label} (${bestDay.avg!.toFixed(1)})` : '—', color: '#16A34A' },
                      { key: 'worst', en: MOOD_T.en.toughestDay, id: MOOD_T.id.toughestDay, value: worstDay ? `${worstDay.label} (${worstDay.avg!.toFixed(1)})` : '—', color: '#DC2626' },
                    ].map(s => (
                      <div key={s.key}>
                        <div className="font-nunito font-bold text-lg leading-none" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                          <StableLabel a={s.en} b={s.id} active={lang === 'en' ? 'a' : 'b'} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
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
                </>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
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

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
              <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.sidebarStreak}</div>
              <div className="font-nunito font-bold text-2xl" style={{ color: INK }}>{tr.sidebarStreakDays(streak)}</div>
              <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.sidebarStreakCaption}</div>
            </div>
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              {tr.sidebarTip(XP_CHECKINS_PER_DAY)}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
