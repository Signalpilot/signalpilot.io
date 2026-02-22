#!/usr/bin/env node
/**
 * Story PNG Generator
 *
 * Converts story text into static PNG images for Instagram Stories
 * Using Sharp (built-in) for fast, efficient image generation
 *
 * Usage:
 *   node scripts/render-stories-to-images.js              # Generate all
 *   node scripts/render-stories-to-images.js --force     # Re-generate all
 *   node scripts/render-stories-to-images.js 0-10        # Generate stories 0-10
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

function getOutputPath(storyNumber) {
  const padded = String(storyNumber).padStart(3, '0');
  const outputDir = path.join(projectRoot, 'assets', 'social', 'stories');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return path.join(outputDir, `story-${padded}.png`);
}

/**
 * Create SVG for the story image
 * Instagram Story dimensions: 1080x1920
 */
function createStorySVG(text) {
  // Escape special XML characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Measure text (rough estimate for fitting)
  const lines = [];
  let currentLine = '';
  const words = escapedText.split(' ');
  const maxCharsPerLine = 20; // Average chars per line

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Build text elements (centered)
  const lineHeight = 90;
  const totalHeight = lines.length * lineHeight;
  const startY = Math.max(400, 960 - totalHeight / 2);

  let textElements = '';
  lines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;
    textElements += `
      <text
        x="540"
        y="${y}"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="60"
        font-weight="bold"
        fill="white"
        text-shadow="0 2px 10px rgba(0,0,0,0.8)"
      >
        ${line}
      </text>
    `;
  });

  return `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1080" height="1920" fill="#0a0e27"/>

      <!-- Gradient overlay -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgba(0,0,0,0);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.6);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#grad)"/>

      <!-- Text -->
      ${textElements}

      <!-- Branding footer -->
      <text
        x="540"
        y="1820"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="16"
        font-weight="600"
        fill="#00d9ff"
        opacity="0.8"
      >
        🔗 LINK IN BIO
      </text>
    </svg>
  `;
}

/**
 * Generate PNG for a single story
 */
async function generateStory(storyNumber, story, force = false) {
  const outputPath = getOutputPath(storyNumber);

  // Skip if exists (unless --force)
  if (!force && fs.existsSync(outputPath)) {
    log(`Already rendered: story-${String(storyNumber).padStart(3, '0')}.png (use --force to re-render)`, 'progress');
    return { status: 'skipped', storyNumber };
  }

  try {
    const svg = createStorySVG(story.text);

    await sharp(Buffer.from(svg))
      .png({ quality: 85 })
      .toFile(outputPath);

    const sizeMB = Math.round(fs.statSync(outputPath).size / 1024 * 10) / 10;
    log(`✅ Rendered: story-${String(storyNumber).padStart(3, '0')}.png (${sizeMB}KB)`, 'info');

    return { status: 'success', storyNumber };
  } catch (err) {
    log(`Failed to render story ${storyNumber}: ${err.message}`, 'error');
    return { status: 'failed', storyNumber, reason: err.message };
  }
}

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    stories: null,
    force: false,
  };

  for (const arg of args) {
    if (arg === '--force') {
      options.force = true;
    } else if (/^\d+$/.test(arg)) {
      options.stories = [parseInt(arg)];
    } else if (arg.includes('-')) {
      const [start, end] = arg.split('-').map(Number);
      options.stories = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }

  return options;
}

/**
 * Main
 */
async function main() {
  const options = parseArgs();
  const stories = loadStories();

  log('=== Story PNG Generator ===');

  let storiesToRender = [];

  if (options.stories) {
    storiesToRender = options.stories.filter((num) => num < stories.length);
  } else {
    // Default: all stories
    storiesToRender = Array.from({ length: stories.length }, (_, i) => i);
  }

  if (storiesToRender.length === 0) {
    log('No stories to render', 'warn');
    process.exit(0);
  }

  log(`Rendering ${storiesToRender.length} Story images...`);

  const results = { success: 0, skipped: 0, failed: 0 };
  let processed = 0;

  for (const storyNum of storiesToRender) {
    const story = stories[storyNum];
    if (!story) continue;

    const result = await generateStory(storyNum, story, options.force);
    results[result.status]++;
    processed++;

    // Progress indicator
    if (processed % 50 === 0) {
      log(`Progress: ${processed}/${storiesToRender.length}`, 'progress');
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

  log(`\nStories saved to: ${outputDir}`);
  log(`Total size: ${Math.round(totalSize / 1024 / 1024 * 10) / 10} MB`);
  log('\nNext steps:');
  log('  1. Review the stories in assets/social/stories/');
  log('  2. Commit: git add assets/social/stories/ && git commit -m "Add Story images"');
  log('  3. Push: git push origin claude/fix-instagram-queue-robot-VVE9I');

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
