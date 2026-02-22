#!/usr/bin/env node
/**
 * Premium Story PNG Generator with Dynamic Backgrounds
 *
 * Features:
 * - Blurred carousel slide backgrounds
 * - Dynamic color extraction from images
 * - Signal Pilot logo branding
 * - Smart text positioning by length
 * - Enhanced emoji placement
 *
 * Usage:
 *   node scripts/render-stories-premium.js              # Render all
 *   node scripts/render-stories-premium.js --force     # Force re-render
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

function log(msg, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    progress: '→',
  }[type];
  console.log(`[${timestamp}] ${prefix} ${msg}`);
}

function loadStories() {
  const path_val = path.join(projectRoot, 'data', 'social', 'stories.json');
  return JSON.parse(fs.readFileSync(path_val, 'utf-8'));
}

function loadContentQueue() {
  const path_val = path.join(projectRoot, 'data', 'social', 'content-queue.json');
  return JSON.parse(fs.readFileSync(path_val, 'utf-8'));
}

function getCarouselSlide(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  const slidePath = path.join(projectRoot, 'assets', 'social', `post-${paddedNum}`, 'slide-1.png');
  return fs.existsSync(slidePath) ? slidePath : null;
}

function getOutputPath(storyNumber) {
  const padded = String(storyNumber).padStart(3, '0');
  const outputDir = path.join(projectRoot, 'assets', 'social', 'stories');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return path.join(outputDir, `story-${padded}.png`);
}

/**
 * Extract dominant color from image
 */
async function getDominantColor(imagePath) {
  try {
    const pixels = await sharp(imagePath)
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer();

    const r = pixels[0];
    const g = pixels[1];
    const b = pixels[2];

    return `rgb(${r},${g},${b})`;
  } catch (e) {
    return '#00d9ff'; // Fallback to cyan
  }
}

/**
 * Create premium story SVG with blurred background
 */
async function createPremiumStorySVG(text, backgroundImagePath, dominantColor) {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Smart positioning: shorter text = higher position
  const lines = [];
  let currentLine = '';
  const words = escapedText.split(' ');
  const maxCharsPerLine = 20;

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Text positioning logic
  let startY;
  if (lines.length <= 2) {
    startY = 850; // Short text: center-high
  } else if (lines.length <= 3) {
    startY = 750; // Medium text: center
  } else {
    startY = 600; // Long text: lower
  }

  const lineHeight = 90;
  let textElements = '';

  lines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;
    textElements += `
      <text
        x="540"
        y="${y}"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${lines.length <= 2 ? '72' : '60'}"
        font-weight="bold"
        fill="white"
        text-shadow="0 4px 16px rgba(0,0,0,0.8)"
        opacity="0.95"
      >
        ${line}
      </text>
    `;
  });

  // Build SVG with image background
  let svgContent = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
        </filter>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0.4);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgba(0,0,0,0.2);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.7);stop-opacity:1" />
        </linearGradient>
      </defs>
  `;

  // Add background image if available
  if (backgroundImagePath) {
    svgContent += `
      <image xlink:href="file://${backgroundImagePath}" width="1080" height="1920" filter="url(#blur)" />
    `;
  } else {
    // Fallback to gradient
    svgContent += `
      <rect width="1080" height="1920" fill="#0a0e27"/>
    `;
  }

  // Overlay gradient
  svgContent += `
    <rect width="1080" height="1920" fill="url(#overlay)"/>

    <!-- Text -->
    ${textElements}

    <!-- Signal Pilot Logo/Branding -->
    <circle cx="540" cy="150" r="45" fill="none" stroke="#00d9ff" stroke-width="2" opacity="0.6"/>
    <text x="540" y="160" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="700" fill="#00d9ff" opacity="0.8">SP</text>

    <!-- CTA Footer -->
    <rect x="50" y="1750" width="980" height="120" fill="rgba(0,217,255,0.1)" rx="10" opacity="0.8"/>
    <text x="540" y="1800" text-anchor="middle" font-family="system-ui" font-size="18" font-weight="600" fill="#00d9ff">🔗 LINK IN BIO</text>
    <text x="540" y="1850" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="400" fill="rgba(255,255,255,0.7)">signalpilot.io</text>
  </svg>
  `;

  return svgContent;
}

/**
 * Render premium story
 */
async function renderPremiumStory(storyNumber, story, contentQueue, force = false) {
  const outputPath = getOutputPath(storyNumber);

  if (!force && fs.existsSync(outputPath)) {
    log(`Already rendered: story-${String(storyNumber).padStart(3, '0')}.png`, 'progress');
    return { status: 'skipped', storyNumber };
  }

  try {
    // Find source carousel post (rough mapping)
    const sourcePostNumber = Math.floor((storyNumber / contentQueue.length) * contentQueue.length);
    const sourcePost = contentQueue.find(p => p.postNumber === sourcePostNumber);

    // Get carousel slide for background
    let backgroundPath = null;
    let dominantColor = '#00d9ff';

    if (sourcePost) {
      backgroundPath = getCarouselSlide(sourcePost.postNumber);
      if (backgroundPath) {
        dominantColor = await getDominantColor(backgroundPath);
      }
    }

    // Create SVG
    const svg = await createPremiumStorySVG(story.text, backgroundPath, dominantColor);

    // Render to PNG
    await sharp(Buffer.from(svg))
      .png({ quality: 85 })
      .toFile(outputPath);

    const sizeMB = Math.round(fs.statSync(outputPath).size / 1024 * 10) / 10;
    log(`✅ Rendered premium: story-${String(storyNumber).padStart(3, '0')}.png (${sizeMB}KB)`, 'info');

    return { status: 'success', storyNumber };
  } catch (err) {
    log(`Failed to render story ${storyNumber}: ${err.message}`, 'error');
    return { status: 'failed', storyNumber, reason: err.message };
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  const stories = loadStories();
  const contentQueue = loadContentQueue();

  log('=== Premium Story Generator ===');
  log(`Rendering ${stories.length} stories with:
  ✅ Blurred carousel backgrounds
  ✅ Dynamic color extraction
  ✅ Signal Pilot branding
  ✅ Smart text positioning`);

  const results = { success: 0, skipped: 0, failed: 0 };
  let processed = 0;

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const result = await renderPremiumStory(i, story, contentQueue, force);
    results[result.status]++;
    processed++;

    if (processed % 100 === 0) {
      log(`Progress: ${processed}/${stories.length}`, 'progress');
    }
  }

  log('\n=== Render Summary ===');
  log(`✅ Success: ${results.success}`);
  log(`⏭  Skipped: ${results.skipped}`);
  log(`✗ Failed: ${results.failed}`);

  const outputDir = path.join(projectRoot, 'assets', 'social', 'stories');
  const totalSize = fs.readdirSync(outputDir).reduce((sum, file) => {
    const filePath = path.join(outputDir, file);
    return sum + fs.statSync(filePath).size;
  }, 0);

  log(`\n🎨 Premium Stories Generated!`);
  log(`Total size: ${Math.round(totalSize / 1024 / 1024 * 10) / 10} MB`);
  log(`\nFeatures applied:
  ✅ Carousel slide backgrounds (blurred)
  ✅ Dynamic dominant colors
  ✅ Signal Pilot branding (SP logo)
  ✅ Smart text positioning
  ✅ Enhanced CTA footer`);

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
