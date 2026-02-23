#!/usr/bin/env node
/**
 * Auto-Generate Stories from Carousel Posts
 *
 * Extracts key insights from carousel post captions
 * and automatically creates Story content
 *
 * Usage:
 *   node scripts/generate-stories-from-carousel.js
 *   node scripts/generate-stories-from-carousel.js 35
 *   node scripts/generate-stories-from-carousel.js --preview
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * Load content queue
 */
function loadContentQueue() {
  const path_val = path.join(projectRoot, 'data', 'social', 'content-queue.json');
  return JSON.parse(fs.readFileSync(path_val, 'utf-8'));
}

/**
 * Extract key insights from caption
 * Returns array of best insights (max 3-5 per post)
 */
function extractInsights(caption) {
  if (!caption) return [];

  // Split by periods, newlines, and paragraph breaks
  let sentences = caption
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 120); // Filter too short/long

  // Take interesting sentences (avoid filler)
  const insights = [];

  for (const sentence of sentences) {
    // Skip filler and hashtags
    if (
      sentence.toLowerCase().includes('link in bio') ||
      sentence.toLowerCase().includes('save this') ||
      sentence.toLowerCase().includes('click here') ||
      sentence.toLowerCase().includes('posted by') ||
      sentence.toLowerCase().includes('thanks for') ||
      sentence.toLowerCase().startsWith('#') || // Skip hashtag-only lines
      sentence.length < 15 || // Too short for story
      sentence.split(' ').length < 3 // Less than 3 words
    ) {
      continue;
    }

    // Truncate to 55 chars for Instagram story readability
    const insight = sentence.substring(0, 55);
    if (insight.length > 15 && insight.trim().length > 10) {
      insights.push(insight.trim());
    }

    // Max 3-5 per post (don't over-extract)
    if (insights.length >= 4) break;
  }

  return insights;
}

/**
 * Add emoji to make story more engaging
 */
function addEmoji(text) {
  const emojis = ['📊', '🎯', '🔎', '💰', '📈', '🧠', '⚡', '🔖', '📱', '🚀'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `${text} ${randomEmoji}`;
}

/**
 * Generate stories from carousel posts
 * Limits to best insights to keep manageable (max 50 stories)
 */
function generateStoriesFromCarousel(maxStories = 50) {
  const posts = loadContentQueue();
  const allStories = [];

  log(`Scanning carousel posts for insights (max ${maxStories} stories)...`);

  for (const post of posts) {
    if (!post.instagram?.caption) continue;

    // Stop if we have enough stories
    if (allStories.length >= maxStories) break;

    const insights = extractInsights(post.instagram.caption);

    for (const insight of insights) {
      const storyText = addEmoji(insight);
      allStories.push({
        storyNumber: allStories.length,
        text: storyText,
        position: 'center',
        sourcePost: post.postNumber,
        sourceTitle: post.title,
      });

      if (allStories.length >= maxStories) break;
    }
  }

  if (allStories.length === 0) {
    log('No insights found in carousel posts', 'warn');
    return [];
  }

  log(`Extracted ${allStories.length} Story insights from carousel posts`);
  return allStories;
}

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    preview: args.includes('--preview'),
    postNumber: args.length > 0 && /^\d+$/.test(args[0]) ? parseInt(args[0]) : null,
  };
}

/**
 * Main
 */
async function main() {
  const args = parseArgs();

  log('=== Story Generator from Carousel Posts ===');

  const stories = generateStoriesFromCarousel();

  if (stories.length === 0) {
    process.exit(1);
  }

  // Preview mode: just show what would be created
  if (args.preview) {
    log(`\nWould create ${stories.length} Stories:\n`);
    stories.forEach((story, idx) => {
      console.log(`Story ${idx}: "${story.text}"`);
      console.log(`         (from post #${story.sourcePost}: ${story.sourceTitle})\n`);
    });
    process.exit(0);
  }

  // Write to stories.json
  const storiesPath = path.join(projectRoot, 'data', 'social', 'stories.json');

  // Remove sourcePost and sourceTitle for actual file (too verbose)
  const storiesOutput = stories.map(s => ({
    storyNumber: s.storyNumber,
    text: s.text,
    position: s.position,
  }));

  fs.writeFileSync(storiesPath, JSON.stringify(storiesOutput, null, 2));

  log(`\n✅ Generated ${stories.length} Stories`);
  log(`📝 Saved to: data/social/stories.json`);
  log(`\nNext steps:`);
  log(`  1. Preview: npm run generate-stories:list`);
  log(`  2. Render: npm run generate-stories`);
  log(`  3. Commit: git add assets/social/stories/ && git commit -m "Add Story videos"`);

  // Show a few examples
  log(`\nSample Stories:`);
  stories.slice(0, 5).forEach((story, idx) => {
    console.log(`  ${idx + 1}. "${story.text}"`);
  });
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
