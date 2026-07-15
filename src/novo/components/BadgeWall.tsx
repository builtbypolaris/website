import { NCard, INK } from './ui'
import { BADGES } from '../data/missions'

// Sticker-style badge grid: earned badges pop in color, locked ones
// stay greyed. Same 8 generic badges per tracker.

export function BadgeWall({ earned, accent }: { earned: Set<string>; accent: string }) {
  return (
    <NCard className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-nunito font-black uppercase tracking-widest text-xs" style={{ color: INK }}>
          🏅 Badges
        </div>
        <div className="font-nunito font-black text-xs" style={{ color: accent }}>
          {earned.size}/{BADGES.length}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BADGES.map((b, i) => {
          const has = earned.has(b.id)
          return (
            <div
              key={b.id}
              className="rounded-xl p-2 text-center"
              title={`${b.label}: ${b.description}`}
              style={{
                background: has ? `${accent}18` : '#F0EEE8',
                border: `2.5px solid ${has ? INK : `${INK}22`}`,
                transform: has ? `rotate(${i % 2 === 0 ? -2 : 2}deg)` : 'none',
                opacity: has ? 1 : 0.5,
              }}
            >
              <div className="text-2xl mb-0.5" style={{ filter: has ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
              <div className="font-nunito font-black text-[9px] uppercase tracking-wide leading-tight" style={{ color: has ? INK : `${INK}55` }}>
                {b.label}
              </div>
            </div>
          )
        })}
      </div>
    </NCard>
  )
}
