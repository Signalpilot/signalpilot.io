# -*- coding: utf-8 -*-
"""A locale must not carry a writing system it does not use.

Cyrillic in the German page, kana in the Spanish one: a sign that a string was
pasted from the wrong locale's file. Greek is exempt everywhere because the
lessons write microseconds as us.
"""
import re, sys, ctx

RANGES = {
    'cyrillic': r'[Ѐ-ӿ]',
    'hangul':   r'[가-힯ᄀ-ᇿ]',
    'kana':     r'[぀-ヿ]',
    'cjk':      r'[一-鿿]',
    'arabic':   r'[؀-ۿ]',
}
ALLOWED = {'ru': {'cyrillic'}, 'ja': {'kana', 'cjk'}, 'ar': {'arabic'}}


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        ok = ALLOWED.get(lang, set())
        for name, rng in RANGES.items():
            if name in ok:
                continue
            for k, v in ps:
                m = re.search(rng, v)
                if m:
                    report(f'  {lang}: {name} {m.group()!r} in {v[:70]!r}')
                    bad += 1
    return bad


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
