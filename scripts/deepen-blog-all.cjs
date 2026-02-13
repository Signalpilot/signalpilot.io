#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// 44 blog/psychology posts deepened from 5 tweets to 6 or 7.
// 7 tweets: FOMO, tilt, overtrading, holy grail myth, compound effect,
//           emotional detachment, position sizing psychology, losing streaks
// 6 tweets: everything else
//
// New tweets are inserted before the CTA (last tweet).

const deepens = {

  // ── POST 33: Position Sizing 101 (Blog) ── 7 tweets
  33: [
    `The hardest part of sizing correctly is that it feels wrong. Small feels timid. But the traders who size small are the ones still trading next year. The ones who sized big are telling war stories about the account they blew.`,
    `Your position size is a statement about how long you plan to be in this game. Size for decades, not for this afternoon. The returns follow the survival.`
  ],

  // ── POST 39: Position Sizing (Lesson) ── 7 tweets
  39: [
    `The emotional side nobody talks about: when your size is right, you can actually think. You follow your plan. You let trades breathe. Size too big and every tick feels like a verdict on your future.`,
    `Position sizing is the one thing in trading you fully control. Not direction. Not timing. Not fills. Just how much you risk. Master that one variable and the rest gets easier.`
  ],

  // ── POST 57: Psychology of Round Numbers (Blog) ── 6 tweets
  57: [
    `Institutional desks know where retail clusters orders. They use round numbers as magnets to build liquidity pools, then sweep them. Understanding this turns a psychological quirk into a tactical advantage.`
  ],

  // ── POST 63: Breakout vs Fakeout (Blog) ── 6 tweets
  63: [
    `The emotional difference matters too. A breakout trade entered on excitement usually fails. One entered on patience — waiting for the retest, confirming volume — usually works. The feeling at entry tells you a lot about the outcome.`
  ],

  // ── POST 77: Liquidity Hunting Explained (Blog) ── 6 tweets
  77: [
    `Here is the mindset shift: stop placing trades where the textbook says. Start asking "where would the market need to go to grab the most stops?" Then wait for it to happen. That is when you enter.`
  ],

  // ── POST 83: Wyckoff Method Simplified (Blog) ── 6 tweets
  83: [
    `The real value of Wyckoff is patience. Once you identify accumulation, you stop chasing breakouts. You wait for the markup. Once you see distribution, you stop buying dips. You wait for markdown. The phase tells you what to do next.`
  ],

  // ── POST 87: Order Blocks Demystified (Blog) ── 6 tweets
  87: [
    `Order blocks are not magic lines on a chart. They are zones where a decision was made by large capital. Treat them as areas of interest, not exact levels. The reaction confirms the zone. Without reaction, it is just a candle.`
  ],

  // ── POST 97: The Power of Doing Nothing (Blog) ── 6 tweets
  97: [
    `Every professional trader has a story about the trade they almost took. The one that looked perfect but felt slightly off. They sat on their hands. Price collapsed. Doing nothing saved their week. Trust that instinct.`
  ],

  // ── POST 113: The Psychology of FOMO (Blog) ── 7 tweets
  113: [
    `FOMO is the market's way of making you the liquidity. When you chase a move, you are usually providing the exit for the trader who was early. Your emotional entry is their calculated exit.`,
    `The cure is boring: a written plan with exact criteria. When you know what your setups look like, everything else becomes noise you can ignore. FOMO cannot survive clarity.`
  ],

  // ── POST 123: The Compound Effect in Trading (Blog) ── 7 tweets
  123: [
    `Most traders quit before compounding kicks in. The first 6 months feel like nothing is happening. Then the curve bends. The traders who stayed consistent see the same market differently — they see what patience built.`,
    `Compounding rewards the boring. Not the clever, not the aggressive, not the flashy. The boring, consistent, rule-following trader who does the same thing every day and lets time do the heavy lifting.`
  ],

  // ── POST 127: Why Your Stop Loss Keeps Getting Hit (Blog) ── 6 tweets
  127: [
    `Before placing a stop, ask yourself: "Would I put my stop here if I were trying to hunt someone else's?" If yes, move it. Think like the predator, not the prey. That one shift changes everything.`
  ],

  // ── POST 136: Trading Psychology Mastery (Education) ── 6 tweets
  136: [
    `Psychology isn't something you master once. It is a daily practice. Some days you will be sharp and disciplined. Other days your worst habits will creep back. The difference between pros and amateurs is how fast they notice and correct.`
  ],

  // ── POST 143: Trading Plan Template (Blog) ── 6 tweets
  143: [
    `A plan you wrote but don't follow is worse than no plan at all. It trains you to ignore your own rules. If a rule doesn't serve you, change the plan. But while it is in the plan, it is law. Negotiate later, execute now.`
  ],

  // ── POST 163: Revenge Trading / The Journaling Habit (Blog) ── 6 tweets
  163: [
    `Write this on a sticky note and put it on your monitor: "The market didn't take my money. I gave it away." Revenge trading is the fastest way to turn a small loss into a devastating one. Own the loss. Then walk away.`
  ],

  // ── POST 173: Sunk Cost Fallacy (Blog) ── 6 tweets
  173: [
    `The sunk cost trap gets stronger the longer you hold. A 5% loss feels manageable. A 30% loss feels impossible to accept. But acceptance isn't about the loss — it is about freeing your capital to find better opportunities right now.`
  ],

  // ── POST 207: Avoiding Tilt (Blog) ── 7 tweets
  207: [
    `Tilt doesn't always look like rage. Sometimes it looks like quiet desperation. Trading "just one more" to get back to breakeven. That calm-sounding justification is tilt wearing a polite mask.`,
    `Build a tilt protocol before you need one. Mine: close the charts, write three sentences in my journal about what I feel, go outside for 15 minutes. By the time I return, the urge has passed and I can think clearly again.`
  ],

  // ── POST 217: Cost of Overtrading (Blog) ── 7 tweets
  217: [
    `Overtrading feels productive. You are "in the game." You are "putting in the work." But activity is not progress. A sniper takes one shot. A machine gunner wastes ammo. Know which one makes money in markets.`,
    `Try this: limit yourself to 3 trades per day for one week. Just three. You will be shocked at how much more selective — and profitable — you become when the number is finite.`
  ],

  // ── POST 243: The Trader's Greatest Edge: Doing Nothing (Blog) ── 6 tweets
  243: [
    `Your brokerage wants you to trade more. Social media wants you to trade more. Your ego wants you to trade more. The market rewards you for trading less. Recognize who benefits from your activity and who benefits from your discipline.`
  ],

  // ── POST 253: The Compound Effect in Trading (Blog) ── 7 tweets
  253: [
    `The 2% monthly trader doesn't make the highlight reel. Nobody screenshots a $400 gain on a $20K account. But those quiet months stack into quiet years, and quiet years stack into life-changing capital.`,
    `Compounding applies to habits too. One good journal entry per day. One honest review per week. One refined rule per month. In a year you have built a system most traders never bother to create.`
  ],

  // ── POST 257: Trading Journal: Your Most Valuable Tool (Blog) ── 6 tweets
  257: [
    `The journal also protects you from your own memory. You will remember trades differently than they happened. The journal keeps the truth on record so you can learn from reality, not the revised version your ego prefers.`
  ],

  // ── POST 263: The Myth of the Holy Grail Strategy (Blog) ── 7 tweets
  263: [
    `Every strategy you have ever abandoned was someone else's consistently profitable approach. The difference was never the strategy. It was patience, risk management, and the willingness to endure the drawdown.`,
    `Stop searching. Pick one approach that makes logical sense to you. Trade it 200 times with proper risk management. Journal every trade. After 200 trades, you will either have an edge or know exactly why you don't.`
  ],

  // ── POST 267: Why Backtesting Lies (Blog) ── 6 tweets
  267: [
    `The best use of backtesting is not to prove your strategy works. It is to discover how it fails. Find the conditions where it breaks down. That knowledge is more valuable than any win rate because it tells you when to sit out.`
  ],

  // ── POST 273: Position Sizing: The Unsexy Edge (Blog) ── 7 tweets
  273: [
    `Here is the paradox: the traders who size small enough to survive drawdowns are the ones who eventually build large enough accounts that small percentages become big numbers. Patience and sizing work together.`,
    `Sizing correctly means accepting that some winning trades will feel underwhelming. Good. Underwhelming wins you can repeat for years beat thrilling wins that blow up your account in month three.`
  ],

  // ── POST 283: Trading Is a Marathon (Blog) ── 6 tweets
  283: [
    `Nobody talks about year two. Year one is exciting — everything is new. Year three, you have an edge. But year two is the grind where most quit. The progress feels invisible. That is exactly when compounding is working hardest beneath the surface.`
  ],

  // ── POST 287: Emotional Detachment in Trading (Blog) ── 7 tweets
  287: [
    `The market is not personal. It does not know your name, your account size, or your rent payment. When you stop assigning meaning to price moves, you start seeing them for what they are: data points, not personal attacks.`,
    `Detachment is a muscle. You build it by trading smaller, journaling emotions, and reviewing trades without judgment. Over time, the emotional charge fades and all that remains is the process.`
  ],

  // ── POST 293: The Psychology of Drawdowns (Blog) ── 7 tweets
  293: [
    `The worst decisions in trading are made during drawdowns. You switch strategies, abandon risk rules, or revenge trade to recover faster. Every one of those decisions makes the drawdown worse. Survival means doing less, not more.`,
    `A drawdown is a stress test for your process. If your process survives it, you come out stronger and more confident. If it doesn't, the drawdown exposed a weakness that would have destroyed you later anyway. Either outcome is valuable.`
  ],

  // ── POST 323: The Cost of FOMO (Blog) ── 7 tweets
  323: [
    `FOMO is a tax on undisciplined trading. It costs you on entries, on sizing, on timing, and on mental energy that could have gone to real setups. Add it up over a month and FOMO is probably your biggest expense.`,
    `The antidote is evidence. Go back through your journal and find every FOMO trade. Calculate the aggregate result. Seeing the number makes the pattern real. Once it is real, you can break it.`
  ],

  // ── POST 396: Journaling for Improvement (Education Recap) ── 6 tweets
  396: [
    `Start simple. You do not need a perfect template on day one. Date, setup, entry, exit, emotion, lesson. Six fields. Do it consistently for 30 days and the patterns will demand your attention.`
  ],

  // ── POST 423: The Psychology of Waiting (Blog) ── 6 tweets
  423: [
    `Think of waiting as part of the trade. The entry is not when you click buy. It starts when you identify the setup and choose to wait for confirmation. The discipline of waiting is where the actual edge lives.`
  ],

  // ── POST 427: Position Sizing Psychology (Blog) ── 7 tweets
  427: [
    `Here is a test: imagine your current position drops 2% against you right now. If your stomach drops, you are too big. If you feel nothing, you might be too small. The right size creates just enough engagement to stay sharp.`,
    `Most traders think bigger size equals more serious trading. It doesn't. It equals more emotional interference. The serious traders are the ones who sized for clarity, not for ego.`
  ],

  // ── POST 443: Recovery After a Losing Streak (Blog) ── 7 tweets
  443: [
    `Recovery is not about making back what you lost. That mindset will extend the streak. Recovery is about re-establishing trust in your process through clean execution. Focus on quality, not quantity. The P/L follows.`,
    `Every veteran trader has survived a losing streak that felt career-ending. What they all say afterward is the same: "I cut my size, went back to basics, and let the process carry me." No shortcuts. Just fundamentals.`
  ],

  // ── POST 447: Journaling Beyond P&L (Blog) ── 6 tweets
  447: [
    `The most powerful journal entry is not "I made $500 today." It is "I was anxious, almost revenge traded, recognized the pattern, and walked away." That is the entry that actually changes your trajectory.`
  ],

  // ── POST 473: The Compound Effect in Trading (Blog) ── 7 tweets
  473: [
    `The compound effect has a dark twin: erosion. Small bad habits — skipping the journal, moving stops, chasing one "quick" trade — erode your edge just as quietly as good habits build it. Compounding cuts both ways.`,
    `Trust the process even when you cannot see results. A tree grows roots before it grows tall. The invisible work you are doing now — the journal entries, the discipline, the patience — is the root system of your future success.`
  ],

  // ── POST 483: The Myth of the Holy Grail Indicator (Blog) ── 7 tweets
  483: [
    `The search for the perfect indicator is the search for certainty in an uncertain environment. It does not exist. What exists: tools that give you a slight edge, used consistently over hundreds of trades with disciplined risk management.`,
    `Stop optimizing your indicators and start optimizing yourself. Your entries, your exits, your sizing, your emotional state. You are the variable that matters most. The tool is just along for the ride.`
  ],

  // ── POST 493: The Art of Doing Nothing (Blog) ── 6 tweets
  493: [
    `Set a "no-trade" day each week. Deliberately. Watch the market without participating. You will be amazed at how clearly you see setups when you have no pressure to act on them. That clarity is available every day if you stop forcing trades.`
  ],

  // ── POST 503: The Cost of Impatience (Blog) ── 6 tweets
  503: [
    `Every time you move your stop closer because you are "done waiting," you are paying the impatience tax. The market does not care about your timeline. It moves when it moves. Your job is to be positioned correctly when it does.`
  ],

  // ── POST 513: The Loneliness of Trading (Blog) ── 6 tweets
  513: [
    `Loneliness in trading is not just about missing people. It is about carrying uncertainty alone. Every decision, every loss, every doubt — you process it solo. Finding even one person who genuinely understands changes the weight of it all.`
  ],

  // ── POST 527: Building Mental Resilience for Trading (Blog) ── 6 tweets
  527: [
    `Physical health drives mental resilience. Sleep, exercise, and nutrition are not separate from your trading. They are part of your trading system. A tired mind makes impulsive decisions. A rested mind follows the plan.`
  ],

  // ── POST 533: Conviction vs. Stubbornness (Blog) ── 6 tweets
  533: [
    `Conviction is a hypothesis with a defined expiration. Stubbornness is a belief with no exit. Before every trade, define the point where you would admit you were wrong. That is where conviction has a boundary and stubbornness does not.`
  ],

  // ── POST 547: Handling Winning Streaks (Blog) ── 6 tweets
  547: [
    `After a winning streak, try this: reduce your size slightly for the next three trades. Not because you expect to lose, but because you want to prove to yourself that your process matters more than the dopamine. That is real discipline.`
  ],

  // ── POST 552: Candlestick Psychology (Education) ── 6 tweets
  552: [
    `Each candle is a vote. Thousands of traders expressing fear, greed, conviction, and doubt — all compressed into one bar. When you read candles this way, charts stop being abstract patterns and start telling human stories.`
  ],

  // ── POST 563: The Comparison Trap (Blog) ── 6 tweets
  563: [
    `Comparison steals focus. While you are studying someone else's results, you are not studying your own trades, your own patterns, your own edge. Redirect that energy inward and the improvement will surprise you.`
  ],

  // ── POST 583: The Sunk Cost Fallacy in Trading (Blog) ── 6 tweets
  583: [
    `Practice this: at the start of each day, look at every open position as if you just discovered it. Would you open it fresh right now? If not, close it. This daily reset breaks the emotional grip that past decisions have on your present judgment.`
  ],

  // ── POST 603: Dealing with FOMO (Blog) ── 7 tweets
  603: [
    `The next time FOMO strikes, write down the trade you want to chase but don't take it. Check back in an hour. More often than not, the move reversed or stalled. Build a folder of these "near misses" and FOMO loses its power over you.`,
    `FOMO is loudest when your system is quiet. That silence feels like failure but it is actually your edge working. A system that filters aggressively will have quiet days. Those quiet days protect your capital for when conditions truly align.`
  ]

};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;

  for (const post of queue) {
    const d = deepens[post.postNumber];
    if (d && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 5) {
      const tweets = post.twitter.tweets;
      const cta = tweets.pop();
      tweets.push(...d);
      tweets.push(cta);
      post.twitter.tweets = tweets;
      updated++;
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log('Blog deepen: ' + updated + ' posts expanded to 6-7 tweets');
}

main();
