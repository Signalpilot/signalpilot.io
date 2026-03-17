#!/usr/bin/env node
/**
 * Expand Advanced Education posts from 3 tweets to 5-6 tweets.
 * These are complex concepts that deserve proper depth.
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

const expansions = {
  // ── 402  Wyckoff Accumulation (3→6 tweets) ──
  402: [
    `Wyckoff Accumulation: the blueprint of how market bottoms actually form. \u{1F9F5}`,
    `Phase A — Stopping the downtrend:\nPS (Preliminary Support): first buying appears.\nSC (Selling Climax): panic selling, high volume, wide range. Smart money starts absorbing.\nAR (Automatic Rally): short covering bounces price.\nST (Secondary Test): retests the SC low on lower volume.`,
    `Phase B — Building a cause:\nPrice chops sideways. Smart money quietly accumulates while retail gives up. Volume patterns shift: rallies show more volume, dips show less. This phase can last weeks.`,
    `Phase C — The Spring:\nThe trap. Price dips BELOW the range low, triggering stop losses. Retail panics and sells. Smart money buys everything. The Spring is the shakeout that creates the fuel for markup.`,
    `Phase D — Markup begins:\nSOS (Sign of Strength): strong rally on high volume.\nLPS (Last Point of Support): a pullback that holds above the Spring. This is the confirmation entry for Wyckoff traders.`,
    `Phase E — Full markup in progress. The move most people chase is already underway.\n\n\u{1F4D6} Free Wyckoff lessons: ${edu}\n\u{1F50D} Detect accumulation: ${tv.volumeOracle}`
  ],

  // ── 406  Wyckoff Distribution (3→6 tweets) ──
  406: [
    `Wyckoff Distribution: the blueprint of how market tops actually form. \u{1F9F5}`,
    `Phase A — Stopping the uptrend:\nPSY (Preliminary Supply): first selling appears.\nBC (Buying Climax): euphoric buying, high volume, wide range. Smart money starts selling into the rally.\nAR (Automatic Reaction): price drops as buying exhausts.\nST (Secondary Test): retests the high on lower volume.`,
    `Phase B — Distribution range:\nSmart money sells to late buyers. Volume on rallies declines, volume on drops increases. The range looks like consolidation but it's actually a massive exit.`,
    `Phase C — The UTAD (Upthrust After Distribution):\nThe trap. Price breaks ABOVE the range high. Retail sees "breakout" and buys. Smart money sells everything to them. UTAD is the final lure.`,
    `Phase D — Markdown begins:\nSOW (Sign of Weakness): heavy selling, high volume.\nLPSY (Last Point of Supply): a weak rally that fails. This is confirmation the top is in. Markdown accelerates.`,
    `Phase E — Full markdown. The crash that most people are trapped in.\n\n\u{1F4D6} Free Wyckoff lessons: ${edu}\n\u{1F50D} Detect distribution: ${tv.volumeOracle}`
  ],

  // ── 409  ICT Concepts Overview (3→6 tweets) ──
  409: [
    `ICT concepts: a framework for understanding how institutional money moves markets. \u{1F9F5}`,
    `Order Blocks: the last opposing candle before a major move. These mark zones where institutional orders were placed. When price returns, it often reacts. They're not support/resistance — they're order footprints.`,
    `Fair Value Gaps (FVGs): when price moves so fast it leaves gaps between candles. These inefficiencies often get "filled" before the trend continues. Think of them as unfinished business on the chart.`,
    `Liquidity Pools: where stop losses cluster. Above equal highs, below equal lows, beyond obvious levels. Institutions need liquidity to fill large orders, so price gravitates toward these pools.`,
    `Kill Zones: the time windows where most high-probability moves initiate. London Open (2-5am EST), NY Open (7-10am EST), London Close (10am-12pm EST). Trading outside these windows = lower probability.`,
    `Displacement: the aggressive candle(s) that show institutional commitment. Large body, small wicks, high volume. This is the "tell" that smart money has entered.\n\n\u{1F4D6} Full ICT education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 412  Market Structure Shift / MSS (3→5 tweets) ──
  412: [
    `Market Structure Shift (MSS): the moment a trend changes character. Here's how to identify it. \u{1F9F5}`,
    `In an uptrend, structure is: higher highs + higher lows. MSS occurs when price makes a LOWER LOW, breaking the sequence. The higher-high pattern fails. That break is the shift.`,
    `In a downtrend: lower highs + lower lows. MSS occurs when price makes a HIGHER HIGH. The downward sequence is broken. Previous resistance becomes potential support.`,
    `MSS alone isn't a trade signal. Confirm with: volume expansion on the break, displacement candles showing conviction, and ideally a retest of the broken structure that holds. Without confirmation, it could be a fakeout.`,
    `The key distinction: MSS is a STRUCTURAL event, not a candle pattern. It changes the character of the market, not just the current swing.\n\n\u{1F4D6} Free structure lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 416  Change of Character / ChOCH (3→5 tweets) ──
  416: [
    `Change of Character (ChOCH): the first warning that structure may shift. Earlier than MSS. \u{1F9F5}`,
    `In an uptrend: price fails to make a new higher high, then breaks the most recent higher low. That break of the internal swing low = ChOCH. It's the first crack in the bullish structure.`,
    `In a downtrend: price fails to make a new lower low, then breaks the most recent lower high. The first sign bears are losing control.`,
    `ChOCH vs MSS: ChOCH is the first signal (internal structure). MSS is the confirmation (external structure). Smart money traders use ChOCH to get positioned early. The tradeoff: earlier entry = more risk of false signal.`,
    `How to trade it: wait for ChOCH + FVG or order block retest + displacement. That triple confluence turns a warning into a setup.\n\n\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 419  Break of Structure / BOS (3→5 tweets) ──
  419: [
    `Break of Structure (BOS): the market confirming the trend is alive and continuing. \u{1F9F5}`,
    `In an uptrend: price makes a NEW higher high, breaking above the previous swing high. That's BOS. The trend structure is intact and reinforced.`,
    `In a downtrend: price makes a NEW lower low, breaking below the previous swing low. Bears remain in control. Continuation confirmed.`,
    `BOS is a continuation signal, not a reversal signal. After BOS, look for pullbacks into order blocks, FVGs, or discount zones for entries WITH the trend. BOS tells you the direction is confirmed — the pullback is your entry.`,
    `BOS vs ChOCH vs MSS:\n\u{2022} BOS = trend continues\n\u{2022} ChOCH = first warning of change\n\u{2022} MSS = confirmed change\n\nKnow which one you're looking at.\n\n\u{1F4D6} Free structure lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 422  Liquidity Concepts (3→5 tweets) ──
  422: [
    `Liquidity: the invisible force that drives where price goes. Understanding it changes everything. \u{1F9F5}`,
    `Where liquidity hides:\n\u{2022} Above equal highs (buy stops from shorts, breakout orders from bulls)\n\u{2022} Below equal lows (sell stops from longs, breakdown orders from bears)\n\u{2022} Beyond trendlines\n\u{2022} At round numbers\n\u{2022} At previous day/week/month highs and lows`,
    `Why it matters: institutions need liquidity to fill large orders. They can't buy 10,000 contracts without someone selling 10,000. So price moves TO liquidity pools to fill those orders, then reverses.`,
    `The pattern: price approaches a liquidity pool \u{2192} sweeps through it (triggering stops/orders) \u{2192} reverses sharply. If you can identify WHERE liquidity sits, you can anticipate WHERE price will go before reversing.`,
    `How to use it: map equal highs/lows on your chart. Mark previous session highs/lows. These are the targets. When price reaches them and shows rejection, that's your trade.\n\n\u{1F4D6} Free liquidity lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 426  Order Flow (3→5 tweets) ──
  426: [
    `Order flow: understanding WHY price moves, not just WHERE. \u{1F9F5}`,
    `At its core: price moves when buying pressure exceeds selling pressure (up) or selling exceeds buying (down). Indicators REACT to this. Order flow EXPLAINS it. The difference is cause vs effect.`,
    `What to look for:\n\u{2022} Volume spikes at key levels = institutional participation\n\u{2022} Absorption: price stays flat despite heavy volume = large orders absorbing supply/demand\n\u{2022} Exhaustion: high volume + no further progress = the move is running out of fuel`,
    `Practical application: when price reaches a key level, watch the volume. High volume + rejection = smart money defending the level. Low volume + break = weak move, likely to fail. Volume is the truth serum.`,
    `You don't need a DOM or footprint chart to read flow. Candle volume + context is enough to understand institutional intent.\n\n\u{1F4D6} Free order flow lessons: ${edu}\n\u{1F50D} Plutus Flow: ${tv.plutusFlow}`
  ],

  // ── 429  Fair Value Gaps / FVGs (3→5 tweets) ──
  429: [
    `Fair Value Gaps: the imbalances price leaves behind when it moves too fast. \u{1F9F5}`,
    `How they form: Candle 1 high and Candle 3 low don't overlap. The space between them = Fair Value Gap. Price moved so aggressively that orders couldn't fill at fair value. That gap is unfinished business.`,
    `Why they matter: price tends to return to fill FVGs before continuing the trend. Think of it as the market "correcting" an inefficiency. Not always, but often enough to build a strategy around.`,
    `Types of FVGs:\n\u{2022} Bullish FVG: gap in an up-move (buy zone when price returns)\n\u{2022} Bearish FVG: gap in a down-move (sell zone when price returns)\n\u{2022} Inverse FVG: a filled gap that then becomes support/resistance`,
    `How to trade them: mark FVGs on your chart. When price returns to one that aligns with the trend + an order block + a key level = high-confluence entry.\n\n\u{1F4D6} Free FVG lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 432  Inducement & Traps (3→5 tweets) ──
  432: [
    `Inducement: the bait that lures retail traders into the wrong side of the market. \u{1F9F5}`,
    `How it works: price creates a minor swing high/low just beyond a key level. Retail sees a "breakout" and enters. Their stops become liquidity. Smart money takes the other side of those orders.`,
    `The anatomy:\n1. Key level established (everyone sees it)\n2. Price nudges past it (inducement)\n3. Retail enters with stops nearby\n4. Price reverses sharply, stopping them out\n5. The REAL move begins in the opposite direction`,
    `How to spot inducement: it usually looks "too clean." A perfect breakout that feels easy. When a setup looks obvious to everyone, ask: who's on the other side? If the answer is "smart money," you're the liquidity.`,
    `How to USE it: instead of trading the breakout, wait for the reversal after the sweep. The inducement tells you WHERE the real move will start — just in the opposite direction.\n\n\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 436  Premium & Discount Zones (3→5 tweets) ──
  436: [
    `Premium and Discount zones: the concept that not all prices are equal for entry. \u{1F9F5}`,
    `Take any swing: measure from the low to the high. The upper half = premium (expensive). The lower half = discount (cheap). The 50% level is equilibrium. Simple concept, powerful application.`,
    `In an uptrend: you want to BUY in the discount zone (below 50% of the last swing). Buying premium means you're late. In a downtrend: you want to SELL in the premium zone (above 50% of the last swing).`,
    `Combine with OTE (Optimal Trade Entry): the 62-79% retracement zone. A pullback into the discount zone that reaches the OTE and also overlaps with an order block or FVG? That's a high-probability entry.`,
    `The mindset shift: stop chasing breakouts (premium entries). Start waiting for pullbacks into discount. Your average entry price improves dramatically, and so does your risk-reward.\n\n\u{1F4D6} Free zone analysis lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 439  Mitigation Blocks (3→5 tweets) ──
  439: [
    `Mitigation blocks: where the market has unfinished business to settle. \u{1F9F5}`,
    `How they form: smart money enters a position, but price moves against them. The zone where they initially entered becomes a "loss zone." When price returns, they don't just break even — they add to the position.`,
    `The difference from order blocks: order blocks are where orders were FILLED successfully. Mitigation blocks are where orders went UNDERWATER. When price returns, the reaction serves a different purpose — closing losses and re-entering.`,
    `How to spot them: find a zone where a strong move originated, but was later reversed and broken through. When price comes back to that zone from the opposite direction, watch for a reaction. The chart has memory.`,
    `Trading mitigation blocks: wait for price to enter the zone + show rejection (wick, engulfing candle, displacement). The reaction tells you institutional orders are being mitigated.\n\n\u{1F4D6} Free block lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 446  OTE Zone (3→5 tweets) ──
  446: [
    `OTE (Optimal Trade Entry): the retracement sweet spot where probability stacks up. \u{1F9F5}`,
    `The zone: 62% to 79% retracement of an impulse move. Deeper than a shallow pullback (which might continue trending) but not so deep it invalidates the move. The Goldilocks zone of entries.`,
    `Why it works: institutional traders scale into positions during retracements. The 62-79% range is where maximum accumulation tends to occur. It's not magic — it's where the biggest orders cluster in a pullback.`,
    `How to use it: after an impulse move, draw Fibonacci from swing low to high (uptrend) or high to low (downtrend). The 0.62 to 0.79 zone is your OTE. Wait for price to enter it and show confirmation.`,
    `The confluence play: OTE + order block + FVG overlap = premium setup. When the OTE zone lines up with other smart money concepts, the probability jumps significantly.\n\n\u{1F4D6} Free OTE lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 449  Swing Failure Pattern (3→5 tweets) ──
  449: [
    `Swing Failure Pattern (SFP): when price breaks a swing high/low then FAILS to hold. The trap is set. \u{1F9F5}`,
    `Bearish SFP: price makes a new high above a previous swing high, but CLOSES below it. The wick above grabbed liquidity (stop losses from shorts, breakout entries from bulls). The close below = rejection.`,
    `Bullish SFP: price makes a new low below a previous swing low, but CLOSES above it. The wick below grabbed liquidity (stop losses from longs, breakdown entries from bears). The close above = rejection.`,
    `Why SFPs are powerful: they show you exactly where liquidity was grabbed AND rejected in the same candle. It's the market saying "we went there to fill orders, not to stay." Clear intent.`,
    `How to trade: SFP candle close + entry in the opposite direction of the failed swing. Stop behind the SFP wick. Target the opposite liquidity pool. Clean setup, defined risk.\n\n\u{1F4D6} Free SFP lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 452  Wyckoff Accumulation Recap (3→5 tweets) ──
  452: [
    `Wyckoff accumulation deeper dive: understanding the Spring and its confirmation. \u{1F9F5}`,
    `The Spring is the most important event in accumulation. Price drops below the trading range support — stopping out longs and triggering breakdown shorts. Smart money buys EVERYTHING at these panic prices.`,
    `How to confirm the Spring worked:\n\u{2022} Immediate recovery back into the range\n\u{2022} Volume spike on the Spring followed by declining volume\n\u{2022} The Test: a smaller dip that holds ABOVE the Spring low on lighter volume`,
    `After the Test passes: look for SOS (Sign of Strength) — a strong rally that breaks above the range resistance with expanded volume. Then LPS (Last Point of Support) — the final pullback before full markup.`,
    `LPS is often the highest-probability Wyckoff entry. The Spring was the shakeout, the Test confirmed it, the SOS showed strength, and LPS is your pullback entry into confirmed markup.\n\n\u{1F4D6} Free Wyckoff education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 456  Wyckoff Distribution Recap (3→5 tweets) ──
  456: [
    `Wyckoff distribution deeper dive: understanding the UTAD and the exit. \u{1F9F5}`,
    `The UTAD (Upthrust After Distribution) is the most dangerous event. Price breaks ABOVE the range high — retail sees a "breakout to new highs" and buys aggressively. Smart money sells to them. It's the final exit.`,
    `How to confirm UTAD:\n\u{2022} Price breaks above range then reverses sharply back inside\n\u{2022} Volume may be high (retail buying) but price can't sustain\n\u{2022} Followed by SOW (Sign of Weakness): strong move below range midpoint`,
    `After SOW: look for LPSY (Last Point of Supply) — a weak rally that fails to reach the range high. This is the final exit opportunity and the highest-probability short entry in the Wyckoff framework.`,
    `The confirmation that markdown is underway: LPSY forms, volume on rallies is weak, and price breaks below the distribution range support. At that point, the top is confirmed and the fall accelerates.\n\n\u{1F4D6} Free Wyckoff education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 459  Inverse FVG (3→5 tweets) ──
  459: [
    `Inverse FVG: when a filled gap flips its role and becomes a new zone of interest. \u{1F9F5}`,
    `Normal FVG: price creates a gap, then returns to fill it. That's step 1. Inverse FVG is step 2: after the gap is filled, that SAME zone now acts as support (in an uptrend) or resistance (in a downtrend).`,
    `Why it happens: the initial FVG attracted orders to fill the inefficiency. Those orders create a new cluster of positions. When price retests the filled gap area, those positions defend their entries.`,
    `How to identify: find an FVG that was previously filled. Mark that zone. When price pulls back to it from above (in uptrend) or rallies to it from below (in downtrend), watch for a reaction.`,
    `The layered concept: Original gap \u{2192} gap fills \u{2192} zone flips role \u{2192} new entry opportunity. It's the market recycling levels. One concept builds on another.\n\n\u{1F4D6} Free FVG lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 462  Liquidity Sweeps vs Grabs vs Raids (3→5 tweets) ──
  462: [
    `Not all liquidity hunts are equal. Sweeps, grabs, and raids each tell a different story. \u{1F9F5}`,
    `Sweep: quick wick beyond a level, immediate reversal. Fast in, fast out. Usually a single candle. The market just needed to trigger stops quickly before reversing. Most common at daily/weekly highs and lows.`,
    `Grab: deeper penetration into the liquidity zone. Multiple candles beyond the level before reversing. The market needed MORE liquidity and took longer to fill. Often happens at major structural levels.`,
    `Raid: sustained move through liquidity. Price stays beyond the level for an extended period, making you think the break is real — THEN reverses. The most deceptive. Traps the most traders. Often multiple sessions.`,
    `How to use this: sweep = quick reversal trade (tight stop). Grab = wait for clear rejection before entering. Raid = hardest to trade, requires patience and confirmation that the raid is exhausting.\n\n\u{1F4D6} Free liquidity lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 466  Order Blocks Deep Dive (3→5 tweets) ──
  466: [
    `Order blocks: where institutional orders left their footprint on the chart. \u{1F9F5}`,
    `Bullish OB: the last DOWN candle before a strong up-move. Why? Institutional buy orders were being filled at that level. The down candle was the final batch of selling before demand overwhelmed supply.`,
    `Bearish OB: the last UP candle before a strong down-move. Institutional sell orders were being filled. The up candle was the final batch of buying before supply overwhelmed demand.`,
    `Not all order blocks are equal. Strong OBs have:\n\u{2022} Displacement immediately after (big candle, small wicks)\n\u{2022} High volume\n\u{2022} FVG created in the same move\n\u{2022} Alignment with higher timeframe direction`,
    `How to trade: mark the OB zone (open to close of that candle). When price returns, watch for confirmation: a rejection candle, a displacement candle in your direction, or an SFP. Don't blindly buy/sell the zone.\n\n\u{1F4D6} Free order block lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 469  Time-Based Liquidity (3→5 tweets) ──
  469: [
    `Liquidity isn't just about price levels — time creates liquidity too. \u{1F9F5}`,
    `Time-based liquidity pools:\n\u{2022} Previous day high/low\n\u{2022} Previous week high/low\n\u{2022} Previous month high/low\n\u{2022} Session highs/lows (Asian, London, NY)\n\u{2022} Midnight open\n\nThese levels reset on a schedule. Predictable. Targetable.`,
    `Why time matters: institutional algorithms reference these time-based levels. They're built into institutional order flow systems. Daily/weekly levels are targeted because that's where the most stops accumulate on a TIME basis.`,
    `The daily cycle: Asian session sets the range. London sweeps one side. New York often sweeps the other or continues London's direction. This time-based pattern repeats daily.`,
    `Practical use: map previous day/week highs and lows on your chart every session. When price approaches one, look for a sweep + reversal. Time-based levels combined with smart money concepts = powerful confluence.\n\n\u{1F4D6} Free time-based lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 472  Killzones (3→5 tweets) ──
  472: [
    `Killzones: the specific time windows where high-probability moves are born. \u{1F9F5}`,
    `Asian Killzone (7pm-12am EST): range-setting session. Price establishes the day's initial boundaries. Not ideal for entries, but perfect for marking the range that London will target.`,
    `London Killzone (2am-5am EST): trend initiation. London often sweeps one side of the Asian range and begins the day's directional move. This is where many of the day's best setups form.`,
    `New York Killzone (7am-10am EST): continuation or reversal of London's move. Highest volume window. London + NY overlap creates the most liquidity. Major news events amplify this window.`,
    `London Close (10am-12pm EST): profit-taking and reversals. Moves initiated in London/NY often retrace during the close. Good for taking profits, risky for new entries.\n\nTrade INSIDE killzones. Rest outside them.\n\n\u{1F4D6} Free session lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 476  Institutional Footprints (3→5 tweets) ──
  476: [
    `Institutions can't hide their footprints. They're too big. Learn where to look. \u{1F9F5}`,
    `Footprint #1 — Volume anomalies: abnormal volume at a key level means large orders are being filled. If price is at support and volume spikes but price doesn't break, someone big is buying.`,
    `Footprint #2 — Displacement: large-body candles with minimal wicks moving away from a zone. This is the aggressive entry. Smart money doesn't tiptoe — they move price with conviction.`,
    `Footprint #3 — Liquidity sweeps: quick wicks beyond obvious levels that immediately reverse. The wick IS the institutional order being filled. The reversal is the intention revealed.`,
    `Footprint #4 — Accumulation/distribution patterns: sideways price action with subtly shifting volume. Wyckoff taught us this 100 years ago and it still works today.\n\n\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F50D} Plutus Flow: ${tv.plutusFlow}`
  ],

  // ── 479  Asian Range (3→5 tweets) ──
  479: [
    `The Asian range: the quiet setup for the day's big move. \u{1F9F5}`,
    `What it is: the high and low established during the Asian session (roughly 7pm-2am EST). This range defines the day's initial boundaries. It's the "accumulation" phase of the daily cycle.`,
    `Why it matters: London and New York sessions often sweep one side of the Asian range before reversing. The Asian high or low is the day's first liquidity target. One gets taken — sometimes both.`,
    `The pattern:\n\u{2022} Asian session: quiet, range-bound\n\u{2022} London open: sweeps Asian high OR low\n\u{2022} Reversal begins from the sweep\n\u{2022} NY continues or reverses London\n\nThis cycle repeats more often than you'd expect.`,
    `How to trade it: mark the Asian high and low before London opens. When London sweeps one side and shows a reversal signal (SFP, displacement, OB retest), that's a high-probability setup.\n\n\u{1F4D6} Free session lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 482  Power of Three (3→5 tweets) ──
  482: [
    `Power of Three: Accumulation \u{2192} Manipulation \u{2192} Distribution. The daily cycle decoded. \u{1F9F5}`,
    `Accumulation (Asian session): smart money builds positions quietly. Price moves sideways in a tight range. Volume is low. Orders are being placed, not revealed.`,
    `Manipulation (London open): the false move. Price breaks one direction — usually sweeping the Asian range high or low — to trigger stops and induce retail traders into the wrong side. This is the trap.`,
    `Distribution (New York): the real move. After manipulation grabs liquidity, price reverses and moves in the intended direction. Smart money's positions from accumulation are now in profit. They distribute.`,
    `Why this matters: if you can identify which phase you're in, you stop getting trapped. Asian = wait. London sweep = prepare. NY continuation = execute.\n\n\u{1F4D6} Free cycle lessons: ${edu}\n\u{1F50D} Pentarch (cycles): ${tv.pentarch}`
  ],

  // ── 486  Judas Swing (3→5 tweets) ──
  486: [
    `The Judas Swing: the false move that betrays early traders. Named for a reason. \u{1F9F5}`,
    `How it works: at session open, price moves aggressively in one direction. Retail traders see momentum and enter. Stops are placed. Liquidity is created. Then price reverses sharply the other way.`,
    `The first move is the LIE. It exists to:\n\u{2022} Trigger buy/sell stops from overnight positions\n\u{2022} Induce breakout traders into the wrong direction\n\u{2022} Create liquidity for the real move\n\u{2022} Trap emotional early entries`,
    `How to identify a Judas Swing: aggressive open in one direction, usually sweeping a key level (Asian range, previous session high/low), followed by immediate reversal with displacement candles.`,
    `How to trade it: DON'T trade the initial move. Wait for the reversal. When the Judas Swing sweeps liquidity and shows reversal confirmation, enter in the opposite direction. The betrayal IS the setup.\n\n\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 489  Quarterly Theory (3→5 tweets) ──
  489: [
    `Quarterly Theory: macro cycles that repeat across every timeframe. \u{1F9F5}`,
    `The year divided into four quarters:\nQ1 (Jan-Mar): often accumulation — the year's direction is being built.\nQ2 (Apr-Jun): often manipulation — the first major move, sometimes a fakeout.\nQ3 (Jul-Sep): often distribution — the real directional move.\nQ4 (Oct-Dec): often decline/reset.`,
    `But here's the fractal part: this same pattern applies to each quarter, each month, each week, and each DAY. Every timeframe has its own accumulation, manipulation, distribution, and decline phase.`,
    `Daily fractal: Asian (accumulate) \u{2192} London (manipulate) \u{2192} NY (distribute) \u{2192} NY Close (decline). Weekly: Monday (accumulate) \u{2192} Tuesday (manipulate) \u{2192} Wednesday (distribute) \u{2192} Thursday/Friday (decline).`,
    `Why it matters: if you know WHERE you are in the cycle, you know what to expect next. It's not prediction — it's pattern recognition across time.\n\n\u{1F4D6} Free macro lessons: ${edu}\n\u{1F50D} Pentarch (cycles): ${tv.pentarch}`
  ],

  // ── 492  Market Maker Models (3→5 tweets) ──
  492: [
    `Market Maker Models: understanding how liquidity providers actually operate. \u{1F9F5}`,
    `First, the truth: market makers don't "trade against you." They facilitate. But facilitation requires liquidity on both sides. When there isn't enough, they engineer it. That's not evil — it's mechanics.`,
    `The model:\n1. Accumulate orders in a range (consolidation)\n2. Run stops on one side to create liquidity (stop hunt)\n3. Fill institutional orders against that liquidity\n4. Let price find fair value in the intended direction`,
    `Why retail loses: retail places stops at obvious levels. Those stops ARE the liquidity market makers need. It's not personal — it's physics. Large orders need large liquidity pools to fill.`,
    `How to use it: instead of placing stops at obvious levels, look for where the market maker needs to go for liquidity. That target becomes your trading opportunity, not your risk.\n\n\u{1F4D6} Free market maker lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 496  Algo vs Discretionary (3→5 tweets) ──
  496: [
    `Algorithmic vs Discretionary trading: two paths to the same goal. Which fits you? \u{1F9F5}`,
    `Algorithmic: rules coded into software. Zero emotion. Consistent execution. Backtestable. But it misses nuance. Market regimes change and algorithms lag. Works best in defined conditions.`,
    `Discretionary: human judgment applied in real-time. Reads context, adapts to regimes, catches what algorithms miss. But it invites emotion, fatigue, and inconsistency. Works best with strong discipline.`,
    `The hybrid approach: many successful traders use algorithmic RULES with discretionary FILTERING. The system generates signals. The human decides context. Best of both worlds — but requires both skillsets.`,
    `Which to choose depends on your personality. Love rules and hate ambiguity? Algo. Love reading charts and trust your judgment? Discretionary. Neither is superior. Both can be profitable.\n\n\u{1F4D6} Free education on both: ${edu}\n\u{1F517} ${site}`
  ]
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    if (expansions[post.postNumber]) {
      post.twitter.tweets = expansions[post.postNumber];
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Advanced Education expansion complete: ${updated} posts expanded to 5-6 tweets`);
}

main();
