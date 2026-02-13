#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));

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
  'losing streak', 'winning streak', 'recovery', 'patience'
];

// Group candidates by type
const groups = {
  education: [],
  blog: [],
  product: [],
  chronicle: []
};

for (const p of q) {
  const len = (p.twitter && p.twitter.tweets) ? p.twitter.tweets.length : 0;
  if (len !== 5) continue;
  const t = (p.title || '').toLowerCase();
  let matched = false;
  for (const kw of keywords) {
    if (t.includes(kw)) { matched = true; break; }
  }
  if (matched) {
    if (t.includes('chronicle') || t.includes('sovereign') || t.includes('prophet') ||
        t.includes('cartographer') || t.includes('scales') || t.includes('arbiter') ||
        t.includes('watchman') || t.includes('commander')) {
      groups.chronicle.push(p.postNumber);
    } else if (t.includes('product') || t.includes('demo') || t.includes('combo') ||
               t.includes('detection') || t.includes('scanner') || t.includes('alert') ||
               t.startsWith('\u{1F6E0}') || (p.title || '').startsWith('\u{1F6E0}')) {
      groups.product.push(p.postNumber);
    } else if (t.includes('blog') || t.includes('psychology') || t.includes('fomo') ||
               t.includes('tilt') || t.includes('burnout') || t.includes('compound') ||
               t.includes('marathon') || t.includes('emotional') || t.includes('sunk cost') ||
               t.includes('loneliness') || t.includes('resilience') || t.includes('comparison') ||
               t.includes('doing nothing') || t.includes('holy grail') || t.includes('losing streak') ||
               t.includes('winning streak') || t.includes('recovery') || t.includes('patience') ||
               t.includes('imposter') || t.includes('overtrading') || t.includes('journaling') ||
               t.includes('drawdown') || t.includes('waiting') || t.includes('position sizing') ||
               (p.title || '').startsWith('\u{1F4DD}')) {
      groups.blog.push(p.postNumber);
    } else {
      groups.education.push(p.postNumber);
    }
  }
}

for (const [group, nums] of Object.entries(groups)) {
  console.log(group + ': ' + nums.length + ' posts');
  console.log('  ' + JSON.stringify(nums));
}
console.log('Total: ' + Object.values(groups).reduce((a,b) => a + b.length, 0));
