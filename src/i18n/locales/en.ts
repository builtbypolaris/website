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
    studios: 'Studios',
    insights: 'Insights',
    contact: 'Contact',
    cta: 'Contact Us',
    mobileCta: 'Free Health Check',
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    tagline: 'Diagnostic-first consultancy helping Indonesian businesses identify bottlenecks, improve operations, and grow through technology.',
    navigate: 'Navigate',
    getInTouch: 'Get in Touch',
    location: 'Jakarta · Yogyakarta · Bali',
    language: 'Language',
    copyright: '© 2026 Polaris · Jakarta · Yogyakarta · Bali',
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
    badge: 'Diagnostic-First Agency',
    titleLine1: 'We ',
    titleLine1Em: 'diagnose',
    titleLine2: 'before we',
    titleLine2Em: 'build.',
    titleLine3: '',
    subtitle:
      "Most businesses don’t need more tools. They need clarity. We identify what’s slowing growth, wasting time, or leaking revenue, then build only what’s necessary to fix it.",
    ctaPrimary: 'Get a Free Health Check',
    ctaSecondary: 'See our work',
    laptopLabel: 'F&B Website',
    laptopSubLabel: 'Website Development',
    phoneLabel: 'Digital Invitation',
    phoneSubLabel: 'Online Invitation',
  },

  // ── Trust bar ──────────────────────────────────────────────────────────
  trustBar: {
    label: 'We help businesses grow',
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
        tab: 'SEO',
        title: 'SEO',
        tagline: "Your site's visibility in search, powered by AI and guided by strategy.",
      },
      {
        tab: 'Social Media',
        title: 'Social Media',
        tagline: "Your brand's social presence, fully managed. From strategy to ready-to-post content.",
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

  // ── Services bento (home) ─────────────────────────────────────────────
  servicesBento: {
    titleLine1: 'Every solution.',
    titleLine2: 'One partner.',
    seeMore: 'Explore',
    seeAll: 'All services',
    tabLabels: ['Website Dev', 'SEO & Ranking', 'Content Creation'],
    headlines: [
      { line1: 'Your site,', line2: 'built right.' },
      { line1: 'Rank higher,', line2: 'grow faster.' },
      { line1: 'Content that', line2: 'converts.' },
    ],
  },

  // ── Metrics bar (home) ────────────────────────────────────────────────
  metricsBar: {
    stats: [
      { number: '120+', label: 'Projects delivered' },
      { number: '3×', label: 'Average revenue lift' },
      { number: '6', label: 'Cities active' },
      { number: '98%', label: 'Client retention' },
    ],
  },

  // ── Featured work (home) ───────────────────────────────────────────────
  featuredWork: {
    sectionLabel: 'Selected Work',
    titleLine1: 'Proof,',
    titleLine2: 'not promises.',
    subtitle: 'Real engagements. Real numbers.',
    projects: [
      {
        tag: 'F&B · Jakarta',
        duration: '6-month engagement',
        name: 'Restaurant Chain Expansion',
        outcomes: ['+340% organic traffic', '3× revenue growth', 'Operations fully systematized'],
      },
      {
        tag: 'Fashion · Bali',
        duration: '4-month engagement',
        name: 'Local Brand Going Digital',
        outcomes: ['+280% Instagram reach', '5× online sales growth', 'Full content pipeline built'],
      },
    ],
    cta: 'Start your project',
  },

  // ── Service features (home alternating rows) ───────────────────────────
  serviceFeatures: {
    features: [
      {
        label: 'Website Development',
        headLine1: 'Turn visitors',
        headLine2: 'into customers.',
        description: 'Every page is designed around a purpose: helping the right people understand your business and take action.',
      },
      {
        label: 'Operation System',
        headLine1: 'Systems that remove',
        headLine2: 'operational friction.',
        description: 'Manual processes slow businesses down. We build CRM systems, internal dashboards, automation workflows, and business tools that reduce repetitive work and improve visibility.',
      },
      {
        label: 'Social Media & Content',
        headLine1: 'Consistent content.',
        headLine2: 'Clear positioning.',
        description: 'We help businesses communicate clearly through strategy, design, and content that reinforces their brand and keeps them visible.',
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
          "They told us our original plan wouldn't work, and then showed us what would. That honesty saved us months.",
        attribution: 'Operations Director, Bali hospitality group',
      },
      {
        value: 'Precision',
        valueDescription:
          'Every solution is built to fit exactly what you need, not a template, not a guess. Exactly right.',
        metric: '0',
        metricLabel: 'cookie-cutter templates used',
        quote:
          "The system they built fits our workflow like it was designed from the inside. Because it was. They understood our process before writing a single line.",
        attribution: 'CEO, Yogyakarta manufacturing firm',
      },
      {
        value: 'Growth',
        valueDescription:
          "We're not here to just fix today's problem. We're here to make sure you're genuinely better for it.",
        metric: '↑ 40%',
        metricLabel: 'average efficiency gain after 6 months',
        quote:
          "Six months later, we're still using everything they set up, and it's actually growing with us. That never happens with consultants.",
        attribution: 'Managing Partner, Jakarta professional services',
      },
    ],
  },

  // ── CTA section ────────────────────────────────────────────────────────
  cta: {
    titleLine1: 'Direction before',
    titleLine2: 'execution.',
    description:
      'Our Business Health Check delivers a practical assessment of your business, operations, and digital presence, so you know exactly what to fix before investing time or money.',
    badgeFree: 'FREE',
    primary: 'Get Your Free Health Check',
    whatsappMessage: "Hi Polaris! I'd like to discuss a project. Are you available?",
    emailLabel: 'Or email us at',
  },

  // ── Services page ──────────────────────────────────────────────────────
  services: {
    page: {
      eyebrow: 'Services',
      titleLine1: 'Discover how we',
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
          'We design, develop, and deploy websites on modern infrastructure. Fast, secure, and scalable. Every site comes with analytics baked in.',
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
          'From concept to deployment. Native or cross-platform mobile apps for iOS and Android, from simple utility apps to full-featured business tools.',
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
        title: 'SEO',
        tagline: "Your site's visibility in search, powered by AI and guided by strategy.",
        description:
          "We optimize and create content that drives organic traffic and builds domain authority. From technical SEO to AI-powered blog writing, every keyword targeted, every page optimized.",
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in SEO services. Let's talk!",
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
        ],
      },
      {
        slug: 'content-creation',
        title: 'Social Media',
        tagline: "Your brand's social presence, fully managed.",
        description:
          "We create, design, and schedule content that builds trust and keeps your audience engaged. From brand identity to ready-to-post reels, one cohesive strategy across every platform.",
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in Social Media services. Let's talk!",
        subServices: [
          {
            name: 'Social Media Branding',
            description:
              'Brand identity for your social presence. Visual templates, tone of voice guidelines, bio optimization, and cohesive profile design across platforms.',
          },
          {
            name: 'Social Media Content Creation',
            description:
              'Ready-to-post content for Instagram, LinkedIn, TikTok, and more. Captions, images, reels, and hashtag strategy, fully managed.',
          },
        ],
      },
      {
        slug: 'business-operation',
        title: 'Business Operation',
        tagline: 'Your back-office, digitized.',
        description:
          'Custom internal systems so you can run your business from one place. From company profiles to full HR automation, we build the digital backbone your business needs.',
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
              'Live dashboards, automated financial statements. Always know your numbers. No more manual spreadsheets.',
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
          "Beyond our core categories: data analysis, digital invitations, presentation decks, and more. Have something else in mind? We're open to custom projects. If it's a problem, we'll solve it.",
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
              "Have a unique challenge? Describe it, and we'll scope a solution. AI chatbots, e-commerce integrations, custom workflows, API integrations. You name it.",
          },
        ],
      },
      {
        slug: 'packages',
        title: 'Packages',
        tagline: 'Bundled services at a better price.',
        description:
          'Pick the combo that fits your business. Our packages bundle complementary services together so you get more value and one less thing to think about.',
        ctaLabel: "Let's Talk",
        whatsappMessage:
          "Hi Polaris! I'm interested in your service packages. Which one do you recommend for my business?",
        subServices: [
          {
            name: 'Full Business Suite',
            description:
              'CRM, financial reporting, payroll & HR: the complete digital backbone for your business in one unified platform.',
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
    titleLine1: 'Think before',
    titleLine2: 'you build.',
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

  // ── Studios / Novo landing page ────────────────────────────────────────
  studios: {
    hero: {
      titleLine1: 'Raise your',
      titleLine2Em: 'digital pets.',
      titleLine3: 'Get things done.',
      subtitle: '{trackers} productivity trackers. {games} mini-games. Creatures that evolve as you actually build better habits.',
      ctaDashboard: 'Open Dashboard',
      ctaGet: 'Get your toolkit',
      ctaSignIn: 'Sign in ↗',
    },
    evo: {
      stageLabel: 'Stage',
      stagesCaption: '{stages} evolution stages · {trackers} trackers',
      evolving: 'evolving into',
    },
    templates: {
      titleLine1: '{count} trackers.',
      titleLine2Em: 'Infinite',
      titleLine3: 'growth.',
      priceEach: 'each',
      oneTimePurchase: 'one-time purchase',
      seeMore: 'See more ↗',
      trackers: {
        financial: {
          headline1: 'Log money.',
          headline2: 'Grow richer.',
          desc: 'Track spending & income. Your money pet evolves as you hit goals.',
        },
        todo: {
          headline1: 'Tasks that',
          headline2: 'actually ship.',
          desc: 'Priorities, due dates, and completion streaks. Your task pet levels up with every done.',
        },
        habit: {
          headline1: 'Streaks that',
          headline2: 'stick.',
          desc: 'Daily and weekly habits with heatmaps. Consistency evolves your creature.',
        },
        savings: {
          headline1: 'Save up.',
          headline2: 'Pay it off.',
          desc: 'Savings goals and installment schedules in one place. Your treasure pet grows with every deposit.',
        },
        study: {
          headline1: 'Study smart.',
          headline2: 'Ace exams.',
          desc: 'Exam countdowns, a built-in study timer, and per-subject stats. Your scholar pet levels up as you learn.',
        },
        mood: {
          headline1: 'Feel it.',
          headline2: 'Track it.',
          desc: 'Quick mood check-ins with tags, a calendar heatmap, and trends. Your sky pet brightens with you.',
        },
        freelance: {
          headline1: 'Work for yourself.',
          headline2: 'Get paid right.',
          desc: 'Clients, projects, deadlines and earnings in one hub. Your hustle pet grows with every gig.',
        },
        health: {
          headline1: 'Eat well.',
          headline2: 'Feel better.',
          desc: 'Meals, calories, water and weight in one gentle daily loop. Your vitality pet thrives as you do.',
        },
        cycle: {
          headline1: 'Know your rhythm.',
          headline2: 'Own your month.',
          desc: 'Periods, symptoms and gentle predictions on a private calendar. Your bloom pet grows with your rhythm.',
        },
        travel: {
          headline1: 'Plan the trip.',
          headline2: 'Keep the budget.',
          desc: 'Itineraries and travel budgets side by side. Your voyager pet earns its wings with every trip.',
        },
        baby: {
          headline1: 'Every feed.',
          headline2: 'Every first.',
          desc: 'Feeds, sleep, diapers, growth and milestones, logged in two taps. Your nursery pet grows alongside.',
        },
        pet: {
          headline1: 'Happy pets.',
          headline2: 'Zero guesswork.',
          desc: 'Daily care logs, vet reminders and weight tracking per pet. Your companion pet joins the pack.',
        },
      },
    },
    modal: {
      preview: 'Preview',
      getIt: 'Get it',
    },
    impact: {
      titleLine1: 'You track.',
      titleLine2Em: 'We give back.',
      subtitle: 'Raise a pet through its full 10-stage cycle and it earns a crown 👑. Pick your cause, and Polaris turns every crown into real impact: a plant in the ground or help for someone who needs it, fulfilled monthly.',
      envTitle: 'Team Environment',
      envLine: '1 crown = 1 plant planted',
      envStat: 'plants planted so far',
      socialTitle: 'Team Social',
      socialLine: '1 crown = 1 person receives help',
      socialStat: 'people helped so far',
      how1: '🐣 Raise your pet through 10 stages',
      how2: '👑 Each full cycle earns a crown',
      how3: '🌍 We make it real',
    },
    cta: {
      title: 'Ready to level up?',
      subtitle: 'Login and start tracking. Your pets are already waiting.',
      ctaDashboard: 'Go to Dashboard',
      ctaStart: 'Get Started',
    },
  },

  // ── Per-page meta tags ─────────────────────────────────────────────────
  meta: {
    home: {
      title: 'Polaris | Your Business Compass',
      description:
        "Polaris is Indonesia's diagnostic-first business & IT consultancy. We find the real problem before building the solution. Web, AI, data, automation. One trusted partner.",
    },
    services: {
      title: 'Services | Polaris',
      description:
        'Websites, apps, SEO, business automation, and more. One trusted partner for every digital solution your business needs.',
    },
    studios: {
      title: 'Novo | built by Polaris Studio',
      description:
        'Novo is a productivity app with digital pets that evolve as you track finances, tasks, and habits. Built by Polaris Studio.',
    },
    insights: {
      title: 'Insights | Polaris',
      description:
        'Tips, guides, and honest thinking on strategy, technology, and building a digital presence that actually works.',
    },
    contact: {
      title: 'Contact | Polaris',
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
