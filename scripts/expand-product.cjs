#!/usr/bin/env node
/**
 * Expand Product/Indicator posts from 3 tweets to 4-5 tweets.
 * These are posts about Signal Pilot's 7 TradingView indicators.
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu  = 'https://education.signalpilot.io';
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

const expansions = {

  // ── 4  Pentarch TD Signal Demo (3→5 tweets) ──
  4: [
    `TD appears when selling exhausts itself. The first signal in Pentarch's 5-phase cycle detection. \u{1F9F5}`,
    `TD (Touchdown) marks the early-cycle reversal point. Selling pressure has dried up. It's not a buy signal — it's a structural observation that the downside is losing momentum. Pentarch detects this automatically using 5 independent signal components.`,
    `When to watch for TD: after extended downtrends when volume fades and price starts forming higher lows. TD is most powerful when it appears on the daily or 4H chart — that's where cycle transitions carry the most weight.`,
    `What makes TD different from other "oversold" readings: it's not based on a single oscillator. Pentarch synthesizes 5 components into one consensus. No single component can trigger it alone. And it's completely non-repainting — the signal is confirmed on candle close.`,
    `\u{1F517} See TD signals live: ${tv.pentarch}\n\u{1F4D6} Full docs: ${docs.pentarch}\n\u{1F310} ${site}`
  ],

  // ── 12  Volume Oracle Dashboard Demo (3→5 tweets) ──
  12: [
    `Volume Oracle shows what price alone can't tell you. A complete volume regime dashboard for your chart. \u{1F9F5}`,
    `The dashboard reveals the current volume regime in real-time:\n\n\u{25FE} Accumulation or distribution phase detection\n\u{25FE} Volume health status across timeframes\n\u{25FE} Statistical OBV analysis with regime classification\n\u{25FE} Divergence warnings when price and volume disagree`,
    `How to use it: check the regime BEFORE taking a trade. Accumulation regime favors longs. Distribution regime favors shorts. Drought regime means stay out — there's no conviction. The dashboard gives you context in seconds.`,
    `Most volume tools show you bars. Volume Oracle classifies the entire market environment into regimes using statistical analysis. It answers "what kind of market am I in?" — not just "was that candle high volume?" Non-repainting. Confirmed on close.`,
    `\u{1F517} Try Volume Oracle: ${tv.volumeOracle}\n\u{1F4D6} Full docs: ${docs.volumeOracle}\n\u{1F310} ${site}`
  ],

  // ── 22  Janus Atlas Multi-Timeframe Demo (3→5 tweets) ──
  22: [
    `Most support/resistance tools make you draw lines manually. Janus Atlas calculates them automatically across multiple timeframes. \u{1F9F5}`,
    `What it does: auto-detects key support and resistance levels on weekly, daily, 4H, and 1H charts — then plots them all on a single view. Each level is graded by strength so you know which zones actually matter.`,
    `When it's useful: before every trade, you need to know where the nearest key levels sit. Janus Atlas shows you in seconds. No manual drawing. No stale lines from weeks ago. Levels update dynamically as structure evolves.`,
    `What sets it apart: level strength scoring. Not all levels are equal. Janus Atlas factors in number of touches, recency, and multi-timeframe confluence. A weekly level with 4 touches ranks higher than a 1H level with 1 touch. Non-repainting.`,
    `\u{1F517} Try Janus Atlas: ${tv.janusAtlas}\n\u{1F4D6} Full docs: ${docs.janusAtlas}\n\u{1F310} ${site}`
  ],

  // ── 28  Harmonic Oscillator Demo (3→5 tweets) ──
  28: [
    `Harmonic Oscillator combines multiple momentum components into one consensus view. No more conflicting oscillators. \u{1F9F5}`,
    `RSI. Stochastic RSI. MACD. ROC. CCI. Williams %R. Ultimate Oscillator. Each measures momentum differently. Some say "overbought" while others say "still strong." Harmonic Oscillator synthesizes them into a single consensus reading.`,
    `How to use it: when all components agree, momentum is clear — trend-following setups have higher conviction. When components diverge, momentum is mixed — proceed with caution or wait. The consensus removes the guesswork from oscillator analysis.`,
    `The key advantage: built-in divergence detection. When price makes a new high but the Harmonic reading doesn't confirm, it flags the divergence visually. Early warning of potential reversals without scanning multiple indicators. Non-repainting.`,
    `\u{1F517} Try Harmonic Oscillator: ${tv.harmonicOsc}\n\u{1F4D6} Full docs: ${docs.harmonicOsc}\n\u{1F310} ${site}`
  ],

  // ── 35  Plutus Flow Demo (3→5 tweets) ──
  35: [
    `Volume bars lie. Cumulative flow doesn't. Plutus Flow shows where money is actually moving. \u{1F9F5}`,
    `Traditional volume bars show activity — how much traded. Plutus Flow shows DIRECTION — where value is flowing. It uses advanced statistical OBV analysis to track whether smart money is accumulating or distributing, even when price looks flat.`,
    `When to use it: before entering any position, check the flow direction. Rising flow + rising price = confirmed uptrend. Rising flow + flat price = hidden accumulation (smart money loading). Falling flow + rising price = distribution (smart money exiting into strength).`,
    `What makes Plutus Flow different from basic OBV: statistical analysis separates noise from signal. Regular OBV reacts to every bar. Plutus Flow identifies the underlying regime — accumulation, distribution, or neutral — with statistical confidence. Non-repainting.`,
    `\u{1F517} Try Plutus Flow: ${tv.plutusFlow}\n\u{1F4D6} Full docs: ${docs.plutusFlow}\n\u{1F310} ${site}`
  ],

  // ── 45  Augury Grid Demo (3→5 tweets) ──
  45: [
    `One chart. Multiple symbols. Real-time scanning. Augury Grid monitors your entire watchlist at a glance. \u{1F9F5}`,
    `What the grid shows per symbol:\n\n\u{25FE} Pentarch cycle phase\n\u{25FE} Volume Oracle regime\n\u{25FE} Momentum state\n\u{25FE} Flow direction\n\u{25FE} Key level proximity\n\nAll updating in real-time. No tab-switching. No chart-hopping.`,
    `How to use it in practice: scan the grid for alignment. When a symbol shows ignition phase + accumulation regime + bullish momentum, it stands out instantly. Filter by condition to surface only the setups that match your criteria.`,
    `The advantage over manual scanning: Augury Grid scans multiple timeframes simultaneously and displays conditions in a structured grid. You'd need to click through dozens of charts to get the same information. Non-repainting. All signals confirmed on close.`,
    `\u{1F517} Try Augury Grid: ${tv.auguryGrid}\n\u{1F4D6} Full docs: ${docs.auguryGrid}\n\u{1F310} ${site}`
  ],

  // ── 55  OmniDeck Demo (3→5 tweets) ──
  55: [
    `Too many indicators cluttering your chart? OmniDeck unifies everything into one clean overlay. \u{1F9F5}`,
    `OmniDeck combines signals from the entire Signal Pilot suite into a single chart overlay:\n\n\u{25FE} Pentarch cycle phases\n\u{25FE} Janus Atlas key levels\n\u{25FE} Harmonic Oscillator momentum\n\u{25FE} Plutus Flow direction\n\u{25FE} Volume Oracle regimes`,
    `When all signals align, the chart tells a clear story. When they conflict, OmniDeck shows you exactly where the disagreement is. It's your command center — one place to see whether the full picture supports your trade idea.`,
    `What makes OmniDeck unique: it's not just stacking indicators. It's a unified overlay that coordinates the output of multiple tools into one coherent view. No visual clutter. No conflicting panels. One overlay, complete context. Non-repainting.`,
    `\u{1F517} Try OmniDeck: ${tv.omniDeck}\n\u{1F4D6} Full docs: ${docs.omniDeck}\n\u{1F310} ${site}`
  ],

  // ── 295  Pentarch: The Five Signals Explained (3→5 tweets) ──
  295: [
    `Pentarch's five cycle signals — each one maps a specific phase of market structure. Here's what they mean. \u{1F9F5}`,
    `The five signals:\n\nTD — Early-cycle reversal (selling exhaustion)\nIGN — Breakout confirmation (conviction)\nWRN — Early weakness in uptrend\nCAP — Late-cycle exhaustion (climax volume)\nBDN — Bearish structure break`,
    `How to use them: TD and IGN are early-cycle signals — they favor accumulation and trend entries. WRN and CAP are late-cycle warnings — time to tighten stops or take profits. BDN confirms the cycle has topped. Each phase demands a different strategy.`,
    `What makes this system powerful: it's not a single oscillator flipping between overbought and oversold. It's 5 independent components synthesized into a phase classification. The cycle structure is identified, not just a momentum reading. Non-repainting.`,
    `\u{1F517} See all 5 signals: ${tv.pentarch}\n\u{1F4D6} Full docs: ${docs.pentarch}\n\u{1F310} ${site}`
  ],

  // ── 305  Harmonic Oscillator: Momentum Components (3→5 tweets) ──
  305: [
    `Harmonic Oscillator breaks momentum into components so you see exactly what's driving the reading. \u{1F9F5}`,
    `Not one reading — multiple perspectives:\n\n\u{25FE} Trend strength — is the move powerful?\n\u{25FE} Mean reversion — is price stretched too far?\n\u{25FE} Rate of change — is momentum accelerating or decelerating?\n\u{25FE} Volatility — is the move expanding or contracting?`,
    `In practice: when trend strength is high but rate of change is decelerating, the trend is intact but losing steam. When mean reversion is extreme but trend strength is rising, the move may have more room. Components tell you the "why" behind the number.`,
    `The difference from single oscillators: RSI gives you one number. MACD gives you one signal. Harmonic Oscillator gives you a decomposed view of momentum health across multiple dimensions — then combines them into consensus. Non-repainting.`,
    `\u{1F517} Get the full picture: ${tv.harmonicOsc}\n\u{1F4D6} Full docs: ${docs.harmonicOsc}\n\u{1F310} ${site}`
  ],

  // ── 315  Janus Atlas: Level Strength (3→5 tweets) ──
  315: [
    `Not all levels are equal. Janus Atlas scores each one so you know which zones actually matter. \u{1F9F5}`,
    `Level strength is calculated from:\n\n\u{25FE} Number of touches — more touches = more significance\n\u{25FE} Recency of reaction — recent respect carries more weight\n\u{25FE} Timeframe origin — weekly levels outrank 1H levels\n\u{25FE} Multi-timeframe confluence — levels that align across TFs score highest`,
    `When it's useful: you're looking at a chart with 15 potential levels. Which ones will price actually react to? Janus Atlas grades them. Focus your attention on A-grade levels, ignore the noise. It saves time and improves trade selection.`,
    `What sets this apart from manual S/R analysis: objectivity. Humans are biased toward the levels they drew. Janus Atlas uses a consistent algorithm across every chart, every timeframe, every asset. No bias. No subjectivity. Non-repainting.`,
    `\u{1F517} Grade your levels: ${tv.janusAtlas}\n\u{1F4D6} Full docs: ${docs.janusAtlas}\n\u{1F310} ${site}`
  ],

  // ── 325  Volume Oracle: Divergence Detection (3→5 tweets) ──
  325: [
    `Price makes a new high. Volume doesn't confirm. That's a divergence — and Volume Oracle highlights it automatically. \u{1F9F5}`,
    `When price and volume disagree, something may be changing:\n\n\u{25FE} New high + declining volume = weakening conviction\n\u{25FE} New low + rising volume = potential selling climax\n\u{25FE} Price flat + volume shifting = regime change brewing\n\nVolume Oracle flags these divergences on chart.`,
    `How to use divergences in practice: they're warnings, not immediate signals. A bearish divergence on the daily chart might take days to play out. Use them to adjust risk — tighten stops, reduce position size, or skip new entries in the divergent direction.`,
    `What makes this better than eyeballing it: Volume Oracle uses statistical analysis to detect divergences objectively. It catches the subtle ones your eyes miss and ignores the noise that would create false readings. Non-repainting.`,
    `\u{1F517} Spot divergences: ${tv.volumeOracle}\n\u{1F4D6} Full docs: ${docs.volumeOracle}\n\u{1F310} ${site}`
  ],

  // ── 335  Pentarch: Cycle Phase Transitions (3→5 tweets) ──
  335: [
    `Markets transition between phases. Pentarch tracks them in real-time.\n\nTD \u{2192} IGN \u{2192} WRN \u{2192} CAP \u{2192} BDN \u{1F9F5}`,
    `Different phases demand different strategies:\n\n\u{25FE} TD phase? Look for accumulation setups\n\u{25FE} IGN phase? Trend-following entries with momentum\n\u{25FE} WRN phase? Tighten stops, reduce new exposure\n\u{25FE} CAP phase? Take profits, watch for exhaustion\n\u{25FE} BDN phase? Defensive positioning or short setups`,
    `The power is in the transitions: the shift from IGN to WRN is the earliest warning that a trend is maturing. The shift from TD to IGN is confirmation that a new cycle has begun. Catching transitions early changes your timing dramatically.`,
    `Why Pentarch transitions are reliable: they're based on 5 signal components, not a single reading flipping states. A phase change requires consensus across components. That means fewer false transitions and higher confidence. Non-repainting.`,
    `\u{1F517} Track cycle phases: ${tv.pentarch}\n\u{1F4D6} Full docs: ${docs.pentarch}\n\u{1F310} ${site}`
  ],

  // ── 345  Augury Grid: Filtering by Condition (3→4 tweets) ──
  345: [
    `50 symbols. One view. But you don't need to see them all at once. Augury Grid lets you filter by condition. \u{1F9F5}`,
    `Filter capabilities:\n\n\u{25FE} Show only symbols in IGN (ignition) phase\n\u{25FE} Show only accumulation regime\n\u{25FE} Show only bullish momentum consensus\n\u{25FE} Combine filters for multi-condition screening\n\nInstead of scanning 50 charts, narrow to the 3-5 that match your criteria.`,
    `When this matters most: market open. You have limited time and attention. Set your filters to match your strategy. Augury Grid surfaces only the symbols that meet your conditions. Everything else fades. Focus on what's actionable.`,
    `\u{1F517} Filter your watchlist: ${tv.auguryGrid}\n\u{1F4D6} Full docs: ${docs.auguryGrid}\n\u{1F310} ${site}`
  ],

  // ── 355  Plutus Flow: Accumulation vs Distribution (3→5 tweets) ──
  355: [
    `Is smart money accumulating or distributing? Plutus Flow reveals the flow direction beneath the surface. \u{1F9F5}`,
    `Accumulation vs distribution explained:\n\n\u{25FE} Accumulation \u{2192} flow rising while price is flat or falling. Smart money is loading. The move hasn't started yet.\n\u{25FE} Distribution \u{2192} flow falling while price is flat or rising. Smart money is exiting. The move is ending.`,
    `How to use this: accumulation before a breakout is fuel. It means buyers are positioned and waiting. Distribution during a rally is a red flag — the rally lacks committed capital. Plutus Flow shows you the intent behind the price action.`,
    `The edge: most traders only see price. Plutus Flow reveals the statistical OBV analysis underneath — separating genuine accumulation from noise. When flow direction and price direction align, conviction is high. When they diverge, something's changing. Non-repainting.`,
    `\u{1F517} Track smart money flow: ${tv.plutusFlow}\n\u{1F4D6} Full docs: ${docs.plutusFlow}\n\u{1F310} ${site}`
  ],

  // ── 365  OmniDeck: The Unified View (3→5 tweets) ──
  365: [
    `Why stack 7 indicators when 1 overlay shows everything? OmniDeck is the command center for your chart. \u{1F9F5}`,
    `OmniDeck combines:\n\n\u{25FE} Cycle phases \u{2192} where are we in the market cycle?\n\u{25FE} Key levels \u{2192} what structure matters?\n\u{25FE} Momentum \u{2192} what's the conviction?\n\u{25FE} Flow direction \u{2192} where is money moving?\n\u{25FE} Volume regime \u{2192} what kind of market is this?`,
    `In practice: before any trade, glance at OmniDeck. If cycles, momentum, flow, and volume all point the same direction — your trade has multi-factor support. If they conflict, the setup needs more patience or a different approach.`,
    `What makes it different from just adding indicators: OmniDeck is designed as a unified system. The signals are coordinated, not layered independently. One clean overlay instead of 5 separate panels competing for screen space. Non-repainting.`,
    `\u{1F517} Try the unified view: ${tv.omniDeck}\n\u{1F4D6} Full docs: ${docs.omniDeck}\n\u{1F310} ${site}`
  ],

  // ── 375  Volume Oracle: Volume Regimes (3→5 tweets) ──
  375: [
    `Volume Oracle classifies the market into regimes — not just "high" or "low" volume, but the full context. \u{1F9F5}`,
    `The volume regimes:\n\n\u{1F7E2} Accumulation \u{2014} buying pressure building quietly\n\u{1F7E1} Normal \u{2014} standard conditions, no edge from volume\n\u{1F7E0} Climax \u{2014} extreme volume, potential exhaustion\n\u{1F534} Distribution \u{2014} selling pressure, smart money exiting\n\u{26AA} Drought \u{2014} no participation, stay out`,
    `How to adapt: in accumulation, favor long setups. In distribution, favor shorts or cash. In drought, reduce size — low volume means erratic moves. In climax, watch for reversals. The regime tells you HOW to trade, not just WHAT to trade.`,
    `What sets Volume Oracle apart: most volume tools give you a colored bar. Volume Oracle gives you a regime classification based on statistical analysis. It answers "what environment am I in?" — not just "was that bar big?" Non-repainting.`,
    `\u{1F517} Know your regime: ${tv.volumeOracle}\n\u{1F4D6} Full docs: ${docs.volumeOracle}\n\u{1F310} ${site}`
  ],

  // ── 385  Janus Atlas: Timeframe Hierarchy (3→5 tweets) ──
  385: [
    `Higher timeframes dominate lower timeframes. Janus Atlas shows this hierarchy visually on your chart. \u{1F9F5}`,
    `The timeframe hierarchy:\n\n\u{1F4CA} Weekly \u{2192} sets the major zones\n\u{1F4CA} Daily \u{2192} defines active structure\n\u{1F4CA} 4H \u{2192} refines intraday context\n\u{1F4CA} 1H \u{2192} precision entries and exits\n\nJanus Atlas shows all four layers simultaneously.`,
    `Why this matters: a 1H level inside a weekly zone is powerful. A 1H level in open space is weak. Janus Atlas lets you see instantly which intraday levels are backed by higher-timeframe structure — and which are noise.`,
    `The advantage: manual multi-timeframe analysis means switching between 4 chart tabs and remembering where the levels are. Janus Atlas plots them all on one chart with clear visual hierarchy. Stronger timeframes get stronger visual weight. Non-repainting.`,
    `\u{1F517} See the hierarchy: ${tv.janusAtlas}\n\u{1F4D6} Full docs: ${docs.janusAtlas}\n\u{1F310} ${site}`
  ],

  // ── 395  Harmonic Oscillator: Divergence Alerts (3→5 tweets) ──
  395: [
    `Harmonic Oscillator detects momentum divergences automatically. The early warning system your chart needs. \u{1F9F5}`,
    `What it detects:\n\n\u{25FE} Bearish divergence \u{2192} price makes higher high, Harmonic makes lower high. Momentum fading despite new highs.\n\u{25FE} Bullish divergence \u{2192} price makes lower low, Harmonic makes higher low. Momentum building despite new lows.`,
    `How to use divergence alerts: they're warnings, not triggers. A divergence tells you the trend is losing internal support. Combine with structure breaks, key levels, or cycle phase transitions for confirmation before acting.`,
    `What makes auto-detection valuable: manually scanning for divergences across multiple charts and timeframes takes time and invites bias. Harmonic Oscillator applies consistent rules across every bar. It catches the subtle setups you'd miss. Non-repainting.`,
    `\u{1F517} Auto-detect divergence: ${tv.harmonicOsc}\n\u{1F4D6} Full docs: ${docs.harmonicOsc}\n\u{1F310} ${site}`
  ],

  // ── 405  Pentarch + Volume Oracle Combo (3→5 tweets) ──
  405: [
    `Powerful combination: Pentarch + Volume Oracle. Cycle phase meets volume conviction. \u{1F9F5}`,
    `Pentarch tells you WHERE in the cycle. Volume Oracle tells you if volume CONFIRMS it.\n\n\u{25FE} IGN phase + Accumulation regime = strong trend initiation context\n\u{25FE} WRN phase + Declining volume = fading trend, reduce exposure\n\u{25FE} TD phase + Drought regime = building phase, prepare for breakout`,
    `Why these two complement each other: Pentarch identifies the phase but doesn't measure conviction. Volume Oracle measures conviction but doesn't identify cycle position. Together, you know both WHERE you are and HOW MUCH to trust it.`,
    `The alignment principle: when both indicators agree, confidence is higher. When they disagree — like IGN phase but distribution regime — that's a caution signal. One indicator gives context. Two gives confluence. Non-repainting.`,
    `\u{1F517} Pentarch: ${tv.pentarch}\n\u{1F517} Volume Oracle: ${tv.volumeOracle}\n\u{1F4D6} Docs: ${docsHome}\n\u{1F310} ${site}`
  ],

  // ── 415  Janus Atlas + Plutus Flow Combo (3→5 tweets) ──
  415: [
    `Powerful combination: Janus Atlas + Plutus Flow. Key levels meet money flow direction. \u{1F9F5}`,
    `Janus Atlas shows WHERE the key levels are. Plutus Flow shows WHAT money is doing at those levels.\n\n\u{25FE} Price at support + accumulation flow = buyers defending the zone\n\u{25FE} Price at resistance + distribution flow = sellers in control\n\u{25FE} Price at level + neutral flow = wait for direction`,
    `Why these two are powerful together: a level alone tells you where to look. Flow at that level tells you what's happening. Support with accumulation flow is a high-conviction bounce zone. Support with distribution flow is a breakdown waiting to happen.`,
    `Levels show WHERE to watch. Flow shows WHAT's happening there. One without the other is incomplete. Together, you get location + intent — the two ingredients of a well-informed trade decision. Both non-repainting.`,
    `\u{1F517} Janus Atlas: ${tv.janusAtlas}\n\u{1F517} Plutus Flow: ${tv.plutusFlow}\n\u{1F4D6} Docs: ${docsHome}\n\u{1F310} ${site}`
  ],

  // ── 425  Volume Oracle Regime Detection Demo (3→5 tweets) ──
  425: [
    `Volume Oracle detects bias regimes in real-time. Know the market environment before every trade. \u{1F9F5}`,
    `What each regime means:\n\nACCUMULATION \u{1F7E2} \u{2014} Bullish bias, buying pressure building\nDISTRIBUTION \u{1F534} \u{2014} Bearish bias, selling pressure present\nCLIMAX \u{1F7E0} \u{2014} Extreme volume, potential exhaustion point\nDROUGHT \u{26AA} \u{2014} No conviction, erratic price action likely\nNEUTRAL \u{1F7E1} \u{2014} No clear bias, wait for direction`,
    `How to trade each regime: accumulation favors long entries. Distribution favors shorts or cash. Climax means watch for reversals. Drought means reduce size or sit out. Neutral means wait — the market will tell you when it's ready.`,
    `What makes regime detection valuable: it stops you from forcing trades in hostile environments. Drought regimes produce the most frustrating losses — low volume, erratic whipsaws, no follow-through. Volume Oracle keeps you out. Non-repainting.`,
    `\u{1F517} Detect regimes: ${tv.volumeOracle}\n\u{1F4D6} Full docs: ${docs.volumeOracle}\n\u{1F310} ${site}`
  ],

  // ── 435  Pentarch + Harmonic Oscillator Combo (3→5 tweets) ──
  435: [
    `Pentarch + Harmonic Oscillator \u{2014} cycle phase meets momentum consensus. Two perspectives, one context. \u{1F9F5}`,
    `Pentarch tells you where in the cycle. Harmonic Oscillator tells you if momentum agrees.\n\n\u{25FE} Accumulation phase + building momentum = cycle turning with conviction\n\u{25FE} Ignition phase + strong consensus = confirmed trend with fuel\n\u{25FE} Warning phase + momentum divergence = cycle topping, exercise caution`,
    `Why these two complement each other: Pentarch identifies the structural phase but doesn't measure momentum health. Harmonic Oscillator measures momentum but doesn't know the cycle context. Together, you understand both structure and energy.`,
    `When they align, confidence is high. When they diverge \u{2014} like ignition phase but momentum divergence \u{2014} something's off. That disagreement is information. It tells you to wait for clarity before committing. Both non-repainting.`,
    `\u{1F517} Pentarch: ${tv.pentarch}\n\u{1F517} Harmonic Oscillator: ${tv.harmonicOsc}\n\u{1F4D6} Docs: ${docsHome}\n\u{1F310} ${site}`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    if (expansions[post.postNumber]) {
      post.twitter.tweets = expansions[post.postNumber];
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Product expansion complete: ${updated} posts expanded to 4-5 tweets`);
}

main();
