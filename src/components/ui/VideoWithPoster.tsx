import { useEffect, useRef, useState } from 'react'

const posterMap: Record<string, string> = {
  '/videos/stevia-cookies.mp4': '/images/posters/stevia-cookies.jpg',
  '/videos/mak-gien-invitation.mp4': '/images/posters/mak-gien-invitation.jpg',
  '/videos/mulia-plastik.mp4': '/images/posters/mulia-plastik.jpg',
  '/videos/posyandu.mp4': '/images/posters/posyandu.jpg',
  '/videos/adhd-productivity.mp4': '/images/posters/adhd-productivity.jpg',
  '/videos/javanese-emotion.mp4': '/images/posters/javanese-emotion.jpg',
}

export function VideoWithPoster({ src, className }: { src: string; className: string }) {
  const poster = posterMap[src]
  const videoRef = useRef<HTMLVideoElement>(null)
  const [tabHidden, setTabHidden] = useState(false)

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setTabHidden(true)
        videoRef.current?.pause()
      } else {
        videoRef.current?.play().catch(() => {})
        // Small delay before showing video again so it has a frame ready
        setTimeout(() => setTabHidden(false), 100)
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
        className={`relative ${className}`}
        style={tabHidden ? { display: 'none' } : undefined}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
