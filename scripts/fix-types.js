#!/usr/bin/env node
// Fix empty/wrong types in content-queue.json using title-based inference
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeType, inferTypeFromTitle } from '../lib/social/content-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_PATH = join(__dirname, '..', 'data', 'social', 'content-queue.json');

const posts = JSON.parse(readFileSync(QUEUE_PATH, 'utf8'));
let fixed = 0;

for (const post of posts) {
  const currentType = (post.type || '').trim();
  const normalized = normalizeType(currentType);

  if (normalized !== currentType && normalized !== '') {
    // normalizeType fixed it (e.g., "Main Site Marketing" → "Marketing")
    console.log(`Post ${post.postNumber}: "${currentType}" → "${normalized}" (normalized)`);
    post.type = normalized;
    fixed++;
  } else if (currentType === '' || currentType === normalized) {
    // Try inferring from title
    const inferred = inferTypeFromTitle(post.title);
    if (inferred && inferred !== currentType) {
      console.log(`Post ${post.postNumber}: "${currentType}" → "${inferred}" (inferred from "${post.title}")`);
      post.type = inferred;
      fixed++;
    }
  }
}

writeFileSync(QUEUE_PATH, JSON.stringify(posts, null, 2));
console.log(`\nFixed ${fixed} post types in content-queue.json`);
