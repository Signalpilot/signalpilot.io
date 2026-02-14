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
const STARFIELD_PATH = join(ROOT, 'assets', 'images', 'starfield-bg-frame.png');

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

// Pre-load starfield as base64 for injection into slides 2+
let starfieldBase64 = '';
if (existsSync(STARFIELD_PATH)) {
  starfieldBase64 = readFileSync(STARFIELD_PATH).toString('base64');
}

async function renderCarousel(page, postDir, postNumber) {
  const carouselPath = join(postDir, 'carousel.html');
  if (!existsSync(carouselPath)) {
    console.log(`  Skipping post-${postNumber}: no carousel.html`);
    return 0;
  }

  let html = readFileSync(carouselPath, 'utf8');

  // Remove Google Fonts link tags — real fonts are installed locally
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // Remove video elements — replaced with starfield PNG background
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

  // Inject render enhancements: real fonts, starfield bg, tighter layout, stronger CTA
  const renderStyles = `
    <style>
      /* ===== FIX 1: Real fonts (Cormorant Garamond + Inter installed locally) ===== */
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 400; src: local('Cormorant Garamond'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 400; src: local('Cormorant Garamond Italic'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; src: local('Cormorant Garamond Medium'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 600; src: local('Cormorant Garamond SemiBold'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 300; src: local('Inter Light'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: local('Inter'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: local('Inter Medium'); }
      @font-face { font-family: 'Gugi'; font-style: normal; font-weight: 400; src: local('Gugi'); }

      /* ===== FIX 2: Starfield background on slides 2+ (not slide 1 — kept clean for IG grid) ===== */
      /* Note: .slide-1 class is on child element in 88% of posts, so we use
         index-based JS injection + .has-starfield class instead of :not(.slide-1) */
      .slide-wrapper.has-starfield {
        position: relative !important;
      }
      .slide-wrapper.has-starfield .starfield-bg {
        position: absolute !important;
        inset: 0 !important;
        background-image: url('file://${STARFIELD_PATH}') !important;
        background-size: cover !important;
        background-position: center !important;
        opacity: 0.30 !important;
        pointer-events: none !important;
        z-index: 1 !important;
      }
      .slide-wrapper.has-starfield .slide-content {
        z-index: 2 !important;
      }
      /* Safety net: absolutely no starfield on the first slide wrapper */
      .slide-wrapper:first-child .starfield-bg {
        display: none !important;
      }

      /* ===== FIX 3: Tighter layout — less padding, bigger text ===== */
      .slide-wrapper .slide-content {
        padding: 6% !important;
      }
      .slide-title {
        font-size: clamp(22px, 8cqw, 34px) !important;
        margin-bottom: 4% !important;
      }
      .slide-title.large {
        font-size: clamp(26px, 9cqw, 38px) !important;
      }
      .slide-body {
        font-size: clamp(14px, 4.5cqw, 18px) !important;
        line-height: 1.6 !important;
        max-width: 95% !important;
      }
      .slide-subtitle {
        font-size: clamp(11px, 3.8cqw, 15px) !important;
        letter-spacing: 4px !important;
      }
      .slide-icon {
        font-size: clamp(32px, 11cqw, 52px) !important;
      }

      /* ===== FIX 4: Stronger CTA slides ===== */
      .cta-link, .cta-button {
        padding: 4% 8% !important;
        font-size: clamp(13px, 4cqw, 16px) !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
      }
      .cta-text, .cta-title {
        font-size: clamp(20px, 7cqw, 28px) !important;
        font-family: 'Cormorant Garamond', serif !important;
        font-weight: 600 !important;
      }
      .link-hint {
        font-size: clamp(11px, 3.5cqw, 14px) !important;
        margin-top: 3% !important;
      }
      .brand-mark, .logo, .cine-logo {
        font-family: 'Gugi', sans-serif !important;
        font-size: clamp(11px, 3.5cqw, 14px) !important;
        letter-spacing: 4px !important;
      }

      /* Combo boxes and signal grids — fill more space */
      .combo-box {
        max-width: 95% !important;
        padding: 6% !important;
      }
      .signal-grid {
        max-width: 95% !important;
      }
      .divergence-box {
        max-width: 95% !important;
        padding: 7% !important;
      }
    </style>
  `;
  html = html.replace('</head>', renderStyles + '</head>');

  // Write to temp file so file:// URLs (starfield bg) resolve correctly
  const { writeFileSync, unlinkSync } = await import('fs');
  const tmpHtml = join(postDir, '_render_temp.html');
  writeFileSync(tmpHtml, html);
  await page.goto(`file://${tmpHtml}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  try { unlinkSync(tmpHtml); } catch {}

  // Delay for fonts + background image to load
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

  // Activate Export Mode and inject starfield backgrounds on slides 2+
  const slideCount = await page.evaluate(() => {
    document.body.classList.add('export-mode');
    const wrappers = document.querySelectorAll('.slide-wrapper');
    wrappers.forEach((w, i) => {
      w.classList.remove('active');
      // Inject starfield div into slides 2+ only (i > 0 = not first slide)
      // Using index instead of class because .slide-1 is on child element in 88% of posts
      if (i > 0 && !w.querySelector('.starfield-bg')) {
        w.classList.add('has-starfield');
        const bg = document.createElement('div');
        bg.className = 'starfield-bg';
        w.insertBefore(bg, w.firstChild);
      }
    });
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
      '--font-render-hinting=none', '--allow-file-access-from-files',
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
