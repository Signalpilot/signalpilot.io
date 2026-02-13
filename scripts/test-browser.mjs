import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';

console.log('Launching browser...');
const browser = await puppeteer.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  headless: 'new',
  args: [
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
    '--disable-dev-shm-usage', '--disable-software-rasterizer',
    '--disable-extensions', '--disable-background-networking',
    '--disable-sync', '--disable-translate',
    '--no-first-run', '--no-zygote',
    '--single-process',
  ],
  timeout: 10000,
  protocolTimeout: 120000,
});
console.log('Browser launched!');

const page = await browser.newPage();

// Test 1: Full Instagram size (1080x1350)
await page.setViewport({ width: 1080, height: 1350 });
await page.setContent('<html><body style="background:#0a0a0f;color:white;display:flex;justify-content:center;align-items:center;height:100vh;margin:0"><h1 style="font-size:48px">1080x1350 Test</h1></body></html>');
let t = Date.now();
await page.screenshot({ path: 'assets/social/test-1080.png', type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } });
console.log('1080x1350 screenshot:', Date.now() - t, 'ms');

// Test 2: Load actual carousel HTML
let html = readFileSync('INSTAGRAM_CONTENT_HUB/social/post-001/carousel.html', 'utf8');
html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');
html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.evaluate(() => new Promise(r => setTimeout(r, 200)));

// Activate export mode
const slideCount = await page.evaluate(() => {
  document.body.classList.add('export-mode');
  const wrappers = document.querySelectorAll('.slide-wrapper');
  wrappers.forEach(w => w.classList.remove('active'));
  return wrappers.length;
});
console.log('Post-001 has', slideCount, 'slides');

// Render slide 1
await page.evaluate(() => {
  const wrappers = document.querySelectorAll('.slide-wrapper');
  wrappers.forEach((w, j) => w.classList.toggle('active', j === 0));
});
await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

t = Date.now();
await page.screenshot({ path: 'assets/social/post-001/slide-1.png', type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } });
console.log('Post-001 slide 1 rendered:', Date.now() - t, 'ms');

await browser.close();
console.log('Done! Check assets/social/post-001/slide-1.png');
