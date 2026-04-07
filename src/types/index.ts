export interface NavItem {
  label: string
  to: string
}

export interface SubService {
  name: string
  description: string
  image?: string
}

export interface ServiceCategory {
  icon: React.ComponentType<{ className?: string }>
  illustration: string
  /** Multiple images for crossfade animation in phone mockup */
  illustrations?: string[]
  device: 'browser' | 'phone'
  title: string
  tagline: string
  description: string
  subServices: SubService[]
  highlight?: string
  ctaLabel: string
  whatsappMessage: string
  slug: string
  /** Whether to show on the home page grid */
  showOnHome?: boolean
}

export interface Problem {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface Value {
  number: string
  word: string
  description: string
}

export interface TimelineStep {
  number: string
  title: string
  description: string
  tag: string
}

export interface StatBox {
  title: string
  description: string
}

export interface SocialLink {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}
