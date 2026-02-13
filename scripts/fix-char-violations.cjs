#!/usr/bin/env node
/**
 * Fix character violations by splitting tweets >280 chars into two tweets.
 * Splits at natural break points: double newlines, bullet lists, or sentences.
 * Never trims — all content preserved.
 */
const fs = require('fs');
const queue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));

let totalSplits = 0;
let postsFixed = 0;

function findBestSplit(text) {
  const maxLen = 280;

  // Strategy 1: Split at double newline (\n\n) closest to middle
  const doubleBreaks = [];
  let idx = 0;
  while ((idx = text.indexOf('\n\n', idx)) !== -1) {
    if (idx > 30 && idx < text.length - 30) { // Don't split too close to edges
      doubleBreaks.push(idx);
    }
    idx++;
  }

  // Find the best double-break that keeps both halves under 280
  for (const br of doubleBreaks) {
    const part1 = text.substring(0, br).trim();
    const part2 = text.substring(br + 2).trim();
    if (part1.length <= maxLen && part2.length <= maxLen) {
      return [part1, part2];
    }
  }

  // If no perfect double-break, pick the one closest to middle
  if (doubleBreaks.length > 0) {
    const mid = text.length / 2;
    const best = doubleBreaks.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a);
    const part1 = text.substring(0, best).trim();
    const part2 = text.substring(best + 2).trim();
    // Even if one part is still >280, we'll re-split it in the next pass
    return [part1, part2];
  }

  // Strategy 2: Split at single newline before a bullet (◾, •, -, ▸, ►, ●)
  const bulletBreaks = [];
  const lines = text.split('\n');
  let charPos = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      const lineStart = lines[i].trim();
      if (/^[◾•\-▸►●◆→✅❌⚡🔴🟢🟡🔵🟠⬛]/.test(lineStart)) {
        bulletBreaks.push(charPos);
      }
    }
    charPos += lines[i].length + 1; // +1 for \n
  }

  for (const br of bulletBreaks) {
    const part1 = text.substring(0, br).trim();
    const part2 = text.substring(br).trim();
    if (part1.length <= maxLen && part2.length <= maxLen && part1.length > 30) {
      return [part1, part2];
    }
  }

  // Pick bullet break closest to keeping part1 under 280
  if (bulletBreaks.length > 0) {
    // Find the last bullet break where part1 is under 280
    let bestBr = bulletBreaks[0];
    for (const br of bulletBreaks) {
      if (text.substring(0, br).trim().length <= maxLen) bestBr = br;
    }
    const part1 = text.substring(0, bestBr).trim();
    const part2 = text.substring(bestBr).trim();
    if (part1.length > 30) return [part1, part2];
  }

  // Strategy 3: Split at any single newline closest to middle
  const singleBreaks = [];
  idx = 0;
  while ((idx = text.indexOf('\n', idx)) !== -1) {
    if (idx > 30 && idx < text.length - 30) {
      singleBreaks.push(idx);
    }
    idx++;
  }

  for (const br of singleBreaks) {
    const part1 = text.substring(0, br).trim();
    const part2 = text.substring(br + 1).trim();
    if (part1.length <= maxLen && part2.length <= maxLen) {
      return [part1, part2];
    }
  }

  if (singleBreaks.length > 0) {
    let bestBr = singleBreaks[0];
    for (const br of singleBreaks) {
      if (text.substring(0, br).trim().length <= maxLen) bestBr = br;
    }
    const part1 = text.substring(0, bestBr).trim();
    const part2 = text.substring(bestBr + 1).trim();
    return [part1, part2];
  }

  // Strategy 4: Split at sentence boundary (period + space)
  const sentenceBreaks = [];
  const re = /\.\s+/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > 30 && match.index < text.length - 30) {
      sentenceBreaks.push(match.index + 1); // Include the period
    }
  }

  for (const br of sentenceBreaks) {
    const part1 = text.substring(0, br).trim();
    const part2 = text.substring(br).trim();
    if (part1.length <= maxLen && part2.length <= maxLen) {
      return [part1, part2];
    }
  }

  if (sentenceBreaks.length > 0) {
    let bestBr = sentenceBreaks[0];
    for (const br of sentenceBreaks) {
      if (text.substring(0, br).trim().length <= maxLen) bestBr = br;
    }
    const part1 = text.substring(0, bestBr).trim();
    const part2 = text.substring(bestBr).trim();
    return [part1, part2];
  }

  // Strategy 5: Hard split at 275 chars at nearest space
  let splitAt = 275;
  while (splitAt > 50 && text[splitAt] !== ' ') splitAt--;
  if (splitAt <= 50) splitAt = 275; // Fallback
  return [text.substring(0, splitAt).trim(), text.substring(splitAt).trim()];
}

function splitTweetsUntilValid(tweets) {
  let changed = true;
  let passes = 0;
  const maxPasses = 10; // Safety limit

  while (changed && passes < maxPasses) {
    changed = false;
    passes++;
    const newTweets = [];

    for (const tweet of tweets) {
      if (tweet.length <= 280) {
        newTweets.push(tweet);
      } else {
        const [part1, part2] = findBestSplit(tweet);
        newTweets.push(part1, part2);
        totalSplits++;
        changed = true;
      }
    }
    tweets = newTweets;
  }

  return tweets;
}

// Process all posts
for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets) continue;

  const before = post.twitter.tweets.length;
  const hadViolation = post.twitter.tweets.some(t => t.length > 280);

  if (hadViolation) {
    post.twitter.tweets = splitTweetsUntilValid(post.twitter.tweets);
    postsFixed++;
  }
}

// Verify — count remaining violations
let remaining = 0;
let remainingPosts = [];
for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets) continue;
  for (const t of post.twitter.tweets) {
    if (t.length > 280) {
      remaining++;
      if (!remainingPosts.includes(post.postNumber)) remainingPosts.push(post.postNumber);
    }
  }
}

// Save
fs.writeFileSync('data/social/content-queue.json', JSON.stringify(queue, null, 2));

// Distribution after fix
const dist = {};
for (const p of queue) {
  const len = (p.twitter && p.twitter.tweets) ? p.twitter.tweets.length : 0;
  dist[len] = (dist[len] || 0) + 1;
}

console.log('========================================');
console.log('  CHARACTER VIOLATION FIX COMPLETE');
console.log('========================================');
console.log(`  Posts fixed: ${postsFixed}`);
console.log(`  Total splits: ${totalSplits}`);
console.log(`  Remaining violations: ${remaining}`);
if (remaining > 0) {
  console.log(`  Posts still with violations: ${remainingPosts.join(', ')}`);
}
console.log('\nNEW THREAD LENGTH DISTRIBUTION:');
for (const [k, v] of Object.entries(dist).sort((a, b) => a[0] - b[0])) {
  const bar = '█'.repeat(Math.round(v / 3));
  console.log(`  ${k} tweets: ${String(v).padStart(3)} posts ${bar}`);
}
console.log(`\nTotal: ${queue.length} posts`);
console.log('========================================');
