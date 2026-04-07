import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = [
  { html: 'company-profile.html', pdf: 'Polaris-Company-Profile-2026.pdf' },
  { html: 'company-profile-id.html', pdf: 'Polaris-Profil-Perusahaan-2026.pdf' },
  { html: 'service-catalog.html', pdf: 'Polaris-Service-Catalog-2026.pdf' },
  { html: 'service-catalog-id.html', pdf: 'Polaris-Katalog-Layanan-2026.pdf' },
];

const browser = await puppeteer.launch({ headless: true });

for (const { html, pdf } of files) {
  const page = await browser.newPage();
  const htmlPath = resolve(__dirname, html);
  const outputPath = resolve(__dirname, 'documents', pdf);

  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });

  await page.close();
  console.log(`Generated: ${pdf}`);
}

await browser.close();
console.log('Done — all PDFs generated.');
