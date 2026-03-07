interface SectionLabelProps {
  children: React.ReactNode
  centered?: boolean
}

export function SectionLabel({ children, centered = false }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-4 mb-6 font-sans text-[11px] font-normal tracking-[4px] uppercase text-purple-bright ${centered ? 'justify-center' : ''}`}>
      <span className="w-2 h-2 rounded-full bg-purple-core/60 shadow-[0_0_8px_rgba(124,92,191,0.4)]" />
      {children}
      <span className="w-16 h-px bg-gradient-to-r from-purple-bright/40 to-transparent" />
    </div>
  )
}
