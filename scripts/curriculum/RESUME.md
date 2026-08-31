# Start here

The curriculum is being rebuilt as a dependency-ordered academy. This file is
the entry point: nothing about the method lives in anyone's memory, and none of
it needs to.

## Three commands

```
python3 scripts/curriculum/status.py            # the whole board, one screen
python3 scripts/curriculum/status.py --next     # the single next action
python3 scripts/curriculum/status.py 27         # one slot in detail
```

`status.py` reads the state off disk. It never trusts a claim. Every slot
resolves to one of:

| state | meaning |
|---|---|
| `TOWRITE` | new lesson, does not exist yet |
| `PROSE` | exists, not yet in the seven-part academy form |
| `BLOATED` | in form, but breaks the reading contract |
| `UNREAD` | in form, but no second read is recorded in the ledger |
| `ENGLISH` | in form and read, not yet translated (or **stale** after a rebuild) |
| `UNLOGGED` | no ledger row |
| `DONE` | all of the above satisfied |

## The four documents

| file | what it settles |
|---|---|
| `slotmap.tsv` | **the contract.** Every one of the old 86 lessons maps to a destination; validated so none is lost or duplicated |
| `SYLLABUS.md` | what each of the 85 slots must establish, the seven-part form, the reading contract, the fixed notation |
| `ARCHITECTURE.md` | why the course was reordered, with the evidence |
| `academy-ledger.tsv` | what each second read actually found. A slot is not `DONE` without a row here |

## The per-lesson procedure

Do these in order. The gate in `status.py` enforces steps 4 and 6; the rest is
on you, and skipping step 5 is what broke part-numbering across four lessons
the last time round.

1. **`status.py --next`.** It names the slot and, for a rebuild, the source.
2. **Read the source end to end** if there is one:
   `python3 scripts/curriculum/readlesson.py <path>`. It is not a rewrite until
   it has been read. Look for what the new module has already taken over —
   duplication with neighbouring lessons is the commonest finding.
3. **Write it** with `mklesson.build()`. That refuses to write anything that is
   not well-formed HTML, is missing one of the seven parts, or breaks the
   budget. See `/tmp`-free examples in git history (`l04.py` pattern).
4. **Read it again, end to end.** Every single time. This is where the errors
   are: an arithmetic slip, a claim the lesson contradicts three paragraphs
   later, a sentence doing a neighbouring lesson's job.
5. **Verify every number in the lesson** with a throwaway Python check, including
   the answers to the problems. Do not ship arithmetic you have not run.
6. **Write the ledger row**, recording what the read found. A row whose `found`
   column is empty does not count.
7. **Translate into all eleven locales**, one at a time — see below.
8. **Commit and push** to `main` and to the feature branch.

## Translating

```
python3 scripts/curriculum/translate.py keys <slug>     # numbered key list
```

The numbering is the contract: index *n* is the same English string for every
locale, so one list serves all eleven. Then, per locale:

```python
import sys; sys.path.insert(0,'scripts/curriculum')
from translate import put
put('de', {0:"...", 1:"...", ...})
```

`put` refuses to overwrite an existing entry that differs — memory is shared
across all 85 lessons, so a silent overwrite would change other pages. Then:

```
python3 scripts/i18n/build.py curriculum/<tier>/<slug>.html <locale>
python3 scripts/i18n/checks/run.py <slug>
sh /tmp/rb.sh <slug>          # all 11 at once, fails loudly on anything but OK
```

**Translation is written, never generated, and never delegated.**

### Locale conventions

| | register | quotes | decimals | tier word (beginner) | lesson counter |
|---|---|---|---|---|---|
| de | informal *du* | `&bdquo;…&ldquo;` | `1.500` / `50,03` | Anfänger | Lektion N von 85 |
| es | informal *tú* | `«…»` | `1.500` / `50,03` | Principiante | Lección N de 85 |
| fr | *vous* | `«&nbsp;…&nbsp;»` | `1 500` / `50,03` | Débutant | Leçon N sur 85 |
| it | *tu* | `«…»` | `1.500` / `50,03` | Principiante | Lezione N di 85 |
| pt | European *tu* | `«…»` | `1.500` / `50,03` | Iniciante | Aula N de 85 |
| nl | *je* | `&bdquo;…&rdquo;` | `1.500` / `50,03` | Beginner | Les N van 85 |
| ru | informal *ты* | `«…»` | `1 500` / `50,03` | Начальный уровень | Урок N из 85 |
| ja | です/ます | `「…」` | `1,500` / `50.03` | 初級 | レッスンN／85 |
| tr | *sen* | `«…»` | `1.500` / `50,03` | Başlangıç | Ders N / 85 |
| hu | *te* | `&bdquo;…&rdquo;` | `1 500` / `50,03` | Kezdő | N. lecke a 85-ből |
| ar | — | `«…»` | `1,500` / `50.03` | مبتدئ | الدرس N من 85 |

Full tier words, reading-time and module-name patterns: `chrome_i18n.py`.

### Traps that have actually bitten

- **Locked glossary terms must survive literally** (`scripts/i18n/glossary.py`).
  Translating one silently fails the build. Caught so far: `order book`
  rendered "Das Orderbuch" / "libro de órdenes"; `market maker` as
  "маркет-мейкер"; `slippage` as "проскальзывание"; `ETF` as
  "صندوق متداول". Every locale corpus keeps these in Latin — check what the
  corpus already does before inventing a rendering.
- **A string legitimately identical to English** goes in
  `scripts/i18n/checks/reviewed.json`, which exists so that a human has looked
  at each one. Do not weaken the check. Already registered: `spread` (the
  ordinary word in six of these languages), `Bid`, `Ask`, `Sources.` (fr),
  `Beginner #23` (nl).
- **Bibliography stays English.** Wrap author names and work titles in
  `translate="no"` — `extract.py` honours it and skips the subtree, so they
  never enter memory at all.
- **Fragments that split mid-sentence at an inline tag** need word-order care.
  German is verb-final; Hungarian and Turkish put the counter between the two
  numbers; Japanese needs the modifier before the number. Restructure the two
  fragments together rather than translating each in isolation.
- **A formula still needs a memory entry.** Registering it in `reviewed.json`
  only silences the leak check; `build.py` requires *every* string to be in
  memory, so an untranslated formula must be stored mapping to itself. Both
  spellings are needed: the reviewed entry and the memory entry.
- **`build.py` SKIPs a whole locale if any string is untranslated**, leaving the
  previous build in place. A SKIP is invisible on the page, which is why
  `status.py` checks memory rather than file existence.

## After changing lesson files

```
python3 -c "import sys;sys.path.insert(0,'scripts/curriculum');import renumber;renumber.fix_index(renumber.load(),True)"
python3 scripts/curriculum/hubs.py
```

`index.json` is rebuilt from the lesson pages themselves — never from its own
previous contents, which is how titles once attached to the wrong lessons.
`hubs.py` regenerates `education/index.html`; `learning-path.html` and the four
tier pages read `index.json` in the browser and need nothing. `status.py`
reports `hubs: STALE` if they drift.

## The rules that do not bend

- **Teach before you correct.** A debunk needs something to debunk.
- **The claim is the first thing on the page**, in one sentence.
- **Default is delete or move, not reword.**
- **Say it once.** The commonest defect in this corpus is one finding restated
  in a pull quote, a stats table, a "Reality" box, a list and the quiz.
- **One worked example, not a story.** A named trader with a dollar figure costs
  800–1,200 words and establishes nothing that 150 words of arithmetic does not.
- **No hype headers, no emoji in headings, no accordions.**
- **Numbers are checked, never carried over on trust.**
- **When unsure, leave it and log it.**
