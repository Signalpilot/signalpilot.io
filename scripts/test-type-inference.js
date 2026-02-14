#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { inferTypeFromTitle } from '../lib/social/content-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'social', 'content-queue.json'), 'utf8'));

let fixed = 0, stillEmpty = 0;
const stillEmptyPosts = [];
for (const p of posts) {
  const type = (p.type || '').trim();
  if (type === '') {
    const inferred = inferTypeFromTitle(p.title);
    if (inferred) { fixed++; }
    else { stillEmpty++; stillEmptyPosts.push({ n: p.postNumber, title: p.title }); }
  }
}
console.log(`Would fix: ${fixed} posts`);
console.log(`Still empty: ${stillEmpty} posts`);
stillEmptyPosts.forEach(p => console.log(`  Post ${p.n}: ${p.title}`));
