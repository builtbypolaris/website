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
    studios: 'Studios',
    insights: 'Insight',
    contact: 'Kontak',
    cta: 'Lihat apa yang bisnis Anda butuhkan',
    mobileCta: 'Health Check Gratis',
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    tagline:
      'Konsultan diagnostic-first yang membantu bisnis Indonesia mengidentifikasi bottleneck, meningkatkan operasional, dan bertumbuh melalui teknologi.',
    navigate: 'Navigasi',
    getInTouch: 'Hubungi Kami',
    location: 'Jakarta · Yogyakarta · Bali',
    language: 'Bahasa',
    copyright: '© 2026 Polaris Studio · Jakarta · Yogyakarta · Bali',
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
    badge: 'Agensi Diagnostik Pertama',
    titleLine1: 'Kami ',
    titleLine1Em: 'mendiagnosis',
    titleLine2: 'sebelum kami',
    titleLine2Em: 'membangun.',
    titleLine3: '',
    subtitle:
      'Sebagian besar bisnis tidak butuh lebih banyak tools. Mereka butuh kejelasan. Kami mengidentifikasi apa yang menghambat pertumbuhan, membuang waktu, atau menguras pendapatan, lalu membangun hanya yang diperlukan untuk memperbaikinya.',
    ctaPrimary: 'Dapatkan Health Check Gratis',
    ctaSecondary: 'Lihat karya kami',
    laptopLabel: 'Website F&B',
    laptopSubLabel: 'Pengembangan Website',
    phoneLabel: 'Undangan Digital',
    phoneSubLabel: 'Online Invitation',
  },

  // ── Trust bar ──────────────────────────────────────────────────────────
  trustBar: {
    label: 'Kami membantu bisnis bertumbuh',
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
        tab: 'SEO',
        title: 'SEO',
        tagline: 'Visibilitas situs Anda di mesin pencari, didukung AI dan dipandu strategi.',
      },
      {
        tab: 'Social Media',
        title: 'Social Media',
        tagline: 'Kehadiran sosial brand Anda, fully managed. Dari strategi hingga konten siap-posting.',
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

  // ── Services bento (home) ─────────────────────────────────────────────
  servicesBento: {
    titleLine1: 'Setiap solusi.',
    titleLine2: 'Satu partner.',
    seeMore: 'Jelajahi',
    seeAll: 'Semua layanan',
    tabLabels: ['Website Dev', 'SEO & Peringkat', 'Pembuatan Konten'],
    headlines: [
      { line1: 'Website Anda,', line2: 'dibangun tepat.' },
      { line1: 'Rank lebih tinggi,', line2: 'tumbuh lebih cepat.' },
      { line1: 'Konten yang', line2: 'mengkonversi.' },
    ],
  },

  // ── Metrics bar (home) ────────────────────────────────────────────────
  metricsBar: {
    stats: [
      { number: '120+', label: 'Proyek selesai' },
      { number: '3×', label: 'Rata-rata peningkatan pendapatan' },
      { number: '6', label: 'Kota aktif' },
      { number: '98%', label: 'Retensi klien' },
    ],
  },

  // ── Featured work (home) ───────────────────────────────────────────────
  featuredWork: {
    sectionLabel: 'Karya Pilihan',
    titleLine1: 'Bukti,',
    titleLine2: 'bukan janji.',
    subtitle: 'Engagement nyata. Angka nyata.',
    projects: [
      {
        tag: 'F&B · Jakarta',
        duration: 'Engagement 6 bulan',
        name: 'Ekspansi Jaringan Restoran',
        outcomes: ['+340% traffic organik', '3× pertumbuhan pendapatan', 'Operasional tersistemasi'],
      },
      {
        tag: 'Fashion · Bali',
        duration: 'Engagement 4 bulan',
        name: 'Brand Lokal Go Digital',
        outcomes: ['+280% jangkauan Instagram', '5× pertumbuhan penjualan online', 'Pipeline konten terbangun'],
      },
    ],
    cta: 'Mulai proyek Anda',
  },

  // ── Service features (home alternating rows) ───────────────────────────
  serviceFeatures: {
    features: [
      {
        label: 'Website Development',
        headLine1: 'Ubah pengunjung',
        headLine2: 'menjadi pelanggan.',
        description: 'Setiap halaman dirancang dengan tujuan: membantu orang yang tepat memahami bisnis Anda dan mengambil tindakan.',
      },
      {
        label: 'Sistem Operasional',
        headLine1: 'Sistem yang menghilangkan',
        headLine2: 'gesekan operasional.',
        description: 'Proses manual memperlambat bisnis. Kami membangun CRM, dashboard internal, workflow otomasi, dan business tools yang mengurangi pekerjaan berulang dan meningkatkan visibilitas operasional.',
      },
      {
        label: 'Media Sosial & Konten',
        headLine1: 'Konten konsisten.',
        headLine2: 'Positioning yang jelas.',
        description: 'Kami membantu bisnis berkomunikasi dengan jelas melalui strategi, desain, dan konten yang memperkuat brand serta menjaga visibilitas mereka.',
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

  // ── Work showcase (About page) ──────────────────────────────────────
  workShowcase: {
    sectionLabel: 'Karya Kami',
    titleLine1: 'Apa yang telah',
    titleLine2: 'kami hasilkan.',
    subtitle: 'Proyek nyata, hasil nyata. Berikut sekilas apa yang telah kami bangun untuk klien kami.',
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
        title: 'Aplikasi Manajemen Pesanan',
      },
      {
        service: 'Business Operation',
        title: 'CRM & Dashboard Penjualan',
      },
      {
        service: 'SEO & Konten',
        title: 'Pertumbuhan Search Console',
      },
      {
        service: 'Custom Solution',
        title: 'Javanese Emotion',
      },
      {
        service: 'Custom Solution',
        title: 'Undangan Mak Gien',
      },
    ],
  },

  // ── Results showcase (About page) — DEPRECATED ────────────────────────
  resultsShowcase: {
    sectionLabel: 'Hasil & Nilai',
    titleLine1: 'Apa yang kerja kami',
    titleLine2: 'benar-benar hasilkan.',
    subtitle:
      'Empat prinsip. Hasil nyata. Setiap proyek dimulai dengan nilai dan diakhiri dengan bukti.',
    items: [
      {
        value: 'Kejelasan',
        valueDescription:
          'Kami memberikan arah ketika semuanya terasa tidak jelas. Anda selalu tahu kemana tujuan Anda dan mengapa.',
        metric: '3 hari',
        metricLabel: 'dari kickoff hingga diagnosis tertulis',
        quote:
          'Dalam minggu pertama, kami akhirnya memahami apa yang sebenarnya memperlambat kami. Tidak ada yang pernah memetakannya seperti itu sebelumnya.',
        attribution: 'Founder, startup e-commerce Jakarta',
      },
      {
        value: 'Integritas',
        valueDescription:
          'Kami mengatakan kebenaran, bahkan saat itu sulit. Tidak ada yang dimaniskan, tidak ada agenda tersembunyi, tidak ada jargon.',
        metric: '100%',
        metricLabel: 'pelaporan transparan, tanpa biaya tersembunyi',
        quote:
          'Mereka bilang rencana awal kami tidak akan berhasil, lalu menunjukkan apa yang akan berhasil. Kejujuran itu menghemat waktu kami berbulan-bulan.',
        attribution: 'Direktur Operasional, grup hospitality Bali',
      },
      {
        value: 'Presisi',
        valueDescription:
          'Setiap solusi dibangun untuk pas dengan kebutuhan Anda, bukan template, bukan tebakan. Tepat sasaran.',
        metric: '0',
        metricLabel: 'template generik yang digunakan',
        quote:
          'Sistem yang mereka bangun cocok dengan alur kerja kami seperti dirancang dari dalam. Karena memang begitu. Mereka memahami proses kami sebelum menulis satu baris kode.',
        attribution: 'CEO, perusahaan manufaktur Yogyakarta',
      },
      {
        value: 'Pertumbuhan',
        valueDescription:
          'Kami tidak hanya di sini untuk memperbaiki masalah hari ini. Kami di sini untuk memastikan Anda benar-benar lebih baik karenanya.',
        metric: '↑ 40%',
        metricLabel: 'rata-rata peningkatan efisiensi setelah 6 bulan',
        quote:
          'Enam bulan kemudian, kami masih menggunakan semua yang mereka siapkan, dan itu benar-benar berkembang bersama kami. Itu tidak pernah terjadi dengan konsultan lain.',
        attribution: 'Managing Partner, jasa profesional Jakarta',
      },
    ],
  },

  // ── CTA section ────────────────────────────────────────────────────────
  cta: {
    titleLine1: 'Arah sebelum',
    titleLine2: 'eksekusi.',
    description:
      'Business Health Check kami memberikan penilaian praktis tentang bisnis, operasional, dan kehadiran digital Anda, sehingga Anda tahu persis apa yang perlu diperbaiki sebelum menginvestasikan waktu atau uang.',
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
          'Kami merancang, mengembangkan, dan men-deploy website di infrastruktur modern. Cepat, aman, dan scalable. Setiap site sudah dilengkapi analytics dari awal.',
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
          'Dari konsep hingga deployment. Aplikasi mobile native atau cross-platform untuk iOS dan Android, dari aplikasi utility sederhana hingga business tool full-featured.',
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
        title: 'SEO',
        tagline: 'Visibilitas situs Anda di mesin pencari, didukung AI dan dipandu strategi.',
        description:
          'Kami mengoptimalkan dan membuat konten yang mendatangkan traffic organik dan membangun otoritas domain. Dari SEO teknis hingga blog writing berbasis AI, setiap keyword ditarget, setiap halaman dioptimalkan.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan SEO. Mari bicara!',
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
        ],
      },
      {
        slug: 'content-creation',
        title: 'Social Media',
        tagline: 'Kehadiran sosial brand Anda, fully managed.',
        description:
          'Kami membuat, mendesain, dan menjadwalkan konten yang membangun kepercayaan dan menjaga keterlibatan audiens Anda. Dari identitas brand hingga konten siap-posting, satu strategi yang kohesif di setiap platform.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan layanan Social Media. Mari bicara!',
        subServices: [
          {
            name: 'Branding Social Media',
            description:
              'Identitas brand untuk presence social Anda. Template visual, panduan tone of voice, optimasi bio, dan desain profil yang kohesif di semua platform.',
          },
          {
            name: 'Pembuatan Konten Social Media',
            description:
              'Konten siap-posting untuk Instagram, LinkedIn, TikTok, dan lainnya. Caption, gambar, reels, dan strategi hashtag, fully managed.',
          },
        ],
      },
      {
        slug: 'business-operation',
        title: 'Operasi Bisnis',
        tagline: 'Back-office Anda, didigitalisasi.',
        description:
          'Sistem internal custom agar Anda bisa menjalankan bisnis dari satu tempat. Dari company profile hingga otomasi HR penuh, kami membangun digital backbone yang dibutuhkan bisnis Anda.',
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
              'Dashboard live, laporan keuangan otomatis. Selalu tahu angka Anda. Tidak ada lagi spreadsheet manual.',
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
          'Di luar kategori utama kami: analisis data, undangan digital, deck presentasi, dan lainnya. Punya ide lain? Kami terbuka untuk project custom. Jika itu masalah, kami akan selesaikan.',
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
              'Punya tantangan unik? Jelaskan, dan kami akan scope solusinya. AI chatbot, integrasi e-commerce, workflow custom, integrasi API. Sebut saja.',
          },
        ],
      },
      {
        slug: 'packages',
        title: 'Paket',
        tagline: 'Layanan bundling dengan harga lebih baik.',
        description:
          'Pilih kombinasi yang sesuai dengan bisnis Anda. Paket kami menggabungkan layanan komplementer agar Anda mendapatkan lebih banyak nilai dan satu hal lebih sedikit untuk dipikirkan.',
        ctaLabel: 'Mari Bicara',
        whatsappMessage:
          'Halo Polaris! Saya tertarik dengan paket layanan Anda. Yang mana yang Anda rekomendasikan untuk bisnis saya?',
        subServices: [
          {
            name: 'Full Business Suite',
            description:
              'CRM, pelaporan keuangan, payroll & HR: digital backbone lengkap untuk bisnis Anda dalam satu platform terpadu.',
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
      'Kami adalah konsultan bisnis & IT diagnostic-first yang berbasis di Jakarta, Yogyakarta, dan Bali. Kami menemukan masalah sesungguhnya sebelum membangun apapun.',
  },

  // ── Insights listing page ──────────────────────────────────────────────
  insights: {
    eyebrow: 'Blog',
    title: 'Insight',
    titleLine1: 'Pikirkan sebelum',
    titleLine2: 'Anda bangun.',
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
      title: 'Polaris — Kompas Bisnis Anda | Polaris Studio',
      description:
        'Polaris adalah konsultan bisnis & IT diagnostic-first pertama di Indonesia. Kami menemukan masalah sesungguhnya sebelum membangun solusinya. Web, AI, data, otomasi. Satu partner terpercaya.',
    },
    services: {
      title: 'Layanan — Polaris',
      description:
        'Website, aplikasi, SEO, otomasi bisnis, dan lainnya. Satu partner terpercaya untuk setiap solusi digital yang dibutuhkan bisnis Anda.',
    },
    studios: {
      title: 'Novo — built by Polaris Studio',
      description:
        'Novo adalah aplikasi produktivitas dengan hewan peliharaan digital yang berkembang seiring kamu melacak keuangan, tugas, dan kebiasaan. Dibuat oleh Polaris Studio.',
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
