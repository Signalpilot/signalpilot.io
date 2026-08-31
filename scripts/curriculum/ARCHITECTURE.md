# The curriculum, looked at as a curriculum

Written before continuing the per-lesson rebuild, because the per-lesson rebuild
was about to make 86 individually-good lessons that still do not teach anyone to
trade in the order a person learns.

## What the evidence says

### 1. The dependency graph runs backwards in the places that matter

For each core concept: the lesson that teaches it as its subject, against the
lessons that use it before then.

| concept | taught in | used before that, in |
|---|---|---|
| market regime | **53** | 31 lessons, starting at 2 |
| variance / drawdown | **55** | 23 lessons, starting at 3 |
| journalling | **37** | 20 lessons, starting at 2 |
| implied volatility / VIX | **56** | 15 lessons, starting at 10 |
| the order book, bid/ask depth | **25** | 11 lessons, starting at 2 |
| the spread | **22** | 10 lessons, starting at 3 |
| market makers | **43** | 10 lessons, starting at 14 |
| auction / value area | **49** | 10 lessons, starting at 3 |
| stop-loss placement | **10** | every one of lessons 1–9 |
| VWAP | **52** | 9 lessons, starting at 6 |
| volume profile / POC | **32** | 8 lessons, starting at 2 |
| backtesting | **35** | 8 lessons, starting at 4 |
| futures contract mechanics | **24** | 8 lessons, starting at 3 |

Two of these are not ordering slips, they are the shape of the whole course:

- **Regime is the most-assumed idea in the curriculum and it is taught at 53 of
  86.** Lesson 5's entire thesis — "RSI >70 is a buy *in a trending market*" — is
  a regime claim. Lesson 33 builds a regime framework at 33. Lesson 53 then
  teaches regime from scratch as if new.
- **Variance is taught at 55, and lesson 9 needs it.** Lesson 9 is titled
  "Position Sizing: The Only Edge That Actually Matters" and its own body says
  sizing "does not create an edge and cannot rescue a negative one". That
  contradiction has been logged twice as a prose defect. It is not a prose
  defect. It is lesson 55 being 46 lessons too late: sizing is what you do about
  variance, and the lesson that explains variance comes after.

### 2. There is no lesson 0

Every one of lessons 1–8 corrects a belief: support is a trap, volume is
misread, price action is dead, indicators lie, RSI is misunderstood, MAs are not
support, your brain betrays you, your brain filters. The voice is the best thing
about this curriculum and it is exactly wrong as an opening, because a correction
needs something to correct.

Nowhere in 86 lessons does anything teach, constructively: what a bid and an ask
are, what happens when an order is filled, who is on the other side, why a price
exists at all. The closest is lesson 25 — **"The Order Book is Theater"** — which
debunks the order book at lesson 25 to a reader who has never been shown one.

Lesson 1 is the sharpest case. Its method is: wait for the sweep, enter on the
reclaim, put the stop below the swept low. That needs stops (lesson 10), a
position size (9), a chosen timeframe (11), volume confirmation (2), and a level
worth sweeping. All of it is downstream. The lesson is good and it is unteachable
where it sits.

### 3. The declared structure is decorative

- **87 of 116 prerequisite links give the prerequisite's *category name* as the
  reason** to read it — "— Indicator Truth", "— Bonus Beginner", "— Professional
  Edge". 47 of 116 point at the immediately previous lesson. It is a chain
  rendered as a graph. The 29 real ones are all in lessons rebuilt recently.
- **`learning-path.html` renders lessons 1…86 in numeric order.** There is no
  intended sequence other than the numbering.
- Of 20 declared categories, four are not subjects: **"Bonus Beginner"** (2
  lessons), **"Beginner-Intermediate Bridge"** (8), **"Intermediate"** (12),
  **"Advanced Mastery"** (12). That is 34 of 86 lessons in a bucket rather than a
  category, and the bucket names admit it.
- **31 of 86 lessons have no meta description** — the field holds the title back.
  The set is 20, 21, 39–51, 67–86. It is almost exactly the four bucket
  categories. The curriculum was designed through lesson 38 and counted after it.

### 4. Length runs opposite to need

| tier | lessons | median words | max |
|---|---|---|---|
| beginner | 21 | 3,736 | 5,824 |
| intermediate | 30 | 4,896 | 9,348 |
| advanced | 27 | 4,894 | 8,090 |
| professional | 8 | 5,749 | 6,841 |

The five shortest lessons in the curriculum are 24, 23, 8, 45 and **1**. The
longest is lesson 42, Options Market Microstructure, at 9,348 words. A beginner
gets 2,985 words on the idea the whole course rests on; someone who has already
got that far gets three times as much on dealer vanna.

### 5. Fourteen subjects are taught two to four times

HFT (26, 48, 60) · portfolio and correlation (34, 50, 51, 62) · execution and
impact (57, 69, 73, 74) · multi-timeframe (11, 30, 75) · footprint (20, 27) ·
dark pools (28, 39) · auction (49, 54) · VIX (46, 56) · career (66, 84) ·
systematising (58, 61, 70) · the tape (3, 18) · behavioural (7, 8, 77) · regime
(33, 53, 68) · risk frameworks (9/10, 36, 82).

Lesson 50's title — "Your Positions Are More Correlated Than You Think" — is
lesson 34's thesis restated. Recovering these is worth roughly 12–14 slots,
which is close to what the missing foundation and the hollow professional tier
need.

## What the curriculum is actually about

The thesis is already there, in the best lessons (1, 2, 3, 18, 22, 23, 25, 55,
71), and it is a good one:

> A price is the output of an auction between people who must trade and people
> who may choose not to. Most technique reads the output and guesses at intent.
> You can read the mechanism instead — and where the mechanism cannot be read,
> you size for the fact that it cannot.

Everything in the course serves that or should be cut. The layers below are that
sentence, unpacked in the order a person can absorb it.

## The proposed architecture

Each layer is complete on its own: a reader who stops at the end of one has a
smaller coherent thing, not half of a bigger one.

**Layer 0 — The mechanism.** What a price is. Bid, ask, size, the book, market
against limit, what a fill costs and who provided it, what a candle throws away.
*Mostly does not exist and must be written.* Lesson 25 becomes its sequel, and
"the order book is theater" finally lands on a reader who has been shown one.

**Layer 1 — Your account and your costs.** What you may trade and what it takes
from you: instrument selection (23), the spread (22), slippage, futures and
margin (24), what your broker does without asking (13), sim against live (12).
This decides which strategies exist for a given account, so it precedes strategy.
Lesson 23 already proves it beautifully — a $1.50 micro-cap gives up 73% of its
range to friction — and it is currently lesson 23 of 86.

**Layer 2 — Risk, before any entry.** Expectancy → **variance and drawdown (55)**
→ position sizing (9) → stops (10) → risk of ruin (36). In that order lesson 9's
contradiction disappears without a word being rewritten. Revenge trading (7)
belongs at the end of this layer, not at lesson 7: it is what happens when the
drawdown variance predicted actually arrives, and it teaches better when the
reader has just computed their own.

**Layer 3 — Reading the auction.** The core, and the strongest material: volume
and delta (2), the tape (3, 18), footprint (20+27 merged), volume profile (32),
absorption and exhaustion, divergence (29), liquidity and sweeps (**1**, 16, 31),
order blocks and displacement (14, 17). **Lesson 1 belongs here**, roughly a
third of the way through the course, where everything it assumes has been taught.

**Layer 4 — Context: when the reading applies.** **Regime (53, 33)** — moved from
53 to here is the single highest-leverage change available. Then timeframes (11,
30, 75 merged), sessions (19), scheduled events (45), macro and Fed (44, 68),
correlation and intermarket (47, 76), volatility (46+56 merged). Confirmation
bias (8) sits here, where the reader has enough context to be selective with.

**Layer 5 — The adversary.** Who else is in the book and what their job is: market
makers (43), HFT (26+48+60 merged), dark pools (28+39 merged), institutional
execution and impact (52, 57, 69, 73, 74 → two lessons), options dealers (42,
40), game theory (41).

**Layer 6 — Turning it into a system.** Journal (37) — moved from 37 to the front
of this layer, and every earlier lesson that says "record this" finally points at
something taught. Then backtesting and validation (35), operations (38),
attribution (63), portfolio and correlation (34+50+51+62 → two), automation
(58+61+70 → two), ML (59), why edges die (71), stat arb (67), crypto (72).

**Layer 7 — The business.** Infrastructure (65), tax (64), career (66+84 merged),
building the business (78), and one real capstone instead of eight
(79, 80, 81, 82, 83, 85, 86).

## The decision this needs

Two ways to apply it, and they cost very differently.

**A. Logical resequence.** Numbers and URLs stay. The recommended order becomes a
real, published path; all 116 prerequisites get rewritten as reasons; the
dependency violations get fixed inside the lessons (teach it, or link it and say
why). No URL churn, no re-translation of moved lessons, nothing breaks in search.
Cheap, honest, and a reader following the path gets the right course — but the
numbering keeps lying, and most readers follow the numbering.

**B. Physical resequence.** Renumber to the dependency order. The numbering
becomes the truth. Costs: 86 URLs, `index.json`, 11 locale builds, four hub
pages, every cross-reference in every lesson, and a redirect map for everything
already indexed. We did an 82→86 renumber before and it left a cleanup task.

Either way, the merges and the missing Layer 0 are the same work, and that work
is what actually raises the course.
