export function HealthCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polyline
        points="6,26 14,26 18,18 22,34 26,22 30,26 42,26"
        stroke="#c9a96e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="37" cy="14" r="7" stroke="#c9a96e" strokeWidth="1.5" />
      <polyline
        points="33.5,14 36,16.5 40.5,11.5"
        stroke="#c9a96e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function WebDevIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="8" width="36" height="28" rx="3" stroke="#c9a96e" strokeWidth="1.5" />
      <line x1="6" y1="16" x2="42" y2="16" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      <circle cx="11" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      <circle cx="15.5" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      <circle cx="20" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      <polyline points="17,22 13,27 17,32" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="31,22 35,27 31,32" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="26" y1="21" x2="22" y2="33" stroke="#c9a96e" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function AppDevIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Phone frame */}
      <rect x="14" y="6" width="20" height="36" rx="4" stroke="#c9a96e" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="17" y="12" width="14" height="22" rx="1" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
      {/* Home button */}
      <circle cx="24" cy="38" r="1.5" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      {/* App grid */}
      <rect x="19" y="15" width="4" height="4" rx="1" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
      <rect x="25" y="15" width="4" height="4" rx="1" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
      <rect x="19" y="22" width="4" height="4" rx="1" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
      <rect x="25" y="22" width="4" height="4" rx="1" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
    </svg>
  )
}

export function SEOContentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Magnifying glass */}
      <circle cx="20" cy="20" r="10" stroke="#c9a96e" strokeWidth="1.5" />
      <line x1="27" y1="27" x2="34" y2="34" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Graph bars inside */}
      <line x1="16" y1="24" x2="16" y2="18" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="24" x2="20" y2="15" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="24" x2="24" y2="17" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Content lines */}
      <line x1="34" y1="12" x2="42" y2="12" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
      <line x1="34" y1="16" x2="40" y2="16" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
      <line x1="36" y1="38" x2="42" y2="38" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
      <line x1="36" y1="42" x2="40" y2="42" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function BusinessOpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Briefcase */}
      <rect x="8" y="16" width="32" height="22" rx="3" stroke="#c9a96e" strokeWidth="1.5" />
      <path d="M18 16V12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="#c9a96e" strokeWidth="1.5" />
      {/* Center clasp */}
      <rect x="21" y="22" width="6" height="4" rx="1" stroke="#c9a96e" strokeWidth="1" opacity="0.6" />
      {/* Divider line */}
      <line x1="8" y1="26" x2="40" y2="26" stroke="#c9a96e" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

export function OthersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Puzzle piece */}
      <path
        d="M12 18 L18 18 C18 15.8 19.8 14 22 14 C24.2 14 26 15.8 26 18 L32 18 L32 24 C34.2 24 36 25.8 36 28 C36 30.2 34.2 32 32 32 L32 38 L12 38 L12 32 C9.8 32 8 30.2 8 28 C8 25.8 9.8 24 12 24 Z"
        stroke="#c9a96e"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Star accent */}
      <path
        d="M38 10 L39.2 13 L42 13.5 L39.8 15.5 L40.5 18.5 L38 17 L35.5 18.5 L36.2 15.5 L34 13.5 L36.8 13 Z"
        stroke="#c9a96e"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}

export function PackagesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Box */}
      <path d="M8 16L24 8L40 16L24 24Z" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M8 16V32L24 40V24" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M40 16V32L24 40V24" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      {/* Ribbon */}
      <line x1="16" y1="12" x2="32" y2="20" stroke="#c9a96e" strokeWidth="1" opacity="0.4" />
      {/* Gift bow */}
      <circle cx="24" cy="16" r="2" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// Keep old names as aliases for backward compat during transition
export const ContentIcon = SEOContentIcon
export const AutomationIcon = BusinessOpIcon
export const CustomIcon = OthersIcon
