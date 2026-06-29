const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function main() {
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, '../internal/documents/Polaris-Service-Catalog-2026.pdf'));
  const doc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  const [page] = await newDoc.copyPages(doc, [3]); // page 4 (0-indexed)
  newDoc.addPage(page);
  const tmpPath = path.resolve(__dirname, '../internal/_page4.pdf');
  fs.writeFileSync(tmpPath, await newDoc.save());

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const p = await browser.newPage();
  await p.setViewport({ width: 794, height: 1123 });
  await p.goto('file:///' + tmpPath.split('\\').join('/'), { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  await p.screenshot({ path: path.resolve(__dirname, '../internal/page4-preview.png') });
  console.log('done');
  await browser.close();
  fs.unlinkSync(tmpPath);
}
main().catch(console.error);
