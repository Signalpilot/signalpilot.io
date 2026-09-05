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


YEAR = re.compile(r'^\d{4}$')
DECPART = re.compile(r'[.,]\d{1,6}$')


def measured(tok):
    """Whether a numeral is one of this course's measurements.

    Only these are held across translations. A count under a hundred, and a
    year, are exactly where a locale legitimately writes words instead of
    digits: Spanish renders the 1990s as los a\u00f1os noventa, Arabic renders a
    $1 minimum as one dollar, and holding those to the digit reports a hundred
    findings that are all correct prose. A figure with a decimal part, or a
    count of three digits or more that is not a year, is a measurement, and a
    measurement that drifts is the defect this file is for.
    """
    if DECPART.search(tok):
        return True
    flat = re.sub('[.,\u00a0\u202f ]', '', tok)
    return len(flat) >= 3 and not (YEAR.match(flat) and 1800 <= int(flat) <= 2100)


def forms(tok):
    """The shapes one numeral may legitimately take across locales.

    Separators are removed, so 1.5443, 1,5443 and 1 5443 are one token. A
    decimal part may also lose trailing zeros, because 100.0 and 100 are the
    same figure written to different precision -- but only the decimal part.
    Stripping trailing zeros from the whole token, which an earlier version did,
    made 10 and 1 the same numeral and 90 and 9 the same, which is exactly the
    kind of drift this file exists to catch.
    """
    flat = re.sub('[.,\u00a0\u202f ]', '', tok)
    out = {flat}
    m = re.search('[.,](\\d{1,2})$', tok)
    if m:
        head = re.sub('[.,\u00a0\u202f ]', '', tok[:m.start()])
        out.add(head + m.group(1).rstrip('0'))
        out.add(head)
    # A k or m suffix in the English is written out in every other language,
    # and Japanese groups by the myriad, so 800k, 800 000 and 80\u4e07 are one
    # figure wearing three notations.
    if flat.isdigit():
        n = int(flat)
        for mult in (1000, 1000000):
            out.add(str(n * mult))
            if n % mult == 0:
                out.add(str(n // mult))
        if n % 10000 == 0:
            out.add(str(n // 10000))
        out.add(str(n * 10000))
    return out


JA_MYRIAD = re.compile(
    '(?:(\\d[\\d,]*)\u5104)?(?:(\\d[\\d,]*)\u4e07)?(\\d[\\d,]*)?')


def _ja_myriad(text):
    """Rewrite Japanese myriad groupings as plain integers.

    Japanese groups by ten thousand, so 358 million is written 3\u5104 5,800\u4e07 and
    24,300 is written 2\u4e07 4,300. Read digit by digit those are 3 and 5800 and
    2 and 4300, none of which is the figure, and holding them to the English
    reports every large number in the language as missing.
    """
    def sub(m):
        oku, man, rest = m.group(1), m.group(2), m.group(3)
        if not (oku or man):
            return m.group(0)
        n = 0
        if oku:
            n += int(oku.replace(',', '')) * 100000000
        if man:
            n += int(man.replace(',', '')) * 10000
        if rest:
            n += int(rest.replace(',', ''))
        return str(n)
    return JA_MYRIAD.sub(sub, text)


def numerals(s, lang=None):
    s = ENT.sub(' ', s)
    if lang == 'ja':
        s = _ja_myriad(s)
    out = collections.Counter()
    for m in NUM.finditer(s):
        out[frozenset(forms(m.group(0)))] += 1
    return out


def _match(want, got):
    """A wanted numeral is present if any of its forms is any of a present
    numeral's forms."""
    pool = list(got.elements())
    missing = []
    for w in want.elements():
        for i, g in enumerate(pool):
            if w & g:
                pool.pop(i)
                break
        else:
            missing.append(sorted(w)[0])
    return missing


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
        want = collections.Counter(
            frozenset(forms(m.group(0)))
            for m in NUM.finditer(ENT.sub(' ', en)) if measured(m.group(0)))
        if not want:
            continue
        for L in LOCALES:
            tr = mem[L].get(en)
            if tr is None:
                continue
            got = numerals(tr, L)
            # Only a numeral the English carries and the translation does not
            # is reported. A translation may legitimately carry numerals of its
            # own -- Japanese counts shares as 1株 where English writes "a
            # share" -- and reporting those buries the defect this looks for.
            miss = _match(want, got)
            if miss:
                findings += 1
                print('  %s  %r' % (L, en[:70]))
                print('       missing: %s' % ', '.join(sorted(miss)))
    print('%-46s %s' % (slug, 'clean' if not findings else '%d findings' % findings))
    return findings


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        print(__doc__); raise SystemExit(2)
    raise SystemExit(sum(check(a) for a in args))
