import { useState } from 'react'
import { INK, MUTED, Panel, NButton } from './ui'
import { setCause, type Cause } from '../lib/gamification'

// Pick your cause: every crown you earn becomes 1 plant planted
// (environment) or 1 person helped (social), fulfilled monthly by Polaris.

export const CAUSES: { id: Cause; emoji: string; title: string; line: string; accent: string }[] = [
  { id: 'environment', emoji: '🌱', title: 'Environment', line: '1 crown = 1 plant planted', accent: '#16A34A' },
  { id: 'social', emoji: '💛', title: 'Social', line: '1 crown = 1 person receives help', accent: '#DB2777' },
]

export function CauseCards({ picked, onPick, disabled }: {
  picked: Cause | null
  onPick: (c: Cause) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CAUSES.map(c => {
        const active = picked === c.id
        return (
          <Panel
            key={c.id}
            accent={c.accent}
            tone={active ? 'fill' : 'tint'}
            onClick={disabled ? undefined : () => onPick(c.id)}
            className="p-4 text-center"
          >
            <div className="text-3xl mb-2">{c.emoji}</div>
            <div className="font-nunito font-semibold text-sm mb-1" style={{ color: active ? '#FFFFFF' : INK }}>
              {c.title}
            </div>
            <div className="font-nunito text-xs leading-snug" style={{ color: active ? 'rgba(255,255,255,0.85)' : c.accent }}>
              {c.line}
            </div>
          </Panel>
        )
      })}
    </div>
  )
}

// Modal shown to existing users who haven't picked a cause yet.
export function CauseModal({ userId, onDone, onSkip }: {
  userId: string
  onDone: (c: Cause) => void
  onSkip: () => void
}) {
  const [picked, setPicked] = useState<Cause | null>(null)
  const [saving, setSaving] = useState(false)

  const confirm = async () => {
    if (!picked) return
    setSaving(true)
    await setCause(userId, picked)
    onDone(picked)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-5" style={{ zIndex: 9990, background: 'rgba(20,18,27,0.75)' }}>
      <div className="bounce-in rounded-3xl p-6 md:p-8 max-w-md w-full" style={{ background: '#FAF9F6' }}>
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="font-nunito font-semibold text-xl mb-2" style={{ color: INK }}>Pick your cause</h2>
          <p className="font-nunito text-sm leading-relaxed" style={{ color: MUTED }}>
            Raise a pet through all 10 stages to earn a crown. For every crown, Polaris makes real impact. You choose where it goes.
          </p>
        </div>

        <CauseCards picked={picked} onPick={setPicked} disabled={saving} />

        <div className="mt-5 flex flex-col gap-2">
          <NButton accent="#7C3AED" size="lg" disabled={!picked || saving} onClick={confirm} className="w-full">
            {saving ? 'Saving…' : 'Lock it in'}
          </NButton>
          <button onClick={onSkip} className="font-nunito text-xs py-2 transition-opacity hover:opacity-70" style={{ color: MUTED }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
