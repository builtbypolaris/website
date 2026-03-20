interface DeviceFrameProps {
  src: string
  alt: string
  className?: string
}

export function DeviceFrame({ src, alt, className = '' }: DeviceFrameProps) {
  return (
    <div className={className}>
      {/* Laptop screen bezel */}
      <div className="relative bg-[#1a1a2e] rounded-t-xl pt-6 px-[6px] pb-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/[0.08]">
        {/* Traffic light dots */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#ff5f57]" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#febc2e]" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#28c840]" />
        </div>

        {/* Screen */}
        <div className="rounded-sm overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
        </div>
      </div>

      {/* Laptop base */}
      <div className="bg-[#1a1a2e] h-[5px] rounded-b-[4px] border-x border-b border-white/[0.06]" />
      <div className="bg-[#14142a] h-[3px] rounded-b-lg mx-auto w-[35%]" />
    </div>
  )
}
