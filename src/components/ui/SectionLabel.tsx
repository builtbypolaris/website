interface SectionLabelProps {
  children: React.ReactNode
  centered?: boolean
  light?: boolean
}

export function SectionLabel({ children, centered = false, light = false }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-4 mb-6 font-sans text-[11px] font-bold tracking-[4px] uppercase ${light ? 'text-[#7C3AED]' : 'text-purple-bright'} ${centered ? 'justify-center' : ''}`}>
      <span className={`w-2 h-2 rounded-full ${light ? 'bg-[#7C3AED]/60' : 'bg-purple-core/60'} shadow-[0_0_8px_rgba(124,58,237,0.4)]`} />
      {children}
      <span className={`w-16 h-px bg-gradient-to-r ${light ? 'from-[#7C3AED]/40' : 'from-purple-bright/40'} to-transparent`} />
    </div>
  )
}
