import { WebDevIcon, AppDevIcon, SEOContentIcon, BusinessOpIcon, OthersIcon, PackagesIcon } from '../assets/icons'
import type { ServiceCategory } from '../types'

export const serviceCategories: ServiceCategory[] = [
  {
    icon: WebDevIcon,
    illustration: '/images/services/website-1.png',
    device: 'browser',
    title: 'Website Development',
    tagline: 'Your digital storefront, built right.',
    description:
      'We design, develop, and deploy websites on modern infrastructure — fast, secure, and scalable. Every site comes with analytics baked in.',
    subServices: [
      {
        name: 'Website Only',
        description: 'Development and deployment, hosted on Vercel. You bring your own domain or go without.',
        image: '/images/services/website-1.png',
      },
      {
        name: 'Website + Domain',
        description: 'We handle everything including domain registration. Available TLDs: .com, .co.id, .id, .sch.id, .ai, .io, .dev, and more.',
        image: '/images/services/website-2.png',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I\u2019m interested in Website Development. Can we discuss my project?',
    slug: 'website-development',
    showOnHome: true,
  },
  {
    icon: AppDevIcon,
    illustration: '/images/services/content-creation.webp',
    device: 'phone',
    title: 'Application Development',
    tagline: 'Custom applications built for your specific needs.',
    description:
      'From concept to deployment — native or cross-platform mobile apps for iOS and Android. From simple utility apps to full-featured business tools.',
    subServices: [
      {
        name: 'Mobile Application',
        description: 'Native or cross-platform mobile apps for iOS and Android, tailored to your business requirements.',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I\u2019m interested in Application Development. Can we discuss my project?',
    slug: 'application-development',
    showOnHome: false,
  },
  {
    icon: SEOContentIcon,
    illustration: '/images/services/seo.jpeg',
    device: 'browser',
    title: 'SEO & Content Creation',
    tagline: 'Your brand\u2019s visibility, powered by AI and guided by strategy.',
    description:
      'We optimize, create, and manage content that drives traffic and builds trust. From search engine optimization to social media — one cohesive strategy, fully managed.',
    subServices: [
      {
        name: 'SEO Optimization',
        description: 'Technical and on-page SEO to improve your search rankings. Keyword research, site speed, meta tags, structured data, and ongoing optimization.',
      },
      {
        name: 'SEO Blog Writing',
        description: 'SEO-optimized articles researched and published to your site. Each with custom imagery and keyword targeting to drive organic traffic.',
      },
      {
        name: 'SEO Audit',
        description: 'Comprehensive analysis of your site\u2019s SEO health. Technical issues, content gaps, competitor benchmarking, and a prioritized action plan.',
      },
      {
        name: 'Social Media Branding',
        description: 'Brand identity for your social presence. Visual templates, tone of voice guidelines, bio optimization, and cohesive profile design across platforms.',
      },
      {
        name: 'Social Media Content Creation',
        description: 'Ready-to-post content for Instagram, LinkedIn, TikTok, and more. Captions, images, reels, and hashtag strategy — fully managed.',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I\u2019m interested in SEO & Content Creation services. Let\u2019s talk!',
    slug: 'seo-content-creation',
    showOnHome: true,
  },
  {
    icon: BusinessOpIcon,
    illustration: '/images/services/business-automation.webp',
    device: 'browser',
    title: 'Business Operation',
    tagline: 'Your back-office, digitized.',
    description:
      'Custom internal systems so you can run your business from one place. From company profiles to full HR automation — we build the digital backbone your business needs.',
    subServices: [
      {
        name: 'Company Profile',
        description: 'Professional company profile document or deck. Clear, well-designed, and ready to share with clients, investors, or partners.',
      },
      {
        name: 'Financial Reporting',
        description: 'Live dashboards, automated financial statements. Always know your numbers — no more manual spreadsheets.',
      },
      {
        name: 'CRM & Lead Management',
        description: 'Track every lead, automate follow-ups, never lose a prospect again. See your entire sales pipeline at a glance.',
      },
      {
        name: 'Payroll & HR Attendance',
        description: 'Employee management, attendance tracking, automated payroll calculations. Your HR in one click.',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I\u2019m interested in Business Operation services. What modules do you recommend?',
    slug: 'business-operation',
    showOnHome: true,
  },
  {
    icon: OthersIcon,
    illustration: '/images/services/online-invitation-1.jpeg',
    illustrations: ['/images/services/online-invitation-1.jpeg', '/images/services/online-invitation-2.jpeg'],
    device: 'phone',
    title: 'Others & Custom Solutions',
    tagline: 'If you can describe the problem, we can build the solution.',
    description:
      'Beyond our core categories — data analysis, digital invitations, presentation decks, and more. Have something else in mind? We\u2019re open to custom projects. If it\u2019s a problem, we\u2019ll solve it.',
    subServices: [
      {
        name: 'Data Analysis / Data Science',
        description: 'Turn your data into insights. From exploratory analysis to predictive models, dashboards, and automated reporting pipelines.',
      },
      {
        name: 'Online Invitation',
        description: 'Digital invitations for weddings, events, or corporate gatherings. Beautifully designed, interactive, and shareable via link.',
        image: '/images/services/online-invitation-1.jpeg',
      },
      {
        name: 'Slide / PowerPoint Creation',
        description: 'Professional presentation decks for pitches, reports, or internal use. Clear storytelling, clean design, data visualization.',
      },
      {
        name: 'Custom Project',
        description: 'Have a unique challenge? Describe it, and we\u2019ll scope a solution. AI chatbots, e-commerce integrations, custom workflows, API integrations — you name it.',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I have a project idea I\u2019d like to discuss. Are you available?',
    slug: 'others',
    showOnHome: true,
  },
  {
    icon: PackagesIcon,
    illustration: '/images/services/website-2.png',
    device: 'browser',
    title: 'Packages',
    tagline: 'Bundled services at a better price.',
    description:
      'Pick the combo that fits your business. Our packages bundle complementary services together so you get more value — and one less thing to think about.',
    subServices: [
      {
        name: 'Full Business Suite',
        description: 'CRM, financial reporting, payroll & HR — the complete digital backbone for your business in one unified platform.',
      },
      {
        name: 'Social Media Content & SEO Blog Writing',
        description: 'Consistent content across social media and your blog. One cohesive strategy, fully managed.',
      },
      {
        name: 'Website + SEO Blog Writing',
        description: 'A new website plus ongoing blog content to drive organic traffic from day one.',
      },
      {
        name: 'SEO Optimization & SEO Blog Writing',
        description: 'Optimize your site for search engines and fuel it with fresh, keyword-targeted content every month.',
      },
    ],
    ctaLabel: 'Let\u2019s Talk',
    whatsappMessage: 'Hi Polaris! I\u2019m interested in your service packages. Which one do you recommend for my business?',
    slug: 'packages',
  },
]
