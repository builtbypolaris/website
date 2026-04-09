import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

function CountUp({ target, delay = 0, prefix = '', suffix = '' }: { target: number; delay?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const dur = 1600
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1)
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      tick()
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay])
  return <>{prefix}{val.toLocaleString('id-ID')}{suffix}</>
}

const orders = [
  { id: '#2847', customer: 'Rina Wijaya', item: 'Nasi Goreng Spesial', status: 'Preparing', statusColor: '#f59e0b', statusBg: '#fffbeb', time: '2 min ago' },
  { id: '#2846', customer: 'Budi Santoso', item: 'Ayam Bakar Combo', status: 'Ready', statusColor: '#10b981', statusBg: '#ecfdf5', time: '8 min ago' },
  { id: '#2845', customer: 'Dewi Lestari', item: 'Mie Ayam + Es Teh', status: 'Delivered', statusColor: '#6366f1', statusBg: '#eef2ff', time: '15 min ago' },
  { id: '#2844', customer: 'Agus Prasetyo', item: 'Sate Ayam 10 tusuk', status: 'Delivered', statusColor: '#6366f1', statusBg: '#eef2ff', time: '22 min ago' },
]

export function MobileAppMockup() {
  return (
    <div className="w-full h-full bg-[#f8f9fc] overflow-hidden select-none flex flex-col" style={{ fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>
      {/* Status bar */}
      <div className="bg-white px-5 pt-3 pb-0 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#111]">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            {[6, 8, 10, 12].map((h, i) => (
              <div key={i} className="w-[3px] rounded-sm bg-[#111]" style={{ height: `${h}px` }} />
            ))}
          </div>
          <span className="text-[9px] font-bold text-[#111] ml-1">5G</span>
          <div className="w-[22px] h-[10px] rounded-[3px] border border-[#111] relative ml-0.5">
            <div className="absolute inset-[1.5px] rounded-[1.5px] bg-[#111]" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="bg-white px-5 pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] text-[#9ca3af]">Welcome back,</div>
              <div className="text-[18px] font-bold text-[#111827]">Warung Bahari</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-white text-[14px] font-bold">W</div>
          </div>
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="px-5 flex gap-2.5 mb-4">
        {[
          { label: "Today's Orders", value: 34, icon: '📦', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Revenue', value: 2850000, prefix: 'Rp ', icon: '💰', color: '#10b981', bg: '#ecfdf5' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            className="flex-1 bg-white rounded-2xl p-3.5 border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[14px]" style={{ background: m.bg }}>{m.icon}</div>
            </div>
            <div className="text-[16px] font-bold text-[#111827] leading-none mb-1">
              <CountUp target={m.value} delay={500 + i * 200} prefix={m.prefix} />
            </div>
            <div className="text-[10px] text-[#9ca3af]">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Orders list */}
      <div className="px-5 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-[#111827]">Recent Orders</span>
          <span className="text-[10px] text-[#6366f1] font-semibold">View All</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-xl p-3 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#111827]">{order.id}</span>
                  <span className="text-[10px] text-[#6b7280]">{order.customer}</span>
                </div>
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: order.statusBg, color: order.statusColor }}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#374151]">{order.item}</span>
                <span className="text-[9px] text-[#9ca3af]">{order.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-[#e5e7eb] px-5 py-2.5 flex items-center justify-around mt-auto">
        {[
          { icon: '🏠', label: 'Home', active: true },
          { icon: '📋', label: 'Orders', active: false },
          { icon: '📊', label: 'Analytics', active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab) => (
          <div key={tab.label} className="flex flex-col items-center gap-0.5">
            <span className="text-[14px]">{tab.icon}</span>
            <span className={`text-[8px] ${tab.active ? 'text-[#6366f1] font-semibold' : 'text-[#9ca3af]'}`}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
