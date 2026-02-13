#!/usr/bin/env node

// Render carousel HTML files to PNG images for Instagram posting
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
const SLIDE_HEIGHT = 1080;

async function renderCarousel(postDir, postNumber) {
  const carouselPath = join(postDir, 'carousel.html');
  if (!existsSync(carouselPath)) {
    console.log(`  Skipping post-${postNumber}: no carousel.html`);
    return 0;
  }

  // Dynamic import of puppeteer (optional dependency)
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

    const fileUrl = `file://${carouselPath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

    // Get all slides (look for common carousel slide selectors)
    const slideCount = await page.evaluate(() => {
      // Try common patterns
      const slides = document.querySelectorAll('.slide, .carousel-slide, [data-slide], section');
      if (slides.length > 1) return slides.length;
      // If no slide elements found, treat as single image
      return 1;
    });

    const paddedNum = String(postNumber).padStart(3, '0');
    const outputDir = join(OUTPUT_DIR, `post-${paddedNum}`);
    mkdirSync(outputDir, { recursive: true });

    if (slideCount === 1) {
      // Single page screenshot
      await page.screenshot({
        path: join(outputDir, 'slide-1.png'),
        type: 'png',
        clip: { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
      });
    } else {
      // Multiple slides - screenshot each
      for (let i = 0; i < slideCount; i++) {
        await page.evaluate((index) => {
          const slides = document.querySelectorAll('.slide, .carousel-slide, [data-slide], section');
          if (slides[index]) {
            slides[index].scrollIntoView();
          }
        }, i);

        await page.screenshot({
          path: join(outputDir, `slide-${i + 1}.png`),
          type: 'png',
          clip: { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
        });
      }
    }

    console.log(`  Rendered post-${paddedNum}: ${slideCount} slide(s)`);
    return slideCount;
  } finally {
    await browser.close();
  }
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
  console.log(`  Range: post ${start} to ${end}`);
  console.log('');

  if (!existsSync(SOCIAL_DIR)) {
    console.error(`Source directory not found: ${SOCIAL_DIR}`);
    process.exit(1);
  }

  const dirs = await new Promise((resolve, reject) => {
    readdir(SOCIAL_DIR, { withFileTypes: true }, (err, entries) => {
      if (err) reject(err);
      else resolve(entries.filter(e => e.isDirectory()).map(e => e.name).sort());
    });
  });

  let totalSlides = 0;
  let processed = 0;

  for (const dir of dirs) {
    const match = dir.match(/^post-(\d+)$/);
    if (!match) continue;

    const postNumber = parseInt(match[1], 10);
    if (postNumber < start || postNumber > end) continue;

    try {
      const slides = await renderCarousel(join(SOCIAL_DIR, dir), postNumber);
      totalSlides += slides;
      processed++;
    } catch (err) {
      console.error(`  Error rendering ${dir}: ${err.message}`);
    }
  }

  console.log(`\nDone! Processed ${processed} posts, ${totalSlides} total slides.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
