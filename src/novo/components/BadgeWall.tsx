import { INK, MUTED } from './ui'
import { BADGES } from '../data/missions'

// Plain row of emoji — earned badges shown in color, locked ones dimmed
// and grayscale. No per-badge box, no rotation.
export function BadgeWall({ earned, accent }: { earned: Set<string>; accent: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>
          Badges
        </div>
        <div className="font-nunito text-xs" style={{ color: accent }}>
          {earned.size}/{BADGES.length}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {BADGES.map(b => {
          const has = earned.has(b.id)
          return (
            <div key={b.id} title={`${b.label}: ${b.description}`} className="text-center" style={{ width: 52 }}>
              <div className="text-2xl mb-1" style={{ filter: has ? 'none' : 'grayscale(1)', opacity: has ? 1 : 0.35 }}>
                {b.emoji}
              </div>
              <div className="font-nunito text-[10px] leading-tight" style={{ color: has ? MUTED : `${INK}33` }}>
                {b.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
