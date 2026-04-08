import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

function AnimatedNumber({ target, prefix = '', suffix = '', delay = 0 }: { target: number; prefix?: string; suffix?: string; delay?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const dur = 2000
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / dur, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setVal(Math.round(target * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      tick()
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay])

  const display = target >= 1000000
    ? `${(val / 1000000).toFixed(0)}M`
    : target >= 1000
    ? `${(val / 1000).toFixed(0)}K`
    : val.toString()

  return <>{prefix}{display}{suffix}</>
}

export function SEODashboard() {
  return (
    <div className="w-full h-full bg-white text-[#202124] overflow-hidden select-none" style={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}>
      <div className="p-4">
        {/* Last update */}
        <div className="flex justify-end mb-3">
          <span className="text-[10px] text-[#5f6368]">Last update: 3.5 hours ago</span>
        </div>

        {/* Metric cards */}
        <div className="flex border border-[#dadce0] rounded-lg overflow-hidden mb-3">
          {/* Total clicks */}
          <div className="flex-1 bg-[#4285f4] text-white px-3 py-2.5 border-r border-[#dadce0]">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3 h-3 border border-white/70 rounded-sm text-[7px] flex items-center justify-center">✓</span>
              <span className="text-[9px] text-white/90">Total clicks</span>
            </div>
            <div className="text-[28px] font-normal leading-none">
              <AnimatedNumber target={957000} delay={200} />
            </div>
          </div>
          {/* Total impressions */}
          <div className="flex-1 bg-[#7b1fa2] text-white px-3 py-2.5 border-r border-[#dadce0]">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3 h-3 border border-white/70 rounded-sm text-[7px] flex items-center justify-center">✓</span>
              <span className="text-[9px] text-white/90">Total impressions</span>
            </div>
            <div className="text-[28px] font-normal leading-none">
              <AnimatedNumber target={190000000} delay={400} />
            </div>
          </div>
          {/* CTR */}
          <div className="flex-1 px-3 py-2.5 border-r border-[#dadce0]">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3 h-3 border border-[#dadce0] rounded-sm text-[7px]"></span>
              <span className="text-[9px] text-[#5f6368]">Average CTR</span>
            </div>
            <div className="text-[28px] font-normal leading-none text-[#202124]">0.5%</div>
          </div>
          {/* Position */}
          <div className="flex-1 px-3 py-2.5 border-r border-[#dadce0]">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3 h-3 border border-[#dadce0] rounded-sm text-[7px]"></span>
              <span className="text-[9px] text-[#5f6368]">Average position</span>
            </div>
            <div className="text-[28px] font-normal leading-none text-[#202124]">7.9</div>
          </div>
          {/* Daily */}
          <div className="flex items-center px-3">
            <div className="px-3 py-1 border border-[#dadce0] rounded text-[10px] text-[#3c4043]">Daily ▾</div>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-lg px-3 py-2 mb-4">
          <div className="w-4 h-4 border-2 border-[#5f6368] rounded-full flex items-center justify-center text-[8px] font-bold text-[#5f6368] flex-shrink-0">i</div>
          <span className="text-[10px] text-[#5f6368]">Chart totals and table results might be partial when filters are applied. <span className="text-[#1a73e8]">Learn more</span></span>
        </div>

        {/* Chart */}
        <div className="relative" style={{ height: '220px' }}>
          {/* Y labels left */}
          <div className="absolute left-0 top-0 bottom-4 w-8 flex flex-col justify-between text-[8px] text-[#5f6368]">
            <span>12K</span>
            <span>8K</span>
            <span>4K</span>
            <span>0</span>
          </div>
          {/* Y labels right */}
          <div className="absolute right-0 top-0 bottom-4 w-8 flex flex-col justify-between text-[8px] text-[#5f6368] text-right">
            <span>2.3M</span>
            <span>1.5M</span>
            <span>750K</span>
            <span>0</span>
          </div>
          {/* Axis labels */}
          <span className="absolute left-0 -top-3 text-[9px] text-[#5f6368]">Clicks</span>
          <span className="absolute right-0 -top-3 text-[9px] text-[#5f6368]">Impressions</span>

          {/* Chart SVG */}
          <div className="absolute left-10 right-10 top-0 bottom-4">
            <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
              {/* Grid */}
              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#e8eaed" strokeWidth="1" />
              ))}

              {/* Clicks line (blue) */}
              <motion.polyline
                points="0,185 30,182 60,178 90,172 120,165 150,158 180,155 210,150 240,148 270,142 300,140 330,135 360,130 390,125 420,118 450,108 480,115 510,105 540,95 570,102 600,90 630,82 660,88 690,72 720,68 750,62 780,58 810,52 840,48 870,42 900,38 930,35 960,30 1000,28"
                fill="none"
                stroke="#4285f4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.5, ease: 'easeOut' }}
              />

              {/* Impressions line (purple) */}
              <motion.polyline
                points="0,192 30,190 60,188 90,185 120,180 150,175 180,170 210,165 240,158 270,152 300,148 330,140 360,135 390,128 420,120 450,110 480,118 510,105 540,92 570,100 600,85 630,72 660,80 690,65 720,58 750,52 780,45 810,38 840,32 870,25 900,20 930,16 960,12 1000,8"
                fill="none"
                stroke="#7b1fa2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.8, ease: 'easeOut' }}
              />
            </svg>
          </div>

          {/* X dates */}
          <div className="absolute left-10 right-10 bottom-0 flex justify-between">
            {['9/27/25', '10/16/25', '11/4/25', '11/23/25', '12/12/25', '12/31/25', '1/19/26', '2/7/26', '2/26/26', '3/17/26'].map(d => (
              <span key={d} className="text-[7px] text-[#5f6368]">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
