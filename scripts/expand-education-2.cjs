#!/usr/bin/env node
/**
 * Expand education posts 132–296 from 3 tweets to 5 tweets.
 *
 * Structure:
 *   [0] Hook (existing)
 *   [1] Core concept (existing)
 *   [2] NEW — Practical example / how to apply
 *   [3] NEW — Common mistake / pro tip
 *   [4] CTA (existing tweet[2], moved to position 5)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const expansions = {

  // ── 132  SCALPING STRATEGIES ──
  132: [
    `Say price is bouncing between 100.00 and 100.10 on the 1-minute chart. A scalper buys at .01, sells at .08, pockets 7 ticks. Repeat 20 times. Small edge, high frequency. But one hesitation and slippage eats three wins.`,
    `Biggest scalping mistake: trading during low-volume hours. Spreads widen, fills slip, and your 5-tick target becomes a 3-tick loss. Scalp only during peak session overlap when liquidity is deep.`
  ],

  // ── 136  TRADING PSYCHOLOGY MASTERY ──
  136: [
    `You take a clean setup. It stops out. Next trade — same setup — you skip it. That one runs 4R. Now you're angry and chase a random entry. This is the psychology loop. Recognizing it is step one.`,
    `Pro tip: after two consecutive losses, walk away for 30 minutes. Not because the strategy failed — because your emotional state has shifted. Return when you can evaluate the next setup without the last two influencing you.`
  ],

  // ── 139  ADVANCED CANDLESTICK PATTERNS ──
  139: [
    `Three white soldiers after a long downtrend at a major support level — that is a high-probability reversal setup. The same pattern mid-range? Much less reliable. Always check where the pattern forms, not just what it looks like.`,
    `A common mistake: treating every engulfing candle as a signal. Most engulfing candles in choppy markets are noise. Filter them by requiring the pattern to form at a key level with above-average volume.`
  ],

  // ── 142  CORRELATION TRADING ──
  142: [
    `Real example: you go long ETH and long SOL thinking you are diversified. Both are 0.9+ correlated to BTC. BTC drops 5% — both positions lose. You effectively doubled your risk. That is not diversification.`,
    `Pro tip: check correlations before adding a second position. If two assets have a correlation above 0.7, treat them as one trade for risk management. Your total exposure across correlated positions should stay within your risk limit.`
  ],

  // ── 146  DRAWDOWN MANAGEMENT ──
  146: [
    `You are down 15% on the month. The instinct is to trade bigger to "make it back." This is how 15% becomes 30%. Instead: cut size in half. A smaller position lets you trade without desperation clouding every decision.`,
    `One rule that saves accounts: a daily stop-loss limit. If you lose 3% in a day, you are done for the day. No exceptions. The market will be there tomorrow. Your capital might not be if you keep forcing it.`
  ],

  // ── 149  MTF CONFLUENCE ──
  149: [
    `Practical example: daily shows demand zone at $42k. 4H shows higher low forming inside that zone. 1H prints a bullish engulfing. Three timeframes agree — that is a trade worth taking with a tight stop below the zone.`,
    `The mistake most traders make: starting analysis on the 5-minute chart and trying to find direction. Always go top-down. If the daily trend is bearish, that 5-minute long setup is fighting the current. Direction first, entry last.`
  ],

  // ── 152  GAP TRADING ──
  152: [
    `Monday open: stock gaps up 4% on earnings. Volume is 3x average. Price never looks back. That is a breakaway gap — trying to fade it is fighting momentum. Contrast that with a 1% gap on no news. That one usually fills.`,
    `Common mistake: assuming all gaps fill. Breakaway and runaway gaps often do not fill for weeks or months. Only common gaps and exhaustion gaps fill reliably. Identify the gap type before deciding to trade toward the fill.`
  ],

  // ── 156  TREND EXHAUSTION / ELLIOTT WAVE ──
  156: [
    `Practical application: count the impulse waves. If you can identify wave 3 in progress, ride it — it is usually the strongest. If wave 5 is extending, start tightening stops. The correction is coming.`,
    `Most common Elliott Wave mistake: forcing a count to fit your bias. If the count does not feel obvious, it probably is not there. Wave theory works best on clean, trending charts. Skip it on choppy, sideways action.`
  ],

  // ── 159  FIBONACCI EXTENSIONS / MOVING AVERAGES ──
  159: [
    `Example: price is above the 20 EMA and the 50 SMA, and the 50 just crossed above the 200. Bias is clearly bullish. Now use pullbacks to the 20 EMA as entry opportunities — the trend structure is your guide.`,
    `A mistake many traders make: switching MA periods until they find one that "works" on the current chart. That is curve fitting. Pick your MAs, stick with them across all charts. Consistency matters more than optimization.`
  ],

  // ── 162  BREAKOUT TRADING / MARKET MECHANICS ──
  162: [
    `Here is how it plays out: price consolidates below resistance. Retail sets buy stops just above. Market maker pushes price through, triggering those stops. Then price reverses. The stops were the liquidity they needed.`,
    `Pro tip: instead of placing stops at the obvious level, give yourself a buffer. If everyone's stop is at $100, yours should be at $97. Or better — wait for the breakout to retest the level before entering. Let others get trapped first.`
  ],

  // ── 166  MEAN REVERSION / MA CROSSOVERS ──
  166: [
    `Real application: the golden cross fires on the daily chart. Instead of buying immediately, wait for a pullback to the 50 MA. The cross confirms direction; the pullback gives you a better entry and tighter stop.`,
    `The trap: trading every crossover on lower timeframes. On a 5-minute chart, MAs cross dozens of times a day. Most are noise. Use crossovers on the daily or 4H for direction, then find entries on lower timeframes.`
  ],

  // ── 169  DIVERGENCE / FIBONACCI EXTENSIONS ──
  169: [
    `Practical example: you enter a long at a demand zone. Price rallies. You draw Fibonacci extensions from the swing. Take 25% off at the 127.2% level, another 25% at 161.8%, and let the rest run toward 261.8% with a trailing stop.`,
    `Common mistake with Fib extensions: treating them as exact prices instead of zones. Price rarely hits 161.8% to the tick. Use a zone around each level and look for confirming price action — rejection candles, volume spikes — before acting.`
  ],

  // ── 172  RANGE TRADING ──
  172: [
    `Example: BTC is ranging between $40k support and $42k resistance for two weeks. You buy at $40.2k with a stop at $39.7k, targeting $41.8k. Risk $500 to make $1,600. Repeat until the range breaks. Simple, repeatable.`,
    `The range trader's worst enemy: holding through the breakout. When price closes convincingly beyond the range on strong volume, the range is over. Exit immediately. The strategy no longer applies. Adapt or give back your gains.`
  ],

  // ── 176  ADVANCED ENTRY TECHNIQUES ──
  176: [
    `Break and retest in practice: price breaks above $50 resistance. Instead of chasing, you set a limit buy at $50.10 — now support. Price retests, fills your order, and rallies. Better entry, tighter stop, cleaner risk.`,
    `Mistake traders make: scaling into losers. Scaling in means adding as the trade confirms, not as it moves against you. If you entered at $50 and price drops to $48, adding more is averaging down. That is not the same as scaling in.`
  ],

  // ── 179  INSTITUTIONAL ORDER FLOW ──
  179: [
    `Look at a chart where price barely moves despite heavy selling pressure. The candles have long lower wicks but close near the high. That is absorption — a large buyer is quietly filling orders. The breakout usually follows.`,
    `Retail mistake: interpreting a tight range as "boring" and looking elsewhere. Tight ranges after trends often mean institutions are accumulating. The narrower and longer the range, the more explosive the breakout tends to be.`
  ],

  // ── 182  WYCKOFF ACCUMULATION ──
  182: [
    `The Spring is where most traders get shaken out. Price breaks below the range low, triggers every stop below support, then immediately reverses. If you recognize the Spring, you enter where everyone else exits.`,
    `Most common Wyckoff mistake: labeling every pullback as a Spring. A real Spring occurs within a clear accumulation schematic — after SC, AR, and ST have already formed. Without the prior structure, you are just guessing.`
  ],

  // ── 186  WYCKOFF DISTRIBUTION ──
  186: [
    `The Upthrust (UT) is the mirror of the Spring. Price breaks above the trading range, trapping breakout buyers, then reverses sharply. It is the last gasp of demand before supply takes control. Recognize it and protect your longs.`,
    `Pro tip: compare volume on the Buying Climax vs. the Upthrust. If the UT shows lower volume than the BC, demand is weakening. That divergence between price (new high) and volume (lower) confirms distribution is underway.`
  ],

  // ── 189  MARKET PROFILE BASICS ──
  189: [
    `Here is how to apply it: if price opens above yesterday's value area and holds, expect continuation higher. If it opens above but falls back inside, expect a return to the POC. The value area becomes your roadmap.`,
    `Mistake traders make: ignoring the Point of Control. The POC is where the most volume traded — it acts like a magnet. In rangy markets, price gravitates to the POC repeatedly. Use it as a mean reversion target, not a breakout level.`
  ],

  // ── 192  AUCTION MARKET THEORY ──
  192: [
    `When price moves away from a value area and gets rejected, it is telling you: "That price was unfair." The rejection sends price back toward balance. This is your mean reversion trade — entry at the rejection, target at value.`,
    `The key mistake with AMT: assuming balance means "do nothing." A balanced market still offers trades at the extremes of the range. Buy the low end, sell the high end. Balance is not absence of opportunity — it is a different kind.`
  ],

  // ── 196  DELTA VOLUME ANALYSIS ──
  196: [
    `Practical example: price makes a new low, but delta is positive. Sellers pushed price down, but net buying was actually occurring. That is absorption — large players buying into the selling. Watch for reversal within the next few candles.`,
    `Mistake: only watching delta direction. A single positive delta bar in a strong downtrend does not mean reversal. Look for delta divergence over multiple bars — price making lower lows while delta makes higher lows. That is the real signal.`
  ],

  // ── 199  INTERMARKET ANALYSIS ──
  199: [
    `Example: DXY breaks out to a new weekly high. You are considering a long on gold. Stop. Gold and DXY are inversely correlated. A strong dollar typically pressures gold. Your gold long is fighting a headwind. Wait for the dollar to weaken first.`,
    `Common mistake: assuming correlations are permanent. BTC and tech stocks were tightly correlated in 2022, less so in other periods. Correlations shift. Check them periodically. What worked six months ago may not apply today.`
  ],

  // ── 202  PRICE ACTION CONTEXT ──
  202: [
    `Two charts. Same bullish engulfing candle. Chart A: the engulfing forms at a weekly support zone with rising volume. Chart B: it forms in the middle of a range on low volume. Same pattern. Completely different probability.`,
    `Pro tip: before you trade any pattern, ask three questions. Where is it on the higher timeframe? Is volume confirming? Does it align with the trend? If you cannot answer yes to at least two, skip it. Patience pays more than patterns.`
  ],

  // ── 206  TRADING THE OPEN ──
  206: [
    `Real scenario: market opens, spikes up 1% in the first 10 minutes. New traders chase the long. By 10:30 AM, it has reversed the entire move and is now red. The opening spike was a liquidity grab. The real direction revealed itself after.`,
    `A pro habit: mark the opening 30-minute high and low. Then wait. If price breaks and holds above that high, the intraday bias is bullish. Below the low, bearish. No action inside the range. This one rule filters out most opening noise.`
  ],

  // ── 209  OPTIMAL TRADE ENTRY (OTE) ──
  209: [
    `Scenario: BTC rallies from $38k to $42k. Pulls back. You draw your Fib and see the 62-79% zone sits at $39.5k-$38.8k. There is also an order block at $39.2k. You set your limit order there. Tight stop, great R:R.`,
    `Mistake traders make with OTE: forcing it when the retracement is shallow. If price only pulls back to the 38.2% level and bounces, that is not an OTE — and chasing it late ruins the risk:reward. Wait for the deep pull or skip the trade.`
  ],

  // ── 212  LIQUIDITY VOIDS ──
  212: [
    `Example: BTC drops from $45k to $41k in one 4H candle. Almost no trading occurred between $43k and $44.5k — that is the void. When price rallies back, watch for a reaction in that $43k-$44.5k zone. It often acts as resistance.`,
    `Not all voids fill. If price creates a void during a strong trend-starting move with massive volume, it may never come back. Voids from news-driven spikes fill more reliably than voids from genuine trend initiations. Context matters.`
  ],

  // ── 216  BREAKER BLOCKS ──
  216: [
    `Example: a bullish order block at $50 holds twice. Third time, price slices through it. That OB has failed and is now a bearish breaker. When price rallies back to $50, expect selling — institutions are exiting their underwater long.`,
    `Pro tip: breaker blocks work best when they align with a Fibonacci retracement level. A failed OB at the 61.8% retrace is a high-conviction short setup. The confluence of institutional positioning and mathematical level adds edge.`
  ],

  // ── 219  MITIGATION BLOCKS ──
  219: [
    `Example: institutions bought heavily at $100. Price dropped to $80. Months later, price returns to $100. Those institutions sell to exit at breakeven. That selling pressure at $100 is why "old support" becomes resistance. Mitigation in action.`,
    `Common error: confusing mitigation blocks with fresh order blocks. A fresh OB is where new positions were initiated. A mitigation block is where old losing positions are being closed. The reaction at a mitigation block tends to be weaker and shorter-lived.`
  ],

  // ── 222  KILL ZONES ──
  222: [
    `In practice: you see a clean setup forming at 9:15 AM EST. New York open kill zone. Volume is surging. This is when you want to be engaged. The same setup at 1 PM EST during the afternoon lull? Lower volume, lower probability.`,
    `Pro tip: track your win rate by session. Many traders discover they are profitable during NY open and unprofitable during London close. Once you know which kill zone suits your style, trade only that window. Fewer trades, better results.`
  ],

  // ── 224  QUOTE CARD: EXPENSIVE LESSONS ──
  224: [
    `Think about it: one blown account teaches you risk management. That lesson cost $5,000. The same lesson is written in a free chapter online. The content is identical. Only the cost differs. Choose the cheaper version.`,
    `Pro tip: treat free education with the same seriousness as paid courses. The value is in the application, not the price tag. Journal what you learn. Backtest what you read. Knowledge without practice is just entertainment.`
  ],

  // ── 226  PREMIUM & DISCOUNT ZONES ──
  226: [
    `Example: the recent swing low is $38k and swing high is $42k. Equilibrium is $40k. Price pulls back to $38.8k — deep discount. There is an order block here. This is where you want to buy, not up at $41.5k in premium.`,
    `The mistake: buying breakouts in premium zones. Price breaks above resistance at $42k and you chase it. But $42k is premium. Even if it continues, your risk:reward is poor. Wait for the pullback into discount. Let price come to you.`
  ],

  // ── 229  ICT MARKET STRUCTURE SHIFT ──
  229: [
    `In practice: an uptrend with consistent HH/HL. Then price fails to make a new HH and breaks below the last HL. That break is the MSS. It does not mean "short now" — it means "stop looking for longs until structure confirms."`,
    `Mistake: treating every pullback as an MSS. A pullback within the trend is normal. MSS requires the actual structural level — the last higher low in an uptrend — to be broken and closed below. Wicks below do not count. Closes do.`
  ],

  // ── 232  POWER OF THREE (AMD) ──
  232: [
    `Watch a daily BTC candle: Asian session builds a tight range (accumulation). London opens, price dips below the range low, grabbing stops (manipulation). NY session reverses and trends up all day (distribution). AMD in one candle.`,
    `Pro tip: identify the manipulation phase and you have the trade. If London sweeps the Asian low, that is likely the manipulation. The NY move should go in the opposite direction. Wait for the sweep, confirm the reversal, enter with structure.`
  ],

  // ── 236  JUDAS SWING ──
  236: [
    `Example: your higher-timeframe bias is bullish. London opens and price drops sharply, taking out the Asian session low. Stops triggered. Then price reverses hard and rallies above the Asian high. That initial drop was the Judas swing — the fake.`,
    `The mistake: reacting to the Judas move as if it is real. If your daily bias is bullish and the London open dumps, do not short the move. Wait for the reversal. The Judas swing is designed to create panic. Do not participate in the panic.`
  ],

  // ── 239  OPTIMAL TRADE MANAGEMENT ──
  239: [
    `In practice: you enter long at $100 with a stop at $98 (1R = $2). Price hits $102 — move stop to $100 (breakeven). Price hits $104 — take 50% off. Trail the rest below each new higher low. Risk is eliminated, profits are locked.`,
    `Common mistake: moving your stop to breakeven too early. If price has only moved 0.5R, a breakeven stop is too tight — normal market noise will hit it. Wait for 1R of movement before going breakeven. Give the trade room to breathe first.`
  ],

  // ── 242  SESSION TIMING & INSTITUTIONAL FLOW ──
  242: [
    `Practical approach: mark the Asian session range on your chart every day. Then watch how London interacts with it. If London breaks above, bias is bullish for NY. If London breaks below, bias is bearish. The Asian range is your reference.`,
    `Mistake: trading the Asian session with trending strategies. Asia is accumulation — price ranges. Breakout strategies fail here. Save your trend trades for London and NY. Match your strategy to the session's character.`
  ],

  // ── 246  FAIR VALUE GAPS: INSTITUTIONAL FOOTPRINTS ──
  246: [
    `Example: three bullish candles where candle 1's high is $99 and candle 3's low is $101. That $99-$101 gap is a bullish FVG. When price pulls back into this zone, it often acts as support. Enter long inside the gap with a stop below candle 1.`,
    `Pro tip: not all FVGs are equal. An FVG created during a kill zone with high volume is more significant than one formed during low-volume hours. Prioritize FVGs that occur during London or NY sessions — those reflect institutional activity.`
  ],

  // ── 249  LIQUIDITY POOLS: WHERE STOPS CLUSTER ──
  249: [
    `Example: BTC has tested $40k support three times and bounced. Below $40k? Thousands of stop losses from those long entries. Price eventually sweeps below $40k, triggers those stops, then immediately reverses and rallies hard.`,
    `Pro tip: use equal highs and equal lows as your liquidity map. When price forms obvious double or triple tops, the buy stops sit just above. Smart money knows this. Rather than going long at the double top breakout, wait for the sweep and reversal.`
  ],

  // ── 252  ORDER BLOCKS: INSTITUTIONAL ENTRY ZONES ──
  252: [
    `Practical example: before a strong rally from $95 to $110, the last bearish candle was at $96. That is your bullish order block. When price retraces to the $95-$96 zone, look for a reaction — institutions are likely defending their position there.`,
    `The mistake: treating every consolidation as an order block. A true OB precedes a strong, impulsive move with displacement. If the candle before the rally was a small doji in a choppy zone, that is not institutional positioning. Look for clean departures.`
  ],

  // ── 256  BREAKER BLOCKS: FAILED ORDER BLOCKS ──
  256: [
    `In practice: a demand zone at $50 held price up three times. On the fourth test, price slices through. Now when price rallies back to $50, those trapped longs sell to exit. That selling turns $50 from support into resistance. Trade accordingly.`,
    `Mistake: assuming every broken level becomes a strong breaker. The strength of a breaker depends on how many orders were trapped. A level that held once and broke is weak. A level that held five times and then broke? Significant trapped positions. Stronger breaker.`
  ],

  // ── 259  MITIGATION BLOCKS: UNFILLED ORDERS ──
  259: [
    `Scenario: price rallies aggressively from $80, hits $100, then crashes to $60. That $80 origin has unfilled institutional orders. When price returns to $80 months later, those orders may still be active — creating a reaction zone worth watching.`,
    `Pro tip: combine mitigation blocks with premium/discount analysis. A mitigation block in a discount zone has higher probability than one in premium. The math and the institutional footprint both favor your trade. That is real confluence.`
  ],

  // ── 262  DISPLACEMENT: MOMENTUM REVEALS INTENT ──
  262: [
    `Example: after ranging between $50-$52 for a week, a single 4H candle closes at $55 with 3x average volume. That is displacement. The direction has been chosen. Any pullback toward $52 is now a buying opportunity, not a reason to short.`,
    `Mistake: confusing a news spike with displacement. A large candle on a random headline that immediately reverses is not institutional intent. True displacement holds. Check the next few candles — if they consolidate near the extreme, the move is genuine.`
  ],

  // ── 266  OPTIMAL TRADE ENTRY (OTE) ──
  266: [
    `Step by step: identify the impulse leg. Draw Fib from swing low to swing high. The 62-79% zone is your OTE. Now look for an order block or FVG overlapping that zone. When price pulls back there with confirming price action, that is your entry.`,
    `Common mistake: using OTE on every retracement regardless of context. OTE works best after a clear impulse move on the higher timeframe. If the move was choppy and overlapping, the retracement levels are unreliable. Clean impulse = clean OTE. No impulse = no trade.`
  ],

  // ── 269  KILL ZONES: HIGH-PROBABILITY WINDOWS ──
  269: [
    `Here is how to apply it: set a TradingView alert for London open (2 AM EST). Check your bias from the daily chart. Wait for the Judas swing. Enter during the kill zone with the trend. Done by 11 AM. The rest of the day is yours.`,
    `Pro tip: if you missed the London or NY open kill zone, do not force a trade in the dead zone. Low-volume periods between sessions produce choppy price action that stops out good setups. Patience during dead zones protects the wins from kill zones.`
  ],

  // ── 272  MARKET MAKER MODELS ──
  272: [
    `Watch it on a 15-minute chart: price ranges for 2 hours (accumulation). Then a sharp spike down takes the low (manipulation). Within 30 minutes, price reverses and trends up past the range high (distribution). AMD from start to finish.`,
    `Mistake: seeing AMD everywhere. Not every range is accumulation. Not every spike is manipulation. The model requires clear sequence — and ideally aligns with higher-timeframe direction and kill zone timing. Apply it selectively, not universally.`
  ],

  // ── 276  LIQUIDITY SWEEPS VS BREAKOUTS ──
  276: [
    `Example: price breaks above resistance at $50. The candle wicks to $50.30 but closes at $49.80 — back below. That is a sweep, not a breakout. Next trade: short with a stop above the sweep high. Target the opposite liquidity pool below.`,
    `Mistake traders make: waiting for the "perfect" close and missing the trade entirely. You do not need perfection — you need evidence. A wick above the level with a close back inside, plus volume dying after the spike, is sufficient evidence of a sweep.`
  ],

  // ── 279  PREMIUM & DISCOUNT ARRAYS ──
  279: [
    `In practice: the current range is $100 (low) to $110 (high). Equilibrium is $105. An order block sits at $102. That is a discount OB — high probability long zone. You would not take the same OB if it sat at $108. That would be premium.`,
    `Mistake: ignoring premium/discount because it seems too simple. It is simple. That is the point. Before every trade, determine if price is in premium or discount relative to the current range. Buy discount, sell premium. This one filter eliminates many bad trades.`
  ],

  // ── 282  INDUCEMENT: THE TRAP BEFORE THE MOVE ──
  282: [
    `In practice: there is a minor swing low at $99 and a major swing low at $97. Price takes out the $99 low — that is inducement. Retail shorts pile in. Then price drops to sweep $97, reverses, and runs up hard. The $99 grab was bait. The $97 sweep was the real move.`,
    `Pro tip: map out both minor and major liquidity levels on your chart. When price takes a minor level, do not assume the move is done. Ask: is there a bigger pool nearby? If yes, wait. The inducement often leads to the real liquidity grab just below.`
  ],

  // ── 286  RETURN TO ORIGIN (RTO) ──
  286: [
    `Example: a strong bullish displacement candle launches from $45. Price rallies to $52. Days later, price retraces back to $45 — the origin. You see a bullish reaction candle at $45 with rising delta. Enter long. Stop below $44.50. Target $52 retest.`,
    `Common mistake: assuming every origin gets revisited. Some impulse moves never retrace. RTO is a "when it happens" setup, not a guarantee. Do not sit and wait for a return that may not come. Use alerts at origin zones and trade other setups in the meantime.`
  ],

  // ── 289  INSTITUTIONAL ORDER FLOW ENTRY DRILLS ──
  289: [
    `Full drill walkthrough: daily is bearish. 4H shows a supply zone (OB) at $48k in premium. Price retraces to $48k during NY kill zone. 1H shows bearish displacement. Enter short at $47.8k. Stop above OB. Target the daily low liquidity at $44k.`,
    `The mistake with IOFED: skipping steps. You need ALL the pieces — direction, zone, timing, confirmation. If you enter just because price reached an order block but timing is wrong or you have no displacement, the probability drops significantly. Discipline is the drill.`
  ],

  // ── 292  MARKET STRUCTURE FUNDAMENTALS ──
  292: [
    `Practical exercise: pull up any daily chart. Mark the swing highs and lows over the past 3 months. Are the highs getting higher and lows getting higher? Uptrend. The opposite? Downtrend. Neither? Range. Now you have your bias before doing anything else.`,
    `Biggest mistake with structure: confusing noise with signal. A single lower low in an uptrend does not mean the trend is over. Structure changes require a break AND a close through the key level, followed by continuation. One candle is not a trend change.`
  ],

  // ── 296  SUPPORT & RESISTANCE BASICS ──
  296: [
    `Example: a stock bounces off $150 three times over two months. On the fourth test, it breaks below and closes at $148. A week later, price rallies back to $150 and gets rejected. Support has flipped to resistance. The memory of that level works both ways.`,
    `Common mistake: drawing too many S&R lines. Your chart should not look like a barcode. Focus on the levels that have the most touches, the most recent reactions, and the highest timeframe significance. Three strong levels beat twenty weak ones.`
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
  console.log(`Education expansion 2: ${updated} posts expanded from 3→5 tweets`);
}

main();
