import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'

// ── Bold color-block kit ──────────────────────────────────────
// No borders, no drop shadows, no uniform "card" wrapper. Hierarchy
// comes from color saturation and scale, not from outlining everything.
// These are deliberately low-level — most screens should use plain
// text on the page background and reach for Panel only when a section
// genuinely needs visual separation.

export const INK = '#14121B'
export const PAPER = '#FAF9F6'
export const MUTED = `${INK}66`

// ── NButton ──────────────────────────────────────────────────
// Solid fill for the primary action, plain text for everything else.
// No border, no fake-pressed-shadow gimmick.

interface NButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: string
  variant?: 'solid' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function NButton({ accent = INK, variant = 'solid', size = 'md', className = '', style, children, disabled, ...rest }: NButtonProps) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
  const solid = variant === 'solid'
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`font-nunito font-bold rounded-full transition-opacity disabled:opacity-40 ${pad} ${className}`}
      style={{
        background: solid ? accent : 'transparent',
        color: solid ? '#FFFFFF' : accent,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Panel ────────────────────────────────────────────────────
// A flat block of color. Use sparingly — most content doesn't need
// to be boxed. `tone="fill"` is a saturated accent surface reserved
// for the single most important thing on a screen; `tone="tint"` is a
// quiet, barely-there background for grouping; the default is no
// container at all (callers should just not use Panel).

export function Panel({
  children,
  accent = INK,
  tone = 'tint',
  className = '',
  style,
  onClick,
}: {
  children: ReactNode
  accent?: string
  tone?: 'fill' | 'tint'
  className?: string
  style?: CSSProperties
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: tone === 'fill' ? accent : `${accent}14`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── StableLabel ──────────────────────────────────────────────
// Renders both language variants stacked in the same grid cell (one
// hidden via visibility, not display, so it still occupies space).
// CSS grid auto-sizes the track to the widest child, so the label's
// footprint is always max(width(a), width(b)) — switching which one
// is visible never changes surrounding layout/position.

export function StableLabel({ a, b, active, className, style }: {
  a: string
  b: string
  active: 'a' | 'b'
  className?: string
  style?: CSSProperties
}) {
  return (
    <span className={`inline-grid ${className ?? ''}`} style={style}>
      <span style={{ gridArea: '1 / 1', visibility: active === 'a' ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>{a}</span>
      <span style={{ gridArea: '1 / 1', visibility: active === 'b' ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>{b}</span>
    </span>
  )
}

// ── NProgress ────────────────────────────────────────────────

export function NProgress({ pct, accent, track = `${INK}14`, height = 8 }: { pct: number; accent: string; track?: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: track }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: accent }}
      />
    </div>
  )
}
