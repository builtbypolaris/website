import { NCard, NProgress, INK } from './ui'
import type { MissionRow } from '../lib/gamification'

// This week's missions with fat progress bars + crown reward chips.
// Used on the dashboard (all missions) and tracker pages (filtered).

export function MissionsPanel({ missions, accent = '#7C3AED', title = 'Weekly missions' }: {
  missions: MissionRow[]
  accent?: string
  title?: string
}) {
  if (missions.length === 0) return null
  const done = missions.filter(m => m.completedAt).length

  return (
    <NCard className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-nunito font-black uppercase tracking-widest text-xs" style={{ color: INK }}>
          🎯 {title}
        </div>
        <div className="font-nunito font-black text-xs px-2 py-0.5 rounded-lg" style={{ background: accent, color: '#FFFFFF', border: `2px solid ${INK}` }}>
          {done}/{missions.length}
        </div>
      </div>
      <div className="space-y-3">
        {missions.map(m => {
          const complete = !!m.completedAt
          const pct = (m.progress / m.target) * 100
          return (
            <div key={m.missionId} className={complete ? 'opacity-60' : ''}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-nunito font-bold text-sm truncate" style={{ color: INK, textDecoration: complete ? 'line-through' : 'none' }}>
                  {m.def?.emoji} {m.def?.title ?? m.missionId}
                </div>
                <div className="font-nunito font-black text-xs flex-shrink-0" style={{ color: complete ? '#16A34A' : `${INK}80` }}>
                  {complete ? '✓ +100 XP' : `${m.progress}/${m.target} · +100 XP`}
                </div>
              </div>
              <NProgress pct={pct} accent={complete ? '#16A34A' : accent} height={12} />
            </div>
          )
        })}
      </div>
      <div className="mt-3 font-nunito font-bold text-[11px]" style={{ color: `${INK}66` }}>
        Missions pay bonus XP toward your pet's cycle. Full cycles earn crowns 👑, and 1 crown = 1 plant or 1 person helped. Resets every Monday.
      </div>
    </NCard>
  )
}
