const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function main() {
  // Extract just page 5 to a temp PDF, then screenshot it via puppeteer
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, '../internal/documents/Polaris-Service-Catalog-2026.pdf'));
  const doc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  const [page5] = await newDoc.copyPages(doc, [4]); // 0-indexed, page 5
  newDoc.addPage(page5);
  const tmpPath = path.resolve(__dirname, '../internal/_page5.pdf');
  fs.writeFileSync(tmpPath, await newDoc.save());

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });

  const fileUrl = 'file:///' + tmpPath.split('\\').join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log('nav:', e.message));
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve(__dirname, '../internal/page5-preview.png'), fullPage: false });
  console.log('Page 5 screenshot done');
  await browser.close();
  fs.unlinkSync(tmpPath);
}
main().catch(console.error);
