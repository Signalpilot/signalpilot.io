#!/usr/bin/env node
// Audit all carousel HTMLs for content issues

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL_DIR = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const posts = JSON.parse(readFileSync(join(ROOT, 'data', 'social', 'content-queue.json'), 'utf8'));

const issues = [];

for (const p of posts) {
  const dir = join(SOCIAL_DIR, `post-${String(p.postNumber).padStart(3, '0')}`);
  const htmlPath = join(dir, 'carousel.html');
  if (!existsSync(htmlPath)) continue;

  const html = readFileSync(htmlPath, 'utf8');
  const type = (p.type || '').trim();

  // Check for Education default headers on non-Education posts
  const hasEducationHeaders = html.includes('>The Problem<') || html.includes('>The Pattern<');
  if (hasEducationHeaders && type !== 'Education' && type !== '') {
    issues.push({ post: p.postNumber, issue: 'WRONG_HEADERS', type, detail: 'Has Education headers but type is ' + type });
  }

  // Check for thin content slides (body text < 20 chars)
  const textMatches = html.matchAll(/<p class="text">(.+?)<\/p>/gs);
  for (const m of textMatches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text.length < 20 && text.length > 0) {
      issues.push({ post: p.postNumber, issue: 'THIN_SLIDE', detail: `"${text}" (${text.length} chars)` });
    }
  }

  // Check for "SignalPilot" (no space) in visible content
  if (html.includes('>SignalPilot<') || html.match(/class="cine-logo">SignalPilot/)) {
    // This is OK - renderer fixes it. But flag if it's in body text
  }

  // Check for empty type
  if (type === '') {
    issues.push({ post: p.postNumber, issue: 'EMPTY_TYPE', detail: 'No type assigned' });
  }

  // Check for duplicate content across slides
  const slideTexts = [];
  const slideContentMatches = html.matchAll(/<p class="(?:text|quote)">([\s\S]*?)<\/p>/g);
  for (const m of slideContentMatches) {
    const clean = m[1].replace(/<[^>]+>/g, '').trim();
    if (clean.length > 30) {
      if (slideTexts.includes(clean)) {
        issues.push({ post: p.postNumber, issue: 'DUPLICATE_CONTENT', detail: clean.substring(0, 60) + '...' });
      }
      slideTexts.push(clean);
    }
  }
}

// Summary
const byIssue = {};
for (const i of issues) {
  if (!byIssue[i.issue]) byIssue[i.issue] = [];
  byIssue[i.issue].push(i);
}

console.log('=== CAROUSEL AUDIT REPORT ===\n');
for (const [type, items] of Object.entries(byIssue)) {
  console.log(`${type}: ${items.length} posts`);
  items.slice(0, 10).forEach(i => console.log(`  Post ${String(i.post).padStart(3, '0')}: ${i.detail}`));
  if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
  console.log('');
}

console.log(`Total issues: ${issues.length}`);
console.log(`Posts with wrong headers: ${(byIssue.WRONG_HEADERS || []).length}`);
console.log(`Posts with empty type: ${(byIssue.EMPTY_TYPE || []).length}`);
console.log(`Posts with thin slides: ${(byIssue.THIN_SLIDE || []).length}`);
console.log(`Posts with duplicate content: ${(byIssue.DUPLICATE_CONTENT || []).length}`);
