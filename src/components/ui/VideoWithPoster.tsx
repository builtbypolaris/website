import { useEffect, useRef, useState } from 'react'

const posterMap: Record<string, string> = {
  '/videos/stevia-cookies.mp4': '/images/posters/stevia-cookies.jpg',
  '/videos/mak-gien-invitation.mp4': '/images/posters/mak-gien-invitation.jpg',
}

/** Video with a poster overlay that stays visible when the tab is hidden
 *  (Chrome releases the video surface on alt-tab, showing a blank bg). */
export function VideoWithPoster({ src, className }: { src: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPoster, setShowPoster] = useState(true)
  const poster = posterMap[src]

  useEffect(() => {
    const onChange = () => {
      if (document.hidden) {
        setShowPoster(true)
      } else {
        setTimeout(() => setShowPoster(false), 100)
        videoRef.current?.play()
      }
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        onPlaying={() => setShowPoster(false)}
        className={className}
      >
        <source src={src} type="video/mp4" />
      </video>
      {poster && (
        <img
          src={poster}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showPoster ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
