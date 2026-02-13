#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// Decision framework:
// 7 tweets: full suite demos, combo posts (two indicators), deep dives into core features
// 6 tweets: individual feature demos, alert setups, single-indicator posts

const deepens = {

  // POST 4: Pentarch TD Signal Demo (single indicator → 6 tweets, +1)
  4: [
    `Pair TD with Volume Oracle for stronger context. If TD fires while Volume Oracle shows drought regime, selling exhausted but buyers aren't here yet. TD plus accumulation regime? That's when the cycle turn has real conviction behind it.`
  ],

  // POST 12: Volume Oracle Dashboard Demo (single indicator → 6 tweets, +1)
  12: [
    `Pair Volume Oracle with Pentarch for the full picture. Oracle shows accumulation regime while Pentarch fires TD? That's cycle and volume agreeing on a potential bottom. Two independent tools confirming each other carries more weight than either alone.`
  ],

  // POST 22: Janus Atlas Multi-Timeframe Demo (single indicator → 6 tweets, +1)
  22: [
    `Combine Janus Atlas with Plutus Flow for even sharper entries. A fresh multi-timeframe level is strong. A fresh level with rising statistical flow beneath it? That's structure plus intent. The Cartographer shows you where. The Scales shows you what's happening there.`
  ],

  // POST 28: Harmonic Oscillator Demo (single indicator → 6 tweets, +1)
  28: [
    `Layer Harmonic Oscillator with Pentarch for cycle-aware momentum. A bullish oscillator reading during IGN phase carries far more weight than during CAP phase. Phase context tells you whether momentum is building or exhausting. Together they give you timing and energy.`
  ],

  // POST 35: Plutus Flow Demo (single indicator → 6 tweets, +1)
  35: [
    `Combine Plutus Flow with Janus Atlas for flow at structure. Rising flow near a fresh support level is a high-conviction bounce setup. Falling flow at resistance confirms sellers are in control. Flow tells you intent. Levels tell you where to act on it.`
  ],

  // POST 65: Pentarch Full Cycle Demo (full cycle deep dive → 7 tweets, +2)
  65: [
    `Each phase transition is a strategic decision point. TD to IGN? Start building positions. IGN to WRN? Protect gains and stop adding. WRN to CAP? Trail aggressively. CAP to BDN? Move to cash or short. The cycle is your playbook.`,
    `Pair Pentarch with Volume Oracle to confirm each phase. TD plus accumulation regime is the highest-conviction bottom signal. CAP plus distribution is the highest-conviction top. The cycle tells you where. Volume tells you if it's real.`
  ],

  // POST 75: Volume Oracle Regime Detection (single indicator → 6 tweets, +1)
  75: [
    `The regime that matters most is the one that just changed. A shift from distribution to accumulation is often more actionable than an established accumulation regime. Volume Oracle shows transitions in real-time. React to the shift, not the state.`
  ],

  // POST 85: Janus Atlas Level Confluence (single indicator → 6 tweets, +1)
  85: [
    `Fresh confluence zones produce the strongest reactions. A zone where three timeframes agree AND it hasn't been tested yet is top-tier structure. Janus Atlas marks freshness and confluence together. Prioritize the untested multi-TF clusters.`
  ],

  // POST 95: Harmonic Oscillator Divergence (single indicator → 6 tweets, +1)
  95: [
    `Stack divergence detection with Pentarch phase context. Bearish divergence during WRN phase is far more meaningful than during IGN. The cycle phase tells you whether to act on the divergence or note it. Context turns warnings into actionable setups.`
  ],

  // POST 105: Pentarch TD Signal Deep Dive (single signal → 6 tweets, +1)
  105: [
    `Pair TD with Plutus Flow for conviction. TD fires on the daily, and Plutus Flow shows a z-score climbing from negative territory? Selling exhausted AND accumulation starting beneath the surface. Two independent measures confirming the same thesis.`
  ],

  // POST 115: Volume Oracle Accumulation Regime (single regime → 6 tweets, +1)
  115: [
    `Track how long accumulation persists. A regime that holds for several sessions builds stronger foundations than a one-bar flash. Extended accumulation often precedes the most powerful moves. The longer the build, the bigger the potential breakout.`
  ],

  // POST 125: Janus Atlas Multi-Timeframe Demo (single indicator → 6 tweets, +1)
  125: [
    `Pair Janus Atlas with Volume Oracle for level-aware regime context. Price approaching a triple-timeframe confluence level during accumulation regime? High-conviction bounce zone. Same level during distribution? Higher chance of a break. Structure plus regime is the full picture.`
  ],

  // POST 135: Augury Grid Alert Setup (single feature → 6 tweets, +1)
  135: [
    `Combine Augury Grid alerts with OmniDeck for rapid assessment. Grid buzzes about a regime change on AAPL. Switch to OmniDeck on that chart. In seconds you see cycle phase, flow, momentum, and levels. Alert surfaces it. OmniDeck tells you what to do with it.`
  ],

  // POST 145: Pentarch IGN Signal Deep Dive (single signal → 6 tweets, +1)
  145: [
    `IGN is most powerful when backed by Volume Oracle showing accumulation. The cycle says ignition. The volume environment says buyers are present. That double confirmation filters out false breakouts where price moves but conviction is missing.`
  ],

  // POST 155: Harmonic Oscillator Overbought/Oversold (single feature → 6 tweets, +1)
  155: [
    `Combine extreme readings with Pentarch phase context. Overbought during IGN phase? Trend is young and strong. Overbought during CAP phase? That's late-cycle exhaustion. Same oscillator reading, completely different implications depending on where you are in the cycle.`
  ],

  // POST 165: Volume Oracle Distribution Regime (single regime → 6 tweets, +1)
  165: [
    `Distribution is most dangerous when it overlaps with Pentarch WRN or CAP signals. Cycle aging plus institutional selling is the classic topping pattern. When Volume Oracle and Pentarch agree the top is forming, the evidence is compelling. Protect capital.`
  ],

  // POST 175: Plutus Flow Accumulation Detection (single feature → 6 tweets, +1)
  175: [
    `Layer Plutus Flow accumulation with Janus Atlas levels. Flow rising while price sits on a fresh weekly support zone is one of the strongest setups in the suite. Institutional buying at structurally important prices. That's where the big moves start.`
  ],

  // POST 185: Pentarch WRN Signal Deep Dive (single signal → 6 tweets, +1)
  185: [
    `WRN becomes high-conviction when Harmonic Oscillator confirms with bearish divergence. Cycle says weakness forming. Momentum says price isn't being supported by underlying force. Two independent perspectives reaching the same conclusion. Reduce risk.`
  ],

  // POST 195: OmniDeck Unified View Demo (full suite overlay → 7 tweets, +2)
  195: [
    `The real power of OmniDeck is disagreement detection. When cycle says IGN but momentum shows divergence, something's off. When regime says accumulation but flow is flat, conviction is missing. Conflicts are information. OmniDeck surfaces them instantly.`,
    `Every signal displayed on OmniDeck is non-repainting and confirmed on candle close. What you see stays. No retroactive changes. No disappearing signals. The Commander's view is locked in once the candle closes. Build trust in what you see.`
  ],

  // POST 205: Janus Atlas Fresh vs Tested Levels (single feature → 6 tweets, +1)
  205: [
    `Combine fresh level analysis with Plutus Flow. A fresh level where Plutus Flow shows accumulation is a prime bounce candidate. A fresh level where flow shows distribution is more likely to break. Freshness is the structure. Flow is the intent. Use both.`
  ],

  // POST 215: Volume Oracle Neutral Regime (single regime → 6 tweets, +1)
  215: [
    `Use neutral periods productively. While Volume Oracle shows no bias, scan your watchlist on Augury Grid. Identify which assets are transitioning OUT of neutral. When one shifts to accumulation, you know where to focus. Neutral everywhere else means all attention goes there.`
  ],

  // POST 225: Pentarch CAP Signal Deep Dive (single signal → 6 tweets, +1)
  225: [
    `The strongest CAP setups combine three signals: Pentarch CAP firing, Harmonic Oscillator showing bearish divergence, and Volume Oracle shifting to distribution. That triple confluence of late-cycle exhaustion is rare but powerful. When all three agree, protect everything.`
  ],

  // POST 235: Harmonic Oscillator Components (single indicator deep dive → 6 tweets, +1)
  235: [
    `Use component readings to size positions. All five components aligned strong? Full conviction sizing. Three agree but two show caution? Reduced size. Two or fewer aligned? Skip it or take a tiny exploratory position. The components tell you how much to trust the setup.`
  ],

  // POST 245: Volume Oracle Regime Transitions (single feature → 6 tweets, +1)
  245: [
    `Set Augury Grid alerts for regime transitions across your watchlist. When Volume Oracle shifts from distribution to accumulation on any symbol, your phone buzzes. You check the chart. The transition just happened. You caught it in real-time instead of finding it hours later.`
  ],

  // POST 255: Janus Atlas Multi-Timeframe Confluence (single indicator → 6 tweets, +1)
  255: [
    `Pair multi-TF confluence with OmniDeck's overall score. A triple-timeframe Janus Atlas level where OmniDeck shows 4/5 or 5/5 confluence is a textbook high-probability zone. Structure confirmed by the full analytical framework. That's where patient traders make their entries.`
  ],

  // POST 265: Plutus Flow Statistical OBV (single indicator → 6 tweets, +1)
  265: [
    `Pair Plutus Flow's z-score with Pentarch phase signals. A rising z-score during TD phase means accumulation is building right at the cycle turn. Statistical flow confirming cycle phase transition is one of the earliest actionable signals in the entire suite.`
  ],

  // POST 275: Augury Grid Multi-Symbol Scanning (single indicator → 6 tweets, +1)
  275: [
    `Use Augury Grid for correlation awareness. When five symbols in the same sector shift to accumulation simultaneously, that's a sector rotation signal. One symbol changing is a setup. Five changing together is a macro thesis. The Grid shows patterns individual charts can't.`
  ],

  // POST 285: OmniDeck Everything in One (full suite overlay → 7 tweets, +2)
  285: [
    `The difference between OmniDeck and checking each indicator separately: speed and context. Separately, you see seven readings. With OmniDeck, you see one story. Agreement or conflict, strength or weakness, opportunity or risk. The narrative emerges from the synthesis.`,
    `Every signal in OmniDeck is non-repainting and confirmed on candle close. What the Commander shows you stays on the chart. No retroactive edits. No vanishing signals after the fact. Build your analysis on data that doesn't change after you've acted on it.`
  ],

  // POST 325: Volume Oracle Divergence Detection (single feature → 6 tweets, +1)
  325: [
    `Layer volume divergence with Janus Atlas levels. A bearish volume divergence forming right at a key resistance level is double confirmation of potential rejection. Divergence says conviction is fading. Structure says this is where selling should appear. Two tools, one conclusion.`
  ],

  // POST 395: Harmonic Oscillator Divergence Alerts (single feature → 6 tweets, +1)
  395: [
    `Stack Harmonic divergence alerts with Pentarch phase context. A bearish divergence alert during WRN phase is far more significant than one during IGN. The cycle context determines the weight of the divergence. Without context, alerts are noise. With it, they're edge.`
  ],

  // POST 405: Pentarch + Volume Oracle Combo (two-indicator combo → 7 tweets, +2)
  405: [
    `Real scenario: Pentarch fires TD on BTC daily. You check Volume Oracle. It shows the shift from distribution to accumulation. Cycle says selling exhausted. Volume says buyers stepping in. That double confirmation is how you identify potential bottoms with conviction.`,
    `The most dangerous signal is a disagreement. IGN phase but distribution regime? The breakout may lack conviction. CAP phase but accumulation regime? The top might hold longer than expected. When they disagree, reduce size and wait for alignment. Patience pays.`
  ],

  // POST 415: Janus Atlas + Plutus Flow Combo (two-indicator combo → 7 tweets, +2)
  415: [
    `Scenario: ETH drops to a fresh weekly support mapped by Janus Atlas. Plutus Flow shows a rising z-score. Buyers are accumulating at structurally significant prices. That's location plus intent. Enter near the level, stop below it, and let flow confirm your bias.`,
    `When they disagree, listen. Price at support but flow is falling? Distribution at a key level means the support is likely to break. Janus Atlas shows where the level is. Plutus Flow tells you whether to trust it. Disagreement between the two is a red flag.`
  ],

  // POST 425: Volume Oracle Regime Detection Demo (single indicator demo → 6 tweets, +1)
  425: [
    `Use regime detection to filter every other signal you see. A buy setup during drought regime? Skip it. A sell setup during accumulation? Think twice. Volume Oracle provides the environmental filter that prevents you from fighting the broader market character.`
  ],

  // POST 435: Pentarch + Harmonic Oscillator Combo (two-indicator combo → 7 tweets, +2)
  435: [
    `Real scenario: Pentarch shows IGN on the daily. You check Harmonic Oscillator. All five components agree with strong bullish consensus. Cycle says breakout confirmed. Momentum says force is real. That's structural confirmation plus energy confirmation.`,
    `The most telling disagreement: WRN phase fires but Harmonic Oscillator shows no divergence and strong momentum. The cycle warns but momentum doesn't confirm the weakness yet. That conflict says the trend might still have one more push. Monitor but don't exit yet.`
  ],

  // POST 445: Janus Atlas Multi-Timeframe Demo (single indicator → 6 tweets, +1)
  445: [
    `Combine Janus Atlas levels with OmniDeck's confluence score. A multi-timeframe level where OmniDeck shows 4/5 alignment is a high-grade trade zone. You know the level is structurally important AND the broader analytical framework supports the direction. Level plus conviction.`
  ],

  // POST 455: Augury Grid Scanner Demo (single indicator → 6 tweets, +1)
  455: [
    `Pro technique: set up Augury Grid with different watchlist groups. Crypto in one set, forex in another, equities in a third. When regime shifts happen across groups simultaneously, that's macro risk-on or risk-off. Cross-asset awareness reveals moves individual charts can't.`
  ],

  // POST 465: Plutus Flow Divergence Demo (single feature → 6 tweets, +1)
  465: [
    `Layer Plutus Flow divergence with Janus Atlas levels for precision. A bearish flow divergence forming right at a key resistance level is two independent tools reaching the same conclusion. Flow says conviction is fading. Structure says this is where sellers should appear.`
  ],

  // POST 475: OmniDeck Confluence Score Demo (full suite feature → 7 tweets, +2)
  475: [
    `Confluence scores work best as a filter, not a trigger. A 5/5 score says conditions support the trade idea. You still need a specific entry plan: a level to enter at, a stop placement, a target. OmniDeck gives you the green light. Your trading plan gives you the execution.`,
    `Track confluence score changes over time. A score declining from 5/5 to 3/5 while you're in a trade is an early warning. Conditions that supported your entry are eroding. Tighten stops or take partial profits. The score is dynamic, and your risk management should be too.`
  ],

  // POST 485: Harmonic Oscillator Exhaustion Signals (single feature → 6 tweets, +1)
  485: [
    `Pair exhaustion signals with Pentarch for cycle context. Exhaustion during CAP phase is the classic blow-off top setup. Exhaustion during IGN phase usually means just a pullback before continuation. The cycle phase tells you whether exhaustion ends the trend or just pauses it.`
  ],

  // POST 495: Full Suite Integration Demo (full suite → 7 tweets, +2)
  495: [
    `What each indicator answers:\n\nPentarch: Where in the cycle?\nVolume Oracle: What's the regime?\nJanus Atlas: Where are the levels?\nPlutus Flow: Where's money going?\nHarmonic Oscillator: How strong?\nAugury Grid: Which assets matter now?\nOmniDeck: Does it all agree?`,
    `Every indicator in the suite is non-repainting and confirmed on candle close. Seven tools, zero retroactive changes. What you see on the chart is what was actually signaled in real-time. Build your analysis on data you can trust. That's the foundation of the entire system.`
  ],

  // POST 505: Pentarch Cycle Phase Transitions Demo (core feature deep dive → 7 tweets, +2)
  505: [
    `Each phase transition changes your entire strategy. TD to IGN: shift from watching to building. IGN to WRN: shift from building to protecting. WRN to CAP: shift from protecting to exiting. CAP to BDN: shift from exiting to waiting. The cycle IS your strategy framework.`,
    `Pair phase transitions with Volume Oracle regime shifts for the highest-conviction signals. When Pentarch shifts from TD to IGN while Volume Oracle shifts from neutral to accumulation, that's cycle and volume confirming the same directional change simultaneously.`
  ],

  // POST 515: Volume Oracle + Janus Atlas Combo (two-indicator combo → 7 tweets, +2)
  515: [
    `Scenario: SPY approaches a Janus Atlas weekly resistance level. Volume Oracle shows distribution regime. Structure says resistance. Regime says sellers are active. That's two independent tools agreeing the upside is capped. Skip the breakout buy. Wait for confirmation above.`,
    `The disagreement signal matters just as much. Accumulation regime at resistance? The level might break. Distribution regime at support? The floor might crack. When regime and structure conflict, expect the unexpected and size down accordingly.`
  ],

  // POST 525: Plutus Flow Accumulation Detection (single feature → 6 tweets, +1)
  525: [
    `Stack Plutus Flow accumulation with Pentarch TD for the earliest cycle-turn detection. TD says selling exhaustion. Rising flow says buying has begun. Most traders wait for the breakout candle. You saw the accumulation building during the base. That's the edge of early detection.`
  ],

  // POST 535: Harmonic Oscillator Multi-Component View (single indicator → 6 tweets, +1)
  535: [
    `Use component analysis to avoid false signals. A strong composite reading where only one component is driving it is fragile. A moderate composite reading where all five components agree is robust. Broad agreement matters more than extreme readings from one voice.`
  ],

  // POST 545: Janus Atlas Historical Level Strength (single feature → 6 tweets, +1)
  545: [
    `Combine level grading with Augury Grid for watchlist-wide level awareness. Grid shows which symbols are near A-grade levels right now. That narrows your focus to where the highest-probability reactions should occur. Scan the grid, trade the best levels.`
  ],

  // POST 555: Augury Grid Watchlist Prioritization (single feature → 6 tweets, +1)
  555: [
    `Pair Augury Grid prioritization with OmniDeck deep dives. Grid tells you WHICH assets deserve attention. OmniDeck tells you WHAT the full picture looks like on each one. Grid for breadth. OmniDeck for depth. Together they form a complete analysis workflow.`
  ],

  // POST 565: OmniDeck Daily Routine Demo (full suite routine → 7 tweets, +2)
  565: [
    `Advanced routine: after the OmniDeck scan, cross-reference with Augury Grid for overnight regime changes across your full watchlist. OmniDeck gives you depth on individual assets. Grid gives you breadth across all of them. Sixty seconds for depth, thirty more for breadth.`,
    `Every data point in OmniDeck's briefing is non-repainting. The cycle phases, regime states, and momentum readings that greet you each morning are locked in from the prior close. No shifting data. No retroactive changes. Start your day with information you can trust.`
  ],

  // POST 575: Volume Oracle Regime Shifts (single feature → 6 tweets, +1)
  575: [
    `Combine regime shift detection with Pentarch phase transitions. When Volume Oracle shifts to accumulation AND Pentarch fires TD in the same session, two independent systems see the same turning point. That's convergence from different analytical dimensions. Rare and powerful.`
  ],

  // POST 585: Pentarch Full Cycle Walkthrough (core feature deep dive → 7 tweets, +2)
  585: [
    `Each phase has a corresponding Volume Oracle regime that confirms it. TD plus accumulation. IGN plus rising conviction. WRN plus declining volume. CAP plus distribution. BDN plus drought. When cycle and volume regime align at each phase, the narrative is strongest.`,
    `The suite adds layers to the cycle narrative. Pentarch names the phase. Volume Oracle confirms conviction. Janus Atlas marks key levels. Plutus Flow tracks institutional intent. Harmonic Oscillator gauges remaining energy. One cycle, five perspectives, one unified system.`
  ]

};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  let skipped = [];

  for (const post of queue) {
    const d = deepens[post.postNumber];
    if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 5) {
      const tweets = post.twitter.tweets;
      const cta = tweets.pop();
      tweets.push(...d);
      tweets.push(cta);
      post.twitter.tweets = tweets;
      updated++;
    } else if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length !== 5) {
      skipped.push(post.postNumber + ' (has ' + post.twitter.tweets.length + ' tweets)');
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log('Product deepen: ' + updated + ' posts expanded to 6-7 tweets');
  if (skipped.length > 0) {
    console.log('Skipped (not 5 tweets): ' + skipped.join(', '));
  }

  // Validate NEW tweet lengths only
  let errors = 0;
  for (const [postNum, newTweets] of Object.entries(deepens)) {
    for (let i = 0; i < newTweets.length; i++) {
      if (newTweets[i].length > 280) {
        console.error('ERROR: Post ' + postNum + ' new tweet ' + (i + 1) + ' is ' + newTweets[i].length + ' chars (max 280)');
        errors++;
      }
    }
  }
  if (errors === 0) {
    console.log('All new tweets under 280 characters.');
  } else {
    console.error(errors + ' new tweets exceed 280 characters!');
    process.exit(1);
  }
}

main();
