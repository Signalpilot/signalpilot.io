# -*- coding: utf-8 -*-
"""Page-scoped translations for fragments whose English is ambiguous.

The memory is keyed by English text, site-wide, which is right for whole
sentences and wrong for the short fragments a tag boundary leaves behind. A
bare "The" is the clearest case: it opens "The Signal Pilot Suite is provided
for educational purposes only" in the documentation and "The Commander sees
all." on a social card, and no single German article is correct in both. One
value has to lose, and the reader of the losing page sees the wrong gender.

So a page may claim a fragment for itself. overrides.json maps a page to the
English strings it overrides and their per-locale values; anything not listed
still comes from the memory. Keep it for fragments only -- a whole sentence
that differs between two pages differs in English too, and belongs in the
memory under its own text.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, 'overrides.json')


def load():
    if not os.path.exists(PATH):
        return {}
    with open(PATH, encoding='utf-8') as f:
        return json.load(f)


def apply(page, lang, mem):
    """Return mem with this page's overrides for lang laid over it.

    mem is not mutated: the caller holds one memory per locale and builds many
    pages from it.
    """
    over = load().get(page)
    if not over:
        return mem
    out = dict(mem)
    for en, per_lang in over.items():
        v = per_lang.get(lang)
        if v:
            out[en] = v
    return out
