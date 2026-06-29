export function NovoLogo({
  size = 26,
  withName = false,
  withTagline = false,
  dark = false,
}: {
  size?: number
  withName?: boolean
  withTagline?: boolean
  dark?: boolean
}) {
  const textColor = dark ? '#FFFFFF' : '#09090F'
  const subColor  = dark ? 'rgba(255,255,255,0.35)' : 'rgba(9,9,15,0.4)'

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Novo star — 4-pointed diamond adapted from Polaris mark */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="9" fill="#7C3AED" opacity="0.12" />
        <path d="M20 10 L23.5 24 L20 20 L16.5 24 Z" fill="#c4b5fd" />
        <path d="M20 30 L16.5 16 L20 20 L23.5 16 Z" fill="#6d28d9" />
        <path d="M10 20 L24 17 L20 20 L24 23 Z" fill="#8b5cf6" opacity="0.75" />
        <path d="M30 20 L16 17 L20 20 L16 23 Z" fill="#8b5cf6" opacity="0.5" />
        <circle cx="20" cy="20" r="2.5" fill="#7C3AED" opacity="0.5" />
      </svg>

      {withName && (
        <div className="flex flex-col leading-none gap-0.5">
          <span className="font-nunito font-bold" style={{ fontSize: size * 0.75, color: textColor, lineHeight: 1 }}>
            Novo
          </span>
          {withTagline && (
            <span className="font-nunito" style={{ fontSize: size * 0.52, color: subColor, lineHeight: 1 }}>
              built by Polaris Studio
            </span>
          )}
        </div>
      )}
    </div>
  )
}
