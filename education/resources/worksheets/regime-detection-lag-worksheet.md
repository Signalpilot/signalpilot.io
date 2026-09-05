# Regime Detection Lag Worksheet

*Signal Pilot Education — companion to Lesson 37: Detecting a Regime Change.*

Finding where a finished series changed and deciding that it has just changed are two different problems, and the one you have is the second. On the lesson’s sixty closes, one bar of confirmation halves the declared changes from eight to four and five bars halves it again to two — and how much of the move you end up inside does not fall as you add confirmation.

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results. Every number in
> this worksheet is one you measure on your own record; the figures in the
> right-hand column are what the lesson measured on its own sixty bars, and they
> are there to be disagreed with rather than copied.

---

## 1. Run your own detector forwards and count the changes

On **sixty closes** of your own instrument, compute lesson 36's ratio at a window
and threshold you pick, then walk forward bar by bar and write down every bar at
which the label flips, with no confirmation at all.

| | Your number | Lesson 37's closes |
| --- | --- | --- |
| Window used | | |
| Threshold used | | |
| Label flips with no confirmation | | 8 |
| **60 ÷ flips** = bars each label survives | | 7.5 |

If that last number is under about ten, no strategy of yours will ever collect a
sample under either label. That is the finding, and it arrives before any
strategy is tested.

## 2. Buy the quiet and price it

Repeat with a confirmation of two bars, then five.

| Confirmation | Changes declared | Bars until the first change was declared | Bars of the biggest move you were on the right side of |
| --- | --- | --- | --- |
| None | | | |
| 2 bars | | | |
| 5 bars | | | |

On lesson 37's own sixty closes the confirmations run none, one and five rather
than none, two and five:

| | Lesson 37's closes |
| --- | --- |
| Changes declared with no confirmation | 8 |
| With one bar of confirmation | 4 |
| With five bars | 2 |
| Move captured as confirmation rises | 7, 4, 3, 2, then 10 out of 10 |

**Expect the third column to misbehave.** If it falls and then rises, you have
found the same non-monotonicity, and the bar count of your longest mid-move dip
is the reason.

## 3. Score yourself against the chart, then against the tape

Take a chart where the regimes are obvious and mark, from the finished picture,
where each began. Then hide everything to the right of each mark and ask what
your rule would have said standing at that bar.

| Regime | Bar it began, read from the finished chart | Bar your rule declared it | Lag, in bars |
| --- | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |
| | | **Mean lag** | |

That mean lag is the number that belongs in any decision about position size at
a turn. It is not a criticism of the detector; it is the detector's price.

---

## What you are holding when this is filled in

Three numbers: how many bars a label of yours survives on average, what confirmation buys and costs on your own series, and the mean lag between a regime beginning and your rule saying so.

*Signal Pilot Labs, Inc. — /education/curriculum/intermediate/37-detecting-a-regime-change.html*
