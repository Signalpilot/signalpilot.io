#!/usr/bin/env node
/**
 * Batch 10 — Posts 601-650 (42 posts) — FINAL BATCH
 * Hand-crafted 3-tweet threads
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu  = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
const docsHome = 'https://docs.signalpilot.io';
const tv = {
  pentarch:     'https://www.tradingview.com/script/NZt2MVbj-Pentarch-Cycle-Phase-Detection/',
  volumeOracle: 'https://www.tradingview.com/script/L9AQHzjY-Volume-Oracle-Regime-Detection/',
  janusAtlas:   'https://www.tradingview.com/script/28diwImS-Janus-Atlas-Multi-Timeframe-Auto-Levels/',
  plutusFlow:   'https://www.tradingview.com/script/uoZjVlZA-Plutus-Flow-Statistical-OBV-Analysis/',
  harmonicOsc:  'https://www.tradingview.com/script/Vpxnhy8j-Harmonic-Oscillator-Multi-Component-Momentum-Consensus/',
  auguryGrid:   'https://www.tradingview.com/script/H2REdDlY-Augury-Grid-Multi-Timeframe-Scanner/',
  omniDeck:     'https://www.tradingview.com/script/OatvfCuB-OmniDeck-Unified-Chart-Overlay/'
};
const docs = {
  pentarch:     'https://docs.signalpilot.io/pentarch-v10',
  volumeOracle: 'https://docs.signalpilot.io/volume-oracle-v10',
  janusAtlas:   'https://docs.signalpilot.io/janus-atlas-v10',
  plutusFlow:   'https://docs.signalpilot.io/plutus-flow-v10',
  harmonicOsc:  'https://docs.signalpilot.io/harmonic-oscillator-v10',
  auguryGrid:   'https://docs.signalpilot.io/augury-grid-v10',
  omniDeck:     'https://docs.signalpilot.io/omnideck-v10'
};

const rewrites = {
  // ── 601  Marketing – 601 Posts Down ──
  601: [
    `601 posts down. 49 to go. \u{1F9F5}`,
    `Complete education curriculum. Full indicator suite. The entire Chronicle saga. Psychology deep dives. Smart money concepts. Risk management frameworks. All built on one principle: educate honestly.`,
    `\u{1F393} Every lesson free: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 602  Education – Market Hours ──
  602: [
    `The market isn't always open equally. Know the key hours. \u{1F9F5}`,
    `Forex: 24/5 with session overlaps. Stocks: 9:30-4 EST plus pre/post market. Crypto: 24/7 but volume peaks during US hours. The best opportunities cluster around session opens and overlaps.`,
    `\u{1F4D6} Free session lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 603  Blog – FOMO Deep Dive ──
  603: [
    `FOMO: Fear Of Missing Out. It causes more damage than bad analysis. \u{1F9F5}`,
    `Chasing entries. Breaking rules. Oversized positions. Abandoning the plan because "this one is different." It never is. The move you missed wasn't your move. The next setup that fits your plan is.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 604  Quote – Market Will Teach ──
  604: [
    `"The market will teach you — if you're willing to pay attention." \u{1F9F5}`,
    `Every loss contains a lesson. Every win contains a warning. The traders who improve fastest are the ones who study both equally. The market is the teacher. Your journal is the textbook.`,
    `\u{1F4A1} Start learning: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 605  Docs – Customizable Settings ──
  605: [
    `Every Signal Pilot indicator is customizable. Dial in your preferences. \u{1F9F5}`,
    `Sensitivity adjustments. Visual customization. Timeframe overrides. Alert thresholds. Color schemes. The defaults are optimized, but your trading style is unique. The docs show every parameter.`,
    `\u{1F4D6} Settings guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 606  Education – Price Action + Indicators ──
  606: [
    `Price action vs indicators: not a battle. A partnership. \u{1F9F5}`,
    `Price action tells you WHAT is happening. Indicators tell you the context: momentum, volume, volatility, cycle phase. Together they create a more complete picture than either provides alone.`,
    `\u{1F4D6} Free lesson: ${edu}\n\u{1F6E0}\uFE0F The indicators: ${site}`
  ],

  // ── 607  Blog – Year One Goals ──
  607: [
    `Year one of trading should be about learning, not earning. \u{1F9F5}`,
    `Realistic year one goals: don't blow up. Develop a process. Journal consistently. Find one edge. Build discipline. If you're profitable in year one, great. If you're educated, even better.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Start learning: ${edu}`
  ],

  // ── 608  Marketing – The Vision ──
  608: [
    `The Signal Pilot vision: make professional tools accessible and education free. \u{1F9F5}`,
    `Make education free and comprehensive. Build a community that elevates everyone. Prove that honest education is a viable business model. We're not just selling indicators — we're changing how trading education works.`,
    `\u{1F393} Experience it: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 609  Education – Order Flow Basics ──
  609: [
    `Order flow sounds complex. The basics aren't. Here's the simplified version. \u{1F9F5}`,
    `More buying than selling = price goes up. More selling than buying = price goes down. Volume at key levels = strong conviction. Low volume at key levels = weak conviction. Start there.`,
    `\u{1F4D6} Free order flow lesson: ${edu}\n\u{1F50D} Plutus Flow: ${tv.plutusFlow}`
  ],

  // ── 610  Docs – Plans & Pricing ──
  610: [
    `Ready for more? Here are your Signal Pilot options. \u{1F9F5}`,
    `Monthly: $69 (flexible). Yearly: $399 (save $429). Lifetime: $999 (one-time). All plans include all 7 indicators, full documentation, and community access. No tiers. No upsells. Pick and go.`,
    `\u{1F6E0}\uFE0F See plans: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 611  Marketing – Money-Back Guarantee ──
  611: [
    `Still on the fence? 7-day money-back guarantee. No questions asked. \u{1F9F5}`,
    `No hoops. No retention calls. No "tell us why you're leaving." If it's not for you, we refund everything. Simple. We'd rather you try than wonder.`,
    `\u{1F6E0}\uFE0F Try risk-free: ${site}\n\u{1F393} Or start free: ${edu}`
  ],

  // ── 612  Education – Volume as Heartbeat ──
  612: [
    `Volume is the heartbeat of the market. Price shows direction. Volume shows conviction. \u{1F9F5}`,
    `High volume on breakout = institutional participation. Low volume on pullback = healthy consolidation. Volume climax at a high = exhaustion. Listen to the heartbeat before you trade the move.`,
    `\u{1F4D6} Free volume lesson: ${edu}\n\u{1F50D} Volume Oracle: ${tv.volumeOracle}`
  ],

  // ── 613  Education – Round Numbers ──
  613: [
    `Why do markets hesitate at $50,000... $100... $10? Round numbers are psychological magnets. \u{1F9F5}`,
    `Round numbers create psychological support/resistance because humans place orders there. Buy at $50,000. Stop at $100. Take profit at $10. These levels attract liquidity — and that means they attract price.`,
    `\u{1F4D6} Free level analysis lesson: ${edu}\n\u{1F50D} Janus Atlas: ${tv.janusAtlas}`
  ],

  // ── 614  Quote – Discipline Is Choosing ──
  614: [
    `"Discipline is choosing between what you want now and what you want most." \u{1F9F5}`,
    `In trading: you want to chase that move NOW. But you want consistent profitability MOST. You want to remove the stop NOW. But you want account survival MOST. Discipline is trading for tomorrow, not today.`,
    `\u{1F4A1} Build discipline: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 616  Education – Confluence Stacking ──
  616: [
    `One signal is a hint. Two is interesting. Three is confluence. That's when you trade. \u{1F9F5}`,
    `Confluence stacking: key level + volume confirmation + indicator alignment + timeframe agreement. The more independent factors that agree, the higher the probability. Quality of confluence > quantity.`,
    `\u{1F4D6} Free confluence lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 617  Blog – Journal as Feedback Loop ──
  617: [
    `Your trading journal isn't a diary. It's a feedback loop. \u{1F9F5}`,
    `What to track: entry reason, exit reason, emotional state, execution grade, screenshot. Review weekly. Find patterns. The journal reveals truths your ego hides. Data doesn't lie. Feelings do.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Journal education: ${edu}`
  ],

  // ── 619  Education – Trend ID 101 ──
  619: [
    `Trend identification 101: the first skill every trader needs. \u{1F9F5}`,
    `Higher highs + higher lows = uptrend. Lower highs + lower lows = downtrend. Neither = range. Before any trade, answer this question first. Get the direction right and everything else becomes easier.`,
    `\u{1F4D6} Free trend lesson: ${edu}\n\u{1F50D} Pentarch: ${tv.pentarch}`
  ],

  // ── 620  Docs – Asset Compatibility ──
  620: [
    `"Does Signal Pilot work on any asset?" Yes. All of them. \u{1F9F5}`,
    `Crypto. Stocks. Forex. Futures. Indices. Commodities. If it's on TradingView, Signal Pilot works on it. All 7 indicators, all asset classes, all timeframes. No restrictions.`,
    `\u{1F4D6} Compatibility details: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 621  Marketing – 621 Posts ──
  621: [
    `621 posts. 29 to go. From zero to a complete content library. \u{1F9F5}`,
    `Education. Psychology. Tools. Community. Chronicle lore. Smart money concepts. Risk management. All of it — built post by post, day by day. Almost there.`,
    `\u{1F393} Start from the beginning: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 622  Education – R:R Simplified ──
  622: [
    `Risk-to-reward explained simply: risk $100 to make $300 = 1:3 R:R. \u{1F9F5}`,
    `With 1:3 R:R, you only need to win 25% of the time to break even. Win 40%? You're very profitable. The higher your R:R, the lower your required win rate. Math is your friend.`,
    `\u{1F4D6} Free R:R lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 623  Blog – First Real Drawdown ──
  623: [
    `Your first real drawdown will test you. Not your strategy. You. \u{1F9F5}`,
    `The doubt. The second-guessing. The urge to change everything. The temptation to quit. A drawdown isn't a system failure — it's a psychological trial. How you respond determines if you survive.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Survive and thrive: ${edu}`
  ],

  // ── 624  Quote – Goal Is Money Not Being Right ──
  624: [
    `"The goal isn't to be right. The goal is to make money." \u{1F9F5}`,
    `Ego wants to be right. Discipline wants to be profitable. They're often at odds. Cutting a loss isn't admitting defeat — it's prioritizing your account over your pride. Choose money over ego.`,
    `\u{1F4A1} Prioritize profit: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 626  Education – Wick Analysis ──
  626: [
    `Wicks tell stories that candle bodies don't. Learn to read them. \u{1F9F5}`,
    `Long lower wick = buyers stepped in with force. Long upper wick = sellers rejected the high. Both wicks = indecision. No wicks = pure dominance. The wick is the rejected narrative. The body is the accepted one.`,
    `\u{1F4D6} Free price action lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 627  Blog – Best Trade Is No Trade ──
  627: [
    `Sometimes the best trade is no trade. Doing nothing is an active decision. \u{1F9F5}`,
    `No setup? No trade. Unclear market? No trade. Emotional state compromised? No trade. Sitting out preserves capital, preserves discipline, and preserves your mental health. That's three wins.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Patience education: ${edu}`
  ],

  // ── 629  Education – Advanced Confluence ──
  629: [
    `Advanced confluence: quality over quantity. Not just "multiple signals." \u{1F9F5}`,
    `The RIGHT signals at the RIGHT time in the RIGHT zone. Three correlated indicators agreeing isn't confluence — it's one signal said three ways. True confluence: independent factors converging independently.`,
    `\u{1F4D6} Free advanced lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 630  Docs – Getting Started ──
  630: [
    `Getting started with Signal Pilot: 4 steps, 5 minutes. \u{1F9F5}`,
    `1. Subscribe on signalpilot.io. 2. Connect your TradingView account. 3. Add indicators from the library. 4. Load a preset layout and start charting. Documentation walks through every step.`,
    `\u{1F4D6} Step-by-step guide: ${docsHome}\n\u{1F517} Get started: ${site}`
  ],

  // ── 631  Marketing – 631 Posts ──
  631: [
    `631 posts complete. 19 remaining. We're building something here. \u{1F9F5}`,
    `A library of education that lives forever. Every lesson accessible to anyone, anywhere, anytime. This isn't content for content's sake — it's a resource that compounds in value.`,
    `\u{1F393} Access it all: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 632  Education – Focused Watchlist ──
  632: [
    `A focused watchlist beats a scattered one. Quality of attention > quantity of assets. \u{1F9F5}`,
    `5-10 assets you know deeply outperform 100 assets you barely follow. Know their patterns, their volatility, their sessions, their correlations. Depth beats breadth in trading.`,
    `\u{1F4D6} Free watchlist lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 633  Blog – Knowing When to Walk Away ──
  633: [
    `Knowing when to walk away is a skill. After big wins AND big losses. \u{1F9F5}`,
    `After a big win — emotions run hot, overconfidence creeps in. After a big loss — revenge trading beckons. Both states impair judgment. The pros walk away at the extremes. The amateurs chase them.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Self-management: ${edu}`
  ],

  // ── 634  Quote – Plan the Trade ──
  634: [
    `"Plan the trade. Trade the plan." Simple words. Difficult practice. \u{1F9F5}`,
    `Planning is easy when markets are closed. Following the plan is hard when money is on the line. The gap between knowing and doing is where most traders lose. Bridge it with discipline.`,
    `\u{1F4A1} Bridge the gap: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 636  Education – Liquidity Locations ──
  636: [
    `Liquidity: where the orders are. Know the locations before they get hunted. \u{1F9F5}`,
    `Above recent highs — stop losses from shorts, breakout orders from bulls. Below recent lows — stop losses from longs, breakout orders from bears. Equal highs/lows are the biggest magnets.`,
    `\u{1F4D6} Free liquidity lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 637  Blog – 1% Better ──
  637: [
    `Small improvements compound. 1% better each week = 67% better in a year. \u{1F9F5}`,
    `The trader who improves one thing per week — entries, exits, sizing, timing, journaling — is unrecognizable after 12 months. Big leaps are rare. Small, consistent improvements are the real strategy.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Improve daily: ${edu}`
  ],

  // ── 639  Education – Trading System Components ──
  639: [
    `A trading system has five components. If you're missing one, you have a hobby, not a system. \u{1F9F5}`,
    `1. Market selection — what do I trade? 2. Entry criteria — when do I get in? 3. Exit criteria — when do I get out? 4. Risk management — how much do I risk? 5. Review process — how do I improve?`,
    `\u{1F4D6} Free system-building lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 640  Docs – Troubleshooting Quick Fixes ──
  640: [
    `Indicator not loading? Quick fixes before you contact support. \u{1F9F5}`,
    `Refresh TradingView. Check subscription status. Clear browser cache. Try a different browser. Remove and re-add the indicator. These five steps solve 95% of issues in under 2 minutes.`,
    `\u{1F4D6} Full troubleshooting: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 641  Marketing – 641 Posts ──
  641: [
    `641 posts. 9 to go. Single digits remaining. \u{1F9F5}`,
    `What started as an idea became a comprehensive trading education library. 82 free lessons. 7 professional indicators. Hundreds of psychology, strategy, and market structure posts. Almost complete.`,
    `\u{1F393} Read them all: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 642  Education – Lesson 01 ──
  642: [
    `Where it all begins. Lesson 01: Welcome to Signal Pilot. \u{1F9F5}`,
    `82 free lessons. 7 indicators. A complete journey from beginner to professional. No paywall. No tricks. Just open the education hub and start. Every journey begins with a single lesson.`,
    `\u{1F4D6} Start lesson 1: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 643  Blog – Why Most Fail ──
  643: [
    `Why do most traders fail? It's not because markets are impossible. \u{1F9F5}`,
    `Not because they lack intelligence. Because they lack patience, discipline, realistic expectations, proper education, and a community that tells them the truth. Fix the inputs. The outputs follow.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Fix the inputs: ${edu}`
  ],

  // ── 644  Quote – Impatient to Patient ──
  644: [
    `"The market is a device for transferring money from the impatient to the patient." — Warren Buffett \u{1F9F5}`,
    `Impatient traders chase. Patient traders wait. Impatient traders overtrade. Patient traders select. Over thousands of trades, patience isn't just a virtue — it's a mathematical advantage.`,
    `\u{1F4A1} Learn patience: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 646  Education – Lesson 82 ──
  646: [
    `Lesson 82: Mastery and Beyond. The final lesson in the curriculum. \u{1F9F5}`,
    `Mastery isn't a destination — it's a practice. The best traders never stop learning. They refine, adapt, and evolve. Lesson 82 isn't an end. It's a launching pad for everything that comes next.`,
    `\u{1F4D6} Complete all 82: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 648  Docs – Documentation Hub ──
  648: [
    `The Documentation: your complete reference guide for Signal Pilot. \u{1F9F5}`,
    `Getting started guides. Indicator settings. Best practices. Troubleshooting. Glossary. FAQ. Everything you need to use Signal Pilot effectively, documented and searchable. Knowledge base, not a paywall.`,
    `\u{1F4D6} Full documentation: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 649  Marketing – Post 649 ──
  649: [
    `Post 649. One remains. Tomorrow, we reach 650. \u{1F9F5}`,
    `From education to psychology. From indicators to Chronicle lore. From first lesson to final milestone. 649 posts of honesty, transparency, and commitment to teaching. One more to go.`,
    `\u{1F393} The entire journey: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 650  Social Proof – THE FINALE ──
  650: [
    `650. We did it. From first post to final milestone. \u{1F9F5}`,
    `82 lessons. 7 indicators. 1 mission: educate honestly. 650 posts of education, psychology, tools, community, and Chronicle lore. Not a single "guaranteed profit" claim. Just truth. Thank you.`,
    `\u{1F393} Start from lesson 1: ${edu}\n\u{1F6E0}\uFE0F The complete toolkit: ${site}`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0, skipped = 0;
  for (const post of queue) {
    if (!rewrites[post.postNumber]) continue;
    if ((post.twitter?.tweets || []).length >= 3) { skipped++; continue; }
    post.twitter.tweets = rewrites[post.postNumber];
    updated++;
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Batch 10 (FINAL) complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
