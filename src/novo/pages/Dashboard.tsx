import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllCharacters, DEFAULT_CHARACTER, todayStr } from '../lib/storage'
import {
  ensureWeeklyMissions, getWeekMissions, getStreaks, getBadges, getCrowns,
  type MissionRow, type StreakRow,
} from '../lib/gamification'
import { getStageFromXP } from '../data/creatures'
import { TEMPLATES } from '../data/templates'
import { QUICK_STATS, type QuickStat } from '../data/quickStats'
import { INK, hardShadow, NProgress } from '../components/ui'
import { MissionsPanel } from '../components/MissionsPanel'
import { CauseModal } from '../components/CausePicker'
import { CAUSES } from '../components/CausePicker'
import type { TemplateId, CharacterState } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, profile, refreshProfile } = useAuth()
  const [characters, setCharacters] = useState<Partial<Record<TemplateId, CharacterState>> | null>(null)
  const [quickStats, setQuickStats] = useState<Partial<Record<TemplateId, QuickStat[]>>>({})
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [streaks, setStreaks] = useState<Partial<Record<TemplateId, StreakRow>>>({})
  const [badgeCounts, setBadgeCounts] = useState<Partial<Record<TemplateId, number>>>({})
  const [causeModalDismissed, setCauseModalDismissed] = useState(false)

  const owned = profile?.owned_templates ?? []

  useEffect(() => {
    if (!session?.user) return
    const uid = session.user.id
    getAllCharacters(uid).then(setCharacters)
    getStreaks(uid).then(setStreaks)
    getBadges(uid).then(rows => {
      const counts: Partial<Record<TemplateId, number>> = {}
      for (const r of rows) counts[r.trackerType] = (counts[r.trackerType] ?? 0) + 1
      setBadgeCounts(counts)
    })
    const ownedIds = TEMPLATES.filter(t => owned.includes(t.id)).map(t => t.id)
    ensureWeeklyMissions(uid, ownedIds).then(() => getWeekMissions(uid).then(setMissions))
    Promise.all(ownedIds.map(id => QUICK_STATS[id](uid).then(stats => [id, stats] as const)))
      .then(entries => setQuickStats(Object.fromEntries(entries)))
  }, [session, profile])

  if (!characters) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="text-[#09090F]/40 font-nunito text-sm">Loading…</div>
      </div>
    )
  }

  const displayName = (profile?.full_name ?? session?.user.email ?? '').split(' ')[0]
  const allXP = TEMPLATES.reduce((sum, t) => sum + (characters[t.id]?.xp ?? 0), 0)
  const crowns = getCrowns(characters)
  const cause = profile?.cause ?? null
  const causeInfo = CAUSES.find(c => c.id === cause) ?? null
  const showCauseModal = !!profile && !cause && !causeModalDismissed && owned.length > 0

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-12" style={{ background: '#F5F4F2' }}>
      {showCauseModal && session?.user && (
        <CauseModal
          userId={session.user.id}
          onDone={() => refreshProfile()}
          onSkip={() => setCauseModalDismissed(true)}
        />
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1
          className="font-nunito font-black uppercase leading-none mb-3"
          style={{ color: INK, fontSize: 'clamp(34px, 6vw, 76px)', letterSpacing: '-0.02em' }}
        >
          Hey, {displayName}.
        </h1>
        <p className="font-nunito font-bold text-sm" style={{ color: `${INK}80` }}>
          {allXP.toLocaleString()} total XP · {owned.length}/{TEMPLATES.length} trackers unlocked
        </p>
      </div>

      {/* Impact banner */}
      <div
        onClick={() => navigate('/studios/impact')}
        className="cursor-pointer rounded-2xl p-4 md:p-5 mb-5 flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5"
        style={{ background: causeInfo ? `${causeInfo.accent}15` : '#FFFFFF', border: `3px solid ${INK}`, boxShadow: hardShadow(5, causeInfo?.accent ?? INK) }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl md:text-4xl flex-shrink-0">👑</span>
          <div className="min-w-0">
            <div className="font-nunito font-black uppercase tracking-wide text-sm md:text-base truncate" style={{ color: INK }}>
              {crowns} {crowns === 1 ? 'crown' : 'crowns'} earned
            </div>
            <div className="font-nunito font-bold text-xs truncate" style={{ color: causeInfo ? causeInfo.accent : `${INK}66` }}>
              {causeInfo
                ? `Team ${causeInfo.title} ${causeInfo.emoji}: ${causeInfo.line}`
                : 'Pick your cause: every crown plants 1 plant or helps 1 person'}
            </div>
          </div>
        </div>
        <div className="font-nunito font-black text-xl flex-shrink-0" style={{ color: INK }}>→</div>
      </div>

      {/* Missions */}
      {missions.length > 0 && (
        <div className="mb-6">
          <MissionsPanel missions={missions} />
        </div>
      )}

      {/* Tracker cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {TEMPLATES.map(template => {
          const isOwned = owned.includes(template.id)
          const charData = characters[template.id] ?? DEFAULT_CHARACTER

          const stages = template.stages
          const stage = getStageFromXP(stages, charData.xp)
          const nextStage = stages[stage.id + 1]
          const progress = nextStage
            ? Math.min(100, ((charData.xp - stage.xpRequired) / (nextStage.xpRequired - stage.xpRequired)) * 100)
            : 100
          const stats = quickStats[template.id] ?? []
          const streak = streaks[template.id]
          const litToday = streak?.lastActive === todayStr()
          const badges = badgeCounts[template.id] ?? 0

          return (
            <div
              key={template.id}
              className="rounded-2xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1"
              style={{
                background: isOwned ? '#FFFFFF' : '#EDECE9',
                border: `3px solid ${INK}`,
                boxShadow: hardShadow(5, isOwned ? template.accent : `${INK}55`),
                opacity: isOwned ? 1 : 0.75,
              }}
              onClick={() => navigate(template.route)}
            >
              <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: isOwned ? `${template.accent}20` : '#F5F4F2', border: `3px solid ${INK}` }}
                >
                  {isOwned ? stage.emoji : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm">
                      {template.emoji} {template.name}
                    </h3>
                    {isOwned && (charData.prestige ?? 0) > 0 && (
                      <span className="text-xs font-nunito font-black" style={{ color: '#7C3AED' }}>
                        {charData.prestige <= 3 ? '⭐'.repeat(charData.prestige) : `⭐×${charData.prestige}`}
                      </span>
                    )}
                  </div>

                  {isOwned && (
                    <>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="text-[10px] font-nunito font-black uppercase tracking-wide px-2 py-0.5 rounded-lg"
                          style={{ background: template.accent, color: '#FFFFFF', border: `2px solid ${INK}` }}
                        >
                          {stage.name}
                        </span>
                        {(streak?.current ?? 0) > 0 && (
                          <span
                            className="text-[10px] font-nunito font-black px-2 py-0.5 rounded-lg"
                            style={{ background: litToday ? '#FEF3C7' : '#FFFFFF', border: `2px solid ${INK}`, color: INK, opacity: litToday ? 1 : 0.55 }}
                          >
                            🔥 {streak!.current}
                          </span>
                        )}
                        {badges > 0 && (
                          <span className="text-[10px] font-nunito font-black" style={{ color: `${INK}66` }}>
                            🏅 {badges}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="flex-1">
                          <NProgress pct={progress} accent={template.accent} height={10} />
                        </div>
                        <span className="text-xs font-nunito font-black flex-shrink-0" style={{ color: template.accent }}>
                          {charData.xp} XP
                        </span>
                      </div>

                      <div className="flex gap-3 md:gap-5 flex-wrap">
                        {stats.map(d => (
                          <div key={d.label}>
                            <div className="font-nunito font-black text-sm" style={{ color: INK }}>{d.value}</div>
                            <div className="text-[10px] font-nunito font-bold uppercase tracking-wide" style={{ color: `${INK}50` }}>{d.label}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!isOwned && (
                    <div className="text-xs font-nunito font-bold" style={{ color: `${INK}60` }}>
                      Tap to unlock · one-time payment
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-8 border-t-2" style={{ borderColor: '#E5E4E2' }}>
        <button
          onClick={() => navigate('/studios')}
          className="text-xs text-[#09090F]/50 hover:text-[#09090F] font-nunito font-bold transition"
        >
          ← Back to store
        </button>
      </div>
    </div>
  )
}
