import { INK, MUTED, NProgress } from './ui'
import type { MissionRow } from '../lib/gamification'

// Plain list, no card wrapper — the parent decides whether to group it
// inside a panel.
export function MissionsPanel({ missions, accent = '#7C3AED', title = 'Weekly missions' }: {
  missions: MissionRow[]
  accent?: string
  title?: string
}) {
  if (missions.length === 0) return null
  const done = missions.filter(m => m.completedAt).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{title}</div>
        <div className="font-nunito text-xs" style={{ color: MUTED }}>{done}/{missions.length}</div>
      </div>
      <div className="space-y-3">
        {missions.map(m => {
          const complete = !!m.completedAt
          const pct = (m.progress / m.target) * 100
          return (
            <div key={m.missionId} className={complete ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-nunito text-xs truncate" style={{ color: INK, textDecoration: complete ? 'line-through' : 'none' }}>
                  {m.def?.title ?? m.missionId}
                </span>
                <span className="font-nunito text-xs flex-shrink-0" style={{ color: complete ? '#16A34A' : MUTED }}>
                  {complete ? 'Done, +100 XP' : `${m.progress}/${m.target}`}
                </span>
              </div>
              <NProgress pct={pct} accent={complete ? '#16A34A' : accent} height={4} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
