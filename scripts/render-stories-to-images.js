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
 * Create premium SVG for the story image
 * Instagram Story dimensions: 1080x1920
 * Uses Signal Pilot brand colors and modern design principles
 */
function createStorySVG(text) {
  // Escape special XML characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Smart word wrapping for better typography
  const lines = [];
  let currentLine = '';
  const words = escapedText.split(' ');
  const maxCharsPerLine = 22;

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Calculate optimal positioning for 1-4 lines
  let startY, lineHeight, fontSize;
  if (lines.length === 1) {
    fontSize = 76;
    lineHeight = 100;
    startY = 920;
  } else if (lines.length === 2) {
    fontSize = 68;
    lineHeight = 100;
    startY = 850;
  } else if (lines.length === 3) {
    fontSize = 58;
    lineHeight = 95;
    startY = 800;
  } else {
    fontSize = 52;
    lineHeight = 90;
    startY = 760;
  }

  // Build text elements with premium styling
  let textElements = '';
  lines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;

    // Alternate text effects for visual interest
    const useGradient = idx % 2 === 0;
    const shadowIntensity = idx === 0 ? '0 8px 24px rgba(91, 138, 255, 0.4)' : '0 4px 12px rgba(0,0,0,0.6)';

    if (useGradient) {
      // Gradient text effect for primary lines
      textElements += `
        <defs>
          <linearGradient id="textGrad${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#5b8aff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#76ddff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7ccaff;stop-opacity:1" />
          </linearGradient>
        </defs>
      `;
      textElements += `
        <text
          x="540"
          y="${y}"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          fill="url(#textGrad${idx})"
          style="letter-spacing: -1px; text-shadow: ${shadowIntensity}"
          opacity="0.95"
        >
          ${line}
        </text>
      `;
    } else {
      // White text with enhanced shadow for supporting lines
      textElements += `
        <text
          x="540"
          y="${y}"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="700"
          fill="white"
          style="letter-spacing: -0.5px; text-shadow: ${shadowIntensity}"
          opacity="0.95"
        >
          ${line}
        </text>
      `;
    }
  });

  // Create SVG with brand styling
  return `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Signal Pilot brand gradient background -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#05070d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0c111c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#101626;stop-opacity:1" />
        </linearGradient>

        <!-- Accent border gradient -->
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5b8aff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#76ddff;stop-opacity:1" />
        </linearGradient>

        <!-- Top-to-bottom overlay for depth -->
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(91, 138, 255, 0.15);stop-opacity:1" />
          <stop offset="40%" style="stop-color:rgba(0,0,0,0.05);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.4);stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Dark navy background with gradient -->
      <rect width="1080" height="1920" fill="url(#bgGrad)"/>

      <!-- Subtle grid pattern for tech vibe -->
      <g stroke="#5b8aff" stroke-width="0.5" opacity="0.08">
        <line x1="0" y1="0" x2="1080" y2="0" />
        <line x1="0" y1="60" x2="1080" y2="60" />
        <line x1="0" y1="120" x2="1080" y2="120" />
        <line x1="0" y1="180" x2="1080" y2="180" />
        <line x1="0" y1="240" x2="1080" y2="240" />
      </g>

      <!-- Top accent bar -->
      <rect x="0" y="0" width="1080" height="4" fill="url(#accentGrad)" opacity="0.6"/>

      <!-- Depth overlay -->
      <rect width="1080" height="1920" fill="url(#overlay)"/>

      <!-- Main text content -->
      ${textElements}

      <!-- Bottom accent card -->
      <g>
        <!-- Card background with subtle border -->
        <rect x="40" y="1760" width="1000" height="140" rx="16" fill="#0c111c" stroke="url(#accentGrad)" stroke-width="2" opacity="0.9"/>

        <!-- Branding text -->
        <text
          x="540"
          y="1810"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="18"
          font-weight="700"
          fill="#76ddff"
          letter-spacing="1"
        >
          SIGNAL PILOT
        </text>

        <!-- CTA text -->
        <text
          x="540"
          y="1850"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="14"
          font-weight="500"
          fill="#ffffff"
          opacity="0.8"
        >
          TAP BIO FOR EDGE
        </text>
      </g>

      <!-- Decorative corner accents (top-right) -->
      <circle cx="1040" cy="40" r="8" fill="#76ddff" opacity="0.6"/>
      <circle cx="1000" cy="40" r="4" fill="#76ddff" opacity="0.4"/>

      <!-- Decorative corner accents (bottom-left) -->
      <circle cx="40" cy="1880" r="6" fill="#3ed598" opacity="0.4"/>
      <circle cx="70" cy="1880" r="3" fill="#3ed598" opacity="0.3"/>
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
