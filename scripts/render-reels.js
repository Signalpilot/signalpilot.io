#!/usr/bin/env node
/**
 * Batch Reel Renderer
 *
 * Generates Instagram Reels from carousel post data
 * Usage:
 *   node scripts/render-reels.js                  # Render all posts with Instagram content
 *   node scripts/render-reels.js 35              # Render specific post number
 *   node scripts/render-reels.js 30-40           # Render range
 *   node scripts/render-reels.js --force         # Force re-render existing files
 *   node scripts/render-reels.js --list          # List which posts will be rendered
 *
 * Requirements:
 *   - ffmpeg installed (npm install will fetch binary)
 *   - Carousel images at: assets/social/post-XXX/slide-1.png through slide-10.png
 *   - Content queue at: data/social/content-queue.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// ============================================================================
// UTILITIES
// ============================================================================

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

function getContentQueue() {
  const queuePath = path.join(projectRoot, 'data', 'social', 'content-queue.json');
  return JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
}

function getCarouselSlides(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  const slideDir = path.join(projectRoot, 'assets', 'social', `post-${paddedNum}`);

  const slides = [];
  for (let i = 1; i <= 10; i++) {
    const slidePath = path.join(slideDir, `slide-${i}.png`);
    if (!fs.existsSync(slidePath)) break;
    slides.push(slidePath);
  }

  return slides;
}

function getOutputPath(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  const outputDir = path.join(projectRoot, 'assets', 'social', 'reels');

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return path.join(outputDir, `post-${paddedNum}.mp4`);
}

/**
 * Render a single Reel using Remotion CLI
 * This requires Remotion to be installed locally
 */
async function renderReel(postNumber, post, slides, force = false) {
  const outputPath = getOutputPath(postNumber);

  // Skip if already exists (unless --force)
  if (!force && fs.existsSync(outputPath)) {
    log(`Already rendered: post-${String(postNumber).padStart(3, '0')}.mp4 (use --force to re-render)`, 'progress');
    return { status: 'skipped', postNumber };
  }

  if (slides.length < 2) {
    log(`Post ${postNumber}: Not enough carousel slides (need at least 2, has ${slides.length})`, 'warn');
    return { status: 'failed', postNumber, reason: 'insufficient_slides' };
  }

  try {
    log(`Rendering post ${postNumber} (${slides.length} slides)...`, 'progress');

    // Build Remotion render command
    const slideUrls = slides
      .map((slide) => {
        // Convert absolute path to file:// URL
        return `file://${slide}`;
      })
      .join(',');

    const caption = post.instagram?.caption || '';
    const hookText = caption.split('\n').slice(0, 2).join(' ').substring(0, 60) + '...';

    // Use npx remotion render to render the composition
    const cmd = [
      `npx remotion render`,
      `./remotion/ReelComposition.jsx`,
      `InstagramReel`,
      `"${outputPath}"`,
      `--props='${JSON.stringify({
        postNumber,
        carouselSlides: slides,
        hookText,
        caption,
        backgroundColor: '#0a0e27',
        accentColor: '#00d9ff',
      }).replace(/'/g, '"')}'`,
      `--concurrency=4`,
      `--pixel-format=yuv420p`, // For Instagram compatibility
    ].join(' ');

    // Execute render
    execSync(cmd, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: '/bin/bash',
    });

    log(`✅ Rendered: post-${String(postNumber).padStart(3, '0')}.mp4 (${Math.round(fs.statSync(outputPath).size / 1024 / 1024 * 10) / 10}MB)`, 'info');

    return { status: 'success', postNumber, size: fs.statSync(outputPath).size };
  } catch (err) {
    log(`Failed to render post ${postNumber}: ${err.message}`, 'error');
    return { status: 'failed', postNumber, reason: err.message };
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    posts: null,
    force: false,
    listOnly: false,
  };

  for (const arg of args) {
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--list') {
      options.listOnly = true;
    } else if (/^\d+$/.test(arg)) {
      // Single post number
      options.posts = [parseInt(arg)];
    } else if (arg.includes('-')) {
      // Range like 30-40
      const [start, end] = arg.split('-').map(Number);
      options.posts = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }

  return options;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();
  const queue = getContentQueue();

  log('=== Instagram Reel Batch Renderer ===');

  // Determine which posts to render
  let postsToRender = [];

  if (options.posts) {
    // User specified specific posts
    postsToRender = options.posts.filter((num) => {
      const post = queue.find((p) => p.postNumber === num);
      return post && post.instagram && post.instagram.slideCount >= 2;
    });
  } else {
    // Auto-detect: all posts with Instagram carousel content
    postsToRender = queue
      .filter((post) => post.instagram && post.instagram.slideCount >= 2)
      .map((post) => post.postNumber);
  }

  if (postsToRender.length === 0) {
    log('No posts found with carousel content. Exiting.', 'warn');
    process.exit(0);
  }

  // List mode: just show what would be rendered
  if (options.listOnly) {
    log(`Would render ${postsToRender.length} posts:`);
    postsToRender.forEach((num) => {
      const post = queue.find((p) => p.postNumber === num);
      const slides = getCarouselSlides(num);
      const paddedNum = String(num).padStart(3, '0');
      const outputPath = getOutputPath(num);
      const exists = fs.existsSync(outputPath);
      console.log(
        `  post-${paddedNum}: ${post.title} (${slides.length} slides) ${exists ? '✓ exists' : '(new)'}`
      );
    });
    process.exit(0);
  }

  // Verify carousel images exist
  log(`Checking ${postsToRender.length} posts for carousel images...`);
  const validPosts = [];
  for (const postNum of postsToRender) {
    const slides = getCarouselSlides(postNum);
    if (slides.length >= 2) {
      validPosts.push(postNum);
    } else {
      log(
        `Post ${postNum}: Missing carousel images (found ${slides.length}/10 slides, skipping)`,
        'warn'
      );
    }
  }

  if (validPosts.length === 0) {
    log('No posts with complete carousel images found. Exiting.', 'error');
    process.exit(1);
  }

  log(`✓ Found ${validPosts.length} posts ready to render`);
  log('Starting render process...\n');

  // Render each post
  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
  };

  for (const postNum of validPosts) {
    const post = queue.find((p) => p.postNumber === postNum);
    const slides = getCarouselSlides(postNum);
    const result = await renderReel(postNum, post, slides, options.force);

    results[result.status]++;
  }

  // Summary
  log('\n=== Render Summary ===');
  log(`✅ Success: ${results.success}`);
  log(`⏭  Skipped: ${results.skipped}`);
  log(`✗ Failed: ${results.failed}`);

  const outputDir = path.join(projectRoot, 'assets', 'social', 'reels');
  log(`\nReels saved to: ${outputDir}`);
  log('\nNext steps:');
  log('  1. Review the rendered Reels in assets/social/reels/');
  log('  2. Commit: git add assets/social/reels/ && git commit -m "Add Reel videos"');
  log('  3. Push: git push origin claude/fix-instagram-queue-robot-VVE9I');

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
