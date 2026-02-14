// Structured knowledge base for all 7 Signal Pilot indicators
// Source: docs.signalpilot.io — used to enrich carousel slide content
//
// Each indicator entry contains:
//   character  — Chronicle lore character name
//   tagline    — One-line elevator pitch
//   role       — What it does in plain terms
//   events     — Key signal types (labels, colors, meanings)
//   features   — Bullet-point feature list for slides
//   settings   — Notable configuration options
//   combos     — How it pairs with other indicators
//   bestFor    — Ideal use cases / timeframes
//   avoid      — When NOT to rely on it
//   quickTips  — Actionable one-liners for "Pro Tips" slides

const INDICATORS = {
  pentarch: {
    name: 'Pentarch',
    character: 'The Sovereign',
    tagline: 'Close-confirmed cycle detection across five market phases.',
    role: 'Detects where you are in the market cycle: accumulation, markup, distribution, climax, or decline.',
    events: [
      { label: 'TD', name: 'Touchdown', color: 'Purple', phase: 'Accumulation', meaning: 'Potential bottom forming — buyers stepping in.' },
      { label: 'IGN', name: 'Ignition', color: 'Teal', phase: 'Markup', meaning: 'Momentum is building — trend acceleration.' },
      { label: 'WRN', name: 'Warning', color: 'Yellow', phase: 'Distribution', meaning: 'Smart money may be exiting — caution.' },
      { label: 'CAP', name: 'Climax', color: 'Orange', phase: 'Climax', meaning: 'Buying exhaustion — potential top.' },
      { label: 'BDN', name: 'Breakdown', color: 'Red', phase: 'Decline', meaning: 'Selling pressure confirmed — downtrend.' },
    ],
    features: [
      'Four-layer detection system (Regime + Pilot Line + NanoFlow + Bar Close)',
      'Events confirm at bar close — no mid-bar false signals',
      'Non-repainting: what you see in history is what happened live',
      'Pilot Line: adaptive trend reference that adjusts to price movement',
      'Regime Bars: candle coloring (green=bullish, red=bearish, gray=neutral)',
      'NanoFlow Panel: momentum oscillator (-100 to +100)',
      'Five independent alert types, one per event',
    ],
    settings: [
      'Individual alert toggles for each event type',
      'Five preset color palettes',
      'Label size: small, medium, or large',
      'Custom color for each of the five events',
    ],
    combos: [
      'Pentarch + Janus Atlas → cycle timing at key price levels',
      'Pentarch + Volume Oracle → regime confirmation with volume',
      'Pentarch + OmniDeck → multi-system validation',
    ],
    bestFor: [
      '15-minute to 1-hour timeframes for learning',
      'All asset classes: stocks, futures, forex, crypto',
      'Identifying which phase the market is in right now',
    ],
    avoid: [
      'Choppy sideways consolidation (gray regime bars cluster)',
      'Extremely low-volume periods',
      'Major news events and earnings releases',
      '1-minute and 5-minute timeframes (excessive noise)',
    ],
    quickTips: [
      'Full five-event cycles (TD→IGN→WRN→CAP→BDN) are rare — partial sequences are normal.',
      'Layer 1 (Regime Classification) is the most critical filter. If it fails, the event is rejected.',
      'Gray regime bars = stay flat. Wait for color to return.',
      'TD + rising NanoFlow = strongest early entry signal.',
      'Use 15m or 1H charts when learning Pentarch — avoid 1m noise.',
    ],
  },

  janusAtlas: {
    name: 'Janus Atlas',
    character: 'The Cartographer',
    tagline: '60+ price levels across timeframes, sessions, volume, and market structure.',
    role: 'Maps every significant price level on your chart — support, resistance, VWAP, sessions, gaps, volume profile, and more.',
    events: [
      { label: 'BOS', name: 'Break of Structure', meaning: 'Trend continuation confirmed — price broke through a key swing point.' },
      { label: 'CHoCH', name: 'Change of Character', meaning: 'Potential trend reversal — the first sign structure is shifting.' },
      { label: 'HH/HL', name: 'Higher High / Higher Low', meaning: 'Bullish market structure intact.' },
      { label: 'LH/LL', name: 'Lower High / Lower Low', meaning: 'Bearish market structure intact.' },
      { label: 'FVG', name: 'Fair Value Gap', meaning: 'Price imbalance — market may return to fill it.' },
    ],
    features: [
      'Nine level categories: Classic, VWAP, Volume Profile, Sessions, Market Structure, Opening Range, Gaps, Killzones, Fibonacci',
      'Confluence Zones: auto-clusters nearby levels (e.g., "dH · wH · pdH (×3)")',
      'Distance Table: real-time resistance/support with % distance and confluence stars',
      'Four Anchored VWAPs: auto-detected swing pivots + four manual anchor slots',
      '58 individual alerts covering every level type',
      'CME Gap detection with auto-symbol matching',
      'Fair Value Gap detection with mitigation modes (Wick/Close)',
    ],
    settings: [
      'Label style: Box (arrow-style) or Text Only (clean)',
      'Line style: Solid, Dashed (default), Dotted',
      'Three transparency tiers for different level types',
      'Label Combine % controls confluence clustering distance',
      'Individual toggles for all 60+ level types',
    ],
    combos: [
      'Janus Atlas + Pentarch → levels where cycle events fire = highest conviction',
      'Janus Atlas + Volume Oracle → regime confirmation at key levels',
      'Janus Atlas + OmniDeck → Regime Box trend + structural levels',
    ],
    bestFor: [
      'Intraday: Session levels, Daily VWAP, POC, market structure',
      'Swing: Weekly/Monthly levels, Weekly VWAP, market structure',
      'Finding confluence zones where 3+ systems agree',
    ],
    avoid: [
      'Enabling 20+ levels simultaneously (visual clutter)',
      'Strong momentum moves where levels get steamrolled',
      'Extremely low-volume sessions',
      'Isolated single-level touches without confluence',
    ],
    quickTips: [
      'Confluence zones (3+ levels) are far more reliable than single levels.',
      'CHoCH is the first warning sign. BOS confirms the new direction.',
      'Naked POC (unfilled previous session POC) acts as a magnet for price.',
      'Use Text Only labels to reduce chart clutter.',
      'Monday levels stay relevant all week in the Distance Table.',
    ],
  },

  omniDeck: {
    name: 'OmniDeck',
    character: 'The Commander',
    tagline: '10 professional analysis tools in one unified indicator.',
    role: 'All-in-one overlay combining Exhaustion Counter, Squeeze Detector, Liquidity Sweeps, EMA Trio, SuperTrend, BMSB, Regime Box, Supply/Demand Zones, Candlestick Patterns, and a Confluence Score.',
    events: [
      { label: '1-9', name: 'Exhaustion Counter', meaning: 'Counts consecutive closes in one direction — 9 = potential reversal zone.' },
      { label: 'SQ', name: 'Squeeze Breakout', meaning: 'Bollinger Bands inside Keltner Channels — volatility compression about to release.' },
      { label: '💧/🩸', name: 'Liquidity Sweep', meaning: 'Stop-hunt pattern: price wicked beyond a level then rejected (55%+ wick).' },
      { label: 'GC/DC', name: 'Golden Cross / Death Cross', meaning: 'EMA 50/100/200 alignment shift — major trend signal.' },
      { label: '⭐⭐⭐', name: 'Supply/Demand Zone', meaning: 'Star-rated zones: ⭐⭐⭐ = highest quality institutional order block.' },
    ],
    features: [
      'Exhaustion Counter: counts 1-9 consecutive closes (green=downtrend exhaustion, red=uptrend)',
      'Squeeze Detector: Bollinger vs Keltner compression with breakout arrows',
      'Liquidity Sweeps: 💧 bull sweep / 🩸 bear sweep with 55% wick requirement',
      'EMA Trio: 50/100/200 moving averages with Golden Cross / Death Cross signals',
      'SuperTrend: ATR-based trend ribbon (green=bullish, red=bearish)',
      'BMSB: Bull Market Support Band (20 SMA + 21 EMA dynamic support zone)',
      'Regime Box: background color classifier (green/red/gray)',
      'Supply/Demand Zones: star-rated institutional order blocks',
      '16 automatic candlestick pattern detections',
      'Confluence Score Panel: weighted 0-10 scoring with Badge or Table display',
    ],
    settings: [
      'Master toggle to hide/show all overlays at once',
      'Confluence Score Panel: Badge (compact) or Table (detailed) display',
      'Score thresholds: High (default 7) and Low (default 3)',
      'Dynamic RCS Lookback: adjusts pattern sensitivity by timeframe',
      '38 independent alert types across all 10 systems',
    ],
    combos: [
      'OmniDeck Regime Box + Janus Atlas levels = directional bias at key prices',
      'OmniDeck Exhaustion + Pentarch timing = precise reversal zones',
      'OmniDeck Confluence Score + Volume Oracle = multi-system confirmation',
    ],
    bestFor: [
      'Start with 3-4 systems, master before adding more',
      'Hierarchical approach: Regime Box → Trend → Timing → Confirmation',
      'Confluence Score 8-10 = elite setups worth acting on',
    ],
    avoid: [
      'Enabling all 10 systems at once (visual overload)',
      'Exhaustion Counter alone in parabolic trends (count 9 doesn\'t mean reversal)',
      'Analysis paralysis from conflicting signals — use the hierarchy',
    ],
    quickTips: [
      'Always check Regime Box FIRST. Green = look long, Red = look short, Gray = wait.',
      'Confluence Score 8-10 = elite. 5-7 = moderate. Below 5 = skip.',
      'Exhaustion Counter 9 + Squeeze Breakout = powerful reversal setup.',
      '💧 Liquidity Sweep + ⭐⭐⭐ Supply Zone = institutional stop-hunt reversal.',
      'Master 4 systems before adding more. Weeks 1-2 core, Weeks 3-4 enhance.',
    ],
  },

  auguryGrid: {
    name: 'Augury Grid',
    character: 'The Prophet',
    tagline: 'Multi-timeframe scanner: 7 symbols × 3 timeframes = 21 simultaneous scans.',
    role: 'Scans 21 symbol/timeframe combinations in real-time, ranks signals by quality score, and provides complete entry/SL/TP setups.',
    events: [
      { label: '★★★', name: '95-100 Score', meaning: 'Excellent signal — highest quality with maximum confluence.' },
      { label: '★★', name: '85-94 Score', meaning: 'Good signal — multiple bonus factors aligned.' },
      { label: '★', name: '70-84 Score', meaning: 'Basic signal — met hard filters but fewer bonuses.' },
      { label: '🔗', name: '2TF Confluence', meaning: 'Same direction signal on 2 timeframes (+15 bonus).' },
      { label: '🔗🔗', name: '3TF Confluence', meaning: 'All 3 timeframes agree (+30 bonus) — highest probability.' },
    ],
    features: [
      '9-column display: Rank, Symbol, Timeframe, Bias, Age, Entry, SL, TP, P&L',
      'Quality scoring (0-100) with star ratings displayed',
      'MACD crossover detection filtered through 15+ confluence factors',
      'Signal lifecycle: Birth → Life → Death (SL hit, stale, or replaced)',
      'Blocker codes explain why no signal exists (⏳ MACD, ⏳ Trend, etc.)',
      'Multi-timeframe confluence detection (🔗 and 🔗🔗 badges)',
      'ATR-calculated Stop Loss, TP1, and TP2 levels',
      '9 symbol presets: Crypto, Forex, Indices, Tech, Commodities, Custom',
    ],
    settings: [
      'Min Score threshold (default 70) — filter low-quality signals',
      'Show Top N rows (default 7)',
      'ADX Minimum, RSI Range, Volume Spike multiplier (signal tuning)',
      'SL/TP1/TP2 ATR multipliers for position sizing',
      'Three configurable timeframes (default: 15m, 4H, Daily)',
      'Mobile Mode: one toggle for phone-optimized display',
    ],
    combos: [
      'Augury Grid → Pentarch: Grid identifies candidates, Pentarch confirms timing',
      'Augury Grid → Janus Atlas: Grid shows momentum, Atlas checks level confluence',
      'Augury Grid → Volume Oracle: Grid direction + Volume Oracle regime alignment',
    ],
    bestFor: [
      'Scanning multiple markets simultaneously — finds setups you\'d miss',
      'Prioritize ★★★ signals — skip ★ ratings',
      'Use as a screener FIRST, then open individual charts for verification',
    ],
    avoid: [
      'Acting on every signal without chart verification',
      'Monitoring too many symbols — focus on 4-5 you understand',
      'Correlated watchlist symbols (diversify across sectors)',
      'Trading ★ signals — they show poor follow-through',
    ],
    quickTips: [
      'One alert catches all 21 scans — set "Any alert() function call".',
      '★★★ signals dramatically outperform ★ signals. Quality over quantity.',
      '🔗🔗 (3TF confluence) = highest probability setups.',
      'Blocker codes tell you WHY there\'s no signal — use them to learn.',
      'Rotate your watchlist weekly — remove choppy/stagnant symbols.',
    ],
  },

  volumeOracle: {
    name: 'Volume Oracle',
    character: 'The Watchman',
    tagline: 'Regime detection with quality-scored buy/sell signals and position management.',
    role: 'Identifies whether the market is in Accumulation (buying), Distribution (selling), or Neutral phase — plus generates quality-rated entry signals with auto-calculated position sizing.',
    events: [
      { label: '🟢 BULL', name: 'Bull Signal', meaning: 'Bullish accumulation detected — institutional buying pressure.' },
      { label: '🔴 BEAR', name: 'Bear Signal', meaning: 'Bearish distribution detected — institutional selling pressure.' },
      { label: '⭐⭐⭐', name: 'Elite Quality', meaning: '80-100% quality score — highest confidence setup.' },
      { label: '⭐⭐', name: 'Premium Quality', meaning: '60-79% quality score — good confidence.' },
      { label: '⭐', name: 'Standard Quality', meaning: '40-59% quality score — moderate confidence.' },
    ],
    features: [
      'Three-state regime machine: Accumulation (green), Distribution (red), Neutral (gray)',
      'Quality scoring (0-100%) across 7 independent factors',
      'Five backend systems: Market Structure, Volume Footprint, Regime Stability, Confluence, Signal Density',
      'Regime Table: shows strength, duration, status, health, structure, market character',
      'Built-in risk management: auto position sizing based on account size + risk %',
      'Trailing stop and breakeven automation',
      'Multi-timeframe filter with strict mode option',
      'Three strategy modes: Trend Following, Mean Reversion, Hybrid',
    ],
    settings: [
      'Regime sensitivity: Conservative / Balanced / Aggressive',
      'Account size, risk per trade %, ATR length for position sizing',
      'Stop loss, TP1, TP2 ATR multipliers',
      'HTF filter with optional strict mode (hide conflicting signals)',
      'Strategy mode: Trend Following / Mean Reversion / Hybrid',
      '25 alert types across 8 categories',
    ],
    combos: [
      'Volume Oracle + Pentarch → regime validates timing events',
      'Volume Oracle + Janus Atlas → regime confirms significance of levels',
      'Volume Oracle + Plutus Flow → tactical (intraday) + strategic (multi-day) volume',
    ],
    bestFor: [
      '5-minute to daily timeframes (auto-adapting)',
      'Understanding WHO is in control — buyers or sellers',
      'Position sizing — auto-calculates based on your risk parameters',
    ],
    avoid: [
      'Acting against the regime direction',
      'Full-sizing during structure conflicts',
      'Chasing ⭐ (low quality) signals — wait for ⭐⭐ or ⭐⭐⭐',
      'Low-volume sessions (holidays, overnight)',
    ],
    quickTips: [
      'Green regime = bullish bias. Red = bearish. Gray = sit on your hands.',
      'FADING status = early warning the current regime is weakening.',
      'Structure ALIGNED + ⭐⭐⭐ signal = highest conviction entry.',
      'Reduce position size in CHOPPY markets — full size only in TRENDING.',
      'Volume Oracle (intraday) + Plutus Flow (multi-day) = complete volume picture.',
    ],
  },

  harmonicOscillator: {
    name: 'Harmonic Oscillator',
    character: 'The Arbiter',
    tagline: 'Seven-component voting system with composite oscillator and regime detection.',
    role: 'Synthesizes momentum across RSI, Stochastic RSI, MACD, EMA Trend, Momentum, Volume, and Divergence into a single consensus signal with vote count (X/7) and regime classification.',
    events: [
      { label: 'TRENDING▲', name: 'Bullish Trending', meaning: '6-7 components agree bullish — strong directional conviction.' },
      { label: 'TRENDING▼', name: 'Bearish Trending', meaning: '6-7 components agree bearish — strong downside conviction.' },
      { label: 'BIAS▲/▼', name: 'Directional Bias', meaning: '4-5 components aligned — direction forming but not yet full consensus.' },
      { label: 'RANGING—', name: 'Ranging', meaning: 'Components disagree — no clear direction, stay flat.' },
      { label: '▲ DIV / ▼ DIV', name: 'Divergence', meaning: 'Price and oscillator disagree — potential reversal signal.' },
    ],
    features: [
      'Seven voting components: RSI, Stochastic RSI, MACD, EMA Trend, Momentum, Volume, Divergence',
      'Composite oscillator (0-100 scale) with signal line for crossovers',
      'Regime classification: TRENDING, BIAS, or RANGING with direction',
      'Vote count display (e.g., 6/7 bullish)',
      'Overbought/Oversold zone fills with exit detection',
      'Automatic divergence detection (bullish and bearish)',
      'Status panel showing regime, votes, and component states',
      '14 alert types: divergences, crossovers, extreme zones, regime changes',
    ],
    settings: [
      'Signal Mode: Conservative (6/7), Balanced (5/7), Aggressive (4/7)',
      'Higher Timeframe Filter for divergence signals',
      'Consensus Meter display toggle',
      'Status Panel with 9 position options',
      'Table layout: Horizontal or Vertical',
      'OB/OS zone fill toggle',
    ],
    combos: [
      'Harmonic Oscillator + Pentarch → momentum consensus validates cycle events',
      'Harmonic Oscillator + Janus Atlas → momentum at structural levels',
      'Harmonic Oscillator + Volume Oracle → regime alignment validation',
    ],
    bestFor: [
      '15-minute minimum for intraday, 1H+ for multi-day',
      'Understanding momentum consensus across multiple measures',
      'Divergence detection for early reversal warnings',
    ],
    avoid: [
      'Choppy ranging markets (components constantly disagree)',
      '1-5 minute timeframes (too noisy for 7-component consensus)',
      'Persistent parabolic moves (components hit extremes and stay there)',
    ],
    quickTips: [
      '7/7 votes = maximum conviction. 4/7 = proceed with caution.',
      'RANGING regime = no trade. Wait for BIAS or TRENDING.',
      'Divergence warns but doesn\'t time — combine with Pentarch for entries.',
      'BIAS → TRENDING progression = momentum accelerating. Enter or add.',
      'Use Conservative mode (6/7) for fewer but higher-quality signals.',
    ],
  },

  plutusFlow: {
    name: 'Plutus Flow',
    character: 'The Scales',
    tagline: 'Enhanced OBV with cumulative volume tracking, trend ribbons, and divergence detection.',
    role: 'Tracks whether buyers or sellers control the market by maintaining a running volume total. Adds volume on up days, subtracts on down days. Reveals underlying money flow direction independent of price.',
    events: [
      { label: 'Cross Up', name: 'OBV Cross Up', meaning: 'OBV crossed above basis line — bullish flow shift (green dot).' },
      { label: 'Cross Down', name: 'OBV Cross Down', meaning: 'OBV crossed below basis line — bearish flow shift (red dot).' },
      { label: 'Breach ±2σ', name: 'Statistical Extreme', meaning: 'OBV hit ±2 standard deviations — overbought/oversold territory (white dot).' },
      { label: 'Bull Div', name: 'Bullish Divergence', meaning: 'Price lower low but OBV higher low — accumulation despite decline.' },
      { label: 'Bear Div', name: 'Bearish Divergence', meaning: 'Price higher high but OBV lower high — distribution despite rally.' },
    ],
    features: [
      'Four-layer analysis: OBV Line, Flow Ribbon, Statistical Bands (±2σ), Divergence Detection',
      'Adaptive volume filtering: auto-caps outlier bars from earnings/news events',
      'Flow Ribbon: green=bullish volume trend, red=bearish trend',
      'Statistical Bands at ±2 standard deviations for extreme identification',
      'Automatic bullish and bearish divergence detection',
      'Hidden divergence detection (continuation patterns)',
      'FlipGuard: minimum bars between opposite signals to prevent whipsaws',
      'HTF alignment filter for higher-timeframe direction agreement',
    ],
    settings: [
      'HTF timeframe selection for OBV calculation',
      'FlipGuard bars (minimum bars between opposite signals)',
      'Strict cross gate (ribbon direction alignment requirement)',
      'Robust extremes toggle (outlier-resistant statistical method)',
      'Min price swing (xATR) for divergence filtering',
      'Divergence label and extreme zone exit display toggles',
    ],
    combos: [
      'Plutus Flow + Pentarch → divergence signals confirmed by cycle timing events',
      'Plutus Flow + Janus Atlas → identify divergences at key structural levels',
      'Plutus Flow + Volume Oracle → cumulative OBV trend + regime detection',
    ],
    bestFor: [
      '1H to Weekly timeframes for strategic money flow analysis',
      'Spotting accumulation while price is still declining',
      'Confirming breakouts — real breakouts have Flow rising with price',
    ],
    avoid: [
      'Extended sideways/choppy markets (ribbon constantly flipping)',
      'Very low timeframes (1-5m) — excessive false divergences',
      'Forex spot pairs (no centralized volume data)',
      'Treating divergence as immediate reversal signal (it warns, doesn\'t time)',
    ],
    quickTips: [
      'Flow rising + Price falling = hidden accumulation. Watch for breakout.',
      'Ribbon WIDTH matters as much as color. Narrow = weak, Wide = strong.',
      'White dot (±2σ breach) + Yellow dot (zone exit) = reversal zone confirmed.',
      'Price breaking out but Flow NOT rising = suspect breakout. Likely a trap.',
      'Use Volume Oracle for intraday, Plutus Flow for multi-day — complete volume picture.',
    ],
  },
};

// Map common keywords to indicator keys for content enrichment
const INDICATOR_KEYWORDS = {
  pentarch: ['pentarch', 'sovereign', 'cycle detection', 'touchdown', 'ignition', 'breakdown', 'climax event', 'pilot line', 'nanoflow', 'regime bar', 'five phases', 'five events', 'TD event', 'IGN event', 'WRN event', 'CAP event', 'BDN event'],
  janusAtlas: ['janus atlas', 'janus', 'cartographer', 'price levels', 'vwap', 'volume profile', 'point of control', 'poc', 'confluence zone', 'fair value gap', 'fvg', 'market structure', 'break of structure', 'bos', 'change of character', 'choch', 'distance table', 'session levels', 'opening range', 'anchored vwap', 'fibonacci'],
  omniDeck: ['omnideck', 'omni deck', 'commander', 'exhaustion counter', 'squeeze detector', 'liquidity sweep', 'ema trio', 'supertrend', 'bmsb', 'regime box', 'supply demand', 'confluence score', 'golden cross', 'death cross', 'candlestick pattern', '10 systems', 'ten systems', 'all-in-one'],
  auguryGrid: ['augury grid', 'augury', 'prophet', 'multi-timeframe scanner', 'scanner', '21 scans', '7 symbols', 'signal quality', 'star rating', 'blocker code', 'signal lifecycle'],
  volumeOracle: ['volume oracle', 'watchman', 'regime detection', 'volume footprint', 'regime stability', 'regime table'],
  harmonicOscillator: ['harmonic oscillator', 'harmonic', 'arbiter', 'seven components', 'voting system', 'composite oscillator', 'vote count', 'consensus', 'trending regime', 'bias regime', 'ranging regime', 'momentum consensus', 'divergence detection'],
  plutusFlow: ['plutus flow', 'plutus', 'scales', 'obv', 'on-balance volume', 'flow ribbon', 'statistical bands', 'cross up', 'cross down', 'bull div', 'bear div', 'hidden divergence', 'flipguard', 'money flow', 'cumulative volume'],
};

// Detect which indicator(s) a post is about
function detectIndicators(post) {
  const searchText = `${post.title} ${post.twitter.tweets.join(' ')} ${post.instagram.caption || ''}`.toLowerCase();
  const matches = [];

  for (const [key, keywords] of Object.entries(INDICATOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        matches.push(key);
        break;
      }
    }
  }

  return [...new Set(matches)];
}

// Get contextual slide headers based on content analysis
function getContextualHeaders(post, indicatorKeys) {
  // If the post mentions specific indicator events/features, use those as context
  const title = post.title.toUpperCase();

  // Cheatsheet posts
  if (title.includes('CHEATSHEET') || title.includes('CHEAT SHEET')) {
    return ['What It Does', 'Key Signals', 'How To Read Them', 'The Setup', 'Pro Tip', 'When To Use It'];
  }

  // Deep dive / product demo posts
  if (title.includes('DEEP DIVE') || title.includes('DEMO')) {
    return ['The Problem', 'How It Works', 'Key Features', 'In Practice', 'The Edge', 'Getting Started'];
  }

  // Combo / integration posts
  if (title.includes('COMBO') || title.includes('+') || indicatorKeys.length > 1) {
    return ['The Approach', 'System 1', 'System 2', 'How They Combine', 'The Signal', 'The Workflow'];
  }

  // Setup posts
  if (title.includes('SETUP') || title.includes('WORKFLOW') || title.includes('HOW TO')) {
    return ['The Method', 'Step 1', 'Step 2', 'Step 3', 'The Execution', 'Key Takeaway'];
  }

  // Default indicator-related headers
  if (indicatorKeys.length > 0) {
    return ['The Concept', 'How It Works', 'Reading The Signals', 'Configuration', 'Pro Tips', 'The Edge'];
  }

  return null; // Fall back to type-based headers
}

export { INDICATORS, INDICATOR_KEYWORDS, detectIndicators, getContextualHeaders };
