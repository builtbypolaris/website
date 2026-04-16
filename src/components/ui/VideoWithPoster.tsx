const posterMap: Record<string, string> = {
  '/videos/stevia-cookies.mp4': '/images/posters/stevia-cookies.jpg',
  '/videos/mak-gien-invitation.mp4': '/images/posters/mak-gien-invitation.jpg',
  '/videos/mulia-plastik.mp4': '/images/posters/mulia-plastik.jpg',
  '/videos/posyandu.mp4': '/images/posters/posyandu.jpg',
  '/videos/adhd-productivity.mp4': '/images/posters/adhd-productivity.jpg',
  '/videos/javanese-emotion.mp4': '/images/posters/javanese-emotion.jpg',
}

/** Poster image sits permanently behind the video. When Chrome drops the
 *  video surface (alt-tab, tab throttle), the video becomes transparent
 *  and the poster shows through — no JS events needed. */
export function VideoWithPoster({ src, className }: { src: string; className: string }) {
  const poster = posterMap[src]

  return (
    <div className="relative w-full h-full">
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <video muted playsInline autoPlay loop preload="auto" className={`relative ${className}`}>
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
