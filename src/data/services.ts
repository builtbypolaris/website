import { useMemo } from 'react'
import {
  WebDevIcon,
  AppDevIcon,
  SEOContentIcon,
  BusinessOpIcon,
  OthersIcon,
  PackagesIcon,
} from '../assets/icons'
import type { ServiceCategory } from '../types'
import { useT } from '../i18n'

/**
 * Structural data for each service category — icons, image paths, device
 * type, and home-page visibility flags. Text content (title, description,
 * sub-services, etc.) lives in the translation files (`locales/en.ts` and
 * `locales/id.ts`).
 *
 * The two are merged via the `useServiceCategories` hook below, which is
 * the only API consumers should use.
 *
 * Slugs are stable across locales (English-only) so URLs like
 * `/insights/{slug}` and `/services#{slug}` work the same in both languages.
 */
interface ServiceStructure {
  slug: string
  icon: React.ComponentType<{ className?: string }>
  illustration: string
  illustrations?: string[]
  device: 'browser' | 'phone'
  showOnHome?: boolean
}

const STRUCTURE: ServiceStructure[] = [
  {
    slug: 'website-development',
    icon: WebDevIcon,
    illustration: '/images/services/website-1.png',
    device: 'browser',
    showOnHome: true,
  },
  {
    slug: 'application-development',
    icon: AppDevIcon,
    illustration: '/images/services/content-creation.webp',
    device: 'phone',
    showOnHome: false,
  },
  {
    slug: 'seo-content-creation',
    icon: SEOContentIcon,
    illustration: '/images/services/seo.jpeg',
    device: 'browser',
    showOnHome: true,
  },
  {
    slug: 'business-operation',
    icon: BusinessOpIcon,
    illustration: '/images/services/business-automation.webp',
    device: 'browser',
    showOnHome: true,
  },
  {
    slug: 'others',
    icon: OthersIcon,
    illustration: '/images/services/online-invitation-1.jpeg',
    illustrations: [
      '/images/services/online-invitation-1.jpeg',
      '/images/services/online-invitation-2.jpeg',
    ],
    device: 'phone',
    showOnHome: true,
  },
  {
    slug: 'packages',
    icon: PackagesIcon,
    illustration: '/images/services/website-2.png',
    device: 'browser',
  },
]

/**
 * Returns the full list of service categories merged with the active
 * locale's translations. The shape matches `ServiceCategory` so existing
 * components can drop this in with no other changes.
 *
 * Memoized on `t.services.categories` so the array is stable across renders
 * within the same locale (animations and key-based React features stay happy).
 */
export function useServiceCategories(): ServiceCategory[] {
  const t = useT()
  return useMemo(() => {
    return STRUCTURE.map((structure) => {
      const translation = t.services.categories.find((c) => c.slug === structure.slug)
      if (!translation) {
        throw new Error(`Missing translation for service category: ${structure.slug}`)
      }
      return {
        icon: structure.icon,
        illustration: structure.illustration,
        illustrations: structure.illustrations,
        device: structure.device,
        showOnHome: structure.showOnHome,
        slug: structure.slug,
        title: translation.title,
        tagline: translation.tagline,
        description: translation.description,
        ctaLabel: translation.ctaLabel,
        whatsappMessage: translation.whatsappMessage,
        subServices: translation.subServices.map((s) => ({
          name: s.name,
          description: s.description,
        })),
      }
    })
  }, [t.services.categories])
}
