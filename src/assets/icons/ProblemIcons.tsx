export function ProblemIcon1({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="20" r="16" stroke="#7c5cbf" strokeWidth="1.5" opacity="0.4" />
      <path d="M14 20 L18 24 L26 16" stroke="#9b7ee0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <line x1="12" y1="12" x2="28" y2="28" stroke="#9b7ee0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ProblemIcon2({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="10" width="10" height="10" rx="2" stroke="#9b7ee0" strokeWidth="1.5" />
      <rect x="24" y="10" width="10" height="10" rx="2" stroke="#9b7ee0" strokeWidth="1.5" />
      <rect x="15" y="24" width="10" height="10" rx="2" stroke="#9b7ee0" strokeWidth="1.5" />
      <line x1="16" y1="15" x2="24" y2="15" stroke="#7c5cbf" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="20" y1="20" x2="20" y2="24" stroke="#7c5cbf" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  )
}

export function ProblemIcon3({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="18" r="10" stroke="#9b7ee0" strokeWidth="1.5" />
      <path d="M18 16 L22 16 M20 14 L20 18" stroke="#9b7ee0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 30 L20 24 L26 30" stroke="#7c5cbf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
    </svg>
  )
}
