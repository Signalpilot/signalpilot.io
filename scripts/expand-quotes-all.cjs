#!/usr/bin/env node
/**
 * Expand ALL quote card posts from 3 tweets to 4 tweets.
 * Inserts a new tweet 3 (practical trading application) before the CTA tweet.
 *
 * Structure:
 *   1. Hook/Quote (existing tweet[0])
 *   2. Commentary/expansion (existing tweet[1])
 *   3. NEW: Practical connection between the quote and daily trading decisions
 *   4. CTA (existing tweet[2] moved to position 4)
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const expansions = {
  3: `Tomorrow morning, try this: open your chart and remove every indicator except one. Trade with that single lens for a week. You'll be shocked how much clearer the signals become when the noise disappears.`,

  8: `Next time you place a stop, ask: "Would 10,000 other retail traders put their stop here too?" If yes, move it. Give the level room to breathe. A wider stop with smaller size survives the hunt.`,

  14: `In practice, this means picking one strategy and learning it cold. One timeframe. One setup type. One risk model. Master that before adding anything else. Independence is built through depth, not breadth.`,

  21: `Before your next session, ask: "What phase is this market in right now?" If you can't answer confidently, that's your signal to observe rather than trade. The prepared trader is already positioned when the shift arrives.`,

  24: `Try it yourself: next time you see an alert service promising 90% win rates, ask what happens when they go quiet for a week. Your own analysis never takes a day off. That's the difference between renting and owning your edge.`,

  34: `Run this exercise: calculate your expectancy from your last 20 trades. If the number is positive, your system works — even if half those trades lost. If it's negative, no win rate will save you. The math doesn't lie.`,

  44: `A simple shift: before your next trade, write down your exit plan first. Where you get out — both profit and loss — matters more than where you get in. Start with the exit and work backward.`,

  54: `Here's a test: check your trade log for the last month. How many trades were planned the night before vs. decided in the moment? The ratio tells you which side of the transfer you're on.`,

  64: `Make it concrete: spend 10 minutes tonight writing tomorrow's plan. After the close, spend 10 minutes reviewing what happened. Twenty minutes a day separates the traders who improve from the ones who repeat mistakes.`,

  74: `Practical fix: if your thesis is right but timing kills you, reduce size on early entries. Being early with half size lets you survive the stop hunt. Being early with full size means you're just wrong.`,

  84: `Apply this before every trade: ask "Can I survive being wrong here?" If the answer isn't an immediate yes, your size is too large. Reduce it until the loss is genuinely acceptable. Then execute.`,

  94: `Put this into practice tonight. Write down the one thing you want MOST from trading. Tape it to your monitor. When the urge to break rules hits mid-session, read it. Future you is counting on present you.`,

  104: `Set a hard rule: no single trade risks more than 1-2% of your account. That's the tuition cap. It keeps every loss affordable and keeps you enrolled in the market's classroom long enough to graduate.`,

  114: `Quick gut check: after your next loss, notice where your mind goes. Does it say "the market was wrong" or "what can I learn?" That reaction tells you everything about where you are in your trading development.`,

  124: `Try a circuit breaker: if you feel the urge to revenge trade, close the platform for 30 minutes. Go for a walk. The setup will either still be there when you return, or you'll realize it was never a setup at all.`,

  134: `Before your next trade, cover the ticker name and your bias. Look only at the price action. Would you still take the trade? If not, your opinion is leading and the chart is following. Flip that order.`,

  144: `When price breaks your "obvious" support, don't argue. Adapt. Cut the loss, reassess the structure, and look for the next opportunity. The market moved on. You should too. Speed of adaptation is an edge.`,

  154: `Wherever you are right now — confused, frustrated, losing money — that's normal. It's part of the path. The only way to fail at trading is to stop learning. Keep showing up. The breakthroughs come from persistence.`,

  164: `Before the open tomorrow, decide: "I will take a maximum of X trades today." A hard cap forces selectivity. Selective trading is patient trading. Patient trading is profitable trading. Set the number tonight.`,

  174: `Try this experiment: strip your chart down to price and one indicator. Trade that way for two weeks. If your results don't decline, the other 11 indicators were decoration. Keep what works. Delete what doesn't.`,

  184: `Before risking real money on any new strategy, ask three questions: Do I understand why this works? Can I explain the edge? Have I tested it on 50+ historical setups? If any answer is no, you're gambling.`,

  194: `On your next trade, define the exact dollar amount you're willing to lose before you click buy. Write it down. If the trade hits that number, exit. No negotiation. That single habit separates managed risk from hope.`,

  204: `A practical rule: if you wouldn't take this trade sitting in a quiet room with no price alerts, you shouldn't take it while watching candles. Urgency is almost always greed wearing a different outfit.`,

  214: `Track one metric this week: did you follow your rules on each trade? Not win or loss — just rule adherence. A week of 90%+ rule-following is a bigger milestone than any single profitable trade.`,

  234: `Start tonight: open a simple spreadsheet. Log the date, setup type, entry reason, exit reason, and one lesson. Five columns. Two minutes per trade. In a month you'll have a personal trading textbook.`,

  244: `After your next trade — win or lose — grade it on execution, not outcome. A = followed the plan perfectly. F = deviated completely. Track your grade average. That's your real performance metric.`,

  254: `Make this your pre-trade ritual: calculate your position size from stop distance FIRST. If you need a $200 stop and risk 1% of a $10K account, that's 0.5 units. Let the math decide your size, not your conviction.`,

  264: `The math is brutal: lose 50% and you need a 100% gain to recover. Lose 10% and you need 11%. Capital preservation isn't conservative — it's mathematical survival. Small losses keep the compounding engine running.`,

  274: `After every losing trade this week, write one sentence: "The lesson here is ___." Fill in the blank honestly. If you can't identify the lesson, review it again until you can. That one habit changes everything.`,

  284: `Build three rules and post them on your monitor: max loss per trade, max loss per day, max loss per week. When any limit is hit, you're done. No exceptions. The rules protect you from the version of yourself that can't think straight.`,

  294: `Test this: write your trading rules on an index card. If they don't fit, they're too complex to follow under pressure. Simplify until they fit. That card becomes your trading system. Everything else is noise.`,

  304: `While waiting for your setup, review yesterday's journal. Study your charts. Prepare levels for the next session. Patience isn't staring at a screen doing nothing — it's doing everything except pressing the button.`,

  314: `Your homework: before tomorrow's session, write an if/then plan. If price does X, I do Y. If it does Z, I do nothing. Cover the three most likely scenarios. When the market moves, you'll respond instead of react.`,

  324: `Pull up your trade history and calculate: average win size divided by average loss size. If it's below 2:1, focus on letting winners run longer and cutting losers faster. Asymmetry is where profitability lives.`,

  334: `Tonight, write tomorrow's trade plan in 3 sentences: the setup you're looking for, the risk you'll take, and the target you're aiming at. Read it before the open. Follow it during the session. Review it at close.`,

  344: `Here's how to trust it: commit to 100 trades following your system exactly. No tweaking mid-sample. Grade each trade on execution. After 100, THEN assess the edge. Anything less is noise pretending to be data.`,

  354: `Practical step: every month, compare your system's recent performance to its average. If win rate dropped 15%+ or average R changed significantly, the regime may have shifted. That's your cue to reassess, not panic.`,

  364: `Try this: before every trade, describe what the chart is actually doing in one sentence. No predictions, no bias. Just "Price is consolidating below resistance with declining volume." If you can't describe it clearly, don't trade it.`,

  374: `If you find yourself excited about a trade, that's a warning sign. Excitement means uncertainty, oversizing, or FOMO. The best trades feel routine — same setup, same risk, same execution. Boring on repeat.`,

  384: `This week, stop checking anyone else's P&L. Instead, review your last 20 trades and find one pattern to improve. That's your competition. One improvement per week compounds into a completely different trader by year's end.`,

  424: `Audit your chart right now. For each indicator, ask: "Did this change my decision on any of my last 10 trades?" If not, remove it. You'll likely end up with 2-3 tools that actually earn their place on your screen.`,

  434: `Before your next session, identify the trend on your timeframe. Then only look for trades that align with it. Fighting the trend is effort. Trading with it is alignment. One pays. The other costs.`,

  444: `Build three if/then scenarios before the market opens. Price breaks above X — here's what I do. Drops below Y — here's what I do. Stays between — I sit out. That's preparation replacing prediction.`,

  454: `After your next loss, check: did it take 1% of your account or 5%? If more than 2%, your sizing is the problem, not your analysis. Reduce size until losses feel like a parking ticket, not a car accident.`,

  464: `Practice this: set a rule that every losing trade gets closed within 5 seconds of hitting your stop. No hesitation, no "let me give it room." Speed of exit when wrong is literally what separates pros from amateurs.`,

  474: `Before tomorrow's session, look at your workspace. Is it organized? Are your levels marked? Is your plan written? The chart reflects your preparation back to you. A cluttered desk usually means a cluttered analysis.`,

  484: `Right now, write your current market thesis in one sentence. Then open the chart. Does the price action confirm your sentence or contradict it? If it contradicts — believe the chart and rewrite the sentence.`,

  494: `After your next trade, don't look at the P&L first. Instead, answer: "Did I follow my process?" If yes, the outcome is irrelevant to your development. Track process scores separately from profit. Watch what improves.`,

  504: `Write your top 3 trading rules on a sticky note. Before every trade, check the setup against those rules. If it passes all three, trade it. If it fails one, skip it. Rules remove the decision fatigue that leads to bad trades.`,

  514: `Open your trade journal and look for your most repeated mistake. Not a losing trade — a repeated BAD BEHAVIOR. That pattern is costing you more than any single loss. Fix that one thing and watch your equity curve change.`,

  524: `Before your next session, write down two scenarios and your planned response for each. When one plays out, you'll act from preparation instead of emotion. Responders don't need predictions — they need playbooks.`,

  534: `After your next loss, ask one question: "Did I follow the rules?" If yes, mark it as a successful trade in your journal — with a note on the loss. Redefining success around execution changes how you experience every trade.`,

  544: `On your next setup, wait for one extra confirmation before entering. A candle close, a volume spike, a retest. That one extra beat of patience often means the difference between a clean entry and a stop hunt.`,

  554: `If you're in your first year of trading and feel behind, remember: most consistently profitable traders took 2-3 years to get there. You're not failing. You're in the early chapters of a long story. Keep studying.`,

  564: `Next time you see a move and think "I should have been in that" — pause. You didn't miss anything. You avoided risk you hadn't planned for. That's discipline. The next setup that fits your rules will come.`,

  574: `Create a "non-negotiable" checklist: 3-5 things you do on every trade regardless of market conditions. Check the trend. Define your stop. Size correctly. Follow the exit plan. When conditions change, those standards don't.`,

  584: `Try this exercise: cover your entry price on the chart. Manage the trade based purely on current structure — levels, trend, momentum. Your entry is history. The market only cares about what's happening now.`,

  594: `Pick one system. Follow it for 30 days without changing a single parameter. Journal every trade. After 30 days, review. You'll learn more from imperfect execution of one plan than from endlessly optimizing a dozen.`,

  604: `This week, journal your wins with the same detail as your losses. Most traders only study what went wrong. But your wins contain critical data: what conditions produce your best results? That pattern is your edge.`,

  614: `Make a deal with yourself: every time you want to break a rule, wait 10 minutes. Set a timer. If the setup is still valid after 10 minutes, take it properly. If the urge passed, you just saved yourself money.`,

  624: `Next time you hesitate to cut a loser, ask: "Would I enter this trade right now at this price?" If no, you're holding for ego, not for profit. Close it. The next opportunity doesn't require you to be right on this one.`,

  634: `Write tomorrow's plan right now while the market is closed and your emotions are neutral. When the session starts and adrenaline flows, your calm self has already made the decisions. Let that version of you lead.`,

  644: `Count your trades from last week. Now count how many were in your plan before the session started. The gap between those numbers is a direct measure of impatience. Shrink that gap and watch profitability follow.`,
};

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;
  for (const post of queue) {
    const newTweet = expansions[post.postNumber];
    if (newTweet && post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;
      post.twitter.tweets = [tweets[0], tweets[1], newTweet, tweets[2]];
      updated++;
    }
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Quote expansion: ${updated} posts expanded from 3→4 tweets`);
}

main();
