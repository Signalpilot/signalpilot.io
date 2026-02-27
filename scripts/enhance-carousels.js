#!/usr/bin/env node
// One-time script to enhance the 22 short carousel HTML files
// Reads existing hook slide + CSS, replaces slides 2+ with rich visual content

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const Q = JSON.parse(readFileSync(join(ROOT, 'data', 'social', 'content-queue.json'), 'utf8'));

function getPost(num) { return Q.find(p => p.postNumber === num); }

// ── Quote post content definitions ────────────────────────────
const quoteSlides = {
  194: {
    title: 'QUOTE: MANAGING RISK',
    slides: [
      // Slide 2: Three approaches
      {
        tag: 'THREE APPROACHES', tagColor: 'var(--accent-gold)',
        title: 'How Do You Handle Risk?',
        body: `
          <div class="data-grid" style="grid-template-columns:1fr 1fr 1fr; gap:2%;">
            <div class="data-item down">
              <div class="item-icon">&#x1F628;</div>
              <div class="item-value">Avoiding</div>
              <div class="item-label">Never trading<br>Paralyzed by fear<br>No opportunity</div>
            </div>
            <div class="data-item warn">
              <div class="item-icon">&#x1F3B0;</div>
              <div class="item-value">Ignoring</div>
              <div class="item-label">No stop losses<br>Reckless sizing<br>Inevitable blow-up</div>
            </div>
            <div class="data-item up">
              <div class="item-icon">&#x2696;&#xFE0F;</div>
              <div class="item-value">Managing</div>
              <div class="item-label">Calculated sizing<br>Defined stops<br>Sustainable trading</div>
            </div>
          </div>`
      },
      // Slide 3: The insight
      {
        tag: 'THE TRUTH', tagColor: 'var(--accent-green)',
        title: 'Risk Is the Price of Opportunity',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Pay It Wisely</div>
            <div class="callout-text">You can't avoid risk and still profit. You can't ignore risk and survive. The only path is <strong style="color:var(--text-primary);">managing it</strong>.</div>
          </div>
          <ul class="checklist" style="margin-top:3%;">
            <li><span class="check">&#x2713;</span> Calculated position sizes</li>
            <li><span class="check">&#x2713;</span> Defined stop losses</li>
            <li><span class="check">&#x2713;</span> Risk:reward assessed before entry</li>
            <li><span class="check">&#x2713;</span> Sustainable, repeatable process</li>
          </ul>`
      }
    ]
  },
  214: {
    title: 'QUOTE: THE 1% DIFFERENCE',
    slides: [
      {
        tag: 'MARGINAL GAINS', tagColor: 'var(--accent-blue)',
        title: 'The 1% Edge',
        body: `
          <div class="data-grid">
            <div class="data-item info">
              <div class="item-icon">&#x1F3AF;</div>
              <div class="item-value">Entries</div>
              <div class="item-label">Better timing<br>Better levels</div>
            </div>
            <div class="data-item up">
              <div class="item-icon">&#x1F4C8;</div>
              <div class="item-value">Exits</div>
              <div class="item-label">Let winners run longer<br>Cut losers faster</div>
            </div>
            <div class="data-item warn">
              <div class="item-icon">&#x1F9E0;</div>
              <div class="item-value">Discipline</div>
              <div class="item-label">Follow rules consistently<br>Fewer emotional trades</div>
            </div>
            <div class="data-item info">
              <div class="item-icon">&#x1F6E1;&#xFE0F;</div>
              <div class="item-value">Risk</div>
              <div class="item-label">Better sizing<br>Better R:R ratios</div>
            </div>
          </div>`
      },
      {
        tag: 'COMPOUNDED', tagColor: 'var(--accent-gold)',
        title: 'Small Edges Stack',
        body: `
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value">1%</div><div class="stat-label">+ 1%</div></div>
            <div class="stat-item"><div class="stat-value">+ 1%</div><div class="stat-label">+ 1%</div></div>
            <div class="stat-item"><div class="stat-value">= </div><div class="stat-label">Massive</div></div>
          </div>
          <div class="callout-box success" style="margin-top:4%;">
            <div class="callout-title">The Compound Effect</div>
            <div class="callout-text">Great traders aren't 10x better. They're 1% better in four places. That compounds into an <strong style="color:var(--text-primary);">enormous edge</strong> over time.</div>
          </div>`
      }
    ]
  },
  224: {
    title: 'QUOTE: EXPENSIVE LESSONS',
    slides: [
      {
        tag: 'TWO PATHS', tagColor: 'var(--accent-gold)',
        title: 'Same Lessons. Different Price.',
        body: `
          <div class="compare-grid">
            <div class="compare-item after">
              <div class="compare-label">&#x1F4DA; Educate First</div>
              <div class="compare-text">Time investment<br>Paper trading losses<br>Learning curve<br>Foundation built<br>Confidence gained</div>
            </div>
            <div class="compare-item before">
              <div class="compare-label">&#x1F4B8; Learn From Market</div>
              <div class="compare-text">Real money lost<br>Account blown<br>Confidence destroyed<br>Same lessons, higher cost<br>May never recover</div>
            </div>
          </div>`
      },
      {
        tag: 'THE BOTTOM LINE', tagColor: 'var(--accent-green)',
        title: 'Invest In Education',
        body: `
          <div class="callout-box warning">
            <div class="callout-title">Both Paths Teach the Same Things</div>
            <div class="callout-text">One costs time. The other costs money, confidence, and sometimes your entire trading career.</div>
          </div>
          <ul class="arrow-list" style="margin-top:3%;">
            <li><span class="arrow">&#x2192;</span> Education is cheaper than losses</li>
            <li><span class="arrow">&#x2192;</span> Paper trading is cheaper than blown accounts</li>
            <li><span class="arrow">&#x2192;</span> Patience is cheaper than recovery</li>
          </ul>`
      }
    ]
  }
};

// ── Chronicle post content definitions ────────────────────────
const chronicleSlides = {
  158: {
    title: 'THE ELITE SEVEN UNITED',
    slides: [
      {
        tag: 'THE ALLIANCE', tagColor: 'var(--accent-teal)',
        title: 'Seven Systems, One Mission',
        body: `
          <ul class="arrow-list">
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">Pentarch</strong> reads the cycle phase</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">Plutus Flow</strong> tracks money movement</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">The Arbiter</strong> judges regime quality</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">Momentum Engine</strong> measures thrust</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">Volume Oracle</strong> confirms conviction</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">OmniDeck</strong> scans the full picture</li>
            <li><span class="arrow">&#x2192;</span> <strong style="color:var(--text-primary);">Regime Compass</strong> classifies the environment</li>
          </ul>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-gold)',
        title: 'Strength In Unity',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">No Single System Is Enough</div>
            <div class="callout-text">Each system sees one piece. Together they see the full picture. <strong style="color:var(--text-primary);">That's the edge.</strong></div>
          </div>`
      }
    ]
  },
  168: {
    title: "THE ARBITER'S JUDGMENT",
    slides: [
      {
        tag: 'THE ARBITER', tagColor: 'var(--accent-blue)',
        title: 'Judge of Market Quality',
        body: `
          <ul class="arrow-list">
            <li><span class="arrow">&#x2192;</span> Evaluates regime confidence</li>
            <li><span class="arrow">&#x2192;</span> Measures signal reliability</li>
            <li><span class="arrow">&#x2192;</span> Filters noise from opportunity</li>
            <li><span class="arrow">&#x2192;</span> Protects against false signals</li>
          </ul>
          <div class="callout-box info" style="margin-top:3%;">
            <div class="callout-title">The Role</div>
            <div class="callout-text">Not every signal deserves a trade. The Arbiter decides which ones do.</div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-gold)',
        title: 'Quality Over Quantity',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Fewer Trades, Better Trades</div>
            <div class="callout-text">The best traders don't trade more. They trade <strong style="color:var(--text-primary);">better</strong>. Judgment is the edge.</div>
          </div>`
      }
    ]
  },
  178: {
    title: "THE PROPHET'S VISION",
    slides: [
      {
        tag: 'THE PROPHET', tagColor: 'var(--accent-gold)',
        title: 'Volume Reveals Truth',
        body: `
          <ul class="arrow-list">
            <li><span class="arrow">&#x2192;</span> Price shows <em>what</em> happened</li>
            <li><span class="arrow">&#x2192;</span> Volume shows <em>how much conviction</em></li>
            <li><span class="arrow">&#x2192;</span> Together they reveal the real story</li>
          </ul>
          <div class="callout-box warning" style="margin-top:3%;">
            <div class="callout-title">The Warning</div>
            <div class="callout-text">90% of traders ignore volume. They see price move but miss the conviction behind it.</div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-green)',
        title: 'Read the Full Story',
        body: `
          <div class="callout-box success">
            <div class="callout-title">Volume Is the Prophet</div>
            <div class="callout-text">High volume on breakout = real conviction. Low volume on breakout = likely false. <strong style="color:var(--text-primary);">Listen to volume.</strong></div>
          </div>`
      }
    ]
  },
  188: {
    title: 'THE SCALES OF TRUTH',
    slides: [
      {
        tag: 'THE SCALES', tagColor: 'var(--accent-blue)',
        title: 'Balance Wins',
        body: `
          <div class="compare-grid">
            <div class="compare-item before">
              <div class="compare-label">&#x274C; IMBALANCED</div>
              <div class="compare-text">Over-leveraged<br>All in one trade<br>Hope-based holding<br>No exit plan</div>
            </div>
            <div class="compare-item after">
              <div class="compare-label">&#x2705; BALANCED</div>
              <div class="compare-text">Measured risk<br>Diversified setups<br>Rule-based exits<br>Clear plan always</div>
            </div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-gold)',
        title: 'Equilibrium Is the Edge',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">The #1 Reason Traders Fail</div>
            <div class="callout-text">Not bad analysis. Not wrong direction. <strong style="color:var(--text-primary);">Imbalance.</strong> Too much risk, too little planning.</div>
          </div>`
      }
    ]
  },
  198: {
    title: "THE WATCHMAN'S VIGIL",
    slides: [
      {
        tag: 'THE WATCHMAN', tagColor: 'var(--accent-teal)',
        title: 'Constant Vigilance',
        body: `
          <ul class="arrow-list">
            <li><span class="arrow">&#x2192;</span> Markets change regimes without warning</li>
            <li><span class="arrow">&#x2192;</span> What worked yesterday may fail today</li>
            <li><span class="arrow">&#x2192;</span> The Watchman monitors the shift</li>
            <li><span class="arrow">&#x2192;</span> Adapts strategy to current conditions</li>
          </ul>
          <div class="callout-box warning" style="margin-top:3%;">
            <div class="callout-title">The Trap</div>
            <div class="callout-text">Using a trending strategy in a range. Using range rules in a trend. Same mistake, different day.</div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-gold)',
        title: 'Adapt or Pay',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Stay Alert</div>
            <div class="callout-text">The cost of this lesson? <strong style="color:var(--text-primary);">$4,000.</strong> The fix? Always know what regime you're in before you trade.</div>
          </div>`
      }
    ]
  },
  208: {
    title: "THE COMMANDER'S STRATEGY",
    slides: [
      {
        tag: 'THE COMMANDER', tagColor: 'var(--accent-blue)',
        title: 'Plan the Trade',
        body: `
          <div class="step-flow">
            <div class="step-item"><div class="step-num">1</div><div class="step-text">Define the setup before the market opens</div></div>
            <div class="step-item"><div class="step-num">2</div><div class="step-text">Set entry, stop, and target in advance</div></div>
            <div class="step-item"><div class="step-num">3</div><div class="step-text">Execute without hesitation</div></div>
            <div class="step-item"><div class="step-num">4</div><div class="step-text">Review after close, journal the result</div></div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-gold)',
        title: 'Discipline Is Strategy',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">The Commander's Rule</div>
            <div class="callout-text">No plan = no trade. The commander never enters battle without preparation. <strong style="color:var(--text-primary);">Neither should you.</strong></div>
          </div>`
      }
    ]
  },
  218: {
    title: "THE SOVEREIGN'S CYCLE",
    slides: [
      {
        tag: 'THE CYCLE', tagColor: 'var(--accent-gold)',
        title: 'Markets Move in Cycles',
        body: `
          <div class="data-grid">
            <div class="data-item up"><div class="item-icon">&#x1F4C8;</div><div class="item-value">Accumulation</div><div class="item-label">Smart money enters quietly</div></div>
            <div class="data-item info"><div class="item-icon">&#x1F680;</div><div class="item-value">Markup</div><div class="item-label">Trend develops, crowd follows</div></div>
            <div class="data-item warn"><div class="item-icon">&#x1F4CA;</div><div class="item-value">Distribution</div><div class="item-label">Smart money exits at peaks</div></div>
            <div class="data-item down"><div class="item-icon">&#x1F4C9;</div><div class="item-value">Markdown</div><div class="item-label">Price declines, panic selling</div></div>
          </div>
          <div class="callout-box warning" style="margin-top:3%;">
            <div class="callout-title">The WRN Signal</div>
            <div class="callout-text">Ignoring Pentarch's cycle warning is the #1 mistake. It tells you when the phase is shifting.</div>
          </div>`
      },
      {
        tag: 'THE LESSON', tagColor: 'var(--accent-green)',
        title: 'Respect the Cycle',
        body: `
          <div class="callout-box success">
            <div class="callout-title">The Sovereign's Wisdom</div>
            <div class="callout-text">Know where you are in the cycle. Trade <em>with</em> it, never against it. <strong style="color:var(--text-primary);">The cycle is sovereign.</strong></div>
          </div>`
      }
    ]
  }
};

// ── Marketing post content definitions ────────────────────────
const marketingSlides = {
  161: {
    title: 'COMPARE VS COMPETITORS',
    slides: [
      {
        tag: 'THE COMPARISON', tagColor: 'var(--accent-gold)',
        title: 'Why Signal Pilot?',
        body: `
          <div class="compare-grid">
            <div class="compare-item before">
              <div class="compare-label">&#x274C; Others</div>
              <div class="compare-text">Single-indicator tools<br>Lagging signals<br>No regime awareness<br>One-size-fits-all</div>
            </div>
            <div class="compare-item after">
              <div class="compare-label">&#x2705; Signal Pilot</div>
              <div class="compare-text">7 integrated systems<br>Real-time analysis<br>Regime classification<br>Adaptive approach</div>
            </div>
          </div>`
      },
      {
        tag: 'THE EDGE', tagColor: 'var(--accent-green)',
        title: 'Built Different',
        body: `
          <div class="callout-box success">
            <div class="callout-title">Not Just Signals</div>
            <div class="callout-text">Signal Pilot doesn't tell you what to trade. It teaches you <strong style="color:var(--text-primary);">how to think</strong> about the market.</div>
          </div>
          <ul class="checklist" style="margin-top:3%;">
            <li><span class="check">&#x2713;</span> Full education platform</li>
            <li><span class="check">&#x2713;</span> 7 proprietary systems</li>
            <li><span class="check">&#x2713;</span> Regime-aware analysis</li>
            <li><span class="check">&#x2713;</span> Free to start</li>
          </ul>`
      }
    ]
  },
  171: {
    title: 'FREE TRIAL REMINDER',
    slides: [
      {
        tag: 'NO RISK', tagColor: 'var(--accent-green)',
        title: '7 Days. Full Access.',
        body: `
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value">7</div><div class="stat-label">Days Free</div></div>
            <div class="stat-item"><div class="stat-value">$0</div><div class="stat-label">Cost</div></div>
            <div class="stat-item"><div class="stat-value">100%</div><div class="stat-label">Access</div></div>
          </div>
          <ul class="checklist" style="margin-top:3%;">
            <li><span class="check">&#x2713;</span> All 7 indicator systems</li>
            <li><span class="check">&#x2713;</span> Full education library</li>
            <li><span class="check">&#x2713;</span> Real-time alerts</li>
            <li><span class="check">&#x2713;</span> Cancel anytime</li>
          </ul>`
      },
      {
        tag: 'START TODAY', tagColor: 'var(--accent-gold)',
        title: 'Nothing to Lose',
        body: `
          <div class="callout-box success">
            <div class="callout-title">Zero Risk Trial</div>
            <div class="callout-text">If it doesn't improve your trading in 7 days, walk away. No charge. No questions.</div>
          </div>`
      }
    ]
  },
  191: {
    title: 'SOCIAL PROOF: USER COUNT',
    slides: [
      {
        tag: 'THE NUMBERS', tagColor: 'var(--accent-gold)',
        title: 'Traders Trust Signal Pilot',
        body: `
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value">1000+</div><div class="stat-label">Active Users</div></div>
            <div class="stat-item"><div class="stat-value">82</div><div class="stat-label">Free Lessons</div></div>
          </div>
          <div class="stat-row" style="margin-top:2%;">
            <div class="stat-item"><div class="stat-value">7</div><div class="stat-label">Indicator Systems</div></div>
            <div class="stat-item"><div class="stat-value">0</div><div class="stat-label">Paywalls</div></div>
          </div>`
      },
      {
        tag: 'JOIN THEM', tagColor: 'var(--accent-green)',
        title: 'Simplify Your Trading',
        body: `
          <div class="callout-box success">
            <div class="callout-title">Stop Adding Complexity</div>
            <div class="callout-text">More indicators doesn't mean better analysis. <strong style="color:var(--text-primary);">Start subtracting.</strong> Let Signal Pilot handle the signal.</div>
          </div>`
      }
    ]
  },
  201: {
    title: '200 POSTS MILESTONE',
    slides: [
      {
        tag: 'MILESTONE', tagColor: 'var(--accent-gold)',
        title: '200 Posts of Free Education',
        body: `
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value">200</div><div class="stat-label">Posts</div></div>
            <div class="stat-item"><div class="stat-value">$0</div><div class="stat-label">Cost</div></div>
          </div>
          <ul class="arrow-list" style="margin-top:3%;">
            <li><span class="arrow">&#x2192;</span> Trading psychology deep dives</li>
            <li><span class="arrow">&#x2192;</span> Indicator system breakdowns</li>
            <li><span class="arrow">&#x2192;</span> Risk management frameworks</li>
            <li><span class="arrow">&#x2192;</span> Market structure education</li>
          </ul>`
      },
      {
        tag: 'THANK YOU', tagColor: 'var(--accent-green)',
        title: 'This Is Just the Start',
        body: `
          <div class="callout-box success">
            <div class="callout-title">200 Down, Hundreds More Coming</div>
            <div class="callout-text">Every post is free. Every lesson is real. Thank you for being part of this journey.</div>
          </div>`
      }
    ]
  },
  211: {
    title: 'WHY EDUCATION FIRST',
    slides: [
      {
        tag: 'THE PHILOSOPHY', tagColor: 'var(--accent-blue)',
        title: 'Education Before Signals',
        body: `
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value">82</div><div class="stat-label">Free Lessons</div></div>
            <div class="stat-item"><div class="stat-value">0</div><div class="stat-label">Paywalls</div></div>
            <div class="stat-item"><div class="stat-value">0</div><div class="stat-label">Excuses Left</div></div>
          </div>
          <div class="callout-box info" style="margin-top:3%;">
            <div class="callout-title">Why Free?</div>
            <div class="callout-text">Because understanding your tools matters more than having them. Educated traders make better decisions.</div>
          </div>`
      },
      {
        tag: 'THE DIFFERENCE', tagColor: 'var(--accent-gold)',
        title: 'Knowledge Compounds',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Education Is the Real Edge</div>
            <div class="callout-text">Signal Pilot teaches you <em>why</em> signals work, not just <em>when</em> they fire. That understanding compounds forever.</div>
          </div>`
      }
    ]
  },
  221: {
    title: 'TRADER TRANSFORMATION STORY',
    slides: [
      {
        tag: 'THE JOURNEY', tagColor: 'var(--accent-gold)',
        title: 'From Chaos to Clarity',
        body: `
          <div class="compare-grid">
            <div class="compare-item before">
              <div class="compare-label">Before</div>
              <div class="compare-text">Emotional trades<br>No system<br>Inconsistent results<br>Constant doubt</div>
            </div>
            <div class="compare-item after">
              <div class="compare-label">After</div>
              <div class="compare-text">Rule-based entries<br>Clear framework<br>Repeatable process<br>Confidence gained</div>
            </div>
          </div>`
      },
      {
        tag: 'THE EDGE', tagColor: 'var(--accent-green)',
        title: 'Self-Awareness Wins',
        body: `
          <div class="callout-box success">
            <div class="callout-title">The Most Overlooked Edge</div>
            <div class="callout-text">Technical skills are table stakes. <strong style="color:var(--text-primary);">Self-awareness</strong> is what separates good traders from great ones.</div>
          </div>`
      }
    ]
  }
};

// ── Blog post content definitions ─────────────────────────────
const blogSlides = {
  154: {
    title: 'Paper Trading Too Long',
    slides: [
      {
        tag: 'WHAT IT TEACHES', tagColor: 'var(--accent-green)',
        title: 'Paper Trading Builds',
        body: `
          <ul class="checklist">
            <li><span class="check">&#x2713;</span> Platform mechanics</li>
            <li><span class="check">&#x2713;</span> Order execution</li>
            <li><span class="check">&#x2713;</span> Strategy testing</li>
            <li><span class="check">&#x2713;</span> Pattern recognition</li>
          </ul>`
      },
      {
        tag: 'WHAT IT CAN\'T', tagColor: 'var(--accent-red)',
        title: 'Paper Trading Hides',
        body: `
          <ul class="checklist">
            <li><span class="cross">&#x2717;</span> Real emotional pressure</li>
            <li><span class="cross">&#x2717;</span> Fear of losing real money</li>
            <li><span class="cross">&#x2717;</span> Greed when winning</li>
            <li><span class="cross">&#x2717;</span> Hesitation and doubt</li>
          </ul>
          <div class="callout-box warning" style="margin-top:3%;">
            <div class="callout-title">The Trap</div>
            <div class="callout-text">Paper trading for 2 years? You're not practicing. You're hiding.</div>
          </div>`
      },
      {
        tag: 'THE BRIDGE', tagColor: 'var(--accent-blue)',
        title: 'The Transition',
        body: `
          <div class="step-flow">
            <div class="step-item"><div class="step-num">1</div><div class="step-text">Be consistently profitable in paper</div></div>
            <div class="step-item"><div class="step-num">2</div><div class="step-text">Start with the smallest real position</div></div>
            <div class="step-item"><div class="step-num">3</div><div class="step-text">Even $10 at risk changes decisions</div></div>
            <div class="step-item"><div class="step-num">4</div><div class="step-text">Scale up slowly from there</div></div>
          </div>`
      },
      {
        tag: 'THE INSIGHT', tagColor: 'var(--accent-gold)',
        title: 'Face the Real Test',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Psychology Only Develops With Stakes</div>
            <div class="callout-text">You can't paper trade your way to emotional mastery. Practice the mechanics, then face the real test.</div>
          </div>`
      }
    ]
  },
  164: {
    title: 'Psychology of Waiting',
    slides: [
      {
        tag: 'THE PROBLEM', tagColor: 'var(--accent-red)',
        title: 'Why Waiting Is Hard',
        body: `
          <ul class="checklist">
            <li><span class="cross">&#x2717;</span> Fear of missing out (FOMO)</li>
            <li><span class="cross">&#x2717;</span> Need to "do something"</li>
            <li><span class="cross">&#x2717;</span> Boredom disguised as opportunity</li>
            <li><span class="cross">&#x2717;</span> Impatience after losses</li>
          </ul>`
      },
      {
        tag: 'THE TRUTH', tagColor: 'var(--accent-gold)',
        title: 'Patience Is a Strategy',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">Waiting IS Trading</div>
            <div class="callout-text">The best traders spend most of their time <em>not</em> trading. Waiting for the right setup is an active decision.</div>
          </div>
          <div class="stat-row" style="margin-top:3%;">
            <div class="stat-item"><div class="stat-value">80%</div><div class="stat-label">Time Waiting</div></div>
            <div class="stat-item"><div class="stat-value">20%</div><div class="stat-label">Time Trading</div></div>
          </div>`
      },
      {
        tag: 'THE FRAMEWORK', tagColor: 'var(--accent-blue)',
        title: 'How to Wait Better',
        body: `
          <div class="step-flow">
            <div class="step-item"><div class="step-num">1</div><div class="step-text">Define your setup criteria before the session</div></div>
            <div class="step-item"><div class="step-num">2</div><div class="step-text">Only trade when ALL criteria align</div></div>
            <div class="step-item"><div class="step-num">3</div><div class="step-text">Journal the ones you skipped and why</div></div>
          </div>`
      }
    ]
  },
  173: {
    title: 'Sunk Cost Fallacy',
    slides: [
      {
        tag: 'THE FALLACY', tagColor: 'var(--accent-red)',
        title: 'Sunk Cost in Trading',
        body: `
          <div class="callout-box warning">
            <div class="callout-title">The Trap</div>
            <div class="callout-text">"I've already lost $200 on this trade. I can't close it now." The money is gone. The only question: would you enter this trade <em>right now?</em></div>
          </div>
          <ul class="checklist" style="margin-top:3%;">
            <li><span class="cross">&#x2717;</span> Holding losers hoping for recovery</li>
            <li><span class="cross">&#x2717;</span> Averaging down without a plan</li>
            <li><span class="cross">&#x2717;</span> Moving stop losses further away</li>
          </ul>`
      },
      {
        tag: 'THE FIX', tagColor: 'var(--accent-green)',
        title: 'Cut Your Losses',
        body: `
          <div class="callout-box success">
            <div class="callout-title">The Only Question That Matters</div>
            <div class="callout-text">Would you open this position right now, at this price, with this setup? If not, <strong style="color:var(--text-primary);">close it</strong>.</div>
          </div>`
      }
    ]
  },
  174: {
    title: 'Building a Pre-Trade Checklist',
    slides: [
      {
        tag: 'THE CHECKLIST', tagColor: 'var(--accent-blue)',
        title: 'Before Every Trade',
        body: `
          <ul class="checklist">
            <li><span class="check">&#x2713;</span> Regime confirmed (trending/ranging)</li>
            <li><span class="check">&#x2713;</span> Setup matches strategy rules</li>
            <li><span class="check">&#x2713;</span> Entry level defined</li>
            <li><span class="check">&#x2713;</span> Stop loss placed</li>
            <li><span class="check">&#x2713;</span> Target identified</li>
            <li><span class="check">&#x2713;</span> Position size calculated</li>
          </ul>`
      },
      {
        tag: 'WHY IT WORKS', tagColor: 'var(--accent-gold)',
        title: 'Removes Emotion',
        body: `
          <div class="compare-grid">
            <div class="compare-item before">
              <div class="compare-label">Without Checklist</div>
              <div class="compare-text">Emotional entries<br>Forgotten stops<br>Random sizing<br>Regret after</div>
            </div>
            <div class="compare-item after">
              <div class="compare-label">With Checklist</div>
              <div class="compare-text">Rule-based entries<br>Pre-set stops<br>Calculated sizing<br>Confidence in process</div>
            </div>
          </div>`
      },
      {
        tag: 'THE SYSTEM', tagColor: 'var(--accent-green)',
        title: 'Make It Automatic',
        body: `
          <div class="step-flow">
            <div class="step-item"><div class="step-num">1</div><div class="step-text">Write your checklist once</div></div>
            <div class="step-item"><div class="step-num">2</div><div class="step-text">Review it before every trade</div></div>
            <div class="step-item"><div class="step-num">3</div><div class="step-text">If any item fails, skip the trade</div></div>
            <div class="step-item"><div class="step-num">4</div><div class="step-text">Journal compliance weekly</div></div>
          </div>`
      },
      {
        tag: 'THE TRUTH', tagColor: 'var(--accent-gold)',
        title: 'Process Over Prediction',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">The Checklist Is Your Edge</div>
            <div class="callout-text">You don't need to predict the market. You need to follow your process. The checklist ensures you do.</div>
          </div>`
      }
    ]
  },
  204: {
    title: "Why Demo Trading Isn't Enough",
    slides: [
      {
        tag: 'THE GAP', tagColor: 'var(--accent-red)',
        title: 'Demo vs Real',
        body: `
          <div class="compare-grid">
            <div class="compare-item before">
              <div class="compare-label">Demo Trading</div>
              <div class="compare-text">Zero emotional weight<br>Click freely<br>Hold through anything<br>No consequences</div>
            </div>
            <div class="compare-item after">
              <div class="compare-label">Real Trading</div>
              <div class="compare-text">Full emotional weight<br>Hesitate on entries<br>Panic on drawdowns<br>Real consequences</div>
            </div>
          </div>`
      },
      {
        tag: 'THE MISSING PIECE', tagColor: 'var(--accent-gold)',
        title: 'Psychology Changes Everything',
        body: `
          <div class="callout-box insight">
            <div class="callout-title">The Real Lesson</div>
            <div class="callout-text">Demo teaches mechanics. Real money teaches psychology. You can't skip the second part.</div>
          </div>
          <div class="stat-row" style="margin-top:3%;">
            <div class="stat-item"><div class="stat-value">95%</div><div class="stat-label">of mistakes are emotional</div></div>
          </div>`
      },
      {
        tag: 'THE BRIDGE', tagColor: 'var(--accent-blue)',
        title: 'From Demo to Live',
        body: `
          <div class="step-flow">
            <div class="step-item"><div class="step-num">1</div><div class="step-text">Master demo until consistently profitable</div></div>
            <div class="step-item"><div class="step-num">2</div><div class="step-text">Switch to micro-lots / minimum size</div></div>
            <div class="step-item"><div class="step-num">3</div><div class="step-text">Trade small enough to learn, big enough to feel</div></div>
            <div class="step-item"><div class="step-num">4</div><div class="step-text">Scale up only after 50+ live trades</div></div>
          </div>`
      },
      {
        tag: 'THE TRUTH', tagColor: 'var(--accent-green)',
        title: 'Start Small. Start Real.',
        body: `
          <div class="callout-box success">
            <div class="callout-title">The Goal</div>
            <div class="callout-text">Trade with real money. Start so small it barely matters financially, but just enough that you <strong style="color:var(--text-primary);">feel it emotionally</strong>.</div>
          </div>`
      }
    ]
  }
};

// ── Builder function ──────────────────────────────────────────
function buildEnhanced(postNum, contentSlides) {
  const filePath = join(SOCIAL, `post-${String(postNum).padStart(3, '0')}`, 'carousel.html');
  let html = readFileSync(filePath, 'utf8');

  // Find the end of slide 1 and the start of export-nav
  const slide1EndPattern = /<\/div>\s*<\/div>\s*<\/div>\s*\n/;

  // Find all slide-wrapper divs
  const slideWrapperRegex = /<div class="slide-wrapper" data-slide="1">/;
  const firstSlideMatch = html.match(slideWrapperRegex);
  if (!firstSlideMatch) {
    console.log(`  Skipping post-${postNum}: no slide 1 found`);
    return;
  }

  // Strategy: find the carousel-grid, keep slide 1, replace everything after until export-nav
  const gridStart = html.indexOf('<div class="carousel-grid">');
  const exportNav = html.indexOf('<div class="export-nav">');

  if (gridStart === -1 || exportNav === -1) {
    console.log(`  Skipping post-${postNum}: structure not found`);
    return;
  }

  // Extract slide 1 content
  const gridContent = html.substring(gridStart, exportNav);
  const slide1Match = gridContent.match(/<div class="slide-wrapper" data-slide="1">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
  if (!slide1Match) {
    console.log(`  Skipping post-${postNum}: couldn't extract slide 1`);
    return;
  }

  const totalSlides = contentSlides.length + 2; // hook + content slides + CTA

  // Build new slides
  let newSlides = '';
  contentSlides.forEach((slide, idx) => {
    const slideNum = idx + 2;
    newSlides += `
    <div class="slide-wrapper" data-slide="${slideNum}">
      <div class="slide">
        <div class="slide-content">
          <span class="slide-number">${String(slideNum).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}</span>
          <div class="slide-subtitle">${slide.tag}</div>
          <h2 class="slide-title">${slide.title}</h2>
          ${slide.body}
          <span class="brand-mark">SIGNAL PILOT</span>
        </div>
      </div>
    </div>
`;
  });

  // CTA slide
  const post = getPost(postNum);
  const ctaText = post?.cta === 'follow' ? 'Follow Signal Pilot' : 'Explore Signal Pilot';
  newSlides += `
    <div class="slide-wrapper" data-slide="${totalSlides}">
      <div class="slide">
        <div class="slide-content">
          <span class="slide-number">${String(totalSlides).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}</span>
          <div class="slide-icon">&#x2728;</div>
          <h2 class="slide-title">Save &amp; Share</h2>
          <p class="slide-body">Found this useful? Save it for later. Share with a trader who needs it.</p>
          <a href="https://signalpilot.io/" class="cta-link">${ctaText}</a>
          <span class="brand-mark">SIGNAL PILOT</span>
        </div>
      </div>
    </div>
`;

  // Rebuild the carousel grid
  const newGrid = `<div class="carousel-grid">\n\n    ${slide1Match[0]}\n${newSlides}  </div>\n\n`;

  // Replace
  const before = html.substring(0, gridStart);
  const after = html.substring(exportNav);

  // Update slide count in export nav and script
  let newHtml = before + newGrid + '  ' + after;
  newHtml = newHtml.replace(/\/ \d+<\/span>/g, `/ ${totalSlides}</span>`);

  writeFileSync(filePath, newHtml);
  console.log(`  Enhanced post-${postNum}: ${totalSlides} slides`);
}

// ── Run ───────────────────────────────────────────────────────
console.log('Enhancing short carousel HTML files...\n');

console.log('Quote posts:');
for (const [num, def] of Object.entries(quoteSlides)) {
  buildEnhanced(parseInt(num), def.slides);
}

console.log('\nChronicle posts:');
for (const [num, def] of Object.entries(chronicleSlides)) {
  buildEnhanced(parseInt(num), def.slides);
}

console.log('\nMarketing posts:');
for (const [num, def] of Object.entries(marketingSlides)) {
  buildEnhanced(parseInt(num), def.slides);
}

console.log('\nBlog posts:');
for (const [num, def] of Object.entries(blogSlides)) {
  buildEnhanced(parseInt(num), def.slides);
}

console.log('\nDone!');
