#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
const three = q.filter(p => (p.twitter && p.twitter.tweets && p.twitter.tweets.length === 3));

const cats = {};
for (const p of three) {
  let cat = 'unknown';
  const t = (p.title || '').toLowerCase();
  const title = p.title || '';
  const ty = (p.type || '').toLowerCase();
  const pillar = (p.pillar || '').toLowerCase();

  // Emoji-based detection first (for posts with empty type/pillar)
  if (title.startsWith('\u{1F393}')) cat = 'education';        // 🎓
  else if (title.startsWith('\u{1F4DD}')) cat = 'blog';         // 📝
  else if (title.startsWith('\u{1F4DA}')) cat = 'docs';         // 📚
  else if (title.startsWith('\u{1F6E0}')) cat = 'product';      // 🛠️
  else if (title.startsWith('\u{1F310}')) cat = 'community';    // 🌐
  else if (title.startsWith('\u{1F52E}')) cat = 'marketing';    // 🔮

  // Type/pillar-based detection
  if (cat === 'unknown') {
    if (t.includes('lesson') || t.includes('education') || ty.includes('education')) cat = 'education';
    else if (t.includes('blog') || ty.includes('blog')) cat = 'blog';
    else if (t.includes('quote') || ty.includes('quote')) cat = 'quote';
    else if (t.includes('marketing') || ty.includes('marketing')) cat = 'marketing';
    else if (t.includes('doc') || ty.includes('doc')) cat = 'docs';
    else if (t.includes('product') || ty.includes('product') || t.includes('indicator')) cat = 'product';
    else if (t.includes('chronicle') || ty.includes('chronicle')) cat = 'chronicle';
    else if (t.includes('cheat') || t.includes('cheatsheet')) cat = 'cheatsheet';
    else if (t.includes('milestone') || t.includes('celebration') || t.includes('100 posts')) cat = 'milestone';
    else if (t.includes('guide') || t.includes('setup') || t.includes('settings') || t.includes('getting started')) cat = 'guide';
    else if (t.includes('community') || t.includes('discord') || t.includes('testimonial')) cat = 'community';
    else if (t.includes('pricing') || t.includes('lifetime') || t.includes('subscription') || t.includes('referral') || t.includes('affiliate')) cat = 'pricing';
    else if (pillar.includes('education') || pillar.includes('learn')) cat = 'education';
    else if (pillar.includes('product') || pillar.includes('tool')) cat = 'product';
    else if (pillar.includes('community') || pillar.includes('social')) cat = 'community';
  }

  if (cats[cat] === undefined) cats[cat] = [];
  cats[cat].push(p.postNumber);
}

// Output JSON mapping for use in expansion scripts
const output = {};
for (const [cat, nums] of Object.entries(cats).sort((a,b) => b[1].length - a[1].length)) {
  output[cat] = nums;
  console.log(cat + ': ' + nums.length + ' posts');
}

// Assign target tweet counts
const targets = {
  education: 5,
  blog: 5,
  product: 5,
  chronicle: 5,
  guide: 5,
  cheatsheet: 5,
  quote: 4,
  marketing: 4,
  docs: 4,
  community: 4,
  pricing: 4,
  milestone: 4
};

console.log('\n--- EXPANSION PLAN ---');
let totalNew = 0;
for (const [cat, nums] of Object.entries(cats).sort((a,b) => b[1].length - a[1].length)) {
  const target = targets[cat] || 4;
  const newTweets = nums.length * (target - 3);
  totalNew += newTweets;
  console.log(cat + ': ' + nums.length + ' posts x ' + (target - 3) + ' new tweets = ' + newTweets + ' tweets to write (target: ' + target + ')');
}
console.log('Total new tweets to write: ' + totalNew);

// Write the categorization to a JSON file for the expansion scripts to use
fs.writeFileSync(path.join(__dirname, '..', 'data', 'social', 'post-categories.json'), JSON.stringify(output, null, 2) + '\n');
console.log('\nWrote data/social/post-categories.json');

// Also output unknown details if any remain
if (cats.unknown && cats.unknown.length > 0) {
  console.log('\n--- STILL UNKNOWN ---');
  for (const num of cats.unknown) {
    const post = q.find(p => p.postNumber === num);
    console.log('  #' + num + ': "' + post.title + '"');
  }
}
