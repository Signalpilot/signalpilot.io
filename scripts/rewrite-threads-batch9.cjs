#!/usr/bin/env node
/**
 * Batch 9 — Posts 501-600 (80 posts)
 * Hand-crafted 3-tweet threads
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const site = 'https://signalpilot.io';
const edu  = 'https://education.signalpilot.io';
const blog = 'https://blog.signalpilot.io';
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

const rewrites = {
  // ── 501  Docs – Performance Tips ──
  501: [
    `Charts running slow? Here's how to optimize Signal Pilot performance. \u{1F9F5}`,
    `Reduce historical bar loading. Limit indicators per chart to what you actually use. Close unused tabs. Use a modern browser. These simple fixes make a massive difference in chart responsiveness.`,
    `\u{1F4D6} Full optimization guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 502  Education – Backtesting Rules ──
  502: [
    `Backtesting: testing your strategy on historical data. But there are rules. \u{1F9F5}`,
    `Don't peek ahead. Use consistent rules. Log every trade. Test on 200+ samples minimum. Include commissions and slippage. If your backtest looks too good to be true — it probably is.`,
    `\u{1F4D6} Free backtesting lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 503  Blog – Price of Impatience ──
  503: [
    `Impatience has a price. And most traders pay it daily. \u{1F9F5}`,
    `Entering early: worse fills, wider stops. Exiting early: missed profits. Skipping the plan: random results. The best traders aren't fast — they're precise. Patience is a trading superpower.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn patience: ${edu}`
  ],

  // ── 504  Quote – Rules Choose ──
  504: [
    `"The chart shows possibilities. Your rules choose which to act on." \u{1F9F5}`,
    `Every chart has bullish and bearish scenarios simultaneously. Your edge isn't seeing them — it's having clear rules that decide which ones to trade and which to ignore. Rules before instinct.`,
    `\u{1F4A1} Build your rules: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 506  Education – Forward Testing ──
  506: [
    `Forward testing: live market validation without full risk. The bridge between backtest and live. \u{1F9F5}`,
    `After backtesting: paper trade with live data. Track results identically to real trades. 30-50 forward-tested trades builds genuine confidence. Skip this step and you skip the reality check.`,
    `\u{1F4D6} Free testing lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 507  Blog – Expectation vs Reality ──
  507: [
    `Expectation: 80% win rate, daily profits. Reality: 45% win rate, monthly profits (if disciplined). \u{1F9F5}`,
    `The gap between expectation and reality destroys more traders than bad strategies ever could. Align your expectations with math, not dreams. Profitable trading looks boring from the outside.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Get realistic education: ${edu}`
  ],

  // ── 509  Education – Risk-Adjusted Metrics ──
  509: [
    `Raw returns don't tell the full story. Risk-adjusted metrics do. \u{1F9F5}`,
    `Sharpe Ratio: return per unit of risk. Sortino Ratio: return per unit of downside risk. Max drawdown: worst peak-to-trough decline. A 50% return with 40% drawdown is worse than 30% with 10% drawdown.`,
    `\u{1F4D6} Free metrics lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 510  Docs – Webhooks & Alerts ──
  510: [
    `Automate your workflow with Signal Pilot alerts and TradingView webhooks. \u{1F9F5}`,
    `Set alert conditions on any indicator. Trigger webhooks to external services. Log alerts to a spreadsheet. Get mobile notifications. Let the tools watch the market so you don't have to.`,
    `\u{1F4D6} Webhook guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 511  Marketing – Built by Traders ──
  511: [
    `Signal Pilot wasn't built in a boardroom. It was built by traders who needed better tools. \u{1F9F5}`,
    `Every feature solves a real problem we encountered. Every indicator fills a gap we experienced. No theoretical features — just practical tools built from actual trading frustration.`,
    `\u{1F6E0}\uFE0F See the tools: ${site}\n\u{1F393} Built for you: ${edu}`
  ],

  // ── 512  Education – Scaling In ──
  512: [
    `Scaling in: building a position gradually instead of all at once. \u{1F9F5}`,
    `Benefits: better average entry, reduced timing risk, ability to add as conviction grows. Drawbacks: potentially miss the full move if first entry is best. Scale in when you want confirmation before full commitment.`,
    `\u{1F4D6} Free position management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 513  Blog – Solo Journey ──
  513: [
    `Trading is a solo endeavor in a crowded market. That makes community essential. \u{1F9F5}`,
    `No one to blame. No one to celebrate with. No one who understands what you're going through — unless you find the right community. Surround yourself with traders who make you better, not worse.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Join the community: ${site}`
  ],

  // ── 514  Quote – Losses Are Tuition ──
  514: [
    `"Losses are tuition. Repeated losses are ignoring the lesson." \u{1F9F5}`,
    `The first time you make a mistake, it's education. The second time, it's a reminder. The fifth time? You're choosing not to learn. Journal every loss. Find the pattern. Break the cycle.`,
    `\u{1F4A1} Start learning: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 516  Education – Scaling Out ──
  516: [
    `Scaling out: taking profits in portions instead of all at once. \u{1F9F5}`,
    `Benefits: locks in partial profit, reduces stress, lets the remainder run. Take 50% at target 1, move stop to breakeven, let the rest ride. Worst case: you banked half and broke even on the rest.`,
    `\u{1F4D6} Free exit strategy lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 517  Blog – When to Log Off ──
  517: [
    `Sometimes the best trade is logging off. Here are the signs. \u{1F9F5}`,
    `Revenge trading urges. Three losses in a row. Anger at the screen. Checking P&L every minute. Physical tension. When your body and mind say stop — stop. The market opens again tomorrow.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Mental health matters: ${edu}`
  ],

  // ── 519  Education – Trade Review Process ──
  519: [
    `The trade review process: where learning actually happens. \u{1F9F5}`,
    `After every trade (win or loss): screenshot the chart. Note your reasoning. Grade your execution 1-10. Identify what you'd do differently. Weekly: find patterns across all trades. This is how edges compound.`,
    `\u{1F4D6} Free review process lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 520  Docs – FAQ ──
  520: [
    `Questions? We've got answers. Signal Pilot FAQ covers everything. \u{1F9F5}`,
    `Setup and installation. Common troubleshooting. Billing and subscriptions. Indicator settings. TradingView compatibility. 90% of questions answered in under 2 minutes. Check the docs first.`,
    `\u{1F4D6} Full FAQ: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 521  Marketing – 10K+ Traders ──
  521: [
    `10,000+ traders trust Signal Pilot. Here's why they chose us. \u{1F9F5}`,
    `Professional-grade tools. Real education (not hype). Transparent pricing. Active community. Non-repainting indicators. And zero "guaranteed profit" promises. Trust is earned, not marketed.`,
    `\u{1F6E0}\uFE0F See why: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 522  Education – Correlation Deep Dive ──
  522: [
    `Correlation: when assets move together or opposite. Understanding it reduces hidden risk. \u{1F9F5}`,
    `If you're long EUR/USD and long GBP/USD, you're essentially doubling your dollar short exposure. Correlated positions multiply risk without multiplying edge. Diversify, don't duplicate.`,
    `\u{1F4D6} Free correlation lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 523  Blog – Power of "I Don't Know" ──
  523: [
    `Three powerful words in trading: "I don't know." \u{1F9F5}`,
    `Where is price going? I don't know. Will this setup work? I don't know. Is the bottom in? I don't know. And that's perfectly fine — because trading isn't about knowing. It's about managing.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Manage better: ${edu}`
  ],

  // ── 524  Quote – Respond Not Predict ──
  524: [
    `"The goal isn't to predict the market. It's to respond to it." \u{1F9F5}`,
    `Predictors are right sometimes and devastated when wrong. Responders have plans for every scenario. They don't need to be right — they need to be prepared. Prediction is ego. Response is edge.`,
    `\u{1F4A1} Learn to respond: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 526  Education – Volatility Cycles ──
  526: [
    `Volatility is cyclical, not random. Compression always precedes expansion. \u{1F9F5}`,
    `Low volatility \u{2192} high volatility \u{2192} low volatility. Tight ranges resolve into big moves. Bollinger Bands squeeze before expansion. The calm is the setup. The storm is the trade.`,
    `\u{1F4D6} Free volatility lesson: ${edu}\n\u{1F50D} Volume Oracle: ${tv.volumeOracle}`
  ],

  // ── 527  Blog – Building Resilience ──
  527: [
    `Markets will test you. Resilience determines survival. \u{1F9F5}`,
    `Building mental resilience: expect drawdowns (they're normal). Have a plan for losing streaks. Set max daily losses. Take breaks. Remember: the traders who survive the hardest days are the ones still here in 5 years.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 529  Education – Mean Reversion ──
  529: [
    `Mean reversion: the tendency of price to return to its average. \u{1F9F5}`,
    `After extremes, price often pulls back. Overbought \u{2192} revert lower. Oversold \u{2192} revert higher. This doesn't mean catch every falling knife — it means extremes are opportunities when context supports it.`,
    `\u{1F4D6} Free reversion lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 530  Docs – Changelog ──
  530: [
    `Signal Pilot is always improving. Our changelog tracks every update. \u{1F9F5}`,
    `New features added. Bugs fixed. Performance improvements. UI enhancements. Every change documented publicly. We don't update silently — we tell you what changed and why.`,
    `\u{1F4D6} Full changelog: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 531  Marketing – 7-Day Challenge ──
  531: [
    `Challenge yourself: 7 days, 7 lessons. Our free curriculum has 82 lessons. \u{1F9F5}`,
    `Start with one per day. Beginner-friendly. No paywall. No signup wall. Just open the education hub and start learning. After 7 days, you'll understand more than most traders do after months.`,
    `\u{1F393} Start day 1: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 532  Education – Trend Strength Assessment ──
  532: [
    `Not all trends are equal. Assessing trend strength changes your trading. \u{1F9F5}`,
    `Angle of ascent/descent. Pullback depth and frequency. Volume on impulse vs retracement. Higher timeframe alignment. Strong trends have shallow pullbacks and volume confirmation. Weak trends show the opposite.`,
    `\u{1F4D6} Free trend lesson: ${edu}\n\u{1F50D} Pentarch: ${tv.pentarch}`
  ],

  // ── 533  Blog – Conviction vs Stubbornness ──
  533: [
    `Conviction holds through noise. Stubbornness holds through invalidation. Know the difference. \u{1F9F5}`,
    `Conviction: "My setup is intact, I'll hold." Stubbornness: "Price hit my stop but I know I'm right." One is discipline. The other is ego. Your stop loss is where conviction should end.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Discipline education: ${edu}`
  ],

  // ── 534  Quote – Small Loss Success ──
  534: [
    `"A small loss is a successful trade if it followed the rules." \u{1F9F5}`,
    `Redefine success. It's not about P&L. It's about execution quality. A $50 loss on a perfect setup with proper sizing? That's a win. A $200 gain from an impulsive gamble? That's a future loss.`,
    `\u{1F4A1} Redefine winning: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 536  Education – Support Becomes Resistance ──
  536: [
    `When support breaks, it becomes resistance. When resistance breaks, it becomes support. \u{1F9F5}`,
    `This polarity shift is one of the most reliable concepts in technical analysis. Broken levels don't disappear — they flip roles. Price often retests the flip before continuing. That retest is your entry.`,
    `\u{1F4D6} Free level analysis lesson: ${edu}\n\u{1F50D} Janus Atlas: ${tv.janusAtlas}`
  ],

  // ── 537  Blog – Go Smaller ──
  537: [
    `Whatever position size you're thinking... go smaller. \u{1F9F5}`,
    `Benefits: clearer thinking. Better execution. Less emotional decisions. Longer survival in drawdowns. The traders who blow up are always the ones who sized too big. Small is smart.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Risk management: ${edu}`
  ],

  // ── 539  Education – Multi-Timeframe Confirmation ──
  539: [
    `One timeframe shows a piece. Multiple timeframes show the picture. \u{1F9F5}`,
    `Higher TF for direction. Middle TF for structure. Lower TF for entry. When all three align, you have the highest probability trade. When they conflict? Wait. Clarity before action.`,
    `\u{1F4D6} Free MTF lesson: ${edu}\n\u{1F50D} Augury Grid: ${tv.auguryGrid}`
  ],

  // ── 540  Docs – Support Channels ──
  540: [
    `Need help? We're here. Multiple support channels, fast responses. \u{1F9F5}`,
    `Direct email response. Discord community. Comprehensive documentation. We don't hide behind automated chatbots. Real questions deserve real answers from real people.`,
    `\u{1F4D6} Documentation: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 541  Marketing – Compare Us ──
  541: [
    `Don't take our word for it. Compare Signal Pilot to alternatives. \u{1F9F5}`,
    `7 integrated indicators vs scattered single tools. Free education vs paid courses. Non-repainting vs "repaint after the fact." Transparent pricing vs hidden upsells. The comparison speaks for itself.`,
    `\u{1F6E0}\uFE0F Compare: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 542  Education – False Breakouts ──
  542: [
    `False breakouts trap traders. Learning to recognize them is an edge. \u{1F9F5}`,
    `Signs: low volume on breakout. No retest confirmation. Immediate reversal back into range. Quick wick beyond the level. False breakouts are liquidity grabs — once you see them as traps, you trade the reversal.`,
    `\u{1F4D6} Free breakout lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 543  Blog – Sleep and Trading ──
  543: [
    `Sleep-deprived trading is impaired trading. The data is clear. \u{1F9F5}`,
    `Lack of sleep affects decision quality, emotional regulation, reaction time, and pattern recognition. One bad night reduces cognitive function by 25%. Your best indicator? A rested brain.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Protect your edge: ${edu}`
  ],

  // ── 544  Quote – Patience Rewarded ──
  544: [
    `"The market rewards patience. It punishes prediction." \u{1F9F5}`,
    `Predictors jump in early and get stopped out. Patient traders wait for confirmation and get in clean. The market doesn't care about your forecast — it cares about your timing.`,
    `\u{1F4A1} Learn timing: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 546  Education – Gap Types ──
  546: [
    `Gaps are windows of information. Each type tells a different story. \u{1F9F5}`,
    `Breakaway gap: trend start (high conviction). Continuation gap: trend confirmation (mid-move). Exhaustion gap: trend end (final push). Common gap: noise (ignore it). Context determines which is which.`,
    `\u{1F4D6} Free gap lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 547  Blog – Winning Streaks Are Dangerous ──
  547: [
    `Winning streaks are dangerous. Here's why the best traders fear them. \u{1F9F5}`,
    `Overconfidence builds. Size creeps up. Rules start bending. "I can't lose" becomes the internal narrative. Then one trade reminds you — brutally — that you can. Stay humble after green days.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Stay grounded: ${edu}`
  ],

  // ── 549  Education – Volume Confirmation ──
  549: [
    `Price shows what happened. Volume shows conviction. They're different things. \u{1F9F5}`,
    `Breakout with volume = real. Breakout without volume = suspect. Reversal with volume = significant. Reversal without volume = bounce. Always ask: does volume confirm what price is showing?`,
    `\u{1F4D6} Free volume lesson: ${edu}\n\u{1F50D} Volume Oracle: ${tv.volumeOracle}`
  ],

  // ── 550  Docs – Best Practices ──
  550: [
    `Get the most from Signal Pilot. Here are the best practices. \u{1F9F5}`,
    `Start with one indicator, add gradually. Read the documentation before tweaking settings. Use alerts instead of staring. Combine with your own analysis. The indicators enhance your process — they don't replace it.`,
    `\u{1F4D6} Full best practices: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 551  Marketing – Honesty Over Hype ──
  551: [
    `We don't promise results. We provide tools. There's a difference. \u{1F9F5}`,
    `No "get rich quick." No "guaranteed profits." No "copy my trades." Just professional indicators, honest education, and a community that values truth over hype. If that's boring, we're proud of boring.`,
    `\u{1F393} Honest education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 552  Education – Candle Anatomy ──
  552: [
    `Every candle tells a story of battle. Learn to read it. \u{1F9F5}`,
    `The body: who won (buyers or sellers). The wicks: where they tried and failed. The size: how much conviction existed. Long wick, small body = rejection. Large body, no wick = dominance. The language is visual.`,
    `\u{1F4D6} Free candlestick lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 553  Blog – Trading as Business ──
  553: [
    `Treat trading like a business. Because that's exactly what it is. \u{1F9F5}`,
    `Businesses have clear strategies, tracked expenses, profit targets, and scheduled reviews. Your trading account is your business. P&L is your income statement. The journal is your quarterly report.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Build the business: ${edu}`
  ],

  // ── 554  Quote – Beginners Who Didn't Quit ──
  554: [
    `"Every expert was once a beginner who didn't quit." \u{1F9F5}`,
    `The trader with 10 years of experience started just like you. Confused. Losing. Frustrated. The only difference: they stayed. They learned. They adapted. Your journey starts with lesson one.`,
    `\u{1F4A1} Start here: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 556  Education – Divergence Deep Dive ──
  556: [
    `Divergence: when price and an indicator disagree. The warning is hidden in the data. \u{1F9F5}`,
    `Price makes a new high, oscillator doesn't = weakening momentum. Price makes a new low, oscillator doesn't = exhaustion. Divergence is a yellow light, not a red one. Use it with context, never alone.`,
    `\u{1F4D6} Free divergence lesson: ${edu}\n\u{1F50D} Harmonic Oscillator: ${tv.harmonicOsc}`
  ],

  // ── 557  Blog – First Hour Danger ──
  557: [
    `The first hour is the most volatile — and the most dangerous. \u{1F9F5}`,
    `Traps include fakeouts on both sides, stop hunts at obvious levels, wide spreads, and emotional entries. Experienced traders often wait 30-60 minutes. The first hour creates the map. The second hour reveals the route.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Session education: ${edu}`
  ],

  // ── 559  Education – Reversal Signs ──
  559: [
    `Reversals don't happen instantly. They have patterns and warning signs. \u{1F9F5}`,
    `Double top/bottom, head & shoulders, divergence, volume climax, failed breakout. One sign = warning. Two signs = attention. Three or more = potential reversal. Always wait for confirmation.`,
    `\u{1F4D6} Free reversal lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 560  Docs – Video Library ──
  560: [
    `Learn better with video? Signal Pilot has a video library for that. \u{1F9F5}`,
    `Setup tutorials. Feature walkthroughs. Chart analysis examples. Strategy demonstrations. Visual learners shouldn't have to suffer through walls of text. See it, learn it, apply it.`,
    `\u{1F4D6} Watch and learn: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 561  Marketing – Start Free ──
  561: [
    `Start learning right now. For free. No credit card. No email gate. No tricks. \u{1F9F5}`,
    `82 lessons from beginner to professional. Zero barriers. We believe education should be accessible to everyone. Learn at your pace. Come back when you're ready for tools.`,
    `\u{1F393} Start now: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 562  Education – Optimizing R:R ──
  562: [
    `Risk-to-reward isn't just about aiming for 3:1. It's about optimization. \u{1F9F5}`,
    `Tighter entries = better R:R. Wider stops with higher targets = better probability. Partial exits = guaranteed partial R:R. The best setups balance probability of hitting target against the reward offered.`,
    `\u{1F4D6} Free R:R optimization lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 563  Blog – Comparison Trap Redux ──
  563: [
    `Comparing yourself to other traders is a trap. Always has been. \u{1F9F5}`,
    `You see their wins, not their journey. You see their account size, not their starting capital. Social media trading is 90% highlight reel. Your only real benchmark: are you better than last month?`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Focus inward: ${edu}`
  ],

  // ── 564  Quote – Forced Trades Hurt ──
  564: [
    `"The trade you didn't take can't hurt you. The trade you forced can." \u{1F9F5}`,
    `Missing a move costs nothing. Forcing a trade costs money, confidence, and discipline. Every forced trade is a debt against your future self. The best trades find you — you don't chase them.`,
    `\u{1F4A1} Learn discipline: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 566  Education – Confluence Deep Dive ──
  566: [
    `Confluence: when multiple factors align at one zone. That's where probability stacks up. \u{1F9F5}`,
    `Key level + order block + FVG + session time + volume = high-probability zone. Each factor alone is weak. Combined, they create zones where price is likely to react. Stack before you trade.`,
    `\u{1F4D6} Free confluence lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 567  Blog – Realistic Goals ──
  567: [
    `"I want to make 10% per month." That's probably unrealistic. Here are better goals. \u{1F9F5}`,
    `Follow my rules 90% of the time. Journal every trade. Review weekly. Reduce average loss size. Increase average win size. Process goals you can control beat outcome goals you can't.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Set real goals: ${edu}`
  ],

  // ── 569  Education – Session Personalities ──
  569: [
    `Each trading session has its own personality. Trade accordingly. \u{1F9F5}`,
    `Asian: range-setting, quieter moves. London: first impulse, trend initiation. New York: continuation or reversal, highest volatility. London Close: profit-taking, reversals. Knowing the session changes your strategy.`,
    `\u{1F4D6} Free session lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 570  Docs – Glossary ──
  570: [
    `Confused by a term? Signal Pilot has a glossary for that. \u{1F9F5}`,
    `Indicator terminology. Smart money concepts. Technical analysis terms. All defined clearly in plain English. No jargon without explanation. The docs exist so you never feel lost.`,
    `\u{1F4D6} Full glossary: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 571  Marketing – Start Your Journey ──
  571: [
    `Every successful trader started somewhere. Your journey can start right here. \u{1F9F5}`,
    `Free education. Professional tools. Honest community. No shortcuts, no secrets, no unrealistic promises. Just a clear path from beginner to competent trader. The first step is the hardest.`,
    `\u{1F393} Take the first step: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 572  Education – Position Management ──
  572: [
    `Entry gets you in. Position management keeps you alive. \u{1F9F5}`,
    `Never move stop further from entry. Take partials at logical targets. Trail stop behind structure. Exit if thesis is invalidated. Management decisions happen in real-time — prepare them in advance.`,
    `\u{1F4D6} Free management lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 573  Blog – Why Most Quit ──
  573: [
    `Most traders quit within 2 years. Here are the real reasons. \u{1F9F5}`,
    `Unrealistic expectations. Undercapitalization. No education. No plan. No community. Isolation plus frustration plus losses equals quitting. Fix the inputs and the output changes. Education is insurance against quitting.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Don't be a statistic: ${edu}`
  ],

  // ── 574  Quote – Right Thing Every Time ──
  574: [
    `"Consistency isn't doing the same thing every day. It's doing the right thing every time." \u{1F9F5}`,
    `Markets change. Conditions shift. Your response should adapt — but your standards shouldn't. Consistent doesn't mean rigid. It means your process quality never drops, even when conditions do.`,
    `\u{1F4A1} Build consistency: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 576  Education – Stop Placement Strategies ──
  576: [
    `Where you put your stop matters as much as where you enter. Maybe more. \u{1F9F5}`,
    `Behind structure (safest). ATR-based (volatility-adjusted). Fixed distance (simplest). Below order block (smart money). Your stop should be at the level that invalidates your thesis — not where it feels comfortable.`,
    `\u{1F4D6} Free stop placement lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 577  Blog – Weekend Review ──
  577: [
    `Sunday is for reviewing, not regretting. Build a weekend ritual. \u{1F9F5}`,
    `Review all trades. Update your journal. Calculate weekly stats. Identify patterns in wins and losses. Set intentions for next week. 30 minutes every Sunday compounds into massive improvement over a year.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Review framework: ${edu}`
  ],

  // ── 579  Education – Journal Best Practices ──
  579: [
    `A trading journal is your most valuable tool. Here are the best practices. \u{1F9F5}`,
    `Record before, during, and after each trade. Screenshot the chart. Grade execution 1-10. Review weekly, not just after losses. The journal doesn't lie — your memory does. Trust the data.`,
    `\u{1F4D6} Free journaling lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 580  Docs – Setup Requirements ──
  580: [
    `Before you start, make sure you're set up right. Here's what you need. \u{1F9F5}`,
    `TradingView account (paid plan). Modern browser (Chrome/Firefox recommended). Signal Pilot subscription. That's it. No additional software, no downloads, no plugins. Setup takes under 5 minutes.`,
    `\u{1F4D6} Setup guide: ${docsHome}\n\u{1F517} Get started: ${site}`
  ],

  // ── 581  Marketing – The Signal Pilot Promise ──
  581: [
    `The Signal Pilot Promise: quality tools, free education, honest communication. \u{1F9F5}`,
    `Tools that are always improving. Education that's never paywalled. Support that's always responsive. Pricing that's always transparent. These aren't marketing claims — they're commitments we deliver on daily.`,
    `\u{1F393} Experience it: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 582  Education – Setup vs Trigger ──
  582: [
    `Setup identifies opportunity. Trigger tells you when to enter. They're different steps. \u{1F9F5}`,
    `Common triggers: candle close above level, volume spike, indicator signal, breakout confirmation. The setup puts you on alert. The trigger puts you in the trade. Skip the trigger and you're guessing.`,
    `\u{1F4D6} Free entry lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 583  Blog – Sunk Cost Redux ──
  583: [
    `"I've already lost so much, I can't exit now." That's the sunk cost fallacy talking. \u{1F9F5}`,
    `What you've lost is gone. The only question: with fresh eyes, would you open this position right now? If the answer is no, the position should be closed. Past losses don't justify future ones.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 584  Quote – Entry Price Irrelevant ──
  584: [
    `"The market doesn't care about your entry price. Neither should you." \u{1F9F5}`,
    `Your entry is your problem, not the market's. Price moves based on supply, demand, and liquidity — not your breakeven level. Manage the trade based on current structure, not where you got in.`,
    `\u{1F4A1} Learn management: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 586  Education – Hidden Costs ──
  586: [
    `Hidden costs eat your profits. Know them before they surprise you. \u{1F9F5}`,
    `Spread: difference between bid and ask. Slippage: difference between expected and actual fill. Commissions: broker fees per trade. Swap/rollover: overnight holding costs. Add them up — they matter.`,
    `\u{1F4D6} Free cost analysis lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 587  Blog – Finding Your Style ──
  587: [
    `Not every style fits every person. Find yours and stop copying others. \u{1F9F5}`,
    `Scalping: fast, many trades, high stress. Day trading: moderate pace, daily. Swing trading: patient, multi-day holds. Position trading: weeks to months. Your personality determines your style, not a course.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Explore styles: ${edu}`
  ],

  // ── 589  Education – Liquidity Basics ──
  589: [
    `Liquidity determines how easily you can enter and exit. It's not optional to understand. \u{1F9F5}`,
    `High liquidity: tight spreads, easy fills, low slippage. Low liquidity: wide spreads, partial fills, high slippage. Trade liquid markets. Avoid illiquid ones unless you know exactly what you're doing.`,
    `\u{1F4D6} Free liquidity lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 590  Docs – Feedback ──
  590: [
    `Your voice shapes Signal Pilot. Feedback isn't just welcome — it's essential. \u{1F9F5}`,
    `Feature requests. Bug reports. Improvement suggestions. Every piece of feedback gets reviewed. Some of our best features came from community suggestions. Your input makes the tools better for everyone.`,
    `\u{1F4D6} Submit feedback: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 591  Marketing – 600+ Posts ──
  591: [
    `600+ posts of trading education. From beginner basics to professional concepts. \u{1F9F5}`,
    `Indicator walkthroughs. Psychology deep dives. Risk management guides. Smart money concepts. Chronicle lore. All built on one principle: educate honestly, sell nothing but truth.`,
    `\u{1F393} All free: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 592  Education – Trading Plan Components ──
  592: [
    `A trading plan answers four questions: What, when, how, and how much. \u{1F9F5}`,
    `Strategy rules. Risk parameters. Entry/exit criteria. Position sizing formula. Review schedule. If any of these are missing, your plan has a hole. Holes leak money. Fill them before you trade.`,
    `\u{1F4D6} Free plan-building lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 593  Blog – Losses as Business Expenses ──
  593: [
    `Losses aren't mistakes. They're business expenses. Every business has them. \u{1F9F5}`,
    `Trading's cost of doing business: controlled losses. A restaurant has rent. A trader has stop losses. The goal isn't zero losses — it's losses smaller than wins. That's a profitable business.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Business mindset: ${edu}`
  ],

  // ── 594  Quote – Imperfect System Followed ──
  594: [
    `"A system followed imperfectly beats a perfect system never followed." \u{1F9F5}`,
    `The 70% system you actually execute outperforms the 95% system sitting in your notes. Execution > optimization. A plan only works when you work it. Stop perfecting. Start following.`,
    `\u{1F4A1} Start executing: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 596  Education – Common Beginner Mistakes ──
  596: [
    `Every beginner makes these mistakes. Learn to avoid them early. \u{1F9F5}`,
    `Overtrading. No stop loss. Oversizing. Revenge trading. Indicator hopping. No journal. No plan. Each mistake has a simple fix — but only if you know it's a mistake in the first place.`,
    `\u{1F4D6} Free beginner lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 597  Blog – Pareto Principle ──
  597: [
    `80% of results come from 20% of efforts. In trading, this is critical. \u{1F9F5}`,
    `80% of profits come from 20% of trades. 80% of losses come from 20% of mistakes. Find your best setup. Trade it more. Find your worst habit. Eliminate it first. Focus beats volume.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Focus your edge: ${edu}`
  ],

  // ── 599  Education – Trading Habits ──
  599: [
    `Success is built on habits, not single trades. Good habits compound. \u{1F9F5}`,
    `Morning preparation. Pre-trade checklist. Post-trade journaling. Weekly review. Physical exercise. Sleep schedule. These aren't trading tips — they're trading infrastructure. Build the habits first.`,
    `\u{1F4D6} Free habit lesson: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 600  Docs – Quick Start Guide ──
  600: [
    `Ready to start? Signal Pilot quick start guide: 5 minutes to setup. \u{1F9F5}`,
    `Create TradingView account. Add Signal Pilot indicators. Load a preset layout. Set your first alert. Done. You're up and running. The documentation covers every step with screenshots.`,
    `\u{1F4D6} Quick start: ${docsHome}\n\u{1F517} Get started: ${site}`
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
  console.log(`Batch 9 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
