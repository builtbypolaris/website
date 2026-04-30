import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

function CountUp({
  target,
  delay = 0,
  suffix = '',
  prefix = '',
  compact = false,
}: {
  target: number
  delay?: number
  suffix?: string
  prefix?: string
  compact?: boolean
}) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const dur = 1800
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(eased * target)
        if (p < 1) requestAnimationFrame(tick)
      }
      tick()
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay])

  const display =
    compact && target >= 1000
      ? `${(val / 1000).toFixed(1)}K`
      : Math.round(val).toLocaleString()

  return (
    <>
      {prefix}
      {display}
      {suffix}
    </>
  )
}

const POSTS = [
  { bg: '#fce7f3', emoji: '🌸', likes: 1247 },
  { bg: '#dbeafe', emoji: '💼', likes: 892 },
  { bg: '#dcfce7', emoji: '✨', likes: 2103 },
  { bg: '#fef3c7', emoji: '🚀', likes: 743 },
  { bg: '#f3e8ff', emoji: '📱', likes: 1581 },
  { bg: '#ffedd5', emoji: '🎯', likes: 1089 },
]

export function SocialMediaDashboard() {
  return (
    <div
      className="w-full h-full bg-white overflow-hidden select-none flex flex-col"
      style={{ fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}
    >
      {/* Status bar */}
      <div className="bg-white px-4 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-semibold text-[#111]">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            {[5, 7, 9, 11].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-[#111]"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="w-[22px] h-[10px] rounded-[3px] border border-[#111] relative ml-1">
            <div
              className="absolute inset-[1.5px] rounded-[1.5px] bg-[#111]"
              style={{ width: '70%' }}
            />
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="px-4 pt-1 pb-3 flex items-center justify-between border-b border-[#efefef] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
            <path
              d="M10 13L5 8l5-5"
              stroke="#111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[15px] font-bold text-[#111]">polaris.studio</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Grid icon */}
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" stroke="#111" strokeWidth="1.3" />
            <rect x="12" y="2" width="6" height="6" rx="1" stroke="#111" strokeWidth="1.3" />
            <rect x="2" y="12" width="6" height="6" rx="1" stroke="#111" strokeWidth="1.3" />
            <rect x="12" y="12" width="6" height="6" rx="1" stroke="#111" strokeWidth="1.3" />
          </svg>
          {/* More icon */}
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <circle cx="10" cy="4.5" r="1.3" fill="#111" />
            <circle cx="10" cy="10" r="1.3" fill="#111" />
            <circle cx="10" cy="15.5" r="1.3" fill="#111" />
          </svg>
        </div>
      </div>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="px-4 pt-4 pb-3 flex-shrink-0"
      >
        <div className="flex items-center gap-4 mb-3">
          {/* Avatar with gradient ring */}
          <div
            className="w-[58px] h-[58px] rounded-full flex-shrink-0 p-[2.5px]"
            style={{
              background: 'linear-gradient(135deg, #f9a825, #e91e8c, #7c5cbf)',
            }}
          >
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-[20px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f9a825, #e91e8c, #7c5cbf)' }}
              >
                P
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around text-center">
            {[
              { value: 47, label: 'posts', animate: false },
              { value: 12400, label: 'followers', animate: true },
              { value: 891, label: 'following', animate: false },
            ].map((s, i) => (
              <div key={s.label}>
                <div className="text-[15px] font-bold text-[#111] leading-none mb-0.5">
                  {s.animate ? (
                    <CountUp target={s.value} delay={300 + i * 100} compact />
                  ) : (
                    s.value
                  )}
                </div>
                <div className="text-[10px] text-[#8e8e8e]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-1 flex items-center gap-1">
          <span className="text-[12px] font-semibold text-[#111]">polaris.studio</span>
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="#0095f6">
            <circle cx="8" cy="8" r="7" />
            <path
              d="M5 8l2 2 4-4"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <div className="text-[11px] text-[#8e8e8e] leading-[1.4] mb-3">
          Digital Marketing Agency ✦ Yogyakarta & Bali
          <br />
          Content strategy that actually converts 🚀
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <div className="flex-1 bg-[#0095f6] rounded-lg py-[7px] text-center">
            <span className="text-[12px] font-semibold text-white">Following</span>
          </div>
          <div className="flex-1 border border-[#dbdbdb] rounded-lg py-[7px] text-center">
            <span className="text-[12px] font-semibold text-[#111]">Message</span>
          </div>
          <div className="w-9 border border-[#dbdbdb] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
              <path
                d="M8 4v8M4 8h8"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Analytics strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mx-4 mb-3 rounded-xl border border-[#efefef] bg-[#fafafa] px-3 py-2.5 flex gap-3 flex-shrink-0"
      >
        <div className="flex-1 text-center">
          <div
            className="text-[18px] font-bold leading-none mb-0.5"
            style={{ color: '#7c5cbf' }}
          >
            <CountUp target={48200} delay={400} compact />
          </div>
          <div className="text-[9px] text-[#8e8e8e]">weekly reach</div>
        </div>
        <div className="w-px bg-[#efefef]" />
        <div className="flex-1 text-center">
          <div
            className="text-[18px] font-bold leading-none mb-0.5"
            style={{ color: '#e91e8c' }}
          >
            +<CountUp target={247} delay={550} />
          </div>
          <div className="text-[9px] text-[#8e8e8e]">new followers</div>
        </div>
        <div className="w-px bg-[#efefef]" />
        <div className="flex-1 text-center">
          <div className="text-[18px] font-bold leading-none mb-0.5 text-[#f59e0b]">3.8%</div>
          <div className="text-[9px] text-[#8e8e8e]">engagement</div>
        </div>
      </motion.div>

      {/* Posts grid — fills remaining space */}
      <div className="grid grid-cols-3 gap-[2px] flex-1 min-h-0">
        {POSTS.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.35 }}
            className="relative aspect-square flex items-center justify-center overflow-hidden"
            style={{ background: post.bg }}
          >
            <span className="text-[28px]">{post.emoji}</span>
            {/* Like count overlay */}
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5">
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="white">
                <path d="M6 10.5s-4.5-2.8-4.5-5.25A2.25 2.25 0 0 1 6 3.7a2.25 2.25 0 0 1 4.5 1.55C10.5 7.7 6 10.5 6 10.5z" />
              </svg>
              <span className="text-[8px] font-bold text-white drop-shadow-sm">
                {post.likes >= 1000
                  ? `${(post.likes / 1000).toFixed(1)}K`
                  : post.likes}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-[#efefef] px-3 py-2 flex items-center justify-around flex-shrink-0">
        {[
          {
            active: false,
            path: 'M3 9.5L9.5 3L16 9.5M5 7.8V16h4v-4h3v4h4V7.8',
          },
          {
            active: false,
            path: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm5 8.5h-4.5V7',
          },
          null, // plus
          {
            active: false,
            path: 'M3 6h14M3 10h14M3 14h14',
          },
          {
            active: true,
            path: 'M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3z',
          },
        ].map((item, i) =>
          item === null ? (
            <div
              key={i}
              className="w-7 h-7 rounded-lg border-2 border-[#111] flex items-center justify-center"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="#111"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <svg
              key={i}
              viewBox="0 0 20 20"
              className="w-6 h-6"
              fill={item.active ? '#111' : 'none'}
              stroke={item.active ? 'none' : '#111'}
              strokeWidth="1.2"
            >
              <path d={item.path} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        )}
      </div>
    </div>
  )
}
