const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, '../internal/proposal-social-media.html');
  const fileUrl = 'file:///' + htmlPath.split('\\').join('/');

  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const outPath = path.resolve(__dirname, '../internal/Polaris-Proposal-Social-Media-2026.pdf');
  await page.pdf({
    path: outPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log('PDF saved to:', outPath);
  console.log('Size:', fs.statSync(outPath).size, 'bytes');
}

main().catch(console.error);
