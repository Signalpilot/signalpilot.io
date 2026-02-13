#!/usr/bin/env node
/**
 * Expand ALL remaining product posts from 3 tweets to 5 tweets.
 * Inserts 2 new tweets (practical use case + power user tip) before the CTA.
 *
 * Structure:
 *   [0] Hook (existing)
 *   [1] Feature/capability (existing)
 *   [2] NEW: Practical use case / trading scenario
 *   [3] NEW: Pro tip / power user technique / differentiation
 *   [4] CTA (existing, moved from position 2)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const expansions = {

  // ── 65: Pentarch Full Cycle Demo ──
  65: [
    `Try this: pull up BTC weekly and watch Pentarch label each phase as it unfolds. TD at the bottom, IGN on the breakout, WRN when the rally gets tired, CAP at the blow-off, BDN on the collapse. One cycle. Five labels. Complete market narrative.`,
    `What separates Pentarch from other cycle tools: it uses five independent components to classify phases, not a single oscillator. No single component can force a phase change alone. That consensus requirement filters out noise. And it never repaints.`
  ],

  // ── 75: Volume Oracle Regime Detection ──
  75: [
    `Before your next trade, check the regime. If Volume Oracle shows accumulation, trend-following longs have a statistical edge. If it shows distribution, that pullback buy could be a trap. Regime context turns a 50/50 guess into an informed decision.`,
    `Most volume indicators just color bars green or red. Volume Oracle classifies the entire market environment using statistical analysis. It tells you the type of market you're in, not just whether the last candle had high volume. That distinction matters.`
  ],

  // ── 85: Janus Atlas Level Confluence ──
  85: [
    `Scenario: you're watching a pullback on ETH 1H. Price approaches a level. Is it meaningful? Check Janus Atlas. If daily and 4H levels sit at the same price, that's multi-timeframe confluence. The bounce probability just increased significantly.`,
    `Here's what most traders miss: a single-timeframe level is noise. Confluence across three timeframes is structure. Janus Atlas scores each level by the number of timeframes that agree. Higher scores deserve your attention. Lower scores are background noise.`
  ],

  // ── 95: Harmonic Oscillator Divergence ──
  95: [
    `Real scenario: BTC rallies to a new high. You want to add to your long. But Harmonic Oscillator shows bearish divergence. Momentum isn't confirming. That's your cue to hold what you have but skip the new entry. Divergence saved you from buying the top.`,
    `Unlike single oscillators, Harmonic Oscillator checks divergence across multiple momentum components simultaneously. One component diverging is a note. Three components diverging is a warning. Five is a screaming signal. The consensus matters.`
  ],

  // ── 105: Pentarch TD Signal Deep Dive ──
  105: [
    `How to use TD in practice: after an extended selloff, TD appears on the daily chart. Don't buy immediately. Wait for price to hold above the TD candle's low on the next few bars. If it holds, accumulation may be starting. If it breaks, the decline isn't done.`,
    `TD is most effective on higher timeframes. A TD on the weekly carries far more weight than one on the 15-minute. The Sovereign's signals scale with the timeframe. And because Pentarch is non-repainting, that TD signal stays locked once the candle closes.`
  ],

  // ── 115: Volume Oracle Accumulation Regime ──
  115: [
    `Practical application: Volume Oracle shows accumulation. You spot a pullback to support on the 4H. That accumulation regime tilts the odds toward the bounce. It doesn't guarantee it, but the volume environment says buyers are present. That's context.`,
    `Power user approach: combine the accumulation regime with Plutus Flow for double confirmation. If Volume Oracle says accumulation AND Plutus Flow shows rising statistical OBV, you have two independent volume measures agreeing. That's conviction.`
  ],

  // ── 125: Janus Atlas Multi-Timeframe Demo ──
  125: [
    `Here's the workflow: open your 1H chart. Janus Atlas shows you daily resistance 2% above and weekly support 3% below. Now you know your risk boundaries without switching a single tab. Enter near support, target near resistance. Levels mapped. Trade planned.`,
    `The difference between Janus Atlas and manually drawn levels: consistency. Your hand-drawn levels shift with your bias. Janus Atlas uses the same algorithm every time, on every chart. It catches levels you'd overlook and ignores ones that don't meet the criteria.`
  ],

  // ── 135: Augury Grid Alert Setup ──
  135: [
    `Real workflow: set Augury Grid to alert when any symbol in your 30-stock watchlist shifts from neutral to accumulation regime. Your phone buzzes. You check the chart. Setup is already forming. You didn't stare at a screen for hours. You lived your life.`,
    `Pro tip: layer multiple alert conditions. Alert on regime change AND momentum shift happening on the same symbol within the same session. That combined trigger filters out noise and surfaces only the highest-conviction opportunities across your watchlist.`
  ],

  // ── 145: Pentarch IGN Signal Deep Dive ──
  145: [
    `Trading IGN signals: when Pentarch fires IGN on the daily, look for a pullback to the breakout zone on the 4H for entry. IGN confirms something may be starting. The pullback gives you a defined risk level. That's structure meeting confirmation.`,
    `What makes IGN different from a simple moving average crossover: Pentarch requires consensus across five independent components before firing IGN. A single momentum spike won't trigger it. That higher bar for confirmation means fewer false breakout signals.`
  ],

  // ── 155: Harmonic Oscillator Overbought/Oversold ──
  155: [
    `Practical approach: Harmonic Oscillator hits extreme overbought on the daily. Instead of shorting immediately, wait for a lower timeframe structure break. Extreme readings are context. The structure break is your trigger. Context plus trigger equals a trade.`,
    `Power user technique: watch for overbought readings that persist for multiple bars. That's not "about to reverse" -- that's strong trend momentum. The move that stays overbought the longest often produces the biggest gains. Don't fight persistent extremes.`
  ],

  // ── 165: Volume Oracle Distribution Regime ──
  165: [
    `In practice: Volume Oracle flips to distribution. You have open longs. This doesn't mean panic-sell. It means tighten your stops, trail more aggressively, and stop adding new long exposure. Let the regime tell you when to shift from offense to defense.`,
    `What makes distribution detection valuable: by the time price visibly breaks down, the distribution is already over. Volume Oracle identifies the regime while it's happening, not after. You get the heads-up while you can still act on it. Non-repainting.`
  ],

  // ── 175: Plutus Flow Accumulation Detection ──
  175: [
    `How to trade it: Plutus Flow shows rising flow while price consolidates near support. That's the setup. When price finally breaks out of the range, flow already confirmed the direction. You're not chasing. You were prepared because flow told you first.`,
    `What gives Plutus Flow its edge: z-score normalization. Raw OBV is noisy. Plutus Flow normalizes statistically, so you only see flow moves that are significant relative to recent history. Small noise disappears. Real accumulation stands out clearly.`
  ],

  // ── 185: Pentarch WRN Signal Deep Dive ──
  185: [
    `How to use WRN: you're long from the IGN signal. WRN fires on the daily. Don't sell everything. Move your stop to breakeven. Take partial profits. Reduce risk. WRN says the trend is aging, not that it's dead. Manage the position, don't abandon it.`,
    `What makes WRN valuable: most early warning signals trigger too early or too late. Pentarch's five-component consensus means WRN fires when multiple independent measures agree that conditions are shifting. That consensus filter keeps false warnings to a minimum.`
  ],

  // ── 195: OmniDeck Unified View Demo ──
  195: [
    `Daily routine with OmniDeck: open your main chart, glance at the overlay. Cycle phase says IGN. Regime says accumulation. Flow is rising. Momentum is strong. Levels show support below. Five data points in two seconds. That's the Commander's briefing.`,
    `The real advantage of OmniDeck: it's not five indicators stacked on a chart. It's a single overlay designed to show agreement and disagreement between signals. When everything aligns, the visual is clean. When signals conflict, you see it instantly.`
  ],

  // ── 205: Janus Atlas Fresh vs Tested Levels ──
  205: [
    `Trading fresh levels: price approaches a Janus Atlas level marked as fresh. First touch of an untested zone often produces the strongest reaction. Set your limit order there. Tight stop below. The fresh level is your edge because the liquidity is untapped.`,
    `Pro tip: when a fresh level gets tested and holds, it becomes a tested level with proven strength. If it gets tested and breaks, it's invalidated. Janus Atlas tracks this lifecycle automatically. You always know whether a level has been validated or not.`
  ],

  // ── 215: Volume Oracle Neutral Regime ──
  215: [
    `How to handle neutral: reduce your position sizing. Neutral regimes produce whipsaws that stop out even good setups. The smart move is smaller bets until Volume Oracle shifts back to accumulation or distribution. Patience in neutral preserves capital.`,
    `Experienced traders know this: neutral regimes are where most unnecessary losses happen. Traders get bored, force entries, and get chopped. Volume Oracle's neutral classification is permission to do nothing. Sometimes the best trade is no trade.`
  ],

  // ── 225: Pentarch CAP Signal Deep Dive ──
  225: [
    `When CAP fires, here's the play: if you're long, trail your stop aggressively. If you're flat, don't initiate longs. If CAP appears with volume climax, that's the blow-off top pattern. The cycle is exhausting itself. Protect gains and watch from the sideline.`,
    `CAP is most reliable when confirmed by other signals. CAP plus Harmonic Oscillator bearish divergence plus distribution regime from Volume Oracle -- that triple confirmation of late-cycle exhaustion is one of the highest-conviction topping patterns in the suite.`
  ],

  // ── 235: Harmonic Oscillator Components ──
  235: [
    `Here's how to read component disagreement: trend strength is high but mean reversion pressure is extreme. That means the trend is powerful but stretched. Expect a pullback, not a reversal. The pullback is for buying, not panicking. Components tell the story.`,
    `Power user technique: toggle individual components on and off to see which ones are driving the composite. When the composite reading changes, you'll know exactly why. Most oscillators are a black box. Harmonic Oscillator lets you see inside the engine.`
  ],

  // ── 245: Volume Oracle Regime Transitions ──
  245: [
    `Trading regime transitions: Volume Oracle shifts from distribution to accumulation. That transition is often more actionable than the regime itself. It means selling pressure exhausted and buyers are stepping in. Watch for price confirmation and you have a setup.`,
    `What separates good traders from great ones: reacting to the shift, not the state. By the time a regime is fully established, the early move is done. Volume Oracle shows the transition in real-time. Catching the shift gives you the best risk-reward entries.`
  ],

  // ── 255: Janus Atlas Multi-Timeframe Confluence ──
  255: [
    `Here's how I use it: before any trade, I check Janus Atlas for the nearest weekly level above and below price. That defines my macro range. Then I look at where daily and 4H levels cluster. Those clusters become my actual trade zones. Takes about 10 seconds.`,
    `The power of multi-timeframe levels on one chart: you see context that tab-switching traders miss. A 1H trader who doesn't see the weekly resistance 1% above is flying blind. Janus Atlas ensures you always see the full structural picture. Non-repainting.`
  ],

  // ── 265: Plutus Flow Statistical OBV ──
  265: [
    `Real use case: you're watching a stock in a tight range. Volume bars look normal. But Plutus Flow shows a steady z-score climb over the past week. Statistically significant accumulation is happening beneath the surface. When the range breaks, you know which way.`,
    `What makes statistical OBV different from regular OBV: regular OBV treats every bar equally. A 1% move on low volume shifts OBV the same as a 1% move on massive volume. Plutus Flow weighs statistically, filtering out noise. Only significant flow moves register.`
  ],

  // ── 275: Augury Grid Multi-Symbol Scanning ──
  275: [
    `Workflow: Monday morning. Open Augury Grid. Scan your watchlist. Three symbols show IGN phase with accumulation regime. Those three get your attention this week. The other 47 can wait. That's how scanning replaces chart-by-chart review.`,
    `What Augury Grid does that manual scanning can't: it checks multiple timeframes per symbol simultaneously. A symbol might look quiet on the daily but be firing signals on the 4H. Augury Grid catches that. Your manual review of the daily chart alone would miss it.`
  ],

  // ── 285: OmniDeck Everything in One ──
  285: [
    `Try this: load OmniDeck on your most-traded asset. Within seconds you'll see cycle phase, key levels, momentum state, flow direction, and volume regime. Now do the same for five more assets. In under a minute you've assessed six charts. That's the Commander's speed.`,
    `What separates OmniDeck from adding all seven indicators manually: visual coordination. Separate indicators create visual chaos with overlapping panels and conflicting colors. OmniDeck synthesizes them into one coherent layer. Less noise, more clarity. Non-repainting.`
  ],

  // ── 445: Janus Atlas Multi-Timeframe Demo (second) ──
  445: [
    `Scenario: trading AAPL on the 4H. You see a pullback forming. Janus Atlas shows daily support 1% below, with weekly support another 2% lower. Now you have two potential bounce zones mapped. Set alerts at both levels. Let the chart come to your plan.`,
    `The detail that matters: Janus Atlas shows whether each level is fresh or tested and how many timeframes agree at that price. A fresh daily level backed by a weekly zone is the highest-grade setup. That granularity turns generic S/R into actionable intelligence.`
  ],

  // ── 455: Augury Grid Scanner Demo ──
  455: [
    `In practice: you trade 20 crypto pairs. Augury Grid shows 17 in neutral. Two are in accumulation with bullish momentum. One just fired IGN. That one symbol is where your focus goes today. Grid scanning turned 20 possibilities into one priority.`,
    `What makes Augury Grid different from a basic screener: it integrates Pentarch cycle data, Volume Oracle regimes, and Harmonic Oscillator momentum into one view. Most screeners check price and volume. Augury Grid checks the analytical framework you actually trade with.`
  ],

  // ── 465: Plutus Flow Divergence Demo ──
  465: [
    `How to trade flow divergence: price makes a new high but Plutus Flow doesn't confirm. Don't short immediately. Instead, wait for the next pullback. If flow doesn't recover on the bounce attempt, that's your confirmation. Divergence warned you. Price confirmed.`,
    `Plutus Flow divergence detection uses z-score analysis, not raw OBV slopes. That means it filters out minor flow fluctuations and only flags divergences that are statistically meaningful. Fewer false signals. Higher conviction when it does fire. Non-repainting.`
  ],

  // ── 475: OmniDeck Confluence Score Demo ──
  475: [
    `Before every trade, check OmniDeck's confluence score. Score at 4/5 or 5/5? Multiple factors support the idea. Score at 1/5 or 2/5? You're trading against the weight of evidence. It's a simple filter that prevents a lot of low-probability entries.`,
    `What gives OmniDeck's confluence score its edge: it's not averaging random indicators. It's measuring agreement across five purpose-built tools that each analyze a different market dimension. Cycle, regime, structure, flow, and momentum. Independent perspectives.`
  ],

  // ── 485: Harmonic Oscillator Exhaustion Signals ──
  485: [
    `Practical use: Harmonic Oscillator shows exhaustion building on the 4H while price grinds higher. That grind is the last push. Set a trailing stop and let the market decide when the trend ends. Exhaustion told you to protect gains. The stop handles the exit.`,
    `Most traders confuse extremes with exhaustion. An extreme reading in a strong trend is just momentum. True exhaustion shows extreme readings plus divergence plus decelerating rate of change. Harmonic Oscillator measures all three. That layered approach matters.`
  ],

  // ── 495: Full Suite Integration Demo ──
  495: [
    `The full workflow: Augury Grid surfaces the opportunity. OmniDeck shows the confluence. Pentarch identifies the cycle phase. Volume Oracle confirms the regime. Janus Atlas provides the levels. Plutus Flow validates the flow. Harmonic Oscillator times the entry.`,
    `What makes the Elite Seven a system, not just a collection: each indicator was designed to answer a specific question. Together they cover cycles, volume, structure, flow, momentum, scanning, and synthesis. No redundancy. No gaps. Seven tools, one complete framework.`
  ],

  // ── 505: Pentarch Cycle Phase Transitions Demo ──
  505: [
    `In practice: set alerts for each phase transition on your top 5 assets. When BTC shifts from WRN to CAP on the daily, your phone buzzes. You tighten stops across all correlated positions. The cycle phase change drove your risk management. That's systematic trading.`,
    `Here's the edge: Pentarch's five-phase model maps the full cycle, not just overbought and oversold. Each phase has a specific strategic implication. Knowing you're in IGN versus WRN changes your entire approach. Phase context is the foundation of good decisions.`
  ],

  // ── 515: Volume Oracle + Janus Atlas Combo ──
  515: [
    `Real scenario: BTC hits a Janus Atlas weekly support level. You check Volume Oracle. It shows accumulation regime. Buyers are present at a structurally important price. That's regime plus structure alignment. The bounce has strong contextual support.`,
    `Pro tip: the highest-probability setups happen when regime and structure agree. Accumulation at support. Distribution at resistance. When they disagree -- like distribution at support -- that level is more likely to break. Two indicators, one clear read.`
  ],

  // ── 525: Plutus Flow Accumulation Detection (second) ──
  525: [
    `Workflow: price is basing after a 30% decline. Plutus Flow z-score starts climbing from below zero. Statistical accumulation is building during the base. When price finally breaks the range high, you're already positioned because flow signaled intent early.`,
    `Why Plutus Flow catches accumulation others miss: it normalizes against recent history using z-scores. A flow increase that looks small in raw OBV terms might be statistically significant given recent conditions. Context-relative analysis reveals hidden activity.`
  ],

  // ── 535: Harmonic Oscillator Multi-Component View ──
  535: [
    `Practical example: the composite reads neutral, but speed is high while exhaustion is building. That tells you the move is fast but fading. Good for a quick scalp, dangerous for a swing position. The components give you trade duration context the composite alone can't.`,
    `Advanced technique: track which components lead the composite. When speed peaks before strength, the move is impulsive and likely to fade. When strength leads speed, the move is grinding and more sustainable. Component sequencing reveals trend character.`
  ],

  // ── 545: Janus Atlas Historical Level Strength ──
  545: [
    `How to use level grading: scan for A-grade levels within 2% of current price. Those are your highest-probability reaction zones. Set alerts there. Ignore C-grade levels unless they cluster. Janus Atlas grades them so you prioritize correctly.`,
    `The detail most traders overlook: level strength degrades after multiple tests. A fresh level that held twice is strong. A level tested six times has likely absorbed most of its liquidity. Janus Atlas factors in test count. Freshness and strength together tell the real story.`
  ],

  // ── 555: Augury Grid Watchlist Prioritization ──
  555: [
    `Here's the routine: open Augury Grid at the start of each session. Sort by confluence score. The top 3-5 assets get your research time. The rest get ignored until conditions change. Stop spreading attention across 50 charts. Prioritize ruthlessly.`,
    `What makes grid-based prioritization effective: it removes emotional bias from watchlist management. You're not drawn to the symbol you "feel" will move. You're guided by measured conditions across multiple analytical dimensions. Data over gut feeling.`
  ],

  // ── 565: OmniDeck Daily Routine Demo ──
  565: [
    `The 60-second briefing in practice: scan cycle phases across your top assets. Note which ones are in IGN or TD. Check regime status for each. Flag any with 4/5 or 5/5 confluence. Those flagged assets are your focus list for the day. Everything else can wait.`,
    `What makes OmniDeck worth the daily check: market conditions shift overnight. Regime changes, level breaks, and cycle transitions happen while you sleep. One glance at OmniDeck catches you up on everything that changed. Start every session informed, not guessing.`
  ],

  // ── 575: Volume Oracle Regime Shifts ──
  575: [
    `How to position for regime shifts: Volume Oracle shifts from neutral to accumulation. That transition often precedes a directional move. Start building a small position. If accumulation deepens, add. If it reverts to neutral, cut. The regime guides your sizing.`,
    `Why transitions are more actionable than established regimes: by the time everyone sees "accumulation" on their chart, the early move is done. The shift from neutral or distribution INTO accumulation is the leading signal. Volume Oracle shows that shift in real-time.`
  ],

  // ── 585: Pentarch Full Cycle Walkthrough ──
  585: [
    `Apply this to any market: pull up forex, crypto, or equities on the daily chart. You'll see the same five-phase pattern. TD at bottoms, IGN at breakouts, WRN at early tops, CAP at blow-offs, BDN at breakdowns. Cycles are universal. The timeframe scales.`,
    `What makes Pentarch's cycle detection reliable across markets: it doesn't depend on asset-specific behavior. It reads structural patterns that emerge from crowd psychology. Fear and greed drive the same cycle in Bitcoin, EURUSD, and AAPL. The Sovereign reads them all.`
  ],

  // ── 595: Complete Indicator Suite Overview ──
  595: [
    `How the suite works in practice: each indicator answers one question. Pentarch: where in the cycle? Volume Oracle: what regime? Janus Atlas: what levels? Plutus Flow: what's the flow? Harmonic Oscillator: what's momentum doing? Seven questions, complete context.`,
    `The design principle behind the suite: no two indicators measure the same thing. Each covers a unique analytical dimension. That means when they agree, the confluence is genuine, not just the same signal restated seven ways. Independent confirmation across distinct methods.`
  ],

  // ── 605: Signal Pilot Settings Deep Dive ──
  605: [
    `Start with defaults. They're calibrated for general use across most markets and timeframes. After 2-3 weeks of observation, adjust sensitivity settings to match your style. Faster traders increase sensitivity. Swing traders decrease it. The tool adapts to you.`,
    `Every parameter is documented with clear explanations of what it does and when to change it. No guessing. No "what does this slider do?" The docs walk through each setting with visual examples. Customization with confidence, not confusion.`
  ],

  // ── 615: Volume Oracle Product Demo ──
  615: [
    `Before entering any trade, ask: what regime am I in? If Volume Oracle shows compression, expect a breakout. If expansion, manage risk for volatility. If accumulation, favor longs. Five regimes. Five different strategies. Match your approach to the environment.`,
    `What makes five-regime classification better than basic volume analysis: granularity. "High volume" and "low volume" tell you almost nothing. Compression, expansion, accumulation, distribution, and transition each demand specific tactical adjustments. Specificity is edge.`
  ],

  // ── 625: Janus Atlas Product Demo ──
  625: [
    `How multi-timeframe levels change your trading: you take a 4H short at resistance. Janus Atlas shows the weekly support sits 5% lower. That's your target. Without the multi-timeframe view, you'd be guessing where to take profit. With it, structure provides the answer.`,
    `The advantage of auto-detection over manual levels: objectivity and speed. Janus Atlas recalculates as new price data arrives. Levels that break get removed. New levels that form get added. Your chart always shows the current structural reality, not yesterday's drawings.`
  ],

  // ── 635: Plutus Flow Product Demo ──
  635: [
    `Practical scenario: two stocks are both up 3% today. One shows rising Plutus Flow confirming the move. The other shows flat flow -- the rally has no volume conviction behind it. Same price action, completely different quality. Flow separates real moves from traps.`,
    `Plutus Flow's z-score approach means you're comparing current flow to its own recent history, not to an arbitrary threshold. What counts as significant accumulation in a low-volatility stock differs from a crypto asset. The statistical framework adapts automatically.`
  ],

  // ── 645: OmniDeck Product Demo ──
  645: [
    `Use case: you're about to enter a long. Open OmniDeck. Cycle phase is IGN. Regime is accumulation. Momentum is bullish. Flow confirms. Levels show support below. That's five-factor alignment on one overlay. Trade has full contextual support. Enter with conviction.`,
    `What makes the unified overlay valuable: speed of assessment. Checking seven indicators individually takes minutes. OmniDeck synthesizes them into one view you read in seconds. In fast-moving markets, that speed difference is the gap between catching the move and chasing it.`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  let skipped = 0;

  for (const post of queue) {
    const exp = expansions[post.postNumber];
    if (exp && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;
      post.twitter.tweets = [tweets[0], tweets[1], exp[0], exp[1], tweets[2]];
      updated++;
    } else if (exp && post.twitter && post.twitter.tweets && post.twitter.tweets.length !== 3) {
      skipped++;
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Product expansion: ${updated} posts expanded from 3 to 5 tweets`);
  if (skipped > 0) {
    console.log(`  Skipped ${skipped} posts (already expanded or unexpected tweet count)`);
  }

  // Validate tweet lengths
  let issues = 0;
  for (const [num, pair] of Object.entries(expansions)) {
    for (let i = 0; i < pair.length; i++) {
      if (pair[i].length > 280) {
        console.error(`  WARNING: post ${num} expansion[${i}] is ${pair[i].length} chars (exceeds 280)`);
        issues++;
      }
    }
  }
  if (issues === 0) {
    console.log('  All new tweets verified under 280 characters.');
  } else {
    console.error(`  ${issues} tweets exceed 280 characters!`);
  }
}

main();
