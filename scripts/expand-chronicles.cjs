#!/usr/bin/env node
/**
 * Expands Chronicle posts from 3 tweets to 4-6 tweet storytelling threads.
 * Each thread tells a short mythological story tied to a Signal Pilot character.
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'social', 'content-queue.json');

// === URL CONSTANTS ===
const site = 'https://signalpilot.io';
const edu = 'https://education.signalpilot.io';
const tv = {
  pentarch: 'https://www.tradingview.com/script/S8LniK8O-Pentarch-Cycle-Phase-Detection/',
  volumeOracle: 'https://www.tradingview.com/script/L9AQHzjY-Volume-Oracle-Regime-Detection/',
  janusAtlas: 'https://www.tradingview.com/script/28diwImS-Janus-Atlas-Multi-Timeframe-Auto-Levels/',
  plutusFlow: 'https://www.tradingview.com/script/uoZjVlZA-Plutus-Flow-Statistical-OBV-Analysis/',
  harmonicOsc: 'https://www.tradingview.com/script/Vpxnhy8j-Harmonic-Oscillator-Multi-Component-Momentum-Consensus/',
  auguryGrid: 'https://www.tradingview.com/script/H2REdDlY-Augury-Grid-Multi-Timeframe-Scanner/',
  omniDeck: 'https://www.tradingview.com/script/OatvfCuB-OmniDeck-Unified-Chart-Overlay/'
};

const chron = {
  sovereign: 'https://signalpilot.io/chronicle/meet-the-sovereign/',
  prophet: 'https://signalpilot.io/chronicle/the-prophet/',
  cartographer: 'https://signalpilot.io/chronicle/the-cartographer/',
  scales: 'https://signalpilot.io/chronicle/the-scales/',
  arbiter: 'https://signalpilot.io/chronicle/the-arbiter/',
  watchman: 'https://signalpilot.io/chronicle/the-watchman/',
  commander: 'https://signalpilot.io/chronicle/the-commander/',
  home: 'https://signalpilot.io/chronicle/'
};

// =============================================
// CHRONICLE EXPANSIONS (3 tweets → 4-6 tweets)
// =============================================
const expansions = {

  // -----------------------------------------------
  // Post 5: Meet The Sovereign (Pentarch)
  // -----------------------------------------------
  5: [
    "Before the markets had names, there was a king who never traded.\n\nHe only watched. Season after season. Cycle after cycle.\n\nThey called him The Sovereign. 👑 🧵",

    "Traders came from distant lands begging for predictions.\n\n\"Tell us what comes next,\" they pleaded.\n\nThe Sovereign shook his head.\n\n\"I do not see the future. I see where we stand in the cycle. That is enough.\"",

    "He taught them the five phases:\n\nTD — the exhaustion at the bottom.\nIGN — the spark of ignition.\nWRN — the first cracks above.\nCAP — the climax before the fall.\nBDN — the breakdown into darkness.\n\n\"Learn these, and the market hides nothing.\"",

    "\"But how do we profit?\" they demanded.\n\nThe Sovereign replied:\n\n\"The same strategy that saves you in accumulation will destroy you in distribution. Know the phase. Choose the weapon to match it.\"\n\nContext is the crown. Timing is the throne.",

    "The Sovereign still watches. Pentarch carries his wisdom.\n\nNon-predictive. Non-repainting. Cycle-aware.\n\n🔗 Pentarch: " + tv.pentarch + "\n📖 The Chronicle: " + chron.sovereign
  ],

  // -----------------------------------------------
  // Post 17: The Prophet (Volume Oracle)
  // -----------------------------------------------
  17: [
    "In a temple of flickering screens, a woman sat motionless while others panicked.\n\nCandles plunged red. Traders screamed.\n\nShe whispered: \"The volume has already spoken.\"\n\nThey called her The Prophet. 🔮 🧵",

    "She never watched price. Only volume.\n\n\"Where others see candles, I see intention,\" she said. \"Where others see wicks, I see exhaustion.\"\n\nHer eyes read the invisible current beneath every move.",

    "The Prophet classified the world into regimes:\n\n🟢 Accumulation — quiet buying beneath the surface.\n🔴 Distribution — silent selling above the noise.\n⚪ Neutral — the market holding its breath.\n\n\"Match your strategy to the regime, or the regime will punish you.\"",

    "A student asked: \"What if the regime is neutral?\"\n\n\"Then you wait,\" she replied. \"Patience is not inaction. It is the highest form of discipline.\"\n\nThe Prophet never predicted. She prepared.",

    "Volume Oracle carries The Prophet's gift.\n\nRegime detection. Flow analysis. No repainting.\n\n🔗 Volume Oracle: " + tv.volumeOracle + "\n📖 The Chronicle: " + chron.prophet
  ],

  // -----------------------------------------------
  // Post 29: The Cartographer (Janus Atlas)
  // -----------------------------------------------
  29: [
    "He had two faces — one looking back at where price had been, one looking up at where structure waited.\n\nLike the Roman god Janus, he saw both directions at once.\n\nThey called him The Cartographer. 🗺️ 🧵",

    "\"Every chart is a map,\" he told the lost trader. \"And every level is a scar — a place where battle was fought and memory remains.\"\n\nHe traced lines across timeframes. Daily. Weekly. Monthly.\n\nEach told a different story. Together, they told the truth.",

    "\"But which levels matter?\" the trader asked.\n\nThe Cartographer smiled.\n\n\"Where multiple timeframes agree — where the daily scar aligns with the weekly wound — that zone demands respect.\n\nOne level is a suggestion. Confluence is a fortress.\"",

    "\"I do not chase price,\" The Cartographer warned. \"I mark the levels and wait. Price always returns to the map.\"\n\nPatience was his greatest weapon. Structure was his shield.",

    "Janus Atlas carries The Cartographer's wisdom. Multi-timeframe auto-levels.\n\n🔗 Janus Atlas: " + tv.janusAtlas + "\n📖 The Chronicle: " + chron.cartographer
  ],

  // -----------------------------------------------
  // Post 38: The Scales / Plutus (Plutus Flow)
  // -----------------------------------------------
  38: [
    "In the ancient markets, there was a merchant who weighed everything twice.\n\n\"Price is opinion,\" he said, lifting one side of a golden scale.\n\n\"Flow is fact.\" He let the other side drop.\n\nThey called him Plutus — The Scales. ⚖️ 🧵",

    "While others debated direction, Plutus measured conviction.\n\nRising price with falling flow? \"The rally lies,\" he warned.\nFalling price with rising flow? \"Someone is accumulating in the shadows.\"",

    "His method was statistical. Not gut feel — measurement.\n\n\"OBV tells you where volume went. I tell you if it matters.\"\n\nZ-scores. Standard deviations. Significance.\n\nThe Scales separated noise from signal with mathematical precision.",

    "\"Why do you never panic?\" a trader asked during a crash.\n\nPlutus glanced at his scales.\n\n\"Because flow is rising. Price screams fear. The scales whisper accumulation. I trust the weight, not the noise.\"",

    "Plutus Flow carries The Scales' wisdom. Statistical OBV analysis.\n\n🔗 Plutus Flow: " + tv.plutusFlow + "\n📖 The Chronicle: " + chron.scales
  ],

  // -----------------------------------------------
  // Post 48: The Arbiter (Harmonic Oscillator)
  // -----------------------------------------------
  48: [
    "When two armies clashed and neither would yield, they summoned The Arbiter.\n\nHe carried no sword. Only a tuning fork that hummed with the rhythm of the market.\n\n\"Momentum without context is noise,\" he declared. ⚔️ 🧵",

    "The Arbiter listened to five voices at once:\n\nSpeed of the advance.\nStrength of conviction.\nExhaustion in the rhythm.\nDivergence between price and force.\nThe consensus of them all.\n\n\"One voice can deceive. Five rarely lie together.\"",

    "A trader held a winning position. \"Should I hold?\"\n\nThe Arbiter struck his fork against the chart.\n\n\"The momentum is borrowed energy. What rises without foundation must return.\"\n\nThe trader closed the trade. Price reversed within the hour.",

    "\"I do not judge direction,\" The Arbiter clarified. \"I judge sustainability. Can this move continue — or is it exhausted?\"\n\nThat single question separated profitable traders from bagholders.",

    "Harmonic Oscillator carries The Arbiter's judgment.\n\nMulti-component momentum consensus.\n\n🔗 Try it: " + tv.harmonicOsc + "\n📖 The lore: " + chron.arbiter
  ],

  // -----------------------------------------------
  // Post 58: The Watchman (Augury Grid)
  // -----------------------------------------------
  58: [
    "High atop the tower, a lone figure stared into a wall of shifting light.\n\nFifty charts. A hundred symbols. Every session, every timezone.\n\n\"While you watch one, I watch all.\"\n\nThey called him The Watchman. 👁️ 🧵",

    "Traders below missed opportunities daily.\n\n\"I was watching BTC when ETH broke out.\"\n\"I was studying gold when oil signaled.\"\n\nThe Watchman heard every excuse. His answer was always the same:\n\n\"You were not watching. You were guessing which to watch.\"",

    "He built a grid — a living map of every asset on the watchlist.\n\nCycle phases. Volume regimes. Momentum shifts.\n\nAll visible at once. No tab switching. No blind spots.\n\n\"Opportunity does not wait. Neither should your scanner.\"",

    "\"Do you never rest?\" a trader asked.\n\n\"I see Tokyo open. I see London close. I see New York wake,\" The Watchman replied.\n\n\"Sleep if you must. I never will.\"",

    "Augury Grid carries The Watchman's eternal vigil.\n\nMulti-symbol scanning. Real-time regime detection.\n\n🔗 Augury Grid: " + tv.auguryGrid + "\n📖 The Chronicle: " + chron.watchman
  ],

  // -----------------------------------------------
  // Post 298: The Founding of Signal Pilot
  // -----------------------------------------------
  298: [
    "Before the Seven, there was a single trader in a dark room.\n\nFrustrated. Misled. Surrounded by tools that promised everything and delivered nothing.\n\n\"We didn't build Signal Pilot to give answers.\" 🧵",

    "Every indicator repainted.\nEvery course sold a fantasy.\nEvery guru needed followers to fund their lifestyle.\n\nThe trader asked a dangerous question:\n\n\"What if I built what should have existed all along?\"",

    "The founding principles were carved in stone:\n\n◾ Tools that inform, not dictate.\n◾ Education over signals.\n◾ Context over commands.\n◾ Process over prediction.\n\n\"We built it to ask better questions — not give easy answers.\"",

    "One indicator became two. Two became seven.\n\nEach designed to see what the others could not.\n\nAnd the education? Free. All of it. Because clarity should never be paywalled.",

    "That frustration became Signal Pilot.\n\nSeven non-repainting indicators. 82 free lessons. Built by a trader, for traders.\n\n🔗 See the tools: " + site + "\n🎓 Free education: " + edu + "\n📖 The founding: " + chron.home
  ],

  // -----------------------------------------------
  // Post 308: The Seven United
  // -----------------------------------------------
  308: [
    "Seven indicators. Seven perspectives. One mission.\n\nThe Sovereign, Prophet, Cartographer, Scales, Arbiter, Watchman, and Commander.\n\nAlone, they see fragments. Together, they see everything. 🧵",

    "👑 The Sovereign reads cycles — knowing what season the market breathes.\n🔮 The Prophet classifies regimes — sensing the environment before the move.\n🗺️ The Cartographer maps structure — marking where battles were fought.",

    "⚖️ The Scales weigh conviction — measuring flow behind every candle.\n⚔️ The Arbiter judges sustainability — separating momentum from exhaustion.\n👁️ The Watchman scans all — ensuring no opportunity escapes.\n🎯 The Commander unifies them — one view, complete clarity.",

    "\"Why seven?\" the student asked.\n\n\"Because markets have seven faces,\" the master replied. \"Cycles. Regimes. Structure. Flow. Momentum. Coverage. Unity.\n\nIgnore one, and you trade blind in that dimension.\"",

    "The Elite Seven. Designed together. Non-repainting. Always.\n\n🔗 Meet the Seven: " + site + "\n📖 The Chronicle: " + chron.home
  ],

  // -----------------------------------------------
  // Post 318: The Scales of Balance
  // -----------------------------------------------
  318: [
    "\"Where does value flow?\" the merchant asked, standing in a market that stretched beyond sight.\n\nThe Scales lifted his instrument and listened.\n\n\"Follow the weight. Volume shows interest. Flow shows commitment.\" ⚖️ 🧵",

    "The merchant protested: \"But price is rising! Surely the trend is strong.\"\n\nThe Scales shook his head.\n\n\"Price shows you the surface. Flow shows you the deep current. Right now, the current runs opposite to the waves.\"",

    "Within three days, the merchant understood.\n\nPrice collapsed. What looked like strength had been distribution — smart money selling into the rally while retail chased green candles.\n\nThe Scales had seen it in the flow.",

    "\"Volume alone tells you activity,\" The Scales taught. \"OBV tells you cumulative direction. But Plutus Flow tells you if the signal is statistically significant.\n\nNot all volume is equal. I separate noise from truth.\"",

    "🔗 Follow the flow: " + tv.plutusFlow + "\n📖 The Scales' wisdom: " + chron.scales
  ],

  // -----------------------------------------------
  // Post 328: The Sovereign's Crown
  // -----------------------------------------------
  328: [
    "\"Time is a cycle,\" the Sovereign declared from his throne of fading charts.\n\n\"What has been will be again. Understanding where you stand in the cycle is half the battle.\" 👑 🧵",

    "A young trader knelt before him.\n\n\"I bought the breakout. I followed the trend. I did everything right. Why did I lose?\"\n\nThe Sovereign replied:\n\n\"Because the breakout was in distribution. You traded markup strategy in a markdown phase.\"",

    "\"The crown I wear is not power,\" the Sovereign continued. \"It is context.\n\nThe same strategy that saves you in accumulation destroys you in distribution. The same setup that thrives in markup bleeds in markdown.\"\n\nSame asset. Same chart. Different phase. Different outcome.",

    "\"Then how do I know which phase?\" the trader asked.\n\n\"TD. IGN. WRN. CAP. BDN.\n\nFive signals. Five phases. The wheel turns, and Pentarch reads each spoke.\"",

    "The Sovereign's crown is context. Pentarch carries that context to your chart.\n\n🔗 Find your phase: " + tv.pentarch + "\n📖 The Sovereign's crown: " + chron.sovereign
  ],

  // -----------------------------------------------
  // Post 338: The Gathering Storm
  // -----------------------------------------------
  338: [
    "\"Before every great move, there is silence.\"\n\nThe Watchman stood at his tower, eyes fixed on a market that had gone still. Volume contracted. Volatility compressed.\n\n\"The storm gathers before it breaks.\" 🧵",

    "Below the tower, traders grew bored. They closed positions. Left their screens. Moved on to other assets.\n\n\"Nothing is happening,\" they said.\n\nThe Watchman smiled. \"Everything is happening. You just can't hear it yet.\"",

    "He checked the signs:\n\n◾ Volume Oracle showed compression — energy coiling.\n◾ Plutus Flow showed quiet accumulation — hands were building.\n◾ Pentarch showed a cycle turning — the phase was shifting.\n◾ Price coiled tighter and tighter.\n\nThe calm IS the signal.",

    "\"When the boredom becomes unbearable,\" the Watchman said, \"that is when the move begins.\n\nPatience in the quiet. Readiness for the storm.\n\nThe best setups form when nobody is watching.\"",

    "The storm always comes. The question is whether you are ready.\n\n🔗 Detect the calm: " + site + "\n📖 The gathering storm: " + chron.home
  ],

  // -----------------------------------------------
  // Post 348: The Final Lesson
  // -----------------------------------------------
  348: [
    "\"What is the final lesson?\" the student asked, kneeling before the master who had taught him everything.\n\nThe master set down his charts and smiled.\n\n\"That there is no final lesson.\" 🧵",

    "The student frowned. \"But I have studied cycles with the Sovereign. Regimes with the Prophet. Levels with the Cartographer. Flow, momentum, scanning — I know them all.\"\n\n\"And yet markets will evolve,\" the master replied. \"Will you?\"",

    "\"The foundation is timeless:\n\n◾ Observe, don't predict.\n◾ Manage risk, always.\n◾ Let the data speak.\n◾ Trust the process.\n◾ Stay humble.\n\nBut the application? That changes with every cycle, every regime, every generation of traders.\"",

    "\"The tools improve. The lessons endure. But the student?\"\n\nThe master looked the student in the eye.\n\n\"The student must never stop. The day you believe you have learned enough is the day the market teaches you otherwise.\"",

    "Markets evolve. You must evolve with them.\n\n🎓 Continue learning: " + edu + "\n📖 The Chronicle: " + chron.home
  ],

  // -----------------------------------------------
  // Post 358: The Watchman Never Sleeps
  // -----------------------------------------------
  358: [
    "\"I see Tokyo open. I see London close. I see New York wake.\"\n\nThe markets never sleep. Neither does The Watchman. 👁️ 🧵",

    "A trader missed a setup in the Asian session. A breakout during London open. A reversal at the New York close.\n\n\"I can't be everywhere,\" the trader said.\n\n\"No,\" The Watchman replied. \"But I can.\"",

    "The Grid covers every session:\n\n🌏 Asian range setups forming in the quiet hours.\n🇬🇧 London breakout patterns firing at the open.\n🇺🇸 New York continuation moves developing through the day.\n\nThe Watchman doesn't care about your timezone. He monitors all of them.",

    "\"Opportunity does not announce itself,\" The Watchman warned. \"It appears in the corner of your attention — in the symbol you weren't watching, in the session you were sleeping through.\"\n\nYour scanner should never sleep.",

    "Augury Grid carries The Watchman's eternal vigil.\n\n🔗 Watch all sessions: " + tv.auguryGrid + "\n📖 The Watchman's vigil: " + chron.watchman
  ],

  // -----------------------------------------------
  // Post 368: The Path Forward
  // -----------------------------------------------
  368: [
    "\"Where does this path lead?\" the student asked, standing at a crossroads where seven roads converged.\n\nThe master did not point.\n\n\"Wherever you take it.\" 🧵",

    "\"The tools are yours. The education is yours. The Seven will guide you.\n\nBut the discipline? The patience? The courage to sit on your hands when the market tempts you?\n\nThat part has always been yours.\"",

    "Signal Pilot provides:\n\n◾ 7 non-repainting indicators.\n◾ 82 free lessons.\n◾ Complete documentation.\n◾ An active community.\n\nBut no tool can give you the one thing that separates the profitable from the broken: ownership of your process.",

    "\"I cannot walk the path for you,\" the master said. \"And I would not if I could.\n\nBecause a path walked for you teaches nothing. A path you walk yourself teaches everything.\"\n\nThe student stepped forward.",

    "The path is yours. The Seven walk beside you.\n\n🔗 Start your path: " + site + "\n🎓 Free education: " + edu
  ],

  // -----------------------------------------------
  // Post 378: The Seven Aligned
  // -----------------------------------------------
  378: [
    "\"When all seven speak as one, the signal is strongest.\"\n\nIt happens rarely — the moment when every member of the Council agrees.\n\nThe Sovereign, Prophet, Cartographer, Scales, Arbiter, Watchman, Commander. Aligned. 🧵",

    "Most days, they offer fragments:\n\nThe cycle says one thing. The regime says another. Momentum agrees but flow does not.\n\n\"Partial confluence is normal,\" the Commander taught. \"Full confluence is extraordinary.\"",

    "But when all seven align:\n\n◾ Cycle supports the direction.\n◾ Regime confirms bias.\n◾ Levels provide structure.\n◾ Flow shows institutional intent.\n◾ Momentum agrees.\n◾ Multiple symbols confirm.\n\nThat is not a signal. That is a symphony.",

    "\"Do not chase every setup,\" the Commander warned. \"Wait for the moments when the Seven speak as one.\n\nThose moments are rare. That is what makes them powerful.\"",

    "Full confluence of the Elite Seven. The rarest and strongest signal.\n\n🔗 Hear the symphony: " + site + "\n📖 The Seven aligned: " + chron.home
  ],

  // -----------------------------------------------
  // Post 388: Where It All Began
  // -----------------------------------------------
  388: [
    "\"It started with frustration,\" the founder recalled, staring at a screen full of broken promises.\n\n\"Indicators that repainted. Educators who misled. Tools that confused more than they clarified.\" 🧵",

    "Every indicator said \"buy\" — after the move already happened.\nEvery course promised a secret — then sold another course.\nEvery tool looked brilliant in hindsight — and useless in real-time.\n\n\"I was tired of being lied to.\"",

    "So the founder built what should have existed:\n\n◾ Indicators that don't repaint — ever.\n◾ Education that's actually free — all 82 lessons.\n◾ Documentation that's complete — not gated.\n◾ Tools that inform — not dictate.\n\nHonesty as a design principle.",

    "\"I built what I wished existed when I was the frustrated trader in the dark room.\"\n\nThat frustration became Signal Pilot.\nBorn from a real trader's need, not a marketer's dream.",

    "🔗 See what we built: " + site + "\n📖 Where it all began: " + chron.home
  ],

  // -----------------------------------------------
  // Post 398: The Eternal Student
  // -----------------------------------------------
  398: [
    "\"Master, when will I know enough?\"\n\nThe master looked up from charts that seemed to stretch into infinity.\n\n\"When you stop asking that question — and start asking better ones.\" 🧵",

    "The eternal student had studied for years. Read every book. Taken every course. Practiced every strategy.\n\nAnd still the question burned: \"Am I ready?\"\n\n\"'Am I ready?' is the question of someone seeking permission,\" the master replied.",

    "\"'What don't I understand yet?' — that is the question of someone seeking growth.\"\n\nThe evolution of questions:\n\n❌ \"What should I buy?\" → Beginner.\n✅ \"What regime is active?\" → Intermediate.\n✅✅ \"Does flow confirm the cycle phase?\" → Advanced.",

    "\"The eternal student never graduates,\" the master said. \"They never feel ready. They never stop questioning.\n\nAnd that is precisely why they keep improving.\n\nThe day you feel you know enough is the day the market teaches you otherwise.\"",

    "Stay curious. Stay humble. Stay a student.\n\n🎓 Ask better questions: " + edu + "\n📖 The eternal student: " + chron.home
  ],

  // -----------------------------------------------
  // Post 408: The Market's Memory
  // -----------------------------------------------
  408: [
    "\"The market remembers,\" the elder said, pointing to a level that had held for the third time.\n\n\"Every zone where pain occurred, every price where profit was taken — the market remembers.\" 🧵",

    "The young trader asked: \"Why do these levels keep working?\"\n\n\"Because thousands of traders bought at that price. When it returns, they remember. They act.\n\nThousands more got stopped out at that zone. When price returns, they want revenge. They act.\"",

    "\"Price is not random. It carries memory.\n\nSupport exists because buyers remember.\nResistance exists because sellers remember.\nConfluence exists because multiple timeframes remember together.\"\n\nThe levels that mattered before often matter again.",

    "\"Trade with the memory,\" the elder advised. \"Not against it.\n\nThe Cartographer maps this memory. Janus Atlas shows you where the scars are — and which ones are fresh.\"\n\nFresh scars react strongest. Old ones fade.",

    "🔗 Map the memory: " + tv.janusAtlas + "\n📖 The market's memory: " + chron.home
  ],

  // -----------------------------------------------
  // Post 418: The Patience of the Cartographer
  // -----------------------------------------------
  418: [
    "The young trader watched price dance between levels, fingers twitching over the buy button.\n\n\"It won't hit my zone! Should I chase it?\"\n\nThe Cartographer looked up from his maps.\n\n\"I don't chase price. Never have.\" 🗺️ 🧵",

    "\"I mark the levels that matter — where history says attention is warranted. Then I wait.\n\nPrice always comes to the levels eventually. Maybe not today. Maybe not this week. But eventually.\"\n\nThe trader shifted impatiently.",

    "\"Chasing price means abandoning the map,\" The Cartographer warned. \"Adjusting levels to fit your desire means lying to yourself.\n\nMy job is not to catch every move. It is to be ready when price comes to MY levels. On MY terms.\"",

    "\"Patience is the most difficult skill in trading,\" he continued. \"Not analysis. Not risk management. Patience.\n\nBut the Cartographer who waits at the right levels catches the best moves.\"",

    "Mark the levels. Set the alerts. Wait.\n\n🔗 Map and wait: " + tv.janusAtlas + "\n📖 The Cartographer's patience: " + chron.cartographer
  ],

  // -----------------------------------------------
  // Post 428: The Arbiter's Balance
  // -----------------------------------------------
  428: [
    "\"Momentum is borrowed energy,\" the Arbiter observed, watching a rally that had stretched too far, too fast.\n\n\"What rises without foundation must return.\" ⚔️ 🧵",

    "The crowd cheered every green candle. \"Higher! It's going higher!\"\n\nThe Arbiter struck his tuning fork against the chart.\n\nThe harmonics told a different story:\n\nSpeed was decelerating. Volume was diverging. The cycle was exhausting.",

    "\"The oscillator measures not just speed — but sustainability,\" he explained.\n\nFive components working together:\n\n◾ Is the move accelerating or decelerating?\n◾ Is volume confirming or diverging?\n◾ Is the cycle supporting or exhausting?\n\nSustainability matters more than speed.",

    "\"Every rally has a lifespan,\" The Arbiter said. \"My role is not to predict when it ends. It is to measure how much life remains.\n\nWhen the harmonics fall silent — the move is over. Whether the crowd believes it or not.\"",

    "The Harmonic Oscillator carries The Arbiter's balance.\n\n🔗 Measure sustainability: " + tv.harmonicOsc + "\n📖 The Arbiter's wisdom: " + chron.arbiter
  ],

  // -----------------------------------------------
  // Post 438: The Prophet's Silence
  // -----------------------------------------------
  438: [
    "The trading floor was deafening. Screens flashing. Voices shouting. Everyone reacting to every candle.\n\nIn the corner, The Prophet sat in perfect stillness.\n\n\"In the quiet regime, I wait.\" 🔮 🧵",

    "\"Volume speaks loudest through its absence,\" she whispered to her student.\n\nThe student looked confused. \"But nothing is happening.\"\n\n\"Exactly. And that is the loudest signal of all.\"",

    "The Prophet read what others ignored:\n\n◾ Volume contracting — a breakout was brewing.\n◾ Ranges tightening — energy was coiling.\n◾ Participation fading — the crowd had left.\n\n\"When the crowd leaves, the setup arrives.\"\n\nSilence always precedes the storm.",

    "\"Most traders ignore low-activity periods,\" The Prophet said. \"They wait for action, then react too late.\n\nI watch the silence most carefully. Because what comes after silence is always significant.\"",

    "Volume Oracle reads the silence and the storm.\n\n🔗 Hear the silence: " + tv.volumeOracle + "\n📖 The Prophet's silence: " + chron.prophet
  ]
};

// =============================================
// APPLY EXPANSIONS
// =============================================
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
  console.log(`Chronicle expansion complete: ${updated} posts expanded`);
}

main();
