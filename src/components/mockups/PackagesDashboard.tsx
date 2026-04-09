import { motion } from 'motion/react'

const packages = [
  {
    name: 'Full Business Suite',
    tag: 'Most Popular',
    description: 'The complete digital backbone for your business in one unified platform.',
    services: ['CRM & Lead Management', 'Financial Reporting', 'Payroll & HR Attendance'],
    accent: '#7c5cbf',
    highlight: true,
  },
  {
    name: 'Website + SEO Blog',
    tag: 'Best Value',
    description: 'A new website plus ongoing blog content to drive organic traffic from day one.',
    services: ['Website Development', 'SEO Blog Writing'],
    accent: '#c9a96e',
    highlight: false,
  },
  {
    name: 'Social Media + Blog',
    tag: null,
    description: 'Consistent content across social media and your blog. One cohesive strategy.',
    services: ['Social Media Content', 'SEO Blog Writing'],
    accent: '#3b82f6',
    highlight: false,
  },
  {
    name: 'SEO + Blog Writing',
    tag: null,
    description: 'Optimize your site for search engines and fuel it with fresh content every month.',
    services: ['SEO Optimization', 'SEO Blog Writing'],
    accent: '#10b981',
    highlight: false,
  },
]

export function PackagesDashboard() {
  return (
    <div className="w-full h-full bg-[#0d0b14] overflow-hidden select-none flex flex-col" style={{ fontFamily: "'Inter', 'Roboto', Arial, sans-serif" }}>
      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-[10px] text-[#c9a96e] tracking-[3px] uppercase mb-2">Bundled Services</div>
          <div className="text-[22px] font-bold text-white leading-tight">Choose Your Package</div>
          <div className="text-[11px] text-[#8b8b9e] mt-1">Save more when you bundle complementary services together.</div>
        </motion.div>
      </div>

      {/* Package cards row */}
      <div className="px-8 flex gap-3 flex-1 min-h-0 pb-5">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-2xl border flex flex-col relative overflow-hidden"
            style={{
              background: pkg.highlight
                ? `linear-gradient(160deg, ${pkg.accent}15, ${pkg.accent}08, #16141f)`
                : '#16141f',
              borderColor: pkg.highlight ? `${pkg.accent}50` : '#2a2838',
            }}
          >
            {pkg.tag && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.3 }}
                className="absolute top-3 right-3 text-[8px] font-bold px-2 py-1 rounded-full"
                style={{ background: `${pkg.accent}25`, color: pkg.accent }}
              >
                {pkg.tag}
              </motion.div>
            )}

            <div className="p-5 flex-1 flex flex-col">
              {/* Package name */}
              <div className="text-[14px] font-bold text-white mb-2 leading-snug pr-16">{pkg.name}</div>

              {/* Description */}
              <div className="text-[10px] text-[#8b8b9e] leading-relaxed mb-5">{pkg.description}</div>

              {/* Included services */}
              <div className="text-[9px] text-[#6b6b80] uppercase tracking-[1.5px] mb-3">What's included</div>
              <div className="flex-1 flex flex-col gap-3">
                {pkg.services.map((s, si) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 + si * 0.08, duration: 0.3 }}
                    className="flex items-center gap-2.5"
                  >
                    <div
                      className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px]"
                      style={{ background: `${pkg.accent}25`, color: pkg.accent }}
                    >
                      ✓
                    </div>
                    <span className="text-[11px] text-[#e0dfe6]">{s}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA button */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                className="mt-5 text-center py-2.5 rounded-xl text-[11px] font-bold"
                style={pkg.highlight
                  ? { background: pkg.accent, color: '#fff' }
                  : { background: '#2a2838', color: '#a09fb0' }
                }
              >
                Get Started
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
