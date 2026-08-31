# Signal Pilot Academy — target syllabus

The curriculum rebuilt as a course rather than a collection. Every entry below is
a **claim**: the one thing that lesson establishes, stated so it can be argued
for and so the next lesson can build on it. Where an existing lesson supplies the
material, its current number is given. `NEW` means it does not exist.

---

## The standard form every lesson takes

The single largest difference between what exists and an academy is not subject
matter — it is that a lesson currently *asserts and illustrates* where it should
*claim, develop, bound and test*. Every lesson gets these seven parts, in order:

1. **Claim.** One sentence, at the top, in the reader's language. The lesson
   exists to establish it. If it cannot be written, the lesson has no business
   existing.
2. **Prerequisites.** Named lessons and, for each, the specific thing it
   supplies — never a category label. (87 of the current 116 are category labels.)
3. **Development.** The argument, built. A mechanism explained before its
   consequences, a consequence before its exceptions. Not a list of tips.
4. **Worked example.** Numbers the reader can reproduce with a calculator, on
   data they can obtain. Every figure traceable.
5. **Problem set.** Three to five problems with definite answers, at least one
   requiring the reader's own instrument or record. Replaces the current
   multiple-choice quiz, which mostly tests reading comprehension.
6. **What this does not establish.** The boundary of the claim: what the reader
   still cannot conclude, and which lesson addresses it. The best current lessons
   already do a version of this and it is the most academic thing in the course.
7. **Sources.** Primary literature where it exists. Microstructure has a real
   one — Harris, O'Hara, Hasbrouck, Kyle (1985), Glosten–Milgrom (1985),
   Almgren–Chriss (2000) — and a course that cites it is a different object from
   one that does not.

**Notation, fixed once and used throughout.** `R` = one unit of risk (the
distance from entry to stop, in currency). `p` = win rate. `b` = average
win ÷ average loss. `E` = expectancy per trade in R. `ADV` = average daily
volume. `σ` = volatility, always with its period stated. Defined in Lesson 15 and
never redefined.

**Rule of construction: teach before you correct.** The present course opens with
eight corrections in a row to a reader who has not been taught the thing being
corrected. Every debunk in this syllabus now sits *after* the constructive lesson
it argues with, and is stronger for it.

---

## Module 1 — The Mechanism: what a price is
*Nothing here currently exists as a constructive lesson. This is the missing
foundation, and it is why lesson 25 debunks an order book the reader has never
been shown.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 1 | What a Market Solves | A market exists because a buyer and a seller cannot find each other, and every mechanism in this course is a solution to that problem. | NEW |
| 2 | The Order Book | A limit order makes a price and a market order takes one; the book is the list of everyone currently willing to make one. | NEW |
| 3 | What a Fill Actually Is | Your order does not meet "the market", it meets one specific counterparty at one specific price, and queue position decides which. | NEW |
| 4 | The Spread Is the Price of Immediacy | The spread is not a fee; it is what the person on the other side charges for being willing to trade now, and it is priced from their risk. | 22 |
| 5 | Why Anyone Quotes At All | A market maker's two risks — inventory and adverse selection — explain nearly every behaviour the rest of this course describes. | NEW / 43 |
| 6 | The Candle Is a Summary | OHLCV is an aggregation, and knowing exactly what it discards tells you when it may be trusted. | 3, 27 |
| 7 | Time and Sales | The tape is the transaction record: the only place a trade appears before it is a candle. | 18 |
| 8 | Volume and Delta | Volume counts contracts; delta separates who was willing to wait from who was not. | 2 |
| 9 | Who Else Is Here | Hedgers, market makers, informed traders and noise traders are in the book for different reasons, and the reason predicts the behaviour. | NEW |

---

## Module 2 — The Cost of Trading
*Currently scattered across lessons 12, 13, 22, 23, 24 in three different tiers.
It belongs together, and before strategy, because it decides which strategies a
given account can hold at all.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 10 | Every Trade Starts Negative | Spread, commission, slippage and financing are paid before the trade is right or wrong, and their sum is the bar your edge must clear. | NEW / 22 |
| 11 | Slippage and Impact at Retail Size | Impact is a function of your size against resting size, which is why the same order costs differently in two names. | 57, 69 |
| 12 | What Should You Actually Trade | Rank any instrument by friction as a share of its daily range: mega-cap tech gives up ~1%, a $1.50 micro-cap ~73%. | 23 |
| 13 | What You Are Actually Buying | A share, a futures contract, an option and a perpetual are four different legal objects, and the differences are the risks. | 24 + NEW |
| 14 | Margin and Leverage | Margin is a collateral requirement, not a measure of risk, and confusing them is the most common way an account ends. | 24, 13 |
| 15 | When Your Broker Acts Without You | Margin calls, assignment, PDT and halts: compute the exact price at which someone else starts making your decisions. | 13 |
| 16 | Sim Against Live | Simulation can teach mechanics and cannot teach cost or consequence, and knowing which is which is what makes it useful. | 12 |

---

## Module 3 — Uncertainty, Risk and Ruin
*The re-ordering that fixes the course's oldest contradiction. Lesson 9 currently
claims sizing is "the only edge that matters" while its own body denies it —
because the variance lesson that makes sense of sizing is lesson 55.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 17 | Expectancy | An edge is a number: `E = p·b − (1−p)`, and if you cannot write yours you do not have one. | 9 |
| 18 | What an Edge Feels Like | At a 45% win rate, eight losses in a row is an ordinary Tuesday; compute the streak your own system implies. | 55 |
| 19 | How Long Until You Know | A halved edge takes about three years of daily trading to distinguish from variance, which is the real reason strategies are abandoned. | 55 |
| 20 | Position Sizing | Sizing does not create an edge; it is what you do so that variance cannot take the edge away from you before it pays. | 9 |
| 21 | Where the Stop Goes | A stop belongs where the reason for the trade is gone, not at a percentage the market has never heard of. | 10 |
| 22 | Risk of Ruin | Ruin is computable from expectancy, size and bankroll, and the number is usually worse than the guess. | 36 |
| 23 | Keeping the Record | Ten fields, recorded at the time, decide whether any later question about your trading can be answered at all. | 37 (part) |
| 24 | When the Drawdown Arrives | Revenge trading is a predictable response to a drawdown you were told to expect; the fix is structural, not moral. | 7 |

---

## Module 4 — Reading the Auction
*The strongest material in the course, and the first point at which a reader has
what it needs. Lesson 1 sits here, at 27 of ~85, with stops, sizing, timeframes,
delta and the order book all behind it.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 25 | Where Liquidity Rests | Resting orders cluster where people agree, and every pattern in this module is a consequence of that clustering. | 16 |
| 26 | The Order Book Is Theater | Displayed size is an advertisement; the tests that separate a real wall from a quoted one. | 25 |
| 27 | The Liquidity Lie | Price runs through an obvious level because a buyer with size needs the sell orders parked under it — and the reclaim, not the run, is the signal. | **1** |
| 28 | Absorption and Exhaustion | Two candles with identical volume have opposite implications depending on which side was waiting. | 27, 20 |
| 29 | Volume at Price | A footprint shows where in the bar the trading happened, which is the question a candle cannot answer. | 20, 27 |
| 30 | Volume Profile | POC, HVN and LVN describe where price has already done its business, which is where it can move fast and where it cannot. | 32 |
| 31 | Hidden Size | Icebergs and reserve orders exist because showing size costs money; detecting them is detecting someone who does not want to be seen. | 25, 3 |
| 32 | Market Structure | A break of structure and a change of character are claims about who is in control, and they are falsifiable. | 14 |
| 33 | Order Blocks and Displacement | An order block is a decision point, not a support level, and displacement is how you tell the difference. | 14, 17 |
| 34 | Divergence | When price and executed volume disagree, the volume is the more expensive of the two to fake. | 29 |
| 35 | Sweeps, Beyond the First | A double sweep takes the stops of everyone who traded the first one; a failed sweep is information, not a second entry. | 31 |

---

## Module 5 — Context: when the reading applies
*Regime moves from lesson 53 to lesson 36. It is the most-assumed idea in the
course — 31 lessons use it before it is taught — and every indicator lesson in
Module 6 depends on it.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 36 | Markets Have Modes | The same method is profitable and ruinous in two different regimes, so regime is a precondition of every signal, not a refinement of one. | 53, 33 |
| 37 | Detecting a Regime Change | Regime is identified late by construction; what you can do is bound how late, and size for it. | 53 |
| 38 | What a Timeframe Is | A timeframe is a sampling rate, and choosing one is choosing which information to destroy. | 11 |
| 39 | Trading More Than One | Higher timeframes constrain, lower ones execute; the rule is that the constraint is chosen before the entry. | 30, 75 |
| 40 | The Session Cycle | Liquidity is not uniform across the day, and most session "strategies" are restatements of that fact. | 19 |
| 41 | Opening and Closing Auctions | Two moments a day the market clears at a single price, and both publish their imbalance before they do. | 49, 54 |
| 42 | Scheduled Events | The move is priced before the event; read it off the straddle, and understand why a correct call still loses. | 45 |
| 43 | Volatility as a Quantity | VIX is a price, not a forecast; term structure and skew say what is being paid for. | 46, 56 |
| 44 | Correlation | Correlation has no fixed sign, and a portfolio built on one that reverses is a single position. | 47, 34 |
| 45 | The Macro Cycle | Central bank liquidity sets the regime the previous nine lessons operate inside. | 44, 68, 76 |

---

## Module 6 — Indicators, Honestly
*Deliberately after regime. The RSI lesson's whole thesis is a regime claim; it
is currently lesson 5, forty-eight lessons before regime is taught.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 46 | What an Indicator Is | Every indicator is a function of past price; none adds information, and knowing the function tells you the lag. | NEW |
| 47 | Repainting | An indicator that changes its own history shows a backtest of signals that never existed. | 4 |
| 48 | Moving Averages | An MA describes trend and does not cause reversals; the golden cross is a lagging description of something already over. | 6 |
| 49 | Oscillators Under Regime | RSI >70 means continuation in a trend and reversal in a range, which is why the level alone is not a signal. | 5 |
| 50 | Confirmation Bias | You will find the indicator that agrees with you; falsification is the only defence that does not rely on noticing. | 8 |

---

## Module 7 — The Other Side
*Currently four subjects taught two to four times each across three tiers. Here
once, in the order the participants actually interact.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 51 | The Market Maker's Business | Quote, hedge, and manage inventory: a market maker is not your adversary, they are a business with a specific problem. | 43 |
| 52 | Where Your Order Actually Goes | Payment for order flow, internalisation, and why "free" execution is priced somewhere else. | 60, 26 |
| 53 | What Speed Buys | HFT's advantage is physical and bounded; the parts of it that affect you are few and nameable. | 26, 48, 60 |
| 54 | Off-Exchange | A large share of volume never touches a lit book; what a print does and does not tell you about intent. | 28, 39 |
| 55 | How Institutions Execute | VWAP, TWAP and POV exist to hide size, and each leaves a signature. | 52, 74 |
| 56 | The Professional Order Types | Pegged, discretionary, reserve, MOC — what each is for. | 73 |
| 57 | Market Impact | Impact scales roughly with the square root of participation, which is what sets a strategy's capacity. | 69 |
| 58 | Options Dealers | Dealer hedging is mechanical, which makes it the most predictable flow in the market. | 42, 40 |
| 59 | Thinking Adversarially | Every setup you can see, someone can see you seeing. | 41 |

---

## Module 8 — Building a System

| # | Lesson | Claim | From |
|---|---|---|---|
| 60 | From Observation to Hypothesis | A tradeable idea is one stated so that a specific observation would refute it. | 8, NEW |
| 61 | Backtesting | A backtest establishes that a rule would have worked, which is a much weaker statement than it appears. | 35 |
| 62 | Overfitting | With enough parameters any history can be fitted; the defences are out-of-sample data and a parameter budget fixed in advance. | 35, 59 |
| 63 | Forward Testing and Deployment | Every stage of development exists to kill the idea; the ones that survive get real money slowly. | 58 |
| 64 | Performance Attribution | "+50%" is not a result until it is decomposed into the decisions that produced it. | 63 |
| 65 | Is the Edge Gone? | Distinguish a dead edge from a bad month using the streak length the system's own expectancy implies. | 55 |
| 66 | Why Edges Die | Capacity, crowding and decay are permanent; the fourth cause is not a death at all. | 71 |
| 67 | Automation | Code removes emotion and adds failure modes; which ones, and what they cost. | 58, 61, 70 |
| 68 | Machine Learning | ML is a filter over a hypothesis you already have, not a source of one. | 59 |

---

## Module 9 — Portfolio

| # | Lesson | Claim | From |
|---|---|---|---|
| 69 | Your Positions Are One Position | Correlated positions sized independently are a single position sized wrongly. | 34, 50 |
| 70 | Portfolio Heat | Total risk is the sum of correlated risk, not the sum of stops. | 34, 50 |
| 71 | Allocating Across Strategies | Kelly gives the growth-optimal fraction and the reason nobody trades it. | 51 |
| 72 | Where Portfolio Theory Fails Traders | MPT assumes a stable covariance matrix; the crises that matter are when it stops being stable. | 62 |
| 73 | Institutional Risk Controls | Limits that bind before judgement is needed. | 82, 36 |

---

## Module 10 — The Profession

| # | Lesson | Claim | From |
|---|---|---|---|
| 74 | The Trading Day | Structure removes the decisions you make worst. | 38 |
| 75 | Infrastructure | What redundancy actually buys, priced. | 65 |
| 76 | Tax | Optimisation recovers part of 20–40%, and the arithmetic says which part. | 64 |
| 77 | Career Paths | Prop, fund, solo: the tradeoffs, with realistic numbers. | 66, 84 |
| 78 | Trading as a Business | The costs and obligations that appear when it stops being a hobby. | 78 |
| 79 | Capstone: Your System, Written Down | Every claim in this course, applied to one instrument, one timeframe and one account, as a document you can trade from. | 85, 79, 80, 81, 83 |

---

## Electives
*Genuinely specialised; taught after 79, not folded in.*

| # | Lesson | Claim | From |
|---|---|---|---|
| 80 | Statistical Arbitrage | Cointegration, not correlation, and why the spread's half-life is the whole trade. | 67 |
| 81 | Crypto Microstructure | Perpetual funding, 24/7 liquidity and fragmented books change the mechanism, not the principles. | 72 |
| 82 | Behavioural Finance | The named biases, and which of them have survived replication. | 77 |
| 83 | Dispersion and Vol Surface Trading | Trading the relationship between index and component volatility. | 46 |

---

## What this changes, in numbers

Validated against `slotmap.tsv`, which assigns every one of the current 86
lessons to a destination and is checked so that none is lost or duplicated.

- **85 lessons in 11 modules** against 86 in 20 categories, four of which were
  buckets rather than subjects.
- **14 lessons written from nothing** — slots 1, 2, 3, 5, 9, 10, 14, 17, 19, 31,
  48, 62, 64, 67. Nine of them are the foundation the course has never had; the
  rest are concepts currently split across lessons that each assume the other.
- **14 lessons merge** into a sibling rather than standing alone: 39, 40, 48, 54,
  68, 70, 74, 75, 76, 79, 80, 81, 83, 84, 86. The six-page professional capstone
  becomes one lesson.
- **71 lessons keep their content and change position.**
- **Zero dependency violations.** The ordering is derived from the constraint
  that a concept is taught before it is used, not from how difficult a topic
  sounds.

The moves that matter most, by distance:

| old | new | lesson | why it moved |
|---|---|---|---|
| 55 | **18** | What an Edge Feels Like | sizing at 20 is meaningless without it |
| 53 | **36** | Markets Have Modes | 31 lessons used regime before it was taught |
| 57 | **11** | Slippage and Impact | a cost, and costs precede strategy |
| 37 | **23** | Keeping the Record | 20 lessons say "record this" before it existed |
| 1 | **27** | The Liquidity Lie | needs stops, sizing, delta and the book first |
| 5 | **51** | Oscillators Under Regime | its thesis *is* a regime claim |
| 4, 6, 8 | **49, 50, 52** | the indicator debunks | teach before you correct |
| 34 | **71** | Your Positions Are One Position | needs correlation, taught at 45 |
| 38 | **76** | The Trading Day | an operations lesson, not an intermediate one |
