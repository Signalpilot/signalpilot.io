#!/usr/bin/env node
/**
 * Fix hooks that are too long by splitting them.
 * If tweet[0] is > 150 chars and starts with a strong prefix,
 * split it: prefix becomes tweet[0], rest becomes new tweet[1].
 */
const fs = require('fs');
const queue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));

let split = 0;
let shortened = 0;

for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets) continue;
  const tweets = post.twitter.tweets;

  if (tweets[0].length > 180) {
    // Try splitting at double newline
    const parts = tweets[0].split('\n\n');
    if (parts.length >= 2 && parts[0].length <= 150 && parts[0].length >= 20) {
      // First part is the hook, rest joins back as tweet[1]
      const newHook = parts[0] + ' 🧵';
      const rest = parts.slice(1).join('\n\n');

      if (newHook.length <= 280 && rest.length <= 280) {
        tweets.splice(0, 1, newHook, rest);
        split++;
      }
    }
  }

  // Also add thread emoji if hook is short and doesn't have one
  if (tweets[0].length < 120 && !tweets[0].includes('🧵')) {
    tweets[0] = tweets[0].trimEnd() + ' 🧵';
    if (tweets[0].length > 280) {
      tweets[0] = tweets[0].replace(' 🧵', '');
    }
  }
}

// Verify
let violations = 0;
for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets) continue;
  for (const t of post.twitter.tweets) {
    if (t.length > 280) violations++;
  }
}

fs.writeFileSync('data/social/content-queue.json', JSON.stringify(queue, null, 2));
console.log('Hooks split: ' + split);
console.log('Hooks shortened by splitting: ' + shortened);
console.log('New char violations: ' + violations);
