const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function screenshotPage(pdfBytes, pageIdx, outPath) {
  const doc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  const [page] = await newDoc.copyPages(doc, [pageIdx]);
  newDoc.addPage(page);
  const tmpPath = outPath + '.pdf';
  fs.writeFileSync(tmpPath, await newDoc.save());

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const p = await browser.newPage();
  await p.setViewport({ width: 794, height: 1123 });
  await p.goto('file:///' + tmpPath.split('\\').join('/'), { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  await p.screenshot({ path: outPath });
  await browser.close();
  fs.unlinkSync(tmpPath);
  console.log('Done:', outPath);
}

async function main() {
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, '../internal/documents/Polaris-Service-Catalog-2026.pdf'));
  const dir = path.resolve(__dirname, '../internal');

  await screenshotPage(pdfBytes, 1, path.join(dir, 'page2.png'));
  await screenshotPage(pdfBytes, 2, path.join(dir, 'page3.png'));
}
main().catch(console.error);
