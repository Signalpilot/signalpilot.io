# Per-lesson quality rubric

The brief, in the client's words: *"a quality audit per lesson — something like
'easy to get', 'easy to follow' … I'm guessing all our lessons need to be S tier
structured and all. Maybe there's redundancies too."* And: *"each lesson needs
its own unique audit."*

So this is a read, not a sweep. `quality.py` supplies signals; the grade comes
from reading the lesson. Every lesson is judged on five things.

## 1. Easy to get

Can a reader state the lesson's central claim after one pass? A lesson is easy
to get when it commits to one idea early and in plain words, and when the title,
the hook and the first teaching section are all pointing at the same thing.

Fails when: the point only becomes clear in the summary; the hook sells a
different lesson than the body delivers; the central term is used for pages
before it is defined.

## 2. Easy to follow

Does it build? Each section should need only what came before it. Definitions
before use, no forward references, no term introduced in an aside and relied on
later.

Fails when: the reader must scroll back; a worked example uses a concept the
lesson has not reached; sections are ordered by topic rather than by dependency.

## 3. Worth the time

Does it teach something the reader could not get from two minutes of searching?
Depth appropriate to the tier — a beginner lesson may be simple without being
thin; a professional lesson may not be a listicle.

Fails when: it is a glossary in prose; the mechanism is asserted but never
explained; the specifics are all illustrative and none are load-bearing.

## 4. Delivers what it promises

The objectives, the title and the body describe the same lesson. Every objective
is met somewhere on the page; nothing major is taught that no objective
mentions.

Fails when: an objective names a topic the lesson never reaches; the title
promises a scope the body does not cover.

## 5. Evidence quality

Numbers, examples and claims that survive being asked where they came from.
Rates carried by samples large enough to support them; sources named where a
source is implied; composites labelled as composites.

Fails when: a rate is quoted off a handful of trades; "studies show" with no
study; a product claim that cannot be checked.

## Grades

| | |
|---|---|
| **S** | Would ship as the reference lesson on this topic. Clear, ordered, deep enough, honest. |
| **A** | Strong. One or two specific improvements, none structural. |
| **B** | Sound but blunted — a real weakness in one of the five, fixable without a rewrite. |
| **C** | Needs work. Fails one dimension badly, or several mildly. |
| **D** | Would mislead or lose the reader. Rewrite the affected part. |

A grade is only useful with a reason, so every judgement records what is strong,
what is weak, and the concrete fix. Judgements live in `quality.json`.
