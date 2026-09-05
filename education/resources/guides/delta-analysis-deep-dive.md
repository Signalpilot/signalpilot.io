# Delta, and What It Can Actually Tell You

*Signal Pilot Education — companion to Lesson 8: Volume and Delta, Lesson 7:
Time and Sales, and Lesson 28: Absorption and Exhaustion.*

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results.

---

## Start with what a trade is

Every trade has a buyer and a seller. Volume counts contracts, and every one of
them was both bought and sold. So delta is not "how many bought minus how many
sold", because that number is always zero.

**Delta counts who was unwilling to wait.** It is volume that crossed the spread
to buy, less volume that crossed to sell. That is a real and useful quantity,
and it is a different quantity from the one the folklore describes.

## The part that is inferred

For most instruments the side is not reported. It is inferred, usually by
comparing the print to the quote at the time.

Lesson 7 measures the inference: it is **right about four times in five**, and
one misclassified print of 900 shares swings a minute's delta **from plus 600 to
minus 1,200.** A single wrong classification can flip the sign of the number you
are reading.

## What a reported delta actually bounds

This is the arithmetic worth memorising. Lesson 8 takes a bar reported at **plus
15 per cent delta** and asks what share of the volume was genuinely
buyer-initiated.

**The answer is a range, not a number: between 50.0 and 62.5 per cent.**

A bar reported at plus 15 per cent is consistent with a market that was almost
perfectly balanced. Any table that converts a delta into an exact count of shares bought and shares
sold is reporting a point estimate for a quantity that only supports an interval.

| What you see | What it supports |
|---|---|
| Delta +15% | A buy share somewhere between 50.0% and 62.5% |
| A large positive delta | More impatience on the bid side, before inference error |
| Delta near zero | Nothing about balance; the inference noise is this size |

## Two bars, identical in every recorded quantity

Lesson 28 prints the case that settles how much a delta reading can carry. Two
bars share **every quantity a candle records, and the volume traded at every
individual price.** Their deltas are **plus 2,820 and minus 1,680.**

Two schools read those as opposite trades. Nothing else on the chart
distinguishes them. That is not a reason to discard delta; it is the reason to
treat a delta reading as a classification with an error rate rather than as an
observation.

## What to do with it

- **Read delta as impatience, not as headcount.** It tells you which side was
  crossing the spread, subject to a one-in-five error rate on the classification.
- **Never convert it into a buy/sell split.** The split is not identified by the
  data; lesson 8 gives the interval instead.
- **Prefer the count that needs no inference.** Lesson 29 separates the two:
  volume at a price is a count and needs nothing inferred, while every summary
  drawn from it does.
- **Check the sign is robust.** If flipping one large print would flip your
  reading, the reading is noise.

## Cumulative delta

Cumulative delta is the running sum, so it inherits the error bar bar by bar. A
cumulative line is a sum of estimates, and the estimates do not cancel: a
systematic bias in the classification accumulates in one direction.

Treat a cumulative line as a shape to compare against price, not as a level.

## The line to keep

Volume counts contracts, and every one of them was bought and sold. Delta counts
who was unwilling to wait, the side is inferred rather than reported, and a bar
reported at plus 15 per cent establishes a buy share only between 50.0 and 62.5
per cent.
