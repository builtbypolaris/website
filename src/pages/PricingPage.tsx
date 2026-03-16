import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { SectionLabel } from '../components/ui/SectionLabel'
import { StaggerContainer, StaggerItem } from '../components/ui/StaggerContainer'
import { CtaSection } from '../components/sections/CtaSection'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'

interface PricingTier {
  name: string
  price: string
}

interface PricingSection {
  title: string
  subtitle?: string
  tiers: PricingTier[]
}

const pricingSections: PricingSection[] = [
  {
    title: 'Diagnostic',
    tiers: [
      { name: 'Business Health Check', price: 'FREE' },
    ],
  },
  {
    title: 'Website Development',
    subtitle: 'One-time build',
    tiers: [
      { name: 'Website (tanpa domain)', price: 'Rp 1,500,000' },
      { name: 'Website + Domain .com', price: 'Rp 1,750,000' },
      { name: 'Website + Domain .co.id', price: 'Rp 1,850,000' },
      { name: 'Website + Domain .id', price: 'Rp 2,000,000' },
      { name: 'Website + Domain .sch.id', price: 'Rp 1,750,000' },
      { name: 'Website + Domain .ai', price: 'Rp 3,000,000' },
      { name: 'Web Application (custom)', price: 'From Rp 3,500,000' },
    ],
  },
  {
    title: 'Website Maintenance',
    subtitle: 'Annual',
    tiers: [
      { name: 'Maintenance (tanpa domain)', price: 'Rp 750,000/tahun' },
      { name: 'Maintenance + Renewal .com', price: 'Rp 1,000,000/tahun' },
      { name: 'Maintenance + Renewal .co.id', price: 'Rp 1,000,000/tahun' },
      { name: 'Maintenance + Renewal .id', price: 'Rp 1,250,000/tahun' },
      { name: 'Maintenance + Renewal .sch.id', price: 'Rp 1,000,000/tahun' },
      { name: 'Maintenance + Renewal .ai', price: 'Rp 2,000,000/tahun' },
    ],
  },
  {
    title: 'Content Creation',
    subtitle: 'Monthly',
    tiers: [
      { name: 'Blog Writer 10 (10 artikel/bulan)', price: 'Rp 1,500,000/bulan' },
      { name: 'Blog Writer 20 (20 artikel/bulan)', price: 'Rp 2,250,000/bulan' },
      { name: 'Social Media Package (30 konten/bulan)', price: 'Rp 1,750,000/bulan' },
      { name: 'Full Content Package', price: 'Rp 3,500,000/bulan' },
    ],
  },
  {
    title: 'Business Automation',
    subtitle: 'Build fee',
    tiers: [
      { name: 'CRM & Lead Management', price: 'Rp 2,500,000' },
      { name: 'Financial Reporting Dashboard', price: 'Rp 2,500,000' },
      { name: 'WA Business API Integration', price: 'Rp 2,500,000' },
      { name: 'Payroll & HR Attendance', price: 'Rp 2,500,000' },
      { name: 'Full Business Suite', price: 'Rp 5,000,000' },
    ],
  },
  {
    title: 'Automation Maintenance',
    subtitle: 'Annual',
    tiers: [
      { name: 'CRM & Lead Management', price: 'Rp 2,000,000/tahun' },
      { name: 'Financial Reporting Dashboard', price: 'Rp 2,000,000/tahun' },
      { name: 'WA Business API Integration', price: 'Rp 3,500,000/tahun' },
      { name: 'Payroll & HR Attendance', price: 'Rp 2,000,000/tahun' },
      { name: 'Full Business Suite', price: 'Rp 5,000,000/tahun' },
    ],
  },
]

export function PricingPage() {
  return (
    <div className="pt-[88px]">
      {/* Pricing page hero */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_60%)] pointer-events-none" />
        <Container className="relative z-[1]">
          <MotionReveal className="max-w-[700px]">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-6">Pricing</p>
            <h1 className="font-serif font-light text-[72px] text-white leading-[1.1] mb-6">
              Transparent pricing.<br />
              <span className="text-purple-glow">No surprises.</span>
            </h1>
            <p className="font-sans font-light text-base text-grey-light leading-[1.8] max-w-[540px]">
              Starting prices for every service. All projects begin with a free Business Health Check so we can scope exactly what you need.
            </p>
          </MotionReveal>
        </Container>
      </section>

      {/* Pricing sections */}
      {pricingSections.map((section, idx) => (
        <section
          key={section.title}
          className={`${idx % 2 === 0 ? 'bg-surface' : 'bg-void'} py-[60px] relative section-divider-top`}
        >
          <Container>
            <MotionReveal className="mb-8">
              <SectionLabel>{section.title}</SectionLabel>
              {section.subtitle && (
                <p className="font-sans text-[12px] text-grey tracking-widest uppercase mt-1">
                  {section.subtitle}
                </p>
              )}
            </MotionReveal>

            <StaggerContainer stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.tiers.map((tier) => (
                <StaggerItem key={tier.name}>
                  <div className="group bg-card border border-border rounded-xl p-5 h-full transition-all duration-500 hover:border-purple-core/50 hover:bg-card-hover card-glow">
                    <h4 className="font-sans font-normal text-sm text-white mb-2">
                      {tier.name}
                    </h4>
                    <p className={`font-sans text-[13px] tracking-wider uppercase ${
                      tier.price === 'FREE' ? 'text-gold font-medium' : 'text-gold/80'
                    }`}>
                      {tier.price}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </section>
      ))}

      <CtaSection />
    </div>
  )
}
