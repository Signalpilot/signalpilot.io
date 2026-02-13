#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// postNumber -> array of 1-2 new tweets to insert before CTA
// 7 tweets (2 new) for: Wyckoff, ICT, market structure, confluence, risk mgmt, VSA, auction market theory, market maker models
// 6 tweets (1 new) for everything else
const deepens = {
  // ── POST 66 | FIBONACCI RETRACEMENTS (Lesson 15) ── 6 tweets
  66: [
    `Step-by-step: find a clear uptrend. Draw Fib from swing low to swing high. Wait for price to retrace to 61.8%. Look for a bullish engulfing candle at that level. Enter with a stop just below 78.6%. Target the prior high. That is a textbook Fib trade.`
  ],

  // ── POST 72 | TRADING JOURNALS (Lesson 17) ── 6 tweets
  72: [
    `After 30 trades, review your journal for patterns. You will likely find one setup that wins 70%+ of the time and another you keep taking that loses consistently. The journal reveals both. Cut the loser. Double down on the winner.`
  ],

  // ── POST 76 | BACKTESTING BASICS (Lesson 18) ── 6 tweets
  76: [
    `A variation worth trying: forward testing. After backtesting 100+ trades, run the same strategy on live charts in real time without risking money. If your forward results match the backtest within 10-15%, the edge is likely real. If they diverge, dig deeper.`
  ],

  // ── POST 79 | PAPER TRADING (Lesson 19) ── 6 tweets
  79: [
    `When NOT to paper trade: if you have been profitable in paper for 3+ months and keep finding reasons not to go live. At some point, paper becomes avoidance. The emotional edge only comes from real skin in the game. Graduate when the data says you are ready.`
  ],

  // ── POST 82 | GOING LIVE (Lesson 20) ── 6 tweets
  82: [
    `A good first-month target: break even. Seriously. If you can trade live for 30 days without losing money, you have proven you can manage emotions under pressure. Profit comes in month two and beyond. Survival is the first milestone.`
  ],

  // ── POST 86 | MARKET STRUCTURE (Lesson 21) ── 7 tweets
  86: [
    `How to trade a break of structure: wait for a BOS on the 4H chart. Then drop to the 15m and look for an order block or FVG near the broken level. Enter on the retest with a stop beyond the structure point. That is how structure becomes a trade.`,
    `Structure connects to everything. Order blocks form at structural turning points. FVGs appear during structural breaks. Liquidity pools sit at obvious structural levels. If you understand structure, every other concept becomes clearer.`
  ],

  // ── POST 89 | SUPPLY AND DEMAND ZONES (Lesson 22) ── 6 tweets
  89: [
    `A common variation: nested zones. A weekly demand zone contains a daily demand zone inside it. When the daily zone sits within the weekly zone, the probability of a bounce increases significantly. Always check the higher timeframe for zone overlap.`
  ],

  // ── POST 92 | FAIR VALUE GAPS (Lesson 23) ── 6 tweets
  92: [
    `Step-by-step FVG trade: identify an FVG on the 1H chart during the NY session. Set an alert at the top of the gap. When price returns, switch to the 5m chart and wait for a displacement candle out of the gap. Enter on the close. Stop below the gap. Target the recent high.`
  ],

  // ── POST 96 | INDUCEMENT & LIQUIDITY (Lesson 24) ── 6 tweets
  96: [
    `When NOT to trade inducement: during low-volume sessions. A sweep during the Asian session often lacks the volume to produce a real reversal. Inducement setups are most reliable during London and NY opens when institutions are actively engineering moves.`
  ],

  // ── POST 102 | LIQUIDITY POOLS (Lesson 26) ── 6 tweets
  102: [
    `Step-by-step: mark every equal high and equal low on the 4H chart. Draw a horizontal line at each cluster. Those are your liquidity pools. Now ask: where is price heading? Toward the nearest pool. Plan your entries around the reaction after the sweep, not before it.`
  ],

  // ── POST 106 | REVERSAL PATTERNS (Lesson 27) ── 6 tweets
  106: [
    `How reversal patterns connect to smart money concepts: a head and shoulders neckline break is often a break of structure. The right shoulder is a lower high. The neckline break is an MSS. Same move, two frameworks. Understanding both gives you deeper conviction.`
  ],

  // ── POST 109 | CONFLUENCE TRADING (Lesson 28) ── 7 tweets
  109: [
    `Step-by-step confluence trade: daily chart shows demand zone at $100. Draw Fib from recent swing — 61.8% lands at $101. 200 EMA sits at $100.50. Three factors within $1 of each other. Enter at $100.50, stop at $98, target $108. That is a stacked trade.`,
    `Confluence connects every concept in this course. Structure gives direction. S&D gives the zone. Fib gives the level. Volume confirms participation. When they all agree, you are not predicting — you are responding to evidence. That is how probability trading works.`
  ],

  // ── POST 112 | MOMENTUM TRADING (Lesson 29) ── 6 tweets
  112: [
    `How momentum connects to volume: strong momentum with rising volume is genuine. Strong momentum with declining volume is a warning — the move is losing participants. Always check volume alongside candle size. They should tell the same story.`
  ],

  // ── POST 116 | RISK MANAGEMENT DEEP DIVE (Lesson 30) ── 7 tweets
  116: [
    `Real chart scenario: you find a great setup but the stop distance requires risking 3% of your account. What do you do? Reduce position size until the risk is 1%. If that makes the position too small to be worth it, skip the trade entirely. There will always be another setup.`,
    `Risk management connects to every other concept. Structure defines your stop placement. Confluence determines your conviction level. Position sizing controls your exposure. Without risk management, even the best strategy will eventually blow up.`
  ],

  // ── POST 119 | VOLUME SPREAD ANALYSIS (Lesson 31) ── 7 tweets
  119: [
    `Step-by-step VSA read: look at a bar at a key support level. Compare its spread and volume to the prior 20 bars. Narrow spread on high volume? That is absorption — institutions are accumulating. Expect an up move. Wide spread on low volume? That is a weak test — expect failure.`,
    `VSA connects directly to Wyckoff. The Selling Climax is high volume, wide spread down. The Spring is a test on low volume. Absorption during the trading range is narrow spread, high volume. If you understand VSA, Wyckoff schematics become readable in real time.`
  ],

  // ── POST 122 | SWING TRADING FUNDAMENTALS (Lesson 32) ── 6 tweets
  122: [
    `When NOT to swing trade: during major news events like FOMC, NFP, or CPI releases. A swing position held through a high-impact event can gap against you overnight. Either close before the event or widen your stop and reduce size. Plan around the calendar.`
  ],

  // ── POST 126 | DAY TRADING ESSENTIALS (Lesson 33) ── 6 tweets
  126: [
    `A useful variation: the 2-trade rule. Limit yourself to a maximum of 2 trades per day. This forces you to wait for only your best setups. Quality over quantity. Most profitable day traders take fewer trades than you think. Discipline is the real edge.`
  ],

  // ── POST 142 | CORRELATION TRADING ── 6 tweets
  142: [
    `When NOT to rely on correlations: during regime changes. When the Fed shifts policy, correlations that held for months can invert overnight. BTC and stocks may suddenly decouple. Gold and DXY may move together. Always reassess correlations after major macro events.`
  ],

  // ── POST 149 | MTF CONFLUENCE ── 6 tweets
  149: [
    `How MTF analysis connects to risk management: the higher timeframe defines your stop level. The lower timeframe refines your entry. The difference between those two — entry to stop — is your risk. Better entries from lower timeframes mean tighter stops and bigger R multiples.`
  ],

  // ── POST 152 | GAP TRADING ── 6 tweets
  152: [
    `Step-by-step gap trade: Monday open, stock gaps down 2% on no news. That is likely a common gap. Wait 30 minutes for the open to settle. If price starts reclaiming, go long targeting the gap fill. Stop below the opening range low. Common gaps fill more often than not.`
  ],

  // ── POST 159 | MOVING AVERAGES (Education) ── 6 tweets
  159: [
    `When NOT to use moving averages: in choppy, range-bound markets. MAs are trend-following tools — they generate constant false signals when there is no trend. Before applying any MA strategy, confirm the market is trending. No trend, no MA trades.`
  ],

  // ── POST 162 | MARKET MAKER MECHANICS (Education) ── 6 tweets
  162: [
    `How this connects to your entries: instead of buying breakouts where market makers hunt stops, wait for the stop hunt to happen first. Let the breakout fail. Let the stops get triggered. Then enter in the opposite direction with the market maker flow, not against it.`
  ],

  // ── POST 166 | MA CROSSOVERS (Education) ── 6 tweets
  166: [
    `A useful variation: try the 9/21 EMA crossover on the 4H chart. When the 9 crosses above the 21, look for longs on the next pullback to the 9 EMA. Faster signals, more trades, but still filtered by the daily trend direction.`
  ],

  // ── POST 169 | FIBONACCI EXTENSIONS (Education) ── 6 tweets
  169: [
    `How extensions connect to other concepts: if your 161.8% extension lines up with a supply zone or a liquidity pool from the higher timeframe, that is a high-conviction target. Take profit there. When Fib math and market structure agree on a level, respect it.`
  ],

  // ── POST 182 | WYCKOFF ACCUMULATION SCHEMATIC ── 7 tweets
  182: [
    `Step-by-step: on the daily chart, find the Selling Climax — a high-volume capitulation candle. Mark the range from SC low to AR high. Watch for Secondary Tests on declining volume. When the Spring breaks below and reclaims on strong volume, that is your entry.`,
    `Wyckoff Accumulation connects directly to ICT concepts. The Spring is a liquidity sweep below support. The SOS is a break of structure. The LPS is an order block retest. Same institutional behavior, different labels. Learn both frameworks and your reads become sharper.`
  ],

  // ── POST 186 | WYCKOFF DISTRIBUTION SCHEMATIC ── 7 tweets
  186: [
    `Real chart example: after a long uptrend, a Buying Climax prints with 5x volume. Price drops to the AR, bounces to an ST near the BC high on weaker volume. Then an Upthrust breaks above on even weaker volume. Declining volume across peaks tells the story — distribution.`,
    `Wyckoff Distribution connects to ICT concepts too. The Upthrust is a liquidity sweep above resistance. The SOW is a market structure shift. The LPSY is a bearish order block retest. Wyckoff shows the macro structure. ICT shows the micro entries within it.`
  ],

  // ── POST 192 | AUCTION MARKET THEORY ── 7 tweets
  192: [
    `Step-by-step AMT trade: identify the value area using a volume profile. Price moves above the value area high and gets rejected. Enter short at the rejection, stop above the extreme, target the POC inside the value area. That is an unfair price being corrected.`,
    `AMT connects to every SMC concept. Balance zones are where accumulation happens. Imbalance moves create FVGs and displacement. Rejection from unfair prices is how liquidity sweeps work. Understand the auction and every price action concept has a deeper "why" behind it.`
  ],

  // ── POST 196 | DELTA VOLUME ANALYSIS ── 6 tweets
  196: [
    `How delta connects to VSA: a narrow-range bar with high volume (VSA absorption) will often show strong positive delta despite the bearish candle. Delta confirms what VSA suggests — buyers are absorbing sellers quietly. Both tools telling the same story increases your conviction.`
  ],

  // ── POST 199 | INTERMARKET ANALYSIS ── 6 tweets
  199: [
    `Step-by-step: before any trade, check the correlated leader. Trading ETH? Check BTC first. Trading gold? Check DXY. If the leader is at a key resistance and you are going long on the follower, your trade has a headwind. Align with the leader or wait.`
  ],

  // ── POST 202 | PRICE ACTION CONTEXT ── 6 tweets
  202: [
    `A practical checklist before every pattern trade: Is it at a key level? Check. Is the higher timeframe trend aligned? Check. Is volume above average? Check. Three yeses and you have context. Anything less, the pattern is just noise on a chart.`
  ],

  // ── POST 212 | LIQUIDITY VOIDS ── 6 tweets
  212: [
    `How voids connect to FVGs: a liquidity void is the macro view — the large empty space on the chart. The FVGs within that void are your micro entry zones. Map the void first, then look for FVGs at the edges. Enter where the FVG and void boundary overlap for maximum precision.`
  ],

  // ── POST 216 | BREAKER BLOCKS ── 6 tweets
  216: [
    `Step-by-step breaker trade: find a bullish OB that held twice then broke on the third test. Mark that zone. When price rallies back into it, watch for a bearish rejection candle. Enter short, stop above the zone, target the next demand below. Failed support is now resistance.`
  ],

  // ── POST 219 | MITIGATION BLOCKS ── 6 tweets
  219: [
    `When NOT to trade mitigation blocks: when the block is very old. A mitigation zone from 6+ months ago may no longer hold institutional interest. Recent blocks — within the last few weeks — are more likely to still have unfilled orders. Freshness matters.`
  ],

  // ── POST 222 | KILL ZONES ── 6 tweets
  222: [
    `How kill zones connect to other concepts: Asia sets the liquidity pools. London sweeps those pools (manipulation). NY delivers the real move (distribution). Layer sessions over AMD and liquidity concepts and the market becomes far more readable.`
  ],

  // ── POST 226 | PREMIUM & DISCOUNT ZONES ── 6 tweets
  226: [
    `Step-by-step: draw Fib from the recent swing low to swing high. The 50% level is equilibrium. Any OB or FVG below 50% is a discount entry. Any OB or FVG above 50% is a premium entry. Only take longs in discount. Only take shorts in premium. This one filter changes your R:R dramatically.`
  ],

  // ── POST 229 | ICT MARKET STRUCTURE SHIFT ── 7 tweets
  229: [
    `Step-by-step MSS trade: price is in an uptrend. A liquidity sweep takes the high, then price drops and closes below the last HL. That is the MSS. Drop to the 15m chart and find the bearish order block that formed during the breakdown. Enter short on the retest. Stop above the swept high.`,
    `MSS connects to Wyckoff. In accumulation, the Spring is followed by a bullish MSS — price breaks above the last lower high. In distribution, the Upthrust is followed by a bearish MSS — price breaks below the last higher low. Wyckoff gives the context. MSS gives the entry trigger.`
  ],

  // ── POST 242 | SESSION TIMING & INSTITUTIONAL FLOW ── 6 tweets
  242: [
    `A useful variation: the "London sweep + NY continuation" model. London sweeps the Asian range low, reverses, and trends up. NY opens and continues the London direction. If you missed the London entry, wait for a pullback during early NY and enter with the established trend.`
  ],

  // ── POST 246 | FAIR VALUE GAPS: INSTITUTIONAL FOOTPRINTS ── 6 tweets
  246: [
    `When NOT to trade FVGs: when they form during low-volume periods like late NY or the Asian session. These gaps lack institutional backing and often fail to produce reactions. Focus on FVGs created during London or NY kill zones — those are the footprints worth following.`
  ],

  // ── POST 249 | LIQUIDITY POOLS: WHERE STOPS CLUSTER ── 6 tweets
  249: [
    `Step-by-step: mark every swing high and low on the 4H chart. Draw dotted lines at equal highs and equal lows. Add round numbers like $40k, $50k. Those are your liquidity pools. Now watch: price will gravitate toward the nearest pool. Plan your trade around what happens after the sweep.`
  ],

  // ── POST 252 | ORDER BLOCKS: INSTITUTIONAL ENTRY ZONES ── 6 tweets
  252: [
    `How order blocks connect to FVGs: the best order blocks have an FVG directly above or below them. The OB is where institutions positioned. The FVG is the imbalance their positioning created. When price returns to an OB that has an overlapping FVG, the reaction is often stronger.`
  ],

  // ── POST 256 | BREAKER BLOCKS: FAILED ORDER BLOCKS ── 6 tweets
  256: [
    `How breakers connect to market structure: when an OB fails, it usually coincides with a break of structure. The failed bullish OB becomes a bearish breaker AND marks the BOS point. When price retests that level, you have two reasons to sell — structural resistance and institutional exit. That is real confluence.`
  ],

  // ── POST 259 | MITIGATION BLOCKS: UNFILLED ORDERS ── 6 tweets
  259: [
    `Step-by-step: find a zone where price rallied aggressively but later reversed and broke structure to the downside. That origin zone is your mitigation block. When price eventually returns there, institutions will sell to close their underwater longs. Enter short on the reaction with a stop above the zone.`
  ],

  // ── POST 262 | DISPLACEMENT: MOMENTUM REVEALS INTENT ── 6 tweets
  262: [
    `How displacement connects to order blocks: the candle before a displacement move is the order block. The displacement itself often creates an FVG. So one event — displacement — gives you both the entry zone (OB) and the confirmation (FVG). That is why displacement is one of the first things to look for on a chart.`
  ],

  // ── POST 269 | KILL ZONES: HIGH-PROBABILITY WINDOWS ── 6 tweets
  269: [
    `A practical variation: the London-only model. Trade exclusively during the 2-5 AM EST window. Wait for the Asian range to get swept. Enter on the reversal. Take profit before NY opens. Some traders build their entire edge around one session. Specialization beats trying to trade all day.`
  ],

  // ── POST 272 | MARKET MAKER MODELS ── 7 tweets
  272: [
    `Real chart walkthrough: on a 15m chart, price ranges from 2-8 AM (accumulation). At 8:30 AM, a sharp drop takes the session low — that is the manipulation. By 9:15, price reclaims the range and starts trending up. By 10:30, it has cleared the range high. That is distribution. Full AMD in under 3 hours.`,
    `The AMD model connects to everything. Accumulation is the range where order blocks form. Manipulation is the liquidity sweep that creates the Spring or Upthrust. Distribution is the displacement move that leaves FVGs. One model, every concept inside it. Learn AMD and the puzzle pieces click together.`
  ],

  // ── POST 276 | LIQUIDITY SWEEPS VS BREAKOUTS ── 6 tweets
  276: [
    `How to combine this with other concepts: a sweep above a key high during the NY kill zone, followed by a bearish MSS on the 5m chart, with a bearish OB forming at the swept level — that is a full setup. Sweep identifies the trap. MSS confirms direction. OB gives the entry. Layer the concepts.`
  ],

  // ── POST 279 | PREMIUM & DISCOUNT ARRAYS ── 6 tweets
  279: [
    `Step-by-step filter: before any trade, draw the Fib from the current range low to high. Check where your entry sits. If you are buying above the 50% level, you are buying premium. Reduce size or skip entirely. This 10-second check prevents some of your worst entries.`
  ],

  // ── POST 282 | INDUCEMENT: THE TRAP BEFORE THE MOVE ── 6 tweets
  282: [
    `How inducement connects to the AMD model: inducement IS the manipulation phase. The minor level grab is the fake move designed to create liquidity for the real move. Once you see inducement as part of the AMD sequence rather than a standalone event, the entire model becomes clearer.`
  ],

  // ── POST 292 | MARKET STRUCTURE FUNDAMENTALS ── 7 tweets
  292: [
    `Step-by-step: open a daily chart. Mark the last 5 swing highs and 5 swing lows. Connect the dots. Are highs rising and lows rising? Bullish. Falling? Bearish. Now zoom into the 4H. Does it agree with the daily? If both say bullish, only look for longs. Structure on two timeframes is your directional filter.`,
    `Structure is the foundation that every other concept builds on. Order blocks form at structural turning points. FVGs appear when structure breaks. Liquidity pools sit at structural highs and lows. MSS signals the structure is changing. Master this first and everything else has context.`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    const d = deepens[post.postNumber];
    if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 5) {
      const tweets = post.twitter.tweets;
      const cta = tweets.pop(); // remove CTA
      tweets.push(...d);        // add new tweets
      tweets.push(cta);         // put CTA back at end
      post.twitter.tweets = tweets;
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log('Education deepen A: ' + updated + ' posts expanded to 6-7 tweets');
}

main();
