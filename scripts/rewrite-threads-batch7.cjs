#!/usr/bin/env node
/**
 * Batch 7 — Posts 301-400 (80 posts)
 * Hand-crafted 3-tweet threads
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
const docs = {
  pentarch:     'https://docs.signalpilot.io/pentarch-v10',
  volumeOracle: 'https://docs.signalpilot.io/volume-oracle-v10',
  janusAtlas:   'https://docs.signalpilot.io/janus-atlas-v10',
  plutusFlow:   'https://docs.signalpilot.io/plutus-flow-v10',
  harmonicOsc:  'https://docs.signalpilot.io/harmonic-oscillator-v10',
  auguryGrid:   'https://docs.signalpilot.io/augury-grid-v10',
  omniDeck:     'https://docs.signalpilot.io/omnideck-v10'
};

const rewrites = {
  // ── 301  Docs – FAQ ──
  301: [
    `Got questions? We probably already answered them. \u{1F9F5}`,
    `Our FAQ covers subscription details, indicator compatibility, TradingView requirements, update processes, and refund policies. Before you DM, check the docs — it's faster for everyone.`,
    `\u{1F4D6} Full FAQ: ${docsHome}\n\u{1F517} Browse all docs: ${docsHome}`
  ],

  // ── 302  Education – Trend Identification ──
  302: [
    `"The trend is your friend." But only if you can identify it. \u{1F9F5}`,
    `Moving averages, higher highs/lows, and market structure tell you the direction. Don't fight the trend — learn to read it first, then decide whether to trade with it or wait.`,
    `\u{1F4D6} Free lessons on trends: ${edu}\n\u{1F517} Tools that detect trends: ${site}`
  ],

  // ── 303  Blog – Why Trading Courses Fail ──
  303: [
    `Most trading courses sell hope, not education. \u{1F9F5}`,
    `Flashy results, no process. Vague concepts, no real framework. The best courses teach you to think — not to copy someone else's trades. The difference: education vs entertainment.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Free education that actually teaches: ${edu}`
  ],

  // ── 304  Quote – Patience ──
  304: [
    `"Patience is not passive waiting. It's active preparation for the right moment." \u{1F9F5}`,
    `The best traders aren't always in the market. They wait, prepare, and strike when the setup aligns. Patience is a skill — and it's one of the most profitable ones.`,
    `\u{1F4A1} Learn when to wait vs when to act: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 306  Education – Risk-Reward Ratio ──
  306: [
    `Risk-reward ratio: the math that makes or breaks traders. \u{1F9F5}`,
    `1:2 means risking $1 to make $2. Win 50% of the time and you're profitable. Most beginners have it backwards — they risk big to make small. Fix this one ratio and your results change.`,
    `\u{1F4D6} Free lesson on risk-reward: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 307  Blog – Trading Routine ──
  307: [
    `Successful traders don't wing it. They follow routines. \u{1F9F5}`,
    `Pre-market preparation, session review, journaling, fixed trading hours. Routines remove emotion from the equation. And emotion is the most expensive thing in trading.`,
    `\u{1F4DD} Build your routine: ${blog}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 309  Education – Volume ──
  309: [
    `Volume confirms price. Without it, every breakout is suspicious. \u{1F9F5}`,
    `Breakout with volume = conviction. Breakout without volume = trap. Volume tells you if the move is real or if it's about to reverse. It's the difference between confidence and guesswork.`,
    `\u{1F4D6} Free lessons on volume: ${edu}\n\u{1F50D} Volume Oracle: ${tv.volumeOracle}`
  ],

  // ── 310  Docs – TradingView Shortcuts ──
  310: [
    `Speed up your TradingView workflow. These shortcuts are game-changers. \u{1F9F5}`,
    `Alt+T = Trendline. Alt+H = Horizontal line. Alt+F = Fibonacci. Alt+V = Vertical line. Master these and you'll chart twice as fast. Your keyboard is faster than your mouse.`,
    `\u{1F4D6} Full shortcut reference: ${docsHome}\n\u{1F517} Our TradingView indicators: ${site}`
  ],

  // ── 311  Marketing – What Makes SP Different ──
  311: [
    `What makes Signal Pilot different? Three words: educate, not tell. \u{1F9F5}`,
    `No buy/sell signals. No "guaranteed profits." No pressure. We teach you to think independently. 7 non-repainting indicators, 82 free lessons, and a community that lifts each other up.`,
    `\u{1F393} Free education: ${edu}\n\u{1F6E0}\uFE0F Explore the toolkit: ${site}`
  ],

  // ── 312  Education – Timeframe Selection ──
  312: [
    `Which timeframe should you trade? The one that fits your life. \u{1F9F5}`,
    `Scalpers: 1-5 minute charts. Day traders: 15m-1H. Swing traders: 4H-Daily. There's no "best" timeframe — only the one that matches your schedule, personality, and risk tolerance.`,
    `\u{1F4D6} Free lesson on timeframes: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 313  Blog – Sleep Matters ──
  313: [
    `Sleep-deprived trading is impaired trading. Period. \u{1F9F5}`,
    `Studies show cognitive function drops 25% after one bad night. Your reaction time slows, your judgment suffers, and your discipline crumbles. The overnight edge: a rested brain.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology lessons: ${edu}`
  ],

  // ── 314  Quote – Market Doesn't Care ──
  314: [
    `"The market doesn't care about your opinion. It doesn't care about your analysis." \u{1F9F5}`,
    `It doesn't care about your conviction, your position size, or your emotions. The market does what it does. Your job isn't to be right — it's to manage risk when you're wrong.`,
    `\u{1F4A1} Learn to manage, not predict: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 316  Education – Trading Plan ──
  316: [
    `No plan = no edge. Your trading plan is your business blueprint. \u{1F9F5}`,
    `It should define what you trade, when you trade, how much you risk, your entry criteria, your exit criteria, and your max daily loss. If it's not written down, it doesn't exist.`,
    `\u{1F4D6} Free lesson on building a plan: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 317  Blog – Survivorship Bias ──
  317: [
    `You see successful traders. You don't see the 95% who failed. \u{1F9F5}`,
    `Survivorship bias makes trading look easier than it is. The winners are loud; the losers are silent. Study the failures too — that's where the real lessons hide.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn the real path: ${edu}`
  ],

  // ── 319  Education – Fear vs Greed ──
  319: [
    `Fear and greed: the twin enemies of every trader. \u{1F9F5}`,
    `Fear makes you exit too early, skip setups, and freeze at entries. Greed makes you overtrade, ignore stops, and chase moves. The cure for both: a written plan and the discipline to follow it.`,
    `\u{1F4D6} Free psychology lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 320  Docs – How to Update Indicators ──
  320: [
    `New Signal Pilot update available? Here's how to update in 3 steps. \u{1F9F5}`,
    `1. Remove old indicator from chart. 2. Search for it again in TradingView's indicator library. 3. Re-add it. Your settings will remain if you saved them as defaults. Simple.`,
    `\u{1F4D6} Detailed update guide: ${docsHome}\n\u{1F517} All 7 indicators: ${site}`
  ],

  // ── 321  Marketing – Yearly vs Monthly ──
  321: [
    `Monthly: $69 × 12 = $828/year. Yearly: $399/year. You save $429. \u{1F9F5}`,
    `Same 7 indicators. Same education hub. Same community access. Same everything. The only difference: annual subscribers save more than half. The math speaks for itself.`,
    `\u{1F4B0} See plans: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 322  Education – Multi-Timeframe Analysis ──
  322: [
    `One timeframe lies. Multiple timeframes reveal truth. \u{1F9F5}`,
    `Higher TF shows direction. Middle TF shows structure. Lower TF shows entry. When all three agree, you have a high-probability setup. When they disagree? Stay out.`,
    `\u{1F4D6} Free lesson on MTF analysis: ${edu}\n\u{1F50D} Augury Grid (MTF scanner): ${tv.auguryGrid}`
  ],

  // ── 323  Blog – FOMO ──
  323: [
    `FOMO is expensive. Here's what it actually costs you. \u{1F9F5}`,
    `Chasing moves leads to bad entries, tight stops that get hunted, oversized positions, and emotional decisions. The move you missed isn't your move. The next setup that fits your plan is.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Free psychology education: ${edu}`
  ],

  // ── 324  Quote – Lose Small Win Big ──
  324: [
    `"The goal isn't to win every trade. It's to lose small and win big." \u{1F9F5}`,
    `Asymmetric risk-reward is the foundation of profitable trading. Cut losers fast. Let winners run. Over 100 trades, the math takes care of the rest.`,
    `\u{1F4A1} Learn risk management: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 326  Education – Confluence Trading ──
  326: [
    `One reason to trade = weak. Multiple reasons = strong. That's confluence. \u{1F9F5}`,
    `When support lines up with a moving average, a Fibonacci level, and increasing volume — that's confluence. Each additional factor reduces uncertainty. Stack the odds before you trade.`,
    `\u{1F4D6} Free confluence lesson: ${edu}\n\u{1F6E0}\uFE0F Stack signals with: ${site}`
  ],

  // ── 327  Blog – First Hour Trap ──
  327: [
    `The first hour of the session is often the trickiest. Here's why. \u{1F9F5}`,
    `Fake breakouts, stop hunts, wide spreads, and emotional entries. Institutions use the open to create liquidity. Experienced traders often wait 30-60 minutes before making their move.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn session dynamics: ${edu}`
  ],

  // ── 329  Education – Stop Loss Placement ──
  329: [
    `Where you place your stop loss matters as much as where you enter. \u{1F9F5}`,
    `Too tight = stopped out on noise. Too wide = unnecessary risk. Place stops at levels that invalidate your thesis — behind structure, beyond key levels, where the setup is proven wrong.`,
    `\u{1F4D6} Free stop loss lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 330  Docs – Compatibility ──
  330: [
    `Signal Pilot works with everything you need. \u{1F9F5}`,
    `All TradingView paid plans. Stocks, Forex, Crypto, Futures, Indices. Desktop, tablet, mobile. Chrome, Firefox, Safari, Edge. If TradingView runs it, Signal Pilot works on it.`,
    `\u{1F4D6} Full compatibility details: ${docsHome}\n\u{1F517} Try it: ${site}`
  ],

  // ── 331  Marketing – Free vs Paid ──
  331: [
    `What's free vs what's paid at Signal Pilot? Full transparency. \u{1F9F5}`,
    `FREE: 82 lessons, education hub, basic market analysis, community access, blog content. PAID: 7 non-repainting indicators, advanced documentation, priority support. No hidden fees. Ever.`,
    `\u{1F393} Free education: ${edu}\n\u{1F6E0}\uFE0F See paid features: ${site}`
  ],

  // ── 332  Education – Trend Continuation Patterns ──
  332: [
    `Trend continuation patterns: the pause before the move continues. \u{1F9F5}`,
    `Flags, pennants, wedges, and triangles. Not every pause is a reversal — some are just rest stops. Learn to spot consolidation within a trend and position for the next leg.`,
    `\u{1F4D6} Free pattern lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 333  Blog – Trading with a Full-Time Job ──
  333: [
    `You don't need to quit your job to trade. Here's the plan. \u{1F9F5}`,
    `Higher timeframes fit busy schedules. Set alerts, not screen time. Swing trading takes 30 minutes per day. The best system is one you can actually follow with your real life.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 334  Quote – Three-Part Process ──
  334: [
    `"Plan your trade before the market opens. Trade your plan after it does." \u{1F9F5}`,
    `Review your plan after it closes. Three steps: prepare, execute, reflect. Most traders skip steps 1 and 3. That's why most traders lose. The process is the edge.`,
    `\u{1F4A1} Build your process: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 336  Education – Reversal Patterns ──
  336: [
    `Reversal patterns: when the trend may be ending. \u{1F9F5}`,
    `Double tops, double bottoms, head & shoulders. These aren't guarantees — they're warnings. A reversal pattern plus weakening volume plus divergence? Now you're onto something.`,
    `\u{1F4D6} Free pattern lessons: ${edu}\n\u{1F50D} Spot divergence: ${tv.harmonicOsc}`
  ],

  // ── 337  Blog – Sunk Cost Fallacy ──
  337: [
    `"I've held this long, I can't sell now." That's the sunk cost fallacy. \u{1F9F5}`,
    `Past losses don't determine future gains. The money is gone. The only question: if you had cash instead of this position right now, would you open it? If no, close it.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology deep dives: ${edu}`
  ],

  // ── 339  Education – Trading Psychology Fundamentals ──
  339: [
    `Trading is 20% strategy, 80% psychology. \u{1F9F5}`,
    `You can have the best system in the world and still lose money. Discipline, patience, emotional regulation, and self-awareness are the real edge. Strategy is the car. Psychology is the driver.`,
    `\u{1F4D6} Free psychology lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 340  Docs – Chart Layout Templates ──
  340: [
    `Save time with chart layout templates. Set up once, use forever. \u{1F9F5}`,
    `Configure your indicators, timeframes, and drawing tools. Save as a template in TradingView. Load it on any chart instantly. Stop wasting time on manual setup every session.`,
    `\u{1F4D6} Template guide: ${docsHome}\n\u{1F517} The indicators: ${site}`
  ],

  // ── 341  Marketing – Complete Toolkit ──
  341: [
    `7 indicators. 7 perspectives. One complete toolkit. \u{1F9F5}`,
    `Pentarch (cycles), Volume Oracle (regime detection), Janus Atlas (auto levels), Plutus Flow (OBV analysis), Harmonic Oscillator (momentum), Augury Grid (MTF scanner), OmniDeck (unified overlay). Each fills a different gap.`,
    `\u{1F6E0}\uFE0F See them all: ${site}\n\u{1F4D6} Documentation: ${docsHome}`
  ],

  // ── 342  Education – Moving Averages ──
  342: [
    `Moving averages: the simplest trend filter in trading. \u{1F9F5}`,
    `Price above MA = bullish bias. Price below = bearish. It doesn't predict the future — it smooths out noise and shows direction. Simple but powerful when used with context.`,
    `\u{1F4D6} Free MA lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 343  Blog – When to Walk Away ──
  343: [
    `Knowing when to walk away is a skill. Most traders never learn it. \u{1F9F5}`,
    `After max daily loss. When emotions take over. When the setup isn't there. Walking away protects your capital AND your mental health. The market will be here tomorrow.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Discipline education: ${edu}`
  ],

  // ── 344  Quote – Edge vs Outcome ──
  344: [
    `"An edge doesn't mean every trade wins. It means over many trades, the math works." \u{1F9F5}`,
    `A 55% win rate with 1:2 risk-reward is a profitable edge. But only over hundreds of trades. Individual results are noise. Focus on the process, not the last trade.`,
    `\u{1F4A1} Learn about edges: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 346  Education – Candlestick Patterns ──
  346: [
    `Candlestick patterns: visual clues from price action. \u{1F9F5}`,
    `Doji = indecision. Hammer = potential reversal. Engulfing = momentum shift. These aren't magic signals — they're context clues. Use them WITH structure, not in isolation.`,
    `\u{1F4D6} Free candlestick lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 347  Blog – Value of a Trading Mentor ──
  347: [
    `Learning alone is slow. Learning from someone who's done it is faster. \u{1F9F5}`,
    `A good mentor doesn't give you fish — they teach you to fish. They compress years of trial and error into months. The right guidance saves time, money, and frustration.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Guided education: ${edu}`
  ],

  // ── 349  Education – Position Sizing Formula ──
  349: [
    `Position sizing formula: the math that saves accounts. \u{1F9F5}`,
    `Risk Amount ÷ (Entry - Stop) = Position Size. If you risk 1% of $10,000 ($100) and your stop is 50 pips away, your size is $100 ÷ 50 = $2/pip. Know this math cold.`,
    `\u{1F4D6} Free risk management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 350  Docs – Need Help ──
  350: [
    `Need help? We're here. Multiple channels, fast responses. \u{1F9F5}`,
    `Discord community = fastest. Email support = detailed questions. Documentation = self-service answers. We don't hide behind a contact form. Real support from real people.`,
    `\u{1F4D6} Documentation: ${docsHome}\n\u{1F517} Join the community: ${site}`
  ],

  // ── 351  Marketing – 350 Posts Milestone ──
  351: [
    `350 posts of education. Zero "get rich quick" promises. Still here. Still teaching. \u{1F9F5}`,
    `Complete education curriculum. Smart money concepts. Psychology deep dives. Indicator demonstrations. Chronicle lore. Practical trading tips. All built on honesty. No shortcuts.`,
    `\u{1F393} Free education: ${edu}\n\u{1F517} The full picture: ${site}`
  ],

  // ── 352  Education – Fibonacci Retracements ──
  352: [
    `Fibonacci retracements: measuring pullbacks within trends. \u{1F9F5}`,
    `38.2%, 50%, 61.8%, 78.6% — these aren't magic numbers, they're areas of interest where price often reacts. Use them as zones, not exact lines. Confluence at a Fib level? Pay attention.`,
    `\u{1F4D6} Free Fibonacci lesson: ${edu}\n\u{1F50D} Auto-level detection: ${tv.janusAtlas}`
  ],

  // ── 353  Blog – Trading and Relationships ──
  353: [
    `Trading affects your relationships. Be intentional about it. \u{1F9F5}`,
    `Set boundaries for screen time. Communicate about risk and drawdowns. Don't let losses bleed into your mood at dinner. Your partner deserves the same attention you give a chart.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 354  Quote – Adapt or Die ──
  354: [
    `"The market that worked last year may not work this year." \u{1F9F5}`,
    `The strategy that worked last month may fail this month. Markets evolve. Regimes change. Volatility shifts. The traders who survive are the ones who adapt. Rigidity kills accounts.`,
    `\u{1F4A1} Learn to adapt: ${edu}\n\u{1F50D} Detect regime changes: ${tv.volumeOracle}`
  ],

  // ── 356  Education – Breakout Trading ──
  356: [
    `Breakout trading: catching the moment range resolves into trend. \u{1F9F5}`,
    `Key elements: clear consolidation range, volume expansion on breakout, retest of broken level as support/resistance. False breakouts are common — that's why volume confirmation matters.`,
    `\u{1F4D6} Free breakout lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 357  Blog – Comparison Trap ──
  357: [
    `Comparing yourself to other traders is a trap. \u{1F9F5}`,
    `You don't see their losses. You don't know their risk. You don't know their account size. Social media trading is a highlight reel. Run your own race. Your only benchmark is yesterday.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Mindset education: ${edu}`
  ],

  // ── 359  Education – Divergence Trading ──
  359: [
    `Divergence: when price and an indicator disagree, pay attention. \u{1F9F5}`,
    `Price makes a new high, RSI doesn't = bearish divergence (weakening momentum). Price makes a new low, RSI doesn't = bullish divergence (exhaustion). Not signals — warnings.`,
    `\u{1F4D6} Free divergence lesson: ${edu}\n\u{1F50D} Harmonic Oscillator: ${tv.harmonicOsc}`
  ],

  // ── 360  Docs – Performance Optimization ──
  360: [
    `Charts running slow? Try these optimizations. \u{1F9F5}`,
    `Reduce indicators per chart. Use lighter timeframes. Close unused tabs. Disable unused overlays. Clear browser cache. Use Chrome or Firefox for best performance. Simple fixes, big improvement.`,
    `\u{1F4D6} Full optimization guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 361  Marketing – Why Education First ──
  361: [
    `Why do we give away 82 lessons for free? \u{1F9F5}`,
    `Because educated traders make better decisions. They understand what they're buying. They use tools properly. They don't blame indicators for bad habits. Education first, everything else second.`,
    `\u{1F393} Start learning free: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 362  Education – Trading Sessions ──
  362: [
    `The 24-hour market isn't uniform. Each session has personality. \u{1F9F5}`,
    `Asia (6 PM - 3 AM EST): consolidation, low volatility. London (3 AM - 12 PM EST): trend initiation, high volume. New York (8 AM - 5 PM EST): continuation or reversal, peak liquidity.`,
    `\u{1F4D6} Free sessions lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 363  Blog – Imposter Syndrome ──
  363: [
    `"Am I actually good at this, or just lucky?" Imposter syndrome hits traders too. \u{1F9F5}`,
    `After a winning streak, you doubt yourself. After a loss, you feel confirmed. The cure: data. Track every trade. Let your journal tell you the truth, not your emotions.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 364  Quote – Trade the Chart ──
  364: [
    `"Trade the chart in front of you. Not the chart you wish you had." \u{1F9F5}`,
    `Not the chart from yesterday. Not the setup from Twitter. The one on YOUR screen, right now. React to what IS, not what you hope will happen. That's the entire game.`,
    `\u{1F4A1} Learn to read price: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 366  Education – Entry Techniques ──
  366: [
    `Entry techniques: how you get into the trade matters more than you think. \u{1F9F5}`,
    `Market orders = immediate but may slip. Limit orders = better price but may miss. Stop orders = confirm breakout. Each has a use case. Match your order type to your strategy.`,
    `\u{1F4D6} Free entry technique lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 367  Blog – When Trading Becomes Gambling ──
  367: [
    `Trading becomes gambling when you cross these lines. \u{1F9F5}`,
    `No defined edge. Can't define your risk. Trading for excitement instead of profit. Ignoring stop losses. Sizing up after losses. If any of these sound familiar, it's time to step back and rebuild your process.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Rebuild with education: ${edu}`
  ],

  // ── 369  Education – Chart Patterns Overview ──
  369: [
    `Chart patterns: the visual language of markets. \u{1F9F5}`,
    `Triangles, wedges, channels, head & shoulders, double tops/bottoms. Continuation or reversal — each pattern tells a story about supply, demand, and the battle between buyers and sellers.`,
    `\u{1F4D6} Free chart pattern lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 370  Docs – Mobile Trading Guide ──
  370: [
    `TradingView mobile: check charts anywhere. But don't overtrade. \u{1F9F5}`,
    `Set up alerts — don't stare at screens. Save chart layouts for quick loading. Use mobile for monitoring, not for impulse entries. The goal is awareness, not constant action.`,
    `\u{1F4D6} Mobile setup guide: ${docsHome}\n\u{1F517} Set alerts with: ${site}`
  ],

  // ── 371  Marketing – Signal Pilot Promise ──
  371: [
    `The Signal Pilot Promise: what we commit to, every single day. \u{1F9F5}`,
    `We'll educate, not mislead. We'll inform, not dictate. We'll build tools, not signal groups. We'll show the process, not just results. We'll be honest, especially when it's uncomfortable.`,
    `\u{1F393} Experience it: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 372  Education – Risk Per Trade ──
  372: [
    `How much should you risk per trade? Common guideline: 1-2% of your account. \u{1F9F5}`,
    `$10,000 account × 1% = $100 max risk per trade. This isn't conservative — it's survival. It means you can be wrong 20 times in a row and still have 80% of your account. That's the point.`,
    `\u{1F4D6} Free risk management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 373  Blog – Power of "I Don't Know" ──
  373: [
    `The most powerful words in trading: "I don't know." \u{1F9F5}`,
    `I don't know which way it's going. I don't know if this setup will work. I don't know if the bottom is in. Admitting uncertainty isn't weakness — it's the foundation of proper risk management.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Honest education: ${edu}`
  ],

  // ── 374  Quote – Boring is Profitable ──
  374: [
    `"Exciting trading is usually bad trading." \u{1F9F5}`,
    `Boring trading — same setup, same rules, same risk, same process, day after day — is usually profitable trading. If your trading feels like a casino, something is wrong.`,
    `\u{1F4A1} Learn the boring way: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 376  Education – Trade Management ──
  376: [
    `Entry is easy. Trade management is where the money is made or lost. \u{1F9F5}`,
    `When to move stop to breakeven. When to take partial profits. When to let it run. When to cut early. These decisions in real-time separate consistent traders from everyone else.`,
    `\u{1F4D6} Free management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 377  Blog – Building Confidence ──
  377: [
    `Trading confidence isn't born. It's built. Brick by brick. \u{1F9F5}`,
    `Through journaling results. Through backtesting your edge. Through surviving drawdowns. Through following rules when it's hard. Confidence isn't given — it's earned over hundreds of trades.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Start building: ${edu}`
  ],

  // ── 379  Education – Stop Loss Types ──
  379: [
    `Different stop loss types for different situations. Know them all. \u{1F9F5}`,
    `Fixed stop: set distance from entry. ATR-based stop: adjusts to volatility. Structure-based stop: behind key levels. Trailing stop: locks in profits as price moves. Each fits a different strategy.`,
    `\u{1F4D6} Free stop loss lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 380  Docs – Alert Configuration ──
  380: [
    `Set alerts, not alarms in your head. Let the indicators tell you when to look. \u{1F9F5}`,
    `Signal Pilot indicators support TradingView's built-in alert system. Set conditions, get notified. Stop staring at charts all day. Trade smarter, not harder.`,
    `\u{1F4D6} Alert setup guide: ${docsHome}\n\u{1F517} The indicators: ${site}`
  ],

  // ── 381  Marketing – Community Spotlight ──
  381: [
    `Our community isn't just users. It's traders helping traders. \u{1F9F5}`,
    `Daily discussions. Chart sharing. Strategy feedback. No egos, no flexing, no toxic positivity. Just real people learning together. Trading doesn't have to be lonely.`,
    `\u{1F393} Join the conversation: ${site}\n\u{1F4D6} Free education: ${edu}`
  ],

  // ── 382  Education – Correlation ──
  382: [
    `Correlation: when assets move together — or opposite. Know the relationships. \u{1F9F5}`,
    `BTC and ETH: highly correlated. EUR/USD and DXY: inversely correlated. Trading correlated pairs doubles your exposure. Understanding correlation = understanding risk you didn't know you had.`,
    `\u{1F4D6} Free correlation lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 383  Blog – Myth of Perfect Entry ──
  383: [
    `There is no perfect entry. Stop chasing what doesn't exist. \u{1F9F5}`,
    `Waiting for perfection = missing trades. "Good enough" with proper risk management outperforms "perfect" that never executes. The best entry is one with a clear stop and defined target.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn execution: ${edu}`
  ],

  // ── 384  Quote – Your Only Competition ──
  384: [
    `"Your only competition is who you were yesterday." \u{1F9F5}`,
    `Other traders' results don't affect your P&L. Their account size doesn't change yours. Their wins don't make you worse. Compare yourself to your last 100 trades, not someone's highlight reel.`,
    `\u{1F4A1} Track your progress: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 386  Education – Backtesting Basics ──
  386: [
    `Backtesting: testing your strategy on historical data before risking real money. \u{1F9F5}`,
    `Does your edge exist? Over how many trades? What's the max drawdown? What's the win rate? If you can't answer these questions, you're not trading — you're hoping.`,
    `\u{1F4D6} Free backtesting lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 387  Blog – When to Increase Position Size ──
  387: [
    `When to increase position size: only when it's earned, not desperate. \u{1F9F5}`,
    `After consistent profitability (months, not days). After proven edge over 100+ trades. After emotional stability during drawdowns. Size increases should feel boring, not exciting.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Risk management education: ${edu}`
  ],

  // ── 389  Education – Indicator Settings ──
  389: [
    `What do all those indicator settings mean? Let's demystify them. \u{1F9F5}`,
    `Period/Length = how much data it smooths. Threshold = sensitivity trigger. Source = what data it reads (close, HL2, etc.). Multiplier = scaling factor. Don't touch what you don't understand.`,
    `\u{1F4D6} Settings deep dives: ${docsHome}\n\u{1F517} Our indicators: ${site}`
  ],

  // ── 390  Docs – Multi-Chart Layouts ──
  390: [
    `One chart isn't enough. Multiple charts give complete context. \u{1F9F5}`,
    `TradingView layouts let you view 2, 4, or 8 charts simultaneously. Different timeframes, different assets, different indicators — all in one view. Context is everything.`,
    `\u{1F4D6} Layout guide: ${docsHome}\n\u{1F517} The indicators: ${site}`
  ],

  // ── 391  Marketing – Approaching 400 ──
  391: [
    `391 posts and counting. 400 is around the corner. \u{1F9F5}`,
    `Same mission. Same honesty. Same commitment to education. No shortcuts, no hype, no empty promises. Thank you for being part of this journey.`,
    `\u{1F393} Free education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 392  Education Recap – Market Types ──
  392: [
    `Three market types. Three approaches. Get the wrong match and you lose. \u{1F9F5}`,
    `Trending: follow the direction. Ranging: trade the boundaries. Volatile: reduce size or stay flat. The first skill isn't finding entries — it's identifying which market you're in.`,
    `\u{1F4D6} Free market type lesson: ${edu}\n\u{1F50D} Regime detection: ${tv.volumeOracle}`
  ],

  // ── 393  Blog – Trading Identity ──
  393: [
    `Who are you as a trader? If you can't answer that, you're trading someone else's style. \u{1F9F5}`,
    `Day trader or swing trader? Aggressive or conservative? Technical or fundamental? Know your identity. Trade accordingly. Stop copying others — their style won't fit your psychology.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Find your style: ${edu}`
  ],

  // ── 394  Quote – Process is the Goal ──
  394: [
    `"The goal isn't to make money. The goal is to execute your process perfectly." \u{1F9F5}`,
    `The money is a byproduct. Chase money → emotional decisions → losses. Chase process → consistent execution → profits. The paradox of trading: stop trying to make money to make money.`,
    `\u{1F4A1} Build your process: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 396  Education Recap – Journaling ──
  396: [
    `Your trading journal is your most valuable tool. Period. \u{1F9F5}`,
    `Track every trade: entry, exit, result, emotional state, what you learned. Review weekly. Patterns emerge. Mistakes become visible. Improvement becomes measurable. The journal doesn't lie.`,
    `\u{1F4D6} Free journaling lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 397  Blog – 10,000 Hour Myth ──
  397: [
    `10,000 hours of bad practice = 10,000 hours of bad habits. \u{1F9F5}`,
    `It's not about time. It's about deliberate, focused improvement. One analyzed trade is worth more than ten unexamined ones. Quality of practice > quantity of hours.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Quality education: ${edu}`
  ],

  // ── 399  Docs – Community Guidelines ──
  399: [
    `Our community guidelines are simple. Respect. Education. Support. \u{1F9F5}`,
    `Be respectful. No financial advice. Share to educate, not flex. Support each other. Zero tolerance for scams, harassment, or "guaranteed profit" claims. We're building something positive.`,
    `\u{1F4D6} Full guidelines: ${docsHome}\n\u{1F517} Join us: ${site}`
  ],

  // ── 400  Marketing – 400 Posts Milestone ──
  400: [
    `400 posts. Not a single "guaranteed profit" claim. Not a single "buy now" signal. \u{1F9F5}`,
    `Just education. Every single day. 400 posts of teaching, sharing, and building a community that values honesty over hype. Thank you for making this journey meaningful.`,
    `\u{1F393} Free education: ${edu}\n\u{1F517} Here's to the next 400: ${site}`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0, skipped = 0;
  for (const post of queue) {
    if (!rewrites[post.postNumber]) continue;
    if ((post.twitter?.tweets || []).length >= 3) { skipped++; continue; }
    post.twitter.tweets = rewrites[post.postNumber];
    updated++;
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Batch 7 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
