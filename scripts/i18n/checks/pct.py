# -*- coding: utf-8 -*-
"""A sentence sets the percent sign the way the table beside it does.

numfmt.py has always declared, per locale, whether the percent sign takes a
space, binds to the number, or leads it, and the builder applies that to the
numeric-only table cells. Nothing applied it to the prose, so a lesson could
print "66,7 %" in a cell and "66,7%" in the paragraph reading that cell out
loud -- and across the corpus German, Spanish, French and Italian were close
to an even split between the two, which is not a convention, it is noise.

The one shape this does not flag is the bound suffix -- "20%ige", "1%-a",
"2%-й", "2%-stops" -- where the sign belongs to the number in the locale's
own grammar even where the locale otherwise takes a space.
"""
import sys, ctx
sys.path.insert(0, ctx.I18N)
import numfmt


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        for k, v in ps:
            if '%' not in v and '％' not in v:
                continue
            # An escaped code sample is not prose. The tools page ships an
            # iframe snippet for anyone who wants to embed the calculators,
            # and width="100%" is markup: putting the locale's space in front
            # of the sign there breaks the embed for the reader who copies it.
            if '&lt;' in v and '&gt;' in v:
                continue
            want = numfmt.set_percent(v, lang)
            if want != v:
                i = 0
                while i < min(len(v), len(want)) and v[i] == want[i]:
                    i += 1
                a, b = max(0, i - 45), i + 25
                report(f'  {lang}: {v[a:b]!r}\n        ->  {want[a:b + 1]!r}')
                bad += 1
    return bad
