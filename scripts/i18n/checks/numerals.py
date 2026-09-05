# -*- coding: utf-8 -*-
"""Every numeral in an English string must appear in each translation of it.

    python3 scripts/i18n/checks/numerals.py <slug> [<slug> ...]

A translation is prose written by hand, and the one defect a reader of that
prose will not catch is a figure that drifted: 9.84 typed as 9.64, a 253 that
became 235, a 26.7 that lost its decimal. The words around it still read
correctly, so a proofread does not find it. This does.

The comparison is on the multiset of numerals, after normalising each locale's
own separators back to a plain form: German 9,84 and Japanese 9.84 and Russian
217 000 all reduce to the same token as English 9.84 and 217,000. A numeral
present in the English and missing from a translation is reported; so is one
that appears a different number of times, which is how a repeated figure gets
dropped from the second of two sentences.
"""
import os, re, sys, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))))
sys.path.insert(0, os.path.join(ROOT, 'scripts/i18n'))
LOCALES = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']

ENT = re.compile(r'&(?:#\d+|#x[0-9a-fA-F]+|\w+);')
# A digit group with whatever separators a locale puts inside it. A space only
# joins two groups when it is a thousands separator, which is why the space
# alternative demands exactly three digits after it: without that, a German
# sentence ending "9,84 3,94" reads as the single numeral 984394 and every
# figure in it is reported missing.
NUM = re.compile('\\d{1,3}(?:[\\u00a0\\u202f ]\\d{3})+(?:[.,]\\d+)?'
                 '|\\d+(?:[.,]\\d+)*')


def numerals(s):
    s = ENT.sub(' ', s)
    out = collections.Counter()
    for m in NUM.finditer(s):
        t = re.sub('[.,\\u00a0\\u202f ]', '', m.group(0))
        # Trailing zeros after a separator are a locale convention (100.0
        # against 100), not the drift this looks for.
        t = t.rstrip('0') or '0'
        out[t] += 1
    return out


def lesson_path(slug):
    import glob
    hits = glob.glob(os.path.join(ROOT, 'education/curriculum/*/%s.html' % slug))
    if not hits:
        raise SystemExit('no lesson matching %s' % slug)
    return hits[0]


def check(slug):
    from extract import extract
    _, segs = extract(lesson_path(slug))
    seen, order = set(), []
    for s in segs:
        if s['en'] not in seen:
            seen.add(s['en']); order.append(s['en'])
    mem = {L: json.load(open(os.path.join(ROOT, 'scripts/i18n/memory/%s.json' % L),
                             encoding='utf-8')) for L in LOCALES}
    findings = 0
    for en in order:
        want = numerals(en)
        if not want:
            continue
        for L in LOCALES:
            tr = mem[L].get(en)
            if tr is None:
                continue
            got = numerals(tr)
            # Only a numeral the English carries and the translation does not
            # is reported. A translation may legitimately carry numerals of its
            # own -- Japanese counts shares as 1株 where English writes "a
            # share" -- and reporting those buries the defect this looks for.
            miss = want - got
            if miss:
                findings += 1
                print('  %s  %r' % (L, en[:70]))
                print('       missing: %s' % ', '.join(sorted(miss.elements())))
    print('%-46s %s' % (slug, 'clean' if not findings else '%d findings' % findings))
    return findings


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        print(__doc__); raise SystemExit(2)
    raise SystemExit(sum(check(a) for a in args))
