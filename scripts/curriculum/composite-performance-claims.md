# Composite performance records: the rule, and what was done

Sixty-two of the 82 lessons quote a win rate. Thirty-two of them carried an
invented trader's record as evidence that the method works — a "📈 Marcus's
9-Month Transformation" box with a win rate and a profit figure, or a sentence
of the form "WR 18% → 71%". The brand's own compliance guide already rules this
out ("Never Guarantee Returns"; avoid "this user made $X" framing), and a reader
cannot check any of it.

## The rule

> A composite trader may illustrate a mistake, and may illustrate what changed.
> A composite trader may not carry a quantified **after-record** — a win rate, a
> profit figure, or a before→after arc — because that is a claim about what the
> method earns, and no reader can test it.

Two things follow from the wording, and both matter:

**Disaster records stay.** "47 trades, 34% win rate, -$8,200" illustrates a
mistake. It is the concrete detail that makes a cautionary story land, and it
claims nothing about what the reader will earn.

**Numbers that teach stay.** A rate quoted next to the count that produced it
("67.3% (105W / 51L)") is checkable arithmetic. A rate that is an input to a
calculation the reader must follow (lesson 47's Kelly example, 58.3% WR) is a
worked example. A controlled comparison where both sides are identical by
construction (lesson 69's order types, lesson 55's filtered-vs-unfiltered) is
the experiment being described. None of these is an efficacy claim.

## What was removed

* **9 transformation boxes** — lessons 01, 06, 13, 23, 45, 50, 51, 63, 71. Every
  one was preceded by a "Rebuild" section stating the new rules and followed by
  a mechanism callout, so removing the box cost no pedagogy.
* **~20 arc sentences** — lessons 03, 14, 17, 18, 22, 27, 28 (×2), 31, 33, 35
  (×8), 37, 38. In each case the sentence beside the number already stated the
  mechanism, so the number went and "Now I check COT first" stayed.
* **Lesson 35's Q2**, which asked "what were Rachel's RESULTS after" — an item
  whose correct answer could only be an invented record. Recast to ask what
  changed.
* **Lesson 59's efficacy sequence** — a "45% MORE profit / doubled his Sharpe"
  callout and a table walking a composite account from $120,000 to $189,600 at
  +58% for the year.
* **Lesson 54's V2 record**, replaced by the staged size ramp it was burying.

## What was kept, and why

| lesson | the number | why it stays |
|---|---|---|
| 32, 54, 55 | backtest vs live win rate | the gap **is** the lesson; the shape is the teaching |
| 34 | 57.1% (141W / 106L), the Friday slice | journal analysis, counts given |
| 47 | 58.3% WR | an input to the Kelly formula being worked |
| 49, 82 | 75% → 27%, 55% → 38% | declines: regime change and edge decay |
| 55, 69 | filtered vs unfiltered, two order types | controlled comparisons, identical by construction |
| 66 | 68% → 65% out-of-sample | the robustness check the lesson teaches |
| 75, 76, 77 | caveated arcs | each already names the sample-size problem in the text beside it |

## Verifying

`scripts/curriculum/quality.py` does not check this — it is a judgement, not a
pattern. The scan that produced the inventory is a structural one: look for a
`story-summary` block containing 📈, and for `win rate … N% → M%`. After this
pass the first returns nothing and the second returns only the nine rows in the
table above.
