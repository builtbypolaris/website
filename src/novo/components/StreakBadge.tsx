import { todayStr } from '../lib/storage'
import type { StreakRow } from '../lib/gamification'

// Plain colored text, no pill/box — the streak number is the content.
export function StreakBadge({ streak }: { streak: StreakRow | null }) {
  const days = streak?.current ?? 0
  const litToday = streak?.lastActive === todayStr()
  if (days === 0) return null
  return (
    <span
      className="font-nunito text-sm"
      style={{ color: litToday ? '#EA580C' : '#14121B66' }}
      title={litToday ? `${days}-day streak` : `${days}-day streak. Log today to keep it!`}
    >
      🔥 {days}
    </span>
  )
}
