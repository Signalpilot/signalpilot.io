# -*- coding: utf-8 -*-
"""Write the search page's popular topics from the catalogue.

The eight chips on education/search.html were typed, and five of them matched
nothing: Order Flow, Risk Management, Psychology, Institutional and Algorithmic
are vocabulary from the pre-rebuild course. A reader pressing one got an empty
box, which is the worst possible answer because it reads as a broken page
rather than as an empty category.

    python3 scripts/curriculum/topics.py           rewrite the chips
    python3 scripts/curriculum/topics.py --check   exit with the dead count

A chip earns its place by returning lessons under the same match the search box
uses, so a chip that returns nothing cannot ship.
"""
import os, re, sys, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
PAGE = 'education/search.html'
CAT = 'education/curriculum/index.json'
OPEN = '<div style="display:flex;gap:.75rem;flex-wrap:wrap">'

# Query, and the label a reader sees. Order is by how much of the course each
# one reaches, widest first, so the chips read as a map of the curriculum.
TOPICS = [('cost', 'Cost'), ('risk', 'Risk'), ('stop', 'Stops'), ('edge', 'Edge'),
          ('auction', 'The Auction'), ('spread', 'The Spread'),
          ('correlation', 'Correlation'), ('volume', 'Volume'),
          ('indicator', 'Indicators'), ('portfolio', 'Portfolio')]
MIN = 2   # a chip has to reach at least this many lessons


def matches(q, cat):
    """The same match education/assets/edu-enhanced.js performs."""
    q = q.lower()
    return [a for a in cat
            if q in a['title'].lower() or q in a['description'].lower()
            or q in a['category'].lower()]


def render(cat):
    rows = []
    for q, label in TOPICS:
        if len(matches(q, cat)) >= MIN:
            rows.append('          <button class="btn btn-ghost btn-sm topic-btn" '
                        'data-query="%s">%s</button>' % (html.escape(q, quote=True),
                                                         html.escape(label, quote=False)))
    return OPEN + '\n' + '\n'.join(rows) + '\n        </div>'


def main(argv):
    check = '--check' in argv
    cat = json.load(open(CAT, encoding='utf-8'))
    page = open(PAGE, encoding='utf-8').read()
    i = page.index(OPEN)
    j = page.index('</div>', i) + len('</div>')
    dead = []
    for m in re.finditer(r'data-query="([^"]+)"', page[i:j]):
        q = m.group(1)
        n = len(matches(q, cat))
        if n < MIN:
            dead.append((q, n))
    want = render(cat)
    for q, n in dead:
        print('chip %r returns %d lessons' % (q, n))
    if check:
        if page[i:j] != want:
            print('%s does not match the catalogue; run topics.py' % PAGE)
            dead.append(('page', 0))
        print()
        print('%d dead chips' % len(dead))
        return len(dead)
    if page[i:j] != want:
        open(PAGE, 'w', encoding='utf-8').write(page[:i] + want + page[j:])
        print('%s rewritten' % PAGE)
    kept = [q for q, _ in TOPICS if len(matches(q, cat)) >= MIN]
    print()
    print('%d chips, each reaching at least %d lessons' % (len(kept), MIN))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
