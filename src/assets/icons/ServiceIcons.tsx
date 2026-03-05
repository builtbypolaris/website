export function DigitalSystemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="8" width="32" height="24" rx="3" stroke="#c9a96e" strokeWidth="1.5" />
      <line x1="8" y1="26" x2="40" y2="26" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      <rect x="18" y="32" width="12" height="4" rx="1" stroke="#c9a96e" strokeWidth="1" />
      <circle cx="24" cy="18" r="3" stroke="#c9a96e" strokeWidth="1" />
    </svg>
  )
}

export function AiAutomationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M24 12 L24 36" stroke="#c9a96e" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="24" cy="12" r="5" stroke="#c9a96e" strokeWidth="1.5" />
      <circle cx="14" cy="30" r="4" stroke="#c9a96e" strokeWidth="1.5" />
      <circle cx="34" cy="30" r="4" stroke="#c9a96e" strokeWidth="1.5" />
      <path d="M24 17 L14 26 M24 17 L34 26" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function DataInsightsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="14" width="32" height="22" rx="3" stroke="#c9a96e" strokeWidth="1.5" />
      <polyline points="14,30 20,22 26,26 34,18" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="34" cy="18" r="2" fill="#c9a96e" opacity="0.6" />
    </svg>
  )
}

export function MonthlyRetainerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="14" stroke="#c9a96e" strokeWidth="1.5" />
      <path d="M24 14 L24 24 L32 28" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="2" fill="#c9a96e" opacity="0.6" />
    </svg>
  )
}
