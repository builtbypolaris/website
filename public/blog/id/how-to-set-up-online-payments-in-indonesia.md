---
{
  "title": "Cara mengatur pembayaran online di Indonesia (panduan praktis)",
  "slug": "how-to-set-up-online-payments-in-indonesia",
  "date": "2026-04-10",
  "updated": "2026-04-10",
  "template": "default",
  "excerpt": "Panduan langkah demi langkah untuk mengatur pembayaran online di Indonesia. Bandingkan payment gateway seperti Midtrans, Xendit, dan DOKU, pahami QRIS, dan mulailah menerima pembayaran di website Anda.",
  "coverImage": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-cover.svg",
  "coverImageAlt": "Laptop menampilkan checkout pembayaran online dengan ikon metode pembayaran Indonesia melayang di sekitarnya",
  "coverImageWidth": 1785,
  "coverImageHeight": 949,
  "categories": ["Websites"],
  "readTime": 8,
  "author": {
    "name": "Polaris Team",
    "title": "Digital Consultancy",
    "avatar": "",
    "bio": ""
  },
  "reviewer": null,
  "seo": {
    "title": "Cara mengatur pembayaran online di Indonesia (panduan 2026)",
    "description": "Pelajari cara mengatur pembayaran online di Indonesia. Bandingkan Midtrans, Xendit, DOKU, dan Stripe. Pahami QRIS, e-wallet, dan virtual account untuk bisnis Anda.",
    "image": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-cover.svg"
  },
  "faqs": {
    "heading": "Pertanyaan yang sering diajukan",
    "type": "default",
    "answerType": "markdown",
    "faqs": [
      {
        "question": "Apa cara termudah untuk mengatur pembayaran online di Indonesia?",
        "answer": "Jalur tercepat adalah mendaftar ke payment gateway seperti Midtrans atau Xendit, keduanya menawarkan pendaftaran gratis dan tanpa biaya bulanan. Anda bisa mengintegrasikan halaman hosted checkout mereka ke website Anda tanpa menulis kode, atau menggunakan plugin untuk platform seperti WooCommerce dan Shopify."
      },
      {
        "question": "Berapa biaya untuk mengatur pembayaran online di Indonesia?",
        "answer": "Sebagian besar payment gateway di Indonesia tidak memungut biaya setup atau biaya bulanan. Anda hanya membayar per transaksi yang berhasil. Tarif umumnya adalah 0,7% untuk QRIS, 1,5% hingga 2% untuk e-wallet, sekitar Rp 4.000 per transaksi virtual account, dan 2,9% ditambah Rp 2.000 hingga 2.500 untuk kartu kredit."
      },
      {
        "question": "Apakah saya perlu izin usaha untuk mengatur pembayaran online di Indonesia?",
        "answer": "Ya. Payment gateway mensyaratkan registrasi bisnis yang valid (NIB dari OSS) dan NPWP. Beberapa gateway juga menerima akun penjual individu, tapi fiturnya mungkin terbatas. Jika Anda berjualan online secara rutin, registrasi bisnis yang benar sangat disarankan."
      },
      {
        "question": "Bisakah warga asing mengatur pembayaran online di Indonesia?",
        "answer": "Bisnis milik asing bisa menggunakan payment gateway lokal, tapi Anda memerlukan PT PMA (Penanaman Modal Asing) yang terdaftar di Indonesia. Stripe tersedia hanya dengan undangan, dan beberapa bisnis mengakalinya dengan membentuk U.S. LLC. Gateway lokal seperti Midtrans dan Xendit umumnya lebih mudah jika Anda memiliki entitas bisnis Indonesia."
      },
      {
        "question": "Metode pembayaran apa yang sebaiknya ditawarkan saat mengatur pembayaran online di Indonesia?",
        "answer": "Minimal, tawarkan QRIS (yang mencakup semua e-wallet besar seperti GoPay, OVO, dan DANA), transfer bank via virtual account, dan kartu kredit/debit. QRIS saja sudah menjangkau lebih dari 60 juta pengguna. Menambahkan virtual account mencakup pelanggan yang lebih suka transfer bank, yang tetap menjadi salah satu metode pembayaran paling populer di negara ini."
      }
    ],
    "supportLink": null
  }
}
---

Jika Anda menjalankan bisnis di Indonesia dan ingin berjualan online, Anda akan segera menghadapi pertanyaan ini: bagaimana cara sebenarnya menerima pembayaran? Negara ini punya ekosistem pembayarannya sendiri dengan e-wallet lokal, standar kode QR, dan metode transfer bank yang diharapkan pelanggan Anda muncul di checkout. Kartu kredit saja tidak akan cukup di sini.

Kabar baiknya, mengatur pembayaran online di Indonesia sudah menjadi jauh lebih sederhana dalam beberapa tahun terakhir. Payment gateway menangani bagian yang sulit, QRIS telah menyatukan lanskap pembayaran QR, dan sebagian besar penyedia tidak memungut biaya di muka. Anda hanya perlu tahu alat mana yang digunakan dan cara menghubungkannya.

Panduan ini membahas metode pembayaran yang benar-benar digunakan pelanggan Anda, membandingkan gateway utama, dan memandu proses setup mulai dari pendaftaran hingga go live.

## Metode pembayaran yang diharapkan pelanggan Indonesia

Sebelum memilih gateway, Anda perlu memahami bagaimana orang di Indonesia sebenarnya membayar secara online. Komposisinya cukup berbeda dari pasar Barat, dan menawarkan metode yang salah berarti kehilangan penjualan.

**QRIS (pembayaran kode QR).** Diluncurkan oleh Bank Indonesia, <a href="https://www.bi.go.id/en/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx" target="_blank" rel="noopener noreferrer">QRIS</a> adalah standar QR terpadu yang bekerja di seluruh e-wallet besar dan aplikasi mobile banking. Pelanggan memindai satu kode QR menggunakan GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi bank mereka. QRIS memproses lebih dari 6 miliar transaksi hanya di paruh pertama 2025, dan sekarang menjangkau lebih dari 60 juta pengguna. Untuk merchant, biaya transaksinya hanya 0,7%, menjadikannya metode pembayaran digital termurah yang tersedia.

**Virtual account (transfer bank).** Transfer bank tetap menjadi salah satu metode pembayaran yang paling dipercaya di Indonesia. Virtual account menyederhanakan ini dengan menghasilkan nomor rekening unik untuk setiap transaksi, sehingga pembayaran dikonfirmasi secara otomatis. Sebagian besar bank besar didukung, termasuk <a href="https://www.bca.co.id" target="_blank" rel="noopener noreferrer">BCA</a>, BNI, BRI, Mandiri, dan Permata.

**E-wallet.** <a href="https://www.gopay.co.id" target="_blank" rel="noopener noreferrer">GoPay</a>, <a href="https://www.ovo.id" target="_blank" rel="noopener noreferrer">OVO</a>, <a href="https://www.dana.id" target="_blank" rel="noopener noreferrer">DANA</a>, dan ShopeePay mendominasi. Meskipun QRIS mencakup e-wallet ini melalui pemindaian QR, beberapa gateway juga menawarkan integrasi e-wallet langsung dengan fitur seperti pembayaran satu klik dan penagihan berulang.

**Kartu kredit dan debit.** Visa, Mastercard, dan JCB diterima. Penetrasi kartu kredit di Indonesia lebih rendah dibandingkan banyak pasar lain, tapi tetap penting untuk pembelian bernilai tinggi dan pelanggan dengan kartu internasional.

**Pembayaran over-the-counter (OTC).** Pelanggan bisa membayar di minimarket seperti Indomaret dan Alfamart menggunakan kode pembayaran. Metode ini menjangkau pelanggan unbanked yang tidak memiliki dompet digital atau rekening bank.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-0.svg" alt="Lima metode pembayaran Indonesia dibandingkan menampilkan QRIS, virtual account, e-wallet, kartu kredit, dan opsi over-the-counter" />

## Membandingkan payment gateway utama

Empat payment gateway menangani sebagian besar transaksi online di Indonesia. Berikut perbandingannya.

### Midtrans

<a href="https://midtrans.com/en" target="_blank" rel="noopener noreferrer">Midtrans</a> (bagian dari GoTo Financial) adalah salah satu gateway yang paling banyak digunakan di Indonesia, mendukung lebih dari 25 metode pembayaran. Tidak ada biaya setup, tidak ada biaya bulanan, dan tidak ada biaya integrasi. Anda hanya membayar per transaksi yang berhasil: kurang lebih Rp 4.000 per transaksi virtual account, 2,9% ditambah Rp 2.000 hingga 2.500 untuk kartu kredit, 0,7% untuk QRIS, dan mulai dari 1,5% untuk e-wallet.

Midtrans menawarkan plugin untuk <a href="https://woocommerce.com" target="_blank" rel="noopener noreferrer">WooCommerce</a>, <a href="https://www.shopify.com" target="_blank" rel="noopener noreferrer">Shopify</a>, <a href="https://magento.com" target="_blank" rel="noopener noreferrer">Magento</a>, PrestaShop, dan OpenCart. Mereka juga memiliki Snap checkout yang menyediakan popup pembayaran siap pakai yang bisa Anda tanamkan tanpa membangun UI sendiri. Untuk pembuatan yang kustom, Core API mereka memberikan kontrol penuh atas alur pembayaran.

### Xendit

<a href="https://www.xendit.co/en/" target="_blank" rel="noopener noreferrer">Xendit</a> mendukung lebih dari 100 metode pembayaran di seluruh Asia Tenggara dan mengenakan biaya transaksi berkisar dari 1,8% hingga 3,0% tergantung metodenya. Seperti Midtrans, tidak ada biaya setup atau bulanan.

Xendit menonjol karena pengalaman developer-nya. Dokumentasi API mereka menyeluruh, dan mereka menawarkan fitur seperti pembayaran berulang, disbursement (mengirim pembayaran ke rekening bank), dan invoicing. Jika Anda perlu menerima sekaligus mengirim pembayaran, Xendit menangani keduanya. Mereka juga mengklaim tingkat penerimaan kartu hingga 30% lebih tinggi dibandingkan pemrosesan standar.

### DOKU

<a href="https://www.doku.com/en-us" target="_blank" rel="noopener noreferrer">DOKU</a> adalah pionir payment gateway di Indonesia, beroperasi sejak 2007. Mereka memegang lisensi PJP Level 1 dari Bank Indonesia dan membawa sertifikasi PCI DSS dan ISO 27001. Tidak ada biaya bulanan, tidak ada biaya setup.

DOKU adalah pilihan kuat untuk bisnis yang belum memiliki website. Dashboard dan aplikasi mobile mereka memungkinkan Anda membuat tautan pembayaran dan mengelola transaksi tanpa integrasi teknis apa pun. Untuk bisnis dengan website, mereka menawarkan integrasi API dan plugin yang serupa dengan gateway lainnya.

### Stripe

<a href="https://stripe.com/resources/more/payments-in-indonesia" target="_blank" rel="noopener noreferrer">Stripe</a> tersedia di Indonesia hanya dengan undangan. Jika Anda sudah menggunakan Stripe di pasar lain dan ingin berekspansi ke Indonesia, worth dijelajahi. Tapi untuk sebagian besar bisnis Indonesia yang baru mulai, gateway lokal akan lebih cepat untuk di-setup dan lebih baik terintegrasi dengan metode pembayaran lokal yang digunakan pelanggan Anda.

Stripe mendukung virtual account dan beberapa metode lokal, tapi waktu settlement (2 hingga 7 hari kerja) umumnya lebih lama dibandingkan alternatif lokal. Beberapa bisnis mengakali pembatasan undangan ini dengan membentuk U.S. LLC, tapi ini menambah kompleksitas dan biaya.

## Cara mengatur pembayaran online langkah demi langkah

Berikut proses praktis agar pembayaran berjalan di website Anda di Indonesia.

**Langkah 1: Siapkan dokumen bisnis Anda.** Anda memerlukan NIB (Nomor Induk Berusaha) yang valid dari <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer">sistem OSS (Online Single Submission)</a>, NPWP perusahaan Anda, dan rekening bank bisnis. Penjual individu bisa mendaftar di beberapa platform, tapi entitas bisnis yang benar membuka fitur lengkap dan batas transaksi yang lebih tinggi.

**Langkah 2: Pilih payment gateway Anda.** Pilih berdasarkan apa yang paling penting bagi Anda. Jika Anda ingin cakupan pembayaran lokal terluas dan menggunakan platform seperti WooCommerce, Midtrans adalah default yang solid. Jika Anda butuh penagihan berulang atau disbursement, pilih Xendit. Jika Anda ingin setup paling sederhana tanpa coding, pendekatan berbasis dashboard dari DOKU bekerja dengan baik. Jika Anda masih memikirkan platform apa yang akan dibangun, lihat dulu panduan kami tentang <a href="/insights/how-to-build-a-website-for-small-business">cara membuat website untuk usaha kecil</a>.

**Langkah 3: Daftarkan dan verifikasi akun Anda.** Daftar di website gateway pilihan Anda. Anda akan mengirimkan dokumen bisnis, detail rekening bank, dan informasi tentang model bisnis Anda. Verifikasi biasanya memakan waktu 1 hingga 3 hari kerja.

**Langkah 4: Integrasikan payment gateway ke website Anda.** Anda punya tiga opsi tergantung pada setup teknis Anda:

- **Integrasi plugin.** Jika Anda menggunakan WooCommerce, Shopify, Magento, atau platform lain yang didukung, instal plugin gateway dan konfigurasikan dengan API key Anda. Ini memakan waktu 15 hingga 30 menit.
- **Hosted checkout.** Gunakan halaman pembayaran siap pakai dari gateway (seperti Midtrans Snap atau Xendit Invoice). Anda mengarahkan pelanggan ke halaman pembayaran atau menanamkannya sebagai popup. Butuh coding minimal.
- **Integrasi API.** Untuk pengalaman checkout sepenuhnya kustom, gunakan API gateway untuk membangun alur pembayaran ke situs Anda. Ini memerlukan developer tapi memberi Anda kontrol penuh atas pengalaman pengguna.

**Langkah 5: Uji di mode sandbox.** Setiap gateway besar menyediakan lingkungan sandbox dengan kredensial uji. Jalankan alur pembayaran penuh: inisiasi pembayaran, selesaikan dengan nomor kartu uji atau simulasi transfer bank, dan verifikasi bahwa sistem Anda menangani callback konfirmasi dengan benar.

**Langkah 6: Go live.** Beralih dari sandbox ke kredensial produksi, jalankan beberapa transaksi nyata dengan nominal kecil, dan pastikan dana masuk ke rekening bank Anda sesuai jadwal.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-1.svg" alt="Diagram alur enam langkah menampilkan proses mengatur pembayaran online di Indonesia dari dokumen hingga go live" />

## Setup QRIS untuk bisnis Anda

QRIS layak mendapat bagiannya sendiri karena seberapa dominan telah menjadi. Jika Anda hanya mengintegrasikan satu metode pembayaran, jadikan QRIS.

Untuk menerima pembayaran QRIS, Anda mendaftar melalui Payment Service Provider (payment gateway Anda menangani ini). Setelah disetujui, Anda menerima National Merchant ID (NMID), yang biasanya memakan waktu 3 hingga 4 hari kerja. Setelah itu, aktivasi QRIS memakan waktu 1 hingga 2 hari kerja lagi.

Anda bisa menggunakan QRIS dengan dua cara:

- **QR statis.** Kode QR tetap yang Anda cetak dan tampilkan. Pelanggan memindainya dan memasukkan jumlah pembayaran secara manual. Cocok untuk toko fisik dan invoice online sederhana.
- **QR dinamis.** Dibuat per transaksi dengan jumlah yang sudah terisi. Ini yang Anda inginkan untuk checkout website Anda. Gateway membuat QR unik untuk setiap pesanan, dan konfirmasi pembayaran otomatis.

Struktur biayanya sederhana. Per 2026, biaya merchant QRIS dibatasi pada 0,7% untuk sebagian besar transaksi. Ada dorongan untuk tarif yang lebih rendah lagi untuk usaha mikro dan kecil.

Satu perkembangan terkini yang patut dicatat: QRIS Tap diluncurkan pada Maret 2025, memungkinkan pembayaran contactless berbasis NFC. Pelanggan menempelkan ponsel mereka ke reader alih-alih memindai kode QR. Meskipun ini lebih relevan untuk toko fisik, ini menandakan komitmen Bank Indonesia untuk memperluas ekosistem QRIS.

## Dasar-dasar keamanan dan kepatuhan

Ketika Anda mengatur pembayaran online di Indonesia, keamanan bukan opsional. Berikut yang perlu Anda ketahui.

**Kepatuhan PCI DSS.** Bisnis apa pun yang menangani data kartu kredit perlu mematuhi <a href="https://www.pcisecuritystandards.org" target="_blank" rel="noopener noreferrer">PCI DSS (Payment Card Industry Data Security Standard)</a>. Kabar baiknya: jika Anda menggunakan hosted checkout atau popup pembayaran dari gateway, gateway menangani kepatuhan PCI untuk Anda. Anda hanya perlu khawatir tentang PCI jika Anda membangun formulir input kartu yang sepenuhnya kustom, yang tidak seharusnya dilakukan sebagian besar bisnis.

**3D Secure.** Ini adalah <a href="https://www.emvco.com/emv-technologies/3d-secure/" target="_blank" rel="noopener noreferrer">langkah verifikasi tambahan</a> (biasanya OTP yang dikirim ke ponsel pelanggan) selama pembayaran kartu. Semua gateway besar Indonesia mendukung 3D Secure, dan sangat disarankan. Ini mengalihkan tanggung jawab penipuan dari Anda ke penerbit kartu dan secara signifikan mengurangi chargeback.

**Perlindungan data.** Undang-undang perlindungan data Indonesia (UU PDP, diberlakukan pada 2022) mewajibkan bisnis menangani data pribadi secara bertanggung jawab. Pastikan kebijakan privasi Anda mencakup data pembayaran, dan jangan menyimpan informasi kartu sensitif di server Anda sendiri. Biarkan gateway yang menanganinya.

**Peraturan Bank Indonesia.** Payment gateway yang beroperasi di Indonesia harus memiliki lisensi dari <a href="https://www.bi.go.id/en/default.aspx" target="_blank" rel="noopener noreferrer">Bank Indonesia</a>. Ketika Anda menggunakan gateway berlisensi seperti Midtrans, Xendit, atau DOKU, Anda terlindungi. Jangan mencoba memproses pembayaran melalui penyedia tak berlisensi atau saluran informal.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-2.svg" alt="Daftar periksa keamanan untuk pembayaran online di Indonesia menampilkan PCI DSS, 3D Secure, perlindungan data, dan lisensi Bank Indonesia" />

## Biarkan Polaris menangani integrasi pembayaran Anda

Mengatur pembayaran online adalah satu bagian dari menjalankan bisnis online. Membuat alur checkout yang tepat, memastikannya berjalan mulus di mobile, dan mengintegrasikannya dengan desain dan sistem inventaris website Anda membutuhkan kerja nyata.

Di <a href="https://www.builtbypolaris.com" target="_blank" rel="noopener noreferrer">Polaris</a>, kami membangun website dengan integrasi pembayaran yang sudah terpasang dari awal. Proses kami dimulai dengan Business Health Check untuk memahami apa yang benar-benar dibutuhkan bisnis Anda, kemudian kami menangani pengembangan website penuh termasuk integrasi ecommerce dengan payment gateway yang tepat untuk situasi Anda. Checkout yang berfungsi tidak berarti banyak jika situs Anda tidak bisa <a href="/insights/how-to-get-more-leads-from-your-website">mendatangkan traffic berkualitas yang cukup ke sana</a> sejak awal, itulah sebabnya kami melihat seluruh funnel.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/shared/polaris-homepage.png" alt="Halaman beranda Polaris yang menampilkan pendekatan diagnostik terlebih dahulu untuk pembuatan website" />

Jika Anda sedang mengatur toko online atau menambahkan pembayaran ke situs yang sudah ada, <a href="https://wa.me/6281946494333" target="_blank" rel="noopener noreferrer">hubungi kami</a>. Kami akan membantu Anda memilih gateway yang tepat, mengintegrasikannya dengan benar, dan memastikan checkout Anda benar-benar berkonversi.

## Pertanyaan yang sering diajukan

### Apa cara termudah untuk mengatur pembayaran online di Indonesia?

Jalur tercepat adalah mendaftar ke payment gateway seperti Midtrans atau Xendit, keduanya menawarkan pendaftaran gratis dan tanpa biaya bulanan. Anda bisa mengintegrasikan halaman hosted checkout mereka ke website Anda tanpa menulis kode, atau menggunakan plugin untuk platform seperti WooCommerce dan Shopify.

### Berapa biaya untuk mengatur pembayaran online di Indonesia?

Sebagian besar payment gateway di Indonesia tidak memungut biaya setup atau biaya bulanan. Anda hanya membayar per transaksi yang berhasil. Tarif umumnya adalah 0,7% untuk QRIS, 1,5% hingga 2% untuk e-wallet, sekitar Rp 4.000 per transaksi virtual account, dan 2,9% ditambah Rp 2.000 hingga 2.500 untuk kartu kredit.

### Apakah saya perlu izin usaha untuk mengatur pembayaran online di Indonesia?

Ya. Payment gateway mensyaratkan registrasi bisnis yang valid (NIB dari OSS) dan NPWP. Beberapa gateway juga menerima akun penjual individu, tapi fiturnya mungkin terbatas. Jika Anda berjualan online secara rutin, registrasi bisnis yang benar sangat disarankan.

### Bisakah warga asing mengatur pembayaran online di Indonesia?

Bisnis milik asing bisa menggunakan payment gateway lokal, tapi Anda memerlukan PT PMA (Penanaman Modal Asing) yang terdaftar di Indonesia. Stripe tersedia hanya dengan undangan, dan beberapa bisnis mengakalinya dengan membentuk U.S. LLC. Gateway lokal seperti Midtrans dan Xendit umumnya lebih mudah jika Anda memiliki entitas bisnis Indonesia.

### Metode pembayaran apa yang sebaiknya ditawarkan saat mengatur pembayaran online di Indonesia?

Minimal, tawarkan QRIS (yang mencakup semua e-wallet besar seperti GoPay, OVO, dan DANA), transfer bank via virtual account, dan kartu kredit/debit. QRIS saja sudah menjangkau lebih dari 60 juta pengguna. Menambahkan virtual account mencakup pelanggan yang lebih suka transfer bank, yang tetap menjadi salah satu metode pembayaran paling populer di negara ini.
