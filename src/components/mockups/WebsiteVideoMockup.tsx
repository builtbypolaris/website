import { useEffect, useRef } from 'react'

export function WebsiteVideoMockup() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 600
    const h = 400
    canvas.width = w
    canvas.height = h

    const imageData = ctx.createImageData(w, h)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 28
    }
    ctx.putImageData(imageData, 0, 0)
  }, [])

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: 'url(/images/constellation-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Grain texture */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', opacity: 0.25, mixBlendMode: 'screen' }}
      />

      {/* Subtle dark overlay so video pops */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(10,4,20,0.35)' }}
      />

      {/* YouTube embed */}
      <div className="absolute inset-5 rounded-xl overflow-hidden shadow-[0_16px_56px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]">
        <iframe
          src="https://www.youtube.com/embed/qV3Edm1mpaA?rel=0&modestbranding=1"
          title="Website Development"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  )
}
