#!/usr/bin/env node
/**
 * Expand Community posts (3->4), Chronicle posts (3->5), and Milestone posts (3->4).
 *
 * Community: add 1 tweet (social proof / community highlight) before CTA
 * Chronicle: add 2 tweets (deeper lore + practical connection) before CTA
 * Milestone: add 1 tweet (reflection or community thanks) before CTA
 */
const fs = require('fs');
const QUEUE_PATH = require('path').join(__dirname, '..', 'data', 'social', 'content-queue.json');

// ─── Community posts: 3→4 (add 1 tweet before CTA) ─────────────────────────

const communityExpansions = {

  // 61 — LIFETIME ACCESS
  61: `The average trader spends $200+/month on scattered tools and signal groups. Lifetime access consolidates everything into one payment — and you never think about it again. 15 months in, the math speaks for itself.`,

  // 71 — 82 FREE LESSONS
  71: `Most traders fail because they skip education and jump straight to indicators. We built the curriculum first. Beginner to professional, structured so each lesson builds on the last. No shortcuts — just a clear path forward.`,

  // 81 — ANNUAL PLAN SAVINGS
  81: `That $429 in savings buys a lot of runway. More time to learn, more time to practice, less pressure to "make it back" from subscription costs. Smart capital allocation starts before you open a chart.`,

  // 91 — NON-REPAINTING GUARANTEE
  91: `One user put it simply: "I stopped second-guessing my entries once I knew the signals wouldn't change after the fact." That's what non-repainting gives you — trust in your own process.`,

  // 101 — 100 POSTS MILESTONE
  101: `The most-saved post so far? A risk management thread from post 37. The most-discussed? Pentarch cycle phases. The content that sticks is never the flashy stuff — it's the fundamentals done right.`,

  // 111 — AFFILIATE PROGRAM
  111: `Our best affiliates aren't marketers. They're traders who use the tools daily and share what works. Authentic recommendations convert because people can tell the difference between belief and a sales pitch.`,

  // 121 — COMMUNITY TESTIMONIALS
  121: `What stands out across every review: nobody mentions "guaranteed profits." They mention clarity, independence, and understanding. That tells us the education is working exactly as intended.`,

  // 191 — SOCIAL PROOF: USER COUNT
  191: `What surprised us most: retention. Traders who complete the first 10 lessons stay. Not because of lock-in — because the education changes how they see charts. Understanding creates loyalty that no discount can match.`,

  // 211 — WHY EDUCATION FIRST
  211: `Here's the counterintuitive part: giving away education actually reduced refund requests. Traders who understand the tools use them better, see results faster, and stay longer. Free knowledge is the best sales strategy we've ever deployed.`,

  // 221 — TRADER TRANSFORMATION STORY
  221: `The turning point wasn't an indicator setting or a secret strategy. It was journaling. Reviewing every trade forced accountability. The tools provided structure, but the discipline had to come from within.`,

  // 231 — JOIN THE DISCORD
  231: `Best moment this month in Discord: a beginner shared their first multi-timeframe analysis. It wasn't perfect. But 12 members gave constructive feedback within an hour. That's the culture we protect.`,

  // 241 — PRICE INCREASE COMING
  241: `Early adopters deserve the best pricing. Every feature we add increases the value of your existing subscription. Locking in now means you benefit from every future improvement at today's rate.`,

  // 251 — JOIN THE COMMUNITY
  251: `The difference between a signal group and a learning community: in a signal group, you follow. In a learning community, you develop the skill to lead yourself. That's what we're building here.`,

  // 261 — TESTIMONIAL FEATURE
  261: `Independence is the real product. When a user says "I no longer need someone to tell me what to trade" — that's the transformation we're building toward. Tools that teach, not tools that create dependency.`,

  // 271 — LIMITED TIME PRICING
  271: `Locked-in pricing means no surprises. As we add indicators, expand education, and build new features, your rate stays the same. The value grows while your cost doesn't. That's the deal.`,

  // 281 — EDUCATION HUB HIGHLIGHT
  281: `The professional-level lessons on edge refinement and portfolio management are content other platforms charge $500+ for in standalone courses. Here, they're part of the free curriculum. No catch.`,

  // 441 — 7-Day Money Back Guarantee
  441: `In 18 months of offering the guarantee, the refund rate has stayed under 3%. Not because people are locked in — because the tools deliver what they promise. Confidence in the product makes the guarantee easy.`,

  // 451 — Cancel Anytime
  451: `Retention through quality, not contracts. Every month you stay is a vote of confidence that the tools are earning their place on your chart. That feedback loop keeps us accountable.`,

  // 461 — Lifetime Access Option
  461: `Lifetime members tell us the same thing: the mental shift matters. No more evaluating "is this worth another month?" Just open your charts and trade. Removing that friction changes your relationship with the tools.`,

  // 471 — Education-First Philosophy
  471: `Building education first meant 6 months of work before we earned a single dollar. That investment paid for itself in trust. Traders who learn from you first are far more likely to believe in your tools.`,

  // 481 — Community & Support
  481: `The unwritten rule of the Discord: no one flexes P&L screenshots. We celebrate process, not profits. A well-managed losing trade gets more respect than a lucky win. That sets the tone for everything.`,

  // 491 — Transparent Pricing
  491: `One page. All plans. All features listed. No asterisks, no "contact sales," no hidden enterprise tier. If you can't explain your pricing in 30 seconds, you're probably hiding something. We can.`,

  // 500 — 500th Post Milestone
  500: `500 posts and the most common DM we receive is "where do I start?" That's a good problem. It means there's enough depth to get lost in. Start with lesson 1. Work forward. The path reveals itself.`,

  // 511 — Built by Traders, For Traders
  511: `Every frustration we experienced trading became a feature request. Every gap we found in existing tools became an indicator. Signal Pilot wasn't designed in theory — it was forged in live market conditions.`,

  // 521 — Join 10,000+ Traders
  521: `The number matters less than the quality. We'd rather have 10,000 serious learners than 100,000 passive followers. Growth is good. The right kind of growth is better.`,

  // 531 — 7-Day Free Education Challenge
  531: `After 7 days, most challengers report the same thing: "I didn't realize how much I was missing." That awareness alone changes trading outcomes. You can't improve what you don't understand.`,

  // 541 — Compare Us to Alternatives
  541: `We openly encourage comparison because we've done the comparison ourselves. Integrated systems beat scattered tools. Free education beats paid courses. Transparency beats marketing. Every time.`,

  // 551 — Results Over Promises
  551: `The trading education space is full of noise. Flashy P&L screenshots, "100x" claims, rented Lamborghinis. We chose the opposite path: teach honestly, build solid tools, let results speak quietly.`,

  // 561 — Start Free Today
  561: `No email gate was a deliberate choice. We didn't want your inbox — we wanted your trust. If the education is good enough, you'll come back. And if it's not, we don't deserve your email anyway.`,

  // 571 — Your Journey Starts Here
  571: `A year from now you'll wish you had started today. Not because of some magic indicator setting — but because the compound effect of daily learning is the most underrated edge in trading.`,

  // 581 — The Signal Pilot Promise
  581: `Promises are easy to make. We'd rather you judge us by the 82 free lessons you can access right now, the documentation you can read today, and the community you can join this minute. Actions over words.`,

  // 591 — Thank You for 600+ Posts
  591: `600 posts later, the core message hasn't changed: understand the market, manage your risk, stay disciplined. The delivery evolves. The principles don't. That consistency is intentional.`,

  // 601 — Final Push — 49 to Go
  601: `Every post was written with one question in mind: "Does this make someone a better trader?" If the answer was no, it didn't ship. 601 posts that passed that filter. 49 more to go.`,

  // 611 — Risk-Free Trial
  611: `The guarantee exists because we've seen the pattern: traders who try the tools with real charts — not just screenshots — stay. The 7 days aren't a sales tactic. They're all you need to know.`
};

// ─── Chronicle posts: 3→5 (add 2 tweets before CTA) ────────────────────────

const chronicleExpansions = {

  // 138 — THE SOVEREIGN'S WISDOM (Pentarch)
  138: [
    `The Sovereign has ruled through every cycle. Bull manias. Bear capitulations. Sideways grinds that break the impatient. The lesson is always the same: the cycle will turn. Your only question is whether you're positioned for it or surprised by it.`,
    `In practice, Pentarch's cycle detection removes the emotional guesswork. Instead of "feeling" like the bottom is in, you observe structural phases shifting. TD doesn't ask you to believe — it shows you that selling pressure has exhausted itself. Observation over opinion.`
  ],

  // 148 — THE CARTOGRAPHER'S MAP (Janus Atlas)
  148: [
    `The Cartographer doesn't draw lines based on hope. Every level on the map earned its place through repeated price interaction across multiple timeframes. Landmarks that have been tested and respected — not arbitrary lines on a chart.`,
    `When you see daily support converging with a weekly zone and a 4H level, that's not coincidence. That's structure speaking. Janus Atlas surfaces these confluences so you spend less time drawing and more time analyzing what matters.`
  ],

  // 158 — THE ELITE SEVEN UNITED
  158: [
    `Each guardian was forged independently. The Sovereign knows nothing of flow. The Prophet cares nothing for levels. The Cartographer ignores momentum. That independence is the point — when they agree despite measuring different things, the confluence is real.`,
    `In practice, you rarely get all six to align. Three or four is common. Five is noteworthy. Full alignment is rare and worth paying attention to. The system doesn't demand perfection — it rewards patience and probabilistic thinking.`
  ],

  // 168 — THE ARBITER'S JUDGMENT (Harmonic Oscillator)
  168: [
    `The Arbiter learned long ago that a single voice can deceive. Strength without speed is a crawl. Speed without strength is a spike that fades. Only when multiple dimensions of momentum agree does The Arbiter render judgment — and even then, with caution, never certainty.`,
    `This translates directly to trading: when Harmonic Oscillator shows all components aligned, the momentum is genuine. When components diverge — say, rising strength but fading rate of change — the trend is aging. That decomposition saves you from late entries.`
  ],

  // 178 — THE PROPHET'S VISION (Volume Oracle)
  178: [
    `The Prophet never claims to see the future. That distinction matters. Volume Oracle reads current conditions with statistical precision — it tells you the environment you're in right now, so you can choose the right strategy instead of forcing the wrong one.`,
    `Trending markets reward patience. Ranging markets reward precision. Volatile markets reward caution. Quiet markets reward discipline. The Prophet's classification isn't about prediction. It's about preparation. Match your approach to the reality in front of you.`
  ],

  // 618 — CHRONICLE RECAP
  618: [
    `Seven indicators built independently, each solving a different problem. Cycles. Regimes. Levels. Flow. Momentum. Scanning. Unity. The Chronicle gave them stories, but the tools existed first. The lore simply made the design philosophy visible.`,
    `The practical takeaway: you don't need all seven at once. Start with one. Master its logic. Add a second when you understand how they complement each other. The Elite Seven are strongest together, but each stands alone. Build your system at your own pace.`
  ],

  // 628 — CHRONICLE WISDOM
  628: [
    `The Sovereign taught that cycles repeat. The Prophet taught that regimes shift. The Cartographer taught that structure persists. The Scales taught that flow reveals intent. The Arbiter taught that consensus matters. The Watchman taught vigilance. The Commander taught unity.`,
    `Strip away the mythology and you have seven principles every trader needs: understand cycles, read volume, respect structure, follow flow, measure momentum, scan broadly, and unify your analysis. The Chronicle is a framework disguised as a story.`
  ],

  // 647 — CHRONICLE FINALE
  647: [
    `"The Signal was never outside. It was within." That line isn't just lore. Every indicator processes the same data everyone else has access to. The edge was never the data — it was the interpretation, the discipline, and the patience to act only when conditions align.`,
    `The Chronicle ends, but the principles continue in every chart you open. Cycles still repeat. Volume still reveals truth. Levels still hold or break. Flow still exposes intent. The Seven taught their lessons. Now the practice is yours.`
  ]
};

// ─── Milestone posts: 3→4 (add 1 tweet before CTA) ─────────────────────────

const milestoneExpansions = {

  // 201 — 200 POSTS MILESTONE
  201: `Looking back at 200 posts, the ones that resonated most weren't the indicator breakdowns. They were the psychology threads. Risk management. Discipline. The stuff nobody wants to hear but everyone needs. That pattern taught us what to prioritize.`,

  // 650 — MILESTONE: THE FINALE
  650: `To everyone who read, shared, discussed, and challenged these posts: you shaped the content as much as we did. The best threads came from community questions. The best improvements came from honest feedback. This was always a collaboration.`
};

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let updated = 0;

  for (const post of queue) {
    if (post.twitter && post.twitter.tweets && post.twitter.tweets.length === 3) {
      const tweets = post.twitter.tweets;

      // Community (add 1)
      const comm = communityExpansions[post.postNumber];
      if (comm) {
        post.twitter.tweets = [tweets[0], tweets[1], comm, tweets[2]];
        updated++;
        continue;
      }

      // Chronicle (add 2)
      const chron = chronicleExpansions[post.postNumber];
      if (chron) {
        post.twitter.tweets = [tweets[0], tweets[1], chron[0], chron[1], tweets[2]];
        updated++;
        continue;
      }

      // Milestone (add 1)
      const mile = milestoneExpansions[post.postNumber];
      if (mile) {
        post.twitter.tweets = [tweets[0], tweets[1], mile, tweets[2]];
        updated++;
        continue;
      }
    }
  }

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Community/Chronicle/Milestone expansion: ${updated} posts expanded`);
}

main();
