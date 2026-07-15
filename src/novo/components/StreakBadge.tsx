import { INK, hardShadow } from './ui'
import { todayStr } from '../lib/storage'
import type { StreakRow } from '../lib/gamification'

// 🔥 streak pill for tracker page headers. Shows greyed-out flame when
// the streak is alive but today hasn't been logged yet.

export function StreakBadge({ streak }: { streak: StreakRow | null }) {
  const days = streak?.current ?? 0
  const litToday = streak?.lastActive === todayStr()
  if (days === 0) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-nunito font-black text-sm"
      style={{
        background: litToday ? '#FEF3C7' : '#FFFFFF',
        border: `2.5px solid ${INK}`,
        boxShadow: hardShadow(2),
        color: INK,
        opacity: litToday ? 1 : 0.55,
      }}
      title={litToday ? `${days}-day streak` : `${days}-day streak. Log today to keep it!`}
    >
      🔥 {days}
    </span>
  )
}
