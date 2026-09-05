# -*- coding: utf-8 -*-
"""Write the four tier pages' summary line from the catalogue.

Each tier page opens its "What You'll Learn" card with the range of lessons it
covers and roughly how many words that is. All four were typed and all four had
drifted apart: beginner carried no line at all, professional carried a range and
no word count, intermediate claimed 84,000 words against 85,237, and advanced
claimed 77,000 against 48,778 -- a figure from a tier that no longer exists in
that shape.

    python3 scripts/curriculum/tiers.py           rewrite the four lines
    python3 scripts/curriculum/tiers.py --check   exit with the drift count

The duration that follows the word count is an estimate rather than a fact
about the corpus, so whatever a page already says there is kept.
"""
import os, re, sys, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
CAT = 'education/curriculum/index.json'
TIERS = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'),
         ('advanced', 'Advanced'), ('professional', 'Professional')]
HEAD = re.compile(r'(<h2 class="headline md">What You(?:&rsquo;|\')ll Learn</h2>)')
LINE = re.compile(r'<p style="margin-bottom: 1\.5rem;"><strong>Lessons [^<]*</strong>([^<]*)</p>')


def facts():
    rows = json.load(open(CAT, encoding='utf-8'))
    by = collections.defaultdict(list)
    for r in rows:
        by[r['level']].append(r)
    out = {}
    for level, rs in by.items():
        rs.sort(key=lambda r: r['order'])
        words = sum(r['wordCount'] for r in rs)
        out[level] = (rs[0]['order'], rs[-1]['order'], round(words / 1000))
    return out


def line(lo, hi, kwords, tail):
    return ('<p style="margin-bottom: 1.5rem;"><strong>Lessons %d&ndash;%d</strong>'
            ' &bull; ~%d,000 words%s</p>' % (lo, hi, kwords, tail))


def main(argv):
    check = '--check' in argv
    F = facts()
    drift = []
    for page, level in TIERS:
        path = 'education/%s.html' % page
        s = open(path, encoding='utf-8').read()
        lo, hi, kw = F[level]
        m = LINE.search(s)
        tail = m.group(1) if m else ''
        # A duration already on the page is an estimate, not a corpus fact.
        tail = re.sub(r'^\s*(?:&bull;|•)?\s*~?[\d,]+,000 words\s*', ' ', tail)
        if not tail.strip():
            tail = ''
        want = line(lo, hi, kw, tail)
        if m:
            if m.group(0) == want:
                continue
            new = s[:m.start()] + want + s[m.end():]
        else:
            h = HEAD.search(s)
            if not h:
                print('%s: no "What You\'ll Learn" heading' % path)
                continue
            new = s[:h.end()] + '\n          ' + want + s[h.end():]
        drift.append((page, m.group(0) if m else '(no line)', want))
        if not check:
            open(path, 'w', encoding='utf-8').write(new)
    for page, was, now in drift:
        print('%s' % page)
        print('   was: %s' % was)
        print('   now: %s' % now)
    print()
    print('%d of %d tier pages %s' % (len(drift), len(TIERS),
                                      'drifted' if check else 'rewritten'))
    return len(drift) if check else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
