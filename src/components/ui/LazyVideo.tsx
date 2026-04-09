import { useRef, useEffect, useState } from 'react'

interface LazyVideoProps {
  src: string
  className?: string
  /** Delay in ms before starting to load the video (default: 0) */
  delay?: number
}

/**
 * Video that defers loading until after initial page resources settle.
 * Shows nothing extra — just a muted autoplay loop that fades in once ready.
 */
export function LazyVideo({ src, className = '', delay = 0 }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(delay === 0)

  // Defer loading if delay is set
  useEffect(() => {
    if (delay === 0) return
    const t = setTimeout(() => setShouldLoad(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  // Once video can play, fade it in
  useEffect(() => {
    const el = ref.current
    if (!el || !shouldLoad) return

    el.src = src
    el.load()

    const onCanPlay = () => {
      setReady(true)
      el.play().catch(() => {})
    }

    el.addEventListener('canplay', onCanPlay)
    return () => el.removeEventListener('canplay', onCanPlay)
  }, [src, shouldLoad])

  return (
    <video
      ref={ref}
      muted
      playsInline
      loop
      preload="auto"
      className={`${className} transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
