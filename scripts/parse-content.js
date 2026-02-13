#!/usr/bin/env node

// Parse content plan markdown files into structured JSON for the social media bot
// Usage: node scripts/parse-content.js
//
// NOTE: content-queue.json is now manually curated (A-grade upgraded threads,
// deepened to 4-10 tweets each). This script skips overwriting if the file
// already exists. To force re-parse from markdown, use --force flag.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseAllContent, validatePosts } from '../lib/social/content-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PART1_PATH = join(ROOT, 'content-plan', 'CONTENT_PLAN_PART1.md');
const PART2_PATH = join(ROOT, 'content-plan', 'CONTENT_PLAN_PART2.md');
const OUTPUT_PATH = join(ROOT, 'data', 'social', 'content-queue.json');

const forceReparse = process.argv.includes('--force');

// Skip if curated content-queue.json already exists (preserves A-grade upgrades)
if (existsSync(OUTPUT_PATH) && !forceReparse) {
  const existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
  console.log(`content-queue.json already exists with ${existing.length} posts — skipping parse.`);
  console.log('Use --force to re-parse from markdown source files.');
  process.exit(0);
}

console.log('Parsing content plan files...');
console.log(`  Part 1: ${PART1_PATH}`);
console.log(`  Part 2: ${PART2_PATH}`);

const part1 = readFileSync(PART1_PATH, 'utf-8');
const part2 = readFileSync(PART2_PATH, 'utf-8');

const posts = parseAllContent(part1, part2);

console.log(`\nParsed ${posts.length} posts total`);

// Validate
const report = validatePosts(posts);
console.log(`\nValidation Report:`);
console.log(`  Total posts: ${report.totalPosts}`);
console.log(`  With Twitter content: ${report.withTwitter}`);
console.log(`  With Instagram content: ${report.withInstagram}`);
console.log(`  Valid: ${report.valid}`);

if (report.issues.length > 0) {
  console.log(`\n  Issues (${report.issues.length}):`);
  for (const issue of report.issues.slice(0, 20)) {
    console.log(`    - ${issue}`);
  }
  if (report.issues.length > 20) {
    console.log(`    ... and ${report.issues.length - 20} more`);
  }
}

// Type distribution
const types = {};
for (const post of posts) {
  types[post.type] = (types[post.type] || 0) + 1;
}
console.log(`\nType Distribution:`);
for (const [type, count] of Object.entries(types).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}

// Write output
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(posts, null, 2));
console.log(`\nOutput written to: ${OUTPUT_PATH}`);
console.log(`File size: ${(readFileSync(OUTPUT_PATH).length / 1024).toFixed(1)} KB`);
