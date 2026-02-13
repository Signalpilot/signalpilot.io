#!/usr/bin/env node
/**
 * Expand education posts (302+) from 3 tweets to 5 tweets.
 * Inserts two new tweets before the CTA:
 *   tweet[0] = Hook (existing)
 *   tweet[1] = Core concept (existing)
 *   tweet[2] = NEW: Practical example / real-world application
 *   tweet[3] = NEW: Common mistake / pro tip
 *   tweet[4] = CTA (existing, moved from position 2)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const expansions = {

  // ── 302: Trend Identification ──
  302: [
    `Pull up any chart right now. Find the most recent swing high and swing low. Is each one higher or lower than the previous? That single observation tells you the trend on that timeframe.`,
    `Common mistake: switching between bullish and bearish bias every time a single candle goes against you. Trends don't reverse on one candle. Wait for a structural break before flipping your bias.`
  ],

  // ── 306: Risk-Reward Ratios ──
  306: [
    `Say your stop is $50 below entry and your target is $100 above. That's 1:2. If you win just 4 out of 10 trades, you still net $200 profit. The math works even with a losing record.`,
    `Pro tip: don't force a 1:3 ratio by setting unrealistic targets. A 1:1.5 setup you actually hit beats a 1:5 target you never reach. Let the chart define the target, then check if the math works.`
  ],

  // ── 312: Timeframe Selection ──
  312: [
    `Working a 9-to-5? You probably can't watch 1-minute charts. The daily and 4H give you setups you can manage with end-of-day check-ins. Match the chart to your calendar, not the other way around.`,
    `Mistake most beginners make: dropping to a lower timeframe "for more trades." More trades means more noise, more commissions, more screen time, and usually more losses. Start higher, go lower only with experience.`
  ],

  // ── 329: Stop Loss Placement ──
  329: [
    `Example: you're long at a support bounce. Place your stop below that support zone, not just below your entry candle. If support breaks, your thesis is invalid and you should be out.`,
    `Pro tip: if you can't afford the stop distance with your risk rules, the trade isn't for you at that position size. Shrink the size, don't shrink the stop. A tight stop in the wrong place costs more.`
  ],

  // ── 342: Moving Averages Basics ──
  342: [
    `Try this: add the 200 SMA to a daily chart. Notice how often price respects it as dynamic support or resistance. Institutional traders watch it, so it becomes a self-fulfilling reference point.`,
    `Mistake: treating a moving average touch as an automatic entry. The MA is a filter, not a signal. Price near the 200 SMA means "pay attention here," not "buy here." Add a trigger before entering.`
  ],

  // ── 361: Why Education First ──
  361: [
    `A trader who understands structure, risk, and psychology will get value from any indicator. A trader who skips education will blame every tool for their losses. The tool isn't the problem.`,
    `Pro tip: before buying any indicator or course, exhaust the free resources first. If you can't be disciplined with free education, paid education won't change that. Commitment comes before investment.`
  ],

  // ── 366: Entry Techniques ──
  366: [
    `Real-world example: you want to enter at a demand zone. A limit order at the zone top gets you in if price taps it. A stop order above the zone waits for a breakout. Different risk profiles for the same zone.`,
    `Common mistake: always using market orders. You're paying the spread and accepting slippage every time. For non-urgent entries, a limit order at your planned level saves money across hundreds of trades.`
  ],

  // ── 369: Chart Patterns Overview ──
  369: [
    `Example: a symmetrical triangle on the 4H chart during an uptrend. Price compresses, then breaks upward with volume. The pattern gave you a defined entry, stop (below the triangle), and target.`,
    `Mistake: memorizing 30 patterns without understanding the logic behind any of them. Patterns are just supply and demand visualized. Understand the pressure, not just the shape.`
  ],

  // ── 372: Risk Per Trade ──
  372: [
    `A $25,000 account at 1% risk means $250 per trade. If your stop is 50 pips, that's $5 per pip. This calculation should happen BEFORE you enter, every single time. No exceptions.`,
    `The trap: risking 1% per trade but taking 10 correlated trades. That's not 1% risk, that's 10% exposure. Position count matters as much as position size. Track total open risk, not just per-trade risk.`
  ],

  // ── 376: Trade Management ──
  376: [
    `Scenario: you're up 1.5R on a swing trade. Move stop to breakeven, take 30% off. Now the trade is risk-free and you still have 70% riding for a larger move. That's management in action.`,
    `Common mistake: moving your stop to breakeven too early. Price needs room to breathe. If your stop is 2 pips from entry, normal volatility will stop you out of a winning trade. Give it structure room.`
  ],

  // ── 389: Indicator Settings Explained ──
  389: [
    `Example: a 14-period RSI scans 14 candles. On a daily chart, that's 14 days. On a 5-minute chart, that's 70 minutes. Same setting, completely different context. Always consider the timeframe.`,
    `Pro tip: resist the urge to optimize settings until you've tested the defaults on at least 100 trades. Default settings exist for a reason. Over-optimization creates an indicator that works on past data but fails live.`
  ],

  // ── 391: 400 Posts Approaching ──
  391: [
    `From candlestick basics to smart money concepts, Wyckoff schematics to trading psychology. Every post has been about building real understanding, not selling shortcuts.`,
    `What's ahead: deeper dives into advanced concepts, more real-chart examples, and continued daily education. The best posts are still being written.`
  ],

  // ── 392: Market Types ──
  392: [
    `Open a chart and ask: is this trending, ranging, or volatile? Use a moving average slope for trend, Bollinger Bands width for volatility, and ADX for strength. Classify the market before choosing a strategy.`,
    `Mistake: using a trend-following strategy in a range. You'll get chopped up buying breakouts that fail and selling breakdowns that reverse. Match the tool to the environment.`
  ],

  // ── 394: The Process Is the Goal ──
  394: [
    `Practical test: after each trade, grade your execution 1-10 regardless of the result. Did you follow your rules? Did you size correctly? A losing trade with perfect execution scores higher than a lucky win.`,
    `Trap to avoid: changing your process after every losing trade. If you tested and validated it, a few losses don't invalidate it. Consistency over a sample is what matters, not any single result.`
  ],

  // ── 396: Journaling for Improvement ──
  396: [
    `After 30 journal entries, review them. You'll find patterns: maybe you lose on Mondays, or your afternoon trades underperform, or you always exit winners too early. The data reveals what instinct hides.`,
    `Mistake most traders make: only journaling losses. Wins contain just as much information. Did you follow the plan? Was the entry optimal? Could you have held longer? Analyze both sides equally.`
  ],

  // ── 399: Community Guidelines ──
  399: [
    `In practice, this means: share your analysis, explain your reasoning, and ask real questions. "Why did this level hold?" teaches more than "I made $500 today." Process over P&L screenshots.`,
    `Pro tip: the fastest way to learn is to teach. Explain a concept you just learned to someone else. If you can't explain it clearly, you don't understand it well enough yet.`
  ],

  // ── 400: 400 Posts Milestone ──
  400: [
    `What 400 posts taught us: consistency beats brilliance. Showing up daily with real education compounds into something bigger than any single viral post ever could.`,
    `To anyone just finding us: start from the education hub. Go through the lessons in order. 82 structured lessons beat 400 random threads. The threads are supplements, not the curriculum.`
  ],

  // ── 401: Looking Ahead ──
  401: [
    `Upcoming focus areas: real chart breakdowns showing concepts in action. Theory is useful but seeing it on a live chart is where understanding clicks. Expect more "here's what happened and why."`,
    `If you've been following along, you already have a foundation most traders never build. Now the work shifts from learning concepts to applying them consistently. That's where the real growth starts.`
  ],

  // ── 402: Wyckoff Accumulation Schematic ──
  402: [
    `On a real chart, look for a sharp selloff (SC), a bounce (AR), then a retest that holds above the low (ST). When price dips below the ST then snaps back, that's the Spring. The setup is forming.`,
    `Common mistake: labeling every consolidation as Wyckoff accumulation. Not every range is accumulation. Look for the telltale volume patterns: climax volume at the SC, declining volume into the Spring.`
  ],

  // ── 404: Small Consistent Wins ──
  404: [
    `Consider two traders: one makes 0.5% per trade with 60% win rate. Over 200 trades, that's a 20% return with minimal drawdown. The other swings for 5% per trade and blows up on a bad streak.`,
    `Pro tip: track your consistency ratio (profitable weeks / total weeks). If you're profitable 3 out of 4 weeks, even modestly, you're building a sustainable career. Spiky returns mean spiky emotions.`
  ],

  // ── 406: Wyckoff Distribution Schematic ──
  406: [
    `Real-world application: in crypto, the BC (buying climax) often coincides with peak social media hype. Everyone is euphoric. Smart money is distributing to those buyers. By the time the SOW hits, retail is trapped.`,
    `Mistake: seeing a UTAD and thinking "breakout." The UTAD is designed to look like a breakout. It triggers buy orders and stops, providing liquidity for smart money to sell into. Verify with volume first.`
  ],

  // ── 407: The Myth of Trading Secrets ──
  407: [
    `The same moving average crossover strategy that "doesn't work" for most traders makes money for the few who pair it with discipline, sizing, and patience. The strategy isn't the variable. You are.`,
    `Pro tip: stop searching for the perfect strategy and start perfecting your execution of a good one. One well-managed setup traded 1,000 times beats ten "secret" setups traded sloppily.`
  ],

  // ── 409: ICT Concepts Overview ──
  409: [
    `Practical approach: start with one concept, like order blocks. Identify them on a chart for two weeks without trading. Then add FVGs. Layer concepts gradually instead of trying to learn everything at once.`,
    `Mistake: treating ICT concepts as guaranteed signals. An order block in the wrong context is just a candle. These concepts are tools for building a narrative, not standalone trade entries.`
  ],

  // ── 410: Multi-Chart Layouts ──
  410: [
    `Example layout: left panel shows the daily chart for bias. Top right shows the 4H for structure. Bottom right shows the 1H for entry timing. Three views of the same asset, complete context at a glance.`,
    `Pro tip: don't clutter every chart with the same indicators. Use the daily for trend indicators, the 4H for level-based tools, and the 1H for momentum. Each timeframe has a job. Let it do that job clearly.`
  ],

  // ── 411: Education Hub Depth ──
  411: [
    `The curriculum is sequential for a reason. Lesson 40 builds on lesson 20 which builds on lesson 5. Jumping to advanced SMC concepts without understanding basic structure is building a house without a foundation.`,
    `Pro tip: go through the lessons even if you think you know the topic. Most traders overestimate their understanding of basics. The beginner section has subtleties that experienced traders still miss.`
  ],

  // ── 412: Market Structure Shift (MSS) ──
  412: [
    `On a 4H chart: uptrend makes HH/HL consistently. Then a lower low prints, breaking below the last HL. That's the MSS. From here, look for the first pullback to short, not to buy the dip.`,
    `Common mistake: calling every pullback in a trend an MSS. A pullback within structure is normal. An MSS breaks the structure. The difference is whether the previous swing point is violated or held.`
  ],

  // ── 414: Trust Your Preparation ──
  414: [
    `Before market open: levels marked, scenarios defined, risk calculated, alerts set. When the setup triggers during the session, execute. That's what preparation looks like in action.`,
    `Mistake: preparing well but then second-guessing in the moment. If your pre-market analysis said "long at this level with this stop," don't talk yourself out of it because the candle looks scary. Trust the work.`
  ],

  // ── 416: Change of Character (ChOCH) ──
  416: [
    `Real chart example: after a clean downtrend with LH/LL, price suddenly makes a higher high. That single break is the ChOCH. It doesn't confirm reversal yet, but it says "the sellers are losing grip."`,
    `Mistake: trading the ChOCH aggressively as if reversal is confirmed. ChOCH is a warning, not a green light. Wait for a follow-up: a higher low, a BOS, or price retesting and holding the broken level.`
  ],

  // ── 417: The Cost of Perfectionism ──
  417: [
    `You skip a valid setup because one indicator disagreed. Price moves 200 pips without you. Next time you enter without any confirmation to compensate. That's the perfectionism-to-recklessness cycle.`,
    `Pro tip: define "good enough" in your trading plan. 3 out of 4 confluence factors = good enough to trade. Waiting for 4 out of 4 means you trade once a month and miss the other setups that would have worked.`
  ],

  // ── 419: Break of Structure (BOS) ──
  419: [
    `On a 1H chart: uptrend in progress. Price pulls back, forms a higher low, then pushes above the previous high. That new higher high is the BOS. It confirms the uptrend is continuing. Stay with it.`,
    `Common mistake: confusing BOS with MSS. BOS confirms the current trend direction. MSS signals it may be changing. They're opposite conclusions. Make sure you know which you're looking at.`
  ],

  // ── 420: Backtesting in TradingView ──
  420: [
    `Workflow: open Bar Replay, pick a date 6 months ago, and trade your strategy forward. Log every entry, exit, and result. After 50 replayed trades, you'll know your win rate and average R:R before risking a dollar.`,
    `Mistake: replaying only the "interesting" parts. You need to sit through the boring, choppy sessions too. Those are where most losses happen, and your backtest needs to include them to be honest.`
  ],

  // ── 421: Indicator Integration ──
  421: [
    `Example combo: Pentarch shows cycle turning up. Volume Oracle confirms expansion regime. Janus Atlas highlights the key level below. Three indicators, three independent data points, one clear trade thesis.`,
    `Pro tip: don't stack indicators that measure the same thing. Three momentum tools is one opinion repeated. One momentum tool plus one volume tool plus one level tool gives you three independent perspectives.`
  ],

  // ── 422: Liquidity Concepts ──
  422: [
    `Open any chart with equal highs visible. Watch what happens when price approaches them. It often spikes through, triggering buy stops, then reverses. That's liquidity being hunted. You just watched the trap.`,
    `Mistake: placing your stop loss right at an obvious swing low or high. That's exactly where liquidity sits. Give your stop extra room beyond the obvious level, or you'll get swept before the move happens.`
  ],

  // ── 426: Order Flow Basics ──
  426: [
    `When price drops to a level and volume spikes but price doesn't move lower, that's absorption. Buyers are absorbing the selling pressure at that level. The footprint tells you someone is defending that price.`,
    `Pro tip: you don't need Level 2 data or a DOM to read basic order flow. Volume bars, delta analysis, and price behavior at key levels tell you most of what you need. Start simple.`
  ],

  // ── 429: Imbalance & Fair Value Gaps ──
  429: [
    `Find a recent strong move on a 15-minute chart. Look for three candles where the middle one's body is large and there's no overlap between candle 1's high and candle 3's low. That gap is your FVG.`,
    `Pro tip: not every FVG is worth trading. An FVG inside a discount zone in a bullish trend is high probability. An FVG in the middle of nowhere with no supporting context is just a gap that may or may not fill.`
  ],

  // ── 430: Alert Configuration ──
  430: [
    `Practical setup: configure a Volume Oracle alert for regime change. When the market shifts from contraction to expansion, you get a notification. Now you're watching charts when it matters, not all day.`,
    `Pro tip: set alerts at your pre-planned levels the night before. When the alert fires, you already know the plan. This removes the need to stare at screens and the emotion of watching every tick.`
  ],

  // ── 431: Free Education Access ──
  431: [
    `The education hub covers everything from candlestick basics to Wyckoff schematics to smart money concepts. Each lesson builds on the last. It's the same content others charge hundreds for, free and structured.`,
    `Pro tip: bookmark the curriculum page and track your progress. Treat it like a course, not casual reading. Finish one lesson per day. In 82 days you'll have a foundation most traders never build.`
  ],

  // ── 432: Inducement & Trap Setups ──
  432: [
    `Watch a 15-minute chart around London open. Price breaks above a minor high, traders go long, then price reverses and drops hard. Those long entries became exit liquidity for the real move down.`,
    `Pro tip: when you see a level break with weak follow-through (low volume, immediate stall), be suspicious. Real breakouts have displacement and volume. Weak breaks are often inducement setups in disguise.`
  ],

  // ── 436: Premium & Discount Zones ──
  436: [
    `Draw a fib from the most recent swing low to swing high. Below the 50% level is the discount zone. If you're bullish, that's where you want your entries. Buying in discount means better R:R automatically.`,
    `Common mistake: buying at the top of a move because "the trend is up." Yes, the trend is up, but you're in the premium zone. Wait for a pullback into discount. Patience improves your entry and your math.`
  ],

  // ── 439: Mitigation Blocks ──
  439: [
    `Example: a rally starts from $100, runs to $120, then drops back to $95. When price eventually returns to $100-$105, trapped buyers from that initial rally exit at breakeven. That selling creates the reaction zone.`,
    `Pro tip: mitigation blocks often produce weaker reactions than fresh order blocks. Institutions are exiting, not building new positions. Expect a pause or a partial move, not necessarily a full reversal.`
  ],

  // ── 440: Timeframe Selection Guide ──
  440: [
    `Simple test: pick a timeframe and trade it for 30 days. If you feel rushed, go higher. If you feel bored, go lower. Your emotional comfort with the pace matters more than what any guru recommends.`,
    `Mistake: using a low timeframe because you think more trades equals more money. More trades often equals more fees, more stress, and more mistakes. Higher timeframes give you time to think and execute clearly.`
  ],

  // ── 442: Breaker Blocks ──
  442: [
    `Chart example: a bullish order block at $50 gets broken as price drops to $45. When price rallies back to $50-$52, that former support acts as resistance. The buyers who failed there are now selling to escape.`,
    `Pro tip: breaker blocks work best when they align with other resistance or supply factors. A breaker block at a Fibonacci level or inside a premium zone increases the probability of a reaction.`
  ],

  // ── 446: Optimal Trade Entry (OTE) ──
  446: [
    `Setup: uptrend, price pulls back. You draw a fib from the swing low to the swing high. Price enters the 62-79% zone, and there's an order block sitting right there. Enter with a tight stop below the OB.`,
    `Mistake: forcing OTE on every pullback. If the pullback only reaches 38% and bounces, it wasn't an OTE setup. That's fine. Let it go. OTE is one entry model, not the only entry model.`
  ],

  // ── 449: Swing Failure Pattern (SFP) ──
  449: [
    `Watch for this on any timeframe: price sweeps above a previous swing high, but the candle closes back below that high. Shorts from that level have a clear stop (above the sweep wick) and a logical thesis.`,
    `Pro tip: the most reliable SFPs happen at significant levels, not random swings. A swing failure at a weekly high carries more weight than one at a minor intraday swing. Level significance matters.`
  ],

  // ── 452: Wyckoff Accumulation (deeper) ──
  452: [
    `How to trade it: identify the selling climax (high volume, sharp drop). Wait for the automatic rally and secondary test. When the Spring occurs (dip below range on low volume), look for the test to confirm.`,
    `Mistake: trying to buy the selling climax. That's catching a falling knife. Wait for the Spring and the subsequent test. The Spring is designed to shake out weak hands. Don't be one of them.`
  ],

  // ── 456: Wyckoff Distribution (deeper) ──
  456: [
    `How to recognize it in real time: after a strong rally, price starts making equal highs instead of higher highs. Volume on up-moves declines. The UTAD spikes above range on lower relative volume. That's distribution.`,
    `Mistake: holding through the LPSY hoping for new highs. The LPSY is the last exit point before markdown. If price has already shown SOW and is making lower highs, the distribution is nearly complete.`
  ],

  // ── 459: Inverse Fair Value Gaps ──
  459: [
    `Practical example: a bearish FVG forms. Price rallies back and fills the gap. Now that zone acts as support instead of resistance. The inefficiency was resolved, but the area retains significance.`,
    `Pro tip: inverse FVGs are "second chance" zones. The first reaction was the FVG. The second reaction after the fill is the inverse FVG. They're useful for re-entries in the direction of the original move.`
  ],

  // ── 462: Liquidity Sweeps vs Grabs ──
  462: [
    `On a chart: a sweep looks like a quick wick past a high that closes back inside. A grab is a deeper push past the level that takes multiple candles to reverse. The speed and depth tell you the intent.`,
    `Pro tip: a sweep followed by displacement (large candle in the opposite direction) is a high-probability reversal signal. A slow grab without displacement is more ambiguous and needs more confirmation.`
  ],

  // ── 466: Order Blocks Deep Dive ──
  466: [
    `Finding them in practice: scroll to a strong rally on the 1H chart. Find the last red candle before the move. That range is your bullish order block. When price pulls back to it, watch for a reaction.`,
    `Mistake: treating every candle before a move as an order block. The best OBs have displacement candles immediately following them and they sit in discount zones. Not every candle qualifies.`
  ],

  // ── 469: Time-Based Liquidity Concepts ──
  469: [
    `Trade this: mark the previous day's high and low. These are time-based liquidity levels. During the next London or NY session, watch for sweeps of these levels before the real directional move begins.`,
    `Pro tip: the weekly open is another major time-based level. Price often returns to the weekly open during the week. It acts as a reference point for institutional positioning.`
  ],

  // ── 472: Killzones & High-Probability Windows ──
  472: [
    `Test this yourself: review 30 days of trades. How many of your best setups occurred during killzones vs outside them? Most traders find that 70%+ of their winning trades happened within these windows.`,
    `Common mistake: forcing trades during low-activity hours because you're "bored" or "need to make money today." Trading outside killzones often means worse fills, false signals, and unnecessary losses.`
  ],

  // ── 476: Institutional Order Flow Concepts ──
  476: [
    `What to look for: price consolidates quietly at a level for hours. Then a single large candle breaks out with volume. That consolidation was accumulation. The breakout was the institutional hand being revealed.`,
    `Pro tip: institutional moves create fair value gaps and displacement. If a move from a level doesn't leave these traces, it's more likely retail activity. The bigger the player, the bigger the footprint.`
  ],

  // ── 479: Asian Range Strategy Concepts ──
  479: [
    `Application: mark the Asian session high and low before London opens. If London sweeps the Asian low first, that's a potential long setup. The low sweep grabbed sell-side liquidity before the real bullish move.`,
    `Mistake: automatically fading every Asian range sweep. The sweep must be followed by a structural shift or displacement in the opposite direction. A sweep without reversal confirmation is just a breakout.`
  ],

  // ── 482: Power of Three (AMD) ──
  482: [
    `Track this for a week: mark the Asian range, note the London manipulation direction, and then observe where NY distributes. You'll start seeing the same three-phase pattern repeat with surprising regularity.`,
    `Pro tip: the manipulation phase often targets the obvious liquidity from the accumulation phase. If Asian range had equal lows, London will likely sweep them before the real move. The trap precedes the truth.`
  ],

  // ── 486: ICT Judas Swing ──
  486: [
    `Example: NY opens and price pushes higher for 15-30 minutes. Breakout traders go long. Then price reverses hard, sweeping those longs and dropping through the session low. The morning rally was the Judas move.`,
    `Pro tip: don't trade the first 15 minutes of any session. Wait for the initial move to complete and show its hand. If it looks like a Judas, the reversal will give you a much better entry with a clear stop.`
  ],

  // ── 489: Quarterly Theory Basics ──
  489: [
    `Look at any yearly chart: notice how Q1 and Q3 often have different characters than Q2 and Q4. Some quarters trend, some range. Seasonal patterns in volume and volatility are real and worth understanding.`,
    `Pro tip: apply quarterly thinking to monthly candles too. Each month within a quarter can show its own accumulation-manipulation-distribution cycle. The fractal nature of this theory is its real power.`
  ],

  // ── 492: Market Maker Models ──
  492: [
    `Watch how price behaves around a major news event. Before the event: tight range (accumulation). On release: spike in one direction (manipulation). After the dust settles: the real move begins (distribution).`,
    `Mistake: thinking market makers are "against you." They're not targeting your account specifically. They need liquidity to fill large orders. Understanding this removes paranoia and adds clarity to your analysis.`
  ],

  // ── 496: Algorithmic vs Discretionary ──
  496: [
    `Simple self-test: do you follow your rules consistently, or do you frequently override them based on gut feeling? If you override often, you're discretionary. If you follow rules exactly, you might thrive with algo systems.`,
    `Pro tip: many successful traders use a hybrid approach. Algorithmic rules for entry and risk management, discretionary judgment for trade selection and context reading. The best of both worlds.`
  ],

  // ── 499: Building Your Trading System ──
  499: [
    `Start here: write one sentence for each: what I trade, when I trade, how I enter, how I exit, how much I risk. Those five sentences are the skeleton of a system. Everything else builds on that.`,
    `Common mistake: building an overly complex system with 15 rules and 8 indicators. Complexity doesn't equal edge. The best systems are simple enough to follow under pressure. If you can't explain it in 60 seconds, simplify.`
  ],

  // ── 502: Backtesting Fundamentals ──
  502: [
    `The honest backtest: 200 trades, same rules, no "oh but I would have done this differently." If you make exceptions during backtesting, you'll make exceptions during live trading. Rules are rules.`,
    `Pro tip: split your backtest into in-sample and out-of-sample periods. Develop rules on 6 months of data, then test them on 6 months you haven't seen. If it works on both, you might have an edge.`
  ],

  // ── 506: Forward Testing Protocol ──
  506: [
    `Practical approach: open a paper trading account. Trade your backtested strategy for 30-50 trades minimum. Track everything identically to how you would with real money. Journal, screenshots, grading, all of it.`,
    `Mistake: not taking paper trading seriously. Trading smaller sizes or ignoring rules because "it's not real" defeats the purpose. If you can't follow the rules with fake money, you won't follow them with real money.`
  ],

  // ── 509: Risk-Adjusted Returns ──
  509: [
    `Compare these two traders: Trader A returns 40% but suffered a 35% drawdown. Trader B returns 25% but max drawdown was 8%. Trader B has the better system. Drawdown recovery math makes this clear.`,
    `Pro tip: track your Sharpe ratio monthly. Anything above 1.0 is good. Above 2.0 is excellent. Below 0.5 means your returns don't justify your risk. This single metric tells you more than your P&L statement alone.`
  ],

  // ── 512: Scaling Into Positions ──
  512: [
    `Example: your plan is 100 shares. Enter 30 shares at the initial level. Price confirms and holds, add 40 more. Price breaks out, add the final 30. Your average entry is better than going all-in at the first touch.`,
    `Common mistake: adding to losers and calling it "scaling in." Scaling in means adding to a trade that's CONFIRMING your thesis. If price moves against you, that's not a scaling opportunity. That's a warning.`
  ],

  // ── 516: Scaling Out of Positions ──
  516: [
    `Simple framework: take 50% at your first target (e.g., 1.5R), move stop to breakeven on the rest. Now you have locked profit and a free trade running. Take another 25% at target 2 and let the final 25% ride.`,
    `Pro tip: decide your scaling plan BEFORE entering the trade. In the heat of the moment, greed says "hold everything" and fear says "close everything." A pre-written plan removes both voices.`
  ],

  // ── 519: Trade Review Process ──
  519: [
    `Framework: screenshot every trade at entry and exit. After the session, review each one. Grade execution 1-10. Write one sentence: "What would I do differently?" Repeat daily. Review all entries weekly.`,
    `Mistake: reviewing only losing trades. Your best trades contain valuable data too. Why did it work so well? Can you identify that setup faster next time? The review process is about pattern recognition, not punishment.`
  ],

  // ── 522: Correlation in Trading ──
  522: [
    `Quick check: before adding a second position, pull up a correlation chart between the two assets. If the correlation is above 0.7, you're essentially doubling the same bet. Reduce size or pick one.`,
    `Pro tip: correlations shift over time. Two assets that were uncorrelated for months can suddenly move together during a market shock. Periodically review correlations, especially during volatile periods.`
  ],

  // ── 526: Volatility Cycles ──
  526: [
    `Application: when Bollinger Bands squeeze tighter than they've been in 20 candles, get ready. The compression is storing energy. A breakout from that squeeze often produces a move worth multiple R.`,
    `Mistake: trading during the compression itself. The squeeze is the setup phase, not the trade. Wait for the expansion (the breakout from the squeeze with volume). Entering inside the compression means more chop.`
  ],

  // ── 529: Mean Reversion Basics ──
  529: [
    `Practical rule: when price is 2+ standard deviations from the 20-period mean (outside the Bollinger Band), it's extended. A reversion toward the mean is statistically likely. That's the setup window.`,
    `Common mistake: catching falling knives in the name of mean reversion. Price can stay extended longer than you can stay solvent. Always wait for a reversal candle or structural shift before entering.`
  ],

  // ── 532: Trend Strength Assessment ──
  532: [
    `Try this: in an uptrend, measure the depth of each pullback as a percentage of the prior impulse. Shallow pullbacks (under 38%) = strong trend. Deep pullbacks (over 61%) = weakening trend. Simple but telling.`,
    `Pro tip: compare volume on impulse legs vs retracement legs. Strong trends have volume on impulse and low volume on pullbacks. When retracement volume starts matching impulse volume, the trend is losing control.`
  ],

  // ── 536: Support Becomes Resistance ──
  536: [
    `Example: $50 was support for weeks. Price breaks below to $45. When it rallies back to $50, buyers who were trapped now sell to get out at breakeven. That selling turns $50 into resistance. The flip is in play.`,
    `Common mistake: ignoring the retest. Many traders see the break and forget the level. But the retest of the broken level is often the best entry. It gives you a clear stop (above the level) and a defined target.`
  ],

  // ── 539: Multi-Timeframe Confirmation ──
  539: [
    `Example workflow: daily shows uptrend. 4H shows price at a key support level. 1H shows a bullish engulfing candle at that level. Three timeframes, one conclusion: this is a long entry worth taking.`,
    `Mistake: looking at lower timeframes first and then trying to force the higher timeframe to agree. Always work top-down. Higher TF sets the bias. Lower TF gives the entry. Never reverse the order.`
  ],

  // ── 542: False Breakout Recognition ──
  542: [
    `In practice: price breaks above resistance, you see a wick but the candle closes back inside the range. Volume was below average. That's two signs of a false breakout. The reversal back into the range is the trade.`,
    `Pro tip: false breakouts at "obvious" levels are the most common. The more visible a level is, the more stops cluster there, and the more likely it is to get swept before reversing. Obvious levels attract traps.`
  ],

  // ── 546: Gap Trading Basics ──
  546: [
    `Application: after a gap up on a stock, check volume. If volume is 3x average, that's a breakaway gap. Trade the continuation. If volume is normal, it's likely a common gap that will fill. Different strategies for each.`,
    `Mistake: assuming all gaps fill. Breakaway gaps at the start of trends often never fill. Trying to fade a breakaway gap means fighting institutional momentum. Identify the type before choosing the direction.`
  ],

  // ── 549: Volume Confirmation Basics ──
  549: [
    `Quick test: pull up the last 5 breakouts on any chart. How many had above-average volume? The ones that did likely followed through. The ones that didn't likely reversed. Volume is the most honest confirmation tool.`,
    `Pro tip: volume declining during a pullback in an uptrend is healthy. It means sellers aren't aggressive. If the pullback has increasing volume, sellers are getting active and the structure may be weakening.`
  ],

  // ── 552: Candlestick Psychology ──
  552: [
    `Look at a hammer candle at support: price dropped sharply (sellers attacked), then buyers pushed it all the way back. The long lower wick is the battlefield. The close near the top is the verdict: buyers won.`,
    `Common mistake: trading candle patterns on 1-minute charts. Lower timeframes have more noise and less meaningful patterns. Candlestick signals gain reliability as you move to higher timeframes. The daily hammer means more than the 5-minute hammer.`
  ],

  // ── 556: Divergence Trading ──
  556: [
    `Real example: price makes a higher high on the 4H chart, but the RSI makes a lower high. That bearish divergence says momentum is slowing. It doesn't mean sell immediately, but it means watch for a structural shift.`,
    `Mistake: trading divergence against a strong trend. Divergence can persist for days or weeks in powerful trends. Three consecutive divergences that "failed" before the reversal can wipe out an account. Always combine with structure.`
  ],

  // ── 559: Trend Reversal Patterns ──
  559: [
    `Application: you spot a double top on the daily chart. Instead of selling immediately, wait for the neckline to break. Then wait for the retest of the neckline as resistance. That retest is the entry with the tightest stop.`,
    `Pro tip: reversal patterns at higher timeframe levels are far more reliable. A head and shoulders at the monthly resistance is a major event. The same pattern in the middle of a daily range is noise. Context elevates the pattern.`
  ],

  // ── 562: Risk-to-Reward Optimization ──
  562: [
    `Optimization in practice: if your planned stop is 30 pips and the target is 40, that's 1:1.3. Can you tighten the entry to get a 20-pip stop? Now it's 1:2. Same trade, better entry, better math.`,
    `Common mistake: fixating on a minimum R:R ratio and passing on every trade that doesn't meet it. A high-probability 1:1.5 setup taken consistently can outperform a low-probability 1:3 setup over 200 trades.`
  ],

  // ── 566: Confluence Zones ──
  566: [
    `Real scenario: the 200 SMA sits at $48. A demand zone spans $47-$49. The 61.8% fib retracement lands at $48.50. Three independent factors at the same zone. That's a trade worth preparing for.`,
    `Pro tip: mark confluence zones BEFORE the market reaches them. If you identify them in real time, emotion and bias creep in. Pre-marked zones let you react objectively when price arrives.`
  ],

  // ── 569: Trading Session Characteristics ──
  569: [
    `Put it into practice: track which session your winning trades occur in for 30 days. Most traders discover they perform significantly better during one session. Focus your energy there and reduce exposure elsewhere.`,
    `Mistake: trading all sessions equally. If your strategy relies on volatility, skip Asia. If it relies on range-bound conditions, skip NY open. Match your strategy's requirements to the session's characteristics.`
  ],

  // ── 572: Position Management Principles ──
  572: [
    `Example: you're long with a 2R target. Price reaches 1R. Move stop to breakeven. Now your downside is zero and your upside is still 1R. You turned a risk trade into a risk-free opportunity. That's management.`,
    `Mistake: having no management plan before entry. "I'll figure it out when I'm in the trade" means emotion makes the decisions. Write your management rules next to your entry rules. Both matter equally.`
  ],

  // ── 576: Stop Loss Placement Strategies ──
  576: [
    `Real application: for an ATR-based stop, take the 14-period ATR and multiply by 1.5. That gives you a volatility-adjusted distance. In quiet markets, your stop is tight. In volatile markets, it widens to avoid noise.`,
    `Pro tip: combine structure-based and ATR-based stops. Place your stop behind the key structural level, but verify it's at least 1 ATR away from entry. If it's not, either widen the stop or reduce position size.`
  ],

  // ── 579: Trading Journal Best Practices ──
  579: [
    `Practical routine: use a spreadsheet with columns for date, pair, direction, entry, exit, R-multiple, setup type, execution grade, and notes. Filter by setup type after 50 trades to see which ones actually perform.`,
    `Mistake: writing paragraphs of analysis but never reviewing them. A journal you don't review is a diary. Schedule 30 minutes every Sunday to read through the week's entries and extract one actionable insight.`
  ],

  // ── 582: Entry Trigger Types ──
  582: [
    `How it works in practice: your setup is a pullback to the 50 EMA in an uptrend. The trigger is a bullish engulfing candle at that EMA. Setup puts you on watch. Trigger puts you in the trade. Two separate steps.`,
    `Mistake: confusing setups with triggers. Seeing price at support is a setup, not a trigger. The trigger is what confirms: a candle close, a volume spike, or a break of the micro structure. Don't enter on the setup alone.`
  ],

  // ── 586: Understanding Spread and Slippage ──
  586: [
    `Real numbers: if you make 200 trades per year with a 2-pip spread each time, that's 400 pips in spread costs alone. At $10 per pip, that's $4,000 your strategy needs to overcome just to break even.`,
    `Pro tip: factor spread and slippage into your backtests. If your system averages 15 pips per win and the spread is 2 pips, that's 13% of every win eaten by costs. Small edges can disappear entirely once costs are included.`
  ],

  // ── 589: The Importance of Liquidity ──
  589: [
    `Practical rule: check the bid-ask spread before entering any trade. If the spread is more than 5% of your stop distance, the trade is too expensive. On a 20-pip stop, the spread should be under 1 pip.`,
    `Mistake: trading exotic pairs or low-cap altcoins with tight stops. Low liquidity means wide spreads and slippage that can eat your edge entirely. Stick to liquid markets until your account size demands otherwise.`
  ],

  // ── 592: Trading Plan Essentials ──
  592: [
    `A minimal trading plan on one page: market (what), session (when), setup + trigger (how I enter), stop + target (how I exit), 1% max risk (how much), journal review Sunday (how I improve). One page. Done.`,
    `Common mistake: writing a 20-page plan you never look at. A plan that lives in a drawer is no plan at all. Keep it short enough to read in 2 minutes. Tape it next to your monitor. Review it before every session.`
  ],

  // ── 596: Common Beginner Mistakes ──
  596: [
    `The fix is simpler than you think: pick one strategy, one market, one timeframe. Trade it for 3 months with a journal. That single focus eliminates most beginner mistakes by removing the chaos of trying everything.`,
    `Pro tip: if you catch yourself making the same mistake twice, create a specific rule against it. "I will not trade within 30 minutes of news" or "I will not take a third trade after two losses." Rules defeat habits.`
  ],

  // ── 599: Building Good Trading Habits ──
  599: [
    `A daily routine: 7 AM review charts and set alerts. Trade during your session. 30 minutes post-session for journaling. That's 3-4 hours max. The rest of the day is yours. Trading shouldn't consume your entire life.`,
    `Mistake: building habits around outcomes instead of process. "I will be profitable this week" isn't a habit. "I will journal every trade and review on Sunday" is a habit. Focus on what you can control.`
  ],

  // ── 602: Understanding Market Hours ──
  602: [
    `For crypto traders: even though the market is 24/7, volume peaks during US equity hours (9:30 AM - 4 PM EST). The biggest moves typically happen when traditional markets are open. Trade the volume, not the clock.`,
    `Pro tip: mark the session overlap times on your chart template. London-NY overlap (8 AM - 12 PM EST) consistently produces the highest volatility of the day. If you can only trade one window, make it that one.`
  ],

  // ── 606: Price Action vs Indicators ──
  606: [
    `Practical approach: read the chart with price action first. Form your bias. Then check what your indicators say. If they agree, confidence increases. If they disagree, either wait or look deeper. PA leads, indicators confirm.`,
    `Mistake: ignoring a clear price action signal because an indicator "hasn't confirmed yet." If price is showing a massive rejection wick at a key level with volume, the indicator is secondary. Don't let the tool override reality.`
  ],

  // ── 609: Reading Order Flow Simply ──
  609: [
    `Exercise: pick one key level and watch volume every time price touches it. If volume spikes and price bounces, that's demand. If volume spikes and price breaks, that's a liquidation event. Volume at levels is the simplest flow reading.`,
    `Mistake: overcomplicating order flow with tools you don't understand. Footprint charts and delta analysis are powerful but unnecessary for beginners. Master volume bars at key levels first. Add complexity later when the basics are second nature.`
  ],

  // ── 612: EDUCATION HUB (Volume) ──
  612: [
    `Application: before entering any trade, ask one question: "Is volume supporting this move?" If the answer is no or you're unsure, reduce size or wait. This single filter eliminates a large portion of bad trades.`,
    `Pro tip: volume is most useful at extremes and key levels. Volume in the middle of a range is noise. Volume at a breakout or reversal point is signal. Focus your volume analysis where it matters most.`
  ],

  // ── 616: EDUCATION HUB (Confluence) ──
  616: [
    `Build a confluence checklist: Level? Trend alignment? Volume? Candle pattern? Session timing? Check each before entry. Require a minimum of 3 checks. This simple filter dramatically improves win rate.`,
    `Mistake: stacking 6 indicators and calling it confluence. If they all derive from price (most do), they're not independent. True confluence combines price-based, volume-based, and time-based factors.`
  ],

  // ── 619: EDUCATION HUB (Trend Identification) ──
  619: [
    `Test yourself: open a chart and within 5 seconds, determine the trend. Higher highs? Uptrend. Lower lows? Downtrend. Can't tell? Range. If it takes more than 5 seconds, the trend isn't clear enough to trade.`,
    `Mistake: over-analyzing trend direction with 5 indicators when the swing points tell you everything. If the most recent swing high is higher than the previous one and the swing low is higher too, it's an uptrend. Keep it visual.`
  ],

  // ── 622: EDUCATION HUB (Risk-Reward) ──
  622: [
    `Run this calculation for your last 20 trades: average win size divided by average loss size. If it's less than 1:1, your winners are smaller than your losers. Fix entries, exits, or both to improve the ratio.`,
    `Pro tip: improving R:R isn't just about bigger targets. Tighter entries (waiting for better price) and tighter stops (based on structure, not fear) both improve the ratio without changing your strategy.`
  ],

  // ── 626: EDUCATION HUB (Wicks) ──
  626: [
    `Next time you see a long lower wick at support: that wick represents every seller who tried to push price down and failed. The buyers at the bottom of that wick are telling you something. Listen to the rejection.`,
    `Mistake: ignoring wicks on higher timeframes. A weekly candle with a 3% lower wick at a key support level is a major signal. Daily and intraday wicks can be noise, but weekly and monthly wicks carry real institutional weight.`
  ],

  // ── 629: EDUCATION HUB (Advanced Confluence) ──
  629: [
    `Advanced test: are your confluence factors actually independent? RSI oversold + Stochastic oversold + CCI oversold = one piece of information (price is extended), not three. Independent means different data sources.`,
    `Pro tip: the strongest confluence combines different categories: a structural level (S/R), a momentum reading (oscillator), and a volume signature (volume spike/dryup). Three categories, three independent reads.`
  ],

  // ── 632: EDUCATION HUB (Watchlist) ──
  632: [
    `Framework: pick 5 assets. Learn their average daily range, key historical levels, what time they move most, and which indicators work best on them. In 30 days, you'll read those charts like a native language.`,
    `Mistake: adding every trending ticker to your watchlist. If you don't know an asset's personality, you're at a disadvantage against traders who specialize in it. Deep knowledge of 5 beats shallow knowledge of 50.`
  ],

  // ── 636: EDUCATION HUB (Liquidity) ──
  636: [
    `Before placing your stop, ask: is this where everyone else's stop would be? If yes, move it further. The most obvious stop placement is the first to get hunted. Give yourself the room to survive the sweep.`,
    `Pro tip: mark equal highs and equal lows on your chart daily. These are the highest-probability liquidity targets. When price approaches them, expect a sweep before the real move. Position yourself accordingly.`
  ],

  // ── 638: Chronicle Lesson ──
  638: [
    `Each of the seven indicators was designed to answer a different question. Cycles, volume regime, levels, flow, momentum, scanning, overlay. Together they cover the complete analytical picture without redundancy.`,
    `Pro tip: you don't need all seven at once. Start with the one that addresses your biggest weakness. Struggling with levels? Start with Janus Atlas. Missing cycle turns? Start with Pentarch. Build outward from need.`
  ],

  // ── 639: EDUCATION HUB (Trading System) ──
  639: [
    `Here's a quick audit: read your system aloud. If any component sounds vague ("I exit when it feels right"), that's a hole. Replace vague with specific. "I exit at 2R or when the 1H candle closes below the 20 EMA."`,
    `Mistake: building a system but never testing it. A system that hasn't been backtested is just a theory. Test it across 200 trades. If the numbers work, trade it. If not, fix it. Don't skip the validation step.`
  ],

  // ── 642: EDUCATION HUB (Lesson 01) ──
  642: [
    `Where to begin: open lesson 1, read it fully, and take one note. Move to lesson 2 the next day. Don't skip ahead. The sequence matters because each concept builds on the previous one. One lesson per day, 82 days, real foundation.`,
    `Pro tip: after finishing each lesson, find one example on a real chart. Theory without application fades quickly. A 5-minute chart exercise after each lesson cements the concept better than reading it three times.`
  ],

  // ── 646: EDUCATION HUB (Lesson 82) ──
  646: [
    `After lesson 82, the real curriculum begins: your own trades. Apply the concepts daily. Journal the results. Review weekly. The lessons gave you the language. The market gives you the practice exams.`,
    `Pro tip: revisit lessons periodically. What you understood at lesson 30 will hit differently after 200 live trades. Concepts deepen with experience. The education hub isn't a one-time read, it's a reference you grow into.`
  ]

};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    const exp = expansions[post.postNumber];
    if (exp && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;
      post.twitter.tweets = [tweets[0], tweets[1], exp[0], exp[1], tweets[2]];
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Education expansion 3: ${updated} posts expanded from 3→5 tweets`);
}

main();
