# Position Sizing Calculator Template

*Signal Pilot Education — companion to Lesson 9.*

Work top to bottom. Every line is arithmetic on numbers you supply; nothing
here decides whether to take a trade.

> **Educational only.** Trading involves substantial risk of loss. Not financial
> advice. Past performance does not guarantee future results.

---

## 1. Size for a single trade

| Step | Formula | Your value |
| --- | --- | --- |
| A. Account size | — | |
| B. Risk per trade (%) | your rule, decided in advance | |
| C. Cash at risk | A × B | |
| D. Entry price | — | |
| E. Invalidation price | — | |
| F. Risk per unit | \|D − E\| | |
| G. Position size | C ÷ F | |
| H. Position value | G × D | |
| I. Position as % of account | H ÷ A | |
| J. Invalidation distance (%) | F ÷ D | |

**Reading the output**

- If **I** exceeds 100%, the position needs leverage. That is a financing
  decision, not a sizing one — resolve it before continuing.
- If **J** is very small, the invalidation may sit inside normal noise for the
  symbol, and the size will look flatteringly large. Compare **F** against a
  volatility measure such as ATR before accepting it.
- **C never changes to fit the trade.** If the size looks wrong, the
  invalidation level is what gets re-examined.

## 2. Risk / reward, before entry

| Step | Formula | Your value |
| --- | --- | --- |
| K. Objective level | — | |
| L. Distance to objective | \|K − D\| | |
| M. Reward-to-risk | L ÷ F | |

Record **M** for every trade you take, and for the ones you skip. The
distribution of M across your journal is more informative than any single
value.

## 3. Portfolio heat

Heat is total risk live at once, not the size of any one position.

| Open position | Cash at risk | % of account |
| --- | --- | --- |
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| **Total heat** | | |

| Check | Your rule | Current | OK? |
| --- | --- | --- | --- |
| Maximum total heat | | | |
| Maximum heat in one symbol | | | |
| Maximum heat in one correlated group | | | |

Write the caps down before you need them. A cap you set mid-drawdown is not a
cap.

## 4. Correlation check

Two positions that move together are closer to one position than to two.

| Group | Positions | Combined risk | Treated as |
| --- | --- | --- | --- |
| Crypto majors | | | |
| USD-sensitive | | | |
| Index / equity beta | | | |
| Metals | | | |

Use the correlation matrix workbook to fill this in from your own return
history rather than by assumption. Correlations are unstable, and they tend to
converge toward 1 exactly when diversification is supposed to help.

## 5. Sizing log

| Date | Symbol | Account | Risk % | Cash at risk | Units | Heat after | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

Reconcile this log against your journal monthly. Where the sizes disagree with
the rule, the gap is the finding.
