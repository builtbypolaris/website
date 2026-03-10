import { HealthCheckIcon, WebDevIcon, ContentIcon, AutomationIcon, CustomIcon } from '../assets/icons'
import type { ServiceCategory } from '../types'

export const serviceCategories: ServiceCategory[] = [
  {
    icon: HealthCheckIcon,
    title: 'Business Health Check',
    tagline: 'Free 3-day diagnostic that gives you clarity before commitment.',
    description:
      'The starting point. A 3-day diagnostic that gives you a clear written report on what\u2019s actually holding your business back, plus a 90-day action plan. Direction before decisions.',
    tiers: [
      {
        name: 'Business Health Check',
        price: 'Gratis',
        description:
          'A clear written report on what\u2019s holding your business back, plus a 90-day action plan.',
      },
    ],
    highlight: 'GRATIS',
    link: '/contact',
  },
  {
    icon: WebDevIcon,
    title: 'Website Development',
    tagline: 'Your digital storefront, built right.',
    description:
      'We design, develop, and deploy websites and web apps on modern infrastructure \u2014 fast, secure, and scalable. Every site comes with analytics baked in.',
    tiers: [
      {
        name: 'Website (tanpa domain)',
        price: 'From Rp 1,500,000',
        description: 'Development and deployment, hosted on Vercel. You bring your own domain.',
      },
      {
        name: 'Website + Domain',
        price: 'From Rp 1,750,000',
        description:
          'We handle everything including domain registration. Available TLDs: .com, .co.id, .id, .ai, and more.',
      },
      {
        name: 'Web Application',
        price: 'From Rp 3,500,000',
        description:
          'Complex, interactive web apps with custom functionality \u2014 dashboards, portals, booking systems, e-commerce.',
      },
    ],
    link: '/pricing',
  },
  {
    icon: ContentIcon,
    title: 'Content Creation',
    tagline: 'Your brand\u2019s voice, powered by AI and guided by strategy.',
    description:
      'We create, publish, and optimize content that drives traffic and builds trust \u2014 so you can focus on running your business.',
    tiers: [
      {
        name: 'Blog Writing',
        price: 'From Rp 1,500,000/bulan',
        description:
          'SEO-optimized articles researched and published to your site. Packages of 10 or 20 articles per month.',
      },
      {
        name: 'Social Media Content',
        price: 'From Rp 1,750,000/bulan',
        description:
          '30 pieces per month including captions, images, and hashtag strategy for Instagram, LinkedIn, TikTok.',
      },
      {
        name: 'Full Content Package',
        price: 'From Rp 3,500,000/bulan',
        description: 'Blog + social media + daily digest. One cohesive content strategy, fully managed.',
      },
    ],
    link: '/pricing',
  },
  {
    icon: AutomationIcon,
    title: 'Business Automation',
    tagline: 'Your entire back-office, digitized.',
    description:
      'We build custom internal systems so you can run your business from one dashboard. Available as a complete suite or individual modules.',
    tiers: [
      {
        name: 'CRM & Lead Management',
        price: 'From Rp 2,500,000',
        description: 'Track every lead, automate follow-ups, see your entire sales pipeline at a glance.',
      },
      {
        name: 'Financial Reporting',
        price: 'From Rp 2,500,000',
        description: 'Live dashboards, automated financial statements. No more manual spreadsheets.',
      },
      {
        name: 'WhatsApp Business Integration',
        price: 'From Rp 2,500,000',
        description:
          'Connect WA Business API to your system. Control leads, automate responses from one place.',
      },
      {
        name: 'Payroll & HR',
        price: 'From Rp 2,500,000',
        description: 'Employee management, attendance tracking, automated payroll calculations.',
      },
      {
        name: 'Full Business Suite',
        price: 'From Rp 5,000,000',
        description:
          'All modules in one unified platform. CRM, finance, WhatsApp, HR \u2014 the complete digital backbone.',
      },
    ],
    link: '/pricing',
  },
  {
    icon: CustomIcon,
    title: 'Custom Solutions',
    tagline: 'If it\u2019s a problem, we\u2019ll solve it.',
    description:
      'Beyond our core services, we build whatever your business needs \u2014 AI chatbots, e-commerce integrations, custom workflows, data pipelines, API integrations, or tools that don\u2019t exist yet.',
    tiers: [
      {
        name: 'Custom Project',
        price: 'Let\u2019s talk',
        description:
          'If you can describe the problem, we can build the solution. Scoped and priced after your Health Check.',
      },
    ],
    link: '/contact',
  },
]
