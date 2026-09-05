# -*- coding: utf-8 -*-
"""Build education/glossary.html from education/curriculum/glossary.json.

The glossary page was typed, and a typed page that names eighty-five lessons
drifts the moment a lesson is retitled. Everything on it that is a fact about
the corpus is now read from the corpus: the link to a lesson, the lesson's
number and the lesson's title all come from the catalogue, so the only thing
the data file holds is the term and its definition.

    python3 scripts/curriculum/terms.py           rewrite the entry region
    python3 scripts/curriculum/terms.py --check   exit with the finding count

Findings are of three kinds: an entry naming a slot no lesson occupies, a
lesson no entry names, and a rendered page that disagrees with the data. The
second is the one that matters -- the page opens by promising a definition for
every term the lessons use, and a lesson nothing points at is that promise
going unkept in silence.

The page is English only; no locale tree carries a glossary.
"""
import os, re, sys, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
PAGE = 'education/glossary.html'
DATA = 'education/curriculum/glossary.json'
CAT = 'education/curriculum/index.json'

# The letter bands the page divides itself into. A band prints a rule only if
# some letter inside it has an entry, so an empty band leaves no gap.
BANDS = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ']
OPEN = '<div class="section-break"><span>A - E</span></div>'
CLOSE = '<div class="section-break"><span>Additional Resources</span></div>'
DT = '        <dt style="font-weight:700;margin-top:1.5rem"><strong>%s</strong></dt>'
DD = '        <dd style="margin-left:1.5rem;color:var(--muted)">%s <em>See: %s</em></dd>'


def sortkey(term):
    """Alphabetical on the term's head, ignoring the expansion in brackets, so
    VAL sorts before Value at Risk rather than after it."""
    return re.sub(r'[^a-z0-9]', '', re.sub(r'\s*\([^)]*\)', '', term).lower())


def catalogue():
    return {r['order']: r for r in json.load(open(CAT, encoding='utf-8'))}


def entries():
    return json.load(open(DATA, encoding='utf-8'))


def render(data, cat):
    rows = sorted(data, key=lambda e: sortkey(e['term']))
    by_letter = {}
    for e in rows:
        by_letter.setdefault(sortkey(e['term'])[0].upper(), []).append(e)
    out = []
    first = True
    for letters in BANDS:
        live = [c for c in letters if c in by_letter]
        if not live:
            continue
        # The band is labelled from the first letter that has an entry, which
        # is why the last band reads V - Z rather than U - Z.
        label = '%s - %s' % (live[0], letters[-1])
        out.append(('' if first else '      ')
                   + '<div class="section-break"><span>%s</span></div>' % label)
        out.append('')
        first = False
        for c in live:
            out.append('      <h2 id="%s">%s</h2>' % (c.lower(), c))
            out.append('')
            out.append('      <dl style="margin:1rem 0">')
            blocks = []
            for e in by_letter[c]:
                see = ', '.join(
                    '<a href="%s">Lesson %d: %s</a>' % (cat[n]['href'], n, cat[n]['title'])
                    for n in e['lessons'])
                blocks.append(DT % e['term'] + '\n' + DD % (e['definition'], see))
            out.append('\n\n'.join(blocks))
            out.append('      </dl>')
            out.append('')
    return '\n'.join(out).rstrip('\n') + '\n\n      '


def region(page):
    i = page.index(OPEN)
    j = page.index(CLOSE)
    return i, j


def findings(data, cat):
    out = []
    slots = set(cat)
    named = set()
    seen = {}
    for e in data:
        k = sortkey(e['term'])
        if k in seen:
            out.append('two entries sort the same: %r and %r' % (seen[k], e['term']))
        seen[k] = e['term']
        if not e['lessons']:
            out.append('%r names no lesson' % e['term'])
        for n in e['lessons']:
            if n not in slots:
                out.append('%r names lesson %d, which no file occupies' % (e['term'], n))
            else:
                named.add(n)
    for n in sorted(slots - named):
        out.append('lesson %d (%s) is named by no entry' % (n, cat[n]['title']))
    return out


def main(argv):
    check = '--check' in argv
    data, cat = entries(), catalogue()
    page = open(PAGE, encoding='utf-8').read()
    i, j = region(page)
    built = render(data, cat)
    bad = findings(data, cat)
    if check and page[i:j] != built:
        bad.append('%s does not match %s; run terms.py' % (PAGE, DATA))
    for f in bad:
        print(f)
    print()
    print('%d entries, %d of %d lessons named, %d findings'
          % (len(data), len(set(n for e in data for n in e['lessons'])), len(cat), len(bad)))
    if check:
        return len(bad)
    if page[i:j] != built:
        open(PAGE, 'w', encoding='utf-8').write(page[:i] + built + page[j:])
        print('%s rewritten' % PAGE)
    else:
        print('%s already current' % PAGE)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
