export function HealthCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Heartbeat line */}
      <polyline
        points="6,26 14,26 18,18 22,34 26,22 30,26 42,26"
        stroke="#c9a96e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Checkmark circle */}
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
      {/* Browser window */}
      <rect x="6" y="8" width="36" height="28" rx="3" stroke="#c9a96e" strokeWidth="1.5" />
      <line x1="6" y1="16" x2="42" y2="16" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      {/* Browser dots */}
      <circle cx="11" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      <circle cx="15.5" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      <circle cx="20" cy="12" r="1.2" fill="#c9a96e" opacity="0.5" />
      {/* Code brackets */}
      <polyline points="17,22 13,27 17,32" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="31,22 35,27 31,32" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="26" y1="21" x2="22" y2="33" stroke="#c9a96e" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function ContentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Document */}
      <rect x="10" y="6" width="22" height="30" rx="2" stroke="#c9a96e" strokeWidth="1.5" />
      {/* Text lines */}
      <line x1="15" y1="14" x2="27" y2="14" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="19" x2="27" y2="19" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="24" x2="23" y2="24" stroke="#c9a96e" strokeWidth="1" opacity="0.5" />
      {/* Pen */}
      <path d="M34 16 L40 10 L42 12 L36 18 Z" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <line x1="34" y1="16" x2="33" y2="20" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Speech bubble accent */}
      <path d="M34 28 C34 25.8 35.8 24 38 24 C40.2 24 42 25.8 42 28 C42 30.2 40.2 32 38 32 L36 35 L35.5 32" stroke="#c9a96e" strokeWidth="1" opacity="0.5" fill="none" />
    </svg>
  )
}

export function AutomationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Central gear */}
      <circle cx="24" cy="24" r="8" stroke="#c9a96e" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" stroke="#c9a96e" strokeWidth="1" opacity="0.6" />
      {/* Gear teeth */}
      <line x1="24" y1="14" x2="24" y2="10" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="34" x2="24" y2="38" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="24" x2="10" y2="24" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="24" x2="38" y2="24" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Workflow arrows */}
      <polyline points="8,12 14,12 14,18" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
      <polyline points="40,36 34,36 34,30" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
    </svg>
  )
}

export function CustomIcon({ className }: { className?: string }) {
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
