#!/usr/bin/env node
/**
 * Expand Education Batch 1 — Posts 49–129 (24 education posts)
 * Adds 2 new tweets (positions 3 & 4) before the CTA, expanding 3→5 tweets.
 *
 * Tweet 3: Practical example / how to apply
 * Tweet 4: Common mistake / pro tip
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// Map of postNumber -> [new_tweet_3, new_tweet_4] to insert before CTA
const expansions = {
  49: [
    `Example: AAPL making higher highs and higher lows on the daily? Your bias is long. You only look for buy setups until structure breaks. That one filter alone removes half your losing trades.`,
    `Biggest mistake: calling a trend change too early. One lower high in an uptrend isn't a reversal — it's a pullback until proven otherwise. Wait for a confirmed break of structure before flipping bias.`
  ],
  52: [
    `Try this: pull up any chart and mark the levels where price bounced at least twice. Those are your key S/R zones. Now watch what happens when price approaches them again — the reaction tells you everything.`,
    `Common mistake: drawing too many levels. If your chart looks like a barcode, you have too many. Focus on the 2-3 levels where price reacted most violently. Quality over quantity.`
  ],
  59: [
    `Practical use: instead of trading the cross itself, wait for a golden cross, then buy the FIRST pullback to the 50 MA. The cross gives you direction. The pullback gives you a better entry and tighter stop.`,
    `Pro tip: the shorter the MA periods, the more false signals. A 9/21 cross fires constantly. A 50/200 cross is rare but meaningful. Match the MA speed to your trading timeframe.`
  ],
  62: [
    `Real example: a hammer candle at a key demand zone after a 3-day selloff with volume drying up — that's a story of seller exhaustion. The same hammer in the middle of a range? Just noise.`,
    `Mistake most make: memorizing 30 patterns and trying to spot them all. Focus on 3-4 patterns you understand deeply. A trader who masters engulfing candles will outperform someone who half-knows twenty patterns.`
  ],
  66: [
    `How to apply: draw Fib from the recent swing low to swing high. If price pulls back to 61.8% and that level aligns with a previous support zone, you have a high-confluence entry with a defined stop just below.`,
    `Pro tip: Fib levels work best in trending markets. In choppy, sideways action, price will slice through every level without respect. Check the trend first, then draw your fibs.`
  ],
  69: [
    `Real scenario: stock breaks above resistance on 3x average volume. That's institutional participation — the breakout is likely real. Same breakout on half the normal volume? Likely a trap. Volume is your lie detector.`,
    `Common trap: looking at volume in isolation. A single high-volume bar means nothing without context. Compare it to the average. Compare it to recent bars. Relative volume matters more than absolute volume.`
  ],
  72: [
    `Start simple: after each trade, write three things — what you planned, what you actually did, and why they differed. That gap between plan and execution is where your biggest improvements hide.`,
    `Mistake traders make: only journaling losing trades. Your winners contain just as much information. Was it skill or luck? Did you follow your plan? Would you take that setup again? Journal everything.`
  ],
  76: [
    `How to backtest properly: pick ONE strategy. Define exact entry, exit, and stop rules. Go through 6+ months of data, bar by bar. Record every signal whether you like the outcome or not. No skipping.`,
    `The trap: curve-fitting. If you keep adjusting rules until the backtest looks perfect, you've memorized the past, not found an edge. Your rules should be simple enough to explain in two sentences.`
  ],
  79: [
    `Here's a good paper trading drill: take 20 trades using one setup only. Same rules every time. Track the results. If you can't be consistent in paper, you won't be consistent with real money.`,
    `Common mistake: paper trading with unrealistic size. If your real account is $5K, don't paper trade with $100K. Match the conditions exactly. The habits you build now are the habits you'll trade with live.`
  ],
  82: [
    `Real talk: your first live month will feel completely different. A $30 loss on paper was nothing. That same $30 loss live will make you question everything. This is normal. Stick to the process.`,
    `Pro tip: keep a separate "emotions log" for your first month live. Before and after each trade, write one word for how you feel. You'll quickly see which emotions lead to your worst decisions.`
  ],
  86: [
    `How to use it: open the daily chart. Mark the most recent swing high and swing low. Are they both higher than the previous ones? Bullish structure. Both lower? Bearish. Mixed? No clear trend — sit tight.`,
    `Mistake: trading the break of structure before it confirms. A wick below the last higher low isn't a break — it's a test. Wait for a candle CLOSE beyond the level. Wicks lie. Closes confirm.`
  ],
  89: [
    `How to find demand zones: look for the last consolidation before a strong rally. That tight range where price based before exploding upward — that's your demand zone. Mark the entire range, not a single line.`,
    `Pro tip: the strongest zones are ones that haven't been retested yet. Once price returns and bounces from a zone, it weakens. A fresh, untested zone has unfilled orders waiting. Trade the freshest zones first.`
  ],
  92: [
    `How to trade it: mark the FVG zone on your chart. When price returns to fill the gap, don't enter blindly — wait for a reaction. A rejection candle or displacement out of the gap confirms the zone is active.`,
    `Mistake: expecting every FVG to fill. Some gaps on strong trends never get revisited. Use FVGs as potential zones of interest, not guaranteed entries. Confluence with other levels makes them far more reliable.`
  ],
  96: [
    `Example: price sits just below a key resistance with equal highs. Stops are clustered above. Price spikes through, triggers the buy stops, then immediately reverses. The breakout traders are now trapped. That's inducement.`,
    `How to protect yourself: never place your stop exactly at the obvious level. Give it room beyond the level — or better yet, wait for the sweep to happen first and trade the reversal that follows.`
  ],
  99: [
    `How to trade a bull flag: after a strong impulse move up, wait for the tight pullback on declining volume. Enter when price breaks above the flag's upper trendline with volume. Target the length of the initial impulse.`,
    `Common error: confusing a continuation pattern with a reversal. If the pullback retraces more than 50% of the impulse, it's likely not a flag — it's a deeper correction. Shallow pullbacks signal strength.`
  ],
  102: [
    `Example: price consolidates at the same level three times, forming equal lows. Every trader sees that "support." Their stops sit just below. That cluster is a liquidity pool — and smart money knows exactly where it is.`,
    `Pro tip: when you see obvious equal highs or equal lows, ask yourself who is trapped on the other side. Don't place stops where everyone else does. Either widen your stop or wait for the sweep before entering.`
  ],
  106: [
    `How to trade a double top: don't short the second touch — that's anticipation. Wait for the neckline break and a close below it. Then enter on the retest of the broken neckline from below. That's confirmation.`,
    `Biggest mistake: seeing reversal patterns everywhere. Not every M-shape is a double top. It only counts at the end of a sustained uptrend with clear exhaustion signals. Context and location matter more than the shape.`
  ],
  109: [
    `Real example: price pulls back to the 61.8% Fib, which aligns with the 200 EMA and sits inside a demand zone. Three independent factors pointing to the same area. That's a trade worth taking with conviction.`,
    `The trap: forcing confluence that isn't there. If you have to squint to see the alignment, it's not confluence. Genuine confluence is obvious. If you're convincing yourself, step away.`
  ],
  112: [
    `How to read it on a chart: during an uptrend, look at the candle bodies. Are they getting larger with each push? Momentum is increasing. Are they shrinking while price still rises? Momentum is fading — be cautious.`,
    `Mistake: chasing a move with strong momentum. By the time momentum is obvious to everyone, the easy part is over. The best entries come when momentum is about to shift — not after it already has.`
  ],
  116: [
    `Do the math: with a $10,000 account risking 1% per trade, your max loss is $100. That means if your stop is $2 away from entry, your position size is 50 shares. Always calculate backward from your risk.`,
    `The rule most break: adding to a losing position. "Averaging down" without a plan is how small losses become account-ending disasters. If the trade is wrong, accept the loss. Don't double down on a broken thesis.`
  ],
  119: [
    `How to apply VSA: when you see a narrow-range bar on unusually high volume at a support level, that's absorption. Big players are quietly buying while price barely moves. Watch for an expansion move to follow.`,
    `Mistake: only looking at volume bars in isolation. VSA requires you to compare each bar to its neighbors. A "high volume" bar only matters relative to what came before it. Always compare — never judge in isolation.`
  ],
  122: [
    `Ideal swing setup: daily chart shows price bouncing off the 50-day MA with a bullish engulfing candle. Enter the next day, stop below the MA, target the prior swing high. Hold time: 5-10 days. Clean and simple.`,
    `Pro tip: swing trading works best in trending markets. In a choppy, sideways market, your swings will get stopped out repeatedly. Check the higher timeframe trend first. No trend, no swing trades.`
  ],
  126: [
    `What a good day trading session looks like: 2-3 trades, all from your playbook, all with defined risk. You hit one winner, one loser, one breakeven. You're net positive and done by lunch. That's sustainable.`,
    `Reality check: most day traders lose money in their first year. The ones who survive treat it like a business with strict hours, defined setups, and a daily loss limit. When you hit max loss, you shut it down. No exceptions.`
  ],
  129: [
    `Example: you enter a long with full size. Price moves 1R in your favor. Take 50% off, move stop to breakeven. Now you're in a free trade with a runner. That's how scaling out turns good trades into great ones.`,
    `The cardinal sin: adding to losers. If your trade is underwater, the thesis is failing. Adding more capital to a losing position is how manageable losses become catastrophic ones. Only add to winners.`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    const exp = expansions[post.postNumber];
    if (exp && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;
      post.twitter.tweets = [tweets[0], tweets[1], exp[0], exp[1], tweets[2]];
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Education expansion 1: ${updated} posts expanded from 3→5 tweets`);
}

main();
