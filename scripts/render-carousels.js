#!/usr/bin/env node

// Render carousel HTML files to PNG images for Instagram posting
// Uses each carousel's built-in Export Mode for pixel-perfect 1080x1350 slides
//
// Usage: node scripts/render-carousels.js [--start N] [--end N]
// Requires: puppeteer (npm install puppeteer)

import { readdir, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

  const fileUrl = `file://${carouselPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Activate the built-in Export Mode
  const slideCount = await page.evaluate(() => {
    document.body.classList.add('export-mode');
    const wrappers = document.querySelectorAll('.slide-wrapper');
    // Hide all slides first
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
    // Show only the current slide via the export mode active class
    await page.evaluate((index) => {
      const wrappers = document.querySelectorAll('.slide-wrapper');
      wrappers.forEach((w, j) => w.classList.toggle('active', j === index));
    }, i);

    // Brief pause for any CSS transitions / font rendering
    await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

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

  // Launch browser once and reuse across all posts
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
  }

  await browser.close();

  console.log('');
  console.log(`Done! Rendered ${processed} posts (${totalSlides} slides)`);
  if (skipped > 0) console.log(`  Skipped: ${skipped} (no carousel.html or no slides)`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
