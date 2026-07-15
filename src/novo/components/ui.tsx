import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'

// ── Neo-brutalist UI kit ─────────────────────────────────────
// Thick ink borders, hard offset shadows, loud flat accents.
// Every tracker page + the dashboard builds from these primitives.

export const INK = '#09090F'
export const PAPER = '#FFFFFF'
export const PAPER_DIM = '#F0EEE8'

export function hardShadow(px = 5, color = INK) {
  return `${px}px ${px}px 0 ${color}`
}

// ── NCard ────────────────────────────────────────────────────

export function NCard({
  children,
  accent,
  className = '',
  style,
  shadow = 5,
  bg = PAPER,
  onClick,
}: {
  children: ReactNode
  accent?: string
  className?: string
  style?: CSSProperties
  shadow?: number
  bg?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${onClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        background: bg,
        border: `3px solid ${INK}`,
        boxShadow: hardShadow(shadow, accent ? accent : INK),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── NButton ──────────────────────────────────────────────────

interface NButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: string
  textColor?: string
  size?: 'sm' | 'md' | 'lg'
}

export function NButton({ accent = INK, textColor, size = 'md', className = '', style, children, disabled, ...rest }: NButtonProps) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`font-nunito font-black uppercase tracking-wide rounded-xl transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40 ${pad} ${className}`}
      style={{
        background: accent,
        color: textColor ?? '#FFFFFF',
        border: `3px solid ${INK}`,
        boxShadow: disabled ? 'none' : hardShadow(3),
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── NTab — chunky segmented control ──────────────────────────

export function NTabs<T extends string>({
  tabs,
  active,
  onChange,
  accent,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  accent: string
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl"
      style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: hardShadow(4) }}
    >
      {tabs.map(t => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="px-3.5 py-2 rounded-xl font-nunito font-black uppercase tracking-wide text-xs transition-all"
            style={
              isActive
                ? { background: accent, color: '#FFFFFF', border: `2px solid ${INK}`, boxShadow: hardShadow(2) }
                : { background: 'transparent', color: `${INK}99`, border: '2px solid transparent' }
            }
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ── StatTile — giant number, shouty label ────────────────────

export function StatTile({
  value,
  label,
  accent,
  sub,
}: {
  value: ReactNode
  label: string
  accent: string
  sub?: string
}) {
  return (
    <div
      className="relative rounded-2xl p-3.5 md:p-4 overflow-hidden"
      style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: hardShadow(4) }}
    >
      <div className="absolute top-0 right-0 w-7 h-7" style={{ background: accent, borderLeft: `3px solid ${INK}`, borderBottom: `3px solid ${INK}`, borderBottomLeftRadius: 12 }} />
      <div className="font-nunito font-black leading-none mb-1 truncate" style={{ color: INK, fontSize: 'clamp(18px, 2.6vw, 26px)' }}>
        {value}
      </div>
      <div className="font-nunito font-black uppercase tracking-widest text-[10px]" style={{ color: accent }}>
        {label}
      </div>
      {sub && <div className="font-nunito text-[10px] mt-0.5" style={{ color: `${INK}66` }}>{sub}</div>}
    </div>
  )
}

// ── Sticker — rotated loud pill ──────────────────────────────

export function Sticker({
  children,
  accent,
  rotate = -3,
  textColor = '#FFFFFF',
  className = '',
}: {
  children: ReactNode
  accent: string
  rotate?: number
  textColor?: string
  className?: string
}) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-lg font-nunito font-black uppercase tracking-wide text-[11px] ${className}`}
      style={{
        background: accent,
        color: textColor,
        border: `2px solid ${INK}`,
        boxShadow: hardShadow(2),
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  )
}

// ── NInput styles (plain objects — forms keep native inputs) ─

export const nInputStyle: CSSProperties = {
  background: PAPER_DIM,
  border: `3px solid ${INK}`,
  borderRadius: 12,
  boxShadow: `inset 2px 2px 0 ${INK}22`,
}

// ── NProgress — fat progress bar ─────────────────────────────

export function NProgress({ pct, accent, height = 14 }: { pct: number; accent: string; height?: number }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: PAPER, border: `2.5px solid ${INK}` }}
    >
      <div
        className="h-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: `repeating-linear-gradient(45deg, ${accent}, ${accent} 8px, ${accent}CC 8px, ${accent}CC 16px)`,
          borderRight: pct > 0 && pct < 100 ? `2.5px solid ${INK}` : 'none',
        }}
      />
    </div>
  )
}
