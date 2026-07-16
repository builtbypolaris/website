import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllCharacters } from '../lib/storage'
import { getImpactTotals, getWeekMissions, ensureWeeklyMissions, getCrowns, setCause, type Cause, type MissionRow } from '../lib/gamification'
import { INK, MUTED, Panel, NProgress } from '../components/ui'
import { CAUSES, CauseCards } from '../components/CausePicker'
import type { TemplateId } from '../types'

// /studios/impact — where crowns become real-world impact.
// 1 crown = 1 plant planted (environment) or 1 person helped (social),
// fulfilled monthly by Polaris.

export default function Impact() {
  const navigate = useNavigate()
  const { session, profile, refreshProfile } = useAuth()
  const userId = session?.user.id ?? ''

  const [totals, setTotals] = useState<{ social: number; environment: number } | null>(null)
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [switching, setSwitching] = useState(false)
  const [crowns, setCrowns] = useState(0)

  const cause = (profile?.cause ?? null) as Cause | null
  const causeInfo = CAUSES.find(c => c.id === cause) ?? null

  useEffect(() => {
    getImpactTotals().then(setTotals)
  }, [])

  useEffect(() => {
    if (!userId) return
    getAllCharacters(userId).then(chars => setCrowns(getCrowns(chars)))
  }, [userId])

  useEffect(() => {
    if (!userId || !profile) return
    const owned = (profile.owned_templates ?? []) as TemplateId[]
    ensureWeeklyMissions(userId, owned).then(() => getWeekMissions(userId).then(setMissions))
  }, [userId, profile])

  const handlePick = async (c: Cause) => {
    setSwitching(true)
    await setCause(userId, c)
    await refreshProfile()
    setSwitching(false)
  }

  const activeMissions = missions.filter(m => !m.completedAt)
  const panelAccent = causeInfo?.accent ?? '#7C3AED'

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-12" style={{ background: '#F5F4F2' }}>
      <div className="max-w-2xl">
        {/* Header — plain type, no eyebrow, no box */}
        <div className="mb-8">
          <h1 className="font-display leading-tight mb-2" style={{ color: INK, fontSize: 'clamp(30px, 5vw, 52px)' }}>
            Your impact
          </h1>
          <p className="font-nunito text-sm" style={{ color: MUTED }}>
            Raise a pet through its full 10-stage cycle and it earns a crown. Polaris turns every crown into real impact, fulfilled monthly.
          </p>
        </div>

        {/* Personal crowns — the one loud panel on this screen */}
        {cause && causeInfo ? (
          <Panel accent={panelAccent} tone="fill" className="p-6 mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="font-nunito text-sm text-white/70 mb-1">Team {causeInfo.title}</div>
                <div className="font-nunito font-bold text-white leading-none" style={{ fontSize: 56 }}>
                  {crowns} <span className="text-3xl">👑</span>
                </div>
                <div className="font-nunito text-sm text-white/85 mt-1.5">{causeInfo.line}</div>
              </div>
              <button
                onClick={() => handlePick(cause === 'social' ? 'environment' : 'social')}
                disabled={switching}
                className="font-nunito text-xs text-white/60 hover:text-white/90 transition-colors disabled:opacity-40"
              >
                {switching ? 'Switching…' : `Switch to Team ${cause === 'social' ? 'Environment' : 'Social'}`}
              </button>
            </div>
          </Panel>
        ) : (
          <Panel tone="tint" accent={INK} className="p-6 mb-6">
            <div className="font-nunito font-semibold text-base mb-1" style={{ color: INK }}>
              Pick your cause
            </div>
            <p className="font-nunito text-sm mb-4" style={{ color: MUTED }}>
              Choose where your crowns go. You can switch any time.
            </p>
            <CauseCards picked={null} onPick={handlePick} disabled={switching} />
          </Panel>
        )}

        {/* Community totals — plain typographic pair, not two boxed tiles */}
        <div className="flex gap-10 mb-8">
          <div>
            <div className="font-nunito font-bold leading-none" style={{ color: '#16A34A', fontSize: 34 }}>
              {totals ? totals.environment.toLocaleString() : '…'}
            </div>
            <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>plants planted, community-wide</div>
          </div>
          <div>
            <div className="font-nunito font-bold leading-none" style={{ color: '#DB2777', fontSize: 34 }}>
              {totals ? totals.social.toLocaleString() : '…'}
            </div>
            <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>people helped, community-wide</div>
          </div>
        </div>

        {/* This week's missions */}
        {activeMissions.length > 0 && (
          <Panel tone="tint" accent={INK} className="p-5 mb-8">
            <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>
              Boost your cycle this week
            </div>
            <div className="space-y-3">
              {activeMissions.map(m => (
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
          </Panel>
        )}

        {/* How it works — plain paragraph */}
        <p className="font-nunito text-xs leading-relaxed mb-8" style={{ color: MUTED }}>
          Every pet has a 10-stage cycle worth 6,500 XP. Finish the cycle and the pet is reborn with one crown. Weekly
          missions pay bonus XP to help you get there faster. At the end of every month, Polaris tallies all crowns
          and fulfills them for real: planting for Team Environment, funding help for Team Social.
        </p>

        <button
          onClick={() => navigate('/studios/dashboard')}
          className="font-nunito text-xs transition-opacity hover:opacity-70"
          style={{ color: MUTED }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}
