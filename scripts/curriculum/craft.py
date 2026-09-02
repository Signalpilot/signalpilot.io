# -*- coding: utf-8 -*-
"""Check a lesson against the mechanical half of the guidebook checklist.

The guidebook's step four asks about twenty-five questions of a finished
lesson. Most need a reader. These do not, and anything mechanical that stays
human drifts by about the ninth lesson, so they live here instead.

    python3 scripts/curriculum/craft.py                  # every lesson
    python3 scripts/curriculum/craft.py 01               # one slot
    python3 scripts/curriculum/craft.py 1-9 --verbose    # a range, with detail

Exit code is the number of lessons carrying at least one finding, capped at
125, so it can gate a commit.
"""
import glob, html, io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

PARTS = ['claim', 'prereq', 'development', 'worked', 'bounds', 'problems', 'sources']
WORDS = (1400, 5000)          # the range the rebuilt lessons actually landed in
FIGURE_FREE_RUN = 3           # paragraphs, at most, with nothing checkable in them
BOUNDS_CONCESSIONS = 5
PROBLEMS = 3
TABLES = 2


def text(frag):
    return html.unescape(re.sub(r'<[^>]+>', '', frag)).strip()


def prose(s):
    """The lesson body, from the claim to the related-lessons break."""
    a = s.find('data-part="claim"')
    a = s.rfind('<p', 0, a)
    b = s.find('<div class="section-break">')
    return s[a:b if b > 0 else len(s)]


def paragraphs(body):
    """Body paragraphs in reading order, excluding the prereq and sources labels."""
    out = []
    for m in re.finditer(r'<p\b([^>]*)>(.*?)</p>', body, re.S):
        attrs, frag = m.group(1), m.group(2)
        if 'data-part="prereq"' in attrs or 'data-part="sources"' in attrs:
            continue
        t = text(frag)
        if t:
            out.append((attrs, frag, t))
    return out


def part_span(body, name):
    """The markup belonging to one data-part, up to the next part or heading."""
    m = re.search(r'<(\w+)[^>]*data-part="%s"[^>]*>' % name, body)
    if not m:
        return ''
    start = m.start()
    nxt = re.search(r'<\w+[^>]*data-part="(?!%s)' % name, body[m.end():])
    end = m.end() + (nxt.start() if nxt else len(body))
    return body[start:end]


def check(path, slot=0):
    s = io.open(path, encoding='utf-8').read()
    body = prose(s)
    f = []

    # -- the frame ---------------------------------------------------------
    for p in PARTS:
        n = len(re.findall(r'data-part="%s"' % p, s))
        if n != 1:
            f.append('data-part %s appears %d times, expected 1' % (p, n))
    if not re.search(r'<h3[^>]*data-part="problems"', s):
        f.append('problems is not an h3')
    t = len(re.findall(r'<table\b', body))
    if t > TABLES:
        f.append('%d tables, at most %d allowed' % (t, TABLES))
    for bad, label in [(r'class="[^"]*callout', 'callout'),
                       (r'<details\b', 'accordion'),
                       (r'quiz-question', 'quiz')]:
        if re.search(bad, body):
            f.append('contains a %s' % label)

    # -- prose hygiene -----------------------------------------------------
    for attrs, frag, t_ in paragraphs(body):
        stripped = frag.strip()
        whole = re.match(r'<(strong|em)\b[^>]*>.*</\1>$', stripped, re.S)
        if whole and text(whole.group(0)) == t_:
            continue          # the paragraph is the emphasis: a display device
        if re.search(r'<(strong|em)\b(?![^>]*translate="no")', frag):
            f.append('inline emphasis mid-sentence: %s' % t_[:48])
            break
    m = re.search(r'(?<![\d.])\d[\d.,]*\s?%', text(re.sub(r'<table\b.*?</table>', '', body, flags=re.S)))
    if m:
        f.append('percent sign in prose: %s' % m.group(0))

    # -- nothing uncheckable for three paragraphs --------------------------
    run = worst = 0
    where = ''
    for attrs, frag, t_ in paragraphs(body):
        if re.search(r'\d', t_):
            run = 0
        else:
            run += 1
            if run > worst:
                worst, where = run, t_[:48]
    if worst > FIGURE_FREE_RUN:
        f.append('%d paragraphs running with no figure, from: %s' % (worst, where))

    # -- the claim ---------------------------------------------------------
    claim = text(part_span(body, 'claim'))
    if not re.search(r'\d', claim):
        f.append('claim carries no number')

    # -- the bounds --------------------------------------------------------
    bd = part_span(body, 'bounds')
    ps, lis = len(re.findall(r'<p\b', bd)), len(re.findall(r'<li\b', bd))
    if lis:
        f.append('bounds concedes in a bulleted list, not in the lesson\'s own '
                 'voice: %d items to rewrite as paragraphs' % lis)
    if max(ps, lis) < BOUNDS_CONCESSIONS:
        f.append('bounds has %d concessions, wants %d' % (max(ps, lis), BOUNDS_CONCESSIONS))

    # -- the problems ------------------------------------------------------
    ol = re.search(r'<ol[^>]*>(.*?)</ol>', body[body.find('data-part="problems"'):], re.S)
    if not ol:
        f.append('no problems list')
    else:
        li = re.findall(r'<li\b.*?</li>', ol.group(1), re.S)
        if len(li) != PROBLEMS:
            f.append('%d problems, wants %d' % (len(li), PROBLEMS))

    # -- title and description --------------------------------------------
    ti = re.search(r'<title>(.*?)</title>', s, re.S)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    name = text(ti.group(1)).split(' — ')[0].split(' &mdash; ')[0] if ti else ''
    if h1 and name != text(h1.group(1)):
        f.append('title and h1 name the lesson differently')
    if ':' in name:
        f.append('title carries a colon and a promise: %s' % name)
    if re.search(r'\d', name):
        f.append('title carries a figure: %s' % name)
    d = re.search(r'name="description" content="([^"]*)"', s)
    if d and not re.search(r'\d', d.group(1)):
        f.append('description carries no figure')

    # -- backward references ----------------------------------------------
    flat = text(body)
    for m in re.finditer(r'lesson (\d+)', flat, re.I):
        if int(m.group(1)) >= slot:
            continue          # forward references are teases, not recall
        window = flat[max(0, m.start() - 90):m.start()]
        if re.search(r'\b(recall|saw|showed|gave|established|found|printed|as we)\b',
                     window, re.I) and not re.search(r'\d', window):
            f.append('backward reference with no figure near it: %s'
                     % flat[max(0, m.start() - 60):m.end()])
            break

    # -- length ------------------------------------------------------------
    w = len(text(body).split())
    if not WORDS[0] <= w <= WORDS[1]:
        f.append('%d words, outside %d to %d' % (w, WORDS[0], WORDS[1]))
    return w, f


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    want = set()
    for a in args:
        if '-' in a:
            lo, hi = a.split('-')
            want |= set(range(int(lo), int(hi) + 1))
        else:
            want.add(int(a))
    bad = 0
    for p in sorted(glob.glob('education/curriculum/*/*.html')):
        if '/_merged/' in p:
            continue
        m = re.match(r'(\d+)-', os.path.basename(p))
        if not m:
            continue
        slot = int(m.group(1))
        if want and slot not in want:
            continue
        w, f = check(p, slot)
        if f:
            bad += 1
            print('%-3d %-42s %d words' % (slot, os.path.basename(p)[:42], w))
            for x in f:
                print('      %s' % x)
        elif '--verbose' in sys.argv:
            print('%-3d %-42s %d words  clean' % (slot, os.path.basename(p)[:42], w))
    print('\n%d lessons with findings' % bad)
    return min(bad, 125)


if __name__ == '__main__':
    sys.exit(main())
