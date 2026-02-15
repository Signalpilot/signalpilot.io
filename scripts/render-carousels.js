#!/usr/bin/env node

// Render carousel HTML files to PNG images for Instagram posting
// Uses each carousel's built-in Export Mode for pixel-perfect 1080x1350 slides
//
// Usage: node scripts/render-carousels.js [--start N] [--end N]
// Requires: puppeteer-core (npm install puppeteer-core)

import { readdir, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
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

  let html = readFileSync(carouselPath, 'utf8');

  // Remove Google Fonts link tags — real fonts are installed locally
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // Remove video elements — no video in PNG renders
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

  // Render styles: local fonts + export dimensions + font upscaling for readability
  // NO starfield, NO background overrides — let each carousel's theme show through
  const renderStyles = `
    <style>
      /* ===== Local font declarations ===== */
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 400; src: local('Cormorant Garamond'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 400; src: local('Cormorant Garamond Italic'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; src: local('Cormorant Garamond Medium'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 600; src: local('Cormorant Garamond SemiBold'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 700; src: local('Cormorant Garamond Bold'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 500; src: local('Cormorant Garamond Medium Italic'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 300; src: local('Inter Light'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: local('Inter'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: local('Inter Medium'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: local('Inter SemiBold'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: local('Inter Bold'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 400; src: local('JetBrains Mono'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 500; src: local('JetBrains Mono Medium'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 600; src: local('JetBrains Mono SemiBold'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 700; src: local('JetBrains Mono Bold'); }
      @font-face { font-family: 'Gugi'; font-style: normal; font-weight: 400; src: url('file:///usr/local/share/fonts/Gugi-Regular.ttf') format('truetype'), local('Gugi'); }

      /* ===== Export mode: exact Instagram dimensions ===== */
      body.export-mode {
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Force slide-wrapper to exact Instagram dimensions — NO background override */
      body.export-mode .slide-wrapper {
        container-type: inline-size !important;
        width: 1080px !important;
        height: 1350px !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Ensure intermediate .slide div fills wrapper — ONLY target .slide class */
      body.export-mode .slide-wrapper > .slide {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
      }

      /* Center slide content */
      .slide-content {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
        width: 100% !important;
        height: 100% !important;
        padding: 6% 8% !important;
        box-sizing: border-box !important;
      }

      /* ===== Font upscaling for Instagram readability ===== */

      /* Titles — big and centered */
      .slide-title, .header, .hook-main, .hook-title {
        font-size: clamp(36px, 8cqw, 56px) !important;
        margin-bottom: 4% !important;
        text-align: center !important;
        width: 100% !important;
      }
      .slide-title.large {
        font-size: clamp(40px, 9cqw, 64px) !important;
      }

      /* Section titles (h2/h3 inside slide-content) */
      .slide-content h2, .slide-content h3,
      .section-title {
        font-size: clamp(32px, 8cqw, 52px) !important;
        text-align: center !important;
      }

      /* Body text */
      .slide-body, .text {
        font-size: clamp(24px, 6cqw, 36px) !important;
        line-height: 1.65 !important;
        max-width: 95% !important;
        text-align: center !important;
      }

      /* Subtitles */
      .slide-subtitle, .hook-sub {
        font-size: clamp(20px, 5cqw, 30px) !important;
        letter-spacing: 3px !important;
        text-align: center !important;
      }

      /* Paragraphs and lists inside slide-content */
      .slide-content p {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        text-align: center !important;
      }
      .slide-content ul, .slide-content ol {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        max-width: 95% !important;
      }

      /* Combo titles and descriptions */
      .combo-title {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 700 !important;
      }
      .combo-desc {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }
      .combo-arrows, .combo-emojis {
        font-size: clamp(40px, 10cqw, 64px) !important;
      }

      /* Signal items */
      .signal-item .label, .signal-item .name {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .signal-item .arrow, .signal-item .icon {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }

      /* Divergence boxes */
      .divergence-title, .divergence-label {
        font-size: clamp(24px, 6cqw, 36px) !important;
        font-weight: 700 !important;
      }
      .divergence-desc {
        font-size: clamp(18px, 5cqw, 28px) !important;
      }

      /* Icons */
      .slide-icon, .icon {
        font-size: clamp(48px, 14cqw, 72px) !important;
        text-align: center !important;
      }

      /* Checklists */
      .checklist {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        line-height: 1.8 !important;
        text-align: left !important;
        max-width: 95% !important;
      }
      .checklist li {
        font-size: inherit !important;
        margin-bottom: 2% !important;
      }

      /* CTA elements */
      .cta-link, .cta-button {
        padding: 4% 8% !important;
        font-size: clamp(20px, 5cqw, 28px) !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
      }
      .cta-text, .cta-title {
        font-size: clamp(30px, 8cqw, 48px) !important;
        font-family: 'Cormorant Garamond', serif !important;
        font-weight: 600 !important;
        text-align: center !important;
      }
      .link-hint {
        font-size: clamp(16px, 4cqw, 24px) !important;
        margin-top: 3% !important;
        text-align: center !important;
      }

      /* Brand mark — Gugi font, centered at bottom */
      .brand-mark, .logo, .cine-logo {
        font-family: 'Gugi', sans-serif !important;
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 4px !important;
      }
      .brand-mark {
        position: absolute !important;
        bottom: 5% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        right: auto !important;
        text-align: center !important;
        width: auto !important;
      }
      .slide-1 .cine-logo {
        left: 50% !important;
        transform: translateX(-50%) !important;
      }

      /* ===== Hide non-slide UI ===== */
      .export-nav, .slide-nav, .nav-controls {
        display: none !important;
      }
      .slide-number, .slide-indicator {
        display: none !important;
      }
      .controls, .slide-label, .page-title {
        display: none !important;
      }
      .slide-wrapper {
        margin: 0 !important;
        padding: 0 !important;
      }

      /* ===== Component overrides for readability ===== */

      .combo-box {
        max-width: 95% !important;
        padding: 6% !important;
        text-align: center !important;
      }
      .signal-grid {
        max-width: 95% !important;
        gap: 16px !important;
      }
      .signal-item {
        padding: 5% 4% !important;
      }
      .divergence-box {
        max-width: 95% !important;
        padding: 7% !important;
        text-align: center !important;
      }

      /* Arrow lists */
      .arrow-list {
        font-size: clamp(24px, 6cqw, 36px) !important;
        line-height: 1.6 !important;
        max-width: 95% !important;
        text-align: left !important;
      }
      .arrow-list li {
        font-size: inherit !important;
        margin-bottom: 3% !important;
        gap: 3% !important;
      }
      .arrow-list .arrow {
        font-size: inherit !important;
      }

      /* Callout boxes */
      .callout-box {
        max-width: 95% !important;
        padding: 5% 6% !important;
      }
      .callout-box .callout-title {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .callout-box .callout-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.6 !important;
      }

      /* Concept cards */
      .concept-card {
        max-width: 95% !important;
        padding: 5% 6% !important;
      }
      .concept-card .card-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .concept-card .card-title {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .concept-card .card-desc {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Data grid items */
      .data-grid {
        max-width: 95% !important;
      }
      .data-item .item-icon {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .data-item .item-value {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .data-item .item-label {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
        line-height: 1.4 !important;
      }

      /* Quote blocks */
      .quote-block {
        font-size: clamp(32px, 8cqw, 52px) !important;
        line-height: 1.5 !important;
        max-width: 90% !important;
      }
      .quote-attr {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }

      /* Step flows */
      .step-flow {
        max-width: 95% !important;
      }
      .step-num {
        font-size: clamp(32px, 8cqw, 52px) !important;
        font-weight: 600 !important;
      }
      .step-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Stat values */
      .stat-value {
        font-size: clamp(36px, 9cqw, 56px) !important;
        font-weight: 600 !important;
      }
      .stat-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* Compare grids */
      .compare-grid {
        max-width: 95% !important;
      }
      .compare-item .compare-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .compare-item .compare-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Indicator pills */
      .indicator-pill {
        font-size: clamp(20px, 5cqw, 30px) !important;
        padding: 2% 5% !important;
      }
    </style>
  `;
  html = html.replace('</head>', renderStyles + '</head>');

  // Write to temp file so file:// URLs resolve correctly
  const { writeFileSync, unlinkSync } = await import('fs');
  const tmpHtml = join(postDir, '_render_temp.html');
  writeFileSync(tmpHtml, html);
  await page.goto(`file://${tmpHtml}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  try { unlinkSync(tmpHtml); } catch {}

  // Delay for fonts to load
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

  // Activate Export Mode and fix branding text
  const slideCount = await page.evaluate(() => {
    document.body.classList.add('export-mode');

    // Convert <img> logo elements to text spans (fixes broken image icon)
    document.querySelectorAll('img.logo, img.cine-logo, img.brand-mark').forEach(img => {
      const span = document.createElement('span');
      span.className = 'brand-mark';
      span.textContent = 'SIGNAL PILOT';
      img.parentNode.replaceChild(span, img);
    });

    // Fix "SignalPilot" → "Signal Pilot" and "SIGNALPILOT" → "SIGNAL PILOT"
    document.querySelectorAll('.cine-logo, .brand-mark, .logo, .brand-footer, .cta-button').forEach(el => {
      el.textContent = el.textContent
        .replace(/SignalPilot/g, 'Signal Pilot')
        .replace(/SIGNALPILOT/g, 'SIGNAL PILOT');
    });

    // Inject "SIGNAL PILOT" branding on EVERY slide that doesn't already have it
    document.querySelectorAll('.slide-wrapper').forEach(w => {
      if (!w.querySelector('.brand-mark, .cine-logo, .brand-footer')) {
        const container = w.querySelector('.slide-content') || w;
        const brand = document.createElement('span');
        brand.className = 'brand-mark';
        brand.textContent = 'SIGNAL PILOT';
        container.appendChild(brand);
      }
    });

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

  // Clean up stale PNGs from previous renders
  if (existsSync(outputDir)) {
    const oldFiles = readdirSync(outputDir).filter(f => /^slide-\d+\.png$/.test(f));
    for (const f of oldFiles) {
      const slideNum = parseInt(f.match(/slide-(\d+)/)[1], 10);
      if (slideNum > slideCount) {
        unlinkSync(join(outputDir, f));
      }
    }
  }

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
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, deviceScaleFactor: 1 });

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
