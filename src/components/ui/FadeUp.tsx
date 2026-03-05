import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
}

export function FadeUp({ children, className = '' }: FadeUpProps) {
  const { ref, isVisible } = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={`fade-up ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
