# -*- coding: utf-8 -*-
"""A quiz option must keep the letter it was answered with.

The lesson JSON is a flat dict keyed by the English string, but the file that
produces it is an ordered list. Transpose two lines in that list and every
other check still passes -- the words are all correct, the numbers are all
present, the persona is right -- while option A now carries B's text and the
quiz marks the wrong answer correct.

Anything with a leading label the reader navigates by ("A)", "1.", "Step 3:")
has to survive translation as that same label, so compare them.
"""
import re, sys, ctx

LATIN = r'([A-H])[\)\.:]'
ARABIC = 'أبجده'
# The numeric branch needs (?!\d): "4.95% of $195,000" is a decimal, not step
# 4, and locales that move the percentage to the end would otherwise read as a
# renumbered step.
LEAD = re.compile(rf'^\s*(?:{LATIN}|([{ARABIC}])[\)）]|(\d+)[\.\)](?!\d))')


def label(s):
    m = LEAD.match(s)
    if not m:
        return None
    lat, ar, num = m.groups()
    if num:
        return ('n', num)
    if lat:
        return ('a', 'ABCDEFGH'.index(lat))
    return ('a', ARABIC.index(ar))


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        for k, v in ps:
            want = label(k)
            if want is None:
                continue
            got = label(v.replace('）', ')'))
            # A locale may drop the letter entirely (it reads fine without
            # one); only a letter that CHANGED means the options were
            # transposed.
            if got is not None and got != want:
                report(f'  {lang}: {k[:70]!r}\n        ->  {v[:70]!r}')
                bad += 1
    return bad


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
