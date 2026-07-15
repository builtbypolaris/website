import { useState } from 'react'
import { NCard, INK, hardShadow } from './ui'
import { todayStr } from '../lib/storage'
import type { TemplateId } from '../types'

// Three bespoke daily challenges per tracker. Each page computes `met`
// from its own data; claiming pays XP once per day (localStorage guard).

export interface ChallengeDef {
  id: string
  title: string
  emoji: string
  xp: number
  met: boolean
}

function claimKey(trackerId: TemplateId, id: string) {
  return `novo-challenge-${trackerId}-${todayStr()}-${id}`
}

export function DailyChallenges({
  trackerId,
  accent,
  challenges,
  onClaim,
}: {
  trackerId: TemplateId
  accent: string
  challenges: ChallengeDef[]
  onClaim: (xp: number, title: string) => void
}) {
  const [, force] = useState(0)

  const claim = (c: ChallengeDef) => {
    if (!c.met || localStorage.getItem(claimKey(trackerId, c.id))) return
    localStorage.setItem(claimKey(trackerId, c.id), '1')
    force(n => n + 1)
    onClaim(c.xp, c.title)
  }

  return (
    <NCard accent={accent} className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: INK }}>
          ⚡ Today's challenges
        </div>
        <div className="font-nunito font-bold text-[10px]" style={{ color: `${INK}55` }}>resets at midnight</div>
      </div>
      <div className="space-y-2">
        {challenges.map(c => {
          const claimed = !!localStorage.getItem(claimKey(trackerId, c.id))
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: claimed ? '#F0EEE8' : '#FFFFFF',
                border: `2.5px solid ${claimed ? `${INK}30` : INK}`,
                opacity: claimed ? 0.6 : 1,
              }}
            >
              <span className="text-xl flex-shrink-0">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-nunito font-bold text-sm truncate" style={{ color: INK, textDecoration: claimed ? 'line-through' : 'none' }}>
                  {c.title}
                </div>
                <div className="font-nunito font-black text-[10px] uppercase tracking-wide" style={{ color: accent }}>
                  +{c.xp} XP
                </div>
              </div>
              {claimed ? (
                <span className="font-nunito font-black text-xs flex-shrink-0" style={{ color: '#16A34A' }}>✓ Claimed</span>
              ) : (
                <button
                  onClick={() => claim(c)}
                  disabled={!c.met}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl font-nunito font-black uppercase tracking-wide text-[10px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
                  style={{ background: c.met ? accent : '#F0EEE8', color: c.met ? '#FFFFFF' : `${INK}60`, border: `2.5px solid ${INK}`, boxShadow: c.met ? hardShadow(2) : 'none' }}
                >
                  {c.met ? 'Claim' : 'Locked'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </NCard>
  )
}
