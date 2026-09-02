# What each lesson has to be

Seven kinds of lesson. The floor is the same for all of them; the worked
example, the table and the problems are different for each, because a lesson
about what a fill is cannot be taught the way a lesson about order blocks is.

Decide the kind from the title before writing a line. If a lesson looks like
two kinds, it is two lessons.

---

## The floor: every lesson, no exceptions

**Structure.** Exactly one of each `data-part`: claim, prereq, development,
worked, bounds, problems, sources. Problems is an `<h3>`. At most two tables.
No callouts, no accordions, no emoji headings. No inline bold or italic in a
body paragraph; bold lead-ins belong on list items only.

**The claim, in three sentences.** Sentence one names the object. Sentence two
gives the number that makes the lesson worth reading. Sentence three says what
that number does when you move a setting. Never open on the setup.

**Every figure recomputable.** A reader with a calculator must be able to
reproduce every number from what the page states. That means the inputs are
printed in full, and every convention is named: what a window of twenty means,
whether a bar counts as beyond on the wick or the close, which averaging.
**A figure a reader cannot reproduce is a defect even when it is correct.**

**Prerequisites are load-bearing.** Name the two lessons whose results this one
spends, and say what each supplies. If nothing is spent, the lesson is
freestanding and should say so instead of inventing a dependency.

**Bounds are five items, and each one is a real concession.** "What this does
not settle" is not a disclaimer section. Each item names something a reader
might reasonably have concluded and takes it away. The last one ends on the
live question the next lesson answers.

**Three problems, and the reader can start tonight.** Each takes data the
reader already has, produces one number, and needs no trade. The third
problem is always the one that collects a base rate.

**Sources are three, real, and load-bearing.** Author, title, journal, year.
Each must be doing work the lesson leans on, and the sentence after it says
which work.

---

## A. Mechanism
*What a Market Solves. The Order Book. What a Fill Actually Is. Time and
Sales. Who Else Is Here. What a Timeframe Is. What an Indicator Is.*

The reader ends able to say what a thing **is**, in one sentence, correctly.

- Worked example is a walkthrough of the machine with concrete prices, not a
  measurement. One order, followed end to end.
- The table, if there is one, is a state-by-state trace.
- Problems are observations, not computations: watch the thing, record what
  it does, count how often the textbook version happens.
- Closing line defines the object against what people usually think it is.

## B. Cost
*The Spread Is the Price of Immediacy. Every Trade Starts Negative. Slippage
and Impact at Retail Size. Margin and Leverage. Tax.*

A number the reader can compute before trading, that comes out of the edge.

- Worked example is arithmetic on the reader's own account size.
- The table has one row per size or per instrument, and the last column is
  always the cost as a share of a stop or of expectancy.
- Problems make the reader price their own last month.
- Closing line converts the cost into the thing it actually buys or destroys.

## C. Uncertainty
*Expectancy. What an Edge Feels Like. How Long Until You Know. Position
Sizing. Risk of Ruin. When the Drawdown Arrives.*

How long, how deep, how sure. The reader ends knowing what their record can
and cannot settle.

- Worked example is a sample-size or variance calculation with the formula
  written out and one substitution done in full.
- The table maps a difference you want to detect onto trades and then onto
  months, because months is the unit the reader feels.
- Problems make the reader compute the number for their own two figures.
- Closing line separates what the arithmetic decided from what is still open.

## D. Claim under test
*Where Liquidity Rests. The Order Book Is Theater. The Liquidity Lie. Hidden
Size. Absorption and Exhaustion.*

A widely believed story, weighed against what can actually be shown.

- Worked example is the evidence: an enforcement record, a documented
  mechanism, a measurement. Never a chart with arrows.
- Separate what is proved from what is inferred, in the page's own words.
- Problems make the reader look for the claim's own footprint in their data.
- Closing line grants what is true in the story and removes what is not.

## E. Pattern with dials
*Market Structure. Order Blocks. Divergence. Sweeps. Volume at Price. Volume
Profile. Markets Have Modes. Detecting a Regime Change. Repainting.*

**The signature form.** A drawn object whose count depends on settings nobody
displays.

- State the definition in one sentence, then count the settings hiding in it.
- Print the full series. Run the definition at every ordinary setting.
- The table is settings down the side, counts across, and it must have no
  winning row. The spread between its corners is the lesson.
- Name the fact that the count, not the pattern, is what varies.
- Problems: count the levels before counting the signals; change one number
  and recount; collect a base rate.
- Closing line says what the object actually is, given the count.

## F. Procedure
*Where the Stop Goes. Keeping the Record. What Should You Actually Trade.
When Your Broker Acts Without You. What You Are Actually Buying.*

A thing the reader does, that most people do badly by omission.

- Worked example is the procedure executed once, in full, with real values.
- The table is the checklist itself, or the fields, or the decision points.
- Say plainly what goes wrong when each step is skipped.
- Problems are the procedure applied to the reader's own account this week.
- Closing line names the cost of the step everyone skips.

## G. Debunk
*Moving Averages Aren't Support. RSI Above 70 Is Often a Buy. Sim Against
Live. Backtesting Reality.*

One specific popular claim, shown false by measurement.

- State the claim as its believers state it, fairly, before touching it.
- Worked example is the counter-measurement, on stated data, at the settings
  the claim's own advocates use.
- Say what survives. A debunk that leaves nothing standing is usually wrong
  about what people meant.
- Problems make the reader run the same counter-measurement themselves.
- Closing line replaces the claim with the narrower true thing.

---

## Pull

Rigour without pull is a document nobody finishes.

- **Open on the sharpest number.**
- **Name the serial.** Lessons 32 to 36 measure one sixty-bar series, each
  adding a column. Continuity is invisible unless stated.
- **End the bounds on a live question**, never a shrug.
- **Tease the finding, not the topic.** Read the next lesson's claim and
  promise the surprising result by name.
- **Point the homework somewhere.** Each problems section produces a number
  the reader has nowhere to put. Doing it by hand once is the point; doing it
  every session is what a tool is for. Say so once, plainly, without a pitch.
