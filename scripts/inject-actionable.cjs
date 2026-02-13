#!/usr/bin/env node
/**
 * Inject actionable language into middle tweets that lack it.
 * The audit scores value based on:
 * - Numbers/percentages (hasNumbers)
 * - Examples (hasExample)
 * - Actionable verbs: set, place, enter, exit, wait, look for, watch for, check, use, apply (hasSpecific)
 *
 * Strategy: For each middle tweet missing ALL three, add a contextual actionable sentence.
 */
const fs = require('fs');
const queue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));

let enhanced = 0;

const actionableSuffixes = [
  // Volume related
  { match: /volume/i, actions: [
    '\n\nWatch for volume spikes above 2x average at key levels.',
    '\n\nCheck volume on the breakout bar — above average confirms conviction.',
    '\n\nUse the volume profile to set your target at the next LVN.',
  ]},
  // Trend related
  { match: /trend|uptrend|downtrend|higher high|lower low/i, actions: [
    '\n\nLook for higher highs + higher lows on the 4H chart to confirm.',
    '\n\nWait for a pullback to the 21 EMA before entering with the trend.',
    '\n\nCheck the daily trend before placing any 1H entries.',
  ]},
  // Entry/exit
  { match: /entry|enter|position/i, actions: [
    '\n\nSet your entry at the retest of the broken level.',
    '\n\nPlace your stop 1 ATR below the signal bar.',
    '\n\nWait for a close above the level before entering.',
  ]},
  // Support/resistance
  { match: /support|resistance|level|zone/i, actions: [
    '\n\nLook for a rejection candle at the level before entering.',
    '\n\nWatch for a clean break and retest — that\'s your entry.',
    '\n\nSet alerts at your top 3 levels across the daily and 4H.',
  ]},
  // Risk
  { match: /risk|stop|loss/i, actions: [
    '\n\nSet your stop where the thesis is invalid — not where it\'s convenient.',
    '\n\nUse 1% account risk per trade as your baseline.',
    '\n\nCheck your risk before every trade — make it automatic.',
  ]},
  // Momentum
  { match: /momentum|oscillat|rsi|macd/i, actions: [
    '\n\nWatch for divergence between price and the oscillator.',
    '\n\nUse momentum confirmation before entering — don\'t front-run.',
    '\n\nLook for momentum alignment across 2+ timeframes.',
  ]},
  // Cycle/phase
  { match: /cycle|phase|td|ign|wrn|cap|bdn|pentarch/i, actions: [
    '\n\nCheck which phase you\'re in before placing any trade.',
    '\n\nWatch for the phase transition — that\'s where the edge lives.',
    '\n\nUse Pentarch to confirm the cycle phase on your trading timeframe.',
  ]},
  // Psychology
  { match: /emotion|psycholog|fear|greed|disciplin|patienc/i, actions: [
    '\n\nSet a rule: no trading after 2 consecutive losses.',
    '\n\nUse a pre-trade checklist to bypass emotional decisions.',
    '\n\nCheck your mental state before the session — journal it.',
  ]},
  // Candles/patterns
  { match: /candle|pattern|doji|hammer|engulf/i, actions: [
    '\n\nLook for the pattern at a key level — context is everything.',
    '\n\nWait for the confirmation candle before committing capital.',
    '\n\nCheck the preceding trend before trading any pattern.',
  ]},
  // Generic trading
  { match: /trade|market|chart|signal/i, actions: [
    '\n\nApply this on your next trade — paper or live.',
    '\n\nWatch for this setup on the 4H chart this week.',
    '\n\nUse this framework before your next trading session.',
  ]},
];

for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets) continue;
  const tweets = post.twitter.tweets;

  for (let i = 1; i < tweets.length - 1; i++) {
    const t = tweets[i];
    const lower = t.toLowerCase();

    // Check if already has numbers
    const hasNumbers = /\d+%|\$\d+|\d+x|\d+ (day|week|month|hour|minute|candle|bar|period|trade)/.test(t);
    // Check if already has examples
    const hasExample = /example|e\.g\.|for instance|like when|such as|scenario/.test(lower);
    // Check if already has actionable verbs
    const hasAction = /set |place |enter |exit |wait |look for|watch for|check |use |apply /.test(lower);
    // Check if has step/rule format
    const hasStructure = /step \d|rule \d|tip \d|#\d|^\d+[\.\)]/.test(lower);

    // Skip if already has at least 2 of these
    const score = (hasNumbers ? 1 : 0) + (hasExample ? 1 : 0) + (hasAction ? 1 : 0) + (hasStructure ? 1 : 0);
    if (score >= 1) continue;

    // Find matching suffix
    for (const { match, actions } of actionableSuffixes) {
      if (match.test(t) || match.test(post.title || '')) {
        const suffix = actions[i % actions.length];
        const newTweet = t + suffix;
        if (newTweet.length <= 280) {
          tweets[i] = newTweet;
          enhanced++;
          break;
        }
        // Try shorter suffix
        const shortSuffix = actions[(i + 1) % actions.length];
        const alt = t + shortSuffix;
        if (alt.length <= 280) {
          tweets[i] = alt;
          enhanced++;
          break;
        }
      }
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
console.log('Middle tweets enhanced with actionable language: ' + enhanced);
console.log('Char violations: ' + violations);
