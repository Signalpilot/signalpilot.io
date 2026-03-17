#!/usr/bin/env node
/**
 * Batch 3: Rewrites posts 111-141 into proper multi-tweet threads.
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
const docsHome = 'https://docs.signalpilot.io';

const tv = {
  pentarch: 'https://www.tradingview.com/script/NZt2MVbj-Pentarch-Cycle-Phase-Detection/',
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
  // --- POST 111: MARKETING - AFFILIATE PROGRAM ---
  111: [
    "Love Signal Pilot? Get paid to share it. \u{1F9F5}",
    "Affiliate program details:\n\n◾ Generous commissions on every referral\n◾ 30-day cookie duration\n◾ Real-time tracking dashboard\n◾ Monthly payouts, on time\n◾ Marketing resources provided\n\nHelp others trade smarter. Earn while you do.\nAlready using Signal Pilot? This is your opportunity.",
    `\u{1F517} Apply: ${site}\n📖 Learn more about the program in bio`
  ],

  // --- POST 112: EDUCATION - MOMENTUM TRADING (Lesson 29) ---
  112: [
    "Momentum: The speed of price movement. \u{1F9F5}",
    "Strong momentum = Conviction behind the move.\nWeak momentum = Move may be exhausted.\n\nSTRONG MOMENTUM:\n◾ Large candles, little overlap\n◾ Volume confirming\n◾ Trend likely continues\n\nWEAK MOMENTUM:\n◾ Small candles, lots of overlap\n◾ Volume declining\n◾ Reversal or consolidation likely\n\nDon't just ask \"where is price going?\"\nAsk \"how fast is it getting there?\"",
    `📖 Full momentum lesson: ${edu}\n🔗 Momentum tools: ${tv.harmonicOsc}`
  ],

  // --- POST 113: BLOG - THE PSYCHOLOGY OF FOMO ---
  113: [
    "FOMO: Fear Of Missing Out. \u{1F9F5}",
    "You see price pumping. You chase. You buy the top.\n\nFOMO makes you:\n❌ Enter without a plan\n❌ Size too big\n❌ Ignore your rules\n\nBy the time you see it, it's often late.\nNo proper risk:reward. Emotional entry = emotional exit.\n\nThe fix: If you missed it, you missed it. Next setup.\nThe best trades feel boring. FOMO trades feel exciting — and usually lose.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 114: QUOTE CARD ---
  114: [
    "\"The goal is not to be right. The goal is to make money.\" \u{1F9F5}",
    "You can be right 80% of the time and lose money.\nYou can be right 40% of the time and be profitable.\n\nEGO SAYS: \"I knew it would go up!\"\nPROFIT SAYS: \"Did I manage risk?\"\n\nYou can be \"right\" and still lose.\nYou can be \"wrong\" often and still profit.\n\nIt's about expectancy, not ego.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 116: EDUCATION - RISK MANAGEMENT DEEP DIVE (Lesson 30) ---
  116: [
    "Risk management isn't optional. It's survival. \u{1F9F5}",
    "THE 1% RULE: Never risk more than 1% per trade.\n10 losses in a row = 10% drawdown. Survivable.\n\nTHE 5% RULE: Never risk more than 5% total open.\nPrevents correlated blow-ups.\n\nTHE RULE OF RUIN: 50% loss needs 100% gain to recover.\nPrevention > Recovery.\n\nProtect the downside. The upside takes care of itself.",
    `📖 Full risk management lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 117: BLOG - AVOIDING ANALYSIS PARALYSIS ---
  117: [
    "10 indicators. 5 timeframes. 3 conflicting signals.\n\nNow you're frozen. \u{1F9F5}",
    "Analysis paralysis: When too much information prevents action.\n\nWHY IT HAPPENS:\n◾ Fear of being wrong\n◾ Seeking \"perfect\" confirmation\n◾ Information overload\n\nTHE FIX:\n◾ Define your setup (max 3-4 criteria)\n◾ Create a checklist\n◾ Criteria met? Execute.\n◾ Criteria not met? Skip.\n◾ No extra analysis allowed.\n\nSimplicity scales. Complexity paralyzes.",
    `📝 Full article: ${blog}\n📖 Trading psychology: ${edu}`
  ],

  // --- POST 119: EDUCATION - VOLUME SPREAD ANALYSIS (Lesson 31) ---
  119: [
    "Volume Spread Analysis: Reading the story of each bar. \u{1F9F5}",
    "KEY COMBINATIONS:\n\n◾ Wide spread + High volume = Strong conviction, genuine move\n◾ Wide spread + Low volume = Weak conviction, possible trap\n◾ Narrow spread + High volume = Absorption happening, big players positioning\n\nThe candle is the headline. Volume is the truth.\n\nVolume reveals what price hides.",
    `📖 Full VSA lesson: ${edu}\n🔗 Volume tools: ${tv.volumeOracle}`
  ],

  // --- POST 120: DOCS - PLUTUS FLOW DIVERGENCE GUIDE ---
  120: [
    "Plutus Flow divergence guide \u{1F9F5}",
    "BULLISH DIVERGENCE:\n◾ Price makes lower low\n◾ Plutus Flow makes higher low\n◾ = Selling pressure weakening\n\nBEARISH DIVERGENCE:\n◾ Price makes higher high\n◾ Plutus Flow makes lower high\n◾ = Buying pressure weakening\n\nDivergence = Flow disagrees with price.\nIt's a WARNING, not an entry. Wait for structure confirmation.\n\nWhen The Scales tips, pay attention.",
    `🔗 Try Plutus Flow: ${tv.plutusFlow}\n📖 Full divergence docs: ${docs.plutusFlow}`
  ],

  // --- POST 121: MARKETING - COMMUNITY TESTIMONIALS ---
  121: [
    "What Signal Pilot users are saying \u{1F9F5}",
    "\"Finally indicators that don't repaint.\"\n\"The education alone is worth it.\"\n\"Pentarch changed how I see cycles.\"\n\"Support team actually responds. Rare in this industry.\"\n\nReal reviews from real traders.\nNo paid testimonials. No fake screenshots.\n\nJoin thousands learning to trade smarter.",
    `\u{1F517} Join us: ${site}\n📖 82 free lessons: ${edu}`
  ],

  // --- POST 122: EDUCATION - SWING TRADING FUNDAMENTALS (Lesson 32) ---
  122: [
    "Swing trading: Capturing moves over days to weeks. \u{1F9F5}",
    "Not as fast as day trading. Not as slow as investing.\nThe sweet spot for traders with jobs, lives, and patience.\n\nPROS:\n✅ Works with a day job\n✅ Less stressful\n✅ Bigger risk:reward possible\n\nCONS:\n❌ Overnight/weekend risk\n❌ Requires patience\n❌ Slower feedback\n\nBigger moves. Fewer trades. Less screen time.",
    `📖 Full swing trading lesson: ${edu}\n🎓 Free course in bio`
  ],

  // --- POST 123: BLOG - THE COMPOUND EFFECT IN TRADING ---
  123: [
    "1% per day doesn't sound like much. \u{1F9F5}",
    "But 1% compounded daily = 1,278% per year.\n\nYou don't need home runs. You need consistency.\n\nHOME RUN TRADER:\n◾ Big wins, big losses, emotional rollercoaster\n\nCOMPOUND TRADER:\n◾ Small consistent gains, steady growth, wealth over time\n\nSlow is smooth. Smooth is fast.\nThe compound effect is how traders become wealthy.",
    `📝 Full article: ${blog}\n📖 Free lessons: ${edu}`
  ],

  // --- POST 124: QUOTE CARD ---
  124: [
    "\"Your biggest trading edge is emotional control.\" \u{1F9F5}",
    "Strategy is easy to find.\nRisk management is easy to learn.\nControlling yourself? That's the real challenge.\n\nEASY TO FIND: Strategies, indicators, setups — everywhere.\n\nHARD TO MASTER:\n◾ Not revenge trading after a loss\n◾ Not FOMO buying pumps\n◾ Sticking to your plan\n◾ Walking away when emotional\n\nMaster your emotions or they will master your account.",
    `Follow @signaborgs for daily wisdom\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 126: EDUCATION - DAY TRADING ESSENTIALS (Lesson 33) ---
  126: [
    "Day trading: In and out same day. No overnight risk. \u{1F9F5}",
    "REQUIRES:\n◾ Full attention during market hours\n◾ Fast decisions under pressure\n◾ Strict discipline\n◾ Lower timeframes (1m-15m)\n\nPROS: ✅ No overnight risk ✅ Faster feedback ✅ More opportunities\nCONS: ❌ High stress ❌ Time intensive ❌ Most fail\n\nThe few who succeed treat it like a job, not a game.",
    `📖 Full day trading lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 127: BLOG - WHY YOUR STOP LOSS KEEPS GETTING HIT ---
  127: [
    "Your stops keep getting hit because they're predictable. \u{1F9F5}",
    "Below the swing low? Obvious.\nAt a round number? Obvious.\nExactly at support? Obvious.\n\nPrice sweeps obvious levels → Hits your stop → Reverses → Goes your way without you.\n\nTHE FIX:\n◾ Add buffer below obvious levels\n◾ Use ATR for volatility-based stops\n◾ Place beyond the liquidity grab zone\n\nSmart stops > Tight stops.",
    `📝 Full article: ${blog}\n📖 Risk management: ${edu}`
  ],

  // --- POST 129: EDUCATION - POSITION MANAGEMENT (Lesson 34) ---
  129: [
    "Entry is 10%. Management is 90%. \u{1F9F5}",
    "How you manage the trade determines profit more than where you entered.\n\nSCALING IN: Enter partial, add as trade confirms\nSCALING OUT: Take partials at targets, let runners ride\nMOVING STOPS: Trail as trade moves, protect profits\nADDING TO WINNERS: Pyramid into strength, never add to losers\n\nManage better, profit more.",
    `📖 Full position management lesson: ${edu}\n🎓 Free resources in bio`
  ],

  // --- POST 130: DOCS - INDICATOR COMBINATIONS ---
  130: [
    "Which Signal Pilot indicators work best together? \u{1F9F5}",
    "TREND TRADING: 👑 Pentarch + 🔮 Volume Oracle\n→ Cycle phase + market condition\n\nLEVEL TRADING: 🗺️ Janus Atlas + ⚖️ Plutus Flow\n→ Key levels + flow confirmation\n\nMOMENTUM: ⚔️ Harmonic Oscillator + 🔮 Volume Oracle\n→ Momentum + regime context\n\nSCANNING: 👁️ Augury Grid + Any primary\n\nALL-IN-ONE: 🎯 OmniDeck\n\nMatch combinations to your style.",
    `📖 Full combination guide: ${docsHome}\n🔗 All indicators: ${site}`
  ],

  // --- POST 131: MARKETING - ROADMAP PREVIEW ---
  131: [
    "What's coming to Signal Pilot? \u{1F9F5}",
    "We're building in public. Here's what's ahead:\n\n🔜 New indicator features\n🔜 Mobile app improvements\n🔜 More education content\n🔜 Community features\n\nYour feedback shapes our roadmap.\nEvery feature request gets read. The best ones get built.",
    `\u{1F517} Follow the journey: ${site}\n📖 Current features: ${docsHome}`
  ],

  // --- POST 132: EDUCATION - SCALPING STRATEGIES ---
  132: [
    "Scalping: In and out in minutes. Sometimes seconds. \u{1F9F5}",
    "Tiny profits, many times.\n\nREQUIRES:\n◾ Lightning execution\n◾ Tight spreads\n◾ Zero hesitation\n◾ Iron discipline\n◾ 1m-5m timeframes\n\nNot for everyone. Definitely not for beginners.\nMost who try it lose money trying to be fast.\n\nThe few who succeed treat speed as a discipline, not an advantage.",
    `📖 Full scalping lesson: ${edu}\n🎓 Know your style first`
  ],

  // --- POST 133: BLOG - THE ART OF WAITING ---
  133: [
    "The best traders spend most of their time doing nothing. \u{1F9F5}",
    "Waiting for the setup. Waiting for confluence. Waiting for confirmation.\n\nAMATEURS: Trade to feel productive. Bored? Enter a trade.\nPROFESSIONALS: Wait for their setup. Bored? Stay bored.\n\nTHE TRUTH:\n90% of trading is waiting.\n10% is executing.\n\nThe money is made in the waiting.",
    `📝 Full article: ${blog}\n📖 Psychology lessons: ${edu}`
  ],

  // --- POST 134: QUOTE CARD ---
  134: [
    "\"Trade what you see, not what you think.\" \u{1F9F5}",
    "Your opinion doesn't move markets. Price action does.\n\nWHAT YOU THINK: \"It should go up from here.\"\nWHAT YOU SEE: Price broke structure. Volume confirmed. Level held.\n\nFacts on the chart vs opinions in your head.\n\nThe chart tells you what's happening.\nYour bias tells you what you WANT to happen.\n\nTrust the chart.",
    `Follow @signaborgs for daily wisdom\n📖 Free lessons: ${edu}`
  ],

  // --- POST 136: EDUCATION - TRADING PSYCHOLOGY MASTERY ---
  136: [
    "You can have the best strategy in the world.\n\nIf you can't control yourself, you'll still lose. \u{1F9F5}",
    "THE ENEMIES:\n\n😱 FEAR — Not taking valid setups, cutting winners early\n🤑 GREED — Oversizing, moving targets, not taking profits\n😤 REVENGE — Trading to \"get back\" at the market\n😰 FOMO — Chasing moves, entering without a plan\n\nPsychology isn't a \"soft skill\" in trading.\nIt's THE skill.\n\nMaster your mind or it will master your money.",
    `📖 Full psychology course: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 137: BLOG - BUILDING A TRADING ROUTINE ---
  137: [
    "Successful traders have routines. Struggling traders have chaos. \u{1F9F5}",
    "PRE-MARKET: Review news, mark levels, note setups, check calendar\nDURING SESSION: Execute plan only, no improvisation, log trades\nPOST-MARKET: Review every trade, update journal, plan tomorrow\nWEEKLY: Full performance review, adjust what's not working\n\nRoutines remove emotion.\nRoutines build consistency.\nRoutines compound results.",
    `📝 Full article: ${blog}\n📖 Process lessons: ${edu}`
  ],

  // --- POST 139: EDUCATION - ADVANCED CANDLESTICK PATTERNS ---
  139: [
    "Beyond basics: Advanced candlestick patterns. \u{1F9F5}",
    "THREE WHITE SOLDIERS: Three consecutive bullish candles, each closing higher. Strong reversal.\n\nTHREE BLACK CROWS: Three consecutive bearish candles. Strong reversal.\n\nTWEEZER TOPS/BOTTOMS: Two candles with same high/low. Level rejection.\n\nABANDONED BABY: Gap + Doji + Gap. Rare but powerful.\n\nContext makes the pattern. Pattern alone is noise.",
    `📖 Full patterns course: ${edu}\n🎓 Free for all traders`
  ],

  // --- POST 140: DOCS - TROUBLESHOOTING GUIDE ---
  140: [
    "Signal Pilot not working right? Quick fixes \u{1F9F5}",
    "❓ Indicator not loading → Refresh TradingView, try different browser\n❓ Signals delayed → Check data subscription (real-time vs delayed)\n❓ Settings reset → Save as template after configuring\n❓ Still stuck → Screenshot the issue, contact support@signalpilot.io\n\nMost issues have simple solutions.\nOur support team responds to every message.",
    `📖 Full troubleshooting guide: ${docsHome}\n\u{1F517} Contact support: ${site}`
  ],

  // --- POST 141: MARKETING - SIGNAL PILOT QUIZ ---
  141: [
    "Not sure which Signal Pilot indicator to start with? \u{1F9F5}",
    "Take the free quiz. Answer 5 questions about your trading style.\n\n📝 What's your trading style?\n📝 What timeframe do you trade?\n📝 What's your experience level?\n📝 What do you struggle with?\n📝 What's your goal?\n\nGet personalized indicator recommendations.\n2 minutes to clarity.",
    `\u{1F517} Take the quiz: ${site}\n📖 Or explore all 7 indicators: ${docsHome}`
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
  console.log(`Batch 3 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
