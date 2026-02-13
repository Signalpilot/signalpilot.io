#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');
const CATS_PATH = path.join(__dirname, '..', 'data', 'social', 'post-categories.json');
const OUT_DIR = path.join(__dirname, '..', 'data', 'social', 'extracts');

const q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
const cats = JSON.parse(fs.readFileSync(CATS_PATH, 'utf8'));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [cat, nums] of Object.entries(cats)) {
  const posts = [];
  for (const num of nums) {
    const p = q.find(x => x.postNumber === num);
    if (p) {
      posts.push({
        postNumber: p.postNumber,
        title: p.title,
        tweets: p.twitter ? p.twitter.tweets : []
      });
    }
  }
  const outPath = path.join(OUT_DIR, cat + '.json');
  fs.writeFileSync(outPath, JSON.stringify(posts, null, 2) + '\n');
  console.log(cat + ': ' + posts.length + ' posts extracted to ' + outPath);
}
