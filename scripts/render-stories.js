#!/usr/bin/env node
/**
 * Batch Stories Renderer
 *
 * Generates Instagram Stories from story data
 * Usage:
 *   node scripts/render-stories.js              # Render all stories
 *   node scripts/render-stories.js 0-2         # Render stories 0-2
 *   node scripts/render-stories.js --force     # Force re-render
 *   node scripts/render-stories.js --list      # List stories
 *
 * Requirements:
 *   - ffmpeg installed
 *   - Story data at: data/social/stories.json
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

function loadStories() {
  const filePath = path.join(projectRoot, 'data', 'social', 'stories.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getOutputPath(storyNumber) {
  const padded = String(storyNumber).padStart(3, '0');
  const outputDir = path.join(projectRoot, 'assets', 'social', 'stories');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return path.join(outputDir, `story-${padded}.mp4`);
}

/**
 * Render a single Story using Remotion CLI
 */
async function renderStory(storyNumber, story, force = false) {
  const outputPath = getOutputPath(storyNumber);

  if (!force && fs.existsSync(outputPath)) {
    log(`Already rendered: story-${String(storyNumber).padStart(3, '0')}.mp4 (use --force to re-render)`, 'progress');
    return { status: 'skipped', storyNumber };
  }

  try {
    log(`Rendering story ${storyNumber}: "${story.text}"...`, 'progress');

    const cmd = [
      `npx remotion render`,
      `./remotion/StoryComposition.jsx`,
      `InstagramStory`,
      `"${outputPath}"`,
      `--props='${JSON.stringify({
        postNumber: storyNumber,
        storyText: story.text,
        position: story.position || 'center',
        backgroundColor: '#0a0e27',
        accentColor: '#00d9ff',
      }).replace(/'/g, '"')}'`,
      `--concurrency=4`,
      `--pixel-format=yuv420p`,
    ].join(' ');

    execSync(cmd, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: '/bin/bash',
    });

    const sizeMB = Math.round(fs.statSync(outputPath).size / 1024 / 1024 * 10) / 10;
    log(`✅ Rendered: story-${String(storyNumber).padStart(3, '0')}.mp4 (${sizeMB}MB)`, 'info');

    return { status: 'success', storyNumber, size: fs.statSync(outputPath).size };
  } catch (err) {
    log(`Failed to render story ${storyNumber}: ${err.message}`, 'error');
    return { status: 'failed', storyNumber, reason: err.message };
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    stories: null,
    force: false,
    listOnly: false,
  };

  for (const arg of args) {
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--list') {
      options.listOnly = true;
    } else if (/^\d+$/.test(arg)) {
      options.stories = [parseInt(arg)];
    } else if (arg.includes('-')) {
      const [start, end] = arg.split('-').map(Number);
      options.stories = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }

  return options;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();
  const stories = loadStories();

  log('=== Instagram Stories Batch Renderer ===');

  let storiesToRender = [];

  if (options.stories) {
    storiesToRender = options.stories.filter((num) => num < stories.length);
  } else {
    storiesToRender = Array.from({ length: stories.length }, (_, i) => i);
  }

  if (storiesToRender.length === 0) {
    log('No stories found. Exiting.', 'warn');
    process.exit(0);
  }

  if (options.listOnly) {
    log(`Would render ${storiesToRender.length} stories:`);
    storiesToRender.forEach((num) => {
      const story = stories[num];
      const padded = String(num).padStart(3, '0');
      const outputPath = getOutputPath(num);
      const exists = fs.existsSync(outputPath);
      console.log(
        `  story-${padded}: "${story.text}" ${exists ? '✓ exists' : '(new)'}`
      );
    });
    process.exit(0);
  }

  log(`Found ${storiesToRender.length} stories to render`);
  log('Starting render process...\n');

  const results = { success: 0, skipped: 0, failed: 0 };

  for (const storyNum of storiesToRender) {
    const story = stories[storyNum];
    const result = await renderStory(storyNum, story, options.force);
    results[result.status]++;
  }

  log('\n=== Render Summary ===');
  log(`✅ Success: ${results.success}`);
  log(`⏭  Skipped: ${results.skipped}`);
  log(`✗ Failed: ${results.failed}`);

  const outputDir = path.join(projectRoot, 'assets', 'social', 'stories');
  log(`\nStories saved to: ${outputDir}`);
  log('\nNext steps:');
  log('  1. Review the rendered Stories in assets/social/stories/');
  log('  2. Commit: git add assets/social/stories/ && git commit -m "Add Story videos"');
  log('  3. Push: git push origin claude/fix-instagram-queue-robot-VVE9I');

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
