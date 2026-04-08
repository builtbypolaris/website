import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

function CountUp({ target, delay = 0, prefix = '', suffix = '' }: { target: number; delay?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const dur = 1800
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(target * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      tick()
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay])

  const display = target >= 1000000
    ? `${(val / 1000000).toFixed(1)}M`
    : target >= 1000
    ? `${(val / 1000).toFixed(1)}K`
    : val.toString()

  return <>{prefix}{display}{suffix}</>
}

const navItems = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '👥', label: 'Leads', active: false },
  { icon: '💰', label: 'Deals', active: false },
  { icon: '📧', label: 'Emails', active: false },
  { icon: '📋', label: 'Tasks', active: false },
  { icon: '📈', label: 'Reports', active: false },
]

const metrics = [
  { label: 'Total Revenue', value: 142500000, prefix: 'Rp ', change: '+18.2%', color: '#10b981', bg: '#ecfdf5', icon: '💰' },
  { label: 'Active Deals', value: 47, change: '+5', color: '#6366f1', bg: '#eef2ff', icon: '🤝' },
  { label: 'New Leads', value: 284, change: '+32', color: '#f59e0b', bg: '#fffbeb', icon: '🎯' },
  { label: 'Conversion', value: 32, suffix: '.4%', change: '+4.1%', color: '#ef4444', bg: '#fef2f2', icon: '📈' },
]

const barData = [28, 35, 42, 38, 52, 48, 58, 55, 68, 62, 72, 78, 72, 82, 75, 88, 82, 92, 85, 95]

const deals = [
  { name: 'PT Maju Jaya', val: 'Rp 25M', stage: 'Qualified', color: '#10b981', bg: '#ecfdf5' },
  { name: 'CV Sinar Abadi', val: 'Rp 15M', stage: 'Proposal', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Toko Berkah', val: 'Rp 8M', stage: 'Negotiation', color: '#6366f1', bg: '#eef2ff' },
  { name: 'PT Global Tech', val: 'Rp 42M', stage: 'Closed Won', color: '#10b981', bg: '#ecfdf5' },
]

export function CRMDashboard() {
  return (
    <div className="w-full h-full bg-[#f8f9fc] overflow-hidden select-none flex" style={{ fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>
      {/* Sidebar */}
      <div className="w-[16%] bg-[#111827] py-3 px-1.5 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-1.5 px-2 mb-4">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" />
          <span className="text-[6px] font-bold text-white tracking-wider">NEXUS CRM</span>
        </div>
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-0.5 ${item.active ? 'bg-[#6366f1]/20' : ''}`}
          >
            <span className="text-[8px]">{item.icon}</span>
            <span className={`text-[6px] ${item.active ? 'text-[#a5b4fc] font-semibold' : 'text-white/40'}`}>{item.label}</span>
          </motion.div>
        ))}
        {/* User */}
        <div className="mt-auto pt-3 px-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444]" />
            <div>
              <div className="text-[5px] text-white font-medium">Sarah Chen</div>
              <div className="text-[4px] text-white/30">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div>
            <div className="text-[9px] font-bold text-[#111827]">Dashboard</div>
            <div className="text-[5px] text-[#6b7280]">Tuesday, April 8 2026</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#f3f4f6] rounded-lg px-2 py-1 text-[5px] text-[#6b7280]">🔍 Search...</div>
            <div className="relative">
              <span className="text-[9px]">🔔</span>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full border border-white" />
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-xl p-2 border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[4px] uppercase tracking-wider text-[#6b7280] font-medium">{m.label}</span>
                  <div className="w-4 h-4 rounded-lg flex items-center justify-center text-[7px]" style={{ background: m.bg }}>{m.icon}</div>
                </div>
                <div className="text-[11px] font-bold text-[#111827]">
                  <CountUp target={m.value} delay={300 + i * 150} prefix={m.prefix} suffix={m.suffix} />
                </div>
                <div className="text-[4px] font-semibold mt-0.5" style={{ color: m.color }}>▲ {m.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Revenue chart */}
            <div className="flex-[1.5] bg-white rounded-xl border border-[#e5e7eb] p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[7px] font-bold text-[#111827]">Revenue Overview</span>
                <div className="flex gap-1">
                  {['1W', '1M', '3M', '1Y'].map((p, i) => (
                    <span key={p} className={`text-[4px] px-1 py-0.5 rounded ${i === 2 ? 'bg-[#6366f1] text-white font-bold' : 'text-[#9ca3af] bg-[#f3f4f6]'}`}>{p}</span>
                  ))}
                </div>
              </div>
              <div className="h-[60px] flex items-end gap-[2px] px-0.5">
                {barData.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: i >= 16
                        ? 'linear-gradient(to top, #6366f1, #8b5cf6)'
                        : i >= 12 ? '#c7d2fe' : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5 px-0.5">
                {['Jan', 'Feb', 'Mar', 'Apr'].map(m => (
                  <span key={m} className="text-[4px] text-[#9ca3af]">{m}</span>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div className="flex-1 bg-white rounded-xl border border-[#e5e7eb] p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="text-[7px] font-bold text-[#111827] block mb-2">Pipeline</span>
              {deals.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.12, duration: 0.4 }}
                  className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[5px] font-bold text-white" style={{ background: d.color }}>{d.name[0]}</div>
                    <div>
                      <div className="text-[5px] font-semibold text-[#111827]">{d.name}</div>
                      <div className="text-[4px] text-[#9ca3af]">{d.val}</div>
                    </div>
                  </div>
                  <span className="text-[4px] px-1 py-0.5 rounded-full font-medium" style={{ background: d.bg, color: d.color }}>{d.stage}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
