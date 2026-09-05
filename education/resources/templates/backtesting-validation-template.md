# Backtesting Validation Template

*Signal Pilot Education — companion to Lesson 63: Backtesting as Evidence.*

A backtest is a hypothesis about a set of rules. This template is for
attacking that hypothesis before you trust it.

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results. A backtest
> describes the past of one dataset and is not a forecast.

---

## 1. Describe the test

| Field | Entry |
| --- | --- |
| Rules, written so someone else could follow them | |
| Symbol(s) | |
| Timeframe | |
| In-sample period | |
| Out-of-sample period (untouched during design) | |
| Number of trades, in-sample | |
| Number of trades, out-of-sample | |
| Costs modelled (spread, commission, slippage) | |

If the rules cannot be written down precisely enough for someone else to
reproduce them, there is nothing to validate yet.

## 2. Red flag detector

Score each honestly. Every "yes" is a reason to distrust the result.

| # | Red flag | Yes / No |
| --- | --- | --- |
| 1 | Fewer than 30 trades in the sample | |
| 2 | The rules were adjusted after seeing the results | |
| 3 | More than three tunable parameters | |
| 4 | A small parameter change collapses the outcome | |
| 5 | Results come from one market regime only | |
| 6 | No transaction costs or slippage modelled | |
| 7 | Entries assume fills at prices that may not have been available | |
| 8 | Any rule uses information not available at that bar's close | |
| 9 | Losing periods were excluded as "unusual" | |
| 10 | The equity curve depends on one or two outsized results | |
| 11 | No out-of-sample period was held back | |
| 12 | The out-of-sample period was re-used after a failed attempt | |

**Flag 8 is the fatal one.** Lookahead makes every other number meaningless.
Confirm that each rule could have been evaluated at the close of the bar it
acts on, and that any indicator involved does not revise past values.

## 3. Scorecard

| Metric | In-sample | Out-of-sample | Gap |
| --- | --- | --- | --- |
| Trades | | | |
| Win rate | | | |
| Average winner | | | |
| Average loser | | | |
| Payoff ratio | | | |
| Expectancy per trade | | | |
| Average R | | | |
| Largest drawdown | | | |
| Longest losing streak | | | |
| Result excluding the best 3 trades | | | |

The **gap** column is the point of the exercise. A result that survives
out-of-sample with a small gap is worth more than a better in-sample number
with a large one. The final row is a blunt but effective concentration check.

## 4. Out-of-sample framework

1. Split the data before designing anything. Roughly 70% in-sample, 30% held
   back.
2. Build and tune only on the in-sample portion.
3. Run the held-back portion **once**.
4. If it fails, the honest options are to abandon the rules or to gather new
   data. Re-tuning and re-running the same held-back data destroys it as a
   test — it becomes in-sample the moment you learn from it.
5. Record every attempt below, including abandoned ones. The count of attempts
   is itself information: enough attempts will eventually produce a good
   result by chance alone.

| Attempt | Date | What changed | OOS outcome | Kept? |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## 5. Verdict

| Question | Answer |
| --- | --- |
| Red flags triggered | / 12 |
| Did the result survive out-of-sample? | |
| Does it survive removing the best 3 trades? | |
| Is the sample large enough to mean anything? | |
| What would falsify this? | |
| Decision | Discard / Retest / Forward-test on paper |

The default is **paper first**. A backtest that survives this template has
earned a forward test, not capital.
