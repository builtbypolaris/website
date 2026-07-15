import { useState } from 'react'
import { INK, hardShadow, NButton } from './ui'
import { setCause, type Cause } from '../lib/gamification'

// Pick your cause: every crown 👑 you earn becomes 1 plant planted
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
          <button
            key={c.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c.id)}
            className="rounded-2xl p-4 text-center transition-all disabled:opacity-50"
            style={{
              background: active ? `${c.accent}18` : '#FFFFFF',
              border: `3px solid ${active ? c.accent : INK}`,
              boxShadow: active ? hardShadow(5, c.accent) : hardShadow(4),
              transform: active ? 'rotate(-1.5deg) scale(1.02)' : 'none',
            }}
          >
            <div className="text-4xl mb-2">{c.emoji}</div>
            <div className="font-nunito font-black uppercase tracking-wide text-sm mb-1" style={{ color: INK }}>
              {c.title}
            </div>
            <div className="font-nunito font-bold text-xs leading-snug" style={{ color: c.accent }}>
              {c.line}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Modal shown on the dashboard to existing users who haven't picked yet.
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
    <div className="fixed inset-0 flex items-center justify-center p-5" style={{ zIndex: 9990, background: 'rgba(9,9,15,0.75)' }}>
      <div
        className="bounce-in rounded-3xl p-6 md:p-8 max-w-md w-full"
        style={{ background: '#F5F4F2', border: `4px solid ${INK}`, boxShadow: hardShadow(8) }}
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="font-nunito font-black text-2xl mb-2" style={{ color: INK }}>
            Pick your cause
          </h2>
          <p className="font-nunito font-bold text-sm leading-relaxed" style={{ color: `${INK}99` }}>
            Raise a pet through all 10 stages to earn a crown. For every crown, Polaris makes real impact — you choose where it goes.
          </p>
        </div>

        <CauseCards picked={picked} onPick={setPicked} disabled={saving} />

        <div className="mt-5 flex flex-col gap-2">
          <NButton accent="#7C3AED" size="lg" disabled={!picked || saving} onClick={confirm} className="w-full">
            {saving ? 'Saving…' : 'Lock it in'}
          </NButton>
          <button
            onClick={onSkip}
            className="font-nunito font-bold text-xs py-2 transition hover:opacity-70"
            style={{ color: `${INK}66` }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
