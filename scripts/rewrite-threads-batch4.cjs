#!/usr/bin/env node
/**
 * Batch 4: Hand-crafted rewrites for posts 142-170.
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
  // --- POST 142: EDUCATION - CORRELATION TRADING ---
  142: [
    "BTC moves. ETH follows. Most of the time.\n\nCorrelation: When assets move together. \u{1F9F5}",
    "POSITIVE (+1): Assets move same direction\n→ BTC & ETH, EUR/USD & GBP/USD\n→ Trading both = doubling exposure, NOT diversifying\n\nNEGATIVE (-1): Assets move opposite\n→ Can be used for hedging\n\nZERO (0): True independence\n→ Actual diversification\n\nThe danger: Thinking you're diversified when you're just doubling risk.",
    `📖 Full correlation lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 143: BLOG - TRADING PLAN TEMPLATE ---
  143: [
    "No plan = No edge. \u{1F9F5}",
    "Your trading plan should include:\n\nSTRATEGY: What setups? What timeframes? What markets?\nRISK: Max per trade (1-2%), max daily loss, max open positions\nPROCESS: Pre-market routine, session rules, post-market review\nRULES: When NOT to trade. Emotional circuit breakers.\n\nWrite it down. Follow it. Review it weekly. Improve it monthly.",
    `📝 Full template: ${blog}\n📖 Free trading plan course: ${edu}`
  ],

  // --- POST 144: QUOTE CARD ---
  144: [
    "\"The market is never wrong. Opinions are.\" \u{1F9F5}",
    "YOU SAY: \"It's overbought, it must fall.\"\nMARKET: Goes higher.\n\nYOU SAY: \"Support will hold.\"\nMARKET: Breaks through.\n\nYOU SAY: \"This doesn't make sense.\"\nMARKET: Doesn't care.\n\nPrice reflects all information. It's the sum of all opinions.\nIt doesn't need your approval.\n\nStop arguing. Start adapting.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 146: EDUCATION - DRAWDOWN MANAGEMENT ---
  146: [
    "Drawdown: The valley between peaks.\n\nEvery trader experiences it. Not every trader survives it. \u{1F9F5}",
    "THE MATH PROBLEM:\n◾ 10% drawdown → Need 11% to recover\n◾ 20% drawdown → Need 25% to recover\n◾ 50% drawdown → Need 100% to recover\n\nMANAGEMENT RULES:\n◾ Daily max loss — Stop trading after X% daily loss\n◾ Reduce size during drawdowns\n◾ Mandatory breaks after losing streaks\n\nDrawdowns are inevitable. Blow-ups are optional.",
    `📖 Full drawdown lesson: ${edu}\n🎓 Free risk management course`
  ],

  // --- POST 147: BLOG - READING ORDER FLOW ---
  147: [
    "Candles show what happened.\nOrder flow shows who's doing it. \u{1F9F5}",
    "MARKET ORDERS (Aggressive):\n◾ Buyers hitting ask = Bullish urgency\n◾ Sellers hitting bid = Bearish urgency\n\nLIMIT ORDERS (Passive):\n◾ Bids stacked below = Buying interest\n◾ Offers stacked above = Selling resistance\n\nABSORPTION:\n◾ Large limits absorbing market orders\n◾ Price stops despite volume\n◾ Potential reversal forming\n\nOrder flow reveals the hands behind the moves.",
    `📝 Full article: ${blog}\n🔗 Volume analysis: ${tv.volumeOracle}`
  ],

  // --- POST 149: EDUCATION - MTF CONFLUENCE ---
  149: [
    "Daily says support.\n4H confirms structure.\n1H shows entry pattern.\n\nThat's multi-timeframe confluence. \u{1F9F5}",
    "One timeframe is a guess. Multiple timeframes agreeing is a trade.\n\n📊 DAILY = Your direction (major support at $100)\n📊 4H = Your structure (higher low forming)\n📊 1H = Your entry (bullish engulfing appears)\n\nThree timeframes agree = High probability zone.\nClear invalidation. Trade with confidence.\n\nAlways top-down. Never bottom-up.",
    `📖 Full MTF lesson: ${edu}\n🔗 Multi-TF scanning: ${tv.auguryGrid}`
  ],

  // --- POST 150: DOCS - KEYBOARD SHORTCUTS ---
  150: [
    "Trade faster with TradingView shortcuts \u{1F9F5}",
    "DRAWING:\n◾ Alt+T = Trendline\n◾ Alt+F = Fib retracement\n◾ Alt+H = Horizontal line\n\nNAVIGATION:\n◾ Arrow keys = Scroll chart\n◾ Ctrl+G = Go to date\n◾ + / - = Zoom in/out\n\nTIMEFRAMES:\n◾ Number keys (1, 5, 15, 60, D, W, M)\n\nSpeed matters. Learn the shortcuts. Master your charting.",
    `📖 Full shortcut guide: ${docsHome}\n🔗 Chart with Signal Pilot: ${site}`
  ],

  // --- POST 151: MARKETING - SUCCESS STORY ---
  151: [
    "\"I went from guessing to systematic in 3 months.\" \u{1F9F5}",
    "Real Signal Pilot user. Real transformation.\n\nBEFORE:\n◾ Trading randomly, no plan\n◾ Emotional decisions\n◾ Inconsistent results\n\nAFTER:\n◾ Following a system\n◾ Managing risk properly\n◾ Finally consistent\n\nWhat changed: 82 lessons completed. Pentarch cycles learned. Daily routines built.\n\nEducation works when you work it.",
    `🔗 Start your journey: ${site}\n📖 82 free lessons: ${edu}`
  ],

  // --- POST 152: EDUCATION - GAP TRADING ---
  152: [
    "Gaps: When price jumps and leaves empty space. \u{1F9F5}",
    "Four types. Each tells a different story:\n\n📌 COMMON GAP: Random, usually fills quickly. Low significance.\n🚀 BREAKAWAY GAP: Breaks out of pattern. Often starts new trend.\n⚡ RUNAWAY GAP: Mid-trend acceleration. Strong conviction.\n💨 EXHAUSTION GAP: Final push before reversal. Often fills fast.\n\nNot all gaps fill. Context determines destiny.\nKnow which type you're looking at.",
    `📖 Full gap trading lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 153: BLOG - THE 80/20 OF TRADING ---
  153: [
    "The Pareto Principle in trading \u{1F9F5}",
    "80% of your profits come from 20% of your trades.\n80% of your learning comes from 20% of concepts.\n80% of your edge comes from 20% of your rules.\n80% of opportunities come from 20% of hours.\n\nFind your 20%. Eliminate the rest.\nDouble down on what works. Cut what doesn't.\n\nSimplicity is the ultimate sophistication.",
    `📝 Full article: ${blog}\n📖 Essential lessons: ${edu}`
  ],

  // --- POST 154: QUOTE CARD ---
  154: [
    "\"Every expert was once a beginner.\" \u{1F9F5}",
    "The traders you admire?\n\n◾ Lost money at first\n◾ Made every mistake\n◾ Felt like quitting\n◾ Blew accounts\n\nBut they kept learning. Kept journaling. Kept improving. Didn't quit.\n\nYou're not behind. You're beginning.\nThat's exactly where they started too.\n\nYour journey is valid.",
    `Follow @signaborgs for daily wisdom\n📖 Start here: ${edu}`
  ],

  // --- POST 156: EDUCATION - ELLIOTT WAVE BASICS ---
  156: [
    "Elliott Wave Theory: Markets move in predictable wave patterns. \u{1F9F5}",
    "5 impulse waves + 3 corrective waves = one complete cycle.\n\nIMPULSE (WITH the trend):\n◾ Wave 1: Initial move\n◾ Wave 2: Pullback (never beyond Wave 1 start)\n◾ Wave 3: Strongest wave (never the shortest)\n◾ Wave 4: Correction (never overlaps Wave 1)\n◾ Wave 5: Final push\n\nCORRECTION (AGAINST the trend):\n◾ Waves A, B, C\n\nComplex but powerful when mastered.",
    `📖 Full Elliott Wave lesson: ${edu}\n🔗 Cycle detection: ${tv.pentarch}`
  ],

  // --- POST 157: BLOG - THE MYTH OF THE PERFECT ENTRY ---
  157: [
    "There is no perfect entry. \u{1F9F5}",
    "You're waiting for:\n◾ The exact bottom tick\n◾ The perfect confluence\n◾ 100% confirmation\n◾ Zero risk\n\nThat trade doesn't exist.\n\nGood enough entry + great management = profitable trade.\nPerfect entry + no management = losing trade.\n\nStop optimizing entries. Start optimizing management.\n80% of your profit comes from what happens AFTER entry.",
    `📝 Full article: ${blog}\n📖 Trade management lessons: ${edu}`
  ],

  // --- POST 159: EDUCATION - MOVING AVERAGES MASTERY ---
  159: [
    "Moving averages: The backbone of trend trading. \u{1F9F5}",
    "SMA vs EMA:\n◾ SMA: Equal weight to all periods. Smoother.\n◾ EMA: More weight to recent data. Faster.\n\nKEY MOVING AVERAGES:\n◾ 20 EMA — Short-term trend\n◾ 50 SMA — Medium-term trend\n◾ 200 SMA — Long-term trend (institutional)\n\nGOLDEN CROSS: 50 crosses above 200 = Bullish\nDEATH CROSS: 50 crosses below 200 = Bearish\n\nTrend direction first. Everything else second.",
    `📖 Full MA lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 160: DOCS - OMNIDECK LAYOUT GUIDE ---
  160: [
    "OmniDeck layout customization guide \u{1F9F5}",
    "OmniDeck shows all 7 indicators on one chart. But too much info = clutter.\n\nBEST PRACTICE:\n◾ Start with 2-3 components visible\n◾ Toggle others as needed\n◾ Use the minimal layout for cleaner charts\n◾ Customize colors for your preference\n\nSWING SETUP: Pentarch + Janus Atlas + Volume Oracle\nDAY TRADE: All components, lower timeframes\nSCALP: Minimal — just what you need\n\nThe Commander adapts to your style.",
    `🔗 Try OmniDeck: ${tv.omniDeck}\n📖 Full layout docs: ${docs.omniDeck}`
  ],

  // --- POST 161: MARKETING - BLACK FRIDAY PREVIEW ---
  161: [
    "Black Friday is coming. Signal Pilot's biggest sale of the year. \u{1F9F5}",
    "Every year, once. Never this deep.\n\nWhat to expect:\n◾ Biggest discount ever on all plans\n◾ Limited time — when it's over, it's over\n◾ All 7 indicators included\n◾ Lifetime access deals return\n\nMark your calendar. Set your alarm.\nThis is the opportunity to join at the best price ever.",
    `🔗 Get notified: ${site}\n📖 Explore while you wait: ${edu}`
  ],

  // --- POST 162: EDUCATION - MARKET MAKERS & RETAIL ---
  162: [
    "You are not the market maker's customer.\n\nYou are the market maker's product. \u{1F9F5}",
    "Market makers profit from:\n◾ The spread (bid-ask difference)\n◾ Order flow information\n◾ Predictable retail behavior\n\nRETAIL MISTAKES THEY EXPLOIT:\n◾ Obvious stop placement\n◾ FOMO entries at extremes\n◾ Panic exits during volatility\n◾ Predictable pattern trading\n\nYou can't beat them. But you can stop being predictable.\nTrade where they need liquidity — not where they hunt it.",
    `📖 Full market mechanics lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 163: BLOG - REVENGE TRADING: THE SILENT ACCOUNT KILLER ---
  163: [
    "Revenge trading: The silent account killer. \u{1F9F5}",
    "You lose a trade. You're angry. You immediately re-enter.\nBigger size. No plan. Pure emotion.\n\nTHE SPIRAL:\nLoss → Anger → Revenge trade → Bigger loss → More anger → Repeat\n\nTHE FIX:\n◾ Take a 30-minute break after any loss\n◾ Set a daily loss limit (stop trading after -2%)\n◾ Journal the emotion, not just the trade\n◾ Recognize the pattern before you spiral\n\nThe market doesn't owe you anything.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 164: QUOTE CARD ---
  164: [
    "\"The market rewards patience and punishes greed.\" \u{1F9F5}",
    "PATIENCE looks like:\n◾ Waiting hours for one setup\n◾ Letting a winner run to target\n◾ Staying out when unsure\n◾ Taking small consistent gains\n\nGREED looks like:\n◾ FOMO entering every move\n◾ Moving targets further and further\n◾ Oversizing \"this one time\"\n◾ Refusing to take profit\n\nChoose which one you're feeding today.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 166: EDUCATION - MOVING AVERAGE CROSSOVERS ---
  166: [
    "Moving average crossovers: Simple but effective. \u{1F9F5}",
    "GOLDEN CROSS (Bullish):\n◾ Fast MA crosses ABOVE slow MA\n◾ Short-term momentum shifting up\n◾ Historically precedes rallies\n\nDEATH CROSS (Bearish):\n◾ Fast MA crosses BELOW slow MA\n◾ Short-term momentum shifting down\n◾ Historically precedes declines\n\nCAVEAT: Lagging signal. By the time it crosses, much of the move already happened.\nBest used for confirmation, not entries.\nCombine with price action for timing.",
    `📖 Full crossover lesson: ${edu}\n🔗 Momentum tools: ${tv.harmonicOsc}`
  ],

  // --- POST 167: BLOG - WHY MOST TRADERS OVERTRADE ---
  167: [
    "Overtrading: Taking trades because you CAN, not because you SHOULD. \u{1F9F5}",
    "WHY YOU OVERTRADE:\n◾ Boredom (need to feel productive)\n◾ Greed (more trades = more money, right? Wrong.)\n◾ Revenge (getting back at the market)\n◾ Addiction (the dopamine hit of placing orders)\n\nTHE CURE:\n◾ Set a max trades per day\n◾ Only trade A+ setups\n◾ Journal EVERY trade — including the ones you shouldn't have taken\n\nFewer trades. Better trades. More profit.",
    `📝 Full article: ${blog}\n📖 Discipline lessons: ${edu}`
  ],

  // --- POST 169: EDUCATION - FIBONACCI EXTENSIONS ---
  169: [
    "Fibonacci retracements tell you where to enter.\nFibonacci extensions tell you where to target. \u{1F9F5}",
    "KEY EXTENSION LEVELS:\n◾ 127.2% — Conservative target\n◾ 161.8% — Standard target (golden ratio)\n◾ 200.0% — Aggressive target\n◾ 261.8% — Home run target\n\nHOW TO USE:\n1. Identify the swing (low → high for longs)\n2. Identify the retracement\n3. Project extensions from the retracement\n4. Take partials at each level\n\nFib extensions + key levels = powerful targets.",
    `📖 Full Fibonacci lesson: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 170: DOCS - PENTARCH ALERT CONDITIONS ---
  170: [
    "Pentarch alert conditions guide \u{1F9F5}",
    "Set alerts for any phase transition:\n\n🟢 TD Alert — Potential bottom forming\n🔵 IGN Alert — Breakout ignition detected\n🟡 WRN Alert — Early weakness appearing\n🟠 CAP Alert — Exhaustion climax nearing\n🔴 BDN Alert — Bearish breakdown confirmed\n\nSETUP: Pentarch settings → Alerts tab → Enable conditions → Choose notification method\n\nThe Sovereign alerts you. You decide what to do.",
    `🔗 Set alerts: ${tv.pentarch}\n📖 Full alert docs: ${docs.pentarch}`
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
  console.log(`Batch 4 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
