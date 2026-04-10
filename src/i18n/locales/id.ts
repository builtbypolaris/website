/**
 * Indonesian (id) translation strings.
 *
 * MUST mirror the shape of `en.ts` exactly. TypeScript enforces this via
 * the `EnTranslations` type — adding a key to `en.ts` without adding the
 * equivalent here causes a compile error.
 *
 * Voice notes:
 * - Match the original tone: direct, professional, casual where appropriate.
 * - Keep brand-specific terms in English: "Polaris", "Business Health Check",
 *   "CRM", "SEO", "API", "AI", "WhatsApp", "Vercel", product names.
 * - Use formal "Anda" to address the reader (matches the professional tone).
 * - Don't translate quoted phrases inside problem cards literally — keep
 *   them natural in Indonesian.
 */
import type { EnTranslations } from './en'

export const id: EnTranslations = {
  // ── Navigation ─────────────────────────────────────────────────────────
  nav: {
    home: 'Beranda',
    services: 'Layanan',
    about: 'Tentang',
    insights: 'Insight',
    contact: 'Kontak',
    cta: 'Lihat apa yang bisnis Anda butuhkan',
    mobileCta: 'Health Check Gratis',
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    tagline:
      'Konsultan IT diagnostic-first untuk bisnis Indonesia yang sedang berkembang.',
    navigate: 'Navigasi',
    getInTouch: 'Hubungi Kami',
    location: 'Jakarta, Indonesia',
    language: 'Bahasa',
    copyright: '© 2026 PT Aurora Polaris Digital · Jakarta, Indonesia',
  },

  // ── Language switcher ──────────────────────────────────────────────────
  switcher: {
    label: 'Bahasa',
    english: 'English',
    indonesian: 'Bahasa Indonesia',
  },

  // ── Common labels (used across multiple components) ────────────────────
  common: {
    contactUsNow: 'Hubungi Kami Sekarang',
  },

  // ── Hero (home) ────────────────────────────────────────────────────────
  hero: {
    badge: 'Diagnostic-First Consultancy',
    titleLine1: 'Bisnis Anda,',
    titleLine2: 'Akhirnya Menemukan',
    titleLine3: 'Arah yang Tepat.',
    subtitle:
      'Kami bukan agensi tech yang menjual paket. Kami mendiagnosis apa yang sebenarnya menghambat bisnis Anda dan membangun solusi yang benar-benar memperbaikinya.',
    ctaPrimary: 'Dapatkan Health Check Gratis',
    ctaSecondary: 'Lihat Cara Kerjanya',
    laptopLabel: 'Website F&B',
    laptopSubLabel: 'Pengembangan Website',
    phoneLabel: 'Undangan Digital',
    phoneSubLabel: 'Online Invitation',
  },

  // ── Trust bar ──────────────────────────────────────────────────────────
  trustBar: {
    label: 'Dipercaya oleh',
    seeAllServices: 'Lihat semua layanan',
    tags: ['E-Commerce', 'F&B', 'Kesehatan', 'Pendidikan', 'Jasa Profesional'],
  },

  // ── Services grid (home) ───────────────────────────────────────────────
  servicesGrid: {
    sectionLabel: 'Yang Kami Bangun',
    titleLine1: 'Satu partner.',
    titleLine2: 'Setiap solusi.',
    explore: 'Lihat',
    seeAllServices: 'Lihat semua layanan',
    whatsappMessage:
      'Halo Polaris! Saya tertarik untuk mengetahui lebih lanjut tentang layanan Anda. Bisakah kita berdiskusi?',
    showcases: [
      {
        tab: 'Website',
        title: 'Pengembangan Website',
        tagline: 'Etalase digital Anda, dibangun dengan benar. Cepat, aman, dan scalable.',
      },
      {
        tab: 'SEO & Konten',
        title: 'SEO & Pembuatan Konten',
        tagline: 'Visibilitas brand Anda, didukung AI dan dipandu strategi.',
      },
      {
        tab: 'Operasi Bisnis',
        title: 'Operasi Bisnis',
        tagline: 'Back-office Anda, didigitalisasi. Jalankan bisnis dari satu tempat.',
      },
      {
        tab: 'Undangan',
        title: 'Lainnya & Solusi Custom',
        tagline: 'Jika Anda bisa menjelaskan masalahnya, kami bisa membangun solusinya.',
      },
    ],
  },

  // ── Problem section ────────────────────────────────────────────────────
  problemSection: {
    sectionLabel: 'Mengapa Polaris',
    titleLine1: 'Sebagian besar bisnis tidak memiliki masalah teknologi.',
    titleLine2: 'Mereka memiliki masalah kejelasan.',
    subtitle:
      'Mereka langsung mencari solusi sebelum mendefinisikan pertanyaannya. Kami mulai dengan diagnosis, bukan sales pitch.',
    problems: [
      {
        title: '"Kami sudah hire developer tapi tidak ada yang berubah"',
        description:
          'Sesuatu sudah dibangun, tapi tidak menyelesaikan masalah yang sebenarnya. Teknologinya jalan, hanya saja itu bukan teknologi yang tepat untuk masalah yang sesungguhnya.',
      },
      {
        title: '"Kami punya terlalu banyak tools dan tidak ada yang terhubung"',
        description:
          'Sistem yang terfragmentasi justru menciptakan lebih banyak pekerjaan, bukan lebih sedikit. Setiap tool baru malah menambah kompleksitas.',
      },
      {
        title: '"Kami tidak tahu apa yang sebenarnya kami butuhkan"',
        description:
          'Terlalu banyak pilihan, tidak ada arah yang jelas. Setiap orang punya pendapat berbeda dan tidak ada yang bisa sepakat tentang langkah yang tepat.',
      },
    ],
  },

  // ── How it works (timeline) ────────────────────────────────────────────
  howItWorks: {
    sectionLabel: 'Cara Kerjanya',
    titleLine1: 'Tiga langkah dari kebingungan',
    titleLine2: 'menuju kejelasan.',
    steps: [
      {
        title: 'Business Health Check',
        description:
          'Diagnosis gratis selama 3 hari. Kami mengajukan pertanyaan yang tepat, menganalisis bisnis Anda dengan AI tools, dan memberikan laporan tertulis yang jelas tentang apa yang menghambat Anda dan apa yang harus dilakukan terlebih dahulu.',
        tag: 'GRATIS',
      },
      {
        title: 'Roadmap Prioritas',
        description:
          'Laporan Anda berisi action plan 90 hari. Kami menyajikan beberapa opsi, termasuk yang tidak melibatkan kami, karena solusi yang tepat lebih penting daripada penjualan.',
        tag: 'Termasuk dalam laporan',
      },
      {
        title: 'Bangun & Tumbuh Bersama',
        description:
          'Jika Anda memilih bekerja dengan kami, kami yang implementasi. Website, content engine, otomasi bisnis, apapun yang dibutuhkan roadmap Anda. Kami bertindak sebagai partner teknologi jangka panjang Anda.',
        tag: 'Kemitraan berkelanjutan',
      },
    ],
  },

  // ── Why Polaris (differentiators) ──────────────────────────────────────
  whyPolaris: {
    sectionLabel: 'Mengapa Polaris',
    titleLine1: 'Apa yang membuat kami',
    titleLine2: 'berbeda.',
    differentiators: [
      {
        title: 'Diagnostic-first',
        description:
          'Kami mulai dengan mendengarkan, mendiagnosis masalah sesungguhnya, lalu membangun solusi yang benar-benar memperbaikinya.',
      },
      {
        title: 'Satu Hubungan',
        description:
          'Anda tidak perlu menjelaskan ulang bisnis Anda kepada orang baru. Satu tim, satu partner.',
      },
      {
        title: 'Kemitraan Berkelanjutan',
        description:
          'Kami tumbuh bersama Anda, tidak hanya deliver lalu menghilang. Partner teknologi jangka panjang.',
      },
      {
        title: 'Fokus pada Hasil',
        description:
          'Kami peduli dengan hasil Anda, bukan hanya invoice. Hasil di atas pendapatan.',
      },
      {
        title: 'Efisiensi yang Didukung AI',
        description:
          'Kami memanfaatkan AI terkini untuk menghadirkan solusi yang lebih cepat, lebih baik, dan dengan biaya jauh lebih hemat.',
      },
    ],
  },

  // ── Values grid ────────────────────────────────────────────────────────
  valuesGrid: {
    sectionLabel: 'Nilai Kami',
    titleLine1: 'Yang kami',
    titleLine2: 'perjuangkan.',
    subtitle: 'Empat prinsip yang memandu setiap keputusan kami.',
    values: [
      {
        word: 'Kejelasan',
        description:
          'Kami memberikan arah ketika semuanya terasa tidak jelas. Anda selalu tahu kemana tujuan Anda dan mengapa.',
      },
      {
        word: 'Integritas',
        description:
          'Kami mengatakan kebenaran, bahkan saat itu sulit. Tidak ada yang dimaniskan, tidak ada agenda tersembunyi, tidak ada jargon.',
      },
      {
        word: 'Presisi',
        description:
          'Setiap solusi dibangun untuk pas dengan kebutuhan Anda, bukan template, bukan tebakan. Tepat sasaran.',
      },
      {
        word: 'Pertumbuhan',
        description:
          'Kami tidak hanya di sini untuk memperbaiki masalah hari ini. Kami di sini untuk memastikan Anda benar-benar lebih baik karenanya.',
      },
    ],
  },

  // ── About stats section ────────────────────────────────────────────────
  aboutSection: {
    sectionLabel: 'Tentang Polaris',
    titleLine1: 'Konsultan teknologi diagnostic-first',
    titleLine2: 'pertama di Indonesia.',
    stats: [
      {
        title: 'Diagnostic-first',
        description:
          'Kami mulai dengan mendengarkan, mendiagnosis masalah sesungguhnya, lalu membangun solusi yang benar-benar memperbaikinya.',
      },
      {
        title: 'Satu Hubungan',
        description: 'Anda tidak perlu menjelaskan ulang bisnis Anda kepada orang baru.',
      },
      {
        title: 'Kemitraan Berkelanjutan',
        description: 'Kami tumbuh bersama Anda, tidak hanya deliver lalu menghilang.',
      },
      {
        title: 'Tim Perempuan',
        description:
          'Berbasis di Indonesia, benar-benar berkomitmen pada pertumbuhan Anda.',
      },
      {
        title: 'Fokus pada Hasil',
        description: 'Kami peduli dengan hasil Anda, bukan hanya invoice.',
      },
      {
        title: 'Efisiensi yang Didukung AI',
        description:
          'Kami memanfaatkan AI terkini untuk hasil yang lebih cepat dan lebih baik.',
      },
    ],
  },

  // ── CTA section ────────────────────────────────────────────────────────
  cta: {
    titleLine1: 'Siap menemukan',
    titleLine2: 'arah Anda?',
    description:
      'Mulai dengan Business Health Check. 3 hari. Laporan tertulis yang jelas. Dan akhirnya, arah.',
    badgeFree: 'GRATIS',
    primary: 'Dapatkan Health Check Gratis',
    whatsappMessage:
      'Halo Polaris! Saya ingin mendiskusikan sebuah project. Apakah Anda available?',
    emailLabel: 'Atau email kami di',
  },

  // ── Services page ──────────────────────────────────────────────────────
  services: {
    page: {
      eyebrow: 'Layanan',
      titleLine1: 'Cari tahu bagaimana kami bisa',
      titleLine2: 'menumbuhkan bisnis Anda.',
      subtitle:
        'Dari diagnosis hingga deployment. Satu partner terpercaya untuk setiap solusi yang dibutuhkan bisnis Anda.',
      whatsIncluded: 'Yang termasuk',
    },
    categories: [
      {
        slug: 'website-development',
        title: 'Pengembangan Website',
        tagline: 'Etalase digital Anda, dibangun dengan benar.',
        description:
          'Kami merancang, mengembangkan, dan men-deploy website di infrastruktur modern — cepat, aman, dan scalable. Setiap site sudah dilengkapi analytics dari awal.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan Pengembangan Website. Bisakah kita diskusikan project saya?',
        subServices: [
          {
            name: 'Website Saja',
            description:
              'Pengembangan dan deployment, di-host di Vercel. Anda bisa menggunakan domain sendiri atau tanpa domain.',
          },
          {
            name: 'Website + Domain',
            description:
              'Kami menangani semuanya termasuk pendaftaran domain. TLD yang tersedia: .com, .co.id, .id, .sch.id, .ai, .io, .dev, dan lainnya.',
          },
        ],
      },
      {
        slug: 'application-development',
        title: 'Pengembangan Aplikasi',
        tagline: 'Aplikasi custom yang dibangun untuk kebutuhan spesifik Anda.',
        description:
          'Dari konsep hingga deployment — aplikasi mobile native atau cross-platform untuk iOS dan Android. Dari aplikasi utility sederhana hingga business tool full-featured.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan Pengembangan Aplikasi. Bisakah kita diskusikan project saya?',
        subServices: [
          {
            name: 'Aplikasi Mobile',
            description:
              'Aplikasi mobile native atau cross-platform untuk iOS dan Android, disesuaikan dengan kebutuhan bisnis Anda.',
          },
        ],
      },
      {
        slug: 'seo-content-creation',
        title: 'SEO & Pembuatan Konten',
        tagline: 'Visibilitas brand Anda, didukung AI dan dipandu strategi.',
        description:
          'Kami mengoptimalkan, membuat, dan mengelola konten yang mendatangkan traffic dan membangun kepercayaan. Dari SEO hingga social media — satu strategi yang kohesif, fully managed.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan SEO & Pembuatan Konten. Mari bicara!',
        subServices: [
          {
            name: 'Optimasi SEO',
            description:
              'SEO teknis dan on-page untuk meningkatkan ranking pencarian Anda. Riset keyword, kecepatan situs, meta tags, structured data, dan optimasi berkelanjutan.',
          },
          {
            name: 'SEO Blog Writing',
            description:
              'Artikel SEO-optimized yang diriset dan dipublikasikan ke situs Anda. Setiap artikel dilengkapi gambar custom dan keyword targeting untuk mendatangkan traffic organik.',
          },
          {
            name: 'SEO Audit',
            description:
              'Analisis komprehensif tentang kesehatan SEO situs Anda. Masalah teknis, gap konten, benchmark kompetitor, dan action plan yang diprioritaskan.',
          },
          {
            name: 'Branding Social Media',
            description:
              'Identitas brand untuk presence social Anda. Template visual, panduan tone of voice, optimasi bio, dan desain profil yang kohesif di semua platform.',
          },
          {
            name: 'Pembuatan Konten Social Media',
            description:
              'Konten siap-posting untuk Instagram, LinkedIn, TikTok, dan lainnya. Caption, gambar, reels, dan strategi hashtag — fully managed.',
          },
        ],
      },
      {
        slug: 'business-operation',
        title: 'Operasi Bisnis',
        tagline: 'Back-office Anda, didigitalisasi.',
        description:
          'Sistem internal custom agar Anda bisa menjalankan bisnis dari satu tempat. Dari company profile hingga otomasi HR penuh — kami membangun digital backbone yang dibutuhkan bisnis Anda.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan Operasi Bisnis. Modul apa yang Anda rekomendasikan?',
        subServices: [
          {
            name: 'Company Profile',
            description:
              'Dokumen atau deck company profile profesional. Jelas, didesain dengan baik, dan siap dibagikan ke klien, investor, atau partner.',
          },
          {
            name: 'Pelaporan Keuangan',
            description:
              'Dashboard live, laporan keuangan otomatis. Selalu tahu angka Anda — tidak ada lagi spreadsheet manual.',
          },
          {
            name: 'CRM & Manajemen Lead',
            description:
              'Lacak setiap lead, otomatisasi follow-up, jangan pernah kehilangan prospek lagi. Lihat seluruh sales pipeline Anda dalam satu pandangan.',
          },
          {
            name: 'Payroll & Absensi HR',
            description:
              'Manajemen karyawan, pelacakan absensi, kalkulasi payroll otomatis. HR Anda dalam satu klik.',
          },
        ],
      },
      {
        slug: 'others',
        title: 'Lainnya & Solusi Custom',
        tagline: 'Jika Anda bisa menjelaskan masalahnya, kami bisa membangun solusinya.',
        description:
          'Di luar kategori utama kami — analisis data, undangan digital, deck presentasi, dan lainnya. Punya ide lain? Kami terbuka untuk project custom. Jika itu masalah, kami akan selesaikan.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya punya ide project yang ingin saya diskusikan. Apakah Anda available?',
        subServices: [
          {
            name: 'Analisis Data / Data Science',
            description:
              'Ubah data Anda menjadi insight. Dari analisis eksploratif hingga model prediktif, dashboard, dan pipeline pelaporan otomatis.',
          },
          {
            name: 'Undangan Online',
            description:
              'Undangan digital untuk pernikahan, event, atau acara korporat. Didesain dengan indah, interaktif, dan bisa dibagikan via link.',
          },
          {
            name: 'Pembuatan Slide / PowerPoint',
            description:
              'Deck presentasi profesional untuk pitch, laporan, atau penggunaan internal. Storytelling yang jelas, desain bersih, visualisasi data.',
          },
          {
            name: 'Project Custom',
            description:
              'Punya tantangan unik? Jelaskan, dan kami akan scope solusinya. AI chatbot, integrasi e-commerce, workflow custom, integrasi API — sebut saja.',
          },
        ],
      },
      {
        slug: 'packages',
        title: 'Paket',
        tagline: 'Layanan bundling dengan harga lebih baik.',
        description:
          'Pilih kombinasi yang sesuai dengan bisnis Anda. Paket kami menggabungkan layanan komplementer agar Anda mendapatkan lebih banyak nilai — dan satu hal lebih sedikit untuk dipikirkan.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan paket layanan Anda. Yang mana yang Anda rekomendasikan untuk bisnis saya?',
        subServices: [
          {
            name: 'Full Business Suite',
            description:
              'CRM, pelaporan keuangan, payroll & HR — digital backbone lengkap untuk bisnis Anda dalam satu platform terpadu.',
          },
          {
            name: 'Konten Social Media & SEO Blog Writing',
            description:
              'Konten yang konsisten di social media dan blog Anda. Satu strategi kohesif, fully managed.',
          },
          {
            name: 'Website + SEO Blog Writing',
            description:
              'Website baru plus konten blog berkelanjutan untuk mendatangkan traffic organik dari hari pertama.',
          },
          {
            name: 'Optimasi SEO & SEO Blog Writing',
            description:
              'Optimalkan situs Anda untuk search engine dan isi dengan konten segar yang ditargetkan kata kunci setiap bulan.',
          },
        ],
      },
    ],
  },

  // ── About page ─────────────────────────────────────────────────────────
  aboutPage: {
    eyebrow: 'Tentang Kami',
    titleLine1: 'Dibangun untuk membawa',
    titleLine2: 'kejelasan, bukan kompleksitas.',
    subtitle:
      'Kami adalah konsultan IT diagnostic-first yang berbasis di Jakarta. Kami menemukan masalah sesungguhnya sebelum membangun apapun.',
  },

  // ── Insights listing page ──────────────────────────────────────────────
  insights: {
    eyebrow: 'Blog',
    title: 'Insight',
    subtitle:
      'Tips, panduan, dan pemikiran jujur tentang strategi, teknologi, dan membangun digital presence yang benar-benar berhasil.',
    minRead: 'menit baca',
    read: 'Baca →',
    emptyState: 'Belum ada artikel di kategori ini.',
    categories: {
      All: 'Semua',
      Websites: 'Website',
      Apps: 'Aplikasi',
      SEO: 'SEO',
      Content: 'Konten',
      Automation: 'Otomasi',
      AI: 'AI',
      Strategy: 'Strategi',
    },
  },

  // ── Blog post page ─────────────────────────────────────────────────────
  blogPost: {
    backToInsights: '← Kembali ke Insight',
    minRead: 'menit baca',
    onThisPage: 'Di halaman ini',
    relatedArticles: 'Artikel terkait',
    allArticles: '← Semua artikel',
  },

  // ── Per-page meta tags ─────────────────────────────────────────────────
  meta: {
    home: {
      title: 'Polaris — Kompas Bisnis Anda | PT Aurora Polaris Digital',
      description:
        'Polaris adalah konsultan IT diagnostic-first pertama di Indonesia. Kami menemukan masalah sesungguhnya sebelum membangun solusinya. Web, AI, data, otomasi — satu partner terpercaya.',
    },
    services: {
      title: 'Layanan — Polaris',
      description:
        'Website, aplikasi, SEO, otomasi bisnis, dan lainnya. Satu partner terpercaya untuk setiap solusi digital yang dibutuhkan bisnis Anda.',
    },
    about: {
      title: 'Tentang — Polaris',
      description:
        'Kami adalah konsultan IT diagnostic-first yang berbasis di Jakarta. Kami menemukan masalah sesungguhnya sebelum membangun apapun.',
    },
    insights: {
      title: 'Insight — Polaris',
      description:
        'Tips, panduan, dan pemikiran jujur tentang strategi, teknologi, dan membangun digital presence yang benar-benar berhasil.',
    },
    contact: {
      title: 'Kontak — Polaris',
      description:
        'Mulai dengan Business Health Check gratis. 3 hari, laporan tertulis yang jelas, dan akhirnya arah yang jelas.',
    },
  },
}
