# Indicator Context Matrix

*Signal Pilot Education — companion to Lesson 36: Markets Have Modes, Lesson 51:
Oscillators Under Regime, and Lesson 39: Trading More Than One.*

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results.

---

## What this matrix is, and what it is not

It is a record of which tools you find readable in which conditions. It is not a
set of rules that fire, and no cell in it says buy or sell. Every entry is a
judgement you should replace with your own once you have watched enough of your
own instrument.

Two findings from the curriculum decide how much weight the whole exercise can
carry, so they come first.

## Finding 1: the regime is a measurement with a setting in it

Lesson 36 uses one ratio — how much of the distance price travelled ended up as
progress. On sixty closes it separates the sideways stretch from the rally
cleanly.

Then it changes the window from ten closes to thirty, and **the two readings
disagree on 22 of 30 bars.** The regime is not a fact you read off the chart; it
is the output of a measurement with a lookback in it, and the lookback is yours.

So: **write down the window you use, and keep it fixed.** A matrix indexed by
regime is only as stable as the regime measurement behind it.

## Finding 2: a fixed oscillator level is not an instruction

Lesson 51 runs two standard implementations of the same fourteen-bar oscillator
over the same sixty closes. **One prints thirteen readings above 70; the other
prints none.**

A reading of 70 asks for an average gain seven thirds of the average loss, which
at equal move sizes is seven up bars in ten. And what follows those thirteen
readings is **58 per cent against a base rate of 58** — the regime accounts for
all of it.

That is why no row below says "70 equals sell". What a level tells you depends
on the implementation, and what follows it is the base rate.

## Identifying the regime

Answer these before reading any indicator, and record the answers.

1. Trending or ranging, by your ratio at your window?
2. If trending, which way?
3. How wide are the bars, against their own recent average?

| Regime | What it looks like | How you decided |
|---|---|---|
| Trending up | Higher highs and higher lows | Your ratio, above your threshold |
| Trending down | Lower highs and lower lows | Your ratio, above your threshold |
| Ranging | Sideways within boundaries | Your ratio, below your threshold |
| Volatile | Wide bars, failed breakouts | Bar range against its own average |

## The matrix

Legend: ✅ readable, ⚠️ readable with care, ❌ hard to read.

| Indicator | Trending up | Trending down | Ranging | Volatile |
|---|---|---|---|---|
| Pentarch | ✅ TD and IGN | ✅ WRN, CAP, BDN | ⚠️ Noisier | ⚠️ More signals to discard |
| Janus Atlas | ✅ Pools below | ✅ Pools above | ✅ Range edges | ⚠️ Repeat sweeps |
| Plutus Flow | ✅ With the trend | ✅ With the trend | ⚠️ Mixed | ❌ Hard to read |
| Volume Oracle | ✅ Value area | ✅ Value area | ✅ Range edges | ⚠️ Bins move the answer |
| Harmonic Oscillator | ⚠️ Sits high for long stretches | ⚠️ Sits low for long stretches | ⚠️ Reverts more often | ❌ Frequent changes |
| Augury Grid | ✅ Multi-asset | ✅ Multi-asset | ⚠️ Many triggers | ⚠️ Filter harder |

The oscillator row is the one to read carefully. An oscillator sitting high
through a trend is the tool behaving exactly as designed. It is not a signal that
the trend is ending, and lesson 51 shows what follows those readings is the base
rate.

## Adding a second opinion

The instinct when one indicator is hard to read is to add another. Lesson 39
prices that directly.

**Three widths of the same tape agree on 9 bars in 40**, which is less often than
three unrelated coins with the same bias would. Requiring all three to agree cuts
**18 candidate longs to 7.**

And lesson 52 counts what a screen of indicators is really worth: three
indicators at four lookbacks is twelve configurations, their vote series
**correlate at 0.5455 on average, which is 1.71 independent opinions** rather
than twelve. Change the family and keep the lookback and they agree **91 per cent
of the time** — the disagreement is about the lookback, not the indicator.

A filter has two break-even points, not one. It raises your expectancy the moment
it removes a higher share of losers than winners, and it raises your money only
once it clears your profit factor.

## Your own matrix

Replace every cell above with your own reading, on your own instrument, at your
own window. Record it here as you go.

| Indicator | Regime | Readable? | What made it hard | Bars observed |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

Lesson 19 is the caution to carry into that table: fifty trades cannot tell a
method making 0.35R a trade apart from one with no edge at all. A cell filled in
after a dozen bars is a first impression, not a measurement.

## The line to keep

The regime is a measurement with a window in it, and changing the window from ten
closes to thirty disagrees on 22 of 30 bars. Every row of this matrix sits on
top of that choice.
