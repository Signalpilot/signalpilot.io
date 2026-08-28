# -*- coding: utf-8 -*-
"""Characters that are invisible in the source and in the page.

A soft hyphen typed into a German or Dutch compound survives every other check
-- the words are right, the numbers are right, the tags balance -- and then
splits the word at a random place in some renderers and silently breaks Ctrl-F
everywhere. Zero-width spaces do the same thing to search.

The one legitimate invisible here is the Arabic right-to-left/left-to-right
mark, which forces a Latin handle or a signed number to render the right way
round inside RTL text. Those are allowed in Arabic only.
"""
import sys, ctx

BAD = {'­': 'soft hyphen', '​': 'zero-width space',
       '⁠': 'word joiner', '﻿': 'byte-order mark'}
RTL = {'‎': 'left-to-right mark', '‏': 'right-to-left mark'}


def run(slug, report=print):
    hits = 0
    for lang, ps in ctx.pairs(slug):
        bad = dict(BAD)
        if lang != 'ar':
            bad.update(RTL)
        for k, v in ps:
            for c, name in bad.items():
                if c in v:
                    i = v.find(c)
                    report(f'  {lang}: {name} in {v[max(0, i - 30):i + 20]!r}')
                    hits += 1
    return hits


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
