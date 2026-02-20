#!/usr/bin/env node
/**
 * Pre-deploy validation: ensures every post in content-queue.json
 * has a twitter-card.png that exists and is >1KB.
 *
 * Run before deploy or in CI. Exits with code 1 if any cards are missing.
 *
 * Usage: node scripts/validate-twitter-cards.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const QUEUE_PATH = path.join(ROOT, 'data', 'social', 'content-queue.json');
const ASSETS_DIR = path.join(ROOT, 'assets', 'social');

const posts = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
const missing = [];
const tooSmall = [];

for (const post of posts) {
  const padded = String(post.postNumber).padStart(3, '0');
  const cardPath = path.join(ASSETS_DIR, `post-${padded}`, 'twitter-card.png');

  if (!fs.existsSync(cardPath)) {
    missing.push(post.postNumber);
  } else {
    const stat = fs.statSync(cardPath);
    if (stat.size < 1000) {
      tooSmall.push({ postNumber: post.postNumber, size: stat.size });
    }
  }
}

if (missing.length === 0 && tooSmall.length === 0) {
  console.log(`✅ All ${posts.length} posts have valid twitter-card.png files`);
  process.exit(0);
} else {
  if (missing.length > 0) {
    console.error(`❌ ${missing.length} posts missing twitter-card.png:`);
    console.error(`   Posts: ${missing.join(', ')}`);
    console.error(`   Fix: node scripts/render-twitter-cards.cjs --range ${missing[0]}-${missing[missing.length - 1]}`);
  }
  if (tooSmall.length > 0) {
    console.error(`❌ ${tooSmall.length} twitter cards are corrupted (<1KB):`);
    for (const t of tooSmall) {
      console.error(`   Post ${t.postNumber}: ${t.size} bytes`);
    }
  }
  process.exit(1);
}
