#!/usr/bin/env node
/**
 * Batch 8 — Posts 401-500 (80 posts)
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
  // ── 401  Education Recap – What's Next After 400 ──
  401: [
    `400 posts complete. But education never stops. Here's what's next. \u{1F9F5}`,
    `Deeper concept exploration. Advanced smart money techniques. More psychology deep dives. More indicator walkthroughs. More real chart breakdowns. The foundation is built — now we go deeper.`,
    `\u{1F4D6} Start from lesson 1: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 402  Advanced Education – Wyckoff Accumulation ──
  402: [
    `Wyckoff Accumulation: the blueprint of market bottoms. \u{1F9F5}`,
    `PS \u{2192} SC \u{2192} AR \u{2192} ST \u{2192} Spring \u{2192} Test \u{2192} SOS \u{2192} LPS \u{2192} BU. Smart money absorbs supply before the markup. The Spring is the shakeout that traps sellers before the real move begins.`,
    `\u{1F4D6} Free Wyckoff lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 403  Blog – Trading Burnout ──
  403: [
    `Trading burnout is real. And it's more common than you think. \u{1F9F5}`,
    `Signs: dreading market open. Constant fatigue. Unable to focus. Taking trades you don't believe in. The fix isn't more screen time — it's stepping back, resetting, and remembering why you started.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Mental health matters: ${edu}`
  ],

  // ── 404  Quote – Consistency Compounds ──
  404: [
    `"Small consistent wins beat occasional big wins. Consistency compounds." \u{1F9F5}`,
    `Inconsistency destroys accounts. One massive win followed by three revenge trades nets zero. Small, repeatable edge applied 200 times? That's a career. Boring builds wealth.`,
    `\u{1F4A1} Build consistency: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 406  Advanced Education – Wyckoff Distribution ──
  406: [
    `Wyckoff Distribution: the blueprint of market tops. \u{1F9F5}`,
    `PSY \u{2192} BC \u{2192} AR \u{2192} ST \u{2192} UT \u{2192} UTAD \u{2192} LPSY \u{2192} SOW. Smart money distributes holdings before the markdown. The UTAD is the fakeout that traps buyers before the real drop.`,
    `\u{1F4D6} Free Wyckoff lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 407  Blog – No Trading Secrets ──
  407: [
    `There are no trading secrets. Everything works. Nothing works all the time. \u{1F9F5}`,
    `The "secret" isn't a pattern, indicator, or setup. It's risk management + discipline + time. The traders who make it aren't smarter — they're more consistent and they manage losses better.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn what actually works: ${edu}`
  ],

  // ── 409  Advanced Education – ICT Concepts ──
  409: [
    `ICT concepts overview: the language of institutional trading. \u{1F9F5}`,
    `Order blocks. Fair value gaps. Liquidity pools. Kill zones. Displacement. These aren't magic — they're frameworks for understanding where institutional orders likely sit. Context, not signals.`,
    `\u{1F4D6} Free ICT education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 410  Docs – Multi-Chart Layouts ──
  410: [
    `See more. Trade better. Multi-chart layouts change how you analyze. \u{1F9F5}`,
    `View multiple timeframes simultaneously. Compare correlated assets side by side. Run different indicators on different charts. One screen, complete context. TradingView makes this simple.`,
    `\u{1F4D6} Layout guide: ${docsHome}\n\u{1F517} The indicators: ${site}`
  ],

  // ── 411  Marketing – Education Hub ──
  411: [
    `82 lessons. 4 skill levels. Zero fluff. \u{1F9F5}`,
    `Beginner \u{2192} Intermediate \u{2192} Advanced \u{2192} Professional. Complete curriculum from candlestick basics to Wyckoff and smart money concepts. Every lesson free. No paywall on knowledge.`,
    `\u{1F393} Start learning: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 412  Advanced Education – Market Structure Shift ──
  412: [
    `Market Structure Shift (MSS): when the trend changes character. \u{1F9F5}`,
    `Higher high fails to form. Lower low breaks the sequence. The structure that held is now broken. MSS doesn't guarantee reversal — but it says the current trend is losing control. Pay attention.`,
    `\u{1F4D6} Free structure lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 413  Blog – Building a Trading System ──
  413: [
    `A trading system isn't just a strategy. It's a complete framework. \u{1F9F5}`,
    `Entry rules. Exit rules. Risk management. Position sizing. Journaling process. Review schedule. Mental rules. Without ALL of these, you have a strategy. With them, you have a business.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Build your system: ${edu}`
  ],

  // ── 414  Quote – Trust Your Preparation ──
  414: [
    `"In the moment, trust your preparation. Doubt should happen before the trade, not during." \u{1F9F5}`,
    `If you prepared properly, execute. If you didn't, don't trade. Hesitation during execution means your preparation was incomplete. Fix the prep, not the execution.`,
    `\u{1F4A1} Prepare better: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 416  Advanced Education – Change of Character ──
  416: [
    `Change of Character (ChOCH): the first sign structure may shift. \u{1F9F5}`,
    `In an uptrend: the first lower low. In a downtrend: the first higher high. ChOCH isn't confirmation — it's the warning shot. It says "something is changing." What you do next determines profit or loss.`,
    `\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 417  Blog – Perfectionism in Trading ──
  417: [
    `Perfectionism in trading is expensive. Here's what it costs you. \u{1F9F5}`,
    `Waiting for perfect setup = missing setups. Perfect risk-reward = never entering. Perfect indicator alignment = analysis paralysis. "Good enough" with risk management beats "perfect" that never trades.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn to execute: ${edu}`
  ],

  // ── 419  Advanced Education – Break of Structure ──
  419: [
    `Break of Structure (BOS): trend continuation confirmed. \u{1F9F5}`,
    `In an uptrend: new higher high established. In a downtrend: new lower low established. BOS confirms the trend is intact and continuing. It's not a reversal signal — it's a continuation stamp.`,
    `\u{1F4D6} Free structure lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 420  Docs – Backtesting in TradingView ──
  420: [
    `Backtest strategies in TradingView. Test before you risk. \u{1F9F5}`,
    `Bar Replay for manual testing. Strategy Tester for automated results. Pine Script for custom rules. Test your edge on 200+ trades before putting real money behind it. Data > hope.`,
    `\u{1F4D6} Testing guide: ${docsHome}\n\u{1F517} Our indicators: ${site}`
  ],

  // ── 421  Marketing – Indicators Work Together ──
  421: [
    `Signal Pilot indicators are designed to work together. Stack your edge. \u{1F9F5}`,
    `Use one for focus. Combine two for context. Three for confluence. Pentarch for cycles + Volume Oracle for regime + Janus Atlas for levels = multi-dimensional analysis from one toolkit.`,
    `\u{1F6E0}\uFE0F See all 7: ${site}\n\u{1F4D6} How they work together: ${docsHome}`
  ],

  // ── 422  Advanced Education – Liquidity Clusters ──
  422: [
    `Liquidity doesn't hide — it clusters. Learn where it sits. \u{1F9F5}`,
    `Equal highs. Equal lows. Obvious stop zones. Trendline touches. Round numbers. These are liquidity magnets. Price gravitates toward liquidity before making its real move. The trap before the direction.`,
    `\u{1F4D6} Free liquidity lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 423  Blog – Impatience Costs ──
  423: [
    `Most trading losses come from impatience, not bad analysis. \u{1F9F5}`,
    `The setup was right. The analysis was correct. But you entered too early. Or moved your stop too tight. Or took profit too fast. Impatience turns good ideas into bad trades.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Patience education: ${edu}`
  ],

  // ── 424  Quote – Simplicity Performs ──
  424: [
    `"Complexity impresses. Simplicity performs." \u{1F9F5}`,
    `The traders with 12 indicators on their chart aren't outperforming the ones with 3. More complexity = more noise = more confusion = more bad decisions. Simplify ruthlessly.`,
    `\u{1F4A1} Simple education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 426  Advanced Education – Order Flow ──
  426: [
    `Price moves because of orders, not indicators. Understand order flow. \u{1F9F5}`,
    `Where buyers and sellers are positioned. Where stops cluster. Where pending orders create liquidity. Indicators react to price. Order flow explains WHY price moves where it does.`,
    `\u{1F4D6} Free order flow lessons: ${edu}\n\u{1F50D} Plutus Flow: ${tv.plutusFlow}`
  ],

  // ── 427  Blog – Position Sizing Psychology ──
  427: [
    `Position sizing isn't just math — it's psychology. \u{1F9F5}`,
    `Too big \u{2192} fear dominates decisions, you cut winners early, you panic at drawdowns. Too small \u{2192} boredom, overtrading, reckless behavior. The right size lets you think clearly. That's the real metric.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Risk management: ${edu}`
  ],

  // ── 429  Advanced Education – Fair Value Gaps ──
  429: [
    `Fair Value Gaps form when price moves too fast. The imbalance left behind matters. \u{1F9F5}`,
    `No overlap between candles = inefficiency. Price often returns to fill the gap before continuing. FVGs aren't signals — they're zones of interest. Context determines if price respects or ignores them.`,
    `\u{1F4D6} Free FVG lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 430  Docs – Alerts ──
  430: [
    `Set alerts. Step away. Let the system watch for you. \u{1F9F5}`,
    `Signal Pilot indicators support TradingView's alert system. Set conditions like "Pentarch phase change" or "Volume Oracle regime shift" and get notified. Stop staring. Start living.`,
    `\u{1F4D6} Alert setup guide: ${docsHome}\n\u{1F517} The indicators: ${site}`
  ],

  // ── 431  Marketing – Free Education ──
  431: [
    `82 lessons. Zero cost. Beginner to professional. \u{1F9F5}`,
    `Complete curriculum. No paywall on education. No "premium content" bait-and-switch. The education hub is 100% free because educated traders make better decisions — and better communities.`,
    `\u{1F393} Start now: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 432  Advanced Education – Inducement ──
  432: [
    `Inducement is the bait. The trap is the move that follows. \u{1F9F5}`,
    `Price breaks a level \u{2192} retail traders enter \u{2192} smart money takes the other side \u{2192} price reverses. Inducement creates the liquidity that institutions need to fill their orders. You're either the hunter or the hunted.`,
    `\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 433  Blog – Breaking Rules ──
  433: [
    `"Just this once" is the most expensive phrase in trading. \u{1F9F5}`,
    `Rules exist for a reason. Breaking them "just this time" works occasionally — and that's what makes it dangerous. One exception becomes a habit. One habit becomes a blown account.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Discipline education: ${edu}`
  ],

  // ── 434  Quote – Market Rewards Alignment ──
  434: [
    `"The market doesn't reward effort. It rewards alignment." \u{1F9F5}`,
    `Working harder doesn't mean trading better. More screen time doesn't equal more profit. The market rewards alignment with structure, with trend, with probability. Work smart, not hard.`,
    `\u{1F4A1} Get aligned: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 436  Advanced Education – Premium & Discount Zones ──
  436: [
    `Not all entries are equal. Premium zone vs discount zone matters. \u{1F9F5}`,
    `Premium = upper range (expensive to buy). Discount = lower range (cheap to buy). In an uptrend, buy the discount. In a downtrend, sell the premium. Same setup, different zone = different probability.`,
    `\u{1F4D6} Free zone analysis lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 437  Blog – Perfect Setup Myth ──
  437: [
    `The perfect setup doesn't exist. Waiting for zero risk means never trading. \u{1F9F5}`,
    `Every trade has uncertainty. Every entry has risk. The goal isn't zero risk — it's managed risk. A setup that's 70% aligned with a 1:2 reward? That's a trade. Stop waiting for 100%.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn to execute: ${edu}`
  ],

  // ── 439  Advanced Education – Mitigation Blocks ──
  439: [
    `Mitigation blocks: where unfinished business lives on the chart. \u{1F9F5}`,
    `Price returns to "mitigate" orders left behind. A previous area of loss becomes an area of reaction. Smart money re-enters where they previously exited at a loss. The chart has memory.`,
    `\u{1F4D6} Free block lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 440  Docs – Timeframe Guide ──
  440: [
    `Your timeframe shapes your trading style. Choose wisely. \u{1F9F5}`,
    `Higher TF = bigger picture, fewer signals, more patience required. Lower TF = more signals, more noise, faster decisions. Match your timeframe to your lifestyle, not someone else's preference.`,
    `\u{1F4D6} Timeframe guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 441  Marketing – Risk-Free Trial ──
  441: [
    `Try Signal Pilot risk-free. 7-day money-back guarantee. No questions asked. \u{1F9F5}`,
    `If it's not for you, we refund everything. No hoops. No retention calls. No guilt trips. We'd rather you try and decide than wonder from the sideline. Confidence in what we built.`,
    `\u{1F6E0}\uFE0F Try it: ${site}\n\u{1F393} Free education first: ${edu}`
  ],

  // ── 442  Advanced Education – Breaker Blocks ──
  442: [
    `Breaker blocks form when structure fails. Old support becomes new resistance. \u{1F9F5}`,
    `Old resistance becomes new support. When a level breaks, the orders that defended it are gone — and the remnants create a new reaction zone. Failed structure leaves opportunity.`,
    `\u{1F4D6} Free breaker block lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 443  Blog – Losing Streaks ──
  443: [
    `Losing streaks end. The question is how you respond during them. \u{1F9F5}`,
    `Revenge trading extends the pain. Doubling down amplifies losses. The pros? They cut size, review the journal, and wait for clarity. How you handle a drawdown defines your career.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Psychology education: ${edu}`
  ],

  // ── 444  Quote – Confidence From Preparation ──
  444: [
    `"Confidence comes from preparation, not prediction." \u{1F9F5}`,
    `You don't need to know where price is going. You need to know what you'll do when it gets there. Prepared for up, down, or sideways — that's real confidence. Prediction is guessing.`,
    `\u{1F4A1} Prepare properly: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 446  Advanced Education – OTE Zone ──
  446: [
    `OTE zone: the 62-79% retracement sweet spot. \u{1F9F5}`,
    `Optimal Trade Entry. Not a guarantee — a probability zone where pullbacks often find support within a trending move. When OTE aligns with an order block or FVG, the confluence is powerful.`,
    `\u{1F4D6} Free OTE lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 447  Blog – Journal Tells You Why ──
  447: [
    `Your P&L tells you what happened. Your journal tells you why. \u{1F9F5}`,
    `Track emotions. Track decisions. Track what you were thinking before, during, and after. A month of honest journaling reveals more about your edge than any indicator ever could.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Start journaling: ${edu}`
  ],

  // ── 449  Advanced Education – Swing Failure Pattern ──
  449: [
    `Swing Failure Pattern: price breaks a swing, then fails to hold. The trap is set. \u{1F9F5}`,
    `New high \u{2192} closes below previous high \u{2192} reversal begins. New low \u{2192} closes above previous low \u{2192} bounce begins. SFP is the market saying "we went there to grab liquidity, not to stay."`,
    `\u{1F4D6} Free SFP lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 450  Docs – Custom Settings ──
  450: [
    `Every trader is different. Your indicator settings should be too. \u{1F9F5}`,
    `Signal Pilot indicators ship with optimized defaults, but every parameter is adjustable. Tweak sensitivity, colors, timeframes, and thresholds to match YOUR strategy. The docs show you how.`,
    `\u{1F4D6} Settings documentation: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 451  Marketing – No Contracts ──
  451: [
    `No contracts. No commitments. No tricks. Subscribe monthly. Cancel anytime. \u{1F9F5}`,
    `If you stay, it's because the tools work. If you leave, no hard feelings. We don't need lock-in to retain subscribers. We need indicators that deliver value. That's our retention strategy.`,
    `\u{1F6E0}\uFE0F See plans: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 452  Advanced Education – Wyckoff Accumulation Recap ──
  452: [
    `Wyckoff accumulation: the blueprint of bottoms. Let's break it down deeper. \u{1F9F5}`,
    `PS \u{2192} SC \u{2192} AR \u{2192} ST \u{2192} Spring \u{2192} Test \u{2192} SOS \u{2192} LPS \u{2192} BU. The Spring is where weak hands sell and strong hands buy. The Test confirms the Spring held. Then markup begins.`,
    `\u{1F4D6} Free Wyckoff education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 453  Blog – Hindsight Bias ──
  453: [
    `Every chart looks obvious in hindsight. Don't let that fool you. \u{1F9F5}`,
    `"I would have seen that" is a dangerous thought. In real time, the right side of the chart is blank. You don't have the luxury of knowing what happens next. Trade the uncertainty. That's the skill.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Real education: ${edu}`
  ],

  // ── 454  Quote – Surviving Losses ──
  454: [
    `"Risk management isn't about avoiding losses. It's about surviving them." \u{1F9F5}`,
    `You will lose. Every trader does. The question is whether a loss takes 1% of your account or 20%. Risk management doesn't prevent bad trades — it prevents one bad trade from ending your career.`,
    `\u{1F4A1} Learn to survive: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 456  Advanced Education – Wyckoff Distribution Recap ──
  456: [
    `Wyckoff distribution: the blueprint of tops. Let's go deeper. \u{1F9F5}`,
    `PSY \u{2192} BC \u{2192} AR \u{2192} ST \u{2192} UT/UTAD \u{2192} Test \u{2192} SOW \u{2192} LPSY. The UTAD is where strong hands sell and weak hands buy the "breakout." Then markdown begins. The exit, not the entry.`,
    `\u{1F4D6} Free Wyckoff education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 457  Blog – Pre-Trade Checklist ──
  457: [
    `A checklist catches what emotions miss. Use one before every trade. \u{1F9F5}`,
    `Setup valid? Confluences present? Risk defined? Position sized correctly? Not revenge trading? Not chasing? If you can't check every box, you don't have a trade. You have an impulse.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Build your checklist: ${edu}`
  ],

  // ── 459  Advanced Education – Inverse FVG ──
  459: [
    `Inverse FVG: when a filled gap becomes a zone of interest. \u{1F9F5}`,
    `Price fills the fair value gap, then that zone becomes support or resistance. The previous inefficiency is resolved — but the area now holds significance as a decision point. Levels have layers.`,
    `\u{1F4D6} Free FVG lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 460  Docs – Troubleshooting ──
  460: [
    `Indicator not loading? Alerts not firing? Most issues have simple fixes. \u{1F9F5}`,
    `Our troubleshooting guide covers the top 20 issues with step-by-step solutions. Before reaching out to support, check the docs — 90% of problems resolve in under 2 minutes.`,
    `\u{1F4D6} Troubleshooting guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 461  Marketing – Lifetime Plan ──
  461: [
    `Pay once. Access forever. Lifetime plan: $999. \u{1F9F5}`,
    `No more monthly fees. No renewal stress. No surprise charges. Every future update included. Every new indicator included. One payment. Lifetime access. For traders who know they're staying.`,
    `\u{1F6E0}\uFE0F See all plans: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 462  Advanced Education – Liquidity Sweeps vs Grabs ──
  462: [
    `Not all liquidity hunts are equal. Sweeps vs grabs vs raids. \u{1F9F5}`,
    `Sweep: quick wick, immediate reversal. Grab: deeper penetration, slower reversal. Raid: sustained move through liquidity. Each tells a different story about institutional intent.`,
    `\u{1F4D6} Free liquidity lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 463  Blog – Types of Edge ──
  463: [
    `Not all edges are the same. Know which one is yours. \u{1F9F5}`,
    `Analytical edge: better chart reads. Informational edge: better data. Behavioral edge: better discipline. Most retail traders' real edge? Behavioral. It's not about seeing more — it's about doing less wrong.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Find your edge: ${edu}`
  ],

  // ── 464  Quote – Wrong Better ──
  464: [
    `"The best traders aren't right more often. They're wrong better." \u{1F9F5}`,
    `Small losses, fast exits, no ego. Being wrong is part of the business. How you handle being wrong — that's your actual edge. The best traders lose gracefully and move on.`,
    `\u{1F4A1} Learn to lose well: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 466  Advanced Education – Order Blocks ──
  466: [
    `Order blocks: where institutional orders likely originated. \u{1F9F5}`,
    `The last down candle before a big up move. The last up candle before a big down move. These are zones where heavy buying or selling occurred. When price returns, expect a reaction.`,
    `\u{1F4D6} Free order block lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 467  Blog – Too Many Indicators ──
  467: [
    `More indicators doesn't mean more clarity. At some point, it's just noise. \u{1F9F5}`,
    `Analysis becomes procrastination when you add indicator #7 looking for confirmation that #6 already gave. The goal isn't more data — it's better decisions with the data you have.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Simplify: ${edu}`
  ],

  // ── 469  Advanced Education – Time-Based Liquidity ──
  469: [
    `Liquidity isn't just about price — it's about time. \u{1F9F5}`,
    `Session opens. Daily/weekly highs and lows. Monthly pivots. These time-based levels create predictable liquidity pools. Institutions target these time-based zones because that's where orders cluster.`,
    `\u{1F4D6} Free time-based lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 470  Docs – Multi-Chart Setup ──
  470: [
    `One chart isn't enough context. Signal Pilot works across multi-chart layouts. \u{1F9F5}`,
    `Run Pentarch on the 4H, Volume Oracle on the 1H, and Janus Atlas on the 15m — all visible simultaneously. Multi-timeframe analysis without tab switching. Complete picture at a glance.`,
    `\u{1F4D6} Layout guide: ${docsHome}\n\u{1F517} All 7 indicators: ${site}`
  ],

  // ── 471  Marketing – Education Before Payment ──
  471: [
    `We built the education before we asked for payment. That order matters. \u{1F9F5}`,
    `82 free lessons. Complete curriculum. No paywall on knowledge. We wanted you to learn first, trust the process, and then decide if our tools fit your style. Education builds trust. Trust earns business.`,
    `\u{1F393} Free education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 472  Advanced Education – Killzones ──
  472: [
    `Killzones: when the market is most active — and most dangerous. \u{1F9F5}`,
    `Asian: 7pm-12am EST. London: 2am-5am EST. New York: 7am-10am EST. London Close: 10am-12pm EST. These windows have the highest probability setups. Trade when it matters. Rest when it doesn't.`,
    `\u{1F4D6} Free session lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 473  Blog – Small Improvements Compound ──
  473: [
    `Small improvements compound. And the math is staggering. \u{1F9F5}`,
    `1% better entries. Slightly tighter stops. Marginally better timing. None of these feel significant alone. But compound them over 500 trades and you've transformed your equity curve. Progress is quiet.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Improve daily: ${edu}`
  ],

  // ── 474  Quote – Market Is a Mirror ──
  474: [
    `"The market is a mirror. It reflects your preparation — or lack of it." \u{1F9F5}`,
    `Prepared traders see structure. Unprepared traders see chaos. The chart is the same. The difference is what you brought to it before you opened the platform. Preparation is your lens.`,
    `\u{1F4A1} Prepare with: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 476  Advanced Education – Institutional Footprints ──
  476: [
    `Institutions can't hide their footprints. You just need to know where to look. \u{1F9F5}`,
    `Volume anomalies at key levels. Displacement candles from consolidation. Wicks that sweep liquidity and reverse. The bigger the player, the bigger the trace. Learn to read the evidence.`,
    `\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F50D} Plutus Flow: ${tv.plutusFlow}`
  ],

  // ── 477  Blog – Demo vs Live Trading ──
  477: [
    `Demo trading teaches mechanics. Not psychology. Here's the gap. \u{1F9F5}`,
    `No fear with fake money. No FOMO when nothing's at stake. No discipline required when losses don't hurt. Demo is step one — but thinking it prepares you for live is a costly mistake.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Bridge the gap: ${edu}`
  ],

  // ── 479  Advanced Education – Asian Range ──
  479: [
    `The Asian range often sets the day's boundaries. Smart money knows this. \u{1F9F5}`,
    `High and low of the Asian session create a range. London and New York sessions often sweep one side before reversing. The Asian range isn't random — it's the trap that sets up the day's move.`,
    `\u{1F4D6} Free session lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 480  Docs – Keyboard Shortcuts ──
  480: [
    `Speed up your analysis with keyboard shortcuts. Every second counts. \u{1F9F5}`,
    `TradingView + Signal Pilot power users know: Alt+T for trendlines, Alt+H for horizontals, Tab to switch between charts. The mouse is slow. The keyboard is fast. Master both.`,
    `\u{1F4D6} Full shortcut guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 481  Marketing – Community ──
  481: [
    `You're not alone on this journey. Signal Pilot community is real. \u{1F9F5}`,
    `Active Discord. Real discussions. Chart sharing. Strategy feedback. No egos, no toxic positivity, no "trust me bro" signals. Just traders learning together. That's the difference.`,
    `\u{1F393} Join us: ${site}\n\u{1F4D6} Free education: ${edu}`
  ],

  // ── 482  Advanced Education – Power of Three ──
  482: [
    `Power of Three: Accumulation \u{2192} Manipulation \u{2192} Distribution. The daily cycle. \u{1F9F5}`,
    `Asian session accumulates orders. London manipulates with a false move. New York distributes and reveals the real direction. This three-phase cycle repeats daily. Once you see it, you can't unsee it.`,
    `\u{1F4D6} Free cycle lessons: ${edu}\n\u{1F50D} Pentarch (cycles): ${tv.pentarch}`
  ],

  // ── 483  Blog – No Holy Grail ──
  483: [
    `There is no holy grail indicator. No tool wins every time. \u{1F9F5}`,
    `No signal is always right. No pattern is always reliable. The edge isn't in the tool — it's in how you use the tool combined with risk management, discipline, and context. Tools amplify skill.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Build real skill: ${edu}`
  ],

  // ── 484  Quote – Chart in Front of You ──
  484: [
    `"Trade the chart in front of you, not the one in your head." \u{1F9F5}`,
    `Your bias says up. The chart says sideways. Which wins? The chart. Always the chart. Your opinion is irrelevant until the chart confirms it. React to reality, not narrative.`,
    `\u{1F4A1} Learn to read charts: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 486  Advanced Education – Judas Swing ──
  486: [
    `The Judas Swing: a false move that betrays early traders. \u{1F9F5}`,
    `Market opens \u{2192} moves one direction to grab liquidity \u{2192} reverses sharply the other way. The first move is the lie. The reversal is the truth. Named Judas for a reason: it looks like a friend, then betrays you.`,
    `\u{1F4D6} Free smart money lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 487  Blog – Evidence-Based Confidence ──
  487: [
    `Real confidence comes from evidence, not hope. Build it systematically. \u{1F9F5}`,
    `Documented wins. Survived drawdowns. Backtested edge. Journal entries proving your process works. Stack evidence until confidence is mathematical, not emotional. Hope isn't a strategy.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Start building: ${edu}`
  ],

  // ── 489  Advanced Education – Quarterly Theory ──
  489: [
    `Quarterly Theory: the year divided into four cycles. Macro structure matters. \u{1F9F5}`,
    `Q1: Jan-Mar. Q2: Apr-Jun. Q3: Jul-Sep. Q4: Oct-Dec. Each quarter has accumulation, manipulation, distribution, and decline phases. Zoom out far enough and the same patterns repeat on every scale.`,
    `\u{1F4D6} Free macro lessons: ${edu}\n\u{1F50D} Pentarch (cycles): ${tv.pentarch}`
  ],

  // ── 490  Docs – Mobile Access ──
  490: [
    `Signal Pilot works on TradingView mobile. Full indicator access on your phone. \u{1F9F5}`,
    `Check charts, monitor alerts, review setups — all from your pocket. Not for day trading from your phone (please don't). For staying aware and prepared when you're away from your desk.`,
    `\u{1F4D6} Mobile guide: ${docsHome}\n\u{1F517} ${site}`
  ],

  // ── 491  Marketing – No Hidden Fees ──
  491: [
    `No hidden fees. No surprise charges. No upsells. What you see is what you pay. \u{1F9F5}`,
    `Monthly, yearly, or lifetime. Pick your plan. Get all 7 indicators. Get all documentation. Get community access. That's it. No "premium tier" behind the tier you already paid for.`,
    `\u{1F6E0}\uFE0F Transparent pricing: ${site}\n\u{1F393} Free education: ${edu}`
  ],

  // ── 492  Advanced Education – Market Maker Models ──
  492: [
    `Market Maker Models: understanding how liquidity providers operate. \u{1F9F5}`,
    `They don't trade against you — they facilitate. But facilitation requires liquidity. That means engineering moves to where stops cluster, filling orders, then letting price find fair value. The game isn't rigged. It's designed.`,
    `\u{1F4D6} Free market maker lessons: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 493  Blog – Best Trade Is No Trade ──
  493: [
    `Sometimes the best trade is no trade. Doing nothing is a skill. \u{1F9F5}`,
    `Waiting isn't laziness. Flat isn't failure. The market doesn't owe you a setup every day. Sitting on your hands when conditions are poor? That's discipline. That's edge. That's professional.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Learn patience: ${edu}`
  ],

  // ── 494  Quote – Process Defines ──
  494: [
    `"Your last trade doesn't define your next one. The process does." \u{1F9F5}`,
    `Big win? Great, same process tomorrow. Big loss? Same process tomorrow. Each trade is independent. The only constant should be your process. Let results be outcomes, not directors.`,
    `\u{1F4A1} Build your process: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 496  Advanced Education – Algo vs Discretionary ──
  496: [
    `Algorithmic vs discretionary trading. Different paths, same goal. \u{1F9F5}`,
    `Algorithmic: rules executed without emotion. Discretionary: judgment applied in real-time. Neither is better. Algo removes emotion but misses context. Discretionary adds context but invites emotion. Know which suits you.`,
    `\u{1F4D6} Free education on both: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 497  Blog – Selling Certainty ──
  497: [
    `Most trading education fails because it sells certainty. Markets don't offer that. \u{1F9F5}`,
    `"This pattern always works." No it doesn't. "Follow these signals." They'll fail sometimes. Honest education teaches probability, not certainty. It prepares you for losses, not just wins.`,
    `\u{1F4DD} Read more: ${blog}\n\u{1F393} Honest education: ${edu}`
  ],

  // ── 499  Advanced Education – Complete Trading System ──
  499: [
    `A trading system is more than indicators. It's more than entries. \u{1F9F5}`,
    `It includes entry criteria, exit criteria, risk rules, position sizing, journaling process, review schedule, and mental rules. An indicator is a tool. A system is the entire workshop. Build the workshop.`,
    `\u{1F4D6} Free system-building education: ${edu}\n\u{1F517} ${site}`
  ],

  // ── 500  Marketing – 500 Posts Milestone ──
  500: [
    `500 posts of trading education. Every lesson. Every concept. Every indicator. \u{1F9F5}`,
    `Half a thousand posts and not a single "guaranteed profit" promise. Just education, transparency, and tools that help you think. Thank you for 500 posts of trust. Here's to the next 500.`,
    `\u{1F393} All free: ${edu}\n\u{1F517} The journey continues: ${site}`
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
  console.log(`Batch 8 complete: ${updated} posts rewritten, ${skipped} already had threads`);
}

main();
