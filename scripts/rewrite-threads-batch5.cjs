#!/usr/bin/env node
/**
 * Batch 5: Hand-crafted rewrites for early missed posts (3-135)
 * and posts 171-210.
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

const rewrites = {
  // =============================================
  // EARLY MISSED POSTS (3-135)
  // =============================================

  // --- POST 3: QUOTE - THE EDGE ---
  3: [
    "\"The edge isn't seeing more.\n\nIt's seeing what matters.\"\n\n— Signal Pilot \u{1F9F5}",
    "Most traders drown in data.\n12 indicators. 6 timeframes. 3 news feeds. 4 Telegram groups.\n\nThe edge isn't MORE information.\nIt's the RIGHT information.\n\nSignal Pilot's philosophy: Observe. Filter. Act.\nSee what matters. Ignore what doesn't.",
    `Follow @signaborgs for daily wisdom\n📖 82 free lessons: ${edu}`
  ],

  // --- POST 4: PENTARCH TD SIGNAL DEMO ---
  4: [
    "TD appears when selling exhausts.\n\nNot a buy signal. Not financial advice.\nA structural observation. \u{1F9F5}",
    "TD (Trend Down exhaustion) is the first phase of Pentarch's 5-signal cycle.\n\n◾ Selling pressure has reached exhaustion\n◾ Doesn't mean price goes up — it means sellers are tired\n◾ Look for confirmation: structure shift, volume change\n\nThe Sovereign observes exhaustion. You decide if the bottom is real.",
    `🔗 See TD signals: ${tv.pentarch}\n📖 Full signal guide: ${docs.pentarch}`
  ],

  // --- POST 8: QUOTE - SUPPORT DOESN'T HOLD ---
  8: [
    "\"Support doesn't hold.\n\nIt's broken to harvest your stops.\"\n\n— Signal Pilot \u{1F9F5}",
    "That \"obvious\" support level? Everyone sees it.\nEvery retail stop sits just below it.\n\nPrice breaks through → Stops trigger → Liquidity grabbed → Price reverses.\n\nThis isn't conspiracy. It's market mechanics.\nLarge players need liquidity to fill orders. Your stops = their entries.\n\nStop placing stops at obvious levels.",
    `Follow @signaborgs for more insights\n📖 Liquidity lessons: ${edu}`
  ],

  // --- POST 9: MARKETING - MAIN SITE ---
  9: [
    "82 free lessons.\n7 non-repainting indicators.\n7-day money-back guarantee. \u{1F9F5}",
    "No alerts. No signal groups. No \"trust me\" promises.\n\nWe teach you to trade independently:\n◾ 82 lessons from beginner to professional\n◾ 7 indicators that don't lie (non-repainting)\n◾ Complete education — free, no paywall\n\nWe don't sell signals. We sell tools and education.\nThe rest is up to you.",
    `🔗 Explore: ${site}\n📖 Start learning: ${edu}`
  ],

  // --- POST 10: PENTARCH CHEATSHEET ---
  10: [
    "Five signals. Five phases. One complete cycle. \u{1F9F5}",
    "🟢 TD → Selling exhaustion (potential bottom)\n🔵 IGN → Breakout ignition (momentum building)\n🟡 WRN → Early weakness (cracks forming)\n🟠 CAP → Climax exhaustion (peak nearing)\n🔴 BDN → Bearish breakdown (confirmed)\n\nThe Sovereign reads the full cycle.\nKnow where you are. Trade accordingly.\n\nSave this cheatsheet.",
    `🔗 See the cycle: ${tv.pentarch}\n📖 Full guide: ${docs.pentarch}`
  ],

  // --- POST 12: VOLUME ORACLE DASHBOARD DEMO ---
  12: [
    "Volume Oracle shows what price alone can't tell you. \u{1F9F5}",
    "What the dashboard reveals:\n\n◾ Accumulation/Distribution phase detection\n◾ Volume health status\n◾ Structural regime (expansion vs contraction)\n◾ Flow direction and strength\n\nPrice moves. Volume explains WHY it moves.\nThe Prophet doesn't guess. It reads the invisible force behind every candle.",
    `🔗 Try Volume Oracle: ${tv.volumeOracle}\n📖 Full docs: ${docs.volumeOracle}`
  ],

  // --- POST 14: QUOTE - STOP CHASING ---
  14: [
    "\"You stop chasing signals.\nYou stop stacking indicators.\nYou stop depending on someone else's calls.\" \u{1F9F5}",
    "The moment trading clicks:\n\nYou realize the answer was never in MORE tools.\nIt was in understanding the few that matter.\n\n◾ One good system > ten mediocre ones\n◾ Your own analysis > someone else's alert\n◾ Understanding WHY > knowing WHAT\n\nSignal Pilot's mission: Make you independent.",
    `Follow @signaborgs\n📖 Build independence: ${edu}`
  ],

  // --- POST 18: MARKETING - 7-DAY MONEY BACK ---
  18: [
    "The free trial math:\n\n$69/month with 7-day money-back guarantee. \u{1F9F5}",
    "Full access to everything:\n◾ All 7 indicators\n◾ 82 education lessons\n◾ Full documentation\n\nDon't like it? Full refund. No questions. No fine print.\n\nWhy we can offer this: Because we're confident. The tools speak for themselves.\nTry everything. Decide with experience, not hope.",
    `🔗 Start your trial: ${site}\n📖 Free lessons first: ${edu}`
  ],

  // --- POST 21: QUOTE - PREPARE FOR TRANSITIONS ---
  21: [
    "\"Prepare for transitions.\n\nDon't chase them.\"\n\n— Signal Pilot \u{1F9F5}",
    "The cycle shifts. Always.\n\nAccumulation → Markup → Distribution → Markdown.\n\nMost traders see the transition after it's happened. Then they chase.\n\nBetter approach:\n◾ Identify the current phase\n◾ Watch for exhaustion signals\n◾ Position BEFORE the shift\n◾ Let the transition come to you\n\nPreparation beats reaction.",
    `Follow @signaborgs\n🔗 Detect transitions: ${tv.pentarch}`
  ],

  // --- POST 22: JANUS ATLAS DEMO ---
  22: [
    "Most support/resistance tools make you draw lines manually.\n\nJanus Atlas calculates them automatically. \u{1F9F5}",
    "Multi-timeframe levels. Auto-calculated. Graded by strength.\n\n◾ Weekly, Daily, 4H, 1H levels — all visible at once\n◾ Strength grading based on touches, recency, volume\n◾ Fresh vs tested levels clearly marked\n◾ No drawing required. No subjectivity.\n\nThe Cartographer maps the terrain.\nYou navigate with precision.",
    `🔗 Try Janus Atlas: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],

  // --- POST 24: QUOTE - WE COULD SEND ALERTS ---
  24: [
    "\"We could send alerts.\nPing your phone.\nTell you what to buy.\n\nBut then you'd never learn.\" \u{1F9F5}",
    "Signal Pilot's philosophy in one tweet.\n\nWe don't sell signals because signals create dependency.\nWe sell tools and education because tools create independence.\n\n◾ Understand WHY a setup forms\n◾ Know WHEN conditions align\n◾ Decide for YOURSELF\n\nA trader who thinks > A trader who follows.",
    `📖 Learn to trade independently: ${edu}\n🔗 The tools: ${site}`
  ],

  // --- POST 28: HARMONIC OSCILLATOR DEMO ---
  28: [
    "Harmonic Oscillator combines 7 momentum components into one consensus view. \u{1F9F5}",
    "RSI. Stochastic RSI. MACD. ROC. CCI. Williams %R. Ultimate Oscillator.\n\nEach measures momentum differently.\nAlone, each can mislead.\nTogether? Consensus emerges.\n\n◾ All 7 agree → Strong conviction\n◾ Most agree → Moderate signal\n◾ Split → No clear edge\n\nThe Arbiter doesn't guess. It measures agreement.",
    `🔗 Try Harmonic Oscillator: ${tv.harmonicOsc}\n📖 Full docs: ${docs.harmonicOsc}`
  ],

  // --- POST 30: DOCS - QUICK START GUIDE ---
  30: [
    "New to Signal Pilot? Quick Start guide: Zero to charting in 10 minutes. \u{1F9F5}",
    "STEP 1: Get TradingView (free or paid)\nSTEP 2: Add your first indicator (start with Pentarch)\nSTEP 3: Load a chart and observe\nSTEP 4: Complete Lesson 1\nSTEP 5: Paper trade your first signal\n\nDon't try to learn everything at once.\nOne indicator. One lesson. One trade.\nBuild from there.",
    `📖 Start here: ${edu}\n🔗 All indicators: ${site}`
  ],

  // --- POST 34: QUOTE - RIGHT VS PROFITABLE ---
  34: [
    "\"The goal isn't to be right. The goal is to be profitable.\" \u{1F9F5}",
    "You can win 40% of your trades and still make money.\nYou can win 80% and still lose it all.\n\nIt's not about win rate. It's about expectancy.\n\nExpectancy = (Win% × Avg Win) – (Loss% × Avg Loss)\n\nPositive expectancy + consistency = profitability.\nEgo wants to be right. Your account wants to grow.",
    `Follow @signaborgs for daily wisdom\n📖 Expectancy lessons: ${edu}`
  ],

  // --- POST 35: PLUTUS FLOW DEMO ---
  35: [
    "Volume bars lie. Cumulative flow doesn't.\n\nPlutus Flow shows where money is actually moving. \u{1F9F5}",
    "Traditional volume bars show activity. Plutus Flow (The Scales) shows DIRECTION.\n\n◾ Rising flow + Rising price = Healthy trend\n◾ Rising flow + Falling price = Accumulation (hidden buying)\n◾ Falling flow + Rising price = Distribution (hidden selling)\n\nDivergence between flow and price = early warning.\nThe Scales weighs what others ignore.",
    `🔗 Try Plutus Flow: ${tv.plutusFlow}\n📖 Full docs: ${docs.plutusFlow}`
  ],

  // --- POST 38: CHRONICLE - THE SCALES (Plutus) ---
  38: [
    "\"Price is opinion. Flow is fact.\"\n— Plutus, The Scales ⚖️ \u{1F9F5}",
    "While others debate direction, The Scales weighs conviction.\n\nPlutus Flow doesn't care about predictions.\nIt measures where money actually flows:\n\n◾ Are buyers accumulating quietly?\n◾ Are sellers distributing into strength?\n◾ Is the move backed by real conviction?\n\nOpinions are loud. Flow is honest.",
    `🔗 Weigh the flow: ${tv.plutusFlow}\n📖 The Scales' origin: ${site}/chronicle/the-scales/`
  ],

  // --- POST 44: QUOTE - ENTRIES VS EXITS ---
  44: [
    "\"Amateur traders focus on entries. Professional traders focus on exits.\" \u{1F9F5}",
    "Your entry is 10% of the trade.\nYour exit is 90%.\n\n◾ Where do you take profit?\n◾ Where do you cut your loss?\n◾ When do you move your stop?\n◾ When do you scale out?\n\nA perfect entry with terrible management = loss.\nA decent entry with great management = profit.\n\nMaster exits. That's where the money is.",
    `Follow @signaborgs for daily wisdom\n📖 Trade management: ${edu}`
  ],

  // --- POST 54: QUOTE - PATIENCE ---
  54: [
    "\"The market is a device for transferring money from the impatient to the patient.\" \u{1F9F5}",
    "The impatient:\n◾ Chase green candles\n◾ Revenge trade losses\n◾ FOMO into every move\n◾ Can't sit in cash\n\nThe patient:\n◾ Wait for their setup\n◾ Accept being bored\n◾ Trust the process\n◾ Know that cash is a position\n\nWhich side of the transfer are you on?",
    `Follow @signaborgs\n📖 Patience lessons: ${edu}`
  ],

  // --- POST 135: PRODUCT - AUGURY GRID ALERT SETUP ---
  135: [
    "Stop staring at screens. Let Augury Grid alert you. \u{1F9F5}",
    "Set alerts for:\n\n◾ Momentum shifts across your watchlist\n◾ Volume spikes on any symbol\n◾ Regime changes (accumulation → distribution)\n◾ Multi-symbol triggers\n\nSETUP: Augury Grid settings → Alerts tab → Enable conditions → Choose notification method\n\nThe Watchman notifies. You execute.\nWork smarter, not longer.",
    `🔗 Try Augury Grid: ${tv.auguryGrid}\n📖 Alert setup docs: ${docs.auguryGrid}`
  ],

  // =============================================
  // POSTS 171-210
  // =============================================

  // --- POST 171: MARKETING - FREE TRIAL REMINDER ---
  171: [
    "Still thinking about it? \u{1F9F5}",
    "7-day money-back guarantee. Full access to everything.\nNo questions asked. No fine print.\n\n◾ All 7 indicators unlocked\n◾ 82 education lessons (always free)\n◾ Full documentation\n◾ Responsive support team\n\nThe worst that can happen: You get a full refund.\nThe best that can happen: You transform your trading.",
    `🔗 Start your trial: ${site}\n📖 Free lessons first: ${edu}`
  ],

  // --- POST 172: EDUCATION - RANGE TRADING ---
  172: [
    "No trend? No problem.\n\nRange trading: Buy support, sell resistance. Repeat. \u{1F9F5}",
    "WORKS WHEN:\n◾ Clear boundaries exist\n◾ No strong directional bias\n◾ Volume Oracle shows contraction regime\n\nRULES:\n◾ Buy near support with confirmation\n◾ Sell near resistance with confirmation\n◾ Stop just outside the range\n◾ Target the opposite boundary\n\nMarkets range 70% of the time. This is a skill worth learning.",
    `📖 Full range trading lesson: ${edu}\n🔗 Regime detection: ${tv.volumeOracle}`
  ],

  // --- POST 173: BLOG - SUNK COST FALLACY ---
  173: [
    "\"I've held this long, I can't sell now.\"\n\nThat's the sunk cost fallacy. \u{1F9F5}",
    "What you've lost is already gone. It's not coming back.\n\nThe question isn't \"how much have I lost?\"\nThe question is: \"If I had cash right now, would I enter THIS trade?\"\n\nIf no → Close it. Free your capital.\nIf yes → Hold it. But be honest.\n\nPast losses shouldn't dictate present decisions.\nEvery moment is a new decision.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 174: QUOTE CARD ---
  174: [
    "\"Simplicity is the ultimate sophistication.\" \u{1F9F5}",
    "The best trading systems are simple.\nThe best risk management is simple.\nThe best routines are simple.\n\nComplexity feels smart.\nSimplicity IS smart.\n\n3 rules > 30 rules.\n2 indicators > 12 indicators.\n1 strategy mastered > 5 strategies dabbled.\n\nSimplify until it works. Then don't add more.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 176: EDUCATION - ADVANCED ENTRY TECHNIQUES ---
  176: [
    "Beyond \"buy here, sell there.\" \u{1F9F5}",
    "ADVANCED ENTRY TECHNIQUES:\n\n◾ LIMIT ORDERS AT LEVELS: Pre-set entries at key zones\n◾ SCALING IN: Enter 25% → 50% → 100% as trade confirms\n◾ BREAK + RETEST: Wait for breakout, enter on pullback retest\n◾ STOP ENTRIES: Enter on breakout momentum (above resistance)\n\nNo single technique is best.\nMatch your entry to the market condition.",
    `📖 Full entries lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 177: BLOG - EQUITY CURVE TRADING ---
  177: [
    "Trade your equity curve like you trade the market. \u{1F9F5}",
    "Equity above average? Trade full size.\nEquity below average? Reduce size.\n\nWHY THIS WORKS:\n◾ In drawdown = strategy may be out of sync with market\n◾ Reducing size reduces further damage\n◾ When you recover, you scale back up\n\nTHINK OF IT AS:\n◾ Your equity curve has trends too\n◾ \"Trade\" your own curve WITH the trend\n◾ Don't fight your own drawdown",
    `📝 Full article: ${blog}\n📖 Risk management: ${edu}`
  ],

  // --- POST 179: EDUCATION - INSTITUTIONAL ORDER FLOW ---
  179: [
    "Institutions don't trade like retail.\n\nThey can't enter all at once. \u{1F9F5}",
    "They accumulate slowly. Distribute quietly. Fill over days or weeks.\n\nHOW TO SPOT THEM:\n◾ Unusual volume at key levels = Position building\n◾ Price holds despite selling = Absorption\n◾ Tight range after trend = Accumulation/Distribution\n◾ Volume spikes at reversals = Institutional interest\n\nYou can't see their orders. But you can see their footprints.",
    `📖 Full institutional flow lesson: ${edu}\n🔗 Flow analysis: ${tv.plutusFlow}`
  ],

  // --- POST 180: DOCS - INDICATOR UPDATE LOG ---
  180: [
    "Signal Pilot is always improving. \u{1F9F5}",
    "Recent updates:\n\n◾ Performance optimizations across all indicators\n◾ New alert conditions added\n◾ Improved visual clarity\n◾ Bug fixes and refinements\n\nEvery subscription includes all future updates.\nWe ship improvements continuously.\n\nNo extra cost. No upgrade fees. What you buy gets better over time.",
    `📖 Full changelog: ${docsHome}\n🔗 All indicators: ${site}`
  ],

  // --- POST 181: MARKETING - EDUCATION HUB SPOTLIGHT ---
  181: [
    "82 lessons. Zero cost.\n\nBeginner → Intermediate → Advanced → Professional \u{1F9F5}",
    "BEGINNER (20 lessons):\nPsychology, risk, basic patterns, your first trade\n\nINTERMEDIATE (27 lessons):\nStructure, volume, indicators, confluence\n\nADVANCED (27 lessons):\nMulti-TF, institutional flow, optimization\n\nPROFESSIONAL (8 lessons):\nPortfolio management, edge refinement\n\nMost platforms gatekeep education behind expensive courses.\nWe give it away. All of it.",
    `📖 Start learning: ${edu}\n🔗 The tools: ${site}`
  ],

  // --- POST 182: EDUCATION - WYCKOFF ACCUMULATION ---
  182: [
    "Wyckoff Accumulation: The blueprint of bottoms. \u{1F9F5}",
    "The phases:\n\nPS → Preliminary Support (first buying appears)\nSC → Selling Climax (panic low)\nAR → Automatic Rally (relief bounce)\nST → Secondary Test (retest of low)\nSPRING → The trap (breaks below, reverses)\nTEST → Confirms the Spring\nSOS → Sign of Strength (breakout)\nLPS → Last Point of Support (entry)\n\nRecognize the phases. Position accordingly.",
    `📖 Full Wyckoff lesson: ${edu}\n🔗 Cycle detection: ${tv.pentarch}`
  ],

  // --- POST 183: BLOG - SCREEN TIME ---
  183: [
    "There's no shortcut to screen time. \u{1F9F5}",
    "You need hours watching charts to:\n\n◾ Recognize patterns in real-time (not just textbooks)\n◾ Feel market rhythm (fast vs slow, trending vs ranging)\n◾ Build pattern recognition instinct\n◾ Understand how YOUR indicators behave\n\nNo course replaces this. No shortcut exists.\n\nThe traders who put in the hours develop an intuition that can't be taught.\nScreen time is your real education.",
    `📝 Full article: ${blog}\n📖 Structured learning: ${edu}`
  ],

  // --- POST 184: QUOTE CARD ---
  184: [
    "\"Risk comes from not knowing what you're doing.\" \u{1F9F5}",
    "Uneducated trading is gambling.\nEducated trading is calculated risk.\n\nThe difference:\n◾ Gambler: Enters based on hope, no stop, no plan\n◾ Trader: Enters based on analysis, defined risk, clear exit\n\nSame chart. Same asset. Completely different outcomes.\n\nKnowledge reduces risk. Ignorance amplifies it.\nKnow what you're doing before you risk a dollar.",
    `Follow @signaborgs for daily wisdom\n📖 Build your knowledge: ${edu}`
  ],

  // --- POST 186: EDUCATION - WYCKOFF DISTRIBUTION ---
  186: [
    "Wyckoff Distribution: The blueprint of tops. \u{1F9F5}",
    "PSY → Preliminary Supply (first selling appears)\nBC → Buying Climax (euphoric high)\nAR → Automatic Reaction (first drop)\nST → Secondary Test (retest of high)\nUT → Upthrust (fake breakout above)\nLPSY → Last Point of Supply (lower high)\nSOW → Sign of Weakness (breakdown)\n\nMirror image of accumulation.\nRecognize distribution. Protect your profits.",
    `📖 Full Wyckoff lesson: ${edu}\n🔗 Cycle phases: ${tv.pentarch}`
  ],

  // --- POST 187: BLOG - TRADING AS A BUSINESS ---
  187: [
    "Treat trading like a business, not a hobby. \u{1F9F5}",
    "Businesses have:\n◾ Written plans → Your trading plan\n◾ Risk management → Position sizing, stops\n◾ Performance reviews → Weekly journal reviews\n◾ Budgets → Capital allocation\n◾ Operating hours → Trading sessions\n\nHobbyists trade when they feel like it.\nBusiness owners trade when conditions are right.\n\nProfessionals operate systems. Amateurs gamble.",
    `📝 Full article: ${blog}\n📖 Build your system: ${edu}`
  ],

  // --- POST 189: EDUCATION - MARKET PROFILE ---
  189: [
    "Market Profile: Seeing price AND time together. \u{1F9F5}",
    "Where did price spend most time? That's value.\nWhere did price spend least time? That's rejection.\n\nKEY CONCEPTS:\n◾ VALUE AREA: Where 70% of trading occurred (fair price)\n◾ POC: Point of Control (most-traded price)\n◾ HIGH/LOW VALUE: Boundaries of fair value\n\nPrice above value area → Bullish\nPrice below value area → Bearish\nPrice at POC → Equilibrium\n\nTime + price = deeper context.",
    `📖 Full Market Profile lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 190: DOCS - FAQ ---
  190: [
    "Common Signal Pilot questions, answered. \u{1F9F5}",
    "Q: Do indicators repaint?\nA: Never. Guaranteed.\n\nQ: Which indicator first?\nA: Pentarch or Volume Oracle.\n\nQ: Can I try before buying?\nA: 7-day money-back guarantee.\n\nQ: Are the lessons really free?\nA: All 82. No paywall. No catch.\n\nQ: What markets work?\nA: Crypto, forex, stocks, commodities — anything on TradingView.",
    `📖 Full FAQ: ${docsHome}\n🔗 Get started: ${site}`
  ],

  // --- POST 191: MARKETING - SOCIAL PROOF ---
  191: [
    "Thousands of traders trust Signal Pilot. \u{1F9F5}",
    "Across 50+ countries.\nTrading crypto, forex, stocks, commodities.\n\n◾ Non-repainting indicators they can trust\n◾ Education that actually teaches\n◾ Tools that work in real-time, not just backtests\n◾ Support team that responds\n\nWe're not the biggest. We're building something that matters.\nQuality over quantity. Always.",
    `🔗 Join us: ${site}\n📖 Free education: ${edu}`
  ],

  // --- POST 192: EDUCATION - AUCTION MARKET THEORY ---
  192: [
    "Auction Market Theory: Markets exist to facilitate trade. \u{1F9F5}",
    "Price moves UP to find sellers.\nPrice moves DOWN to find buyers.\n\nWhen both sides agree on price → Balance (range)\nWhen one side overwhelms → Imbalance (trend)\n\nKEY INSIGHT:\n◾ Range = Fair value found\n◾ Breakout = Searching for new value\n◾ Rejection = Unfair price rejected\n\nMarkets aren't random. They're auctions.\nUnderstand the auction. Understand the market.",
    `📖 Full AMT lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 193: BLOG - SAYING NO ---
  193: [
    "The best traders say NO more than YES. \u{1F9F5}",
    "No to mediocre setups.\nNo to emotional trades.\nNo to FOMO.\nNo to \"just this once.\"\nNo to revenge trades.\nNo to trading outside your plan.\n\nEvery NO protects your capital.\nEvery NO preserves your edge.\nEvery NO is a vote for long-term profitability.\n\nSaying no is a superpower. Use it ruthlessly.",
    `📝 Full article: ${blog}\n📖 Discipline lessons: ${edu}`
  ],

  // --- POST 194: QUOTE CARD ---
  194: [
    "\"Successful trading is about managing risk, not avoiding it.\" \u{1F9F5}",
    "Risk is unavoidable. Unmanaged risk is fatal.\n\nAVOIDING RISK:\n◾ Never trades\n◾ Never learns\n◾ Never grows\n\nMANAGING RISK:\n◾ Defines max loss before entry\n◾ Sizes positions based on stop distance\n◾ Accepts losses as cost of business\n◾ Lives to trade another day\n\nThe goal isn't zero risk. It's calculated risk.",
    `Follow @signaborgs for daily wisdom\n📖 Risk lessons: ${edu}`
  ],

  // --- POST 196: EDUCATION - DELTA VOLUME ---
  196: [
    "Delta: The difference between buying and selling volume. \u{1F9F5}",
    "Positive delta = More buyers than sellers (bullish pressure)\nNegative delta = More sellers than buyers (bearish pressure)\n\nPOWERFUL SIGNALS:\n◾ Price falls + Positive delta = Absorption (hidden buying)\n◾ Price rises + Negative delta = Distribution (hidden selling)\n◾ Divergence = Early reversal warning\n\nDelta reveals what the candle hides.\nConviction beneath the surface.",
    `📖 Full delta lesson: ${edu}\n🔗 Volume tools: ${tv.volumeOracle}`
  ],

  // --- POST 197: BLOG - WHEN TO STOP TRADING ---
  197: [
    "Knowing when to stop is as important as knowing when to trade. \u{1F9F5}",
    "STOP WHEN:\n◾ Hit daily loss limit\n◾ Made your daily target\n◾ Feeling emotional (angry, excited, anxious)\n◾ Sick or tired\n◾ Major news event approaching\n\nSTOP DOESN'T MEAN QUIT.\nIt means pause. Reset. Come back tomorrow.\n\nThe market is open every day.\nYour capital isn't infinite.\nProtect it.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 199: EDUCATION - INTERMARKET ANALYSIS ---
  199: [
    "Markets don't exist in isolation. \u{1F9F5}",
    "CLASSIC CORRELATIONS:\n◾ DXY up → Commodities down (usually)\n◾ Bonds down → Stocks down (often)\n◾ VIX up → Stocks down (fear)\n◾ Oil up → Energy stocks up\n◾ BTC moves → Altcoins follow\n\nWHY IT MATTERS:\nIf you're trading ETH without watching BTC, you're missing the leader.\nIf you're trading gold without watching DXY, you're missing the driver.\n\nContext > Isolation.",
    `📖 Full intermarket lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 200: DOCS - BEST PRACTICES ---
  200: [
    "Signal Pilot best practices \u{1F9F5}",
    "✅ Start with ONE indicator (Pentarch or Volume Oracle)\n✅ Complete the beginner lessons first\n✅ Paper trade for consistency\n✅ Add more indicators gradually\n✅ Use OmniDeck only after understanding each component\n✅ Journal every trade\n✅ Review weekly\n\nDon't rush. Master one before adding another.\nThe system works when you work the system.",
    `📖 Full best practices: ${docsHome}\n🔗 Start here: ${edu}`
  ],

  // --- POST 201: MARKETING - 200 POSTS MILESTONE ---
  201: [
    "200 posts of free trading education! \u{1F9F5}",
    "Psychology. Strategy. Indicators. Lore.\n\nEvery post designed to make you a better, more independent trader.\n\n✅ 200 posts delivered\n✅ 82 free lessons available\n✅ 7 indicators documented\n✅ Full Chronicle mythology written\n\nAnd we're just getting started. 400+ more posts planned.\nThank you for learning with us.",
    `📖 Start from the beginning: ${edu}\n🔗 Join us: ${site}`
  ],

  // --- POST 202: EDUCATION - PRICE ACTION CONTEXT ---
  202: [
    "A hammer at resistance means nothing.\nA hammer at support means something. \u{1F9F5}",
    "Patterns don't work in isolation. CONTEXT determines everything.\n\nSAME PATTERN, DIFFERENT CONTEXT:\n◾ Engulfing at key level → High probability\n◾ Engulfing in the middle of nowhere → Low probability\n◾ Doji after strong trend → Potential reversal\n◾ Doji in a range → Meaningless\n\nBefore you trade the pattern, answer: WHERE is it forming?",
    `📖 Full price action lesson: ${edu}\n🔗 Level context: ${tv.janusAtlas}`
  ],

  // --- POST 203: BLOG - MORNING ROUTINE ---
  203: [
    "How you start determines how you trade. \u{1F9F5}",
    "MORNING ROUTINE:\n\n◾ Review overnight action (5 min)\n◾ Mark key levels on daily chart (5 min)\n◾ Check economic calendar for events (2 min)\n◾ Review watchlist for setups (10 min)\n◾ Write today's trading plan (5 min)\n\n27 minutes. Zero improvisation during the session.\n\nThe work happens before the bell. Execution is just following the plan.",
    `📝 Full article: ${blog}\n📖 Routine building: ${edu}`
  ],

  // --- POST 204: QUOTE CARD ---
  204: [
    "\"The market rewards patience and punishes greed.\" \u{1F9F5}",
    "Patience: Waiting for your setup. Letting winners run. Accepting slow progress.\n\nGreed: Chasing pumps. Oversizing. Refusing to take profit. Wanting it all now.\n\nOne builds wealth slowly.\nOne destroys it quickly.\n\nChoose wisely. Every trade is a choice.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 206: EDUCATION - TRADING THE OPEN ---
  206: [
    "The open is chaos. Or opportunity. Depending on your approach. \u{1F9F5}",
    "OPTION 1: TRADE THE OPENING RANGE\n◾ Wait 15-30 minutes\n◾ Mark the high and low of that range\n◾ Trade the breakout direction\n\nOPTION 2: FADE THE OPENING MOVE\n◾ Opening spike often reverses\n◾ Wait for rejection, trade the reversal\n\nOPTION 3: WAIT\n◾ Let the dust settle\n◾ Trade after 10:30 AM EST\n◾ Less noise, clearer direction",
    `📖 Full session trading lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 207: BLOG - AVOIDING TILT ---
  207: [
    "Tilt: When emotions override your system. \u{1F9F5}",
    "SIGNS YOU'RE TILTING:\n◾ Increasing size after losses\n◾ Taking trades outside your plan\n◾ Feeling angry at the market\n◾ Refreshing P/L obsessively\n◾ \"I need to make this back\"\n\nTHE FIX:\n◾ Recognize tilt before it escalates\n◾ Step away. Immediately.\n◾ Set a \"tilt rule\" — 2 losses in a row = break\n◾ Journal the emotion\n\nTilt is a signal. Listen to it.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 209: EDUCATION - OTE ---
  209: [
    "OTE: Optimal Trade Entry.\n\nThe sweet spot between the 62-79% Fibonacci retracement. \u{1F9F5}",
    "Deep enough to give great risk:reward.\nNot so deep that it invalidates the setup.\n\nHOW TO FIND OTE:\n1. Identify the impulse move\n2. Draw Fibonacci retracement\n3. Look for entry between 62-79%\n4. Confirm with order block or demand zone\n5. Tight stop below the zone\n\nOTE + Order Block + FVG = ICT trifecta.\nStack confluence for highest probability.",
    `📖 Full OTE lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 210: DOCS - INDICATOR COMPARISON ---
  210: [
    "Which indicator does what? \u{1F9F5}",
    "👑 Pentarch → Cycles (where are we in the phase?)\n🔮 Volume Oracle → Regimes (what's the market condition?)\n🗺️ Janus Atlas → Levels (where are the key zones?)\n⚖️ Plutus Flow → Flow (where is money going?)\n⚔️ Harmonic Osc → Momentum (is there conviction?)\n👁️ Augury Grid → Scanning (what's setting up?)\n🎯 OmniDeck → Unified (all-in-one view)\n\nEach solves a different problem.",
    `📖 Full comparison: ${docsHome}\n🔗 Try them all: ${site}`
  ],
};

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
  console.log(`Batch 5 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
