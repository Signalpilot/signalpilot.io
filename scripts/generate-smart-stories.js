#!/usr/bin/env node
/**
 * Smart Story Generator from Carousel Content
 *
 * Extracts COMPLETE, COHERENT stories from carousel captions
 * (not fragments - actual standalone messages)
 *
 * Usage:
 *   node scripts/generate-smart-stories.js              # Generate all (max 500)
 *   node scripts/generate-smart-stories.js --preview    # Show what would be generated
 *   node scripts/generate-smart-stories.js --count 300  # Limit to 300 stories
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

function loadContentQueue() {
  const path_val = path.join(projectRoot, 'data', 'social', 'content-queue.json');
  return JSON.parse(fs.readFileSync(path_val, 'utf-8'));
}

/**
 * Extract complete, coherent sentences from caption
 * Only takes FULL sentences (ends with period/question mark)
 * No fragments or incomplete thoughts
 */
function extractCompleteStories(caption) {
  if (!caption) return [];

  // Split by sentence-ending punctuation
  const sentences = caption
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      // Must end with punctuation
      if (!/[.!?]$/.test(s)) return false;

      // Must be 20-200 characters (complete thought, not too long)
      if (s.length < 20 || s.length > 200) return false;

      // Must have at least 5 words
      if (s.split(/\s+/).length < 5) return false;

      // Skip common filler
      if (
        s.toLowerCase().includes('link in bio') ||
        s.toLowerCase().includes('save this') ||
        s.toLowerCase().includes('click here') ||
        s.toLowerCase().includes('posted by') ||
        s.toLowerCase().includes('thanks') ||
        s.toLowerCase().includes('hashtag') ||
        s.toLowerCase().includes('#') ||
        s.includes('→') || // Skip bullet points
        s.startsWith('❌') || // Skip checkbox lists
        s.startsWith('✅') ||
        s.startsWith('🟢') ||
        s.match(/^\d+\./) // Skip numbered lists
      ) {
        return false;
      }

      // Remove quotes that break it
      if (s.startsWith('"') && !s.endsWith('"')) return false;
      if (s.endsWith('"') && !s.startsWith('"')) return false;

      return true;
    });

  return sentences;
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
 * Clean up quotes and punctuation
 */
function cleanText(text) {
  return text
    .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
    .replace(/\\"/g, '"') // Fix escaped quotes
    .trim();
}

/**
 * Generate stories from all carousel posts
 */
function generateSmartStories(maxStories = 500) {
  const posts = loadContentQueue();
  const allStories = [];
  const seenTexts = new Set(); // Deduplicate

  log(`Scanning ${posts.length} carousel posts for complete stories (max ${maxStories})...`);

  for (const post of posts) {
    if (!post.instagram?.caption) continue;

    // Stop if we have enough
    if (allStories.length >= maxStories) break;

    const stories = extractCompleteStories(post.instagram.caption);

    for (let story of stories) {
      if (allStories.length >= maxStories) break;

      // Clean and deduplicate
      story = cleanText(story);
      if (seenTexts.has(story)) continue;
      seenTexts.add(story);

      // Shorten to max 120 chars for Story readability
      let storyText = story;
      if (story.length > 120) {
        storyText = story.substring(0, 117) + '...';
      }

      // Add emoji
      const textWithEmoji = addEmoji(storyText);

      allStories.push({
        storyNumber: allStories.length,
        text: textWithEmoji,
        position: 'center',
        sourcePost: post.postNumber,
        sourceTitle: post.title,
      });
    }
  }

  if (allStories.length === 0) {
    log('No complete stories found in carousel posts', 'warn');
    return [];
  }

  log(`Extracted ${allStories.length} complete stories from carousel posts`);
  return allStories;
}

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    preview: args.includes('--preview'),
    maxStories: 500,
  };

  const countIdx = args.indexOf('--count');
  if (countIdx > -1 && args[countIdx + 1]) {
    options.maxStories = parseInt(args[countIdx + 1]);
  }

  return options;
}

/**
 * Main
 */
async function main() {
  const args = parseArgs();

  log('=== Smart Story Generator ===');

  const stories = generateSmartStories(args.maxStories);

  if (stories.length === 0) {
    process.exit(1);
  }

  // Preview mode
  if (args.preview) {
    log(`\nWould create ${stories.length} Stories:\n`);
    stories.slice(0, 20).forEach((story) => {
      console.log(`${story.storyNumber}: "${story.text}"`);
    });
    if (stories.length > 20) {
      console.log(`\n... and ${stories.length - 20} more stories`);
    }
    process.exit(0);
  }

  // Write to stories.json
  const storiesPath = path.join(projectRoot, 'data', 'social', 'stories.json');

  // Clean up for output (remove source info)
  const storiesOutput = stories.map((s) => ({
    storyNumber: s.storyNumber,
    text: s.text,
    position: s.position,
  }));

  fs.writeFileSync(storiesPath, JSON.stringify(storiesOutput, null, 2));

  log(`\n✅ Generated ${stories.length} Stories`);
  log(`📝 Saved to: data/social/stories.json`);

  // Calculate rotation
  const rotationDays = Math.ceil(stories.length / 5);
  log(`\nRotation: ${rotationDays} days (5 stories/day)`);
  log(`  = ${Math.floor(rotationDays / 7)} weeks of unique content`);

  log(`\nNext steps:`);
  log(`  1. Review: npm run generate-stories:preview`);
  log(`  2. Build PNG images: npm run generate-stories`);
  log(`  3. Commit: git add assets/social/stories/ && git commit`);

  // Show sample
  log(`\nSample Stories:`);
  stories.slice(0, 10).forEach((story, idx) => {
    console.log(`  ${idx + 1}. "${story.text}"`);
  });
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});
