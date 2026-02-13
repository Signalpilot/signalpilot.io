#!/usr/bin/env node
/**
 * Expand Complex Education + Meaty Blog posts from 3 tweets to 4-5 tweets.
 * These topics deserve more depth than a simple 3-tweet thread.
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu  = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
const docsHome = 'https://docs.signalpilot.io';
const tv = {
  pentarch:     'https://www.tradingview.com/script/S8LniK8O-Pentarch-Cycle-Phase-Detection/',
  volumeOracle: 'https://www.tradingview.com/script/L9AQHzjY-Volume-Oracle-Regime-Detection/',
  janusAtlas:   'https://www.tradingview.com/script/28diwImS-Janus-Atlas-Multi-Timeframe-Auto-Levels/',
  plutusFlow:   'https://www.tradingview.com/script/uoZjVlZA-Plutus-Flow-Statistical-OBV-Analysis/',
  harmonicOsc:  'https://www.tradingview.com/script/Vpxnhy8j-Harmonic-Oscillator-Multi-Component-Momentum-Consensus/',
  auguryGrid:   'https://www.tradingview.com/script/H2REdDlY-Augury-Grid-Multi-Timeframe-Scanner/',
  omniDeck:     'https://www.tradingview.com/script/OatvfCuB-OmniDeck-Unified-Chart-Overlay/'
};

const expansions = {
  // ═══════════════════════════════════════════
  // COMPLEX EDUCATION POSTS (3→4-5 tweets)
  // ═══════════════════════════════════════════

  // ── 11  Price Action ──
  11: [
    `"Price action is dead." That's what indicator-only traders say. They're wrong. \u{1F9F5}`,
    `Price action is the foundation. Every indicator is derived FROM price. Understanding candles, structure, and context means you can read a chart naked — no indicators needed. That's the base skill.`,
    `Where indicators add value: they quantify what price action shows qualitatively. Volume confirms conviction. Momentum measures strength. Cycles reveal timing. They don't replace price action — they enhance it.`,
    `The best traders combine both. Read the chart first. Confirm with indicators second. Never let an indicator override what the chart is telling you.\n\n\u{1F4D6} Free price action lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 39  Position Sizing ──
  39: [
    `Position sizing isn't a detail. It's the most important decision in every trade. \u{1F9F5}`,
    `The formula: Risk Amount \u{00F7} (Entry - Stop) = Position Size.\n\nIf you risk 1% of $10,000 = $100. Your stop is 50 pips away. $100 \u{00F7} 50 = $2 per pip. That's your size. Non-negotiable.`,
    `Why it matters: two traders with the same strategy but different position sizing will have completely different results. Too big = blown account on a losing streak. Too small = no meaningful returns. The math is the edge.`,
    `The 1-2% rule exists for survival. At 1% risk per trade, you can lose 20 times in a row and still have 80% of your account. That's not conservative — that's smart.\n\nKnow this math cold.`,
    `\u{1F4D6} Free position sizing lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 56  Candlestick Doji ──
  56: [
    `Candlestick patterns: the Doji. When the market can't decide. \u{1F9F5}`,
    `A Doji forms when open and close are nearly identical. The market went up, went down, and ended where it started. Neither bulls nor bears won. Pure indecision captured in one candle.`,
    `Types of Doji:\n\u{2022} Standard Doji: equal wicks, tiny body\n\u{2022} Dragonfly: long lower wick (buyers fought back)\n\u{2022} Gravestone: long upper wick (sellers rejected the high)\n\u{2022} Long-legged: both wicks extended (maximum indecision)`,
    `The key: a Doji ALONE means nothing. A Doji at a key support level after a downtrend? That's a potential reversal signal. Context determines everything. Never trade a candle pattern in isolation.`,
    `\u{1F4D6} Free candlestick lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 299  Candlestick Basics ──
  299: [
    `Candlestick basics: learning to read the visual language of price action. \u{1F9F5}`,
    `Every candle has four data points: open, high, low, close. The body shows the range between open and close. The wicks show the extremes. Green/white = close above open. Red/black = close below open.`,
    `Key single-candle patterns:\n\u{2022} Hammer: long lower wick at support (reversal)\n\u{2022} Shooting Star: long upper wick at resistance (reversal)\n\u{2022} Engulfing: larger body swallows previous candle (momentum shift)\n\u{2022} Doji: indecision`,
    `The rule: candle patterns are CONTEXT clues, not signals. A hammer at a key support level after a downtrend = meaningful. A hammer in the middle of nowhere = noise. Always pair with structure.`,
    `\u{1F4D6} Free candlestick lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 309  Volume Basics ──
  309: [
    `Volume confirms price. Without it, every move is suspicious. \u{1F9F5}`,
    `Breakout WITH volume = institutional participation, real conviction. Breakout WITHOUT volume = weak move, likely to fail or reverse. Volume is the market's polygraph test.`,
    `Volume patterns to watch:\n\u{2022} Rising volume on trend = healthy, confirmed\n\u{2022} Declining volume on trend = weakening, potential reversal\n\u{2022} Volume spike at a level = absorption or climax\n\u{2022} Volume drought = compression before expansion`,
    `The simple rule: always ask "does volume confirm what price is showing?" If yes, trade with confidence. If no, proceed with caution or wait.\n\n\u{1F4D6} Free volume lessons: ${edu}\n\u{1F50D} Volume Oracle: ${tv.volumeOracle}`
  ],

  // ── 316  Trading Plan ──
  316: [
    `No plan = no edge. Your trading plan is your business blueprint. Without it, you're gambling. \u{1F9F5}`,
    `Essential components:\n\u{2022} What you trade (markets, assets)\n\u{2022} When you trade (sessions, timeframes)\n\u{2022} How much you risk (per trade, per day, per week)\n\u{2022} Entry criteria (specific, repeatable)\n\u{2022} Exit criteria (targets + stops)`,
    `The part most traders skip: MAX DAILY LOSS. Set a limit. When you hit it, you're done for the day. No exceptions. This one rule prevents more blowups than any strategy ever could.`,
    `Write it down. Print it. Tape it next to your screen. If it's not written, it doesn't exist. A plan in your head changes with your emotions. A plan on paper doesn't.\n\n\u{1F4D6} Free plan-building lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 322  Multiple Timeframe Analysis ──
  322: [
    `Multiple timeframe analysis: the technique that separates amateurs from professionals. \u{1F9F5}`,
    `One chart lies. Three charts reveal. Higher TF = direction (where is the trend?). Middle TF = structure (where are the key levels?). Lower TF = entry (where exactly do I get in?).`,
    `Example setup:\n\u{2022} Daily chart: clear uptrend, price pulling back\n\u{2022} 4H chart: pullback reaching key support zone\n\u{2022} 1H chart: bullish reversal candle at support\n\nAll three agree \u{2192} high-probability long setup.`,
    `When timeframes DISAGREE: wait. Daily bullish but 1H bearish? That's conflict. Trading conflict = low probability. Patience until alignment.\n\n\u{1F4D6} Free MTF lesson: ${edu}\n\u{1F50D} Augury Grid: ${tv.auguryGrid}`
  ],

  // ── 326  Confluence Trading ──
  326: [
    `Confluence: the art of stacking independent factors until probability is overwhelmingly in your favor. \u{1F9F5}`,
    `One reason to trade = weak. Two reasons = interesting. Three or more = confluence. When support aligns with a moving average, a Fibonacci level, and increasing volume — that's a zone worth trading.`,
    `What counts as independent confluence:\n\u{2022} Price level (support/resistance)\n\u{2022} Indicator signal (momentum, volume)\n\u{2022} Pattern (candle, chart pattern)\n\u{2022} Timeframe agreement\n\u{2022} Time of day (killzone)`,
    `What does NOT count: three correlated indicators agreeing. RSI + Stochastic + CCI all saying "oversold" is ONE signal said three ways, not three signals. True confluence = independent factors.\n\n\u{1F4D6} Free confluence lesson: ${edu}\n\u{1F6E0}\uFE0F Stack signals with: ${site}`
  ],

  // ── 332  Trend Continuation Patterns ──
  332: [
    `Trend continuation patterns: the pause before the next leg. Not every pullback is a reversal. \u{1F9F5}`,
    `Flags: sharp move \u{2192} tight rectangular consolidation \u{2192} breakout continues trend. Pennants: sharp move \u{2192} converging triangle \u{2192} breakout. Both are "resting" patterns within strong trends.`,
    `Ascending/descending triangles: one flat side (support or resistance) and one angled side (higher lows or lower highs). The flat side eventually breaks. Direction depends on the prevailing trend.`,
    `How to trade them: wait for the breakout from the pattern WITH volume confirmation. Enter on the breakout or the retest. Stop below the pattern. Target = the height of the move that preceded the pattern.\n\n\u{1F4D6} Free pattern lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 336  Reversal Patterns ──
  336: [
    `Reversal patterns: the warning signs that a trend may be ending. \u{1F9F5}`,
    `Double top/bottom: price tests a level twice and fails. The second failure shows momentum is exhausted. Confirmation: break below the neckline (double top) or above (double bottom).`,
    `Head & Shoulders: three peaks — middle one highest (head), two lower ones (shoulders). The neckline connecting the lows between peaks is your trigger. Break below = reversal confirmed.`,
    `The critical rule: reversal patterns are WARNINGS, not signals. A double top + declining volume + bearish divergence? Now you're onto something. A double top alone could just be a range.\n\n\u{1F4D6} Free pattern lessons: ${edu}\n\u{1F50D} Spot divergence: ${tv.harmonicOsc}`
  ],

  // ── 339  Trading Psychology Fundamentals ──
  339: [
    `Trading is 20% strategy, 80% psychology. The most neglected edge: your own mind. \u{1F9F5}`,
    `You can have the best system in the world and still lose money. Why? Because in the heat of the moment, fear makes you exit winners early, greed makes you overtrade, and ego makes you hold losers.`,
    `The four psychological pillars:\n\u{2022} Discipline: following rules when it's hard\n\u{2022} Patience: waiting for your setup, not just any setup\n\u{2022} Emotional regulation: feeling the fear but executing anyway\n\u{2022} Self-awareness: knowing when you're compromised`,
    `Strategy is the car. Psychology is the driver. The best car in the world crashes with a bad driver. The mediocre car wins the race with a great one.\n\n\u{1F4D6} Free psychology lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 346  Candlestick Patterns (deeper) ──
  346: [
    `Candlestick patterns: the visual shortcuts to price action reading. \u{1F9F5}`,
    `Single candle patterns:\n\u{2022} Hammer/Hanging Man: long lower wick (context determines bullish vs bearish)\n\u{2022} Shooting Star/Inverted Hammer: long upper wick\n\u{2022} Marubozu: no wicks at all (pure dominance)`,
    `Multi-candle patterns:\n\u{2022} Engulfing: larger candle swallows the previous one (momentum shift)\n\u{2022} Morning/Evening Star: 3-candle reversal at key levels\n\u{2022} Three White Soldiers/Black Crows: three consecutive strong candles`,
    `Remember: patterns at KEY LEVELS are meaningful. Patterns in the middle of a range are noise. The pattern tells you "what." The context tells you "if it matters."\n\n\u{1F4D6} Free candlestick lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 349  Position Sizing Formula ──
  349: [
    `Position sizing formula: the math that saves accounts. Learn it. Use it. Every time. \u{1F9F5}`,
    `The formula:\nRisk Amount \u{00F7} (Entry Price - Stop Loss Price) = Position Size\n\nExample: 1% of $10,000 = $100 risk. Entry at $50, stop at $48. $100 \u{00F7} $2 = 50 shares. That's your maximum position.`,
    `For forex/crypto pip-based:\nRisk Amount \u{00F7} (Stop in pips \u{00D7} Pip value) = Lot size\n\n$100 risk, 25-pip stop, $10/pip per standard lot: $100 \u{00F7} ($25 \u{00D7} $10) = 0.4 lots.`,
    `The non-negotiable rule: calculate BEFORE you enter. Never size a position based on "feel" or how much you "want" to make. The math determines the size. The size determines your survival.\n\n\u{1F4D6} Free risk management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 352  Fibonacci Retracements ──
  352: [
    `Fibonacci retracements: measuring pullbacks within trends to find high-probability entries. \u{1F9F5}`,
    `Key levels: 38.2%, 50%, 61.8%, 78.6%. These aren't magic numbers — they're zones where pullbacks statistically tend to find support or resistance. Use them as areas of interest, not exact lines.`,
    `How to draw them: anchor the Fibonacci tool from swing low to swing high (uptrend) or high to low (downtrend). The retracement levels auto-populate. Watch for reactions at each zone.`,
    `The golden zone: 61.8%-78.6% retracement. Deeper pullbacks that hold here show the trend is still intact but offered a premium entry. When this zone aligns with an order block or support level, probability jumps.\n\n\u{1F4D6} Free Fibonacci lesson: ${edu}\n\u{1F50D} Auto-level detection: ${tv.janusAtlas}`
  ],

  // ── 356  Breakout Trading ──
  356: [
    `Breakout trading: catching the moment range resolves into trend. High reward, tricky execution. \u{1F9F5}`,
    `What makes a valid breakout:\n\u{2022} Clear consolidation/range beforehand (the longer, the more powerful)\n\u{2022} Volume expansion ON the break (not before, not after — on it)\n\u{2022} The candle that breaks closes beyond the level (not just wicks through)`,
    `False breakout defense: wait for the RETEST. Price breaks out \u{2192} pulls back to the broken level \u{2192} holds \u{2192} enter. The retest confirms the break was real. Entering on the initial break exposes you to fakeouts.`,
    `Stop placement: below the breakout level (longs) or above (shorts). Target: the height of the range projected from the breakout point. Clean, measurable, repeatable.\n\n\u{1F4D6} Free breakout lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 359  Divergence Trading ──
  359: [
    `Divergence: when price and an indicator disagree, the indicator is often right. \u{1F9F5}`,
    `Bearish divergence: price makes a HIGHER high, but the oscillator makes a LOWER high. Momentum is weakening even though price is climbing. The engine is losing power before the car slows down.`,
    `Bullish divergence: price makes a LOWER low, but the oscillator makes a HIGHER low. Selling pressure is exhausting. The downtrend is running on fumes. A bounce or reversal may be incoming.`,
    `Critical rule: divergence is a WARNING, not a signal. It says "momentum is shifting" — not "reverse now." Wait for price action confirmation: a reversal candle, a break of structure, or a trendline break.\n\n\u{1F4D6} Free divergence lesson: ${edu}\n\u{1F50D} Harmonic Oscillator: ${tv.harmonicOsc}`
  ],

  // ── 362  Trading Sessions ──
  362: [
    `The 24-hour market isn't uniform. Each session has its own personality and opportunities. \u{1F9F5}`,
    `Asian session (6 PM - 3 AM EST): consolidation. Low volatility, tight ranges. Smart money accumulates. Sets the boundaries that London will target. Best for range strategies or marking key levels.`,
    `London session (3 AM - 12 PM EST): trend initiation. The highest probability directional moves start here. Often sweeps one side of the Asian range. London + NY overlap (8-12 EST) = peak liquidity.`,
    `New York session (8 AM - 5 PM EST): continuation or reversal. Biggest volume, biggest moves. Major economic data drops here. If London started a trend, NY continues it. If London was wrong, NY corrects it.`,
    `The strategy: mark Asian range before London opens. Trade London's directional move. Manage or close before NY close. Match your activity to the session's character.\n\n\u{1F4D6} Free session lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 379  Stop Loss Types ──
  379: [
    `Different stop loss types for different situations. One size does NOT fit all. \u{1F9F5}`,
    `Fixed stop: set distance from entry (e.g., 20 pips). Simple, consistent. Works for scalping and day trading with consistent setups. Downside: doesn't adapt to volatility changes.`,
    `ATR-based stop: uses Average True Range to adjust for volatility. Volatile market = wider stop. Quiet market = tighter stop. Adapts automatically. Best for swing trading across different market conditions.`,
    `Structure-based stop: placed behind key support/resistance, order blocks, or swing points. "My thesis is wrong if price reaches here." Most logical placement because it ties to the market's own structure.`,
    `Trailing stop: moves WITH price to lock in profits. Trail behind swing lows (longs) or swing highs (shorts). Best for trending markets where you want to maximize the move without giving back gains.\n\n\u{1F4D6} Free stop loss lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 382  Correlation ──
  382: [
    `Correlation: how assets move relative to each other. Understanding it prevents hidden risk. \u{1F9F5}`,
    `Positive correlation: assets move together. BTC and ETH. EUR/USD and GBP/USD. S&P 500 and NASDAQ. If you're long both, you're essentially doubling your directional exposure.`,
    `Negative correlation: assets move opposite. EUR/USD and USD/CHF. Gold and real yields. Risk-on and risk-off assets. These can be used for hedging or confirming macro direction.`,
    `The hidden risk: trading two positively correlated assets feels like diversification but IS NOT. If EUR/USD drops, GBP/USD likely drops too. You're not in two trades — you're in one trade, twice the size.`,
    `Practical rule: before opening a second position, check if it correlates with your existing positions. If it does, you're adding risk, not diversifying.\n\n\u{1F4D6} Free correlation lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 386  Backtesting ──
  386: [
    `Backtesting: validating your strategy on historical data before risking real money. Non-negotiable step. \u{1F9F5}`,
    `What to measure:\n\u{2022} Win rate (how often you win)\n\u{2022} Average win vs average loss (reward per trade)\n\u{2022} Max drawdown (worst losing streak)\n\u{2022} Profit factor (gross profit / gross loss)\n\u{2022} Sample size (minimum 200 trades)`,
    `Common backtesting mistakes:\n\u{2022} Peeking ahead at future candles\n\u{2022} Cherry-picking favorable time periods\n\u{2022} Ignoring spread, slippage, and commissions\n\u{2022} Curve-fitting rules to past data\n\u{2022} Testing on too few trades`,
    `If you can't answer "what's my edge over 200 trades?" you're not trading — you're hoping. Backtesting turns hope into evidence.\n\n\u{1F4D6} Free backtesting lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 319  Fear vs Greed ──
  319: [
    `Fear and greed: the twin enemies of every trader. Understanding them is half the battle. \u{1F9F5}`,
    `Fear makes you:\n\u{2022} Exit winners too early (afraid of giving back profit)\n\u{2022} Skip valid setups (afraid of losing)\n\u{2022} Freeze at entries (paralysis by analysis)\n\u{2022} Move stops tighter (suffocating the trade)`,
    `Greed makes you:\n\u{2022} Overtrade (need to be in the market)\n\u{2022} Ignore stops (the trade will come back)\n\u{2022} Chase moves (can't miss this one)\n\u{2022} Oversize positions (need bigger returns)`,
    `The cure for both: a written plan and the discipline to follow it. Fear and greed thrive in ambiguity. Remove ambiguity with rules. When the rules are clear, emotions have less room to operate.\n\n\u{1F4D6} Free psychology lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ═══════════════════════════════════════════
  // MEATY BLOG POSTS (3→4-5 tweets)
  // ═══════════════════════════════════════════

  // ── 53  Why Most Traders Fail ──
  53: [
    `Why do most traders fail? It's not markets. It's not intelligence. It's these five things. \u{1F9F5}`,
    `1. Unrealistic expectations: expecting 10% monthly returns instead of 2-3% annually above benchmarks.\n2. No education: jumping in without understanding what they're trading.\n3. No plan: winging it with real money.`,
    `4. Emotional trading: letting fear and greed drive every decision instead of rules.\n5. Undercapitalization: starting with too little money, forcing oversized positions to make it "worthwhile."`,
    `The fix for all five: education + plan + discipline + realistic goals + adequate capital. Fix the inputs, the outputs change. Most people try to fix the outputs (P&L) directly. That doesn't work.`,
    `\u{1F4DD} Full article: ${blog}\n\u{1F393} Fix the inputs here: ${edu}`
  ],

  // ── 307  Building a Trading Routine ──
  307: [
    `Successful traders don't wing it. They follow routines. And routines remove the most expensive thing in trading: emotion. \u{1F9F5}`,
    `Pre-market routine (30 min):\n\u{2022} Review overnight moves\n\u{2022} Check economic calendar\n\u{2022} Mark key levels on charts\n\u{2022} Define today's setups and scenarios\n\u{2022} Set alerts`,
    `During session:\n\u{2022} Follow the plan (no improvising)\n\u{2022} Take screenshots of every trade\n\u{2022} Log emotions in real-time\n\u{2022} Hit max daily loss = stop trading`,
    `Post-session (15 min):\n\u{2022} Review all trades\n\u{2022} Grade execution 1-10\n\u{2022} Note one improvement for tomorrow\n\nWeekly: full journal review + stats update.\n\n\u{1F4DD} Build your routine: ${blog}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 317  Survivorship Bias ──
  317: [
    `You see successful traders. You don't see the 95% who failed. That's survivorship bias — and it's distorting your expectations. \u{1F9F5}`,
    `Social media amplifies survivors. The trader with $1M in profits gets 100K followers. The 999 traders who lost everything? Silent. Invisible. You're building expectations from a biased sample.`,
    `What the survivors don't show: the years of losses. The blown accounts. The emotional breakdowns. The times they almost quit. The highlight reel isn't the journey — it's the PR version of it.`,
    `The fix: study failures, not just successes. Read about blown accounts. Understand WHY traders fail. The lessons from failure are more valuable than the inspiration from success.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn the real path: ${edu}`
  ],

  // ── 337  Sunk Cost Fallacy ──
  337: [
    `"I've held this long, I can't sell now." That's the sunk cost fallacy. And it's destroying your account. \u{1F9F5}`,
    `The fallacy: past investment (time, money, emotion) shouldn't influence future decisions. But our brains aren't wired that way. We hold losers because "selling makes the loss real." The loss IS real. Holding just makes it bigger.`,
    `The test: if you had cash instead of this position right now, would you open it at this price? If no — close it. The money already spent is gone. The only question is what to do with what's left.`,
    `In trading: sunk cost manifests as holding losing trades too long, averaging down into losers, and refusing to close a position because "I've already lost so much." Cut it. Move on. Capital preservation is survival.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology deep dives: ${edu}`
  ],

  // ── 357  Comparison Trap ──
  357: [
    `Comparing yourself to other traders is a trap. A trap with teeth. \u{1F9F5}`,
    `What you DON'T see:\n\u{2022} Their losses (they don't post those)\n\u{2022} Their account size (that $10K gain might be 0.1% of their account)\n\u{2022} Their risk (that "genius trade" might have been a reckless gamble)\n\u{2022} Their timeline (10 years of losses before this)`,
    `What comparison does to you: breeds insecurity, encourages oversizing, makes you chase strategies that don't fit your personality, and destroys the patience needed for YOUR process to work.`,
    `Your only benchmark: yesterday's version of you. Are your entries improving? Are your losses smaller? Is your discipline stronger? That's the only comparison that matters.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Mindset education: ${edu}`
  ],

  // ── 363  Imposter Syndrome ──
  363: [
    `"Am I actually good at this, or just lucky?" Imposter syndrome hits traders hard. Here's how to handle it. \u{1F9F5}`,
    `After a winning streak: "I don't deserve this. The market was easy. Anyone could have done it." After a loss: "See, I knew I wasn't good enough. The wins were luck, the losses are proof."`,
    `The cure is DATA, not feelings. Track every trade. Calculate your stats over 100+ trades. If your win rate, R:R, and profit factor are positive over a large sample — you have an edge. That's not luck. That's skill measured.`,
    `Your feelings lie. Your journal doesn't. Trust the data. Build confidence from evidence, not from how you feel on any given day.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 367  When Trading Becomes Gambling ──
  367: [
    `Trading becomes gambling when you cross these lines. The transition is subtle. \u{1F9F5}`,
    `You're gambling when:\n\u{2022} You can't define your edge\n\u{2022} You can't define your risk before entering\n\u{2022} You're trading for excitement, not profit\n\u{2022} You increase size after losses (chasing)\n\u{2022} You ignore stop losses`,
    `The key difference: a trader has a plan, defined risk, and accepts losses as business expenses. A gambler has hope, undefined risk, and sees losses as bad luck. Same charts. Completely different activity.`,
    `If any of those signs sound familiar: stop trading. Not permanently. Just long enough to build a real plan, backtest a real edge, and define real rules. Then come back as a trader, not a gambler.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Rebuild with education: ${edu}`
  ],

  // ── 377  Building Confidence ──
  377: [
    `Trading confidence isn't born. It's built. Brick by brick. Over hundreds of trades. \u{1F9F5}`,
    `How confidence is ACTUALLY built:\n\u{2022} Journaling 200+ trades and seeing your stats improve\n\u{2022} Surviving a drawdown without blowing up\n\u{2022} Following your rules on a day when it was hard\n\u{2022} Backtesting and seeing your edge hold over time`,
    `What confidence is NOT: feeling good after a win. That's euphoria, and it's dangerous. Real confidence is calm, quiet, and comes from knowing — not hoping — that your edge works.`,
    `The progression: incompetent \u{2192} conscious incompetence \u{2192} conscious competence \u{2192} unconscious competence. You're building your way through these stages. It takes time. There are no shortcuts.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Start building: ${edu}`
  ],

  // ── 393  Trading Identity ──
  393: [
    `Who are you as a trader? If you can't answer that, you're trading someone else's strategy with your money. \u{1F9F5}`,
    `Questions to answer:\n\u{2022} Day trader or swing trader? (What fits your schedule?)\n\u{2022} Aggressive or conservative? (What lets you sleep?)\n\u{2022} Technical or fundamental? (What makes sense to you?)\n\u{2022} Patient or action-oriented? (What matches your personality?)`,
    `Why identity matters: copying someone's strategy rarely works because it doesn't fit YOUR psychology. An aggressive scalper's strategy will torture a patient swing trader. The best strategy is the one you can actually follow.`,
    `There's no "right" trading identity. There's only YOUR right identity. Find it. Own it. Stop trying to be someone else at the charts.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Find your style: ${edu}`
  ],

  // ── 397  10,000 Hour Myth ──
  397: [
    `10,000 hours of bad practice = 10,000 hours of bad habits. The myth needs correcting. \u{1F9F5}`,
    `The myth: "Just trade more and you'll improve." "Screen time equals experience." Reality: repetition without reflection is stagnation. You can trade for 10 years and be no better than year two.`,
    `What ACTUALLY improves trading: deliberate practice. Focused on specific weaknesses. Uncomfortable and challenging. Measured and reviewed. One deeply analyzed trade teaches more than ten unexamined ones.`,
    `The feedback loop: trade \u{2192} journal \u{2192} review \u{2192} identify weakness \u{2192} focus practice on that weakness \u{2192} repeat. Quality of learning > quantity of screen time. Work smarter, not just longer.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Quality education: ${edu}`
  ],

  // ── 403  Trading Burnout ──
  403: [
    `Trading burnout is real. It's more common than people admit. And it can end your career if you ignore it. \u{1F9F5}`,
    `Warning signs:\n\u{2022} Dreading market open\n\u{2022} Constant fatigue even after rest\n\u{2022} Unable to focus on analysis\n\u{2022} Taking trades you don't believe in\n\u{2022} Feeling numb to both wins and losses`,
    `Root causes: overtrading, no boundaries between trading and life, unrealistic pressure, isolation, consecutive losses without processing them. It's cumulative — small stresses stack until they break you.`,
    `The fix isn't more screen time. It's:\n\u{2022} Taking a real break (days, not hours)\n\u{2022} Setting strict trading hours\n\u{2022} Reconnecting with why you started\n\u{2022} Talking to someone who understands\n\nProtect the trader to protect the trading.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Mental health matters: ${edu}`
  ],

  // ── 413  Building Trading Systems ──
  413: [
    `A trading system isn't just a strategy. It's the entire framework that turns random trades into a business. \u{1F9F5}`,
    `The components most people have:\n\u{2022} Entry rules (when to buy/sell)\n\u{2022} Maybe exit rules (when to close)\n\nThe components most people SKIP:\n\u{2022} Risk management rules\n\u{2022} Position sizing formula\n\u{2022} Journaling process\n\u{2022} Review schedule\n\u{2022} Mental rules (when to stop)`,
    `Without ALL of these, you have a strategy. With them, you have a business. A restaurant isn't just recipes — it's inventory management, staff training, quality control, and customer service too.`,
    `Build the system first. Test it on 200+ trades. Refine the weak points. Only then trade it live. The system does the heavy lifting. You just follow it.\n\n\u{1F4DD} Read more: ${blog}\n\u{1F393} Build your system: ${edu}`
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
  console.log(`Education + Blog expansion complete: ${updated} posts expanded to 4-5 tweets`);
}

main();
