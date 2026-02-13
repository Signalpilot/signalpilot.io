#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// postNumber -> array of 1-2 new tweets to insert before CTA
// 6-tweet targets get 2 new tweets (real-world usage + common mistake)
// 5-tweet targets get 1 new tweet (real-world usage scenario)
const deepens = {

  // ── POST 10: Pentarch Cheatsheet (6-tweet: full reference card) ──
  10: [
    `Real-world scenario: you see TD fire on the daily while the weekly is still in BDN. That's not a contradiction — it's the lower timeframe catching the turn first. Watch for IGN on the daily to confirm. That sequence is textbook cycle reset.`,
    `Common mistake: treating every WRN as a sell signal. WRN means weakness is appearing, not that the trend is over. Plenty of strong uptrends print WRN and keep climbing. WRN is your cue to tighten stops, not panic sell.`
  ],

  // ── POST 30: Quick Start Guide (6-tweet: getting started) ──
  30: [
    `Real example: a new user adds Pentarch to a BTC daily chart. First session, they see a WRN signal. Instead of trading it, they just observe. Two days later, price drops. That observation — without risking capital — builds the pattern recognition that manuals can't teach.`,
    `The mistake that delays progress most: switching indicators every few days because the first one "didn't work." Stick with one for at least two weeks. You need to see it through multiple market conditions before it makes sense.`
  ],

  // ── POST 40: Plutus Flow Cheatsheet (5-tweet: single indicator ref) ──
  40: [
    `When to check Plutus Flow specifically: before entering any breakout trade. If price is breaking out but Flow isn't rising with it, that breakout is suspect. Flow confirmation separates real breakouts from traps. Takes 3 seconds to verify.`
  ],

  // ── POST 50: Quick Start Checklist (6-tweet: getting started) ──
  50: [
    `Real scenario: your first week, set one alert on Pentarch TD for an asset you follow. Don't trade it. Just see when it fires and what price does next. That single alert teaches more about cycle timing than reading 10 articles.`,
    `The checklist step people regret skipping: the journal. Even one sentence per trade — "entered because X, result was Y" — transforms random clicks into a learning system. Start messy. Refine later. Just start.`
  ],

  // ── POST 60: Harmonic Oscillator Settings (5-tweet: single settings ref) ──
  60: [
    `When to adjust settings: if you're seeing signals every other candle, the sensitivity is too high for your timeframe. If you go a week without a signal, it's too low. The right setting gives you 2-5 actionable signals per week on your primary chart.`
  ],

  // ── POST 70: Janus Atlas Timeframe Guide (5-tweet: single feature) ──
  70: [
    `Real scenario: you're day trading the 15m chart and price stalls at a level you didn't draw. Check Janus Atlas — odds are there's a daily or 4H level sitting right there. Higher-TF levels explain "invisible walls" that pure intraday analysis misses.`
  ],

  // ── POST 80: Pentarch Signal Meanings (5-tweet: single reference) ──
  80: [
    `When to reference this: mid-trade, when you see a new Pentarch label appear on your chart. Instead of guessing what it means, check the phase. If you're long and CAP appears, that's your signal to manage the position — not after the BDN confirms.`
  ],

  // ── POST 90: Volume Oracle Settings (5-tweet: single settings) ──
  90: [
    `When to revisit these settings: after switching to a new asset. A setting tuned for BTC's volatility will over-trigger on a stock like AAPL. Spend 5 minutes adjusting sensitivity when you change instruments — it's the difference between useful and noisy.`
  ],

  // ── POST 100: Getting Started Workflow (6-tweet: getting started) ──
  100: [
    `Real scenario: a trader follows this workflow and spends week one just watching Pentarch on SPY daily. By week two, they can anticipate phase transitions before they print. That's not prediction — it's pattern familiarity built through deliberate observation.`,
    `What most traders overlook in this workflow: step 4 says "paper trade for consistency," not "paper trade for one day." Consistency means 20+ trades with a positive edge. If you can't show that on paper, live money won't fix it.`
  ],

  // ── POST 110: Augury Grid Symbol Setup (5-tweet: single setup) ──
  110: [
    `Real usage: set Augury Grid to scan 8 uncorrelated assets on the 4H timeframe. Check it once in the morning. If multiple assets trigger the same condition simultaneously, that's a macro signal — not just individual setups. The grid reveals correlation in real time.`
  ],

  // ── POST 120: Plutus Flow Divergence Guide (5-tweet: single feature) ──
  120: [
    `When to actually trade divergence: only when it appears at a Janus Atlas level or after a Pentarch CAP signal. Divergence alone is a warning. Divergence at a key level with cycle exhaustion is a high-conviction setup. Layer your confirmations.`
  ],

  // ── POST 130: Indicator Combinations (6-tweet: multi-indicator workflow) ──
  130: [
    `Real scenario: Pentarch shows TD on Bitcoin while Volume Oracle shifts to accumulation regime. Two independent indicators, different methodologies, same conclusion. That agreement is what separates "maybe" from "probably." It's confirmation, not redundancy.`,
    `The combination mistake that wastes screen space: running Pentarch AND Harmonic Oscillator together without understanding the overlap. Both measure momentum from different angles. If you use both, let Pentarch set direction and Harmonic time the entry.`
  ],

  // ── POST 140: Troubleshooting Guide (5-tweet: single topic) ──
  140: [
    `Before contacting support, try this 60-second reset: close all TradingView tabs, clear browser cache, reopen one chart, re-add the indicator fresh. This resolves the vast majority of display glitches without waiting for a reply.`
  ],

  // ── POST 150: Keyboard Shortcuts (5-tweet: single feature) ──
  150: [
    `Real scenario: earnings are about to drop and you need to check the daily, 4H, and 1H charts quickly. Number keys let you cycle through all three in under 2 seconds. That speed matters when you're evaluating whether a setup still holds before the candle closes.`
  ],

  // ── POST 160: OmniDeck Layout Customization (6-tweet: advanced config) ──
  160: [
    `Real scenario: you open OmniDeck and it feels overwhelming. Turn off everything except Pentarch and Janus Atlas. Trade with just those two for a week. Then add Volume Oracle. Each addition should feel like it's answering a question you're already asking.`,
    `The layout mistake that causes decision paralysis: showing all 7 components in OmniDeck at once on a 5-minute chart. Scalp timeframes need minimal information. Save the full Commander view for daily/weekly analysis where the extra context adds clarity.`
  ],

  // ── POST 170: Pentarch Alert Conditions (5-tweet: alert config) ──
  170: [
    `Real usage: set a TD alert on the daily chart for 5 assets you watch. Go about your day. When the alert fires, open TradingView, drop to the 1H, and look for entry structure. You just replaced 6 hours of screen time with a 5-minute notification check.`
  ],

  // ── POST 180: Indicator Update Log (5-tweet: single topic) ──
  180: [
    `After any update, spend 2 minutes checking your live charts. Not because something broke — auto-updates handle that — but because new features might improve your workflow. Users who read the changelog tend to discover optimizations others miss for weeks.`
  ],

  // ── POST 190: FAQ (5-tweet: single ref) ──
  190: [
    `The FAQ entry worth bookmarking: asset compatibility. Traders often assume indicators only work on major pairs. Then they try Signal Pilot on crude oil futures or a small-cap stock and realize the statistical engine reads structure regardless of what's being charted.`
  ],

  // ── POST 250: Indicator Stacking Guide (6-tweet: multi-indicator workflow) ──
  250: [
    `Real scenario: a trader runs Pentarch + Volume Oracle + Janus Atlas on ETH. Pentarch shows IGN, Volume Oracle shows accumulation, and Janus Atlas has a level right below current price. Three dimensions of confirmation — cycle, flow, and structure — all aligned.`,
    `The stacking mistake that actually hurts performance: running 5+ indicators and waiting for ALL of them to agree. That almost never happens. Pick 2-3 as your primary stack. The others are reference tools, not veto gates.`
  ],

  // ── POST 260: Alert Setup Guide (6-tweet: full setup guide) ──
  260: [
    `Real workflow: Monday morning, set weekly alerts on your top 10 assets — Pentarch phase changes and Volume Oracle regime shifts. For the rest of the week, your phone tells you where to look. No scanning. No staring. Just responding to real signals.`,
    `The alert setup mistake that causes missed trades: setting alerts only on your favorite indicator. Cross-indicator alerts catch what single-indicator alerts miss. A Pentarch TD alert AND a Volume Oracle accumulation alert on the same asset covers more scenarios.`
  ],

  // ── POST 270: Mobile Trading Setup (5-tweet: single setup) ──
  270: [
    `Real scenario: you're at lunch and get a Pentarch TD alert on your phone. You open TradingView mobile, confirm the setup looks valid, then set a limit order on your broker app. Total time: 90 seconds. That's how mobile should work — review and respond, not hunt and chase.`
  ],

  // ── POST 280: Custom Color Schemes (5-tweet: single feature) ──
  280: [
    `Real impact: one trader switched from default colors to a high-contrast scheme where bullish signals are bright cyan and bearish are orange. They reported faster reads during volatile sessions because the colors stood out instantly against a dark chart background.`
  ],

  // ── POST 290: Troubleshooting Guide (5-tweet: single topic) ──
  290: [
    `When troubleshooting feels stuck: check if the issue is browser-specific. Open the same chart in Chrome and Firefox side by side. If one works fine, the problem is local to that browser — usually an extension conflict or cached data.`
  ],

  // ── POST 301: FAQ Compilation (5-tweet: single ref) ──
  301: [
    `The FAQ answer traders return to most: how non-repainting actually works. Every Signal Pilot indicator confirms on candle close. The signal you see in history is the exact signal that printed in real time. No retroactive edits, ever. Backtest what you see.`
  ],

  // ── POST 310: Keyboard Shortcuts (5-tweet: single feature) ──
  310: [
    `The workflow that demonstrates real shortcut mastery: Alt+H to mark a level, then press 1-5-D-W to verify that level exists on 1m, 5m, daily, and weekly. In 4 keystrokes you've validated a level across timeframes. That's seconds, not minutes.`
  ],

  // ── POST 320: Updating Indicators (5-tweet: single topic) ──
  320: [
    `Real scenario: you see a Signal Pilot update notification. Before removing the old version, you open the settings panel and take a phone screenshot. The remove-and-readd takes 20 seconds. If settings reset, the screenshot gets you back to your exact config in a minute.`
  ],

  // ── POST 330: Indicator Compatibility (5-tweet: single ref) ──
  330: [
    `Real discovery from users: Signal Pilot indicators produce some of the clearest signals on forex majors during London session. The statistical methods read any liquid market well, but high-volume sessions give especially clean data. Test across sessions.`
  ],

  // ── POST 340: Chart Layout Templates (6-tweet: advanced config) ──
  340: [
    `Real workflow: a swing trader saves three templates — "Weekly Review" with Pentarch + Janus Atlas on daily/weekly, "Setup Hunter" with Volume Oracle + Augury Grid, and "Execution" stripped to 15m Janus levels only. One click switches between analysis modes.`,
    `The template mistake that wastes the feature: saving one "everything" template. Templates work best when each one serves a specific purpose. Think of them like workspaces — you wouldn't run a spreadsheet and video editor in the same window.`
  ],

  // ── POST 350: Contact & Support (5-tweet: single topic) ──
  350: [
    `Real support shortcut: search the docs before messaging. Sounds obvious, but the search function covers settings, troubleshooting, and indicator behavior. Most "quick questions" have a documented answer that's faster to find than waiting for a reply.`
  ],

  // ── POST 360: Performance Optimization (6-tweet: performance optimization) ──
  360: [
    `Real scenario: a trader running 6 indicators on a single chart with 10,000 bars of history notices lag. They split into two charts — analysis chart with 3 indicators and execution chart with 2 — and the lag disappears. Same tools, better architecture.`,
    `The optimization mistake most users make: leaving dozens of browser tabs open alongside TradingView. Each tab consumes memory that your charts need. Close everything except TradingView during active sessions. Your CPU will thank you.`
  ],

  // ── POST 370: Mobile App Usage (5-tweet: single topic) ──
  370: [
    `Real scenario: a trader checks their phone, sees a Pentarch WRN alert on a position they hold, and texts themselves "tighten stop when at desk." That 10-second awareness check — without trading from the phone — saved them from a gap down the next day.`
  ],

  // ── POST 380: Alert Configuration (5-tweet: alert config) ──
  380: [
    `Real setup that saves hours: configure alerts for Pentarch TD and BDN on your top 5 assets, set to "Open-ended" expiration, with email + push notification. Once configured, you'll get notified of major cycle events indefinitely without ever recreating them.`
  ],

  // ── POST 390: Multi-Chart Layouts (6-tweet: multi-indicator workflow) ──
  390: [
    `Real workflow: before market open, glance at your 4-chart layout. Daily Pentarch tells you the cycle phase. 4H Volume Oracle tells you the regime. 1H Janus Atlas shows the nearest levels. 15m is clean for execution. Context established in 30 seconds.`,
    `The multi-chart mistake that adds noise instead of clarity: putting the same indicator on all 4 charts at different timeframes. Instead, use different indicators per chart so each panel answers a different question. Cycle, regime, levels, execution.`
  ],

  // ── POST 450: Indicator Settings Overview (6-tweet: advanced config) ──
  450: [
    `Real scenario: a forex trader switches from BTC to EUR/USD and notices too many signals. They lower sensitivity slightly and the signal quality improves immediately. Different assets have different character — settings should reflect that.`,
    `The settings mistake that undermines your edge: optimizing for past performance instead of readability. If you crank sensitivity until every historical move has a signal, you've curve-fit. Good settings should miss some moves. That's not a flaw — it's a filter.`
  ],

  // ── POST 460: Troubleshooting Common Issues (5-tweet: single topic) ──
  460: [
    `Real fix timeline: indicator not loading took 90 seconds to resolve by clearing cache and refreshing. Alert not firing took 30 seconds by deleting and recreating. Most Signal Pilot issues are TradingView platform issues, and the fixes are always simple.`
  ],

  // ── POST 470: Multi-Chart Layouts (6-tweet: multi-indicator) ──
  470: [
    `Real setup: a swing trader uses a 3-panel layout — daily Pentarch taking 50% of the screen, 4H Volume Oracle at 25%, and 1H Janus Atlas at 25%. The daily panel is largest because that's where the primary decisions happen. Sizing reflects priority.`,
    `The layout mistake that limits your analysis: syncing all charts to the same symbol. Use one panel for your target asset and another for a correlated or inverse asset. Seeing BTC and DXY side-by-side with different indicators reveals relationships raw charts miss.`
  ],

  // ── POST 480: Keyboard Shortcuts Guide (5-tweet: single feature) ──
  480: [
    `Real habit that compounds: every Monday, pick one new shortcut and use it exclusively all week. By Friday it's muscle memory. Alt+T this week. Alt+H next week. Tab for chart switching the week after. In a month you're visibly faster than traders using toolbars.`
  ],

  // ── POST 490: Mobile Access Guide (5-tweet: single topic) ──
  490: [
    `Real mobile workflow that works: check alerts twice a day — once during lunch, once before bed. If something triggered, note it. Plan your response for the next desktop session. This 2-minute habit keeps you informed without feeding the urge to overtrade.`
  ],

  // ── POST 501: Performance Optimization (6-tweet: performance optimization) ──
  501: [
    `Real test: one user cut chart load time in half by reducing historical bars from 20,000 to 5,000. Unless you're backtesting, you rarely need more than a few thousand bars. The last 500-1000 candles contain the relevant price structure for most strategies.`,
    `The optimization detail most traders ignore: browser hardware acceleration. Turning it on in Chrome settings lets your GPU handle chart rendering. If you have a decent graphics card, this single toggle can make TradingView noticeably smoother.`
  ],

  // ── POST 510: API & Webhook Integration (5-tweet: single feature) ──
  510: [
    `Real setup: a trading group pushes Pentarch phase alerts to a shared Discord channel via webhook. When TD fires on Bitcoin, the entire group sees it simultaneously. No one has to screen-share or type — the indicator speaks for itself. Setup took 5 minutes.`
  ],

  // ── POST 520: Frequently Asked Questions (5-tweet: single ref) ──
  520: [
    `The FAQ answer that saves the most money: "What TradingView plan do I need?" Essential plan works but limits indicators per chart. If you plan to stack 3+ Signal Pilot indicators, the Plus plan removes that friction. Factor it into your trading budget early.`
  ],

  // ── POST 530: Update History & Changelog (5-tweet: single topic) ──
  530: [
    `Real benefit of reading changelogs: one user discovered a new alert condition in Pentarch they didn't know existed. It was added two updates ago. They'd been manually checking for something the indicator could now alert them about automatically.`
  ],

  // ── POST 540: Contact & Support (5-tweet: single topic) ──
  540: [
    `Real support interaction that resolved in one reply: "Pentarch not showing signals on AAPL 15m." Screenshot attached showing the issue. Response: data subscription was delayed, not real-time. Fixed in TradingView settings. Screenshot made the diagnosis instant.`
  ],

  // ── POST 550: Best Practices Guide (6-tweet: full guide) ──
  550: [
    `Real practice that compounds: every Friday, review your 5 best and 5 worst trades of the week. Compare what Signal Pilot was showing at entry vs. exit. Within a month, patterns emerge that no one else can teach you — because they're YOUR patterns.`,
    `The best practice people resist most: reducing position size when indicators disagree. If Pentarch says IGN but Volume Oracle shows distribution, that conflict means uncertainty. Uncertainty doesn't mean "don't trade" — it means trade smaller until clarity returns.`
  ],

  // ── POST 560: Video Tutorial Library (5-tweet: single topic) ──
  560: [
    `Real learning hack: watch a setup tutorial for an indicator you already use. Even experienced users discover features they missed — a hidden setting, a visual cue they overlooked, or a workflow they hadn't considered. Familiarity isn't the same as mastery.`
  ],

  // ── POST 570: Glossary of Terms (5-tweet: single ref) ──
  570: [
    `When to reference the glossary: whenever you read "regime change" or "phase transition" in the docs and feel unsure. These terms have specific Signal Pilot definitions that differ from general trading jargon. Precision in language leads to precision in analysis.`
  ],

  // ── POST 580: System Requirements (5-tweet: single topic) ──
  580: [
    `Real optimization tip: if TradingView runs slow, open Chrome's task manager (Shift+Esc) and check which tabs or extensions consume the most memory. Disabling just one heavy extension can free up enough resources to make your charts responsive again.`
  ],

  // ── POST 590: Feedback & Feature Requests (5-tweet: single topic) ──
  590: [
    `Real feature that started as user feedback: enhanced alert conditions in Pentarch came directly from a community request. Someone asked "can I get an alert specifically for TD-to-IGN transitions?" Now you can. Your suggestions become everyone's tools.`
  ],

  // ── POST 600: Quick Start Guide (6-tweet: getting started) ──
  600: [
    `Real scenario: a new user spends 5 minutes on setup, then immediately sets a Pentarch TD alert on SPY. Three days later the alert fires. They open the chart, see the setup, and for the first time understand what "cycle bottom" actually looks like. That's the moment.`,
    `The quick start mistake that slows everything down: customizing colors, layouts, and settings before understanding what the indicators actually show. Use defaults for the first week. Learn what the tools DO before deciding how they should LOOK.`
  ],

  // ── POST 610: Upgrade Path Options (5-tweet: single ref) ──
  610: [
    `Real math that puts it in perspective: if the indicators help you avoid even one bad trade per month — a trade you would have taken without the data — the annual plan pays for itself multiple times over. The cost of bad entries always exceeds the cost of good tools.`
  ],

  // ── POST 620: Asset Compatibility (5-tweet: single ref) ──
  620: [
    `Real discovery: users running Signal Pilot on VIX found that Pentarch cycle phases map volatility expansion and contraction with surprising clarity. The indicators don't know what they're reading — they just read price structure. That universality is the point.`
  ],

  // ── POST 630: Getting Started (6-tweet: getting started) ──
  630: [
    `Real scenario: a trader follows these 4 steps and is charting within 5 minutes. But the real value comes 15 minutes later when they load the preset layout and realize every indicator has a purpose and placement they didn't have to figure out from scratch.`,
    `The getting-started mistake that creates confusion: changing settings before understanding what defaults do. The presets were configured by experienced users. Give them a full trading week before adjusting. You'll make smarter customizations with that context.`
  ],

  // ── POST 640: Troubleshooting (5-tweet: single topic) ──
  640: [
    `When none of the quick fixes work: check TradingView's status page at status.tradingview.com. Platform-wide issues affect all indicators equally. If the status page shows degraded performance, wait it out instead of reinstalling everything unnecessarily.`
  ],

  // ── POST 648: Documentation Overview (6-tweet: full guide) ──
  648: [
    `Real usage pattern: bookmark three doc pages — your primary indicator's settings page, the troubleshooting guide, and the alert setup guide. Those three pages answer 90% of the questions that come up during active trading. Everything else is reference.`,
    `What most users discover too late about the docs: the examples section on each indicator page. Settings and signal meanings are useful, but seeing annotated chart examples of each signal in context is what makes the information actionable. Start there.`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  let fiveTweet = 0;
  let sixTweet = 0;

  for (const post of queue) {
    const d = deepens[post.postNumber];
    if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 4) {
      const tweets = post.twitter.tweets;
      const cta = tweets.pop(); // Remove last tweet (CTA)
      tweets.push(...d);        // Add 1-2 new tweets
      tweets.push(cta);         // Put CTA back at end
      post.twitter.tweets = tweets;
      updated++;
      if (d.length === 1) fiveTweet++;
      if (d.length === 2) sixTweet++;
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log('Docs deepen: ' + updated + ' posts expanded');
  console.log('  -> ' + fiveTweet + ' posts expanded to 5 tweets');
  console.log('  -> ' + sixTweet + ' posts expanded to 6 tweets');
}

main();
