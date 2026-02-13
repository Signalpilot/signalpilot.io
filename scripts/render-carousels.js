#!/usr/bin/env node

// Render carousel HTML files to PNG images for Instagram posting
// Uses each carousel's built-in Export Mode for pixel-perfect 1080x1350 slides
//
// Usage: node scripts/render-carousels.js [--start N] [--end N]
// Requires: puppeteer-core (npm install puppeteer-core)

import { readdir, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL_DIR = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const OUTPUT_DIR = join(ROOT, 'assets', 'social');

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

async function renderCarousel(page, postDir, postNumber) {
  const carouselPath = join(postDir, 'carousel.html');
  if (!existsSync(carouselPath)) {
    console.log(`  Skipping post-${postNumber}: no carousel.html`);
    return 0;
  }

  // Read HTML and strip video tags + external font links for fast offline rendering
  let html = readFileSync(carouselPath, 'utf8');

  // Remove Google Fonts link tags — use system font fallbacks
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // Remove video elements — they're cosmetic bg at 8% opacity
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

  // Inject fallback font-face declarations
  const fontFallback = `
    <style>
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 400; src: local('Georgia'), local('Times New Roman'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 400; src: local('Georgia'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; src: local('Georgia'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 600; src: local('Georgia'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 300; src: local('Arial'), local('Helvetica'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: local('Arial'), local('Helvetica'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: local('Arial'), local('Helvetica'); }
    </style>
  `;
  html = html.replace('</head>', fontFallback + '</head>');

  // Load from data URL to avoid file:// font loading issues
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });

  // Small delay for CSS to settle
  await page.evaluate(() => new Promise(r => setTimeout(r, 200)));

  // Activate the built-in Export Mode
  const slideCount = await page.evaluate(() => {
    document.body.classList.add('export-mode');
    const wrappers = document.querySelectorAll('.slide-wrapper');
    wrappers.forEach(w => w.classList.remove('active'));
    return wrappers.length;
  });

  if (slideCount === 0) {
    console.log(`  Skipping post-${postNumber}: no .slide-wrapper elements found`);
    return 0;
  }

  const paddedNum = String(postNumber).padStart(3, '0');
  const outputDir = join(OUTPUT_DIR, `post-${paddedNum}`);
  mkdirSync(outputDir, { recursive: true });

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((index) => {
      const wrappers = document.querySelectorAll('.slide-wrapper');
      wrappers.forEach((w, j) => w.classList.toggle('active', j === index));
    }, i);

    // Brief pause for rendering
    await page.evaluate(() => new Promise(r => setTimeout(r, 50)));

    await page.screenshot({
      path: join(outputDir, `slide-${i + 1}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    });
  }

  console.log(`  Rendered post-${paddedNum}: ${slideCount} slide(s)`);
  return slideCount;
}

async function main() {
  const args = process.argv.slice(2);
  const startIdx = args.indexOf('--start');
  const endIdx = args.indexOf('--end');
  const start = startIdx !== -1 ? parseInt(args[startIdx + 1]) : 0;
  const end = endIdx !== -1 ? parseInt(args[endIdx + 1]) : 999;

  console.log('Rendering carousel HTML files to PNG images...');
  console.log(`  Source: ${SOCIAL_DIR}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Dimensions: ${SLIDE_WIDTH}x${SLIDE_HEIGHT} (4:5 Instagram)`);
  console.log(`  Range: post ${start} to ${end}`);
  console.log('');

  if (!existsSync(SOCIAL_DIR)) {
    console.error(`Source directory not found: ${SOCIAL_DIR}`);
    process.exit(1);
  }

  // Find Chrome/Chromium binary
  const chromePaths = [
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  let executablePath = chromePaths.find(p => existsSync(p));
  if (!executablePath) {
    try { executablePath = execSync('which chromium-browser || which chromium || which google-chrome', { encoding: 'utf8' }).trim(); }
    catch { /* ignore */ }
  }
  if (!executablePath) {
    console.error('No Chrome/Chromium found. Install chromium or set CHROME_PATH env var.');
    process.exit(1);
  }
  console.log(`  Browser: ${executablePath}`);

  const puppeteer = await import('puppeteer-core');
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage', '--disable-software-rasterizer',
      '--disable-extensions', '--disable-background-networking',
      '--disable-sync', '--disable-translate',
      '--no-first-run', '--no-zygote', '--single-process',
      '--font-render-hinting=none',
    ],
    protocolTimeout: 120000,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

  const dirs = await new Promise((resolve, reject) => {
    readdir(SOCIAL_DIR, { withFileTypes: true }, (err, entries) => {
      if (err) reject(err);
      else resolve(entries.filter(e => e.isDirectory()).map(e => e.name).sort());
    });
  });

  let totalSlides = 0;
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  const t0 = Date.now();

  for (const dir of dirs) {
    const match = dir.match(/^post-(\d+)$/);
    if (!match) continue;

    const postNumber = parseInt(match[1], 10);
    if (postNumber < start || postNumber > end) continue;

    try {
      const slides = await renderCarousel(page, join(SOCIAL_DIR, dir), postNumber);
      if (slides > 0) {
        totalSlides += slides;
        processed++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  Error rendering ${dir}: ${err.message}`);
      errors++;
    }

    // Progress every 50 posts
    if (processed > 0 && processed % 50 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
      const rate = (processed / (Date.now() - t0) * 1000).toFixed(1);
      console.log(`  Progress: ${processed} posts (${totalSlides} slides) in ${elapsed}s [${rate} posts/sec]`);
    }
  }

  await browser.close();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('');
  console.log(`Done! Rendered ${processed} posts (${totalSlides} slides) in ${elapsed}s`);
  if (skipped > 0) console.log(`  Skipped: ${skipped} (no carousel.html or no slides)`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
