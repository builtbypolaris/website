interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[1100px] px-10 ${className}`}>
      {children}
    </div>
  )
}
