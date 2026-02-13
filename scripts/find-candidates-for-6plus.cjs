#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));

// Show current 6+ posts
console.log('=== CURRENT 6+ TWEET POSTS ===');
for (const p of q) {
  const len = (p.twitter && p.twitter.tweets) ? p.twitter.tweets.length : 0;
  if (len >= 6) console.log('#' + p.postNumber + ' (' + len + ' tweets): ' + p.title);
}

// Find candidates among 5-tweet posts that deserve 6-7
const keywords = [
  'wyckoff', 'ict', 'order block', 'fair value', 'liquidity',
  'risk management', 'backtesting', 'market structure', 'supply and demand',
  'confluence', 'volume spread', 'inducement', 'reversal pattern',
  'fibonacci', 'momentum', 'journal', 'psychology', 'discipline',
  'going live', 'paper trading', 'swing trading', 'day trading',
  'breakout', 'divergence', 'market maker', 'kill zone', 'breaker block',
  'mitigation', 'displacement', 'premium', 'discount', 'fomo', 'tilt',
  'overtrading', 'burnout', 'compound', 'holy grail', 'auction market',
  'delta volume', 'intermarket', 'price action', 'session timing',
  'pentarch', 'volume oracle', 'janus', 'plutus', 'harmonic', 'augury',
  'omnideck', 'commander', 'full suite', 'sovereign', 'prophet',
  'cartographer', 'scales', 'arbiter', 'watchman',
  'scaling', 'position sizing', 'stop loss', 'entry trigger',
  'correlation', 'volatility', 'mean reversion', 'trend strength',
  'gap trading', 'candlestick psychology', 'trading plan',
  'imposter', 'marathon', 'emotional detachment', 'sunk cost',
  'loneliness', 'mental resilience', 'comparison trap', 'doing nothing',
  'losing streak', 'winning streak'
];

const candidates = [];
for (const p of q) {
  const len = (p.twitter && p.twitter.tweets) ? p.twitter.tweets.length : 0;
  if (len !== 5) continue;
  const t = (p.title || '').toLowerCase();
  for (const kw of keywords) {
    if (t.includes(kw)) {
      candidates.push({ num: p.postNumber, title: p.title });
      break;
    }
  }
}

console.log('\n=== CANDIDATES FOR 6-7 TWEETS (' + candidates.length + ' posts) ===');
for (const c of candidates) {
  console.log('  #' + c.num + ': ' + c.title);
}

// Also count by current tweet length
const dist = {};
for (const p of q) {
  const len = (p.twitter && p.twitter.tweets) ? p.twitter.tweets.length : 0;
  dist[len] = (dist[len] || 0) + 1;
}
console.log('\n=== CURRENT DISTRIBUTION ===');
for (const [k,v] of Object.entries(dist).sort((a,b) => a[0]-b[0])) {
  console.log('  ' + k + ' tweets: ' + v + ' posts');
}
