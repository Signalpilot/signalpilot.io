#!/usr/bin/env node
/**
 * Converts single-tweet posts into 2-tweet threads with relevant links.
 *
 * Strategy:
 * - Chronicle posts → tweet 1 (lore) + tweet 2 (TradingView + Chronicle links)
 * - Product/Indicator posts → tweet 1 (description) + tweet 2 (TradingView + Docs links)
 * - Docs posts → tweet 1 (content) + tweet 2 (docs link)
 * - Marketing posts → tweet 1 (content) + tweet 2 (signalpilot.io link)
 * - Education posts → tweet 1 (content) + tweet 2 (education link)
 * - Blog posts → tweet 1 (content) + tweet 2 (blog link)
 * - Quote posts → left as-is
 * - Other/generic → tweet 1 (content) + tweet 2 (signalpilot.io link)
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

// === INDICATOR MAP ===
const indicators = {
  pentarch: {
    tradingview: 'https://www.tradingview.com/script/S8LniK8O-Pentarch-Cycle-Phase-Detection/',
    docs: 'https://docs.signalpilot.io/pentarch-v10',
    chronicle: 'https://signalpilot.io/chronicle/meet-the-sovereign/',
    character: 'The Sovereign',
    keywords: ['pentarch', 'sovereign', 'cycle phase', 'the sovereign', 'cycle detection']
  },
  volumeOracle: {
    tradingview: 'https://www.tradingview.com/script/L9AQHzjY-Volume-Oracle-Regime-Detection/',
    docs: 'https://docs.signalpilot.io/volume-oracle-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-prophet/',
    character: 'The Prophet',
    keywords: ['volume oracle', 'prophet', 'regime detection', 'the prophet', 'volume regime']
  },
  janusAtlas: {
    tradingview: 'https://www.tradingview.com/script/28diwImS-Janus-Atlas-Multi-Timeframe-Auto-Levels/',
    docs: 'https://docs.signalpilot.io/janus-atlas-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-cartographer/',
    character: 'The Cartographer',
    keywords: ['janus atlas', 'cartographer', 'auto levels', 'the cartographer', 'multi-timeframe level']
  },
  plutusFlow: {
    tradingview: 'https://www.tradingview.com/script/uoZjVlZA-Plutus-Flow-Statistical-OBV-Analysis/',
    docs: 'https://docs.signalpilot.io/plutus-flow-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-scales/',
    character: 'The Scales',
    keywords: ['plutus', 'scales', 'the scales', 'obv', 'plutus flow', 'statistical obv']
  },
  harmonicOscillator: {
    tradingview: 'https://www.tradingview.com/script/Vpxnhy8j-Harmonic-Oscillator-Multi-Component-Momentum-Consensus/',
    docs: 'https://docs.signalpilot.io/harmonic-oscillator-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-arbiter/',
    character: 'The Arbiter',
    keywords: ['harmonic oscillator', 'arbiter', 'the arbiter', 'momentum consensus']
  },
  auguryGrid: {
    tradingview: 'https://www.tradingview.com/script/H2REdDlY-Augury-Grid-Multi-Timeframe-Scanner/',
    docs: 'https://docs.signalpilot.io/augury-grid-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-watchman/',
    character: 'The Watchman',
    keywords: ['augury grid', 'watchman', 'the watchman', 'multi-symbol scan', 'scanner']
  },
  omniDeck: {
    tradingview: 'https://www.tradingview.com/script/OatvfCuB-OmniDeck-Unified-Chart-Overlay/',
    docs: 'https://docs.signalpilot.io/omnideck-v10',
    chronicle: 'https://signalpilot.io/chronicle/the-commander/',
    character: 'The Commander',
    keywords: ['omnideck', 'commander', 'the commander', 'unified overlay', 'unified chart']
  }
};

// === CATEGORY DETECTION ===
function detectCategory(title, tweetText) {
  const t = title.toLowerCase();
  const tw = tweetText.toLowerCase();

  // Chronicle
  if (t.includes('chronicle') || t.includes('pilot\'s oath') || t.includes('elite seven united') ||
      t.includes('council assembles') || t.includes('hierarchy of signals') ||
      t.includes('birth of the elite') || t.includes('eternal dance') ||
      t.includes('seven virtues') || t.includes('complete picture') ||
      t.includes('epilogue') || t.includes('chronicle recap') ||
      t.includes('chronicle wisdom') || t.includes('chronicle lesson') ||
      t.includes('chronicle finale') || t.includes('founding of signal pilot') ||
      t.includes('seven united') || t.includes('seven aligned') ||
      t.includes('where it all began') || t.includes('eternal student') ||
      t.includes('market\'s memory') || t.includes('gathering storm') ||
      t.includes('final lesson') || t.includes('path forward') ||
      t.includes('council of seven') || t.includes('origins of the elite')) {
    return 'chronicle';
  }

  // Character-specific chronicle posts (e.g. "THE SOVEREIGN'S WISDOM")
  const characterChroniclePatterns = [
    /sovereign.*wisdom|sovereign.*cycle|sovereign.*crown/,
    /prophet.*vision|prophet.*revelation|prophet.*warning|prophet.*silence/,
    /cartographer.*map|cartographer.*journey|cartographer.*first map|patience of the cartographer/,
    /scales.*truth|scales.*balance|scales of truth|scales of balance/,
    /arbiter.*judgment|arbiter.*balance/,
    /watchman.*vigil|watchman never sleeps/,
    /commander.*strategy|commander.*burden/
  ];
  for (const pattern of characterChroniclePatterns) {
    if (pattern.test(t)) return 'chronicle';
  }

  // Product/Indicator Demo
  if (t.includes('demo') || t.includes('combo') || t.includes('full cycle') ||
      t.includes('deep dive') || t.includes('full suite') || t.includes('walkthrough') ||
      t.includes('indicator overview') || t.includes('complete indicator')) {
    return 'product';
  }

  // Check if title mentions a specific indicator
  for (const [key, ind] of Object.entries(indicators)) {
    for (const kw of ind.keywords) {
      if (t.includes(kw)) {
        // Could be product or docs depending on title context
        if (t.includes('docs') || t.includes('settings') || t.includes('guide') ||
            t.includes('cheatsheet') || t.includes('reference') || t.includes('config') ||
            t.includes('setup') || t.includes('signal meanings') || t.includes('timeframe guide')) {
          return 'docs';
        }
        return 'product';
      }
    }
  }

  // Docs
  if (t.includes('docs') || t.includes('settings') || t.includes('cheatsheet') ||
      t.includes('quick start') || t.includes('guide') || t.includes('config') ||
      t.includes('reference') || t.includes('troubleshoot') || t.includes('keyboard shortcut') ||
      t.includes('mobile') || t.includes('alert') || t.includes('faq') ||
      t.includes('best practice') || t.includes('performance optimization') ||
      t.includes('glossary') || t.includes('system requirements') ||
      t.includes('feedback') || t.includes('upgrade path') ||
      t.includes('changelog') || t.includes('video tutorial') ||
      t.includes('contact & support') || t.includes('api & webhook')) {
    return 'docs';
  }

  // Education
  if (t.includes('lesson') || t.includes('education') || t.match(/\(lesson \d+\)/)) {
    return 'education';
  }

  // Marketing
  if (t.includes('marketing') || t.includes('lifetime') || t.includes('guarantee') ||
      t.includes('pricing') || t.includes('trial') || t.includes('milestone') ||
      t.includes('affiliate') || t.includes('testimonial') || t.includes('competitor') ||
      t.includes('community') && t.includes('join') || t.includes('cancel anytime') ||
      t.includes('built by traders') || t.includes('risk-free') ||
      t.includes('transparent pricing') || t.includes('the signal pilot promise') ||
      t.includes('your journey starts') || t.includes('start free') ||
      t.includes('results over promises')) {
    return 'marketing';
  }

  // Blog
  if (t.includes('blog') || t.includes('article') || t.includes('breakout') ||
      t.includes('fakeout')) {
    return 'blog';
  }

  // Quote
  if (t.includes('quote')) {
    return 'quote';
  }

  return 'other';
}

// === INDICATOR DETECTION ===
function detectIndicator(title, tweetText) {
  const combined = (title + ' ' + tweetText).toLowerCase();

  // Check each indicator - prefer exact matches first
  const exactOrder = [
    'harmonicOscillator', // check before generic "momentum"
    'volumeOracle',       // check before generic "volume"
    'auguryGrid',         // check before generic "scanner"
    'plutusFlow',
    'janusAtlas',
    'omniDeck',
    'pentarch'
  ];

  for (const key of exactOrder) {
    const ind = indicators[key];
    for (const kw of ind.keywords) {
      if (combined.includes(kw)) {
        return ind;
      }
    }
  }

  return null;
}

// === DETECT MULTIPLE INDICATORS (for "Elite Seven" / combo posts) ===
function detectMultipleIndicators(title, tweetText) {
  const combined = (title + ' ' + tweetText).toLowerCase();
  const found = [];

  for (const [key, ind] of Object.entries(indicators)) {
    for (const kw of ind.keywords) {
      if (combined.includes(kw)) {
        found.push(ind);
        break;
      }
    }
  }

  return found;
}

// === BUILD CTA TWEET ===
function buildCtaTweet(category, indicator, post) {
  const title = post.title.toLowerCase();
  const tweet = post.twitter.tweets[0];

  switch (category) {
    case 'chronicle': {
      if (indicator) {
        return `🔗 Use the indicator: ${indicator.tradingview}\n📖 Read the lore: ${indicator.chronicle}`;
      }
      // Generic chronicle (no specific indicator)
      return `📖 Enter the Chronicle: https://signalpilot.io/chronicle/\n🔗 Explore all indicators: https://signalpilot.io`;
    }

    case 'product': {
      if (indicator) {
        return `🔗 Try it on TradingView: ${indicator.tradingview}\n📖 Full docs: ${indicator.docs}`;
      }
      // Multi-indicator or generic product
      const multiInds = detectMultipleIndicators(post.title, tweet);
      if (multiInds.length >= 2) {
        return `🔗 Get all 7 indicators: https://signalpilot.io\n📖 Full docs: https://docs.signalpilot.io`;
      }
      return `🔗 Try it free: https://signalpilot.io\n📖 Full docs: https://docs.signalpilot.io`;
    }

    case 'docs': {
      if (indicator) {
        return `📖 Full docs: ${indicator.docs}\n🔗 Get it on TradingView: ${indicator.tradingview}`;
      }
      if (post.source) {
        return `📖 Full docs: ${post.source}`;
      }
      return `📖 Full documentation: https://docs.signalpilot.io`;
    }

    case 'education': {
      if (post.source) {
        return `🎓 Free lesson: ${post.source}`;
      }
      return `🎓 82 free lessons: https://education.signalpilot.io`;
    }

    case 'marketing': {
      return `🔗 https://signalpilot.io`;
    }

    case 'blog': {
      if (post.source) {
        return `📝 Full article: ${post.source}`;
      }
      return `📝 Read more: https://blog.signalpilot.io`;
    }

    case 'other': {
      // Try to detect if it's education-adjacent
      const tw = tweet.toLowerCase();
      if (tw.includes('lesson') || tw.includes('learn') || tw.includes('education')) {
        return `🎓 82 free lessons: https://education.signalpilot.io`;
      }
      if (tw.includes('indicator') || tw.includes('tradingview')) {
        return `🔗 Try Signal Pilot: https://signalpilot.io`;
      }
      return `🔗 https://signalpilot.io`;
    }

    default:
      return null;
  }
}

// === MAIN ===
function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));

  let converted = 0;
  let skippedQuote = 0;
  let skippedAlreadyMulti = 0;
  let skippedAlreadyHasLink = 0;

  const stats = {
    chronicle: 0,
    product: 0,
    docs: 0,
    education: 0,
    marketing: 0,
    blog: 0,
    quote: 0,
    other: 0
  };

  for (const post of queue) {
    // Skip posts below 39 (already posted or have proper threads)
    if (post.postNumber < 39) continue;

    // Skip if already has multiple tweets
    if (post.twitter.tweets.length !== 1) {
      skippedAlreadyMulti++;
      continue;
    }

    const tweet = post.twitter.tweets[0];

    // Skip if tweet already has a URL
    if (tweet.includes('http')) {
      skippedAlreadyHasLink++;
      continue;
    }

    const category = detectCategory(post.title, tweet);
    stats[category]++;

    // Skip quotes - they don't need links
    if (category === 'quote') {
      skippedQuote++;
      continue;
    }

    const indicator = detectIndicator(post.title, tweet);
    const ctaTweet = buildCtaTweet(category, indicator, post);

    if (ctaTweet) {
      // Convert to 2-tweet thread
      post.twitter.tweets = [tweet, ctaTweet];
      converted++;
    }
  }

  // Write back
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');

  console.log('\n=== CONVERSION COMPLETE ===\n');
  console.log(`Total converted to threads: ${converted}`);
  console.log(`Skipped (quote posts):      ${skippedQuote}`);
  console.log(`Skipped (already multi):    ${skippedAlreadyMulti}`);
  console.log(`Skipped (already has link): ${skippedAlreadyHasLink}`);
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(stats)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
