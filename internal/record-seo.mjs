import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'seo-animation.html');
const outputPath = resolve(__dirname, '..', 'public', 'videos', 'seo-dashboard.webm');

const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1200,750'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 750 });

await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);

// Start recording
const recorder = await page.screencast({ path: outputPath });

// Wait for animations to play
await new Promise(r => setTimeout(r, 6000));

await recorder.stop();
await browser.close();
console.log(`Video saved to: ${outputPath}`);
