const puppeteer = require('puppeteer');
const path = require('path');

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 596, height: 842 });

  const pdfPath = path.resolve(__dirname, '../internal/documents/Polaris-Service-Catalog-2026.pdf');
  const fileUrl = 'file:///' + pdfPath.split('\\').join('/');

  await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log('nav:', e.message));
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve(__dirname, '../internal/catalog-preview.png') });
  console.log('screenshot done');
  await browser.close();
}
main().catch(console.error);
