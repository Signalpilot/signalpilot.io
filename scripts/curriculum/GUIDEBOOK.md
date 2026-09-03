# The Signal Pilot Learn Guidebook

*Everything a lesson has to be, and everything it must never do. If the work
starts drifting, this is the document that pulls it back.*

---

## What we are actually building

There is no shortage of people explaining order blocks on the internet. There
is a shortage of people who will print the numbers.

That is the whole difference, and it is worth being precise about it, because
it decides every other choice in this document. The standard lesson elsewhere
shows a chart with arrows on it, tells you what the arrows mean, and moves on.
You cannot check it. You cannot disagree with it in any way that costs you
effort. You read it, you feel informed, and a week later you have nothing.

Ours prints the sixty closes. It states the rule in one sentence. Then it runs
the rule at every ordinary setting and shows you that the same bars contain
ten order blocks, or five, or four, or two, depending on a number nobody
displays. A reader with a calculator can reproduce every figure on the page,
and when they do, the lesson's real claim lands with a weight that no amount
of confident prose could give it: *the count is a fact about your settings,
not about the market.*

That is the thing we have that others do not, and it is expensive, which is
exactly why it is a moat. But it is not enough on its own. A rigorous document
that nobody finishes has taught nobody anything. The lessons also have to
pull — to open on something that makes a reader sit up, to overturn an
expectation once per lesson, and to end somewhere that makes the next one feel
owed. Rigour is the floor. Pull is what gets a reader to the floor.

### The one-line version

**A lesson is finished when a reader who disagrees with it has to do
arithmetic, and a reader who agrees with it has something to do tonight.**

---

## Anatomy of a lesson

Every rule is filed under the part of the lesson you are standing in when you
need it, and each is said once.

When two rules pull against each other, the order of precedence is: the hard
rules, then the frame, then the anatomy, then the shape. So "numbers that
matter go in a table" never buys a third table, and a lesson that needs three
tables to be honest is two lessons.

### The frame every lesson shares

Seven parts, in this order, exactly one of each, marked with `data-part`:
`claim`, `prereq`, `development`, `worked`, `bounds`, `problems`, `sources`.
Problems is an `<h3 data-part="problems">`, never a section-break div, and the
`<ol>` that follows carries no duplicate `data-part`.

At most two tables. One worked example. No callouts, no accordions, no emoji
headings, and no quiz: the three problems are the assessment, and a quiz that
asks a reader to recall a definition is the thing this whole document exists
to avoid. A quiz belongs at the end of a module, not the end of a lesson, and
its rules are in **Between the pages**.

No inline `<strong>` or `<em>` in a body paragraph. The only permitted bold is
the `Prerequisites:` and `Sources.` labels and lead-ins on `<li>` items.
Table-cell emphasis is display, not prose, and is fine.

Percentages in English prose are words with the digits kept: `70 per cent`,
not `70%`. Table cells and monospace keep the sign. Locale text keeps `%`,
because the "per cent" spelling is an English house-style choice and does not
travel.

Numbers that matter go in a table or on their own line. A measurement buried
mid-sentence is a measurement nobody checks.

A lesson is as long as its arithmetic and no longer. There is no target
length; the range the rebuilt lessons have actually landed in is in **Where
the work stands**, and it is a description, not a quota.

### 1. The claim

**Must contain.** One claim, stated so that it could have come out otherwise,
and the sharpest number in the lesson. "The same twenty bars contain eight
structure events, or two, or none" is checkable and could have been false.
"Market structure is important" is refuted by nothing and therefore claims
nothing.

**How it reads.** Open on the number, not on the setup and not on a
definition. Put that number inside something the reader is certain they
already understand, because the commonest reason a reader leaves is not
boredom but recognition: nobody thinks *I am bored*, they think *yes, fine,
order blocks, I know this one*, and from that sentence on they are skimming.
Dig exactly one gap, and phrase it so the reader could state it back as a
single question. Phrase it as a sentence about them rather than about markets:
*divergence counts depend on settings* is a fact, and *whichever count you
have been trading is the one your platform chose for you, and you have never
seen the other two* is the same fact aimed at a person. Then state the
surprising result and stop. The explanation waits for the development, because
an explanation given before the evidence is an opinion, and a reader dismisses
an opinion in the time it takes to read it.

**Ask.**
- What observation would have made this lesson wrong?
- What does the reader think they already know, and what is the number inside
  it that they have never checked?
- Write the reader's question in one sentence. If you needed the word "and",
  it is two lessons.
- Can the claim be read as a sentence about the reader's own trading?
- Count the sentences between the surprising result and its explanation. If
  the answer is one, move the explanation.

### 2. The prerequisites

**Must contain.** The earlier lessons this one spends, named by what they gave
rather than only by number, or the word "none".

**How it reads.** One line, no apology, no throat-clearing. A lesson that
could be read in any order is a blog post with a number on it.

**Ask.** What does this lesson spend, and what will it leave owed?

### 3. The development

**Must contain.** The inputs, printed in full. The rule, in one sentence. The
rule run at every ordinary setting, so the reader can get our answer without
asking us anything. The module's running object, named, with a
sentence saying which lesson adds which column and which lesson spends them
all.

**How it reads.** Evidence above conclusion, every time. Lay the arithmetic
out so the conclusion is visible one line before the page states it; that
half-beat is the physical sensation of learning something, and stating the
conclusion first steals it. Never go three paragraphs without something a
reader could verify: a price, a count, a bar number, a date, a figure from a
record. Three paragraphs of plain assertion is roughly the distance at which a
reader decides this page is like the other pages.

Introduce at most one new term, and make it name something the reader can
point at on their own screen tonight. A mechanism lesson opening a module may
name the parts of the one machine it walks — bid, ask, spread, the two order
types are one machine, not four — but it may not name a second machine.
Everything else gets one word. Once introduced, a term is settled: every later
lesson uses it and every locale uses one word for it. If you cannot name the
later lesson that will spend the term, it is not a name, it is jargon, and
jargon is how a reader can tell we have stopped showing and started sounding.

Cut anything that survives its own deletion. "In this lesson we will explore."
"As we have seen." "It is important to understand that." Each of those is a
sentence apologising for the next one. Vary sentence length, because prose in
which every sentence has the same shape reads as machine output and spends the
credibility the arithmetic just earned. Prefer the concrete noun to the
category: not *a trader*, but a trader taking forty trades a month at eight
tenths of a point.

Once, in passing, state the asymmetry: almost nobody the reader trades against
has ever checked this, and checking it costs an evening and a spreadsheet.
Say it plainly, without flattering the reader and without sneering at anybody
else, and say it once.

**Ask.**
- Could a reader reproduce every number without asking us anything?
- What is the longest run of paragraphs with no figure in them?
- For every conclusion on the page, is its evidence above it or below it?
- What is the one word the reader leaves with, and which later lesson spends
  it?
- Read it aloud. Wherever you got bored, two sentences in a row have the same
  length and shape. Change one.
- Find the asymmetry sentence. Would it survive being read by the people it is
  about?

### 4. The worked example

**Must contain.** Exactly one instance, carried end to end with real values,
and the arithmetic that makes the claim true. What the example is changes with
the lesson's shape; see **Seven shapes**.

**How it reads.** This is where the surprise lands. Somewhere here, arithmetic
the reader has just watched has to overturn what they expected: RSI falls
fifteen points with nobody selling harder on any bar; adding confirmation
costs you the move; four consecutive bars get marked in both directions at
once. Without that moment you have written a summary.

Directly after the surprise, and nowhere else, put the sentence the reader
will still have in a week. It is short, it carries no figure, and it states
the claim now that the arithmetic has made it true: *the count is a fact about
your settings, not about the market.* Twelve words, and a reader who repeats
them to somebody else has taught the lesson. Say it exactly once. Said twice
it is a slogan, and a reader can tell a conclusion from a slogan across a
room.

**Ask.**
- Name the sentence where the reader's expectation breaks.
- What is the sentence they will still have a week later? Does it sit directly
  after the surprise, and is it said exactly once?
- What can the reader now do, in one sentence beginning with a verb?

### 5. The bounds

**Must contain.** Five concessions, in the lesson's own voice, naming what the
lesson did *not* establish, including the objection a sharp reader is already
forming. At least one of the five must cost us something we would rather have
kept. A bound that is true of every lesson — "this was one instrument on one
day" — is free, and a reader can feel that it cost nothing.

The five are paragraphs, in continuous prose, inside a
`<div data-part="bounds">`. Nine lessons concede in a bulleted list of bolded
assertions instead, and that is the wrong shape: a list reads as a disclaimer
somebody's lawyer wrote, and the whole force of this part is that the lesson
is talking about itself. Convert on contact.

**How it reads.** This is counter-intuitive and it is the single largest
reason the lessons are trusted: the concessions are what make the remaining
claims worth believing. A writer who tells you what they have not shown is the
only kind worth believing about what they have.

End on a live question, never a shrug. The last line before the problems is
the thing the reader now wants to know and cannot yet, or the thing they still
cannot do. Then tease the next lesson by its finding, not its topic. "Lesson
37 is about the lag that creates" is a table of contents. "Where one bar of
confirmation halves the number of changes you declare" is a reason to keep
reading, and it is a debt the next lesson's claim has to pay.

**Ask.**
- Which item here would you rather have left out? If none, you have not
  conceded anything yet.
- Does the last line before the problems name something the reader now wants
  and cannot yet have?
- Does the tease name a finding, with the figure the next lesson's claim will
  carry?

### 6. The problems

**Must contain.** Three, in this order, and they are a ladder: ten minutes,
half an hour, an evening. Each produces exactly one number, on the reader's
own instrument. The third collects a base rate, because a number with nothing
to compare it against is not a result.

**How it reads.** The first must be nearly impossible to get wrong. A reader
holding one number of their own does the second. A reader who failed the first
closes the tab, does not come back for the base rate, and does not open lesson
twelve. Wanting to learn is not a mood a reader arrives with; it is what a
small success feels like from the inside, and it has to be felt before
anything larger is asked.

People do not finish easy things, though. They finish things that were
slightly too hard and that they got through anyway, so the third problem has
to cost a real evening. A result the reader paid an evening for is one they
own. A result they read is one they borrowed, and borrowed results are
returned by the weekend.

Point the homework somewhere once, without a pitch. Doing the arithmetic by
hand is the point the first time; doing it every session is what software is
for. Name the tool that takes that specific count and stop. The moment it
reads as an advertisement it costs more credibility than it earns, and
credibility is the only thing we are actually selling.

**Ask.**
- Could a reader who only skimmed the lesson finish problem one in ten
  minutes? If not, it is problem two.
- Which problem costs an evening, and what number is the reader holding at the
  end of it?
- Does each problem produce exactly one number?

### 7. The sources

**Must contain.** At least two, real, confirmed to exist, and load-bearing.
Author, title, journal or publisher, year. The sentence after each citation
says which part of the lesson leans on it.

Two is a floor, not a quota. What counts as a source changes with the shape:
for a claim under test it is usually a paper or an enforcement record; for a
mechanism or a procedure lesson the load-bearing document is an exchange rule
book, a regulatory filing or a broker agreement, and those count fully.
Forcing three journal papers onto *Keeping the Record* produces padding, which the
development forbids in part 3.

Never invent a paper, never invent a finding, never cite something you have
not confirmed exists.

**Ask.**
- Does the lesson actually lean on each source, and does the text say how?
- Have you confirmed that each one exists?

---
## Between the pages

The anatomy works inside one lesson. A course is a different object: a reader
who finishes a lesson has to be carried into the next, and the promises that
carry them are made on one page and kept on another. These are the only rules
that need two pages open at once, which is also how you check them.

**Every tease is a promise, and the next lesson's claim keeps it.** If lesson
36 ends by promising that one bar of confirmation halves the number of changes
you declare, lesson 37 opens on that halving, in its claim, inside the first
two hundred words, with the same figure. Paid three lessons later, or in the
development, or as "roughly a third fewer", it was not paid, and a reader
stiffed once reads every later tease as decoration and stops reading the
bounds at all. We get to break this once.
*Ask: does the next lesson's claim contain the figure this lesson's tease
promised?*

**Spend the number, not the lesson number.** *As lesson 36 showed* is a
reference, and references are skipped. *The 0.22 from the sixty closes* is the
result itself, and a result gets used. Put the figure on the page and have the
reader do one line of arithmetic with it before we do; retrieval is the only
rehearsal that fixes anything. A reader who recomputes a piece of lesson 36
while reading lesson 38 has learned lesson 36 twice, and the second time is
the one that lasts. It is also how a reader discovers that the course is one
object rather than a list.
*Ask: does every "as we saw earlier" carry the figure, and does the reader
touch it?*

**Every module has a serial, and its last lesson makes it pay.** A module's
running object gains a column per lesson. Module 4's is a sixty-bar series:
lesson 32 gives the first twenty highs and lows, lesson 33 adds their opens
and closes, lesson 34 carries the closes out to sixty and lesson 35, the
module's last, supplies the forty highs and lows still missing. Until that
last lesson the columns are a habit. Lesson 35 has to run a calculation
needing all of them at once, one the reader could not have done at lesson 25,
and that is the moment the serial becomes a build. Lesson 36 then opens module
5 by spending the finished series, which is the previous rule working across a
module boundary rather than a second serial starting. Nothing motivates the next module like having just felt the last one
add up. Module 1's serial is the two notices at $46 and $48; the reader is
told so in lesson 1.
*Ask: could the module's last lesson be moved to first without losing
anything? If yes, the serial has not paid out.*

**One quiz per module, at the end, and it asks the reader to compute.** No
lesson carries a quiz; the three problems are a lesson's assessment. A module
ends with one quiz, and every question in it hands the reader numbers and asks
for a number back, or hands them two settings and asks which count follows.
A question that asks what a term means is testing vocabulary, and the whole
point of printing the numbers is that a reader ends able to do something
rather than able to define something. The quiz is
also the natural place to make the serial pay out a second time, because by
then the reader has all the columns.
*Ask: could any question be answered correctly by somebody who had only read
the definitions?*

**The title names the object; the description carries the number.** A reader
meets a lesson twice before its claim, once on the index and once in a search
result, and both meetings take about two seconds. The title is a plain noun
phrase naming the object: *What a Fill Actually Is*, *Markets Have Modes*,
*Order Blocks and Displacement*. No colon-and-promise, no verdict, no figure.
A debunk lesson names the claim rather than delivering the verdict — *Moving
Averages as Support*, not *Moving Averages Aren't Support* — which is also
what the debunk shape asks for: state the claim fairly before laying a finger
on it. The verdict goes in the description, along with the claim's sharpest
figure, and the description is rewritten whenever the claim is. A figure in a
title goes stale in the one place that is expensive to change: the index, the
sitemap, the cross-links and eleven locales all carry it.
*Ask: read the title cold. Is it a thing or a promise? Does the description
carry the figure the claim currently prints?*

---

## Seven shapes, because the teaching method is not the same twice

A lesson about what a fill is cannot be taught the way a lesson about order
blocks is taught. The anatomy above holds everywhere. What changes with the
kind of lesson is three of its seven parts: the worked example, the table
inside the development, and the problems.

Decide the kind from the title before writing a line. If a lesson looks like
two kinds, it is two lessons.

**Mechanism.** *What a Market Solves. The Order Book. What a Fill Actually Is.
Time and Sales. What a Timeframe Is.* The reader ends able to say what a thing
**is**, correctly, in one sentence. The worked example walks the machine with
real prices: one order, followed end to end. Problems are observations rather
than computations — watch the thing, record what it does, count how often the
textbook version actually happens. The closing line defines the object against
what people usually think it is.

**Cost.** *The Spread. Every Trade Starts Negative. Slippage and Impact.
Margin and Leverage. Tax.* A number the reader can compute before trading,
that comes out of the edge whether the trade works or not. The worked example
is arithmetic on their own account size. The table runs one row per size or
per instrument, and its last column is always the cost as a share of a stop or
of expectancy, because a cost in cents means nothing. Problems make the reader
price their own last month.

**Uncertainty.** *Expectancy. What an Edge Feels Like. How Long Until You Know.
Position Sizing. Risk of Ruin.* How long, how deep, how sure. The worked
example is a sample-size or variance calculation with the formula written out
and one substitution done in full. The table maps a difference you want to
detect onto trades and then onto months, because months is the unit a person
actually feels. The closing line separates what the arithmetic settled from
what is still open.

**Claim under test.** *Where Liquidity Rests. The Order Book Is Theater. The
Liquidity Lie. Hidden Size.* A widely believed story, weighed against what can
actually be shown. The worked example is the evidence — an enforcement record,
a documented mechanism, a measurement — and never a chart with arrows. Keep
what is proved separate from what is inferred, in the page's own words. The
closing line grants what is true in the story and removes what is not.

**Pattern with dials.** *Market Structure. Order Blocks. Divergence. Sweeps.
Volume Profile. Markets Have Modes. Repainting.* This is the signature form,
and it is where we are least like anyone else. State the definition in one
sentence, then count the settings hiding inside it. Print the full series. Run
the definition at every ordinary setting. The table puts settings down the
side and counts across, and it must have no winning row — the spread between
its corners *is* the lesson. Problems: count the levels before counting the
signals, change one number and recount, collect a base rate.

**Procedure.** *Where the Stop Goes. Keeping the Record. What You Are Actually
Buying. When Your Broker Acts Without You.* A thing the reader does, that most
people do badly by omission rather than by error. The worked example executes
the procedure once, in full, with real values. The table is the checklist, or
the fields, or the decision points. Say plainly what goes wrong when each step
is skipped. The closing line names the cost of the step everyone skips.

**Debunk.** *Moving Averages as Support. RSI Above 70. Sim Against Live.
Backtesting.* One specific popular claim, shown false by measurement.
State the claim as its believers state it, fairly, before laying a finger on
it. The worked example is the counter-measurement, on stated data, at the
settings the claim's own advocates use. Then say what survives — a debunk that
leaves nothing standing is usually wrong about what people meant. The closing
line replaces the claim with the narrower true thing.

---
## Hard rules, no exceptions

**No performance claims, ever.** No composite track records, no "our students
average", no returns, no win rates presented as ours. Thirty-two lessons were
stripped of invented performance records once already. If a number describes
what somebody made, it does not go on the page.

**Every figure recomputable, and every convention stated.** A reader taking
"twenty closes" to mean twenty closes got 0.27 where lesson 36 printed 0.22,
because the convention was twenty *steps* and the page never said so. A figure
a reader cannot reproduce is a defect even when it is correct.

**Implement the rule; do not trust the prose.** The commonest defect in a
rebuilt lesson is not a wrong number, it is a right number that nobody else
can land on. Five lessons in modules 3 and 4 printed tables whose figures were
correct and whose method was underspecified: a simulation with no seed (22, 24),
"two other plausible shapes" that were never named (25), a structure walk that
silently required a first break to count as a change of character (32), and a
sweep count that silently required an excursion to consume its own reclaim bar
(35). Every one was found by writing the rule out in Python and failing to
match, and none of them would have been found by reading. So: implement, and
when the implementation disagrees, do not assume the page is wrong. Find the
convention that closes the gap, then put it on the page.

**Check boundary cases in exact arithmetic.** Twice now a published figure has
failed to reproduce in floating point and been right: lesson 37's bar 43 is
exactly two fifths and comes out 0.3999999999999988, and three of lesson 40's
nineteen gap multiples are exactly three halves and one of them lands a hair
short. Both times the page was correct and the check was wrong. When a value
sits on its own threshold, redo it with `fractions.Fraction` before concluding
anything &mdash; and say so on the page, because the reader running it in a
spreadsheet will hit the same edge.

**A simulated figure names its seed, its run count and its length.** Lesson 22
printed five ruin probabilities to two decimals from two hundred thousand
careers and never said which stream produced them, so nothing on the page could
be checked, only approximately agreed with. Every other simulation in the module
states its seed; this one now does too. A number nobody can land on exactly is
an assertion wearing a decimal point.

**Recompute; do not read.** Rebuild every number in Python from the stated
inputs. Reading the arithmetic finds nothing. Recomputing found that lesson 34
claimed an advance "occupied half as many of the fourteen slots" when ten
against seven is not half; that lesson 35's tightest count was one window too
wide and the stale figure had spread to the opening claim and the meta
description; and that lesson 36 was not reproducible at all.

**A figure changed in one lesson can falsify a figure in another.** Correcting
the micro-cap's spread in lesson 12 silently broke lesson 16, four lessons
later, which had computed a breakeven win rate from the old quote. Reading
would never have found it; only recomputing did. So when a shared figure
changes, grep the corpus for the instrument or the quantity and recompute
every lesson that spends it, in the same sitting, before committing.

It has now happened twice. Correcting lesson 18's drawdown columns broke
lesson 20's sizing table and lesson 24's recovery table, both of which are
the same simulation read in a different direction. So the sweep is not a
precaution, it is a step: after any table cell changes, search every lesson
for the old numerals themselves, not for the subject. The search is what
found both breaks; reading did not, and neither did the checker.

**When a defect turns out to be systemic, sweep it corpus-wide in the same
sitting.** Reading one Japanese lesson found one character doing duty for both
a price gap and a computational window. That was 113 memory values across the
whole corpus, not one lesson's problem. Fix it everywhere, then say so in the
ledger.

---

## The method, per lesson

Six steps. All six, every time, in this order.

1. **Read the English end to end as a reader**, not as a checker. Fix whatever
   that finds, not a predetermined list.
2. **Recompute every number in Python** from the stated inputs, and state any
   convention a reader would need in order to reproduce them.
3. **Hold the frame**: seven parts, at most two tables, one worked example, no
   inline emphasis in prose, percentages as words, no quiz.
4. **Run the checklist below.** Every question in it comes from the anatomy,
   in the order a reader meets the page. The prose above explains why each one
   matters; the checklist is the part that actually runs.
5. **Carry every fix into all eleven locales, written by hand, never
   delegated** — then read all eleven rendered pages as prose.
6. **Close out**: build, check, regenerate the index with `hubs.py`, refresh
   the sitemap, write the ledger row, commit, push both branches. The index
   step is not optional: a rebuilt lesson can change its own title, and if the
   index is not regenerated in the same sitting it drifts by construction.

### Step four: the checklist

Generated from the Ask lines in **Anatomy** and **Between the pages** by
`scripts/curriculum/checklist.py`. Change a rule there and regenerate; never
retype this section, because a hand-kept copy drifts from its original
inside a day.

**Claim**
- What observation would have made this lesson wrong?
- What does the reader think they already know, and what is the number
  inside it that they have never checked?
- Write the reader's question in one sentence. If you needed the word
  "and", it is two lessons.
- Can the claim be read as a sentence about the reader's own trading?
- Count the sentences between the surprising result and its explanation. If
  the answer is one, move the explanation.

**Prerequisites**
- What does this lesson spend, and what will it leave owed?

**Development**
- Could a reader reproduce every number without asking us anything?
- What is the longest run of paragraphs with no figure in them?
- For every conclusion on the page, is its evidence above it or below it?
- What is the one word the reader leaves with, and which later lesson
  spends it?
- Read it aloud. Wherever you got bored, two sentences in a row have the
  same length and shape. Change one.
- Find the asymmetry sentence. Would it survive being read by the people it
  is about?

**Worked example**
- Name the sentence where the reader's expectation breaks.
- What is the sentence they will still have a week later? Does it sit
  directly after the surprise, and is it said exactly once?
- What can the reader now do, in one sentence beginning with a verb?

**Bounds**
- Which item here would you rather have left out? If none, you have not
  conceded anything yet.
- Does the last line before the problems name something the reader now
  wants and cannot yet have?
- Does the tease name a finding, with the figure the next lesson's claim
  will carry?

**Problems**
- Could a reader who only skimmed the lesson finish problem one in ten
  minutes? If not, it is problem two.
- Which problem costs an evening, and what number is the reader holding at
  the end of it?
- Does each problem produce exactly one number?

**Sources**
- Does the lesson actually lean on each source, and does the text say how?
- Have you confirmed that each one exists?

**Between the pages**
- Does the next lesson's claim contain the figure this lesson's tease
  promised?
- Does every "as we saw earlier" carry the figure, and does the reader
  touch it?
- Could the module's last lesson be moved to first without losing anything?
  If yes, the serial has not paid out.
- Could any question be answered correctly by somebody who had only read
  the definitions?
- Read the title cold. Is it a thing or a promise? Does the description
  carry the figure the claim currently prints?

### Step five is where the grade was actually won

The English was always the part that got read. The locales were the part that
got built. Reading them as prose, rather than running a checker over them,
turned up a dozen real defects per lesson:

- **Wrong sense.** Nine locales at once rendered "bounds the answer" as
  "frames the answer", which is a weaker claim than the clause that follows
  it. Dutch used a word meaning "substandard" for "understates", inverting a
  lesson's closing line.
- **Collisions.** One word doing two jobs, so a sentence said "window" twice
  where the English said window and lookback.
- **Reversed agency.** Hungarian had the price displacing the order blocks
  rather than the other way round.
- **Added or lost content.** Japanese carried a clause that is not in the
  English and duplicated the rest of its own sentence. Spanish and Italian
  dropped a quantity from "within the next few bars".
- **Grammar.** Bare adverbial negatives in Spanish, French and Italian, all
  three ungrammatical in their own language.
- **Register.** Formal and informal imperatives inside a single lesson.

None of that is visible to a checker. All of it is obvious on a read.

### Locale conventions

Quotation marks: German `&bdquo;…&ldquo;`; Dutch and Hungarian
`&bdquo;…&rdquo;`; French `&laquo;&nbsp;…&nbsp;&raquo;`; Spanish, Italian,
Portuguese, Russian, Turkish and Arabic `&laquo;…&raquo;`; Japanese `「…」`.
Those are the entities the built pages actually carry, on both the open and
the close.

Second person is settled per locale and must not drift inside a lesson:
German *du*, French *vous*, Spanish *tú*, Italian *tu*, Portuguese *tu*,
Dutch *je*, Russian *ты*, Turkish *sen*, Hungarian informal, Arabic informal
masculine.

Portuguese is post-1990 orthography. Spanish uses *centavo*, not *céntimo*.
Turkish stores apostrophes as the bare character where most locales store the
entity, which matters when matching a stored value in order to edit it.

Terminology is settled per locale and must not split across lessons. Where a
reading finds two words for one thing, pick the one already dominant in the
corpus and align the rest — this is how "displacement", the swing lookback,
"dial" and "base rate" were each reduced to one word per language.

---

## The build machinery

```
python3 scripts/curriculum/translate.py keys <slug>   # writes .keys.json
python3 scripts/i18n/build.py curriculum/<tier>/<slug>.html [lang]
python3 scripts/i18n/checks/run.py <slug>
python3 scripts/curriculum/hubs.py                    # regenerate the index
python3 scripts/curriculum/hubs.py --check            # exit 1 if stale
python3 scripts/curriculum/touch_sitemap.py <tier>/<slug>
```

Run from the repo root; lesson paths are relative to `education/`.

`scripts/curriculum/remerge.py` carries a merged paragraph back off the built
locale page rather than retranslating it. Three traps: `_nodes` slices at
`data-part="claim"` *inside* the open tag, so node zero is the prereq and not
the claim; `_one` with `after:<marker>` **discards the marker itself**, which
silently truncated a key in all eleven locales once; and `_guard` refuses to
merge if any key is absent from the English page, which is the only thing
standing between you and writing one lesson's text under another's keys.

The builder skips a locale silently if any string is untranslated, so a page
that "builds" may be English. Numeric-only cells are localised automatically
by `numfmt`. A node needs two consecutive ASCII letters to become a
translatable key, which is why `&middot;` turns a line of pure numbers into a
translatable string and the literal `·` does not.

### The front door

Everything above governs a lesson. A reader meets other pages first, and the
index is where most of them start, so the index is held to the same standard.
Read as a reader, it failed on five counts: four different lesson counts in
eight places; every Start button opening the wrong lesson, two of them in the
wrong tier and one of them an orphaned `_merged` file rather than a lesson;
three prerequisite lines naming the wrong last lesson, one, three and eight
slots out; four tier summaries each describing a different tier, one of them a
list of indicator names; and the titles from slot 35 onward still in the old
register.

The diagnosis matters more than the list, and it is not the obvious one. The
catalogue was right. Every rebuilt title, and the lesson at slot 48, were
already in it, and a generator existed that owned the listing. Everything
*around* the listing was still typed, so each rebuilt lesson pushed the page a
little further from the truth and nothing ever said so.

So the rule is one rule, and it is an inversion rather than a checklist: the
hub pages are built, never typed. Every fact on the index is a fact about the
corpus, and the corpus is on disk.

- The lesson count is the length of the listing. It is computed once and
  written wherever a count appears.
- A Start button resolves to the lowest slot in its tier. A prerequisite line
  is the previous tier's last slot. Neither is typed.
- A lesson's title on the index is read from the lesson's own page.
- A tier's summary boxes are drawn from that tier's own modules and lesson
  titles, and carry no indicator names. Where a box shows only some of a
  module's lessons it says how many it left out, because a silent cap reads as
  completeness.
- A missing slot is shown as a gap. An orphaned `_merged` file is never a link
  target. A gap is a fact; a broken link is a claim.
- Where a locale has an index it is built from that locale's lesson files, not
  translated on its own, so it cannot say anything the lessons do not. This was
  a rule before it was true: `hubs.py` built only the English page, and for as
  long as it did, every locale index sat on the pre-renumber course with
  English titles, English links and one Start button opening an orphan. A rule
  nothing enforces is a wish. It builds all twelve now, and `--check` fails on
  any of them.

The check is the development's first question asked one level up: could a
reader reproduce every number on the index from the lesson files, without
asking us anything?

---

## Operating constraints

- Develop on `claude/soro-website-feedback-bemz3i`; push to **both** that and
  `main`.
- Commit often. A lesson finished and uncommitted is a lesson at risk.
- No agents, no workflows. This work is done directly.
- Full file reads and Python edits. Never grep to locate an edit target, and
  never hand-edit HTML in a way that can break structure.
- Translate per lesson, immediately after the rebuild. Never batch translation
  across lessons — it is the only safe method.
- Read everything: the source end to end, the rebuild end to end, and every
  rendered locale page, before committing.
- Keys and secrets go in Vercel environment variables, never into chat.
- Update `sitemap.xml` and validate it with `xml.dom.minidom`. Never mention
  resubmitting it.
- The ledger at `scripts/curriculum/academy-ledger.tsv` takes one row per
  lesson: six tab-separated fields, `slot words read2 found commit deferred`.
  Write what was found, not what was done.

---

## Where the work stands

This is the only place in this document that carries status. Everything above
is a rule, and rules do not go stale.

### The map

| Module | Slots | Tier |
|---|---|---|
| 1. The Mechanism | 1&ndash;9 | Beginner |
| 2. The Cost of Trading | 10&ndash;16 | Beginner |
| 3. Uncertainty, Risk and Ruin | 17&ndash;24 | Beginner |
| 4. Reading the Auction | 25&ndash;35 | Intermediate |
| 5. Context | 36&ndash;47 | Intermediate |
| 6. Indicators, Honestly | 48&ndash;52 | Intermediate |
| 7. The Other Side | 53&ndash;61 | Advanced |
| 8. Building a System | 62&ndash;70 | Advanced |
| 9. Portfolio | 71&ndash;75 | Professional |
| 10. The Profession | 76&ndash;81 | Professional |
| 11. Electives | 82&ndash;85 | Professional |

All 85 numbered slots now exist. The three holes in module 8 &mdash; slots 62,
64 and 67 &mdash; were written from nothing on 3 September 2026. The rebuilt lessons run from about
1,500 to about 4,900 words, median close to 2,500. Fifteen orphaned `_merged` files sit alongside the corpus and
are linked from nowhere.

### What "done" means

A slot is **rebuilt** when it exists in the Learn form: seven parts, the
reading contract held, every figure recomputed. Slots 1 to 67 are rebuilt.
Slots 68 to 85 are still the old lessons.

A slot has had its **full treatment** when it has additionally passed the step
four checklist end to end, in English and in all eleven locales, and carries a
ledger row saying what that found. Slots 1 to 67 have.

A module is **complete** when every slot in it is rebuilt. Modules 1 to 7 are
complete, which is slots 1 to 61. Module 8 is six of nine: slots 62 to 67 are
written and 68, 69 and 70 are still legacy.
Modules 9 to 11 have not been started.

### Open

- Full treatment of slots 68 to 85.
- Eleven module quizzes. None exists; the legacy per-lesson quizzes are being
  dropped, not carried.
- The four tier pages and the learning path are still typed by hand. All
  twelve indexes are build artifacts.
- Ledger debts: percent spacing in five locales, Japanese inline-emphasis
  whitespace, English meta descriptions on locale pages, second-person
  register per locale, composite trader names, price display on localised
  commercial pages, and seventeen stored Japanese values still using a
  minority synonym for "net".
