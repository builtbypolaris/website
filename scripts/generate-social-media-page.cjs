/**
 * Generates a Social Media showcase page and inserts it into both PDF catalogs.
 * Visual style matches existing Polaris catalog pages (dark purple, centered logo,
 * large device mockup, gold labels, Cormorant Garamond serif headings).
 */

const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const EN_PDF = path.resolve(__dirname, '../internal/documents/Polaris-Service-Catalog-2026.pdf');
const ID_PDF = path.resolve(__dirname, '../internal/documents/Polaris-Katalog-Layanan-2026.pdf');
const SOCIAL_IMG = path.resolve(__dirname, '../public/images/services/social-media-content-creation.png');
const LOGO_LIGHT = path.resolve(__dirname, '../public/images/logo/logo-light.png');

function imgToDataUrl(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

function buildHtml(lang = 'en') {
  const logoUrl = imgToDataUrl(LOGO_LIGHT);
  const socialImgUrl = imgToDataUrl(SOCIAL_IMG);

  const text = {
    en: {
      serviceLabel: '04 · SOCIAL MEDIA',
      headingLine1: 'Your brand\u2019s social',
      headingLine2: 'presence, built',
      headingAccent: 'to grow.',
      tagline: 'We create, schedule, and grow your brand across all major social media platforms — so you can focus on running your business.',
      footer: 'Confidential: Service Catalog 2026',
    },
    id: {
      serviceLabel: '04 · SOCIAL MEDIA',
      headingLine1: 'Kehadiran sosial brand',
      headingLine2: 'Anda, kami',
      headingAccent: 'kelola.',
      tagline: 'Kami membuat, menjadwalkan, dan mengembangkan brand Anda di semua platform media sosial \u2014 agar Anda bisa fokus menjalankan bisnis.',
      footer: 'Konfidensial: Katalog Layanan 2026',
    },
  }[lang];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
  }

  .page {
    width: 210mm;
    height: 297mm;
    background: #0d0b1a;
    position: relative;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  /* Subtle radial glows matching the existing catalog */
  .glow-tr {
    position: absolute;
    top: -40px;
    right: -60px;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(100,70,180,0.10) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }
  .glow-bl {
    position: absolute;
    bottom: -80px;
    left: -60px;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(100,70,180,0.07) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── HEADER ── */
  .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px 28px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }

  .logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .logo {
    height: 18px;
    opacity: 0.92;
  }

  .logo-tagline {
    font-size: 7px;
    font-weight: 300;
    letter-spacing: 2.5px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
  }

  .page-num {
    font-size: 10px;
    font-weight: 300;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.22);
  }

  /* Thin gold rule under header */
  .header-rule {
    position: absolute;
    top: 58px;
    left: 28px;
    right: 28px;
    height: 0.5px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(201,169,110,0.25) 20%,
      rgba(201,169,110,0.25) 80%,
      transparent 100%
    );
    z-index: 10;
  }

  /* ── MAIN LAYOUT ── */
  /* Two columns: left=text, right=phone mockup */
  .main {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 46px;
    display: flex;
    align-items: stretch;
    z-index: 5;
  }

  /* Left column: service label + heading + tagline */
  .left {
    width: 46%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 28px 20px 28px;
  }

  .service-label {
    font-size: 8px;
    font-weight: 500;
    letter-spacing: 3.5px;
    color: #c9a96e;
    text-transform: uppercase;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .service-label::before {
    content: '';
    width: 22px;
    height: 0.5px;
    background: #c9a96e;
    opacity: 0.65;
    flex-shrink: 0;
  }

  .heading {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: 38px;
    line-height: 1.15;
    color: #ffffff;
    margin-bottom: 20px;
  }
  .heading .accent {
    color: #7c5cbf;
    font-style: italic;
  }

  .tagline {
    font-size: 10px;
    font-weight: 300;
    line-height: 1.85;
    color: rgba(255,255,255,0.50);
    max-width: 230px;
    margin-bottom: 28px;
  }

  /* Feature pills */
  .pills {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 9px;
    font-weight: 400;
    color: rgba(255,255,255,0.60);
    line-height: 1.4;
  }
  .pill-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c9a96e;
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* Left column aligned to top with padding */
  .left {
    justify-content: flex-start !important;
    padding-top: 60px !important;
  }

  /* Right column: phone mockup */
  .right {
    width: 54%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 24px 20px 0;
    position: relative;
  }

  /* Glow behind phone */
  .phone-glow {
    position: absolute;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(100,70,180,0.18) 0%, transparent 60%);
    border-radius: 50%;
    pointer-events: none;
  }

  .phone {
    width: 248px;
    height: 505px;
    background: #1c1c1e;
    border-radius: 40px;
    padding: 6px;
    box-shadow:
      0 50px 120px rgba(0,0,0,0.70),
      0 16px 40px rgba(0,0,0,0.45),
      inset 0 0 0 1px rgba(255,255,255,0.09);
    position: relative;
    z-index: 2;
  }

  /* Volume buttons */
  .phone::before {
    content: '';
    position: absolute;
    left: -3.5px;
    top: 20%;
    width: 3px;
    height: 18px;
    background: #2c2c2e;
    border-radius: 2px 0 0 2px;
    box-shadow: 0 30px 0 #2c2c2e;
  }
  /* Power button */
  .phone::after {
    content: '';
    position: absolute;
    right: -3.5px;
    top: 28%;
    width: 3px;
    height: 52px;
    background: #2c2c2e;
    border-radius: 0 2px 2px 0;
  }

  .phone-inner {
    width: 100%;
    height: 100%;
    border-radius: 35px;
    overflow: hidden;
    background: #000;
    position: relative;
  }

  .phone-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Home indicator */
  .phone-bar {
    position: absolute;
    bottom: 7px;
    left: 50%;
    transform: translateX(-50%);
    width: 52px;
    height: 3px;
    background: rgba(255,255,255,0.22);
    border-radius: 2px;
    z-index: 3;
  }

  /* Glass reflection on phone */
  .phone-reflection {
    position: absolute;
    inset: 0;
    border-radius: 40px;
    background: linear-gradient(130deg, rgba(255,255,255,0.045) 0%, transparent 45%);
    pointer-events: none;
    z-index: 4;
  }

  /* Second phone (shadow phone, slightly behind and offset) */
  .phone-shadow {
    position: absolute;
    width: 172px;
    height: 352px;
    background: #161618;
    border-radius: 36px;
    left: calc(50% - 148px);
    top: calc(50% - 176px + 24px);
    box-shadow:
      0 32px 80px rgba(0,0,0,0.5),
      inset 0 0 0 1px rgba(255,255,255,0.05);
    z-index: 1;
    overflow: hidden;
  }
  .phone-shadow img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.55;
    filter: blur(0.5px);
  }

  /* ── FOOTER ── */
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 28px;
    z-index: 10;
    border-top: 0.5px solid rgba(255,255,255,0.06);
  }
  .footer-left {
    font-size: 7.5px;
    font-weight: 300;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.22);
    text-transform: uppercase;
  }
  .footer-line {
    flex: 1;
    height: 0.5px;
    background: rgba(255,255,255,0.06);
    margin: 0 16px;
  }
  .footer-right {
    font-size: 7.5px;
    font-weight: 300;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.22);
  }
</style>
</head>
<body>
<div class="page">
  <div class="glow-tr"></div>
  <div class="glow-bl"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-wrap">
      <img src="${logoUrl}" class="logo" alt="Polaris" />
      <span class="logo-tagline">Digital Agency</span>
    </div>
    <span class="page-num">05</span>
  </div>
  <div class="header-rule"></div>

  <!-- Main content -->
  <div class="main">
    <!-- Left: text -->
    <div class="left">
      <div class="service-label">${text.serviceLabel}</div>
      <div class="heading">
        ${text.headingLine1}<br />
        ${text.headingLine2} <span class="accent">${text.headingAccent}</span>
      </div>
      <p class="tagline">${text.tagline}</p>
      <div class="pills">
        ${lang === 'en' ? `
        <div class="pill"><div class="pill-dot"></div>Content strategy &amp; brand identity</div>
        <div class="pill"><div class="pill-dot"></div>Photo &amp; video content creation</div>
        <div class="pill"><div class="pill-dot"></div>Caption writing &amp; hashtag research</div>
        <div class="pill"><div class="pill-dot"></div>Monthly analytics &amp; performance reports</div>
        ` : `
        <div class="pill"><div class="pill-dot"></div>Strategi konten &amp; identitas brand</div>
        <div class="pill"><div class="pill-dot"></div>Pembuatan konten foto &amp; video</div>
        <div class="pill"><div class="pill-dot"></div>Penulisan caption &amp; riset hashtag</div>
        <div class="pill"><div class="pill-dot"></div>Laporan analitik &amp; insight bulanan</div>
        `}
      </div>
    </div>

    <!-- Right: phone mockup -->
    <div class="right">
      <div class="phone-glow"></div>
      <!-- Shadow / back phone -->
      <div class="phone-shadow">
        <img src="${socialImgUrl}" alt="" />
      </div>
      <!-- Main phone -->
      <div class="phone">
        <div class="phone-inner">
          <img src="${socialImgUrl}" alt="Social Media" />
          <div class="phone-bar"></div>
        </div>
        <div class="phone-reflection"></div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-left">Polaris</span>
    <div class="footer-line"></div>
    <span class="footer-right">${text.footer}</span>
  </div>
</div>
</body>
</html>`;
}

async function generatePagePdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2500));

  await page.pdf({
    path: outputPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log('Generated:', outputPath);
}

async function insertPage(originalPdfPath, newPagePdfPath, insertAfterPageIndex, outputPath) {
  const originalBytes = fs.readFileSync(originalPdfPath);
  const newPageBytes = fs.readFileSync(newPagePdfPath);

  const original = await PDFDocument.load(originalBytes);
  const newPageDoc = await PDFDocument.load(newPageBytes);

  const [insertedPage] = await original.copyPages(newPageDoc, [0]);
  original.insertPage(insertAfterPageIndex, insertedPage);

  fs.writeFileSync(outputPath, await original.save());
  console.log('Saved:', outputPath);
}

async function main() {
  const tmpDir = path.resolve(__dirname, '../internal');

  // Generate EN page
  await generatePagePdf(buildHtml('en'), path.join(tmpDir, '_social-media-page-en.pdf'));

  // Generate ID page
  await generatePagePdf(buildHtml('id'), path.join(tmpDir, '_social-media-page-id.pdf'));

  // Reload fresh copies of the PDFs to check their current page count,
  // then insert the new page after existing showcase pages (after page index 3 = after page 4)
  const enBytes = fs.readFileSync(EN_PDF);
  const idBytes = fs.readFileSync(ID_PDF);
  const enDoc = await PDFDocument.load(enBytes);
  const idDoc = await PDFDocument.load(idBytes);
  console.log('EN pages before:', enDoc.getPages().length);
  console.log('ID pages before:', idDoc.getPages().length);

  await insertPage(EN_PDF, path.join(tmpDir, '_social-media-page-en.pdf'), 4, EN_PDF);
  await insertPage(ID_PDF, path.join(tmpDir, '_social-media-page-id.pdf'), 4, ID_PDF);

  // Clean up temp files
  fs.unlinkSync(path.join(tmpDir, '_social-media-page-en.pdf'));
  fs.unlinkSync(path.join(tmpDir, '_social-media-page-id.pdf'));

  // Verify
  const enFinal = await PDFDocument.load(fs.readFileSync(EN_PDF));
  const idFinal = await PDFDocument.load(fs.readFileSync(ID_PDF));
  console.log('\nEN pages after:', enFinal.getPages().length);
  console.log('ID pages after:', idFinal.getPages().length);
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
