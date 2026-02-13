#!/usr/bin/env node
/**
 * Rewrites single-tweet posts into proper multi-tweet threads.
 * Each rewrite is hand-crafted per post for quality.
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

// === URL MAPS ===
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

const chron = {
  sovereign: 'https://signalpilot.io/chronicle/meet-the-sovereign/',
  prophet: 'https://signalpilot.io/chronicle/the-prophet/',
  cartographer: 'https://signalpilot.io/chronicle/the-cartographer/',
  scales: 'https://signalpilot.io/chronicle/the-scales/',
  arbiter: 'https://signalpilot.io/chronicle/the-arbiter/',
  watchman: 'https://signalpilot.io/chronicle/the-watchman/',
  commander: 'https://signalpilot.io/chronicle/the-commander/',
  home: 'https://signalpilot.io/chronicle/'
};

const site = 'https://signalpilot.io';
const edu = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
const docsHome = 'https://docs.signalpilot.io';

// =============================================
// CHRONICLE POST REWRITES
// =============================================
const chronicleRewrites = {
  // --- THE ARBITER (Harmonic Oscillator) ---
  48: [
    "\"Momentum without context is noise. Context without momentum is hesitation.\"\n— The Arbiter ⚔️\n\nThe Harmonic Oscillator doesn't just measure speed.\nIt measures agreement between forces.\n\nWhen they align, movement follows. 🧵",
    "How The Arbiter works:\n\nMultiple momentum components combined into one consensus signal.\n\n◾ When all agree → trend has conviction\n◾ When they conflict → caution is warranted\n◾ Divergence = early warning of exhaustion\n\nOne oscillator. Five perspectives.",
    `🔗 Try the Harmonic Oscillator: ${tv.harmonicOsc}\n📖 Read the lore: ${chron.arbiter}`
  ],
  168: [
    "\"Force without direction is wasted. Direction without force is impotent.\"\n— The Arbiter ⚔️\n\nMomentum needs context. Context needs momentum.\n\nThe Arbiter judges when both align. 🧵",
    "Most oscillators measure one thing. The Harmonic Oscillator measures five.\n\nSpeed. Strength. Exhaustion. Divergence. Consensus.\n\nBecause one measurement can lie. Five rarely agree unless the truth is real.",
    `🔗 Get the indicator: ${tv.harmonicOsc}\n📖 Full lore: ${chron.arbiter}`
  ],
  268: [
    "\"Momentum is not a single voice,\" the Arbiter explained. \"It's a chorus.\"\n\n\"Some sing strength, others whisper weakness. I learned to hear them all.\" ⚔️ 🧵",
    "From this wisdom, the Harmonic Oscillator was born.\n\nNot one reading — a multi-component consensus:\n\n◾ Trend strength vs mean reversion\n◾ Volatility context vs cycle position\n◾ Agreement = signal. Disagreement = wait.\n\nThe chorus speaks louder than any solo voice.",
    `🔗 Hear the chorus: ${tv.harmonicOsc}\n📖 The Arbiter's origin: ${chron.arbiter}`
  ],
  428: [
    "\"Momentum is borrowed energy,\" the Arbiter observed.\n\n\"What rises without foundation must return.\" ⚔️ 🧵",
    "The Harmonic Oscillator measures not just speed — but sustainability.\n\nFive components working together:\n\n◾ Is the move accelerating or decelerating?\n◾ Is volume confirming or diverging?\n◾ Is the cycle supporting or exhausting?\n\nSustainability > speed. Every time.",
    `🔗 Measure sustainability: ${tv.harmonicOsc}\n📖 The Arbiter's wisdom: ${chron.arbiter}`
  ],
  558: [
    "\"I do not judge direction,\" the Arbiter stated.\n\n\"I judge sustainability. Can this move continue, or is it exhausted?\" ⚔️ 🧵",
    "This is what separates the Harmonic Oscillator from basic momentum tools.\n\nRSI tells you overbought/oversold.\nMACD tells you trend direction.\n\nThe Arbiter tells you if the move has gas left in the tank — or if it's running on fumes.\n\nThat's the edge.",
    `🔗 Judge sustainability: ${tv.harmonicOsc}\n📖 The Arbiter's judgment: ${chron.arbiter}`
  ],

  // --- THE WATCHMAN (Augury Grid) ---
  58: [
    "\"While you watch one, I watch all.\"\n— The Watchman 👁️\n\nAugury Grid doesn't sleep. It scans.\n\nOpportunities don't wait. Neither should you. 🧵",
    "How many charts can you watch at once? 3? 5?\n\nThe Watchman monitors your entire watchlist simultaneously:\n\n◾ Cycle phases across all symbols\n◾ Volume regime changes in real-time\n◾ Momentum shifts you'd miss manually\n\nOne dashboard. Complete awareness.",
    `🔗 Try Augury Grid: ${tv.auguryGrid}\n📖 Read the lore: ${chron.watchman}`
  ],
  198: [
    "\"Sleep if you must. I never will.\"\n— The Watchman 👁️\n\nAugury Grid scans while you rest. Monitors while you work. Alerts when opportunities arise. 🧵",
    "The reality of trading: markets run 24/5.\n\nYou can't watch everything.\n\nThe Watchman was built for this — multi-symbol scanning that catches regime changes, cycle shifts, and momentum moves across your entire watchlist.\n\nStop missing moves while staring at one chart.",
    `🔗 Let the Watchman scan: ${tv.auguryGrid}\n📖 The Watchman's vigil: ${chron.watchman}`
  ],
  278: [
    "\"I cannot watch every market,\" the trader lamented.\n\n\"Then don't,\" the Watchman replied. \"Let me watch them all.\" 👁️ 🧵",
    "The Augury Grid was born from necessity.\n\nHuman attention is limited. Markets are not.\n\n◾ Scan 50+ symbols at once\n◾ Filter by condition (cycle phase, regime, momentum)\n◾ Get alerted to setups forming\n\nYou focus on execution. The Watchman handles surveillance.",
    `🔗 Start scanning: ${tv.auguryGrid}\n📖 How The Watchman was born: ${chron.watchman}`
  ],
  358: [
    "\"I see Tokyo open. I see London close. I see New York wake.\"\n\nThe markets never sleep, and neither does The Watchman. 👁️ 🧵",
    "Augury Grid covers every session:\n\n🌏 Asian range setups\n🇬🇧 London breakout patterns\n🇺🇸 New York continuation moves\n\nThe Watchman doesn't care about your timezone. It monitors all of them.\n\nOpportunity doesn't sleep. Your scanner shouldn't either.",
    `🔗 Watch all sessions: ${tv.auguryGrid}\n📖 The Watchman's eternal vigil: ${chron.watchman}`
  ],
  488: [
    "\"While others sleep, I scan,\" the Watchman said.\n\n\"Opportunity hides in the corners of attention.\" 👁️ 🧵",
    "Most traders miss setups not from lack of skill — but lack of coverage.\n\nYou were watching BTC while ETH formed a perfect setup.\nYou were analyzing EUR/USD while GBP/JPY signaled.\n\nThe Watchman sees what distraction hides.",
    `🔗 Never miss a setup: ${tv.auguryGrid}\n📖 The Watchman's wisdom: ${chron.watchman}`
  ],

  // --- THE COMMANDER (OmniDeck) ---
  68: [
    "\"Alone, they are powerful. United, they are unstoppable.\"\n— The Commander 🎯\n\nOmniDeck doesn't replace the Elite Seven.\nIt commands them. 🧵",
    "One overlay. Total coordination.\n\n◾ Pentarch cycle phases\n◾ Volume Oracle regimes\n◾ Janus Atlas key levels\n◾ Plutus Flow direction\n◾ Harmonic Oscillator momentum\n◾ Augury Grid signals\n\nAll unified. All coordinated. Zero clutter.",
    `🔗 Try OmniDeck: ${tv.omniDeck}\n📖 The Commander's story: ${chron.commander}`
  ],
  208: [
    "\"A commander never enters battle without seeing the full field.\"\n— The Commander 🎯\n\nOmniDeck shows the complete picture. All indicators. One view. 🧵",
    "The problem with stacking indicators:\n\n❌ Chart clutter\n❌ Conflicting visuals\n❌ Information overload\n\nThe Commander's solution:\n\n✅ One unified overlay\n✅ Confluence scores\n✅ Clean, readable context\n\nSee everything. Decide clearly.",
    `🔗 See the full field: ${tv.omniDeck}\n📖 The Commander's strategy: ${chron.commander}`
  ],
  288: [
    "\"I don't need seven voices speaking separately,\" the Commander said.\n\n\"I need one voice that has heard them all.\" 🎯 🧵",
    "OmniDeck was forged from unity.\n\nOne indicator that synthesizes:\n\n◾ Where are we in the cycle?\n◾ What regime is active?\n◾ What levels matter here?\n◾ Which direction is flow going?\n◾ Does momentum agree?\n\nComplete awareness. One glance.",
    `🔗 One voice, complete picture: ${tv.omniDeck}\n📖 How The Commander was born: ${chron.commander}`
  ],
  448: [
    "\"To see everything is to bear everything,\" the Commander said.\n\n\"Unity comes at the cost of simplicity.\" 🎯 🧵",
    "OmniDeck shows all seven voices at once. Power requires responsibility.\n\nBut with power comes clarity:\n\n◾ When all 7 agree → strongest signal\n◾ When 5+ agree → high probability context\n◾ When they conflict → patience required\n\nThe Commander weighs them all so you don't have to.",
    `🔗 Embrace the full picture: ${tv.omniDeck}\n📖 The Commander's burden: ${chron.commander}`
  ],

  // --- THE PROPHET (Volume Oracle) ---
  78: [
    "\"I do not see the future. I see the conditions that create it.\"\n— The Prophet 🔮\n\nVolume Oracle doesn't predict. It reads the environment. 🧵",
    "Markets have regimes. Most traders ignore them.\n\nThe Prophet classifies:\n\n🟢 ACCUMULATION — institutional buying detected\n🔴 DISTRIBUTION — institutional selling detected\n⚪ NEUTRAL — no clear bias, patience required\n\nThe strategy that works in one regime fails in another.\nKnow your regime first.",
    `🔗 Try Volume Oracle: ${tv.volumeOracle}\n📖 Read the lore: ${chron.prophet}`
  ],
  178: [
    "\"I see not what will happen, but what conditions allow.\"\n— The Prophet 🔮\n\nVolume Oracle classifies the present. The right strategy for the right regime. 🧵",
    "Trending market? Trend-follow.\nRanging market? Fade extremes.\nVolatile market? Widen stops.\nQuiet market? Be patient.\n\nThe Prophet's gift isn't prediction — it's preparation.\n\nKnow the environment before you choose your weapon.",
    `🔗 Read the environment: ${tv.volumeOracle}\n📖 The Prophet's vision: ${chron.prophet}`
  ],
  248: [
    "\"Volume speaks before price moves,\" the Prophet declared. 🔮\n\nThe Oracle learned to listen — not to predictions, but to the weight of conviction behind each candle. 🧵",
    "Some truths are spoken. Others are measured.\n\nVolume Oracle measures what price action alone cannot show:\n\n◾ Is this rally backed by real buying?\n◾ Is this selloff panic or distribution?\n◾ Is participation increasing or fading?\n\nPrice shows what happened. Volume shows why.",
    `🔗 Listen to volume: ${tv.volumeOracle}\n📖 The Prophet's revelation: ${chron.prophet}`
  ],
  438: [
    "\"In the quiet regime, I wait,\" the Prophet whispered.\n\n\"Volume speaks loudest through its absence.\" 🔮 🧵",
    "Low volume isn't nothing. It's information.\n\nThe Prophet reads what others ignore:\n\n◾ Volume contracting → breakout brewing\n◾ Volume expanding → conviction arriving\n◾ Volume diverging → narrative breaking\n\nSilence precedes the storm. The Prophet knows when to listen harder.",
    `🔗 Hear the silence: ${tv.volumeOracle}\n📖 The Prophet's silence: ${chron.prophet}`
  ],
  528: [
    "\"High regime does not mean trade,\" the Prophet cautioned.\n\n\"It means prepare. Volatility is opportunity AND danger.\" 🔮 🧵",
    "Volume Oracle warns before the storm.\n\nHigh volatility regime detected:\n\n◾ Larger moves likely\n◾ Wider stops needed\n◾ Both opportunity and risk increase\n◾ Position sizing becomes critical\n\nThe unskilled see volatility and panic. The Prophet sees it and prepares.",
    `🔗 Prepare with Volume Oracle: ${tv.volumeOracle}\n📖 The Prophet's warning: ${chron.prophet}`
  ],

  // --- THE SOVEREIGN (Pentarch) ---
  138: [
    "\"Cycles repeat because human nature never changes.\"\n— The Sovereign 👑\n\nFear and greed. Accumulation and distribution. Boom and bust. 🧵",
    "The patterns persist because we persist.\n\nPentarch tracks the 5-phase cycle:\n\nTD → Market exhaustion, potential bottom\nIGN → Breakout ignition, conviction building\nWRN → Early weakness, cracks forming\nCAP → Climax exhaustion, peak nearing\nBDN → Bearish breakdown confirmed\n\nThe Sovereign has seen it all before.",
    `🔗 Read the cycles: ${tv.pentarch}\n📖 The Sovereign's wisdom: ${chron.sovereign}`
  ],
  218: [
    "\"Every cycle ends. Every cycle begins again.\"\n— The Sovereign 👑\n\nTD. IGN. WRN. CAP. BDN.\nThe 5-phase wheel turns. 🧵",
    "The Sovereign watches the eternal cycle:\n\n1️⃣ TD (Touchdown) — Selling exhaustion detected\n2️⃣ IGN (Ignition) — Breakout confirmed with conviction\n3️⃣ WRN (Warning) — Early weakness in uptrends\n4️⃣ CAP (Climax) — Late-cycle exhaustion\n5️⃣ BDN (Breakdown) — Bearish structure break\n\nKnowing where you are changes everything.",
    `🔗 Track the cycle: ${tv.pentarch}\n📖 The Sovereign's cycle: ${chron.sovereign}`
  ],
  328: [
    "\"Time is a cycle,\" the Sovereign declared.\n\n\"What has been will be again. Understanding where you are in the cycle is half the battle.\" 👑 🧵",
    "Pentarch was forged to reveal the cycle's phase.\n\nBecause the strategy that profits in accumulation\ndestroys you in distribution.\n\nThe strategy that thrives in markup\nbleeds in markdown.\n\n◾ Same asset. Same chart.\n◾ Different phase = different approach.\n\nThe Sovereign's crown is context.",
    `🔗 Find your phase: ${tv.pentarch}\n📖 The Sovereign's crown: ${chron.sovereign}`
  ],
  478: [
    "\"All markets breathe,\" the Sovereign observed.\n\n\"TD. IGN. WRN. CAP. BDN. The 5-phase cycle is eternal.\" 👑 🧵",
    "Pentarch reads this breath.\n\nUnderstanding where you are in the cycle is the first wisdom.\n\n◾ Accumulation phase? Build positions.\n◾ Markup phase? Ride the trend.\n◾ Distribution phase? Protect profits.\n◾ Markdown phase? Stay defensive.\n\nThe market breathes. The Sovereign listens.",
    `🔗 Listen to the cycle: ${tv.pentarch}\n📖 The Sovereign's cycle: ${chron.sovereign}`
  ],

  // --- THE CARTOGRAPHER (Janus Atlas) ---
  148: [
    "\"Every chart is a map. Every level is a landmark.\"\n— The Cartographer 🗺️\n\nJanus Atlas doesn't predict where price will go.\nIt maps where price has been — and what matters. 🧵",
    "The Cartographer's method:\n\n◾ Identify levels across multiple timeframes\n◾ Grade them by strength (touches, recency, volume)\n◾ Show where daily, 4H, and 1H levels converge\n\nWhen multiple timeframe levels align at one price → that zone demands attention.\n\nNavigate with precision.",
    `🔗 Map your levels: ${tv.janusAtlas}\n📖 The Cartographer's map: ${chron.cartographer}`
  ],
  238: [
    "\"I have walked every path. Now I draw them for others.\"\n— The Cartographer 🗺️\n\nJanus Atlas doesn't guess where levels are. It maps them from history. 🧵",
    "The Cartographer has been there before.\n\nEvery support zone? Mapped from previous reactions.\nEvery resistance level? Graded by significance.\nEvery confluence zone? Highlighted automatically.\n\nFresh levels → Stronger reaction likely\nTested levels → May break on next touch\n\nThe map tells the story.",
    `🔗 See the map: ${tv.janusAtlas}\n📖 The Cartographer's journey: ${chron.cartographer}`
  ],
  258: [
    "\"The first map was crude,\" the Cartographer recalled.\n\n\"Just lines and levels. But it revealed something profound — structure exists across all timeframes.\" 🗺️ 🧵",
    "From that insight, Janus Atlas was born.\n\nMulti-timeframe levels on a single chart:\n\n◾ Weekly structure → where are the big zones?\n◾ Daily structure → what levels are active?\n◾ 4H/1H structure → where are the entries?\n\nOne chart. Complete structural awareness.\n\nThe map reveals what zoom hides.",
    `🔗 See all timeframes: ${tv.janusAtlas}\n📖 The Cartographer's first map: ${chron.cartographer}`
  ],
  418: [
    "\"I don't chase price,\" the Cartographer said.\n\n\"I mark the levels and wait. Price always comes to the levels eventually.\" 🗺️ 🧵",
    "Patience is the Cartographer's greatest tool.\n\nJanus Atlas maps the zones. You wait for price to arrive.\n\n◾ No chasing breakouts\n◾ No guessing entries\n◾ No staring at screens for hours\n\nMark your levels. Set your alerts. Wait.\n\nThe Cartographer knows: price respects structure.",
    `🔗 Map and wait: ${tv.janusAtlas}\n📖 The Cartographer's patience: ${chron.cartographer}`
  ],
  468: [
    "\"I do not predict where price will go,\" the Cartographer said.\n\n\"I mark where it has been — and where it may return.\" 🗺️ 🧵",
    "Janus Atlas maps the territory.\n\nThe map is not the journey. But it shows the paths.\n\n◾ Historical reaction zones\n◾ Multi-timeframe confluence\n◾ Level strength grading\n◾ Fresh vs tested zones\n\nNavigation > prediction. Every time.",
    `🔗 Navigate with Atlas: ${tv.janusAtlas}\n📖 The Cartographer's map: ${chron.cartographer}`
  ],
  538: [
    "\"Every level I map was once a battlefield,\" the Cartographer reflected.\n\n\"These zones hold memory. Price remembers what traders forget.\" 🗺️ 🧵",
    "Janus Atlas carries the history of every significant level.\n\nThe map is memory:\n\n◾ That support at $42,000? It held 3 times before.\n◾ That resistance at $48,000? Rejected twice with volume.\n◾ That confluence zone? Three timeframes agree.\n\nPrice has memory. Trade with it, not against it.",
    `🔗 Read the map: ${tv.janusAtlas}\n📖 The Cartographer's journey: ${chron.cartographer}`
  ],

  // --- THE SCALES (Plutus Flow) ---
  188: [
    "\"Numbers don't lie. Emotions do.\"\n— The Scales ⚖️\n\nPlutus Flow weighs the evidence. Flow reveals what feelings hide. 🧵",
    "Trust the data. Question your bias.\n\nPlutus Flow uses statistical OBV analysis:\n\n◾ Z-score normalization for objective readings\n◾ Accumulation vs distribution detection\n◾ Divergence alerts when flow contradicts price\n\nYour gut says buy. The Scales say check the flow first.",
    `🔗 Weigh the evidence: ${tv.plutusFlow}\n📖 The Scales of truth: ${chron.scales}`
  ],
  228: [
    "\"In every transaction, one side believes they're right.\"\n\n\"The Scales knows who actually is.\" ⚖️ 🧵",
    "Plutus Flow sees beneath the surface.\n\nWhere is money actually going?\n\n◾ Flow rising + Price rising = genuine trend\n◾ Flow rising + Price falling = accumulation (smart money buying)\n◾ Flow falling + Price rising = distribution (smart money selling)\n◾ Flow falling + Price falling = genuine decline\n\nThe Scales always knows.",
    `🔗 See beneath the surface: ${tv.plutusFlow}\n📖 The Scales' balance: ${chron.scales}`
  ],
  318: [
    "\"Where does value flow?\" the merchant asked.\n\n\"Follow the weight,\" the Scales replied. \"Volume shows interest. Flow shows commitment.\" ⚖️ 🧵",
    "The balance reveals all.\n\nPlutus Flow was born from this wisdom:\n\n◾ Volume alone tells you activity\n◾ OBV tells you cumulative direction\n◾ Plutus Flow tells you if it's statistically significant\n\nNot all volume is equal. The Scales separates noise from signal.",
    `🔗 Follow the flow: ${tv.plutusFlow}\n📖 The Scales' wisdom: ${chron.scales}`
  ],
  458: [
    "\"Price lies. Volume whispers truth,\" the Scales declared.\n\n\"I measure the weight behind each move.\" ⚖️ 🧵",
    "Plutus Flow reads what candles don't show.\n\nThe truth is in the flow:\n\n◾ A green candle with declining flow? Weak buying.\n◾ A red candle with rising flow? Accumulation.\n◾ New highs with falling flow? Distribution warning.\n\nCandles show you the what. Flow shows you the who.",
    `🔗 Read the truth: ${tv.plutusFlow}\n📖 The Scales of truth: ${chron.scales}`
  ],

  // --- GENERAL / MULTI-CHARACTER CHRONICLES ---
  88: [
    "Before the Elite Seven, there was chaos.\n\nIndicators that lied. Signals that repainted. Traders lost in noise.\n\nThen came the Seven — each designed with one purpose: clarity. 🧵",
    "This is their origin:\n\n👑 The Sovereign — reads market cycles\n🔮 The Prophet — classifies volume regimes\n🗺️ The Cartographer — maps multi-TF levels\n⚖️ The Scales — tracks institutional flow\n⚔️ The Arbiter — judges momentum sustainability\n👁️ The Watchman — scans all symbols\n🎯 The Commander — unifies everything\n\nSeven perspectives. One system.",
    `🔗 Meet them all: ${site}\n📖 The origin story: ${chron.home}`
  ],
  98: [
    "When the Seven gather, clarity emerges.\n\nEach brings their domain. Together, they see what none could alone. 🧵",
    "The Council doesn't argue. It aligns.\n\n◾ Sovereign says \"cycle is accumulating\"\n◾ Prophet confirms \"volume regime is bullish\"\n◾ Cartographer shows \"key level below\"\n◾ Scales reveal \"flow is building\"\n◾ Arbiter confirms \"momentum agrees\"\n\nThat's confluence. That's the Council speaking as one.",
    `🔗 Experience confluence: ${site}\n📖 The Council assembles: ${chron.home}`
  ],
  108: [
    "\"I will observe, not predict.\nI will manage risk, not chase reward.\nI will respect the market, for it owes me nothing.\"\n\nThe Pilot's Oath. 🧵",
    "Not a promise of profits. A commitment to process.\n\nThis is what separates Signal Pilot from every \"guaranteed returns\" scam:\n\n◾ We don't predict. We observe.\n◾ We don't sell signals. We teach.\n◾ We don't promise. We prepare.\n\nThe oath is the foundation. Everything else builds on it.",
    `📖 Read the full oath: ${chron.home}\n🎓 82 free lessons: ${edu}`
  ],
  118: [
    "Not all signals are equal.\n\nThe Hierarchy of Signals: 🧵",
    "1️⃣ Higher timeframe trend — the dominant force\n2️⃣ Key level confluence — where structure agrees\n3️⃣ Volume confirmation — is conviction present?\n4️⃣ Momentum alignment — does force agree?\n5️⃣ Pattern completion — the trigger\n\nFollow the hierarchy. Top-down, not bottom-up.\n\nThe strongest signal at step 5 is worthless if steps 1-4 disagree.",
    `🔗 See the hierarchy in action: ${site}\n📖 Full Chronicle: ${chron.home}`
  ],
  128: [
    "A signal that changes after the fact is not a signal. It's a lie.\n\nNon-repainting matters. Here's why: 🧵",
    "Non-repainting means:\n\n◾ What you see is what happened — no retroactive changes\n◾ Backtest results are real — not hindsight fantasy\n◾ Real-time decisions based on real-time data\n◾ Trustworthy in live trading\n\nEvery one of the Elite Seven is non-repainting. Verified. Guaranteed.\n\nThe Seven don't lie. Ever.",
    `🔗 Try non-repainting indicators: ${site}\n📖 Why it matters: ${chron.home}`
  ],
  158: [
    "When all seven align, the path becomes clear.\n\nCycles + Regimes + Levels + Flow + Momentum + Scanning + Unity 🧵",
    "Not prediction. Preparation.\nNot certainty. Probability.\n\n◾ Pentarch says accumulation → ✅\n◾ Volume Oracle says bullish regime → ✅\n◾ Janus Atlas shows support below → ✅\n◾ Plutus Flow is building → ✅\n◾ Harmonic Oscillator agrees → ✅\n◾ Augury Grid confirms across symbols → ✅\n\nSix independent confirmations. That's confluence.",
    `🔗 Experience the Elite Seven: ${site}\n📖 The Seven united: ${chron.home}`
  ],
  298: [
    "\"We didn't build Signal Pilot to give answers.\"\n\n\"We built it to ask better questions.\" 🧵",
    "The founding principle:\n\n◾ Tools that inform, not dictate\n◾ Education over signals\n◾ Context over commands\n◾ Process over prediction\n\nSignal Pilot was never about telling you what to do.\nIt was about giving you the clarity to decide for yourself.\n\nThat's the difference.",
    `🔗 See the tools: ${site}\n🎓 82 free lessons: ${edu}\n📖 The founding story: ${chron.home}`
  ],
  308: [
    "Seven indicators. Seven perspectives. One mission.\n\nThe Sovereign, Prophet, Cartographer, Scales, Arbiter, Watchman, and Commander. 🧵",
    "Each sees differently. Together, they see completely:\n\n👑 Cycles reveal timing\n🔮 Regimes reveal environment\n🗺️ Levels reveal structure\n⚖️ Flow reveals intent\n⚔️ Momentum reveals sustainability\n👁️ Scanning reveals opportunity\n🎯 Unity reveals the complete picture\n\nThe Elite Seven, united.",
    `🔗 Meet the Seven: ${site}\n📖 Read the Chronicle: ${chron.home}`
  ],
  338: [
    "\"Before every great move, there is silence,\" the Watchman observed.\n\n\"Volume contracts. Volatility compresses. The storm gathers before it breaks.\" 🧵",
    "The best setups form in boredom.\n\nWhile everyone watches the latest breakout, the real opportunity is in the quiet:\n\n◾ Volume Oracle shows compression\n◾ Plutus Flow shows accumulation\n◾ Pentarch shows cycle turning\n◾ Price coils tighter\n\nThe calm IS the signal. Learn to sense it.",
    `🔗 Detect the calm: ${site}\n📖 The gathering storm: ${chron.home}`
  ],
  348: [
    "\"What's the final lesson?\" the student asked.\n\n\"That there is no final lesson,\" the master replied. 🧵",
    "\"Markets evolve. You must evolve with them.\"\n\nLearning never ends. But the foundation is timeless:\n\n◾ Observe, don't predict\n◾ Manage risk, always\n◾ Let the data speak\n◾ Trust the process\n◾ Stay humble\n\nThe tools improve. The lessons endure. The student never stops.",
    `🎓 Continue learning: ${edu}\n📖 The Chronicle: ${chron.home}`
  ],
  368: [
    "\"Where does this path lead?\" the student asked.\n\n\"Wherever you take it,\" the master replied. 🧵",
    "\"The tools are yours. The education is yours. The journey? That's always been yours.\"\n\nSignal Pilot provides:\n◾ 7 non-repainting indicators\n◾ 82 free lessons\n◾ Complete documentation\n◾ Active community\n\nBut the work? The discipline? The patience?\n\nThat part is on you. And that's what makes it real.",
    `🔗 Start your path: ${site}\n🎓 Free education: ${edu}`
  ],
  378: [
    "\"When all seven speak as one, the signal is strongest.\"\n\nThe Sovereign, Prophet, Cartographer, Scales, Arbiter, Watchman, Commander. 🧵",
    "Rarely aligned, but when they are — attention is required.\n\nFull confluence of the Elite Seven means:\n\n◾ Cycle supports the direction\n◾ Volume regime confirms bias\n◾ Levels provide structure\n◾ Flow shows institutional intent\n◾ Momentum agrees\n◾ Multiple symbols confirm\n\nThat's not a signal. That's a symphony.",
    `🔗 Hear the symphony: ${site}\n📖 The Seven aligned: ${chron.home}`
  ],
  388: [
    "\"It started with frustration,\" the founder recalled.\n\n\"Indicators that promised, educators who misled, tools that confused.\" 🧵",
    "\"I built what I wished existed.\"\n\n◾ Indicators that don't repaint\n◾ Education that's actually free\n◾ Documentation that's complete\n◾ Marketing that's honest\n◾ Tools that inform, not dictate\n\nThat frustration became Signal Pilot.\nBorn from a trader's real need, not a marketer's dream.",
    `🔗 See what we built: ${site}\n📖 Where it all began: ${chron.home}`
  ],
  398: [
    "\"Master, when will I know enough?\"\n\n\"When you stop asking that question and start asking better ones.\" 🧵",
    "The eternal student never graduates. They just ask deeper questions.\n\n❌ \"What should I buy?\" → Beginner\n✅ \"What regime is active?\" → Intermediate\n✅✅ \"Does flow confirm the cycle phase?\" → Advanced\n\nThe questions get better. The journey never ends.\n\nThat's the real edge: always learning.",
    `🎓 Ask better questions: ${edu}\n📖 The eternal student: ${chron.home}`
  ],
  408: [
    "\"The market remembers,\" the elder said.\n\n\"Every level where pain occurred, every zone of profit — the market remembers.\" 🧵",
    "That's why support and resistance exist.\n\nNot because of magic lines — because of collective memory:\n\n◾ Traders who bought at $100 remember $100\n◾ Traders who got stopped out remember the zone\n◾ Institutions who filled orders remember the level\n\nJanus Atlas maps this memory. Price respects what traders remember.",
    `🔗 Map the memory: ${tv.janusAtlas}\n📖 The market's memory: ${chron.home}`
  ],
  498: [
    "When the Seven convene, the picture becomes whole.\n\nCycles. Regimes. Levels. Flow. Momentum. Scans. Unity. 🧵",
    "Each sees a piece. Together, they see the market.\n\nThe Council of Seven:\n\n◾ Is the cycle supporting this trade?\n◾ Is the regime favorable?\n◾ Is there a key level nearby?\n◾ Is flow confirming?\n◾ Is momentum sustainable?\n◾ Are other symbols confirming?\n◾ What's the overall confluence?\n\n7 questions. One decision.",
    `🔗 Convene the Council: ${site}\n📖 The Council of Seven: ${chron.home}`
  ],
  508: [
    "Before they were seven, they were scattered.\n\nDifferent tools. Different visions. Different traders. 🧵",
    "United by one purpose: clarity in chaos.\n\nThe origin story of the Elite Seven:\n\nFirst came Pentarch — to read cycles.\nThen Volume Oracle — to classify regimes.\nJanus Atlas mapped the levels.\nPlutus Flow tracked the money.\nHarmonic Oscillator judged momentum.\nAugury Grid scanned all.\nOmniDeck unified them.\n\nSeven tools. One philosophy.",
    `🔗 Experience the Seven: ${site}\n📖 Origins: ${chron.home}`
  ],
  518: [
    "Bull and bear. Fear and greed. Accumulation and distribution.\n\nThe market dances between extremes — eternally. 🧵",
    "Understanding the dance is the first step to moving with it.\n\nThe Elite Seven reads this dance:\n\n◾ Pentarch identifies the rhythm (cycle phase)\n◾ Volume Oracle feels the energy (regime)\n◾ Plutus Flow tracks the partners (money flow)\n◾ Harmonic Oscillator measures the tempo (momentum)\n\nDon't fight the dance. Learn the steps.",
    `🔗 Learn the dance: ${site}\n📖 The eternal dance: ${chron.home}`
  ],
  548: [
    "Each of the Seven embodies a virtue:\n\n👑 Patience\n🔮 Clarity\n🗺️ Balance\n⚖️ Truth\n⚔️ Measure\n👁️ Vigilance\n🎯 Unity 🧵",
    "Together, they form the complete trader.\n\n◾ Patience to wait for the cycle\n◾ Clarity to read the regime\n◾ Balance to respect the levels\n◾ Truth to follow the flow\n◾ Measure to judge momentum\n◾ Vigilance to scan the markets\n◾ Unity to see the whole\n\nThe Seven Virtues of Signal Pilot.",
    `🔗 Embody the virtues: ${site}\n📖 The Seven Virtues: ${chron.home}`
  ],
  568: [
    "\"Alone, I see cycles,\" said the Sovereign.\n\"Alone, I see regimes,\" said the Prophet.\n\"Together,\" said the Commander, \"we see everything.\" 🧵",
    "The complete picture requires all perspectives.\n\nNo single indicator tells the full story:\n\n◾ Cycles without volume context → incomplete\n◾ Levels without flow → static\n◾ Momentum without regime → blind\n\nThe Elite Seven were designed as a system.\n\nThis is the final chapter. The complete picture.",
    `🔗 See everything: ${site}\n📖 The complete picture: ${chron.home}`
  ],
  578: [
    "The Seven have shared their wisdom.\n\nNow the path is yours. 🧵",
    "Tools are guides. Education is foundation. But the journey is walked by you alone.\n\n◾ The indicators are here\n◾ The lessons are free\n◾ The documentation is complete\n◾ The community is ready\n\nThe Chronicle ends. Your story begins.\n\nTrade with clarity. Trade with purpose. Trade with the Seven by your side.",
    `🔗 Begin your story: ${site}\n🎓 Start learning: ${edu}\n📖 Read the full Chronicle: ${chron.home}`
  ],
  588: [
    "A final recap: What each of the Seven taught us. 🧵",
    "👑 Sovereign: Markets cycle. Know your phase.\n🔮 Prophet: Regimes change. Adapt your strategy.\n🗺️ Cartographer: Levels have memory. Respect them.\n⚖️ Scales: Flow reveals truth. Follow the money.\n⚔️ Arbiter: Momentum must be sustainable. Judge it.\n👁️ Watchman: Opportunity hides. Scan for it.\n🎯 Commander: Unity is strength. See the whole.",
    `🔗 Experience the Seven: ${site}\n📖 Full Chronicle: ${chron.home}`
  ],
  598: [
    "The Chronicle is complete. 🔮\n\nBut the wisdom lives on in every indicator, every lesson, every trade you take. 🧵",
    "The Seven are always with you.\n\n◾ When you check the cycle → The Sovereign guides\n◾ When you read the regime → The Prophet speaks\n◾ When you map a level → The Cartographer leads\n◾ When you follow flow → The Scales balance\n◾ When you judge momentum → The Arbiter weighs\n◾ When you scan markets → The Watchman watches\n\nThank you for reading.",
    `🔗 Trade with the Seven: ${site}\n📖 The complete Chronicle: ${chron.home}`
  ],
  618: [
    "The Chronicle of Signal Pilot: Seven artifacts. Seven guardians. One system. 🧵",
    "👑 Pentarch reads cycles\n🔮 Volume Oracle senses regimes\n🗺️ Janus Atlas maps levels\n⚖️ Plutus Flow tracks balance\n⚔️ Harmonic Oscillator finds rhythm\n👁️ Augury Grid scans all\n🎯 OmniDeck unifies\n\nThis is The Elite Seven.\nDesigned together. Working together. Non-repainting. Always.",
    `🔗 Meet the Elite Seven: ${site}\n📖 Read the Chronicle: ${chron.home}`
  ],
  628: [
    "From the Chronicle — wisdom of the Elite Seven: 🧵",
    "\"The Sovereign taught patience through cycles.\nThe Prophet revealed truth through volume.\nThe Cartographer showed context through levels.\nThe Scales measured conviction through flow.\nThe Arbiter judged sustainability through momentum.\nThe Watchman ensured vigilance through scanning.\nThe Commander unified it all.\"\n\nEach guardian offers a lesson. Together, they offer wisdom.",
    `🔗 Learn from the Seven: ${site}\n📖 Chronicle wisdom: ${chron.home}`
  ],
  638: [
    "From the Chronicle — the lesson of the final three: 🧵",
    "\"The Arbiter found rhythm where others heard noise.\"\n→ Harmonic Oscillator: ${tv.harmonicOsc}\n\n\"The Watchman saw signals where others saw chaos.\"\n→ Augury Grid: ${tv.auguryGrid}\n\n\"The Commander unified what others kept separate.\"\n→ OmniDeck: ${tv.omniDeck}\n\nThe complete system.",
    `📖 Full Chronicle: ${chron.home}\n🔗 Try all 7 indicators: ${site}`
  ],
  647: [
    "The Chronicle concludes:\n\n\"And so the Seven stood together — not as tools, but as teachers.\" 🧵",
    "\"Not to predict the future, but to illuminate the present.\n\nNot to give answers, but to ask better questions.\n\nThe Signal was never outside. It was within.\"\n\n— End of Chronicle\n\nThank you for following this journey. The lore ends, but the tools remain. The education continues. The path is yours.",
    `🔗 Start your journey: ${site}\n🎓 82 free lessons: ${edu}\n📖 The complete Chronicle: ${chron.home}`
  ],

  // --- Milestone / Marketing posts caught in chronicle search ---
  // Post 41 is really marketing, not chronicle
  // Post 61 is marketing
  // Post 67 is blog
  // etc. - only include actual chronicle posts above
};

// =============================================
// PRODUCT / INDICATOR POST REWRITES
// =============================================
const productRewrites = {
  // --- POSTS 39-60 range (Docs/Product with sources) ---
  40: [
    "Plutus Flow Cheatsheet ⚖️\n\n📈 Flow rising + Price rising = Trend confirmed\n📈 Flow rising + Price falling = Possible accumulation\n📉 Flow falling + Price rising = Possible distribution\n📉 Flow falling + Price falling = Downtrend confirmed\n\nDivergence is the signal. 🧵",
    "The key insight:\n\nWhen flow and price AGREE → the trend has conviction.\nWhen they DISAGREE → something is shifting beneath the surface.\n\nDivergence = early warning. It doesn't mean reversal is instant — it means the current move may be losing steam.",
    `🔗 Get Plutus Flow: ${tv.plutusFlow}\n📖 Full cheatsheet: https://docs.signalpilot.io/ref-cheatsheets-plutus`
  ],
  41: [
    "7 indicators. 82 free lessons. 1 platform.\n\nMeet the Elite Seven: 🧵",
    "👑 The Sovereign (Pentarch) — Cycle phase detection\n🔮 The Prophet (Volume Oracle) — Regime classification\n🗺️ The Cartographer (Janus Atlas) — Multi-TF auto levels\n⚖️ The Scales (Plutus Flow) — Statistical flow analysis\n⚔️ The Arbiter (Harmonic Oscillator) — Momentum consensus\n👁️ The Watchman (Augury Grid) — Multi-symbol scanner\n🎯 The Commander (OmniDeck) — Unified overlay",
    "All non-repainting. All on TradingView.\nPlus 82 free lessons from beginner to professional.\n\nSignal Pilot. Education first.\n\n🔗 " + site
  ],
  45: [
    "One chart. Multiple symbols. Real-time scanning.\n\nAugury Grid (The Watchman) monitors your entire watchlist without switching tabs. 🧵",
    "What it shows per symbol:\n\n◾ Pentarch cycle phase\n◾ Volume Oracle regime\n◾ Momentum state\n◾ Flow direction\n\nFilter by condition. Focus on what matters.\n\nSee which assets are setting up — all at once.\n\nStop missing moves while watching one chart.",
    `🔗 Try Augury Grid: ${tv.auguryGrid}\n📖 Full docs: ${docs.auguryGrid}`
  ],
  50: [
    "Signal Pilot Quick Start — your first week: 🧵",
    "1️⃣ Add indicators to TradingView\n2️⃣ Start with ONE — Pentarch (cycles) or Volume Oracle (regimes)\n3️⃣ Complete beginner lessons (free)\n4️⃣ Paper trade — don't risk real money yet\n5️⃣ Add more indicators gradually\n6️⃣ Graduate to live when consistent\n\nEducation before execution. Always.",
    `📖 Full quick start guide: https://docs.signalpilot.io/start-quick\n🎓 Free lessons: ${edu}`
  ],
  51: [
    "Not sure if Signal Pilot is right for you? 🧵",
    "Try it risk-free.\n\n7-day money-back guarantee. No questions asked.\n\n◾ Full access to all 7 indicators\n◾ Full access to 82 lessons\n◾ Full documentation\n\nGo through the education. Test the indicators. See if it fits your style.\n\nIf it's not for you, full refund. Simple.",
    `🔗 Start risk-free: ${site}`
  ],
  55: [
    "Too many indicators cluttering your chart?\n\nOmniDeck (The Commander) unifies everything into one clean overlay. 🧵",
    "Cycles, levels, momentum, flow — all coordinated:\n\n◾ See Pentarch phases\n◾ See Janus Atlas key levels\n◾ See momentum state\n◾ See flow direction\n◾ See confluence score\n\nOne indicator to command them all. Zero clutter.",
    `🔗 Try OmniDeck: ${tv.omniDeck}\n📖 Full docs: ${docs.omniDeck}`
  ],
  60: [
    "Harmonic Oscillator settings guide ⚔️ 🧵",
    "Default: Balanced for most markets — start here\nFaster: More signals, more noise — for scalpers\nSlower: Fewer signals, more reliable — for swing traders\n\nMatch your settings to your timeframe and style.\n\nNo single setting works for everything. Experiment, then commit.",
    `🔗 Get Harmonic Oscillator: ${tv.harmonicOsc}\n📖 Full settings guide: ${docs.harmonicOsc}`
  ],

  // --- PENTARCH ---
  65: [
    "One Bitcoin cycle. All five Pentarch signals. 🧵",
    "TD signals early-cycle reversal on selling exhaustion.\nIGN confirms breakout with conviction.\nWRN warns of early weakness.\nCAP marks late-cycle exhaustion.\nBDN confirms bearish structure break.\n\nFive phases. One complete cycle. The Sovereign sees it all.\n\nHistorical observation, not prediction.",
    `🔗 Try Pentarch: ${tv.pentarch}\n📖 Full docs: ${docs.pentarch}`
  ],
  105: [
    "TD (Touchdown) — Pentarch's early-cycle reversal signal. 🧵",
    "When Pentarch fires TD:\n\n◾ Selling exhaustion may be present\n◾ Cycle phase shifting from markdown to accumulation\n◾ NOT a buy signal — an awareness signal\n\nTD says: \"The selling might be running out of steam.\"\n\nWhat you do with that info? That's your edge. The Sovereign watches. Do you?",
    `🔗 See TD signals live: ${tv.pentarch}\n📖 Signal guide: ${docs.pentarch}`
  ],
  145: [
    "IGN (Ignition) — Pentarch's breakout confirmation signal. 🧵",
    "When Pentarch fires IGN:\n\n◾ Breakout with conviction detected\n◾ Volume confirms the move\n◾ Cycle shifting from accumulation to markup\n\nNot \"buy now.\" Not \"guaranteed move.\"\n\nIGN observes: Something might be starting.\nThe Sovereign sees the spark. You decide if it becomes a fire.",
    `🔗 Spot ignition signals: ${tv.pentarch}\n📖 Full signal guide: ${docs.pentarch}`
  ],
  185: [
    "WRN (Warning) — Pentarch's early weakness signal. 🧵",
    "When WRN fires (yellow, above candle):\n\n◾ Early weakness detected in uptrend\n◾ Cycle showing signs of strain\n◾ Not an instant sell — an observation\n\nWRN says: \"The easy part of the rally might be over.\"\n\nSmart traders tighten stops. Smarter traders were prepared.",
    `🔗 Get early warnings: ${tv.pentarch}\n📖 WRN signal guide: ${docs.pentarch}`
  ],
  225: [
    "CAP (Climax) — Pentarch's late-cycle exhaustion signal. 🧵",
    "When CAP fires (orange, above candle):\n\n◾ Late-cycle exhaustion detected\n◾ Volume spikes appearing — climactic activity\n◾ Cycle nearing potential completion\n\nCAP says: \"This move may be running on fumes.\"\n\nNot an instant sell signal. An observation of late-cycle conditions. Protect your gains.",
    `🔗 Spot exhaustion: ${tv.pentarch}\n📖 CAP signal guide: ${docs.pentarch}`
  ],
  295: [
    "Pentarch's five cycle signals explained: 🧵",
    "TD — Early-cycle reversal (selling exhaustion)\nIGN — Breakout confirmation (conviction)\nWRN — Early weakness (cracks forming)\nCAP — Late-cycle exhaustion (volume spikes)\nBDN — Bearish structure break (breakdown)\n\nEach marks a different phase. Understanding them adds context to every trade you take.",
    `🔗 See all 5 signals: ${tv.pentarch}\n📖 Complete signal guide: ${docs.pentarch}`
  ],
  335: [
    "Markets transition between phases. Pentarch tracks them.\n\nTD → IGN → WRN → CAP → BDN 🧵",
    "Different phases = different behavior.\n\n◾ TD phase? Look for accumulation setups\n◾ IGN phase? Trend-following strategies\n◾ WRN phase? Tighten stops, reduce risk\n◾ CAP phase? Take profits, stay defensive\n◾ BDN phase? Short bias, protect capital\n\nKnow where you are in the cycle. Trade accordingly.",
    `🔗 Track cycle phases: ${tv.pentarch}\n📖 Phase guide: ${docs.pentarch}`
  ],
  405: [
    "Powerful combination: Pentarch + Volume Oracle 🧵",
    "Pentarch shows cycle phase.\nVolume Oracle confirms conviction.\n\n◾ IGN phase + Accumulation regime = strong bullish context\n◾ WRN phase + Distribution regime = strong bearish warning\n◾ Any phase + Neutral regime = wait for clarity\n\nTwo indicators. One powerful conversation about market state.",
    `🔗 Pentarch: ${tv.pentarch}\n🔗 Volume Oracle: ${tv.volumeOracle}\n📖 Combo guide: ${docsHome}`
  ],
  435: [
    "Pentarch + Harmonic Oscillator — cycle meets momentum. 🧵",
    "Pentarch tells you where in the cycle.\nHarmonic Oscillator tells you if momentum agrees.\n\n◾ Accumulation phase + momentum building = context alignment ✅\n◾ Markup phase + momentum fading = caution ⚠️\n◾ Distribution phase + momentum confirming weakness = exit signal 🔴\n\nTwo indicators. One conversation about sustainability.",
    `🔗 Pentarch: ${tv.pentarch}\n🔗 Harmonic Oscillator: ${tv.harmonicOsc}\n📖 Docs: ${docsHome}`
  ],
  505: [
    "Watch Pentarch identify a complete cycle — all 5 phases labeled in real-time. 🧵",
    "The market breathes:\n\n1. Selling exhaustion (TD) → bottom forming\n2. Breakout ignition (IGN) → rally beginning\n3. Early warning (WRN) → cracks appear\n4. Climax exhaustion (CAP) → top forming\n5. Breakdown (BDN) → new decline\n\nThen it starts again. The Sovereign sees the full breath.",
    `🔗 See the full cycle: ${tv.pentarch}\n📖 Cycle walkthrough: ${docs.pentarch}`
  ],
  585: [
    "Pentarch full cycle walkthrough — from bottom to top to bottom again. 🧵",
    "TD spots the turn. IGN confirms the move. WRN raises the flag. CAP screams exhaustion. BDN seals the decline.\n\nFive signals. One complete market narrative.\n\nThe same cycle that played out in BTC in 2021 plays out in forex daily. In stocks weekly.\n\nCycles are universal. The Sovereign reads them all.",
    `🔗 Read cycles on any asset: ${tv.pentarch}\n📖 Full docs: ${docs.pentarch}`
  ],

  // --- VOLUME ORACLE ---
  75: [
    "Markets have regimes. Most traders ignore them. 🧵",
    "Volume Oracle (The Prophet) classifies:\n\n🟢 ACCUMULATION — institutional buying detected, bullish bias\n🔴 DISTRIBUTION — institutional selling detected, bearish bias\n⚪ NEUTRAL — no clear bias, patience required\n\nThe strategy that works in one regime fails in another.\nKnow your regime before you take a trade.",
    `🔗 Try Volume Oracle: ${tv.volumeOracle}\n📖 Regime guide: ${docs.volumeOracle}`
  ],
  115: [
    "Volume Oracle shows ACCUMULATION regime (green).\n\nWhat does that mean? 🧵",
    "◾ Bullish bias detected from volume patterns\n◾ Institutional buying may be present\n◾ Smart money potentially accumulating\n◾ Trend-following long strategies favored\n\nACCUMULATION doesn't mean \"buy blindly.\"\nIt means the environment favors longs. Context still matters. Levels still matter. Risk management still matters.",
    `🔗 Detect accumulation: ${tv.volumeOracle}\n📖 Regime details: ${docs.volumeOracle}`
  ],
  165: [
    "Volume Oracle shows DISTRIBUTION regime (red).\n\nWhat does that mean? 🧵",
    "◾ Bearish bias detected from volume patterns\n◾ Institutional selling may be present\n◾ Smart money potentially distributing\n◾ Short bias or defensive strategies favored\n\nDISTRIBUTION doesn't mean \"short everything.\"\nIt means the environment favors caution. Tighten stops. Reduce longs. Watch for breakdowns.",
    `🔗 Detect distribution: ${tv.volumeOracle}\n📖 Regime details: ${docs.volumeOracle}`
  ],
  215: [
    "Volume Oracle shows NEUTRAL regime (gray).\n\nWhat does that mean? 🧵",
    "◾ No clear directional bias detected\n◾ Mixed signals in volume patterns\n◾ Neither bulls nor bears dominant\n◾ Range-bound conditions likely\n\nNEUTRAL = Patience required.\n\nDon't force trades in neutral. Wait for the regime to shift. The Prophet will tell you when.",
    `🔗 Read regimes: ${tv.volumeOracle}\n📖 Neutral regime guide: ${docs.volumeOracle}`
  ],
  245: [
    "Volume Oracle doesn't just show volume — it classifies market regimes. 🧵",
    "Trending → Ranging → Breakout.\n\nWatch how the background color shifts as market character changes:\n\n🟢 Green = accumulation (bullish environment)\n🔴 Red = distribution (bearish environment)\n⚪ Gray = neutral (wait for clarity)\n\nOne indicator, three contexts. Different regimes demand different strategies.",
    `🔗 Try Volume Oracle: ${tv.volumeOracle}\n📖 Full regime guide: ${docs.volumeOracle}`
  ],
  325: [
    "Price makes new high. Volume doesn't confirm.\n\nThat's a divergence — and Volume Oracle highlights it. 🧵",
    "When price and volume disagree, something may be changing:\n\n◾ New high + declining volume = weakening conviction\n◾ New low + declining volume = selling exhaustion possible\n◾ Rising volume + flat price = pressure building\n\nDivergence doesn't mean reversal today. It means the current narrative may be cracking.",
    `🔗 Spot divergences: ${tv.volumeOracle}\n📖 Divergence guide: ${docs.volumeOracle}`
  ],
  375: [
    "Volume Oracle classifies market into regimes — your trading GPS. 🧵",
    "🟢 Low Volume = quiet, range likely — reduce position size\n🟡 Normal Volume = standard conditions — trade your plan\n🔴 High Volume = active, moves likely — widen stops, stay alert\n\nDifferent regimes need different approaches.\nUsing the same strategy in every regime is why most traders lose.",
    `🔗 Know your regime: ${tv.volumeOracle}\n📖 Volume regimes: ${docs.volumeOracle}`
  ],
  425: [
    "Volume Oracle detects bias regimes in real-time. Here's what each means: 🧵",
    "ACCUMULATION 🟢 — Bullish bias, buying pressure building\nDISTRIBUTION 🔴 — Bearish bias, selling pressure building\nNEUTRAL ⚪ — No clear bias, wait for direction\n\nThe regime tells you WHICH strategies to use.\nYour analysis tells you WHEN to enter.\n\nRegime first. Setup second. Always.",
    `🔗 Detect regimes: ${tv.volumeOracle}\n📖 Regime guide: ${docs.volumeOracle}`
  ],
  515: [
    "Volume Oracle + Janus Atlas — regime meets structure. 🧵",
    "Volume Oracle shows the regime.\nJanus Atlas shows the levels.\n\nTogether:\n\n◾ Accumulation regime + key support test = strong bounce potential\n◾ Distribution regime + key resistance = strong rejection potential\n◾ Neutral regime + any level = low probability, wait\n\nContext layers create clarity. Two indicators, one conversation.",
    `🔗 Volume Oracle: ${tv.volumeOracle}\n🔗 Janus Atlas: ${tv.janusAtlas}\n📖 Docs: ${docsHome}`
  ],
  575: [
    "Volume Oracle doesn't just show regimes — it shows regime SHIFTS. 🧵",
    "Regime shifts are where opportunity lives:\n\n◾ DISTRIBUTION → ACCUMULATION: Bias flipping bullish 🟢\n◾ ACCUMULATION → DISTRIBUTION: Bias flipping bearish 🔴\n◾ Any → NEUTRAL: Bias unclear, reduce exposure ⚪\n\nThe shift is often the signal.\n\nMost traders react to the regime. Smart traders react to the transition.",
    `🔗 Catch regime shifts: ${tv.volumeOracle}\n📖 Transition guide: ${docs.volumeOracle}`
  ],

  // --- JANUS ATLAS ---
  85: [
    "One level is a suggestion.\nMultiple levels at the same price is confluence.\n\nJanus Atlas (The Cartographer) maps levels across timeframes. 🧵",
    "When daily, 4H, and 1H levels align — that's where the action happens.\n\n◾ Single timeframe level → interesting\n◾ Two timeframe confluence → noteworthy\n◾ Three timeframe confluence → trade-worthy\n\nThe more timeframes that agree, the stronger the zone.\nThe Cartographer maps them all.",
    `🔗 Try Janus Atlas: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],
  125: [
    "Same asset. Three timeframes. Janus Atlas shows all levels at once. 🧵",
    "Daily level says support.\n4H level confirms.\n1H level gives entry.\n\nThat's multi-timeframe confluence in action:\n\n◾ No tab switching\n◾ No guessing where the weekly level is\n◾ All levels graded by strength\n◾ Fresh vs tested clearly marked\n\nThe Cartographer doesn't guess. It maps.",
    `🔗 Map all timeframes: ${tv.janusAtlas}\n📖 Multi-TF guide: ${docs.janusAtlas}`
  ],
  205: [
    "Fresh level vs tested level — know the difference. 🧵",
    "Fresh level: Never been retested after forming.\n→ Often produces stronger reactions\n→ Untapped liquidity sitting there\n\nTested level: Already touched multiple times.\n→ May break easier on next test\n→ Liquidity likely absorbed\n\nJanus Atlas marks both. The Cartographer knows which is which.\nFresh > tested. Usually.",
    `🔗 See fresh vs tested: ${tv.janusAtlas}\n📖 Level strength guide: ${docs.janusAtlas}`
  ],
  255: [
    "One chart. Multiple timeframe levels.\n\nJanus Atlas maps support and resistance from higher timeframes onto your current view. 🧵",
    "See where the weekly level sits while trading the hourly.\nSee daily structure while scalping the 5-minute.\n\nConfluence made visual:\n\n◾ Weekly levels → major structure\n◾ Daily levels → key zones\n◾ 4H levels → tactical entries\n◾ 1H levels → precision triggers\n\nAll on one chart. Zero tab-switching.",
    `🔗 Try multi-TF levels: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],
  315: [
    "Not all levels are equal. Janus Atlas shows which ones matter. 🧵",
    "Level strength is based on:\n\n◾ Number of touches — more touches = more significance\n◾ Recency of reaction — recent reactions > old ones\n◾ Multi-timeframe confluence — multiple TFs agreeing = strongest\n◾ Volume at level — high volume reactions = institutional interest\n\nStronger levels = more attention. Weaker levels = less reliable.",
    `🔗 Grade your levels: ${tv.janusAtlas}\n📖 Level strength guide: ${docs.janusAtlas}`
  ],
  385: [
    "Higher timeframes dominate lower timeframes.\n\nJanus Atlas shows this hierarchy visually. 🧵",
    "The timeframe hierarchy:\n\n📊 Weekly → sets the major zones\n📊 Daily → defines active structure\n📊 4H → provides tactical context\n📊 1H → gives entry precision\n\nA 1H level that conflicts with a weekly level? The weekly wins. Almost always.\n\nRespect the hierarchy. The Cartographer does.",
    `🔗 See the hierarchy: ${tv.janusAtlas}\n📖 Timeframe guide: ${docs.janusAtlas}`
  ],
  415: [
    "Powerful combination: Janus Atlas + Plutus Flow 🧵",
    "Janus Atlas shows key levels.\nPlutus Flow shows if value is flowing toward or away.\n\n◾ Price at key level + flow building = potential bounce\n◾ Price at key level + flow fading = potential break\n◾ Level + flow direction = better context\n\nStructure meets intention. Two indicators, one edge.",
    `🔗 Janus Atlas: ${tv.janusAtlas}\n🔗 Plutus Flow: ${tv.plutusFlow}\n📖 Docs: ${docsHome}`
  ],
  445: [
    "Janus Atlas Multi-Timeframe Demo — see levels from everywhere on one chart. 🧵",
    "Trading the 1-hour? See where the daily support sits.\nTrading the 4-hour? See the weekly resistance above.\n\n◾ No tab switching between timeframes\n◾ No manually drawing levels from memory\n◾ Automatic detection and grading\n◾ Fresh vs tested clearly marked\n\nThe Cartographer maps them all. You just trade.",
    `🔗 Try Janus Atlas: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],
  545: [
    "Not all levels are equal. Janus Atlas grades every zone. 🧵",
    "Historical level strength based on:\n\n◾ Number of touches — battle-tested zones\n◾ Recency — how fresh is this level?\n◾ Volume at reaction — institutional interest\n◾ Multi-TF confluence — does the weekly agree with the daily?\n\nA fresh weekly level with high-volume reactions > a tested hourly level.\n\nThe Cartographer knows the difference.",
    `🔗 Grade your levels: ${tv.janusAtlas}\n📖 Level grading guide: ${docs.janusAtlas}`
  ],
  625: [
    "Janus Atlas: Levels across time. 🧵",
    "Daily support on the 1-hour chart.\nWeekly resistance on the 4-hour.\nMonthly structure on any timeframe.\n\nThe Cartographer maps what matters — no matter where you're looking.\n\n◾ Auto-detected from price history\n◾ Graded by strength and recency\n◾ Multi-timeframe on one view\n\nMulti-timeframe levels. One indicator.",
    `🔗 Map your levels: ${tv.janusAtlas}\n📖 Full docs: ${docs.janusAtlas}`
  ],

  // --- PLUTUS FLOW ---
  175: [
    "Price is flat. Plutus Flow is rising.\n\nThat's potential accumulation. 🧵",
    "Someone may be quietly buying while price goes nowhere.\n\nWhen flow leads price, pay attention:\n\n◾ Flat price + rising flow = stealth buying\n◾ Rising price + flat flow = weak rally (no conviction)\n◾ Falling price + rising flow = accumulation in disguise\n\nThe Scales sees what candles hide. Price shows the surface. Flow shows the depth.",
    `🔗 See beneath the surface: ${tv.plutusFlow}\n📖 Accumulation guide: ${docs.plutusFlow}`
  ],
  265: [
    "OBV tells you cumulative volume. Plutus Flow tells you if it's statistically significant. 🧵",
    "Z-score normalization. Divergence detection. Flow regimes.\n\nVolume analysis, evolved:\n\n◾ Regular OBV → just adds/subtracts volume\n◾ Plutus Flow → normalizes statistically\n◾ Removes noise, reveals signal\n◾ Divergence alerts built in\n\nNot all volume moves are meaningful. The Scales separates signal from noise.",
    `🔗 Try statistical flow: ${tv.plutusFlow}\n📖 Full docs: ${docs.plutusFlow}`
  ],
  355: [
    "Is smart money accumulating or distributing?\n\nPlutus Flow shows flow direction. 🧵",
    "Where value is building vs where it's exiting:\n\n◾ Accumulation → flow rising while price flat/falling. Smart money buying.\n◾ Distribution → flow falling while price flat/rising. Smart money selling.\n\nAccumulation often precedes markup.\nDistribution often precedes markdown.\n\nThe Scales tracks what smart money actually does — not what they say.",
    `🔗 Track smart money flow: ${tv.plutusFlow}\n📖 Flow analysis guide: ${docs.plutusFlow}`
  ],
  465: [
    "Plutus Flow divergence: when price and flow disagree. 🧵",
    "Price makes new high → Flow doesn't confirm.\n→ Bearish divergence. Rally may be losing conviction.\n\nPrice makes new low → Flow shows accumulation.\n→ Bullish divergence. Selling may be exhausting.\n\nDivergence often precedes reversals. Not always. But often enough to matter.\n\nThe Scales spots what your eyes miss.",
    `🔗 Detect divergences: ${tv.plutusFlow}\n📖 Divergence guide: ${docs.plutusFlow}`
  ],
  525: [
    "Plutus Flow detects accumulation even when price is flat. 🧵",
    "While price consolidates:\n\n◾ Flow shows buying pressure building\n◾ Accumulation becomes visible before the move\n◾ Context BEFORE the breakout, not after\n\nMost traders wait for the candle.\nThe Scales sees the preparation beneath.\n\nSee beneath the surface. Trade with conviction.",
    `🔗 Detect accumulation early: ${tv.plutusFlow}\n📖 Accumulation guide: ${docs.plutusFlow}`
  ],
  635: [
    "Plutus Flow: Tracking the balance. 🧵",
    "Where is pressure building? Buyers accumulating or sellers distributing?\n\nThe Scales weigh the flow of participation:\n\n◾ Statistical OBV that cuts through noise\n◾ Z-score normalization for clarity\n◾ Divergence detection built in\n◾ Real-time accumulation/distribution tracking\n\nSee the pressure others miss.",
    `🔗 Track the balance: ${tv.plutusFlow}\n📖 Full docs: ${docs.plutusFlow}`
  ],

  // --- HARMONIC OSCILLATOR ---
  95: [
    "Price makes a new high. Harmonic Oscillator doesn't.\n\nThat's divergence. That's momentum failing. 🧵",
    "Doesn't mean reversal is guaranteed. Means the trend is weakening.\n\nThe Arbiter sees when forces stop agreeing:\n\n◾ Price pushing higher but momentum fading → exhaustion building\n◾ Price pushing lower but momentum strengthening → selling may be ending\n\nDivergence is the earliest warning signal. Before the move reverses, momentum breaks first.",
    `🔗 Spot divergence: ${tv.harmonicOsc}\n📖 Divergence guide: ${docs.harmonicOsc}`
  ],
  155: [
    "Harmonic Oscillator at extremes ≠ instant reversal. 🧵",
    "Overbought can stay overbought. Oversold can stay oversold.\n\n◾ Extremes show stretched conditions — not guaranteed reversals\n◾ In strong trends, oscillators can stay extreme for extended periods\n◾ Reversals need confirmation: divergence, structure break, regime shift\n\nThe Arbiter measures. You confirm.\nExtreme conditions + confirmation = high probability context.",
    `🔗 Measure extremes: ${tv.harmonicOsc}\n📖 Full guide: ${docs.harmonicOsc}`
  ],
  235: [
    "Harmonic Oscillator isn't one thing. It's multiple forces combined. 🧵",
    "When all components agree → Strong signal with conviction\nWhen components conflict → Wait for clarity\n\nThe five components:\n◾ Trend strength\n◾ Mean reversion pressure\n◾ Volatility context\n◾ Cycle position\n◾ Composite consensus\n\nThe Arbiter weighs multiple voices before judging. One voice can lie. Five voices rarely agree unless it's true.",
    `🔗 Hear all five voices: ${tv.harmonicOsc}\n📖 Component guide: ${docs.harmonicOsc}`
  ],
  305: [
    "Harmonic Oscillator breaks momentum into components. 🧵",
    "Not one reading — multiple perspectives:\n\n◾ Trend strength — is the move powerful?\n◾ Mean reversion — is it overextended?\n◾ Volatility — is the environment supportive?\n◾ Cycle position — where in the rhythm?\n◾ Consensus — do they all agree?\n\nOne oscillator. Five angles. The Arbiter's complete judgment.",
    `🔗 Get the full picture: ${tv.harmonicOsc}\n📖 Momentum guide: ${docs.harmonicOsc}`
  ],
  395: [
    "Harmonic Oscillator detects momentum divergences automatically. 🧵",
    "◾ Price vs momentum disagreement → visual alerts on chart\n◾ Bullish divergence → momentum building while price falls\n◾ Bearish divergence → momentum fading while price rises\n\nEarly warning of potential reversals. Before the candle shows it.\n\nThe Arbiter spots what eyes might miss. Divergence detection, not prediction.",
    `🔗 Auto-detect divergence: ${tv.harmonicOsc}\n📖 Alert setup: ${docs.harmonicOsc}`
  ],
  485: [
    "Harmonic Oscillator identifies exhaustion before reversals. 🧵",
    "When momentum reaches extremes:\n\n◾ Overbought + divergence = high exhaustion probability\n◾ Oversold + divergence = selling may be exhausting\n◾ Extreme + no divergence = trend still strong, don't fight it\n\nThe Arbiter measures how long moves can last.\nExhaustion is a process, not an event. The oscillator tracks the process.",
    `🔗 Measure exhaustion: ${tv.harmonicOsc}\n📖 Exhaustion signals: ${docs.harmonicOsc}`
  ],
  535: [
    "Harmonic Oscillator isn't just one reading — it's five. 🧵",
    "Components measuring:\n\n◾ Speed — how fast is the move?\n◾ Strength — how much force behind it?\n◾ Exhaustion — is it running out of steam?\n◾ Divergence — does momentum confirm price?\n◾ Composite — what's the overall judgment?\n\nComplete momentum analysis in one indicator.\nFive perspectives. One truth.",
    `🔗 See all components: ${tv.harmonicOsc}\n📖 Full component guide: ${docs.harmonicOsc}`
  ],

  // --- AUGURY GRID ---
  275: [
    "Stop flipping through 50 charts.\n\nAugury Grid scans multiple symbols simultaneously. 🧵",
    "See which assets are showing:\n\n◾ Pentarch cycle signals firing\n◾ Volume regime changes happening\n◾ Momentum shifts developing\n\nAll in one view. No tab switching. No missed setups.\n\nThe Watchman sees all. You focus on execution.",
    `🔗 Try Augury Grid: ${tv.auguryGrid}\n📖 Scanner guide: ${docs.auguryGrid}`
  ],
  345: [
    "50 symbols. One view. But you don't need to see them all. 🧵",
    "Augury Grid lets you filter by condition:\n\n◾ Show only symbols in IGN (ignition) phase\n◾ Show only accumulation regime assets\n◾ Show only momentum divergence symbols\n\nFrom 50 symbols to 3 that matter right now.\n\nFocus on what matters. The Watchman handles the rest.",
    `🔗 Filter your watchlist: ${tv.auguryGrid}\n📖 Filter guide: ${docs.auguryGrid}`
  ],
  455: [
    "Augury Grid scans multiple symbols simultaneously.\n\nOne dashboard. All your watchlist. 🧵",
    "See which assets show:\n\n◾ Cycle alignment → Pentarch signals across symbols\n◾ Regime shifts → Volume Oracle changes in real-time\n◾ Momentum changes → Harmonic Oscillator alerts\n\nThe Watchman never sleeps.\n\nYou can't watch everything. But with Augury Grid, nothing escapes attention.",
    `🔗 Start scanning: ${tv.auguryGrid}\n📖 Scanner setup: ${docs.auguryGrid}`
  ],
  555: [
    "Too many charts, not enough time.\n\nAugury Grid prioritizes your watchlist. 🧵",
    "◾ Highlights setups forming across all symbols\n◾ Flags regime changes as they happen\n◾ Shows confluence scores per asset\n◾ Ranks by opportunity potential\n\nFrom overwhelm to clarity in one view.\n\nFocus where it matters most. Let The Watchman handle surveillance.",
    `🔗 Prioritize your watchlist: ${tv.auguryGrid}\n📖 Prioritization guide: ${docs.auguryGrid}`
  ],

  // --- OMNIDECK ---
  195: [
    "OmniDeck: All signals. One view. 🧵",
    "Instead of 7 indicators cluttering your chart, one unified overlay showing agreement:\n\n◾ Pentarch cycle phases\n◾ Key levels from Janus Atlas\n◾ Volume regime from Oracle\n◾ Flow direction from Plutus\n◾ Momentum from Harmonic Oscillator\n\nWhen The Commander sees alignment, you see clarity.",
    `🔗 Try OmniDeck: ${tv.omniDeck}\n📖 Full docs: ${docs.omniDeck}`
  ],
  285: [
    "One indicator. Everything visible.\n\nOmniDeck combines it all into a single overlay. 🧵",
    "Pentarch phases, key levels, and momentum context — coordinated:\n\n◾ See where you are in the cycle\n◾ See the key levels that matter\n◾ See if momentum agrees\n◾ See the confluence score\n\nThe Commander's view. For traders who want it all without the clutter.",
    `🔗 Command them all: ${tv.omniDeck}\n📖 Full docs: ${docs.omniDeck}`
  ],
  365: [
    "Why stack 7 indicators when 1 shows everything? 🧵",
    "OmniDeck combines:\n\n◾ Cycle phases → where are we?\n◾ Key levels → what structure matters?\n◾ Momentum state → does force agree?\n◾ Flow context → where is money going?\n◾ Confluence score → how aligned is everything?\n\nThe Commander's complete view.\n\nClean chart. Complete awareness. One indicator.",
    `🔗 Try the unified view: ${tv.omniDeck}\n📖 OmniDeck guide: ${docs.omniDeck}`
  ],
  475: [
    "OmniDeck calculates confluence across all indicators. 🧵",
    "When multiple signals align:\n\n◾ Cycle phase supports direction ✅\n◾ Volume regime confirms bias ✅\n◾ Key level provides structure ✅\n◾ Flow direction agrees ✅\n◾ Momentum is sustainable ✅\n\nOne score. Complete picture.\n\nThe Commander unifies the Elite Seven. You read one number.",
    `🔗 See confluence scores: ${tv.omniDeck}\n📖 Confluence guide: ${docs.omniDeck}`
  ],
  565: [
    "Start every trading day with OmniDeck.\n\n60-second overview: 🧵",
    "◾ Cycle phases across your watchlist → where are things?\n◾ Regime status → bullish, bearish, or neutral?\n◾ Confluence scores → which assets have alignment?\n◾ Priority opportunities → what deserves attention?\n\nContext before action. Every single day.\n\nThe Commander's morning briefing.",
    `🔗 Get your daily briefing: ${tv.omniDeck}\n📖 Daily routine guide: ${docs.omniDeck}`
  ],
  645: [
    "OmniDeck: Everything. Unified. 🧵",
    "All seven indicators. One overlay.\n\nPentarch cycles. Oracle regimes. Atlas levels. Plutus flow. Harmonic momentum. Augury signals. All together.\n\n◾ No chart clutter\n◾ No conflicting visuals\n◾ One clean, unified view\n\nThe Commander brings order to complexity.\nThis is the complete picture.",
    `🔗 See the complete picture: ${tv.omniDeck}\n📖 Full docs: ${docs.omniDeck}`
  ],

  // --- FULL SUITE / COMBO ---
  495: [
    "All 7 indicators. One unified view.\n\nThe Elite Seven working together. 🧵",
    "Pentarch reads cycles.\nVolume Oracle classifies regimes.\nJanus Atlas maps levels.\nPlutus Flow tracks money.\nHarmonic Oscillator judges momentum.\nAugury Grid scans all.\nOmniDeck unifies everything.\n\nDesigned as a system. Working as a system.\nNon-repainting. All on TradingView.",
    `🔗 Try the full suite: ${site}\n📖 Getting started: ${docsHome}`
  ],
  595: [
    "One more look at the complete Signal Pilot suite. 🧵",
    "7 indicators designed to work together:\n\n👑 Pentarch — cycles\n🔮 Volume Oracle — regimes\n🗺️ Janus Atlas — levels\n⚖️ Plutus Flow — flow\n⚔️ Harmonic Oscillator — momentum\n👁️ Augury Grid — scanner\n🎯 OmniDeck — unified\n\nPlus 82 free lessons. Complete documentation. Non-repainting guarantee.",
    `🔗 See the complete suite: ${site}\n📖 Full docs: ${docsHome}`
  ],
  615: [
    "Volume Oracle: The regime detector. 🧵",
    "Five regimes. One indicator.\n\n◾ Compression (low volatility) — patience required\n◾ Expansion (high volatility) — opportunity and risk\n◾ Accumulation (building) — bullish bias forming\n◾ Distribution (releasing) — bearish bias forming\n◾ Transition (shifting) — regime changing\n\nContext before action. That's The Prophet's role.",
    `🔗 Detect regimes: ${tv.volumeOracle}\n📖 Full guide: ${docs.volumeOracle}`
  ],
};

// =============================================
// APPLY REWRITES
// =============================================
function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));

  let chronicleCount = 0;
  let productCount = 0;
  let unchanged = 0;

  for (const post of queue) {
    const pn = post.postNumber;

    if (chronicleRewrites[pn]) {
      post.twitter.tweets = chronicleRewrites[pn];
      chronicleCount++;
    } else if (productRewrites[pn]) {
      post.twitter.tweets = productRewrites[pn];
      productCount++;
    } else {
      unchanged++;
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');

  console.log('\n=== REWRITE COMPLETE ===\n');
  console.log(`Chronicle posts rewritten: ${chronicleCount}`);
  console.log(`Product posts rewritten:   ${productCount}`);
  console.log(`Total rewritten:           ${chronicleCount + productCount}`);
  console.log(`Unchanged:                 ${unchanged}`);
}

main();
