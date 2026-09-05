# -*- coding: utf-8 -*-
"""Build education/paths.html: a way into the course by subject.

The four tier pages enter the curriculum by difficulty and the eleven modules
enter it by order. Neither lets a reader who came for one subject find it,
because the subjects cut across both: risk is taught in modules 3, 8 and 9, and
the evidence lessons are spread over modules 3, 8 and 11.

A path is a reading order through lessons that already exist. It is routing,
not a second copy of the course, so a lesson can sit on more than one path and
no lesson is duplicated to make one work.

    python3 scripts/curriculum/paths.py           rebuild the page
    python3 scripts/curriculum/paths.py --check   exit with the finding count

Every title, link and number on the page is read from the catalogue, so a
retitled lesson cannot leave a path naming something that no longer exists.
"""
import os, re, sys, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
PAGE = 'education/paths.html'
DATA = 'education/curriculum/paths.json'
CAT = 'education/curriculum/index.json'
OPEN = '<!-- PATHS:BEGIN -->'
CLOSE = '<!-- PATHS:END -->'
WORDS = {1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
         8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Eleven', 12: 'Twelve'}


def catalogue():
    return {r['order']: r for r in json.load(open(CAT, encoding='utf-8'))}


def paths():
    return json.load(open(DATA, encoding='utf-8'))


def findings(P, cat):
    out = []
    seen = set()
    for p in P:
        if p['slug'] in seen:
            out.append('two paths share the slug %r' % p['slug'])
        seen.add(p['slug'])
        if len(p['lessons']) < 5:
            out.append('%r has only %d lessons' % (p['slug'], len(p['lessons'])))
        for n in p['lessons']:
            if n not in cat:
                out.append('%r names lesson %d, which does not exist' % (p['slug'], n))
    return out


def render(P, cat):
    out = [OPEN]
    reached = sorted({n for p in P for n in p['lessons']})
    # Spelled, because the sentence opens on it and a page that begins '9 routes'
    # reads like a machine wrote it, which one did.
    out.append('      <p class="text-muted" style="margin-bottom:2.5rem">%s routes through the '
               'course, reaching %d of its %d lessons. A path is a reading order, not a separate '
               'course: every lesson on one is a lesson in the curriculum, and the four tier pages '
               'remain the complete listing.</p>'
               % (WORDS.get(len(P), str(len(P))), len(reached), len(cat)))
    for p in P:
        rows = []
        for n in p['lessons']:
            a = cat[n]
            rows.append('            <li><a href="%s">%s</a> <span class="text-muted" '
                        'style="font-size:.85rem">Lesson %d</span></li>'
                        % (a['href'], html.escape(a['title'], quote=False), n))
        out.append('      <div class="card" style="margin-bottom:2rem" id="%s">' % p['slug'])
        out.append('        <h3 class="headline md" style="margin:0 0 .5rem 0">%s</h3>'
                   % html.escape(p['title'], quote=False))
        out.append('        <p class="text-muted" style="margin:0 0 .75rem 0">%s</p>'
                   % html.escape(p['blurb'], quote=False))
        out.append('        <p style="margin:0 0 1rem 0;padding-left:1rem;'
                   'border-left:3px solid var(--accent)">%s</p>'
                   % html.escape(p['finding'], quote=False))
        out.append('        <div class="text-muted" style="font-size:.85rem;margin-bottom:.5rem">'
                   '%d lessons</div>' % len(p['lessons']))
        out.append('        <ol style="margin:0;padding-left:1.25rem;line-height:1.9">')
        out.extend(rows)
        out.append('        </ol>')
        out.append('      </div>')
    out.append('      ' + CLOSE)
    return '\n'.join(out)


def main(argv):
    check = '--check' in argv
    P, cat = paths(), catalogue()
    bad = findings(P, cat)
    page = open(PAGE, encoding='utf-8').read()
    i = page.index(OPEN)
    j = page.index(CLOSE) + len(CLOSE)
    want = render(P, cat)
    if page[i:j] != want:
        if check:
            bad.append('%s does not match %s; run paths.py' % (PAGE, DATA))
        else:
            open(PAGE, 'w', encoding='utf-8').write(page[:i] + want + page[j:])
    for f in bad:
        print(f)
    reached = len({n for p in P for n in p['lessons']})
    print()
    print('%d paths, %d of %d lessons reached, %d findings'
          % (len(P), reached, len(cat), len(bad)))
    return len(bad) if check else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
