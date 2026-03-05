import { useRef, useEffect } from 'react'

interface Dot {
  x: number
  y: number
  radius: number
  opacity: number
  vx: number
  vy: number
  phase: number
}

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dots: Dot[] = []
    let animationId: number

    function resizeCanvas() {
      canvas!.width = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }

    function createDots() {
      dots = []
      const count = Math.floor((canvas!.width * canvas!.height) / 18000)
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    function drawDots(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      dots.forEach((dot) => {
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < 0) dot.x = canvas!.width
        if (dot.x > canvas!.width) dot.x = 0
        if (dot.y < 0) dot.y = canvas!.height
        if (dot.y > canvas!.height) dot.y = 0

        const flicker = Math.sin(time * 0.001 + dot.phase) * 0.15 + 0.85
        ctx!.beginPath()
        ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(184, 159, 240, ${dot.opacity * flicker})`
        ctx!.fill()
      })

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx!.beginPath()
            ctx!.moveTo(dots[i].x, dots[i].y)
            ctx!.lineTo(dots[j].x, dots[j].y)
            ctx!.strokeStyle = `rgba(124, 92, 191, ${0.06 * (1 - dist / 120)})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(drawDots)
    }

    function init() {
      resizeCanvas()
      createDots()
      animationId = requestAnimationFrame(drawDots)
    }

    init()

    const handleResize = () => {
      cancelAnimationFrame(animationId)
      init()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  )
}
