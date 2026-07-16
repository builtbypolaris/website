import { useState } from 'react'
import { INK, MUTED, NButton } from './ui'
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
    <div>
      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>
        Today's challenges
      </div>
      <div className="space-y-2.5">
        {challenges.map(c => {
          const claimed = !!localStorage.getItem(claimKey(trackerId, c.id))
          return (
            <div key={c.id} className="flex items-center gap-3" style={{ opacity: claimed ? 0.45 : 1 }}>
              <div className="flex-1 min-w-0">
                <div className="font-nunito text-sm truncate" style={{ color: INK, textDecoration: claimed ? 'line-through' : 'none' }}>
                  {c.title}
                </div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>+{c.xp} XP</div>
              </div>
              {claimed ? (
                <span className="font-nunito text-xs flex-shrink-0" style={{ color: '#16A34A' }}>Claimed</span>
              ) : (
                <NButton
                  variant={c.met ? 'solid' : 'ghost'}
                  accent={c.met ? accent : MUTED}
                  size="sm"
                  disabled={!c.met}
                  onClick={() => claim(c)}
                  className="flex-shrink-0"
                >
                  {c.met ? 'Claim' : 'Locked'}
                </NButton>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
