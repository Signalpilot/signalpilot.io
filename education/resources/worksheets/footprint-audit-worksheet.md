# Footprint Audit Worksheet

*Signal Pilot Education — companion to Lesson 28: Absorption and Exhaustion.*

Two bars can share their open, high, low, close, total volume and even the volume at every price and still carry deltas of +2,820 and −1,680, one read as absorption and the other as exhaustion. Before any of that is worth arguing about, three things have to be established about your own data. This worksheet establishes them.

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results. Every number in
> this worksheet is one you measure on your own record; the figures in the
> right-hand column are what the lesson measured on its own sixty bars, and they
> are there to be disagreed with rather than copied.

---

## 1. Audit five footprints

Take five consecutive bars on the instrument and timeframe you actually trade.
For each, add the buy column and the sell column and compare the total to the
bar's volume, then check that no single row's delta exceeds that row's volume.

| Bar | Buy column | Sell column | Sum | Bar volume | Match? | Any row delta > row volume? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | Yes / No | Yes / No |
| 2 | | | | | Yes / No | Yes / No |
| 3 | | | | | Yes / No | Yes / No |
| 4 | | | | | Yes / No | Yes / No |
| 5 | | | | | Yes / No | Yes / No |

**This should come out clean.** If it does not, stop here: you have learned
something more useful than anything else in the lesson, and the next step is to
find out what your platform is actually plotting before you make another
decision with it.

## 2. Find out how your delta is made

Open your data provider's documentation and search it for *aggressor*,
*initiator*, *side* or *tick rule*. There are two possible answers.

| Question | Your answer |
| --- | --- |
| Does the venue publish which side initiated? | Yes / No |
| Or is your software inferring it from the quote? | Yes / No |
| Provider and document you found this in | |
| Date checked | |

Everything you subsequently conclude from a delta inherits this answer.

## 3. Get the base rate the reading needs

Take **forty consecutive bars** — consecutive, not selected — and sort each into
one of four boxes by two questions: did it close up or down, and was the net
delta positive or negative.

| | Delta positive | Delta negative | Row total |
| --- | --- | --- | --- |
| **Closed up** | (agreement) | (disagreement) | |
| **Closed down** | (disagreement) | (agreement) | |
| **Column total** | | | 40 |

| What you are measuring | Your number | The lesson's own bars |
| --- | --- | --- |
| Bars in the two disagreement boxes | | |
| That as a share of forty | | |
| Of the disagreement bars, how many were followed by a higher close | | |

The share in the disagreement boxes is **how often the situation this lesson is
about even arises**. If it is small, the reading is rare rather than wrong, and
the sample you would need to test it is correspondingly larger.

---

## What you are holding when this is filled in

Three numbers: whether your footprint reconciles, whether your delta is published or inferred, and how often price and delta actually disagree on your instrument. The third is the base rate every absorption reading is a conditional probability on top of.

*Signal Pilot Labs, Inc. — /education/curriculum/intermediate/28-absorption-and-exhaustion.html*
