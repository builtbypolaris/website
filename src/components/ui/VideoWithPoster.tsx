import { useEffect, useRef, useState } from 'react'

const posterMap: Record<string, string> = {
  '/videos/stevia-cookies.mp4': '/images/posters/stevia-cookies.jpg',
  '/videos/mak-gien-invitation.mp4': '/images/posters/mak-gien-invitation.jpg',
  '/videos/mulia-plastik.mp4': '/images/posters/mulia-plastik.jpg',
  '/videos/posyandu.mp4': '/images/posters/posyandu.jpg',
  '/videos/adhd-productivity.mp4': '/images/posters/adhd-productivity.jpg',
  '/videos/javanese-emotion.mp4': '/images/posters/javanese-emotion.jpg',
}

/**
 * Video with a poster fallback. The poster image shows:
 *  1. While the video is still loading
 *  2. When the tab is hidden (alt-tab) — Chrome drops the video surface
 *
 * On visibility change we hide the video element entirely so the poster
 * underneath is guaranteed to show, regardless of browser behavior.
 */
export function VideoWithPoster({ src, className }: { src: string; className: string }) {
  const poster = posterMap[src]
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setHidden(true)
      } else {
        setHidden(false)
        // Resume playback when tab becomes visible again
        videoRef.current?.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div className="relative w-full h-full">
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        poster={poster}
        className={`relative ${className} ${hidden ? 'invisible' : ''}`}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
