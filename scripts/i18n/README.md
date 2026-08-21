# Lesson translation pipeline

Translates `education/curriculum/**` into the site's 11 other locales without
touching markup, scripts or links.

## Why it is built this way

The risk in translating 82 trading lessons is not grammar. It is that a
product name, a cycle-event code or an industry term gets translated, and the
lesson quietly stops matching what prints on the chart — in a language nobody
here can spot-check. So terminology is enforced mechanically rather than
trusted.

## Parts

| File | Role |
| --- | --- |
| `glossary.py` | terms that must survive unchanged, plus phrases that must never appear |
| `extract.py`  | pulls translatable text nodes and human-facing attributes, with stable positional ids; never reads inside `<script>` or `<style>` |
| `inject.py`   | writes the translated page from the English source plus a translation map, and adds `lang`, `dir`, canonical, a 13-entry hreflang cluster and the localised disclaimer |
| `verify.py`   | refuses to publish a page that fails any check |
| `memory/`     | translation memory per locale; repeated chrome is translated once and reused |

## What `verify.py` fails on

- a locked glossary term present in the English source but missing from the translation
- any banned phrase (`risk-free`, `guaranteed profit`, …)
- tag balance worse than the source
- a change in the number of content links
- missing or wrong `lang`, canonical, hreflang count, or disclaimer
- JSON-LD that no longer parses

Round-trip tested: injecting the English text back through the pipeline
produces zero errors, and deliberately damaging a translation is caught.

## Order of work

Locked terms are enforced, not suggested. When a target language genuinely
uses a translated form for something in `TECHNICAL`, remove it from the list
rather than working around the verifier.
