import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(el)
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}
