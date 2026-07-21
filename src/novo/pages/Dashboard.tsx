import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllCharacters, DEFAULT_CHARACTER, todayStr } from '../lib/storage'
import {
  ensureWeeklyMissions, getWeekMissions, getStreaks, getBadges, getCrowns,
  type MissionRow, type StreakRow,
} from '../lib/gamification'
import { getStageFromXP } from '../data/creatures'
import { TEMPLATES, isLocked } from '../data/templates'
import { QUICK_STATS, type QuickStat } from '../data/quickStats'
import { INK, MUTED, Panel, NProgress } from '../components/ui'
import { CauseModal, CAUSES } from '../components/CausePicker'
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
  const impactAccent = causeInfo?.accent ?? '#7C3AED'
  const activeMissions = missions.filter(m => !m.completedAt)

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-12" style={{ background: '#F5F4F2' }}>
      {showCauseModal && session?.user && (
        <CauseModal
          userId={session.user.id}
          onDone={() => refreshProfile()}
          onSkip={() => setCauseModalDismissed(true)}
        />
      )}

      {/* Greeting — plain type on the page background, no eyebrow, no box */}
      <div className="mb-8 md:mb-10 max-w-2xl">
        <h1
          className="font-display leading-tight mb-2"
          style={{ color: INK, fontSize: 'clamp(30px, 5vw, 52px)' }}
        >
          Hey, {displayName}.
        </h1>
        <p className="font-nunito text-sm" style={{ color: MUTED }}>
          {allXP.toLocaleString()} XP earned across {owned.length} of {TEMPLATES.length} trackers.
        </p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8 items-start">
        <div className="min-w-0 order-2 md:order-1">
          {/* Trackers — a plain divided list, not a grid of identical boxed cards */}
          <div className="font-nunito font-semibold text-base mb-3" style={{ color: INK }}>
            Your trackers
          </div>
          <div>
            {TEMPLATES.map((template, i) => {
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

              const comingSoon = isLocked(template, owned)

              return (
                <div
                  key={template.id}
                  onClick={() => { if (!comingSoon) navigate(template.route) }}
                  className={`py-4 transition-colors -mx-2 px-2 rounded-xl ${comingSoon ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-black/[0.02]'}`}
                  style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}12` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: isOwned ? `${template.accent}18` : `${INK}08` }}
                    >
                      {isOwned ? stage.emoji : template.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-nunito font-semibold text-sm" style={{ color: INK }}>
                          {template.name}
                        </span>
                        {isOwned && (charData.prestige ?? 0) > 0 && (
                          <span className="font-nunito text-xs" style={{ color: '#B45309' }}>
                            👑 {charData.prestige}
                          </span>
                        )}
                        {isOwned && (streak?.current ?? 0) > 0 && (
                          <span className="font-nunito text-xs" style={{ color: litToday ? '#EA580C' : MUTED }}>
                            🔥 {streak!.current}
                          </span>
                        )}
                        {isOwned && badges > 0 && (
                          <span className="font-nunito text-xs" style={{ color: MUTED }}>
                            {badges} badge{badges === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>

                      {isOwned ? (
                        <>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 max-w-[220px]">
                              <NProgress pct={progress} accent={template.accent} height={5} />
                            </div>
                            <span className="font-nunito text-xs flex-shrink-0" style={{ color: MUTED }}>
                              {stage.name}
                            </span>
                          </div>
                          {stats.length > 0 && (
                            <div className="flex gap-4 mt-1.5">
                              {stats.map(d => (
                                <span key={d.label} className="font-nunito text-xs" style={{ color: MUTED }}>
                                  {d.value} <span style={{ opacity: 0.7 }}>{d.label}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>
                          {comingSoon ? 'Coming soon' : 'Locked, tap to unlock'}
                        </div>
                      )}
                    </div>

                    <div className="font-nunito text-sm flex-shrink-0" style={{ color: isOwned ? template.accent : MUTED }}>
                      {isOwned ? `${charData.xp} XP` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/studios')}
            className="mt-6 font-nunito text-xs transition-opacity hover:opacity-70"
            style={{ color: MUTED }}
          >
            Back to store
          </button>
        </div>

        <div className="min-w-0 order-1 md:order-2 space-y-5">
          {/* Impact — the one loud, saturated panel on this screen */}
          <Panel
            accent={impactAccent}
            tone="fill"
            onClick={() => navigate('/studios/impact')}
            className="p-5 cursor-pointer"
          >
            <div className="font-nunito text-xs text-white/70 mb-1">
              {causeInfo ? `Team ${causeInfo.title}` : 'Impact'}
            </div>
            <div className="font-nunito font-bold text-white leading-none mb-1.5" style={{ fontSize: 40 }}>
              {crowns} <span className="text-2xl">👑</span>
            </div>
            <div className="font-nunito text-sm text-white/85">
              {causeInfo ? causeInfo.line : 'Pick a cause to direct your crowns'}
            </div>
          </Panel>

          {/* This week — a single grouping panel, plain rows inside */}
          {activeMissions.length > 0 && (
            <Panel tone="tint" accent={INK} className="p-5">
              <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>
                This week
              </div>
              <div className="space-y-3">
                {activeMissions.slice(0, 4).map(m => (
                  <div key={m.missionId}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-nunito text-xs truncate" style={{ color: INK }}>
                        {m.def?.title ?? m.missionId}
                      </span>
                      <span className="font-nunito text-xs flex-shrink-0" style={{ color: MUTED }}>
                        {m.progress}/{m.target}
                      </span>
                    </div>
                    <NProgress pct={(m.progress / m.target) * 100} accent="#7C3AED" height={4} />
                  </div>
                ))}
              </div>
              <div className="font-nunito text-xs mt-4" style={{ color: MUTED }}>
                Missions speed up your pet's cycle. Finishing a cycle earns a crown.
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
