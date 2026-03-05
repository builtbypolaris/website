import { DigitalSystemIcon, AiAutomationIcon, DataInsightsIcon, MonthlyRetainerIcon } from '../assets/icons'
import type { Service } from '../types'

export const services: Service[] = [
  {
    icon: DigitalSystemIcon,
    title: 'Digital System Build',
    description: 'Websites, web apps, and mobile apps — bundled with analytics and automation from day one. Never a website alone.',
    price: 'Starting from Rp 25 juta',
    link: '/contact',
  },
  {
    icon: AiAutomationIcon,
    title: 'AI & Automation',
    description: 'Connect your tools, eliminate manual work, build AI-powered workflows. The highest-leverage investment a growing business can make.',
    price: 'Starting from Rp 15 juta',
    link: '/contact',
  },
  {
    icon: DataInsightsIcon,
    title: 'Data & Insights',
    description: 'Live dashboards and automated reports so you always know exactly how your business is performing. No more guessing.',
    price: 'Starting from Rp 10 juta',
    link: '/contact',
  },
  {
    icon: MonthlyRetainerIcon,
    title: 'Monthly Retainer',
    description: 'Your full technology team, on call. Strategy, maintenance, new builds — one monthly fee, one trusted team.',
    price: 'From Rp 5 juta/month',
    link: '/contact',
  },
]
