/**
 * English (en) translation strings.
 *
 * This is the source-of-truth shape for all translations. Other locale files
 * (like `id.ts`) must mirror this structure exactly — TypeScript will enforce
 * this via the `EnTranslations` type in those files.
 *
 * Sections:
 *   - `nav.*`           — Navbar
 *   - `footer.*`        — Footer
 *   - `switcher.*`      — Language switcher dropdown
 *   - `hero.*`          — Hero section on home
 *   - `trustBar.*`      — Trust bar tags + label
 *   - `servicesGrid.*`  — Home page services showcase
 *   - `problemSection.*`— Why-Polaris problem section + problem cards
 *   - `howItWorks.*`    — Three-step how-it-works section + timeline cards
 *   - `whyPolaris.*`    — Why Polaris differentiators
 *   - `valuesGrid.*`    — Values grid header + value cards
 *   - `aboutSection.*`  — About stats section
 *   - `cta.*`           — Free Health Check CTA section
 *   - `services.*`      — Services page (header + 6 categories with sub-services)
 *   - `aboutPage.*`     — About page header
 *   - `insights.*`      — Insights listing page
 *   - `blogPost.*`      — Individual blog post UI
 *   - `meta.*`          — Per-page meta titles + descriptions
 *   - `common.*`        — Shared button labels and small phrases
 */
export const en = {
  // ── Navigation ─────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    services: 'Services',
    about: 'About',
    insights: 'Insights',
    contact: 'Contact',
    cta: 'See what your business needs',
    mobileCta: 'Free Health Check',
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    tagline: 'Diagnostic-first business & IT consultancy for growing Indonesian businesses.',
    navigate: 'Navigate',
    getInTouch: 'Get in Touch',
    location: 'Jakarta · Yogyakarta · Bali',
    language: 'Language',
    copyright: '© 2026 PT Aurora Polaris Digital · Jakarta · Yogyakarta · Bali',
  },

  // ── Language switcher ──────────────────────────────────────────────────
  switcher: {
    label: 'Language',
    english: 'English',
    indonesian: 'Bahasa Indonesia',
  },

  // ── Common labels (used across multiple components) ────────────────────
  common: {
    contactUsNow: 'Contact Us Now',
  },

  // ── Hero (home) ────────────────────────────────────────────────────────
  hero: {
    badge: 'Diagnostic-First Consultancy',
    titleLine1: 'Your Business,',
    titleLine2: 'Finally Pointed',
    titleLine3: 'True North.',
    subtitle:
      "We're not another tech agency selling packages. We diagnose what's really holding your business back and build exactly what fixes it.",
    ctaPrimary: 'Get Your Free Health Check',
    ctaSecondary: 'See How It Works',
    laptopLabel: 'F&B Website',
    laptopSubLabel: 'Website Development',
    phoneLabel: 'Digital Invitation',
    phoneSubLabel: 'Online Invitation',
  },

  // ── Trust bar ──────────────────────────────────────────────────────────
  trustBar: {
    label: 'Trusted across',
    seeAllServices: 'See all services',
    tags: ['E-Commerce', 'F&B', 'Healthcare', 'Education', 'Professional Services'],
  },

  // ── Services grid (home) ───────────────────────────────────────────────
  servicesGrid: {
    sectionLabel: 'What We Build',
    titleLine1: 'One partner.',
    titleLine2: 'Every solution.',
    explore: 'Explore',
    seeAllServices: 'See all services',
    whatsappMessage:
      "Hi Polaris! I'm interested in learning more about your services. Can we chat?",
    showcases: [
      {
        tab: 'Website',
        title: 'Website Development',
        tagline: 'Your digital storefront, built right. Fast, secure, and scalable.',
      },
      {
        tab: 'SEO & Content',
        title: 'SEO & Content Creation',
        tagline: "Your brand's visibility, powered by AI and guided by strategy.",
      },
      {
        tab: 'Business Operation',
        title: 'Business Operation',
        tagline: 'Your back-office, digitized. Run your business from one place.',
      },
      {
        tab: 'Invitation',
        title: 'Others & Custom Solutions',
        tagline: 'If you can describe the problem, we can build the solution.',
      },
    ],
  },

  // ── Problem section ────────────────────────────────────────────────────
  problemSection: {
    sectionLabel: 'Why Polaris',
    titleLine1: "Most businesses don't have a technology problem.",
    titleLine2: 'They have a clarity problem.',
    subtitle:
      'They jump to solutions before defining the question. We start with diagnosis, not a sales pitch.',
    problems: [
      {
        title: '"We hired a developer but nothing changed"',
        description:
          "Built something, but it didn't solve the actual problem. The technology worked, it just wasn't the right technology for the real issue.",
      },
      {
        title: '"We have too many tools and none of them work together"',
        description:
          'Fragmented systems creating more work, not less. Every new tool adds complexity instead of removing it.',
      },
      {
        title: "\"We don't know what we actually need\"",
        description:
          'So many options, no clear direction. Everyone has a different opinion and nobody can agree on the right move.',
      },
    ],
  },

  // ── How it works (timeline) ────────────────────────────────────────────
  howItWorks: {
    sectionLabel: 'How It Works',
    titleLine1: 'Three steps from confusion',
    titleLine2: 'to clarity.',
    steps: [
      {
        title: 'Business Health Check',
        description:
          "A free 3-day diagnostic. We ask the right questions, analyze your business with AI tools, and deliver a clear written report showing exactly what's holding you back and what to do first.",
        tag: 'FREE',
      },
      {
        title: 'Prioritized Roadmap',
        description:
          "Your report includes a 90-day action plan. We present multiple options, including ones that don't involve hiring us, because the right solution matters more than the sale.",
        tag: 'Included in report',
      },
      {
        title: 'Build & Grow Together',
        description:
          'If you choose to work with us, we implement. Websites, content engines, full business automation, whatever your roadmap calls for. We act as your long-term technology partner.',
        tag: 'Ongoing partnership',
      },
    ],
  },

  // ── Why Polaris (differentiators) ──────────────────────────────────────
  whyPolaris: {
    sectionLabel: 'Why Polaris',
    titleLine1: 'What makes us',
    titleLine2: 'different.',
    differentiators: [
      {
        title: 'Diagnostic-first',
        description:
          'We start by listening, diagnose the real problem, then build what actually fixes it.',
      },
      {
        title: 'One Relationship',
        description: 'You never re-explain your business to a new person. One team, one partner.',
      },
      {
        title: 'Ongoing Partnership',
        description:
          'We grow with you, not just deliver and disappear. Long-term technology partner.',
      },
      {
        title: 'Outcome-driven',
        description: 'We care about your outcome, not just the invoice. Results over revenue.',
      },
      {
        title: 'AI-powered efficiency',
        description:
          'We leverage cutting-edge AI to deliver faster, better, and at a fraction of traditional costs.',
      },
    ],
  },

  // ── Values grid ────────────────────────────────────────────────────────
  valuesGrid: {
    sectionLabel: 'Our Values',
    titleLine1: 'What we',
    titleLine2: 'stand for.',
    subtitle: 'Four principles that guide every decision we make.',
    values: [
      {
        word: 'Clarity',
        description:
          "We give you direction when everything feels unclear. You always know where you're headed and why.",
      },
      {
        word: 'Integrity',
        description:
          "We tell you the truth, even when it's hard. No sugarcoating, no hidden agendas, no jargon.",
      },
      {
        word: 'Precision',
        description:
          'Every solution is built to fit exactly what you need, not a template, not a guess. Exactly right.',
      },
      {
        word: 'Growth',
        description:
          "We're not here to just fix today's problem. We're here to make sure you're genuinely better for it.",
      },
    ],
  },

  // ── About stats section ────────────────────────────────────────────────
  aboutSection: {
    sectionLabel: 'About Polaris',
    titleLine1: "Indonesia's diagnostic-first",
    titleLine2: 'technology consultancy.',
    stats: [
      {
        title: 'Diagnostic-first',
        description:
          'We start by listening, diagnose the real problem, then build what actually fixes it.',
      },
      {
        title: 'One Relationship',
        description: 'You never re-explain your business to a new person.',
      },
      {
        title: 'Ongoing Partnership',
        description: 'We grow with you, not just deliver and disappear.',
      },
      {
        title: 'All-female team',
        description: 'Indonesia-based, genuinely invested in your growth.',
      },
      {
        title: 'Outcome-driven',
        description: 'We care about your outcome, not just the invoice.',
      },
      {
        title: 'AI-powered efficiency',
        description: 'We leverage cutting-edge AI to deliver faster and better.',
      },
    ],
  },

  // ── Work showcase (About page) ──────────────────────────────────────
  workShowcase: {
    sectionLabel: 'Our Work',
    titleLine1: "What we've",
    titleLine2: 'delivered.',
    subtitle: "Real projects, real outcomes. Here's a look at what we've built for our clients.",
    projects: [
      {
        service: 'Website Development',
        title: 'Stevia Cookies',
      },
      {
        service: 'Website Development',
        title: 'Mulia Plastik',
      },
      {
        service: 'Website Development',
        title: 'Posyandu',
      },
      {
        service: 'Website Development',
        title: 'ADHD Productivity',
      },
      {
        service: 'Application Development',
        title: 'Order Management App',
      },
      {
        service: 'Business Operation',
        title: 'CRM & Sales Dashboard',
      },
      {
        service: 'SEO & Content',
        title: 'Search Console Growth',
      },
      {
        service: 'Custom Solution',
        title: 'Javanese Emotion',
      },
      {
        service: 'Custom Solution',
        title: 'Mak Gien Invitation',
      },
    ],
  },

  // ── Results showcase (About page) — DEPRECATED ────────────────────────
  resultsShowcase: {
    sectionLabel: 'Results & Values',
    titleLine1: 'What our work',
    titleLine2: 'actually delivers.',
    subtitle:
      'Four principles. Real outcomes. Every project starts with a value and ends with proof.',
    items: [
      {
        value: 'Clarity',
        valueDescription:
          "We give you direction when everything feels unclear. You always know where you're headed and why.",
        metric: '3 days',
        metricLabel: 'from kickoff to written diagnosis',
        quote:
          'Within the first week, we finally understood what was actually slowing us down. No one had ever mapped it out like that before.',
        attribution: 'Founder, Jakarta e-commerce startup',
      },
      {
        value: 'Integrity',
        valueDescription:
          "We tell you the truth, even when it's hard. No sugarcoating, no hidden agendas, no jargon.",
        metric: '100%',
        metricLabel: 'transparent reporting, no hidden fees',
        quote:
          "They told us our original plan wouldn't work — and then showed us what would. That honesty saved us months.",
        attribution: 'Operations Director, Bali hospitality group',
      },
      {
        value: 'Precision',
        valueDescription:
          'Every solution is built to fit exactly what you need, not a template, not a guess. Exactly right.',
        metric: '0',
        metricLabel: 'cookie-cutter templates used',
        quote:
          "The system they built fits our workflow like it was designed from the inside. Because it was — they understood our process before writing a single line.",
        attribution: 'CEO, Yogyakarta manufacturing firm',
      },
      {
        value: 'Growth',
        valueDescription:
          "We're not here to just fix today's problem. We're here to make sure you're genuinely better for it.",
        metric: '↑ 40%',
        metricLabel: 'average efficiency gain after 6 months',
        quote:
          "Six months later, we're still using everything they set up — and it's actually growing with us. That never happens with consultants.",
        attribution: 'Managing Partner, Jakarta professional services',
      },
    ],
  },

  // ── CTA section ────────────────────────────────────────────────────────
  cta: {
    titleLine1: 'Ready to find your',
    titleLine2: 'true north?',
    description:
      'Start with a Business Health Check. 3 days. A clear written report. And finally, direction.',
    badgeFree: 'FREE',
    primary: 'Get Your Free Health Check',
    whatsappMessage: "Hi Polaris! I'd like to discuss a project. Are you available?",
    emailLabel: 'Or email us at',
  },

  // ── Services page ──────────────────────────────────────────────────────
  services: {
    page: {
      eyebrow: 'Services',
      titleLine1: 'Discover how we can',
      titleLine2: 'grow your business.',
      subtitle:
        'From diagnosis to deployment. One trusted partner for every solution your business needs.',
      whatsIncluded: "What's included",
    },
    categories: [
      {
        slug: 'website-development',
        title: 'Website Development',
        tagline: 'Your digital storefront, built right.',
        description:
          'We design, develop, and deploy websites on modern infrastructure — fast, secure, and scalable. Every site comes with analytics baked in.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in Website Development. Can we discuss my project?",
        subServices: [
          {
            name: 'Website Only',
            description:
              'Development and deployment, hosted on Vercel. You bring your own domain or go without.',
          },
          {
            name: 'Website + Domain',
            description:
              'We handle everything including domain registration. Available TLDs: .com, .co.id, .id, .sch.id, .ai, .io, .dev, and more.',
          },
        ],
      },
      {
        slug: 'application-development',
        title: 'Application Development',
        tagline: 'Custom applications built for your specific needs.',
        description:
          'From concept to deployment — native or cross-platform mobile apps for iOS and Android. From simple utility apps to full-featured business tools.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in Application Development. Can we discuss my project?",
        subServices: [
          {
            name: 'Mobile Application',
            description:
              'Native or cross-platform mobile apps for iOS and Android, tailored to your business requirements.',
          },
        ],
      },
      {
        slug: 'seo-content-creation',
        title: 'SEO & Content Creation',
        tagline: "Your brand's visibility, powered by AI and guided by strategy.",
        description:
          'We optimize, create, and manage content that drives traffic and builds trust. From search engine optimization to social media — one cohesive strategy, fully managed.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in SEO & Content Creation services. Let's talk!",
        subServices: [
          {
            name: 'SEO Optimization',
            description:
              'Technical and on-page SEO to improve your search rankings. Keyword research, site speed, meta tags, structured data, and ongoing optimization.',
          },
          {
            name: 'SEO Blog Writing',
            description:
              'SEO-optimized articles researched and published to your site. Each with custom imagery and keyword targeting to drive organic traffic.',
          },
          {
            name: 'SEO Audit',
            description:
              "Comprehensive analysis of your site's SEO health. Technical issues, content gaps, competitor benchmarking, and a prioritized action plan.",
          },
          {
            name: 'Social Media Branding',
            description:
              'Brand identity for your social presence. Visual templates, tone of voice guidelines, bio optimization, and cohesive profile design across platforms.',
          },
          {
            name: 'Social Media Content Creation',
            description:
              'Ready-to-post content for Instagram, LinkedIn, TikTok, and more. Captions, images, reels, and hashtag strategy — fully managed.',
          },
        ],
      },
      {
        slug: 'business-operation',
        title: 'Business Operation',
        tagline: 'Your back-office, digitized.',
        description:
          'Custom internal systems so you can run your business from one place. From company profiles to full HR automation — we build the digital backbone your business needs.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in Business Operation services. What modules do you recommend?",
        subServices: [
          {
            name: 'Company Profile',
            description:
              'Professional company profile document or deck. Clear, well-designed, and ready to share with clients, investors, or partners.',
          },
          {
            name: 'Financial Reporting',
            description:
              'Live dashboards, automated financial statements. Always know your numbers — no more manual spreadsheets.',
          },
          {
            name: 'CRM & Lead Management',
            description:
              'Track every lead, automate follow-ups, never lose a prospect again. See your entire sales pipeline at a glance.',
          },
          {
            name: 'Payroll & HR Attendance',
            description:
              'Employee management, attendance tracking, automated payroll calculations. Your HR in one click.',
          },
        ],
      },
      {
        slug: 'others',
        title: 'Others & Custom Solutions',
        tagline: 'If you can describe the problem, we can build the solution.',
        description:
          "Beyond our core categories — data analysis, digital invitations, presentation decks, and more. Have something else in mind? We're open to custom projects. If it's a problem, we'll solve it.",
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I have a project idea I'd like to discuss. Are you available?",
        subServices: [
          {
            name: 'Data Analysis / Data Science',
            description:
              'Turn your data into insights. From exploratory analysis to predictive models, dashboards, and automated reporting pipelines.',
          },
          {
            name: 'Online Invitation',
            description:
              'Digital invitations for weddings, events, or corporate gatherings. Beautifully designed, interactive, and shareable via link.',
          },
          {
            name: 'Slide / PowerPoint Creation',
            description:
              'Professional presentation decks for pitches, reports, or internal use. Clear storytelling, clean design, data visualization.',
          },
          {
            name: 'Custom Project',
            description:
              "Have a unique challenge? Describe it, and we'll scope a solution. AI chatbots, e-commerce integrations, custom workflows, API integrations — you name it.",
          },
        ],
      },
      {
        slug: 'packages',
        title: 'Packages',
        tagline: 'Bundled services at a better price.',
        description:
          'Pick the combo that fits your business. Our packages bundle complementary services together so you get more value — and one less thing to think about.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in your service packages. Which one do you recommend for my business?",
        subServices: [
          {
            name: 'Full Business Suite',
            description:
              'CRM, financial reporting, payroll & HR — the complete digital backbone for your business in one unified platform.',
          },
          {
            name: 'Social Media Content & SEO Blog Writing',
            description:
              'Consistent content across social media and your blog. One cohesive strategy, fully managed.',
          },
          {
            name: 'Website + SEO Blog Writing',
            description:
              'A new website plus ongoing blog content to drive organic traffic from day one.',
          },
          {
            name: 'SEO Optimization & SEO Blog Writing',
            description:
              'Optimize your site for search engines and fuel it with fresh, keyword-targeted content every month.',
          },
        ],
      },
    ],
  },

  // ── About page ─────────────────────────────────────────────────────────
  aboutPage: {
    eyebrow: 'About Us',
    titleLine1: 'Built to bring',
    titleLine2: 'clarity, not complexity.',
    subtitle:
      "We're a diagnostic-first business & IT consultancy based in Jakarta, Yogyakarta, and Bali. We find the real problem before building anything.",
  },

  // ── Insights listing page ──────────────────────────────────────────────
  insights: {
    eyebrow: 'Blog',
    title: 'Insights',
    subtitle:
      'Tips, guides, and honest thinking on strategy, technology, and building a digital presence that actually works.',
    minRead: 'min read',
    read: 'Read →',
    emptyState: 'No posts in this category yet.',
    categories: {
      All: 'All',
      Websites: 'Websites',
      Apps: 'Apps',
      SEO: 'SEO',
      Content: 'Content',
      Automation: 'Automation',
      AI: 'AI',
      Strategy: 'Strategy',
    },
  },

  // ── Blog post page ─────────────────────────────────────────────────────
  blogPost: {
    backToInsights: '← Back to Insights',
    minRead: 'min read',
    onThisPage: 'On this page',
    relatedArticles: 'Related articles',
    allArticles: '← All articles',
  },

  // ── Per-page meta tags ─────────────────────────────────────────────────
  meta: {
    home: {
      title: 'Polaris — Your Business Compass | PT Aurora Polaris Digital',
      description:
        "Polaris is Indonesia's diagnostic-first business & IT consultancy. We find the real problem before building the solution. Web, AI, data, automation — one trusted partner.",
    },
    services: {
      title: 'Services — Polaris',
      description:
        'Websites, apps, SEO, business automation, and more. One trusted partner for every digital solution your business needs.',
    },
    about: {
      title: 'About — Polaris',
      description:
        "We're a diagnostic-first business & IT consultancy based in Jakarta, Yogyakarta, and Bali. We find the real problem before building anything.",
    },
    insights: {
      title: 'Insights — Polaris',
      description:
        'Tips, guides, and honest thinking on strategy, technology, and building a digital presence that actually works.',
    },
    contact: {
      title: 'Contact — Polaris',
      description:
        'Start with a free Business Health Check. 3 days, a clear written report, and finally direction.',
    },
  },
}

/**
 * The translation schema. Other locale files (e.g. `id.ts`) must satisfy this
 * type, which means they must have every key from `en` with `string` values.
 *
 * We deliberately do NOT use `as const` on `en` because that would narrow
 * every string to its literal type, which would prevent any other locale
 * from assigning a different string. The shape match is what matters here,
 * not the literal values.
 */
export type EnTranslations = typeof en
