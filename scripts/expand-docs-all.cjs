#!/usr/bin/env node
/**
 * Expand ALL Docs posts from 3 tweets to 4 tweets.
 *
 * Docs posts are reference-oriented (settings, guides, cheatsheets, how-to).
 * They get 4 tweets (not 5) because the content is instructional, not narrative.
 *
 * Structure:
 *   tweet[0] = Hook (existing)
 *   tweet[1] = What it covers / key info (existing)
 *   tweet[2] = NEW: Pro tip, power user insight, or "what most users miss"
 *   tweet[3] = CTA (existing tweet[2], moved to position 4)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const expansions = {

  // ── 10  Pentarch Cheatsheet ──
  10: `Pro tip: TD and BDN are the bookend signals. When TD fires after a BDN sequence, that full-cycle reset is the highest-conviction reversal setup in Pentarch. Save charts where this happens — you'll start recognizing it in real time.`,

  // ── 30  Quick Start Guide ──
  30: `What most new users miss: don't add all 7 indicators on day one. Information overload kills learning speed. One indicator, one week, one journal. That focused approach builds intuition faster than any shortcut.`,

  // ── 40  Plutus Flow Cheatsheet ──
  40: `Power user move: watch for Plutus Flow rising while price consolidates sideways. That hidden accumulation often precedes the strongest breakouts. The cheatsheet covers the obvious combos — this is the one most traders overlook.`,

  // ── 50  Quick Start Checklist ──
  50: `One thing that separates traders who stick from those who quit: paper trading long enough to prove consistency. Most skip straight to live. The checklist says paper trade for a reason — it protects your capital while you build the skill.`,

  // ── 60  Harmonic Oscillator Settings ──
  60: `What experienced users do: run two instances on the same chart. One fast, one slow. When both agree on direction, conviction is high. When they diverge, something is shifting. The settings guide shows the exact parameters.`,

  // ── 70  Janus Atlas Timeframe Guide ──
  70: `What power users notice: higher-timeframe levels from Janus Atlas often act as magnets. Price doesn't just bounce — it gets pulled toward weekly levels even on intraday charts. Prioritize those levels in your analysis.`,

  // ── 80  Pentarch Signal Meanings ──
  80: `The signal most traders undervalue: WRN. It's easy to dismiss early weakness as noise. But WRN appearing after IGN is Pentarch telling you momentum is fading before the crowd notices. That's your edge for scaling out of longs.`,

  // ── 90  Volume Oracle Settings ──
  90: `What most traders skip: calibrating sensitivity to the specific asset. BTC needs different settings than SPY. Start with defaults, then adjust sensitivity based on how often you see regime changes. Too many? Lower it. Too few? Raise it.`,

  // ── 100  Getting Started Workflow ──
  100: `The workflow step people skip that matters most: reviewing your trades weekly. It's not glamorous, but 15 minutes of honest review teaches more than 15 hours of chart time. Build the review habit from day one.`,

  // ── 110  Augury Grid Symbol Setup ──
  110: `The setup detail that changes everything: group correlated assets separately. Scanning BTC, ETH, and SOL together gives you one signal repeated three times. Scan uncorrelated pairs to maximize the number of independent opportunities.`,

  // ── 120  Plutus Flow Divergence Guide ──
  120: `Advanced insight: not all divergences are equal. Divergence on a higher timeframe (4H or daily) is far more significant than on the 15m. When you spot it, zoom out first. If the higher TF agrees, the setup carries real weight.`,

  // ── 130  Indicator Combinations ──
  130: `What experienced traders discover: the combinations above aren't just pairings — they're confirmation layers. When two indicators from different categories agree (cycle + flow, or regime + momentum), the signal reliability jumps significantly.`,

  // ── 140  Troubleshooting Guide ──
  140: `Fastest fix most people overlook: save your indicator settings as a TradingView default BEFORE troubleshooting. That way if you need to remove and re-add, you won't lose your custom configuration. Takes 10 seconds, saves real frustration.`,

  // ── 150  Keyboard Shortcuts ──
  150: `The shortcut that saves the most time: pressing a number key to switch timeframes instantly. No clicking, no menus. Multi-timeframe analysis becomes fluid when your hands never leave the keyboard. Practice this first.`,

  // ── 160  OmniDeck Layout Customization ──
  160: `What power users do with OmniDeck: create separate saved layouts for each strategy. A swing layout with Pentarch + Janus Atlas visible, a scalp layout stripped to essentials. Switching between them takes one click instead of reconfiguring every time.`,

  // ── 170  Pentarch Alert Conditions ──
  170: `The alert combination most users miss: set both TD and BDN alerts simultaneously. TD fires at potential bottoms, BDN at confirmed breakdowns. Together they bracket the reversal zone — you'll know when the cycle is resetting without watching the chart.`,

  // ── 180  Indicator Update Log ──
  180: `What most users don't realize: after an update, your existing chart instances auto-update. No manual action needed. But if you saved custom defaults, verify they carried over. A quick settings check after updates keeps everything running smoothly.`,

  // ── 181  Education Hub Spotlight ──
  181: `The hidden value most people miss: the lessons build on each other deliberately. Jumping to Advanced before finishing Intermediate creates knowledge gaps that hurt later. The sequence matters — trust the curriculum order.`,

  // ── 190  FAQ - Common Questions ──
  190: `The FAQ answer that surprises most people: the indicators work on ANY TradingView asset, including lesser-known markets like commodities and indices. If it has a chart on TradingView, Signal Pilot reads it. No restrictions by asset class.`,

  // ── 200  Best Practices Guide ──
  200: `The practice most traders resist but the best traders swear by: journaling every trade. Not just entries and exits — the WHY behind each decision. Pattern recognition comes from reviewing your own data, not just studying charts.`,

  // ── 210  Indicator Comparison Chart ──
  210: `What the comparison doesn't show: the real power is in the gaps between indicators. Pentarch tells you the cycle, Volume Oracle tells you conviction. One without the other leaves a blind spot. Choose combinations that cover different angles.`,

  // ── 220  Alert Notification Options ──
  220: `Pro tip: use webhook alerts to log every signal to a Google Sheet automatically. Over time, you build a personal database of what worked and what didn't — filterable by indicator, timeframe, and asset. That data becomes your edge.`,

  // ── 230  Performance Optimization ──
  230: `The optimization most people miss: TradingView loads faster with fewer bars visible. Go to Chart Settings and reduce the number of bars loaded. You rarely need 10,000 bars of history for intraday analysis. Cut it down and watch the speed improve.`,

  // ── 240  Multi-Monitor Setup ──
  240: `What matters more than monitor count: consistent layout placement. Put the same information in the same spot every day. Your brain builds spatial memory for where to look. Muscle memory applies to chart reading too, not just keyboard shortcuts.`,

  // ── 250  Indicator Stacking Guide ──
  250: `The stacking mistake to avoid: adding indicators that measure the same thing. Two momentum tools don't give you twice the insight — they give you redundant data. Stack across categories (cycle + flow + levels) for genuine multi-dimensional analysis.`,

  // ── 260  Alert Setup Guide ──
  260: `The alert strategy that changed how experienced users trade: set alerts on the HIGHER timeframe, then drop down to execute. A daily Pentarch TD alert tells you when to start looking. Then switch to the 1H to find the actual entry. Eliminates noise.`,

  // ── 270  Mobile Trading Setup ──
  270: `Best mobile practice: use your phone exclusively for alert monitoring and setup review. Never execute trades from mobile during a commute or distraction. The traders who treat mobile as a watchtower, not a trading desk, make better decisions.`,

  // ── 280  Custom Color Schemes ──
  280: `Underrated customization: match your bullish and bearish colors across ALL indicators. When green always means bullish everywhere on your chart, your brain processes information faster. Consistent colors reduce cognitive load during fast-moving markets.`,

  // ── 290  Troubleshooting Guide ──
  290: `The fix that resolves most display issues instantly: right-click the indicator on your chart, select "Reset settings," then re-apply your saved defaults. This clears corrupted visual state without losing your preferred configuration.`,

  // ── 301  FAQ Compilation ──
  301: `The FAQ entry people read most: "Do indicators repaint?" Answer is no, never. Every signal confirms on candle close. What you see in history is exactly what appeared in real time. That's a hard line for us.`,

  // ── 310  Keyboard Shortcuts ──
  310: `The shortcut combination that saves the most time daily: Alt+H to drop a horizontal line, then number keys to flip through timeframes. You can mark levels and verify them across multiple timeframes in seconds instead of minutes.`,

  // ── 320  Updating Indicators ──
  320: `Pro tip: before removing an old indicator version, screenshot your current settings. TradingView sometimes resets custom parameters on re-add. A quick screenshot means you can restore your exact configuration in 30 seconds.`,

  // ── 330  Indicator Compatibility ──
  330: `What most traders don't test: Signal Pilot works on exotic pairs and low-volume assets too. The statistical methods adapt to available data. If TradingView charts it and there's reasonable volume, the indicators will read it accurately.`,

  // ── 340  Chart Layout Templates ──
  340: `Power user workflow: create a template for each market session. A pre-market template with wider timeframes and levels. An active-session template with your execution indicators. An end-of-day review template. One click to switch context.`,

  // ── 350  Contact & Support ──
  350: `What gets the fastest support response: a screenshot of the issue plus your TradingView username plus the indicator name. Those three things let us diagnose the problem immediately instead of going back and forth asking for details.`,

  // ── 360  Performance Optimization ──
  360: `The single biggest performance gain: limit indicators to 3-4 per chart maximum. Each indicator uses browser memory. If you need more views, use TradingView's multi-chart layout feature — separate charts are more efficient than stacking 8 indicators on one.`,

  // ── 370  Mobile App Usage ──
  370: `The mobile habit that protects most traders: set a rule that you can check alerts and review setups on your phone, but never place a trade from it. Mobile execution leads to impulsive entries. Use the phone for awareness, the desktop for action.`,

  // ── 380  Alert Configuration ──
  380: `What veteran users configure: alert expiration set to "Open-ended" instead of the default. Default alerts expire after a set period. Open-ended alerts stay active until you cancel them. Set it once, forget about re-creating it every month.`,

  // ── 390  Multi-Chart Layouts ──
  390: `The layout setup that gives the most context: top-left daily chart with Pentarch, top-right 4H with Volume Oracle, bottom-left 1H with Janus Atlas levels, bottom-right 15m for execution. Four charts, four timeframes, complete picture.`,

  // ── 450  Indicator Settings Overview ──
  450: `What separates good settings from great ones: testing on YOUR specific assets and timeframes. Default settings work broadly, but 20 minutes of backtesting on the charts you actually trade will show you exactly which adjustments matter most.`,

  // ── 460  Troubleshooting Common Issues ──
  460: `The troubleshooting step that fixes 90% of alert issues: delete the alert completely and recreate it from scratch. Editing existing alerts after indicator updates can leave stale conditions. A fresh alert takes 30 seconds and eliminates the guesswork.`,

  // ── 470  Multi-Chart Layouts ──
  470: `The layout insight most traders learn too late: put your highest timeframe in the largest panel. Your primary analysis chart deserves the most screen space. Execution charts can be smaller — you only glance at them for timing.`,

  // ── 480  Keyboard Shortcuts Guide ──
  480: `The habit that separates fast analysts from everyone else: learn 3 shortcuts per week until they're automatic. Don't try to memorize 20 at once. Three at a time, practiced until muscle memory. In two months you'll never touch the toolbar again.`,

  // ── 490  Mobile Access Guide ──
  490: `The mobile feature most people underuse: TradingView push alerts. Configure them once on desktop, receive instant notifications on your phone. You don't need to open the app to stay informed — let the alerts come to you.`,

  // ── 501  Performance Optimization ──
  501: `The optimization trick almost nobody uses: create a separate TradingView chart layout just for scanning (Augury Grid only, no drawings, minimal history). Keep your analysis layouts clean and your scanning layout lean. Separate concerns, better performance.`,

  // ── 510  API & Webhook Integration ──
  510: `Advanced workflow: use TradingView webhooks to push Signal Pilot alerts to a Telegram channel or Discord server. Your entire team or trading group gets notified simultaneously. The webhook URL setup takes under 5 minutes in TradingView's alert dialog.`,

  // ── 520  Frequently Asked Questions ──
  520: `The question people forget to ask: "What TradingView plan do I need?" Any paid plan works. Essential, Plus, Premium, or Expert. The free plan has indicator limits. If you're serious about using multiple indicators, Plus or higher is worth it.`,

  // ── 530  Update History & Changelog ──
  530: `What smart users do after reading the changelog: test any updated indicator on a demo chart first. Not because updates break things — they don't — but because new features might change your workflow for the better. You want to discover that deliberately.`,

  // ── 540  Contact & Support ──
  540: `How to get the best support experience: describe what you expected to happen, what actually happened, and include a screenshot. Those three things turn a 5-email thread into a one-reply solution. Specific details make everything faster.`,

  // ── 550  Best Practices Guide ──
  550: `The best practice people acknowledge but rarely follow: reviewing their losing trades. Winners feel good, losers get ignored. But your losing trades contain more actionable information than your winners. Study what went wrong. That's where the edge hides.`,

  // ── 560  Video Tutorial Library ──
  560: `How to get the most from the video library: watch at 1x speed the first time, then bookmark the key moments. Come back at 1.5x for review. The setup tutorials are especially worth rewatching after you've used the indicator for a week — details click differently.`,

  // ── 570  Glossary of Terms ──
  570: `How experienced traders use the glossary: not just for definitions, but to align language. When the docs say "regime" or "phase," those terms have specific meanings in Signal Pilot. Knowing the exact definitions prevents misreading the signals.`,

  // ── 580  System Requirements ──
  580: `The system detail most people overlook: browser extensions can slow TradingView significantly. Ad blockers, VPNs, and heavy extensions compete for memory. If performance lags, try a clean browser profile with just TradingView. The difference is noticeable.`,

  // ── 590  Feedback & Feature Requests ──
  590: `What makes a feature request get prioritized: specificity. "Make it better" is hard to act on. "Add an alert condition for when Pentarch transitions from WRN to CAP" is something we can build. Concrete suggestions move fastest through our pipeline.`,

  // ── 600  Quick Start Guide ──
  600: `The step people rush past: setting your first alert. Most traders add indicators and then stare at charts manually. Set one alert on your very first session. It changes your entire relationship with the tools — from active watching to informed responding.`,

  // ── 610  Upgrade Path Options ──
  610: `What most traders discover: the yearly plan pays for itself if you trade even part-time. At $399/year, that's roughly $33/month for 7 professional-grade indicators, 82 lessons, and continuous updates. Compare that to a single losing trade from bad tools.`,

  // ── 620  Asset Compatibility ──
  620: `What power users test: Signal Pilot on assets you wouldn't expect. Agricultural futures, bond ETFs, volatility indices. The statistical methods don't care about the asset class — they read price structure and volume. Some of the cleanest signals come from overlooked markets.`,

  // ── 630  Getting Started Steps ──
  630: `The step that makes everything smoother: load a preset layout before configuring anything custom. Presets give you a working baseline immediately. Then customize from a functional starting point instead of building from scratch on a blank chart.`,

  // ── 640  Indicator Not Loading Fixes ──
  640: `The fix nobody tries first but should: check if TradingView itself is having issues. Visit TradingView's status page before troubleshooting your end. If the platform is degraded, no amount of cache clearing will help. Rule out the obvious first.`,

  // ── 648  Documentation Overview ──
  648: `How to navigate the docs efficiently: use the search function rather than browsing. Every indicator page follows the same structure — overview, settings, signals, examples. Once you learn one layout, you can find what you need in any indicator's docs in seconds.`,

};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;

  for (const post of queue) {
    const newTweet = expansions[post.postNumber];
    if (newTweet && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;
      // Insert new tweet before the CTA (last tweet)
      post.twitter.tweets = [tweets[0], tweets[1], newTweet, tweets[2]];
      updated++;
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Docs expansion: ${updated} posts expanded from 3→4 tweets`);
}

main();
