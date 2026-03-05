export interface NavItem {
  label: string
  to: string
}

export interface Service {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  price: string
  link: string
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
