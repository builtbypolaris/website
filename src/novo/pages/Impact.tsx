import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllCharacters } from '../lib/storage'
import { getImpactTotals, getWeekMissions, ensureWeeklyMissions, getCrowns, setCause, type Cause, type MissionRow } from '../lib/gamification'
import { NCard, StatTile, Sticker, INK, hardShadow } from '../components/ui'
import { MissionsPanel } from '../components/MissionsPanel'
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

  const unit = cause === 'social' ? '💛' : '🌱'
  const impactLine =
    cause === 'social'
      ? `${crowns} ${crowns === 1 ? 'person' : 'people'} will receive help`
      : `${crowns} ${crowns === 1 ? 'plant' : 'plants'} will be planted`

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-12">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Sticker accent="#7C3AED" rotate={-2} className="mb-3">👑 Crowns → real impact</Sticker>
          <h1
            className="font-nunito font-black uppercase leading-none mb-2"
            style={{ color: INK, fontSize: 'clamp(36px, 6vw, 72px)', letterSpacing: '-0.02em' }}
          >
            Your impact
          </h1>
          <p className="font-nunito font-bold text-sm max-w-md" style={{ color: `${INK}80` }}>
            Raise a pet through its full 10-stage cycle to earn a crown. For every crown, Polaris makes it real — fulfilled monthly.
          </p>
        </div>

        {/* Cause + crowns */}
        {cause && causeInfo ? (
          <NCard accent={causeInfo.accent} className="p-5 md:p-6 mb-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{causeInfo.emoji}</span>
                <div>
                  <div className="font-nunito font-black uppercase tracking-wide text-lg" style={{ color: INK }}>
                    Team {causeInfo.title}
                  </div>
                  <div className="font-nunito font-bold text-xs" style={{ color: causeInfo.accent }}>
                    {causeInfo.line}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-nunito font-black leading-none" style={{ color: INK, fontSize: 44 }}>
                  {crowns} <span className="text-3xl">👑</span>
                </div>
                <div className="font-nunito font-black uppercase tracking-widest text-[10px]" style={{ color: `${INK}66` }}>
                  crowns earned
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-4 mb-3"
              style={{ background: `${causeInfo.accent}12`, border: `2.5px solid ${INK}` }}
            >
              <div className="font-nunito font-black text-base mb-2" style={{ color: INK }}>
                {impactLine} {unit}
              </div>
              {crowns > 0 ? (
                <div className="flex flex-wrap gap-1 text-xl leading-none">
                  {Array.from({ length: Math.min(crowns, 60) }).map((_, i) => (
                    <span key={i} className="bounce-in" style={{ animationDelay: `${i * 30}ms` }}>{unit}</span>
                  ))}
                  {crowns > 60 && <span className="font-nunito font-black text-sm self-center" style={{ color: INK }}>+{crowns - 60} more</span>}
                </div>
              ) : (
                <div className="font-nunito font-bold text-xs" style={{ color: `${INK}66` }}>
                  Raise a pet through all 10 stages to start your {cause === 'social' ? 'chain of help' : 'garden'}.
                </div>
              )}
            </div>

            <button
              onClick={() => handlePick(cause === 'social' ? 'environment' : 'social')}
              disabled={switching}
              className="font-nunito font-bold text-xs transition hover:opacity-70 disabled:opacity-40"
              style={{ color: `${INK}66` }}
            >
              {switching ? 'Switching…' : `Switch to Team ${cause === 'social' ? 'Environment 🌱' : 'Social 💛'} →`}
            </button>
          </NCard>
        ) : (
          <NCard className="p-5 md:p-6 mb-5">
            <div className="font-nunito font-black uppercase tracking-wide text-base mb-1" style={{ color: INK }}>
              Pick your cause
            </div>
            <p className="font-nunito font-bold text-xs mb-4" style={{ color: `${INK}80` }}>
              Choose where your crowns go — you can switch any time.
            </p>
            <CauseCards picked={null} onPick={handlePick} disabled={switching} />
          </NCard>
        )}

        {/* Community totals */}
        <div className="mb-5">
          <div className="font-nunito font-black uppercase tracking-widest text-xs mb-3" style={{ color: `${INK}66` }}>
            🌍 Community impact — everyone, all time
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              value={totals ? totals.environment.toLocaleString() : '…'}
              label="Plants planted"
              accent="#16A34A"
              sub="Team Environment 🌱"
            />
            <StatTile
              value={totals ? totals.social.toLocaleString() : '…'}
              label="People helped"
              accent="#DB2777"
              sub="Team Social 💛"
            />
          </div>
        </div>

        {/* This week's missions */}
        <div className="mb-5">
          <MissionsPanel missions={missions} title="Boost your cycle this week" />
        </div>

        {/* How it works */}
        <div
          className="rounded-2xl p-4 mb-8"
          style={{ background: '#FFFFFF', border: `3px dashed ${INK}55` }}
        >
          <div className="font-nunito font-black uppercase tracking-widest text-[10px] mb-2" style={{ color: `${INK}66` }}>
            How it works
          </div>
          <p className="font-nunito font-bold text-xs leading-relaxed" style={{ color: `${INK}80` }}>
            Every pet has a 10-stage cycle (6,500 XP). Finish the cycle and the pet is reborn — with 1 crown 👑
            added. Weekly missions pay bonus XP to get you there faster. At the end of every month, Polaris
            tallies all crowns and fulfills them for real — planting for Team Environment, funding help for
            Team Social.
          </p>
        </div>

        <button
          onClick={() => navigate('/studios/dashboard')}
          className="font-nunito font-black uppercase tracking-wide text-xs px-4 py-2.5 rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{ background: '#FFFFFF', color: INK, border: `3px solid ${INK}`, boxShadow: hardShadow(3) }}
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  )
}
