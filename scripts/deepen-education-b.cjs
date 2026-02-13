#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// Education deepen B: expand 49 education posts from 5 tweets to 6-7 tweets.
// 7 tweets for: Wyckoff, ICT, market structure, confluence, risk management, VSA, order blocks, fair value gaps, liquidity concepts.
// 6 tweets for everything else.
// New tweets are inserted before the CTA (last tweet).

const deepens = {
  // --- 6-tweet posts (1 new tweet each) ---

  295: [
    // Pentarch: The Five Signals Explained
    `The key is reading them together, not in isolation. A TD signal during a BDN phase means something very different than a TD in a neutral environment. The phase context shapes how you interpret each signal.`
  ],

  297: [
    // The Danger of Paper Trading Too Long
    `One practical bridge: trade real money with a position so small it barely matters financially, but large enough that you feel it emotionally. Even $10 at risk changes your decision-making. That's the data you need.`
  ],

  305: [
    // Harmonic Oscillator: Momentum Components
    `When all components align, the signal is strong. When they conflict, the market is transitioning. That disagreement between components is itself information. It tells you to wait for clarity rather than force a trade.`
  ],

  315: [
    // Janus Atlas: Level Strength
    `A practical workflow: before each session, check which Janus Atlas levels scored highest on your chart. Build your watchlist around those zones. Ignore everything else. Fewer levels, better focus, better trades.`
  ],

  365: [
    // OmniDeck: Unified View
    `Think of it as pre-flight checks. A pilot doesn't check one gauge. OmniDeck gives you cycles, momentum, flow, volume, and structure in a single glance. If something is off, you see it before you commit capital.`
  ],

  375: [
    // Volume Oracle: Volume Regimes
    `One more detail that matters: regime transitions. The shift from drought to accumulation is often where the best setups form. The shift from climax to distribution is where exits should happen. Watch the transitions.`
  ],

  382: [
    // Correlation in Trading
    `Correlation also applies across timeframes. A stock correlated with the S&P on the daily might diverge on intraday. Always check correlation on the timeframe you actually trade, not just the one that looks convenient.`
  ],

  385: [
    // Janus Atlas: Timeframe Hierarchy
    `Practical tip: if you trade the 1H chart, always check the daily and weekly levels first. Your 1H entry should align with at least one higher-timeframe zone. If it doesn't, the probability drops significantly.`
  ],

  420: [
    // Backtesting in TradingView
    `After Bar Replay, use Strategy Tester for automation. Write your rules in Pine Script, run the backtest, and compare your manual results to automated results. If they differ significantly, your manual execution has leaks.`
  ],

  502: [
    // Backtesting Fundamentals
    `One more rule: test across different market conditions. A strategy that works in a trending market may fail in a range. Your backtest should include both. If it only works in one environment, you need a regime filter.`
  ],

  512: [
    // Scaling Into Positions
    `Position sizing for scale-ins: plan total risk upfront. If risking 1% total, your first entry might risk 0.4%, the second 0.35%, the third 0.25%. Each add keeps total risk within your rules regardless of how many entries trigger.`
  ],

  516: [
    // Scaling Out of Positions
    `One nuance: don't scale out too early. Taking profit at 0.5R just to feel safe leaves money on the table. Your first target should be meaningful, at least 1R, or the math starts working against you over time.`
  ],

  522: [
    // Correlation in Trading (deeper)
    `Use correlation to your advantage: if two assets are negatively correlated, a position in each can act as a natural hedge. You reduce portfolio volatility without reducing opportunity. That's smart diversification.`
  ],

  526: [
    // Volatility Cycles
    `Volume Oracle helps identify these cycles in real time. When it flags a drought regime shifting to accumulation, you're seeing the compression-to-expansion transition as it forms. That's your preparation signal.`
  ],

  529: [
    // Mean Reversion Basics
    `Mean reversion works best in range-bound markets. In a strong trend, the "mean" itself is moving, so reverting to it just means buying a pullback. Know which environment you're in before applying this approach.`
  ],

  532: [
    // Trend Strength Assessment
    `Pentarch automates this assessment. When it reads IGN phase with strong conviction, the trend is healthy. When it shifts to WRN, the trend is weakening. Let the system confirm what you see in the price action.`
  ],

  542: [
    // False Breakout Recognition
    `A systematic approach: mark a breakout as "unconfirmed" until the candle closes beyond the level and the next candle holds above it. Two-candle confirmation filters out most fakeouts without sacrificing too much speed.`
  ],

  546: [
    // Gap Trading Basics
    `Time matters too. A gap at the weekly open has different implications than a gap on a random Wednesday. Gaps on Mondays after weekend news often carry more institutional intent and are less likely to fill quickly.`
  ],

  556: [
    // Divergence Trading Fundamentals
    `Harmonic Oscillator makes divergence analysis richer. Instead of watching one oscillator, you see which momentum components are diverging. When multiple components diverge simultaneously, the warning carries more weight.`
  ],

  559: [
    // Trend Reversal Patterns
    `Volume is the hidden confirmation most traders skip. A double top with declining volume on the second peak is far more reliable than one with equal volume. The volume tells you conviction is fading before price confirms it.`
  ],

  579: [
    // Trading Journal Best Practices
    `The most underused journal metric: execution grade. Rate each trade 1-10 on how well you followed your plan, regardless of outcome. A losing trade with a 9/10 execution is a good trade. Track process, not just results.`
  ],

  582: [
    // Entry Trigger Types
    `Build a trigger checklist for each setup type. When your setup appears, run through the checklist. If all trigger conditions are met, enter. If even one is missing, wait. This eliminates impulsive entries systematically.`
  ],

  592: [
    // Trading Plan Essentials
    `Update your plan quarterly. Markets evolve, your skills improve, and what worked six months ago might need adjustment. A living plan that adapts is worth ten static plans collecting dust in a folder somewhere.`
  ],

  606: [
    // Price Action vs Indicators
    `The best traders use indicators to see what price action alone can't reveal: hidden momentum shifts, volume regime changes, cycle phase transitions. The chart tells the story. Indicators reveal the subtext beneath it.`
  ],

  // --- 7-tweet posts (2 new tweets each) ---

  329: [
    // Stop Loss Placement (risk management)
    `ATR-based stops adapt to volatility. In a volatile market, a 20-pip stop is too tight. Use 1.5x the ATR to set a stop that respects current market conditions. The market tells you how much room it needs.`,
    `Another approach: use the most recent swing structure. For longs, stop below the last higher low. For shorts, stop above the last lower high. If that structure breaks, the trend premise is gone and so is your trade.`
  ],

  335: [
    // Pentarch: Cycle Phase Transitions (market structure)
    `Practical application: when Pentarch shifts from IGN to WRN, reduce position size on new entries by half. You're not exiting yet, but you're acknowledging that the easy part of the trend may be over. Respect the transition.`,
    `The BDN to TD transition is where the next opportunity begins. Most traders are still bearish from the BDN phase. But TD signals the selling is exhausting. That's where contrarian setups with the best R:R emerge.`
  ],

  355: [
    // Plutus Flow: Accumulation vs Distribution (VSA)
    `Volume alone doesn't tell this story. A high-volume day could be accumulation or distribution. Plutus Flow uses statistical OBV analysis to differentiate. It asks: is this volume being used to buy or to sell? That distinction matters.`,
    `Combine this with Pentarch: if Pentarch signals TD (early cycle) and Plutus Flow shows accumulation, you have two independent systems agreeing that a bottom is forming. That's the kind of confluence that changes conviction.`
  ],

  379: [
    // Stop Loss Types (risk management)
    `Choosing the right type: scalping and day trading often use fixed or ATR-based stops for consistency. Swing trading benefits from structure-based stops because the thesis is structural. Trending trades use trailing stops to maximize the move.`,
    `The worst stop type is the emotional one: moving it when price approaches because you "feel" it will reverse. That's not risk management, it's hope. Decide your stop before you enter. Then leave it alone unless your plan says otherwise.`
  ],

  402: [
    // Wyckoff Accumulation Schematic (Wyckoff)
    `Volume is the confirmation Wyckoff traders watch most. The selling climax has the highest volume. Each successive test should show declining volume. The Spring happens on low volume. If the Spring has heavy volume, it might not be a Spring at all.`,
    `Timeframe matters: Wyckoff accumulation on the daily chart takes weeks to months. On the 1H chart, it takes days. Match your timeframe to your trading style. But always check if the higher-timeframe context supports the pattern you're seeing.`
  ],

  406: [
    // Wyckoff Distribution Schematic (Wyckoff)
    `Volume profile during distribution: rallies have declining volume, declines have increasing volume. This is the mirror of accumulation. If the volume pattern doesn't match, question whether it's genuine distribution or just a range.`,
    `How Plutus Flow helps: during distribution, Plutus Flow will show flow declining even if price remains elevated. That divergence between price and flow is the Wyckoff distribution playing out in real-time data, not just a schematic on paper.`
  ],

  409: [
    // ICT Concepts Overview (ICT)
    `The progression that works: learn order blocks first (where institutions acted). Then fair value gaps (where price moved too fast). Then liquidity pools (where stops cluster). Each concept builds on the previous one. Don't skip steps.`,
    `Integration with tools: Janus Atlas identifies the key levels. Plutus Flow shows the institutional flow. Pentarch confirms the cycle phase. ICT concepts provide the narrative framework. Together, the picture becomes three-dimensional.`
  ],

  412: [
    // Market Structure Shift (market structure)
    `Confirmation matters: one broken swing doesn't always mean a full reversal. Look for a break of structure followed by a retest that holds. The break changes the structure. The retest confirms the change. That sequence is what gives you a high-probability entry.`,
    `Pentarch tracks this systematically. When structure shifts, the cycle phase often transitions too. An MSS accompanied by a Pentarch phase shift from IGN to WRN carries far more weight than an MSS in isolation.`
  ],

  422: [
    // Liquidity Concepts (liquidity)
    `Liquidity and time are connected. Session opens create fresh liquidity at predictable times. London open targets Asian session highs and lows. NY open targets London session highs and lows. The pattern repeats because institutions need those orders.`,
    `Practical rule: before each session, mark the previous session's high and low. Those are the most probable liquidity targets. If price sweeps one of those levels and shows rejection, you have a trade setup with a clear thesis and a defined stop.`
  ],

  429: [
    // Imbalance & Fair Value Gaps (fair value gaps)
    `FVGs also have timeframe hierarchy. A weekly FVG is far more significant than a 5-minute one. Start your analysis on the higher timeframe to identify the important gaps, then drop to lower timeframes for precision entry within those zones.`,
    `Combining FVGs with order blocks: when an FVG overlaps with an order block, that zone has both institutional order interest and price inefficiency to resolve. That overlap creates a higher-probability reaction zone than either alone.`
  ],

  432: [
    // Inducement & Trap Setups (liquidity)
    `The key detail: inducement works because of predictable human behavior. Traders place stops at obvious levels. Breakout traders enter at obvious breaks. Institutions know this and engineer moves to exploit those predictable behaviors.`,
    `To flip from hunted to hunter: stop placing stops at obvious levels. Stop entering breakouts without confirmation. Wait for the inducement move to complete, then enter in the opposite direction with a stop beyond the trap. Now you're the one using the liquidity.`
  ],

  436: [
    // Premium & Discount Zones (ICT/market structure)
    `Zone classification changes your R:R automatically. Buying in the discount zone means your stop is naturally closer and your target (in the premium zone) is naturally farther. The math improves without changing your strategy. Zones do the work.`,
    `Combine zones with FVGs and order blocks: a bullish order block in the discount zone with an FVG is one of the highest-probability setups in ICT methodology. Three factors stacking at one price. That's not hope, that's preparation.`
  ],

  439: [
    // Mitigation Blocks (order blocks)
    `How to distinguish mitigation from fresh order blocks: fresh OBs are untested, price has never returned. Mitigation blocks have been visited before. Fresh OBs tend to produce stronger reactions because the orders are untouched.`,
    `Mitigation often completes in one visit. Once price returns and the trapped traders exit, the zone is spent. Expecting multiple strong reactions from a mitigation block is a common error. One reaction, then the zone loses significance.`
  ],

  442: [
    // Breaker Blocks (order blocks)
    `Breakers are especially powerful when they align with higher-timeframe structure. A breaker block at a daily resistance level is more significant than one floating in the middle of a range. Context always elevates the pattern.`,
    `Trading the breaker: wait for price to return to the breaker block zone, then look for a rejection candle or displacement in the expected direction. The entry is on the retest, not the initial break. Patience turns a concept into a trade.`
  ],

  452: [
    // Wyckoff Accumulation Schematic (Wyckoff) - deeper
    `The SOS (Sign of Strength) is your green light. Price breaks above the trading range with expanding volume. This is the first move that proves the accumulation worked. The LPS (Last Point of Support) pullback after the SOS is the professional entry.`,
    `Real-world filter: compare the accumulation you see to the broader market context. Wyckoff accumulation in a stock while the sector and index are also in accumulation is far more reliable than one forming against the macro trend.`
  ],

  456: [
    // Wyckoff Distribution Schematic (Wyckoff) - deeper
    `The SOW (Sign of Weakness) breaks below the range with increasing volume. That's confirmation that distribution is complete and markdown is beginning. The LPSY after the SOW is the professional short entry with the tightest risk.`,
    `A critical filter: check whether Plutus Flow is confirming distribution. If the schematic looks like distribution but flow is still positive, you might be looking at re-accumulation instead. Volume flow data adds a layer of objectivity to the pattern.`
  ],

  459: [
    // Inverse Fair Value Gaps (fair value gaps)
    `The sequence matters: original FVG forms, price returns to fill it, the filled zone becomes the inverse FVG. This gives you two trades from one area. The first when the gap is fresh, the second when it inverts. Efficiency in your zone analysis.`,
    `Not every filled FVG inverts cleanly. The best inverse FVGs form when the initial fill happens on low volume, suggesting the gap was filled mechanically, not by conviction. High-volume fills are more likely to continue through rather than invert.`
  ],

  462: [
    // Liquidity Sweeps vs Grabs (liquidity)
    `A sweep with displacement is the highest-probability setup of the three. The quick wick shows liquidity was taken. The displacement candle shows institutional conviction in the opposite direction. Together, they form a complete narrative.`,
    `Map this to your stop placement: if you're long, your stop should survive a sweep but not a grab. Place it just beyond the level where a sweep wick would reach, but recognize that a grab means something bigger is happening and your thesis may be wrong.`
  ],

  466: [
    // Order Blocks Deep Dive (order blocks)
    `Refinement technique: within an order block, the most reactive zone is the body of the candle, not the wicks. Narrow your entry zone to the candle body for tighter stops and better R:R. The wick area is the cushion, not the target.`,
    `Timeframe matters for OB validity. A daily order block is more significant than a 5-minute one. Start analysis on the higher timeframe to identify key blocks, then use the lower timeframe to refine your entry within that zone.`
  ],

  469: [
    // Time-Based Liquidity Concepts (liquidity)
    `Kill zones are time-based liquidity windows: London open (2-5 AM EST), NY open (8-11 AM EST), London close (10-12 PM EST). Most institutional moves happen during these windows because that's when liquidity is deepest and orders execute cleanly.`,
    `Combine time and price: mark the previous day high and low, then watch what happens during the kill zone. If London open sweeps the Asian low and reverses during the kill zone window, you have both time and price confirming the setup.`
  ],

  486: [
    // ICT Judas Swing (ICT)
    `The Judas Swing works because of predictable retail behavior. Early session traders chase the initial move. Their stops become fuel for the reversal. Once you see this pattern repeat for a few weeks, you stop chasing opens and start waiting for the reversal.`,
    `Practical filter: the Judas move usually lasts 15-30 minutes and targets the nearest liquidity pool (previous session high/low, equal highs/lows). When the initial move reaches that liquidity and shows rejection, that's your signal to look the other way.`
  ],

  492: [
    // Market Maker Models (market structure/liquidity)
    `The accumulation-manipulation-distribution model applies across all timeframes. A 5-minute range before a breakout is accumulation. The false break is manipulation. The real move is distribution. Same logic, different scale.`,
    `Understanding this model reduces frustration. When you get stopped out by a spike that immediately reverses, you weren't unlucky. You participated in the manipulation phase. Next time, wait for the manipulation to complete before entering the distribution phase.`
  ],

  566: [
    // Confluence Zones (confluence)
    `Grading confluence: one factor = avoid. Two factors = watchlist. Three or more = active setup. Not every zone needs to be traded. The ones with the most independent factors agreeing are the ones worth your capital and attention.`,
    `Janus Atlas automates part of this by scoring level strength across timeframes. Combine its highest-scored levels with your own FVG and order block analysis, and you've built a confluence map without staring at four chart tabs simultaneously.`
  ],

  576: [
    // Stop Loss Placement Strategies (risk management)
    `The relationship between stop distance and position size is non-negotiable. Wider stop = smaller position. Tighter stop = larger position. The dollar risk stays constant. If you widen the stop without reducing size, you've just doubled your risk.`,
    `Test your stop placement: review your last 20 stopped-out trades. Were you stopped by noise (price hit your stop then reversed)? If more than 30% were noise stops, your placement needs adjustment. The data tells you whether your stops are in the right place.`
  ],

  589: [
    // The Importance of Liquidity (liquidity)
    `Time-of-day matters for liquidity. The same pair has different liquidity at London open vs Tokyo close. Trade during the session with the deepest liquidity for your market. For forex, that's London-NY overlap. For crypto, it's US business hours.`,
    `Liquidity also affects indicator accuracy. Indicators based on price and volume are more reliable in liquid markets. In illiquid markets, erratic price moves create false signals. Filter your setups by liquidity before trusting the reading.`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    const d = deepens[post.postNumber];
    if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 5) {
      const tweets = post.twitter.tweets;
      const cta = tweets.pop();
      tweets.push(...d);
      tweets.push(cta);
      post.twitter.tweets = tweets;
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log('Education deepen B: ' + updated + ' posts expanded to 6-7 tweets');
}

main();
