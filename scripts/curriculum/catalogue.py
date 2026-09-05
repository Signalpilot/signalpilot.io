# -*- coding: utf-8 -*-
"""Make education/curriculum/index.json a fact about the corpus.

Three fields on a catalogue row are not opinions: the title is the lesson's
own h1, the href is where the file sits, and the description is the lesson's
own <meta name="description">. The catalogue was typed, so each of the three
could drift, and the description did: 47 of the 85 rows disagreed with their
lesson, six of them carrying figures the settled grid had already moved.

The description is the expensive one. It renders on the four tier pages and
in search results, which is exactly the place the guidebook warns a stale
figure hides, because nothing on those pages recomputes anything.

    python3 scripts/curriculum/catalogue.py            rewrite the drifted rows
    python3 scripts/curriculum/catalogue.py --check    exit with the drift count

Locale indexes are built from each locale's own lesson files rather than from
this catalogue, so a rewrite here is English-only and needs no locale pass.
"""
import os, re, sys, json, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
CAT = 'education/curriculum/index.json'
FIELDS = ('title', 'href', 'description')


def pages():
    out = {}
    for p in glob.glob('education/curriculum/*/*.html'):
        if '_staging' in p or '_merged' in p:
            continue
        m = re.match(r'(\d+)-', os.path.basename(p))
        if m:
            out[int(m.group(1))] = p
    return out


def truth(path):
    """What the lesson itself says, as the catalogue would store it."""
    s = open(path, encoding='utf-8').read()
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', s)
    if not h1 or not desc:
        raise SystemExit('%s: no h1 or no meta description' % path)
    title = html.unescape(re.sub(r'<[^>]+>', '', h1.group(1))).strip()
    return {'title': title,
            'href': '/' + path,
            'description': html.unescape(desc.group(1)).strip()}


def drift():
    """Every (slot, field, catalogue value, lesson value) that disagrees."""
    cat = json.load(open(CAT, encoding='utf-8'))
    P = pages()
    rows = []
    for r in cat:
        slot = r['order']
        if slot not in P:
            rows.append((slot, 'href', r.get('href', ''), '(no lesson file)'))
            continue
        t = truth(P[slot])
        for f in FIELDS:
            if r.get(f, '').strip() != t[f]:
                rows.append((slot, f, r.get(f, ''), t[f]))
    missing = sorted(set(P) - set(r['order'] for r in cat))
    for slot in missing:
        rows.append((slot, 'row', '(no catalogue row)', P[slot]))
    return cat, P, rows


def main(argv):
    check = '--check' in argv
    cat, P, rows = drift()
    for slot, field, was, now in rows:
        print('slot %-3d %-11s' % (slot, field))
        print('   catalogue: %s' % was)
        print('   lesson   : %s' % now)
    if not rows:
        print('85 rows, no drift' if len(cat) == 85 else '%d rows, no drift' % len(cat))
        return 0
    if check:
        print()
        print('%d fields drifted across %d lessons'
              % (len(rows), len(set(r[0] for r in rows))))
        return len(rows)
    for r in cat:
        if r['order'] in P:
            r.update(truth(P[r['order']]))
    open(CAT, 'w', encoding='utf-8').write(
        json.dumps(cat, indent=2, ensure_ascii=False) + '\n')
    print()
    print('%d fields rewritten across %d lessons'
          % (len(rows), len(set(r[0] for r in rows))))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
