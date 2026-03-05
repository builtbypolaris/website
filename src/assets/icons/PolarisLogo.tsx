export function PolarisLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M30 10 L33.5 24 L30 20 L26.5 24 Z" fill="#b89ff0" />
      <path d="M30 30 L26.5 16 L30 20 L33.5 16 Z" fill="#7c5cbf" />
      <path d="M20 20 L34 17 L30 20 L34 23 Z" fill="#9b7ee0" opacity="0.7" />
      <path d="M40 20 L26 17 L30 20 L26 23 Z" fill="#9b7ee0" opacity="0.5" />
      <circle cx="30" cy="20" r="8" fill="#7c5cbf" opacity="0.15" />
      <text x="52" y="28" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="28" fontWeight="300" fill="#f4f1ff" letterSpacing="5">POLARIS</text>
      <line x1="52" y1="33" x2="210" y2="33" stroke="#2e2a4a" strokeWidth="0.5" />
      <text x="52" y="44" fontFamily="'DM Sans', Arial, sans-serif" fontSize="7.5" fill="#7c5cbf" letterSpacing="3">YOUR BUSINESS COMPASS</text>
    </svg>
  )
}
