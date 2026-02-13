#!/usr/bin/env node
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

const deepens = {
  // POST 5 — Chronicle: Meet The Sovereign (Pentarch / cycle detection)
  5: [
    `"Every kingdom falls," The Sovereign murmured. "Not because rulers are weak — but because they forget where they stand in the turning of the wheel."\n\nHe pointed to a chart older than memory. The cycle was already turning.`,
    `The traders who survived weren't smarter. They simply knew the phase.\n\nIn TD, they accumulated what others abandoned. In CAP, they sold what others craved.\n\nThe Sovereign's edge was never prediction. It was positioning.`
  ],

  // POST 17 — Chronicle: The Prophet (Volume Oracle / volume regimes)
  17: [
    `The Prophet closed her eyes. "Most fear the crash. I fear the silence before it."\n\nHer student watched the screens — candles flat, volume fading.\n\n"This quiet is not peace," she warned. "It is the market drawing breath before it speaks."`,
    `Every blown account shares the same mistake: trading a ranging regime with a trending strategy.\n\nThe Prophet taught that reading the environment matters more than reading the chart. Adapt the weapon to the battlefield — not the other way around.`
  ],

  // POST 29 — Chronicle: The Cartographer (Janus Atlas / multi-TF levels)
  29: [
    `The Cartographer unrolled a second map — then a third, layered atop the first.\n\n"Alone, each line is a guess. Together, they become geography."\n\nWhere the daily, weekly, and monthly scars converged, he drove a stake into the table. "Here. This is real."`,
    `The best entries don't come from chasing breakouts. They come from waiting at confluent levels where multiple timeframes agree.\n\nOne timeframe can mislead. Three aligning at the same price? That's structure you can lean on.`
  ],

  // POST 38 — Chronicle: The Scales / Plutus (Plutus Flow / institutional flow)
  38: [
    `A crowd gathered around a rising chart, celebrating gains.\n\nPlutus said nothing. He placed his golden weight on the scale and watched it tilt.\n\n"They are cheering their own exit liquidity," he said quietly. "The flow has been negative for three days."`,
    `Price tells you what happened. Flow tells you who made it happen.\n\nWhen price rises but institutional flow falls, the rally is hollow — built on retail enthusiasm, not conviction. The Scales taught: always trust the weight over the noise.`
  ],

  // POST 45 — Augury Grid Demo / The Watchman (Augury Grid / scanner)
  45: [
    `Behind every missed trade is the same confession: "I wasn't watching that chart."\n\nThe Watchman designed the grid so that no signal dies unseen. Fifty assets. Every condition. One glance.\n\nThe tower never goes dark.`,
    `The edge isn't finding the perfect setup. It's seeing ALL the setups and choosing the best one.\n\nManual scanning means checking charts one by one. The grid means seeing alignment across your entire watchlist simultaneously. Speed becomes strategy.`
  ],

  // POST 48 — Chronicle: The Arbiter (Harmonic Oscillator / momentum)
  48: [
    `The Arbiter knelt beside a fading trend. His tuning fork barely hummed.\n\n"Hear that?" he asked.\n\nThe traders heard nothing.\n\n"Exactly. When the harmonics fall silent, the move has already died. The chart just hasn't confessed it yet."`,
    `Most traders exit too late because they watch price instead of momentum. Price can drift higher on fumes while momentum quietly collapses.\n\nThe Arbiter taught: by the time the candle turns red, the opportunity to exit well has already passed.`
  ],

  // POST 55 — OmniDeck Demo / The Commander (OmniDeck / unified view)
  55: [
    `The Commander stood before the war table. Six advisors spoke at once — cycles, levels, flow, momentum, volume, structure.\n\n"Alone, each tells a fragment. Together, they tell the truth."\n\nHe placed them all on one map. OmniDeck was born.`,
    `Conflicting indicators paralyze traders. One says buy, another says wait. The solution isn't fewer tools — it's unified context.\n\nWhen cycle phase, momentum, flow, and levels all agree on one overlay, the decision becomes obvious.`
  ],

  // POST 58 — Chronicle: The Watchman (Augury Grid / scanner)
  58: [
    `The Watchman traced his finger across the grid. "ETH — ignition. LINK — accumulation. SOL — breakdown."\n\nA hundred stories unfolding simultaneously. He read them all without blinking.\n\n"The market whispers opportunities every second. Most traders are deaf."`,
    `The difference between a good trader and a great one is often just awareness. Same setups. Same edge. But one sees three opportunities where the other sees one.\n\nSystematic scanning isn't laziness — it's the discipline of never letting a signal go unnoticed.`
  ],

  // POST 138 — THE SOVEREIGN'S WISDOM (Pentarch / cycle detection)
  138: [
    `"Every generation believes its crash is unprecedented," The Sovereign said. "Tulips. Railways. Dot-com. Crypto.\n\nThe asset changes. The cycle never does."\n\nHe traced the same five phases across centuries. The wheel turns. It always turns.`,
    `Knowing the cycle phase changes how you manage every trade. In IGN, you hold with conviction. In WRN, you tighten stops. In CAP, you take profit while others add.\n\nSame chart, different phase, completely different playbook. That's the Sovereign's lesson.`
  ],

  // POST 148 — THE CARTOGRAPHER'S MAP (Janus Atlas / multi-TF levels)
  148: [
    `"A line on a chart is just a line," The Cartographer said. "But a level respected on the daily, tested on the 4H, and rejected on the 1H — that is a wall.\n\nI don't draw lines. I discover fortresses."`,
    `The practical power of multi-timeframe confluence: your entries get tighter, your stops get logical, and your confidence increases.\n\nWhen you trade a level that three timeframes respect, you're not guessing. You're standing on proven structure.`
  ],

  // POST 168 — THE ARBITER'S JUDGMENT (Harmonic Oscillator / momentum)
  168: [
    `"The crowd sees a rising chart and calls it strength," The Arbiter observed. "I see rising price with decelerating speed and call it dying breath."\n\nHis tuning fork measured what eyes could not — the invisible fatigue beneath the surface.`,
    `Momentum decomposition saves you from the most common trap in trading: entering a trend right before it exhausts.\n\nWhen speed, strength, and volume all confirm — lean in. When any component diverges — it's a warning the move is aging.`
  ],

  // POST 178 — THE PROPHET'S VISION (Volume Oracle / volume regimes)
  178: [
    `"A storm and a breeze require different sails," The Prophet said.\n\n"Yet traders use the same strategy in every regime — and wonder why they capsize."\n\nShe watched the regime shift from trending to volatile. Half the room was already positioned wrong.`,
    `The regime dictates the rules. In accumulation, early entries are rewarded. In distribution, they're punished.\n\nVolume Oracle doesn't tell you what to trade. It tells you HOW to trade right now. That distinction separates survival from success.`
  ],

  // POST 318 — Chronicle: The Scales of Balance (Plutus Flow / institutional flow)
  318: [
    `The Scales weighed the market's confession: rising price, falling flow.\n\n"The surface celebrates. The depths retreat."\n\nHe had seen this divergence a thousand times. It always ended the same way — with the surface collapsing into the truth beneath.`,
    `Divergence between price and flow is one of the most reliable warning signals in trading. When smart money exits while price climbs, the rally is living on borrowed time.\n\nPlutus Flow quantifies this divergence so you see it before the reversal.`
  ],

  // POST 328 — Chronicle: The Sovereign's Crown (Pentarch / cycle detection)
  328: [
    `"The cruelest trap," The Sovereign said, "is the breakout that occurs in distribution."\n\nThe trader's eyes widened.\n\n"It looks like opportunity. It feels like conviction. But the cycle has already turned. You are buying the exit, not the entry."`,
    `Phase awareness transforms your win rate not by finding better setups, but by filtering out the traps.\n\nA beautiful breakout in the wrong cycle phase is just smart money's exit door dressed up as your entry. Pentarch shows you which phase you're in.`
  ],

  // POST 358 — CHRONICLE: THE WATCHMAN NEVER SLEEPS (Augury Grid / scanner)
  358: [
    `A signal fired at 3:14 AM. Asian session. Low volume. Most traders asleep.\n\nThe Watchman logged it without hesitation.\n\n"The best setups don't arrive on your schedule," he said. "They arrive on the market's. Your job is to be ready for both."`,
    `Session awareness changes everything. The Asian range defines the London breakout. The London move sets up the New York continuation.\n\nA scanner that covers all sessions means you stop missing the setups that happen while you're not at the screen.`
  ],

  // POST 418 — Chronicle: The Patience of the Cartographer (Janus Atlas / multi-TF levels)
  418: [
    `"How many trades have you taken this week?" The Cartographer asked.\n\nThe trader hesitated. "Fourteen."\n\n"And how many were at your levels?"\n\nSilence.\n\n"Patience is not missing out. It is choosing only the trades the map approves."`,
    `Overtrading is the silent killer of equity curves. Every trade away from a key level is a trade without structural backing.\n\nThe Cartographer's discipline: mark the confluent zones, set alerts, and only act when price comes to you. Never the reverse.`
  ],

  // POST 428 — Chronicle: The Arbiter's Balance (Harmonic Oscillator / momentum)
  428: [
    `The crowd roared for one more push higher. The Arbiter stood apart, fork pressed to the chart.\n\n"They want it to continue. The harmonics say it cannot."\n\nHe turned away from the screen. "Wanting is not a trading strategy. Measurement is."`,
    `The hardest skill in trading is closing a winning position before the chart tells you to. Momentum analysis gives you that edge — measuring the remaining energy in a move so you exit with profit, not regret.`
  ],

  // POST 438 — Chronicle: The Prophet's Silence (Volume Oracle / volume regimes)
  438: [
    `The student returned weeks later, breathless. "The breakout came — exactly where volume had gone quiet!"\n\nThe Prophet smiled.\n\n"Energy cannot be destroyed. It only transfers. The silence was accumulation wearing a mask. You finally learned to listen."`,
    `Low volume isn't "nothing happening." It's energy coiling. Ranges compress before they expand. Participation drops before it surges.\n\nVolume Oracle flags these quiet regimes so you're positioned before the breakout — not chasing after it.`
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
  console.log('Chronicle deepen: ' + updated + ' posts expanded to 7 tweets');
}

main();
