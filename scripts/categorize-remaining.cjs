#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
const three = q.filter(p => (p.twitter && p.twitter.tweets && p.twitter.tweets.length === 3));
console.log('Total 3-tweet posts:', three.length);

const cats = {};
for (const p of three) {
  let cat = 'unknown';
  const t = (p.title || '').toLowerCase();
  const ty = (p.type || '').toLowerCase();
  const pillar = (p.pillar || '').toLowerCase();

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
  else if (t.includes('pentarch') || t.includes('volume oracle') || t.includes('janus') || t.includes('plutus') || t.includes('harmonic') || t.includes('augury') || t.includes('omnideck') || t.includes('commander') || t.includes('sovereign') || t.includes('prophet') || t.includes('cartographer') || t.includes('scales') || t.includes('arbiter') || t.includes('watchman')) cat = 'product';
  else if (pillar.includes('education') || pillar.includes('learn')) cat = 'education';
  else if (pillar.includes('product') || pillar.includes('tool')) cat = 'product';
  else if (pillar.includes('community') || pillar.includes('social')) cat = 'community';

  if (cats[cat] === undefined) cats[cat] = [];
  cats[cat].push(p.postNumber);
}

console.log('\n--- CATEGORIES ---');
for (const [cat, nums] of Object.entries(cats).sort((a,b) => b[1].length - a[1].length)) {
  console.log(cat + ': ' + nums.length + ' posts');
  console.log('  Post numbers: ' + nums.join(', '));
}

// Also show what unknowns look like
if (cats.unknown && cats.unknown.length > 0) {
  console.log('\n--- UNKNOWN POST DETAILS ---');
  for (const num of cats.unknown) {
    const post = q.find(p => p.postNumber === num);
    console.log('  #' + num + ': "' + post.title + '" | type: ' + post.type + ' | pillar: ' + post.pillar);
  }
}
