# The prose pass, per lesson

The standing method for task #54. Every step runs on every slot. Nothing here
is optional and nothing here is a substitute for anything else here.

## 1. Recompute, do not read

Rebuild every number on the page in Python from the stated inputs. Do not
check the arithmetic by reading it. The defects this finds are the ones no
reader would ever catch:

- lesson 34 claimed an advance "occupied half as many of the fourteen slots";
  ten against seven is not half
- lesson 35's tightest sweep count was one window too wide, and the stale
  figure had spread to the opening claim and the meta description
- lesson 36's ratio could not be reproduced at all, because "twenty closes"
  meant twenty steps and the page never said so

**A figure that a reader cannot reproduce from the page is a defect even when
it is correct.** State the convention.

## 2. The reading contract, in the English

- exactly one of each `data-part`: claim, prereq, development, worked, bounds,
  problems, sources
- no prose percents in digits; table cells and monospace keep the sign
- at most two tables, no callouts, no accordions
- Problems is an `<h3 data-part="problems">`, never a section-break div, and
  the `<ol>` after it carries no duplicate `data-part`
- **no inline `<strong>`/`<em>` in body paragraphs.** Allowed: the
  `<strong>Prerequisites:</strong>` and `<strong>Sources.</strong>` labels,
  and bold lead-ins on `<li>` items only. Lessons 37 to 40 still bold their
  bounds lead-ins; strip them as each slot comes up.

## 3. Make it pull

Rigour without pull is a document nobody finishes.

- **Open on the sharpest number**, not the setup.
- **Name the serial.** Lessons 32 to 36 measure one sixty-bar series, each
  adding a column. Continuity like this is invisible unless stated.
- **End the bounds on a live question**, not a shrug. The last line before
  Problems should be the thing the reader now wants to know and cannot yet.
- **Tease the finding, not the topic.** Read the next lesson's claim
  paragraph and promise the surprising result by name.

## 4. Translate, never delegate

Per lesson, immediately after the English is final. Never batched.

```
python3 scripts/curriculum/translate.py keys <slug>      # writes .keys.json
python3 /tmp/m<NN>.py                                    # remerge + edits
python3 scripts/i18n/build.py curriculum/<tier>/<slug>.html
python3 scripts/i18n/checks/run.py <slug>
```

`remerge.merge(rel, nodes, edits)` carries a de-bolded paragraph across from
the built locale page instead of retranslating it. `_nodes` slices at
`data-part="claim"` **inside the open tag**, so node 0 is the prereq; when the
claim itself is a key, patch `_nodes` to slice at the `<p` that owns the
marker. `_one` with `after:<marker>` **discards the marker**.

## 5. Read all eleven locales as prose

Not a check, a reading. This is where the grade was never taken. What it has
found, per lesson, roughly a dozen times over:

- **wrong sense**: "frames the answer" for "bounds the answer" in nine
  locales at once; Dutch "onder de maat" inverting a claim
- **collisions**: one word doing two jobs, so a sentence says "window" twice
  where the English says window and lookback
- **reversed agency**: Hungarian had the price displacing the order blocks
- **added or lost content**: Japanese carried a clause not in the English;
  Spanish and Italian dropped a quantity
- **grammar**: bare adverbial negatives in Spanish, French and Italian
- **register**: formal and informal imperatives inside one lesson

When a defect turns out to be systemic, sweep it corpus-wide in the same
sitting and say so in the ledger.

## 6. Close out

```
python3 scripts/curriculum/touch_sitemap.py <tier>/<slug>
python3 -c "import xml.dom.minidom;xml.dom.minidom.parseString(open('sitemap.xml',encoding='utf-8').read())"
```

Append the ledger row to `scripts/curriculum/academy-ledger.tsv`: six
tab-separated fields, `slot words read2 found commit deferred`. Commit, then
push to **both** `main` and `claude/soro-website-feedback-bemz3i`.

Never mention resubmitting the sitemap.
