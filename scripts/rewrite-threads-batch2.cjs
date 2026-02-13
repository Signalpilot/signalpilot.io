#!/usr/bin/env node
/**
 * Batch 2: Rewrites Education, Blog, Marketing, Docs, and Quote posts (61-110)
 * into proper multi-tweet threads.
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
const docsHome = 'https://docs.signalpilot.io';

const tv = {
  pentarch: 'https://www.tradingview.com/script/S8LniK8O-Pentarch-Cycle-Phase-Detection/',
  volumeOracle: 'https://www.tradingview.com/script/L9AQHzjY-Volume-Oracle-Regime-Detection/',
  janusAtlas: 'https://www.tradingview.com/script/28diwImS-Janus-Atlas-Multi-Timeframe-Auto-Levels/',
  plutusFlow: 'https://www.tradingview.com/script/uoZjVlZA-Plutus-Flow-Statistical-OBV-Analysis/',
  harmonicOsc: 'https://www.tradingview.com/script/Vpxnhy8j-Harmonic-Oscillator-Multi-Component-Momentum-Consensus/',
  auguryGrid: 'https://www.tradingview.com/script/H2REdDlY-Augury-Grid-Multi-Timeframe-Scanner/',
  omniDeck: 'https://www.tradingview.com/script/OatvfCuB-OmniDeck-Unified-Chart-Overlay/'
};

const docs = {
  pentarch: 'https://docs.signalpilot.io/pentarch-v10',
  volumeOracle: 'https://docs.signalpilot.io/volume-oracle-v10',
  janusAtlas: 'https://docs.signalpilot.io/janus-atlas-v10',
  plutusFlow: 'https://docs.signalpilot.io/plutus-flow-v10',
  harmonicOsc: 'https://docs.signalpilot.io/harmonic-oscillator-v10',
  auguryGrid: 'https://docs.signalpilot.io/augury-grid-v10',
  omniDeck: 'https://docs.signalpilot.io/omnideck-v10'
};

// =============================================
// REWRITES MAP: postNumber -> [tweet1, tweet2, tweet3]
// =============================================
const rewrites = {
  // --- POST 61: MARKETING - LIFETIME ACCESS ---
  61: [
    "$69/month forever. Or $999 once.\n\nLifetime access to everything Signal Pilot offers. \u{1F9F5}",
    "What you get with lifetime:\n\n◾ All 7 indicators, forever\n◾ Every future update included\n◾ 82 lessons + all new content\n◾ No recurring payments, ever\n\nMonth 15 and beyond? You're trading for free.\n\nPay once. Trade forever.",
    `\u{1F517} See all plans: ${site}\n📖 82 free lessons: ${edu}`
  ],

  // --- POST 62: EDUCATION - CANDLESTICK PATTERNS (Lesson 14) ---
  62: [
    "Hammer. Engulfing. Morning star.\n\nCandlestick patterns aren't magic signals. They're stories. \u{1F9F5}",
    "Each candle tells you who won that battle — bulls or bears.\n\n🔨 Hammer: Sellers pushed down, buyers reclaimed\n🌊 Engulfing: Momentum shift mid-battle\n⭐ Morning Star: Three-act reversal story\n\nLearn to read the story, not memorize the names.\nContext determines if the story continues.",
    `📖 Full lesson: ${edu}\n🎓 Free PDF guide in bio`
  ],

  // --- POST 63: BLOG - BREAKOUT VS FAKEOUT ---
  63: [
    "Every fakeout looks like a breakout at first. \u{1F9F5}",
    "How to tell the difference:\n\n✅ REAL BREAKOUT:\n◾ Volume spikes on the break\n◾ Closes beyond level (not just wicks)\n◾ Follow-through candles\n\n❌ FAKEOUT:\n◾ Low volume on break\n◾ Wicks beyond, closes back inside\n◾ Quick reversal, no follow-through\n\nThe fix: Don't chase the initial break. Wait for confirmation.",
    `📝 Full article: ${blog}\n📖 More education: ${edu}`
  ],

  // --- POST 64: QUOTE CARD ---
  64: [
    "\"Plan the trade. Trade the plan. Review the trade.\"\n\nThree steps. Most skip two of them. \u{1F9F5}",
    "Planning without execution is fantasy.\nExecution without review is gambling.\n\nSTEP 1: Plan entry, stop, target BEFORE you click\nSTEP 2: Follow your plan exactly — no improvising\nSTEP 3: Journal the outcome — wins AND losses\n\nThe complete trading loop. No shortcuts.",
    `Follow @signaborgs for daily trading wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 66: EDUCATION - FIBONACCI RETRACEMENTS (Lesson 15) ---
  66: [
    "38.2%, 50%, 61.8%.\n\nFibonacci levels aren't magic — they're self-fulfilling. \u{1F9F5}",
    "Enough traders watch them that they often matter.\n\nKEY LEVELS:\n◾ 38.2% — Common retracement\n◾ 50% — Halfway (not technically Fib)\n◾ 61.8% — Golden ratio, deep pullback\n\nHOW TO USE:\n◾ Draw from swing low → swing high (uptrend)\n◾ Look for confluence with other levels\n◾ Treat as ZONES, not exact lines",
    `📖 Full Fibonacci lesson: ${edu}\n🎓 Free PDF in bio`
  ],

  // --- POST 67: BLOG - THE DANGER OF AVERAGING DOWN ---
  67: [
    "\"I'll just average down.\"\n\nFamous last words before account destruction. \u{1F9F5}",
    "Averaging down on a loser = doubling your exposure to a bad idea.\n\nIf your thesis was wrong, adding more doesn't make it right.\n\nWHAT TO DO INSTEAD:\n◾ Cut the loss at your original stop\n◾ Re-evaluate with fresh eyes\n◾ If still valid, re-enter properly sized\n\nDon't marry a losing trade.",
    `📝 Full article: ${blog}\n📖 Risk management lessons: ${edu}`
  ],

  // --- POST 69: EDUCATION - VOLUME ANALYSIS (Lesson 16) ---
  69: [
    "Price tells you what happened.\nVolume tells you if it mattered. \u{1F9F5}",
    "VOLUME CONFIRMS MOVES:\n\n◾ Breakout + High Volume = Likely real\n◾ Breakout + Low Volume = Likely fake\n◾ Trend + Rising Volume = Healthy\n◾ Trend + Falling Volume = Weakening\n\nBig move on low volume? Suspicious.\nSmall move on high volume? Something's building.\n\nVolume is the conviction behind price.",
    `📖 Full volume lesson: ${edu}\n🔗 Volume Oracle: ${tv.volumeOracle}`
  ],

  // --- POST 70: DOCS - JANUS ATLAS TIMEFRAME GUIDE ---
  70: [
    "Janus Atlas timeframe guide \u{1F9F5}",
    "Higher TF levels = Stronger, more significant\nLower TF levels = Faster, more noise\n\n📊 SWING TRADES: Weekly/Daily levels\n📊 DAY TRADES: 4H/1H levels\n📊 SCALPS: 15m/5m levels\n\nMatch your timeframe to your strategy.\nThe Cartographer maps them all.",
    `🔗 Try Janus Atlas: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],

  // --- POST 71: MARKETING - 82 FREE LESSONS ---
  71: [
    "82 lessons. All free. No paywall. \u{1F9F5}",
    "Beginner to Professional. Psychology to strategy. Indicators to execution.\n\n📚 BEGINNER: 20 lessons — Psychology, risk, basic patterns\n📚 INTERMEDIATE: 27 lessons — Structure, volume, indicators\n📚 ADVANCED: 27 lessons — Multi-TF, confluence, optimization\n📚 PROFESSIONAL: 8 lessons — Portfolio, edge refinement\n\nMost platforms gatekeep education. We give it away.",
    `📖 Start learning: ${edu}\n🔗 All indicators: ${site}`
  ],

  // --- POST 72: EDUCATION - TRADING JOURNALS (Lesson 17) ---
  72: [
    "The most profitable habit in trading? Journaling. \u{1F9F5}",
    "Every trade. Entry, exit, thesis, emotion, outcome.\n\nWHAT TO LOG:\n◾ Date/time and asset\n◾ Entry price and thesis\n◾ Stop loss and target\n◾ Actual exit and P/L\n◾ Emotion during trade\n\nWHY IT WORKS:\nPatterns in your behavior emerge. You see which setups actually work. Improvement becomes measurable.\n\nYou can't fix what you don't track.",
    `📖 Full journaling lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 73: BLOG - MULTI-TIMEFRAME ADVANTAGE ---
  73: [
    "One timeframe shows you the battle.\nMultiple timeframes show you the war. \u{1F9F5}",
    "THE FRAMEWORK:\n\n🔍 HIGHER TF (Weekly/Daily) = Your BIAS\nWhere is the overall trend?\n\n🔍 MIDDLE TF (4H/1H) = Your SETUP\nWhere is the current structure?\n\n🔍 LOWER TF (15m/5m) = Your ENTRY\nWhere do you get precise timing?\n\nDon't fight higher timeframe direction.\nTrade with the trend of the timeframe above you.",
    `📝 Full article: ${blog}\n🔗 Multi-TF scanning: ${tv.auguryGrid}`
  ],

  // --- POST 74: QUOTE CARD ---
  74: [
    "\"In trading, being early and being wrong look exactly the same.\" \u{1F9F5}",
    "Your thesis was correct.\nYour timing was off.\nYour stop got hit.\nPrice then went your way.\n\nSound familiar?\n\nBeing \"right\" means nothing if you're out of the trade.\n\nPatience isn't passive. It's strategic.\nWait for confirmation. Your timing can still kill you.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 76: EDUCATION - BACKTESTING BASICS (Lesson 18) ---
  76: [
    "An untested strategy is just a guess with extra confidence. \u{1F9F5}",
    "Backtesting shows you what actually works:\n\n◾ Win rate — % of winning trades\n◾ Average R:R — Risk to reward ratio\n◾ Max drawdown — Worst losing streak\n◾ Expectancy — Expected $ per trade\n◾ Sample size — Need 100+ trades minimum\n\nRULES: Be honest, no cherry-picking. Include fees. Test across different market conditions.\n\nIf it doesn't work on historical data, why risk live money?",
    `📖 Full backtesting lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 77: BLOG - LIQUIDITY HUNTING EXPLAINED ---
  77: [
    "Your stop loss isn't hidden. It's obvious. \u{1F9F5}",
    "Below that swing low? Liquidity.\nAbove that swing high? Liquidity.\n\nWHERE LIQUIDITY SITS:\n◾ Below swing lows (everyone's stops)\n◾ Above swing highs (everyone's stops)\n◾ At obvious round numbers\n◾ At \"textbook\" pattern stops\n\nLarge players need liquidity to fill orders. Your stops = their entries.\n\nThe fix: Place stops at less obvious levels. Give room for the hunt.",
    `📝 Full article: ${blog}\n📖 Liquidity lessons: ${edu}`
  ],

  // --- POST 79: EDUCATION - PAPER TRADING (Lesson 19) ---
  79: [
    "Paper trading isn't \"fake\" trading.\n\nIt's practice without consequence. \u{1F9F5}",
    "Test your strategy. Build your process. Make mistakes for free.\n\nRULES FOR EFFECTIVE PAPER TRADING:\n◾ Treat it like real money\n◾ Use realistic position sizes\n◾ Journal every trade\n◾ Don't skip the boring parts\n\nYou wouldn't fly a plane without a simulator.\nWhy trade live without practice?\n\nGraduate to live when consistently profitable.",
    `📖 Full paper trading lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 80: DOCS - PENTARCH SIGNAL MEANINGS ---
  80: [
    "Pentarch signal reference \u{1F9F5}",
    "🟢 TD — Early-cycle reversal on selling exhaustion\n🔵 IGN — Breakout confirmation with conviction\n🟡 WRN — Early weakness in uptrends\n🟠 CAP — Late-cycle exhaustion with volume spikes\n🔴 BDN — Bearish structure break\n\nThe Sovereign speaks in phases, not predictions.\nFive signals. One complete cycle view.\n\nSave this reference.",
    `🔗 Try Pentarch: ${tv.pentarch}\n📖 Full signal docs: ${docs.pentarch}`
  ],

  // --- POST 81: MARKETING - ANNUAL PLAN SAVINGS ---
  81: [
    "$69/month = $828/year\nAnnual plan = $399/year \u{1F9F5}",
    "Save $429 by committing to 12 months.\n\nThat's 52% off. Same access:\n\n✅ All 7 indicators\n✅ All 82 lessons\n✅ All future updates\n✅ Full support\n\nJust smarter math. Same tools. Better value.",
    `\u{1F517} See pricing: ${site}\n📖 What's included: ${edu}`
  ],

  // --- POST 82: EDUCATION - GOING LIVE (Lesson 20) ---
  82: [
    "Paper trading profitable? Time to go live.\n\nBut not with full size. Start small. \u{1F9F5}",
    "Live trading adds emotion. Emotion changes everything.\n\nBEFORE YOU GO LIVE:\n☐ Profitable in paper (3+ months)\n☐ Strategy backtested (100+ trades)\n☐ Risk management defined\n☐ Journal system ready\n\nWHEN YOU GO LIVE:\n◾ Smallest position size first\n◾ Focus on process, not profit\n◾ Scale up SLOWLY as you prove yourself\n\nRespect the transition.",
    `📖 Full lesson: ${edu}\n🎓 Complete beginner course free in bio`
  ],

  // --- POST 83: BLOG - WYCKOFF METHOD SIMPLIFIED ---
  83: [
    "Wyckoff in 4 phases \u{1F9F5}",
    "1️⃣ ACCUMULATION — Smart money quietly buys. Price ranges sideways.\n2️⃣ MARKUP — Price breaks out and trends up. Public joins late.\n3️⃣ DISTRIBUTION — Smart money quietly sells. Price ranges at highs.\n4️⃣ MARKDOWN — Price breaks down. Public panic sells.\n\nThe cycle repeats. Every market. Every timeframe.\nUnderstand where you are in the cycle.",
    `📝 Full article: ${blog}\n🔗 Cycle detection: ${tv.pentarch}`
  ],

  // --- POST 84: QUOTE CARD ---
  84: [
    "\"The market can remain irrational longer than you can remain solvent.\" \u{1F9F5}",
    "You can be 100% right about direction.\nAnd still lose everything.\n\nBecause:\n◾ Your timing was off\n◾ Your size was too big\n◾ You couldn't survive the drawdown\n\nBeing eventually right means nothing if you're already out.\n\nManage your risk. Survive the irrationality.\nLive to trade another day.",
    `Follow @signaborgs for daily trading wisdom\n📖 Risk management lessons: ${edu}`
  ],

  // --- POST 86: EDUCATION - MARKET STRUCTURE (Lesson 21) ---
  86: [
    "Market structure is the skeleton of price action. \u{1F9F5}",
    "BULLISH: Higher Highs + Higher Lows = Buyers in control\nBEARISH: Lower Highs + Lower Lows = Sellers in control\n\nBREAK OF STRUCTURE (BOS):\n◾ Pattern breaks → potential trend reversal\n◾ Wait for confirmation\n\nCHANGE OF CHARACTER (CHoCH):\n◾ First sign of a shift\n◾ Structure starting to change\n\nRead structure before reading patterns.",
    `📖 Full market structure lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 87: BLOG - ORDER BLOCKS DEMYSTIFIED ---
  87: [
    "Order blocks aren't magic zones. They're footprints. \u{1F9F5}",
    "Where did the move originate? Where was the last candle before the impulse?\n\nThat's your order block.\n\n📦 BULLISH OB: Last down candle before strong up move\n📦 BEARISH OB: Last up candle before strong down move\n\nHOW TO USE:\n◾ Mark the zone (body of the candle)\n◾ Wait for price to return\n◾ Look for reaction + confirmation\n\nInstitutional footprints. Follow them.",
    `📝 Full article: ${blog}\n📖 SMC lessons: ${edu}`
  ],

  // --- POST 89: EDUCATION - SUPPLY AND DEMAND ZONES (Lesson 22) ---
  89: [
    "Support and resistance are lines.\nSupply and demand are zones. \u{1F9F5}",
    "DEMAND ZONE (Bullish):\n◾ Where buyers overwhelmed sellers\n◾ Strong rally originated here\n◾ Price often returns to \"refill\"\n\nSUPPLY ZONE (Bearish):\n◾ Where sellers overwhelmed buyers\n◾ Strong drop originated here\n◾ Price often returns to test\n\nKEY: Fresh zones > Tested zones. Clean departure > Messy departure.\n\nPrice returns to zones to retest. That's your opportunity.",
    `📖 Full S&D lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 90: DOCS - VOLUME ORACLE SETTINGS ---
  90: [
    "Volume Oracle settings guide \u{1F9F5}",
    "SENSITIVITY:\n◾ Higher = More regime changes detected\n◾ Lower = Fewer, more significant changes\n◾ Choppy market? Increase sensitivity\n◾ Trending market? Decrease sensitivity\n\nSMOOTHING:\n◾ Higher = Cleaner but slower signals\n◾ Lower = Faster but more noise\n◾ Swing trading? More smoothing\n◾ Day trading? Less smoothing\n\nDefault is balanced for most conditions. Start there.",
    `🔗 Try Volume Oracle: ${tv.volumeOracle}\n📖 Full settings docs: ${docs.volumeOracle}`
  ],

  // --- POST 91: MARKETING - NON-REPAINTING GUARANTEE ---
  91: [
    "Our indicators don't repaint. Ever. \u{1F9F5}",
    "What you see is what happened. No retroactive changes. No \"hindsight\" signals.\n\nREPAINTING INDICATORS:\n❌ Change past signals\n❌ Look perfect in hindsight\n❌ Fail in real-time\n\nSIGNAL PILOT:\n✅ What you see is what happened\n✅ No retroactive changes\n✅ Trustworthy in real-time\n\nIf a signal fires, it fired. Period.\nNon-repainting isn't a feature. It's a requirement.",
    `\u{1F517} All 7 indicators: ${site}\n📖 See for yourself: ${docsHome}`
  ],

  // --- POST 92: EDUCATION - FAIR VALUE GAPS (Lesson 23) ---
  92: [
    "Fair Value Gap = Imbalance in price. \u{1F9F5}",
    "When price moves so fast it leaves a gap between candles, that's unfinished business.\n\nHOW TO IDENTIFY:\n◾ 3-candle formation\n◾ Middle candle moves aggressively\n◾ Gap between Candle 1 high and Candle 3 low\n\nWHY IT MATTERS:\n◾ Represents imbalance\n◾ Price often returns to \"fill\" the gap\n◾ Can act as support/resistance\n\nNot always. But often enough to matter. Use with confluence.",
    `📖 Full FVG lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 93: BLOG - THE PROBLEM WITH INDICATORS ---
  93: [
    "Indicators don't fail. Traders misuse them. \u{1F9F5}",
    "COMMON MISTAKES:\n\n❌ Expecting indicators to predict the future\n❌ Using lagging indicators for entries\n❌ RSI oversold in a downtrend ≠ buy signal\n❌ 10 indicators = analysis paralysis\n\nTHE FIX:\n◾ Understand what each indicator actually does\n◾ Use them for context, not signals\n◾ Less is more\n\nIndicators are tools. Not crystal balls.",
    `📝 Full article: ${blog}\n🔗 Tools built right: ${site}`
  ],

  // --- POST 94: QUOTE CARD ---
  94: [
    "\"Discipline is choosing between what you want now and what you want most.\" \u{1F9F5}",
    "RIGHT NOW you want to:\n◾ Revenge trade that loss\n◾ FOMO into that pump\n◾ Skip the journal entry\n◾ Size up \"just this once\"\n\nMOST you want to:\n◾ Be consistently profitable\n◾ Build real wealth\n◾ Trade for years to come\n\nEvery impulsive trade is a vote against your future self.",
    `Follow @signaborgs for daily wisdom\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 96: EDUCATION - INDUCEMENT & LIQUIDITY (Lesson 24) ---
  96: [
    "Inducement: The trap before the move. \u{1F9F5}",
    "A small breakout that triggers stops, creates liquidity, then reverses.\n\nHOW IT WORKS:\n1️⃣ Price approaches key level\n2️⃣ Breaks slightly beyond (triggers stops)\n3️⃣ Grabs liquidity (your stops = market orders)\n4️⃣ Reverses in intended direction\n\nThe market doesn't break out TO run.\nIt breaks out to GRAB, then runs the other way.\n\nDon't place stops at obvious levels.",
    `📖 Full inducement lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 97: BLOG - THE POWER OF DOING NOTHING ---
  97: [
    "The hardest skill in trading? Doing nothing. \u{1F9F5}",
    "No setup? Do nothing.\nUncertain? Do nothing.\nEmotional? Do nothing.\n\nMost losses come from trades that shouldn't have been taken.\n\nPATIENCE IS A POSITION.\nCash is a position.\nWaiting is a strategy.\n\nThe best traders know when NOT to trade.\nYour edge isn't just your entries — it's your ability to sit on your hands.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 99: EDUCATION - TREND CONTINUATION PATTERNS (Lesson 25) ---
  99: [
    "Not every pattern signals reversal. \u{1F9F5}",
    "Flags, pennants, wedges — these are pauses, not stops.\n\n🚩 FLAG: Sharp move → tight consolidation → continuation\n📐 PENNANT: Sharp move → symmetrical triangle → breakout\n📊 WEDGE: Converging lines → direction depends on type\n\nThe trend takes a breath, then continues.\nLearn to trade WITH the trend, not against it.\n\nThese are PAUSES, not reversals.",
    `📖 Full patterns lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 100: DOCS - GETTING STARTED WORKFLOW ---
  100: [
    "Signal Pilot workflow for new users \u{1F9F5}",
    "1️⃣ Add indicators to TradingView\n2️⃣ Start with ONE (Pentarch or Volume Oracle)\n3️⃣ Complete beginner lessons (20 free)\n4️⃣ Paper trade for consistency\n5️⃣ Add more indicators gradually\n6️⃣ Go live when ready\n\nDon't rush. Master one before adding another.\nThe system works when you work the system.",
    `📖 Start here: ${edu}\n🔗 All indicators: ${site}`
  ],

  // --- POST 101: MARKETING - 100 POSTS MILESTONE ---
  101: [
    "100 posts of free trading education. \u{1F9F5}",
    "Psychology. Strategy. Indicators. Lore.\n\nWe've covered:\n✅ Trading psychology\n✅ Risk management\n✅ Technical analysis\n✅ Indicator deep dives\n✅ The Chronicle mythology\n✅ Strategy breakdowns\n\nAnd we're just getting started. 500+ more to come.\n\nThank you for learning with us.",
    `📖 Start from lesson 1: ${edu}\n🔗 Join us: ${site}`
  ],

  // --- POST 102: EDUCATION - LIQUIDITY POOLS (Lesson 26) ---
  102: [
    "Liquidity pools = Clusters of stop losses. \u{1F9F5}",
    "WHERE THEY FORM:\n◾ Above equal highs (buy stops)\n◾ Below equal lows (sell stops)\n◾ At obvious support/resistance\n◾ At round numbers\n\nWHY PRICE HUNTS THEM:\n◾ Large players need liquidity to fill orders\n◾ Your stops = their entries\n◾ Price gravitates toward order clusters\n\nPrice is drawn to liquidity like a magnet.\nIt often sweeps these pools BEFORE the real move.",
    `📖 Full liquidity lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 103: BLOG - TRADING WITH THE TREND ---
  103: [
    "\"The trend is your friend until it ends.\" \u{1F9F5}",
    "Fighting the trend = Fighting probability.\n\n📈 UPTREND (HH + HL):\n◾ Bias: Long\n◾ Look for pullbacks to support\n◾ Avoid shorting into strength\n\n📉 DOWNTREND (LH + LL):\n◾ Bias: Short\n◾ Look for rallies to resistance\n◾ Avoid buying into weakness\n\n↔️ NO CLEAR TREND:\n◾ Trade the range or wait\n\nSimple. Not easy.",
    `📝 Full article: ${blog}\n📖 Trend lessons: ${edu}`
  ],

  // --- POST 104: QUOTE CARD ---
  104: [
    "\"Losses are tuition. Blow-ups are expulsion.\" \u{1F9F5}",
    "TUITION (Small Losses):\n◾ Part of the process\n◾ Teach you what doesn't work\n◾ Affordable with proper sizing\n◾ Keep you in the game\n\nEXPULSION (Blow-ups):\n◾ Remove you from the game\n◾ No chance to apply lessons\n◾ Result of poor risk management\n\nPay the tuition. Avoid expulsion.\nStay in the game long enough to graduate.",
    `Follow @signaborgs for daily wisdom\n📖 Risk management: ${edu}`
  ],

  // --- POST 106: EDUCATION - REVERSAL PATTERNS (Lesson 27) ---
  106: [
    "Head and shoulders. Double tops. Triple bottoms.\n\nReversal patterns signal potential trend exhaustion. \u{1F9F5}",
    "HEAD AND SHOULDERS:\n◾ Left shoulder → head → right shoulder\n◾ Neckline break = confirmation\n\nDOUBLE TOP/BOTTOM:\n◾ Two tests of same level\n◾ Failure to break = exhaustion\n\nTRIPLE TOP/BOTTOM:\n◾ Three tests, even stronger signal\n\nKey word: POTENTIAL.\nWait for the neckline break. Confirmation > Anticipation.",
    `📖 Full reversal patterns lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 107: BLOG - THE IMPORTANCE OF TRADING HOURS ---
  107: [
    "Not all hours are created equal. \u{1F9F5}",
    "🌏 ASIAN SESSION: Lower volatility, range-bound, good for scalping ranges\n🇬🇧 LONDON SESSION: Volatility spike, trends start here, breakout plays\n🇺🇸 NEW YORK SESSION: Highest volume, major moves, momentum trades\n🔥 LONDON/NY OVERLAP: Peak opportunity — and peak danger\n\nTrade when the market moves. Rest when it doesn't.\nMatch your strategy to the session.",
    `📝 Full article: ${blog}\n📖 Session-based strategies: ${edu}`
  ],

  // --- POST 109: EDUCATION - CONFLUENCE TRADING (Lesson 28) ---
  109: [
    "One signal is a suggestion.\nTwo signals is interesting.\nThree signals is confluence. \u{1F9F5}",
    "When support, fib level, and volume zone align — that's where probability stacks.\n\nCONFLUENCE FACTORS:\n◾ Support/Resistance level\n◾ Fibonacci retracement\n◾ Order block or demand zone\n◾ Moving average\n◾ Volume profile POC\n\n3+ factors at one zone = High probability trade.\nMore confluence = Tighter stop possible.\n\nStack the odds. Trade confluence.",
    `📖 Full confluence lesson: ${edu}\n🔗 Confluence scoring: ${tv.omniDeck}`
  ],

  // --- POST 110: DOCS - AUGURY GRID SYMBOL SETUP ---
  110: [
    "Augury Grid symbol setup tips \u{1F9F5}",
    "◾ Start with 5-10 symbols max\n◾ Group by correlation (don't scan BTC and ETH together)\n◾ Match timeframe to your style\n◾ Set alerts for key conditions\n\nDay trading? Use 15m-1H scans.\nSwing trading? Use 4H-Daily scans.\n\nThe Watchman sees all — but focus beats chaos.\nQuality over quantity in your watchlist.",
    `🔗 Try Augury Grid: ${tv.auguryGrid}\n📖 Full setup docs: ${docs.auguryGrid}`
  ],
};

// =============================================
// APPLY REWRITES
// =============================================
function main() {
  const raw = fs.readFileSync(QUEUE_PATH, 'utf8');
  const queue = JSON.parse(raw);

  let updated = 0;
  let skipped = 0;

  for (const post of queue) {
    const num = post.postNumber;
    if (!rewrites[num]) continue;

    const currentTweets = post.twitter?.tweets || [];
    if (currentTweets.length >= 3) {
      skipped++;
      continue;
    }

    post.twitter.tweets = rewrites[num];
    updated++;
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Batch 2 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
