#!/usr/bin/env node
/**
 * Expand ALL 57 marketing posts from 3 tweets to 4 tweets.
 *
 * Structure:
 *   tweet[0]  Hook (existing)
 *   tweet[1]  Value prop / differentiation (existing)
 *   tweet[2]  NEW — proof point, specific benefit, or "why this matters for YOUR trading"
 *   tweet[3]  CTA (existing tweet[2] moved to position 4)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

/* ──────────────────────────────────────────────────────────────────────
 *  NEW tweet 3 for each marketing post (inserted before the CTA)
 *  Each must be < 280 characters.
 * ────────────────────────────────────────────────────────────────────── */
const expansions = {

  // ── 9: Main Site Marketing ──
  9: `Most trading platforms sell you signals and call it "education." We built 82 structured lessons anyone can access for free — then built 7 non-repainting indicators for those ready to go deeper. The education stands on its own.`,

  // ── 18: 7-Day Money Back Guarantee ──
  18: `If the tools don't click after a week, you shouldn't pay for them. That's not a gimmick — it's basic respect. We'd rather lose a subscriber than keep someone who isn't getting value.`,

  // ── 41: The Elite Seven (Marketing) ──
  41: `Each indicator fills a gap the others leave open. Cycles, regimes, levels, flow, momentum, scanning, and unified overlay — seven perspectives designed to work independently or as a system.`,

  // ── 51: 7-Day Money-Back Guarantee ──
  51: `Most trading tools hook you with a free trial, then make cancellation painful. We flipped that. Full access from day one. One email gets you a full refund. We keep the process simple because we trust the product.`,

  // ── 68: Chronicle: The Commander (OmniDeck) ──
  68: `Think of OmniDeck as your cockpit. Instead of toggling between six indicators, you get one clean overlay that summarizes cycle phase, regime, levels, flow, and momentum. Less noise, better decisions.`,

  // ── 78: Chronicle: The Prophet (Volume Oracle) ──
  78: `This is the indicator that changed how our users approach trade selection. Before checking entries, they check the regime. It takes five seconds and filters out half the bad trades before they happen.`,

  // ── 88: Chronicle: Birth of the Elite Seven ──
  88: `Every indicator is non-repainting. What you see on the chart is what actually happened — no retroactive edits, no hindsight magic. Your backtests reflect reality, not fantasy.`,

  // ── 98: Chronicle: The Council Assembles ──
  98: `Confluence is not a buzzword here. When five or more indicators independently agree on a setup, the probability of a quality trade goes up significantly. The Council framework gives that alignment structure.`,

  // ── 108: Chronicle: The Pilot's Oath ──
  108: `The oath isn't marketing copy. It shapes every product decision we make. No "guaranteed returns" language. No fabricated win rates. No pressure tactics. If that sounds unusual, it says more about the industry than about us.`,

  // ── 118: Chronicle: The Hierarchy of Signals ──
  118: `Most traders start with the trigger and work backwards. The hierarchy forces you to start with the big picture — trend, structure, volume, momentum — and only then look for the entry. It changes everything.`,

  // ── 128: Chronicle: Why Non-Repainting Matters ──
  128: `A repainting indicator shows you perfect signals in hindsight, then fails in real-time. Every one of our seven indicators locks its signal on candle close. What you see is what you get — in backtests and live.`,

  // ── 131: Roadmap Preview (Marketing) ──
  131: `We don't build features in a vacuum. The last three major updates came directly from user requests. When enough traders ask for the same thing, it moves to the top of the roadmap. Your voice shapes the product.`,

  // ── 141: Signal Pilot Quiz (Marketing) ──
  141: `The quiz matches your trading style to the right starting indicator. Scalpers get pointed toward momentum tools. Swing traders start with cycles. Position traders begin with regime detection. No one-size-fits-all here.`,

  // ── 151: Success Story (Marketing) ──
  151: `The biggest shift wasn't the indicators — it was the education. Understanding market structure, liquidity, and regime context gave the tools meaning. Without that foundation, any indicator is just lines on a chart.`,

  // ── 161: Compare vs Competitors / Black Friday ──
  161: `Lifetime access is the deal that keeps coming back by popular demand. Pay once, use every indicator forever — including all future updates. No recurring fees. No surprise price increases. One payment, permanent access.`,

  // ── 171: Free Trial Reminder (Marketing) ──
  171: `The education is always free regardless. 82 structured lessons from beginner to professional — no paywall, no time limit. The paid indicators are optional tools for traders who want to go further.`,

  // ── 188: Chronicle: The Scales of Truth (Plutus Flow) ──
  188: `Divergence between price and flow is one of the strongest early warnings in technical analysis. Plutus Flow automates that detection so you don't have to eyeball it across multiple timeframes.`,

  // ── 198: Chronicle: The Watchman's Vigil (Augury Grid) ──
  198: `Opportunity cost is the invisible killer in trading. Every hour you spend watching one chart is an hour you miss setups on dozens of others. The Watchman was built to solve exactly that problem.`,

  // ── 208: Chronicle: The Commander's Strategy (OmniDeck) ──
  208: `The average TradingView setup has 4-6 indicators competing for screen space. OmniDeck replaces that clutter with a single unified overlay. Same information, fraction of the visual noise.`,

  // ── 218: Chronicle: The Sovereign's Cycle (Pentarch) ──
  218: `Knowing your cycle phase before entering a trade is like checking the weather before sailing. You can still sail in a storm — but you adjust your approach. Pentarch gives you that context automatically.`,

  // ── 228: Chronicle: The Scales' Balance (Plutus Flow) ──
  228: `Smart money doesn't announce itself. But flow analysis reveals the footprint. When price rises on declining flow, institutions are likely selling into retail enthusiasm. The Scales catch that divergence.`,

  // ── 238: Chronicle: The Cartographer's Journey (Janus Atlas) ──
  238: `Manual support and resistance is subjective — two traders draw different lines. Janus Atlas uses algorithmic detection across multiple timeframes, removing the guesswork. The levels are consistent every time.`,

  // ── 248: Chronicle: The Prophet's Revelation (Volume Oracle) ──
  248: `A rally without volume conviction is a rally on borrowed time. Volume Oracle quantifies that conviction with statistical regime classification — not just "high volume" or "low volume" but the full picture.`,

  // ── 258: Chronicle: The Cartographer's First Map (Janus Atlas) ──
  258: `The breakthrough was multi-timeframe confluence. A 1H level means something. A 1H level that aligns with daily and weekly structure means everything. Janus Atlas finds those intersections automatically.`,

  // ── 268: Chronicle: The Arbiter's Balance (Harmonic Oscillator) ──
  268: `RSI says overbought. MACD says trend intact. Stochastic says sell. Who do you listen to? The Harmonic Oscillator synthesizes all of them into a single consensus so you stop second-guessing.`,

  // ── 278: Chronicle: The Watchman's Vigil (Augury Grid) ──
  278: `Augury Grid scans your watchlist and filters by condition — cycle phase, regime, momentum state. Instead of checking 50 charts manually, you see which symbols meet your criteria in one glance.`,

  // ── 288: Chronicle: The Commander's Strategy (OmniDeck) ──
  288: `Confluence scoring turns subjectivity into structure. Instead of "I think this looks good," OmniDeck tells you exactly how many of the seven indicators agree — and which ones dissent. Data over gut feel.`,

  // ── 291: 7-Day Money-Back Guarantee ──
  291: `We designed the refund process to be as simple as possible. No retention calls. No guilt trips. No 30-question survey. One message, full refund. If it's not right for you, we want that to be painless.`,

  // ── 300: 300 Posts Milestone ──
  300: `Every post in this library was written to teach, not to sell. Psychology, risk management, structure, smart money concepts — the content stands on its own even if you never buy an indicator.`,

  // ── 311: What Makes Us Different ──
  311: `The trading education space is full of promises. We chose a different lane: teach for free, build honest tools, let the results speak. No income screenshots. No "copy my trades." Just structured learning.`,

  // ── 321: Yearly Plan Value ──
  321: `$429 saved per year adds up fast. That's money you keep in your trading account. And the yearly plan includes the exact same features, support, and updates — nothing is held back from any tier.`,

  // ── 331: Free vs Paid Comparison ──
  331: `The free tier isn't a teaser — it's a full education. 82 lessons covering market structure, psychology, risk management, and smart money concepts. The paid tier adds professional tools for those who want them.`,

  // ── 341: Complete Indicator Overview ──
  341: `Seven indicators might sound like a lot. But each one answers a different question: Where are we in the cycle? What's the regime? Where are the levels? Which way is flow? Is momentum sustainable? What are other symbols doing?`,

  // ── 351: 350 Posts Milestone ──
  351: `350 posts and not a single "guaranteed returns" claim. Not one fabricated win rate. Not one income screenshot. We'll keep building content the same way — honest, transparent, and focused on process over profit.`,

  // ── 371: The Signal Pilot Promise ──
  371: `Promises are cheap in this industry. We back ours with structure: free education that proves we teach, non-repainting indicators that prove we build honestly, and a money-back guarantee that proves we stand behind it.`,

  // ── 381: Community Spotlight ──
  381: `Good communities are built on norms, not rules. Our norm: share your process, not just your wins. Ask genuine questions. Help the person behind you. That culture makes learning stick faster than any course.`,

  // ── 448: Chronicle: The Commander's Burden (OmniDeck) ──
  448: `Full confluence — all seven agreeing — is rare by design. When it happens, the setup carries weight. Most of the time, the Commander teaches patience. And patience is the trade most people refuse to take.`,

  // ── 458: Chronicle: The Scales of Truth (Plutus Flow) ──
  458: `New highs with falling flow is the classic distribution warning. Retail sees a breakout. Smart money sees an exit. Plutus Flow makes this divergence visible before price catches up to reality.`,

  // ── 468: Chronicle: The Cartographer's Map (Janus Atlas) ──
  468: `Fresh levels that haven't been tested carry more weight than levels touched five times. Janus Atlas grades this automatically — fresh zones get priority, retested zones get flagged. Structure awareness, not guesswork.`,

  // ── 478: Chronicle: The Sovereign's Cycle (Pentarch) ──
  478: `The distribution phase is where most retail traders lose money — buying the top because everything "looks bullish." Pentarch flags the cycle shift before the breakdown, giving you time to adjust.`,

  // ── 488: Chronicle: The Watchman's Vigil (Augury Grid) ──
  488: `Most traders watch 3-5 symbols. The Watchman scans 50+. The math is simple: more coverage means more opportunities found — without sacrificing the analysis depth on each one.`,

  // ── 498: Chronicle: The Council of Seven ──
  498: `Seven questions before every trade sounds like a lot. In practice, OmniDeck answers them in a single glance. The Council framework turns from a checklist into a habit — and habits build consistency.`,

  // ── 508: Chronicle: Origins of the Elite Seven ──
  508: `The philosophy behind the seven is simple: no single perspective is enough. Markets are multidimensional. Your analysis should be too. Each indicator was designed to fill one specific blind spot.`,

  // ── 518: Chronicle: The Eternal Dance ──
  518: `The traders who survive longest aren't the ones who predict best. They're the ones who adapt fastest. The Elite Seven gives you the data to adapt — cycle phase, regime, flow, momentum — all in real time.`,

  // ── 528: Chronicle: The Prophet's Warning (Volume Oracle) ──
  528: `High volatility regimes are where fortunes are made and lost. Volume Oracle flags the shift before the big move starts, giving you time to adjust position sizing and stop placement. Preparation beats reaction.`,

  // ── 538: Chronicle: The Cartographer's Journey (Janus Atlas) ──
  538: `"Price has memory" is not just a saying — it's measurable. Previous reaction zones attract price again and again. Janus Atlas maps those zones across timeframes so you trade with history, not against it.`,

  // ── 548: Chronicle: The Seven Virtues ──
  548: `These seven virtues map directly to the seven biggest mistakes traders make: impatience, confusion, imbalance, self-deception, poor measurement, inattention, and fragmented analysis. Each indicator addresses one.`,

  // ── 558: Chronicle: The Arbiter's Judgment (Harmonic Oscillator) ──
  558: `The difference between "overbought" and "still trending" is the difference between a winning trade and a losing one. The Arbiter judges sustainability — not just position on a scale.`,

  // ── 568: Chronicle: The Complete Picture ──
  568: `Using a single indicator is like reading one chapter of a book and claiming you know the story. The Elite Seven were designed as a system — seven chapters that together tell you what's actually happening.`,

  // ── 578: Chronicle: Epilogue — The Trader's Path ──
  578: `The tools don't trade for you. The education doesn't guarantee results. But they remove the excuses. If you have the discipline and the patience, the foundation is here — free lessons, honest tools, complete documentation.`,

  // ── 588: Chronicle Recap: Lessons from the Seven ──
  588: `Each lesson from the Seven maps to a real, practical trading decision you face every day. Which direction? How much risk? When to wait? When to act? The Chronicle isn't mythology — it's a decision-making framework.`,

  // ── 598: Final Chronicle Message ──
  598: `What started as mythology became a methodology. The Chronicle characters aren't just branding — they represent the analytical dimensions every serious trader needs. Seven perspectives, always available on your chart.`,

  // ── 608: The Signal Pilot Vision ──
  608: `Free education as a business model only works if the tools are good enough that informed traders want them. That's the accountability loop: we have to earn every subscription by teaching well and building honestly.`,

  // ── 621: Marketing (29 to go) ──
  621: `This content library doesn't expire and it doesn't get paywalled. Every lesson, every post, every insight stays accessible. We built it as a permanent resource — not a funnel that disappears after the sale.`,

  // ── 631: Marketing (19 remaining) ──
  631: `The real test of educational content: does it still hold up a year later? Our lessons on market structure, risk management, and psychology aren't trend-dependent. The principles are timeless. That's the point.`,

  // ── 641: Marketing (9 to go) ──
  641: `82 lessons. 7 indicators. Hundreds of supporting posts. All built on one principle: teach people to trade independently. No dependency on signals. No subscription traps. Just tools and knowledge.`,

  // ── 649: Marketing (1 remains) ──
  649: `What this content library represents: the belief that honest trading education can exist at scale. No "guru" theatrics. No income proof screenshots. Just structured, transparent teaching — post after post.`,

};

/* ────────────────────────────────────────────────────────── */

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  const skipped = [];

  for (const post of queue) {
    const newTweet = expansions[post.postNumber];
    if (newTweet && post.twitter && post.twitter.tweets) {
      if (post.twitter.tweets.length === 3) {
        const tweets = post.twitter.tweets;
        post.twitter.tweets = [tweets[0], tweets[1], newTweet, tweets[2]];
        updated++;
      } else {
        skipped.push({ postNumber: post.postNumber, currentLength: post.twitter.tweets.length });
      }
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');

  console.log(`Marketing expansion: ${updated} posts expanded from 3 -> 4 tweets`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} posts (already expanded or unexpected length):`);
    for (const s of skipped) {
      console.log(`  Post #${s.postNumber} — currently ${s.currentLength} tweets`);
    }
  }

  // Validate character counts
  let overLimit = 0;
  for (const [num, tweet] of Object.entries(expansions)) {
    if (tweet.length > 280) {
      console.warn(`WARNING: Post #${num} new tweet is ${tweet.length} chars (over 280 limit)`);
      overLimit++;
    }
  }
  if (overLimit === 0) {
    console.log('All new tweets are within the 280-character limit.');
  } else {
    console.warn(`${overLimit} tweets exceed the 280-character limit!`);
  }
}

main();
