# -*- coding: utf-8 -*-
"""Regenerate the twelve education indexes from the corpus.

education/index.html is the main landing page, so its lesson list has to sit in
the HTML for search engines rather than be fetched by script -- which is why
this generates at build time, while learning-path.html and the four tier pages
read index.json in the browser.

The eleven locale indexes are generated the same way, from the same corpus, and
that is the point: they had drifted to the pre-renumber course. /de/education/
listed 86 lessons under four tier names the lessons no longer use, every title
on it was in English, every link pointed at the English page, and one Start
button opened an orphaned _merged file. None of that was visible from the
lesson pages, which were correct and translated all along.

So a locale index is built from that locale's own lesson files: the title is the
h1 the reader will land on, the module name is the one that lesson prints, and
the tier names are the ones its badges carry. The only text not derived from the
corpus is the four tier headings and blurbs, which live in hubs_locales.py.

    python3 scripts/curriculum/hubs.py            # rewrite all twelve
    python3 scripts/curriculum/hubs.py --check    # exit 1 if any is stale
    python3 scripts/curriculum/hubs.py de         # one locale
"""
import html as H, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hubs_locales import L as LOC, GROUP, DOT, COLON

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
INDEX = 'education/index.html'
CAT = 'education/curriculum/index.json'
TIERS = ['beginner', 'intermediate', 'advanced', 'professional']
HEAD = {
 'beginner': ('\U0001F7E2 Beginner: The Mechanism, Costs and Risk',
   'How a market actually works, what trading takes from you before you are right or wrong, '
   'and what risk is as a number. Nothing here assumes you have ever placed a trade.'),
 'intermediate': ('\U0001F7E1 Intermediate: Reading the Auction',
   'Volume, delta, the tape and the book, turned into a reading of who was aggressive. Then the '
   'context that decides when that reading applies, and an honest account of what indicators can add.'),
 'advanced': ('\U0001F7E0 Advanced: The Other Side, and Building a System',
   'Who else is in the book and what their job is &mdash; market makers, speed, off-exchange, dealer '
   'hedging &mdash; and how to turn a reading into something testable, deployable and honest about its decay.'),
 'professional': ('\U0001F534 Professional: Portfolio and Practice',
   'Correlation and portfolio heat, the operations and infrastructure of doing this for a living, '
   'and the specialisms worth taking once the core is solid.'),
}
# Every character a locale may put inside a count, so a sweep re-matches the
# separator it wrote last time. Leaving U+202F out made the generator
# non-idempotent in French, Russian and Hungarian: a second run saw only the
# leading digits of 260 000 and rewrote the number on top of itself.
GROUPS = '.,\u00a0\u202f\u2009 '

LI = ('              <li class="lesson-item"><a href="{href}" style="flex:1;text-decoration:none;'
      'color:inherit;display:flex;justify-content:space-between;align-items:center">'
      '<span><strong>#{n}:</strong> {title}</span></a></li>')

TITLE = re.compile(r'<h1[^>]*>(.*?)</h1>', re.S)
META = re.compile(r'<div class="meta">(.*?)</div>', re.S)


def _read(path):
    """A lesson's own title and module name, as that page prints them.

    Taken off the page rather than out of the catalogue, because the catalogue
    is English and this is what the reader will actually land on. If they ever
    disagree, the page wins: it is the thing being linked to.
    """
    s = open(path, encoding='utf-8').read()
    # Entities are decoded here and re-escaped once on output. Reading them as
    # literal text and escaping that gave `L&amp;rsquo;autre côté` on the French
    # and Italian panels.
    title = H.unescape(re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', TITLE.search(s).group(1))).strip())
    m = META.search(s)
    cat = ''
    if m:
        # "13 min read &bull; Module 4: Reading the Auction" -- the module is
        # the middle field, and the third is the view count, which script fills
        # in later. Some pages write the separator as the literal bullet rather
        # than the entity, so both forms have to split, or the module name comes
        # back with a stray bullet welded to it and every locale reports one
        # module more than it has.
        parts = [p.strip(' \u00b7\u2022') for p in
                 re.split(r'&bull;|\u2022|\u00b7', re.sub('<[^>]+>', '', m.group(1)))]
        parts = [p for p in parts if p]
        if len(parts) > 1:
            cat = H.unescape(re.sub(r'\s+', ' ', parts[1]).strip())
    return title, cat


def corpus(lang):
    """Every lesson, per tier, as the given language states it."""
    cat = json.load(open(CAT, encoding='utf-8'))
    rows = []
    for e in cat:
        href = e['href']
        title, group = e['title'], e['category']
        if lang:
            title, group = _read(lang + href)
            href = '/' + lang + href
        rows.append(dict(order=e['order'], level=e['level'].lower(), href=href,
                         title=title, category=group or e['category'],
                         words=e.get('wordCount', 0)))
    return {t: sorted([r for r in rows if r['level'] == t], key=lambda r: r['order'])
            for t in TIERS}


def num(n, lang):
    """A count with the locale's own thousands separator.

    French, Russian and Hungarian group with a narrow no-break space (U+202F)
    rather than the plain space the pages carried, so a count never wraps
    across a line at the group boundary.
    """
    out = '{:,}'.format(n)
    return out if not lang else out.replace(',', GROUP[lang])


def strings(lang):
    """Heading, blurb, and the labels around the generated lists."""
    if not lang:
        return None
    return LOC[lang]


def render(lang=None):
    by = corpus(lang)
    path = INDEX if not lang else lang + '/' + INDEX
    s = open(path, encoding='utf-8').read()
    loc = strings(lang)

    total = sum(len(by[t]) for t in TIERS)
    tw = sum(r['words'] for t in TIERS for r in by[t])

    # Page-wide counts first. The per-tier counters written afterwards are more
    # specific, and doing this last overwrote them with the whole-course total.
    if not lang:
        s = re.sub(r'4 progressive tiers, [\d,]+ lessons, ~[\d,]+ words',
                   f'4 progressive tiers, {total} lessons, ~{tw // 1000},000 words', s)
        s = re.sub(r'(?<![\u2022\d ])\b\d\d\b(?= lessons)(?![^<]*\u2022)', str(total), s)
    else:
        # The locale pages say "86 Lektionen" and "~375.000 Wörter" in four
        # places each, in wording this file does not own. Only the numbers are
        # replaced, matched by the noun that follows them.
        lw, ww, pre, (ngap, wgap) = _nouns(loc['meta'])
        # The lesson noun is matched on its stem, because Russian inflects it
        # (83 урока in one sentence, 83 уроков in the next) and a full-word
        # match silently left one of the two counts at the pre-renumber 86.
        stem = loc.get('stem', lw)
        # The whitespace between the count and the noun is part of the match,
        # so the locale's own gap replaces whatever the page happened to carry.
        s = re.sub(r'\d[\d' + GROUPS + r']*[ ]*(?=' + re.escape(stem) + r')',
                   num(total, lang) + ngap, s)
        # The approximation marker is re-emitted rather than prepended: Japanese
        # writes 約 and Arabic نحو, and prepending a tilde gave 約~260,000.
        s = re.sub(r'(?:[~\u2248]|' + re.escape(pre.strip()) + r')?[ ]*\d[\d' + GROUPS + r']*[ ]*'
                   r'(?=' + re.escape(ww) + r')',
                   pre + num(tw // 1000 * 1000, lang) + wgap, s)

    # Per-tier heading and counters. Back to front so earlier offsets stay valid.
    metas = list(re.finditer(r'<h3>([^<]*)</h3>\s*<div class="module-meta">([^<]*)</div>', s))
    if len(metas) != len(TIERS):
        raise AssertionError(f'{path}: expected {len(TIERS)} module headers, found {len(metas)}')
    for i, (tier, m) in enumerate(zip(reversed(TIERS), reversed(metas))):
        j = len(TIERS) - 1 - i
        rows = by[tier]
        words = sum(r['words'] for r in rows)
        hrs = max(1, round(words / 9000))
        if lang:
            head = f"{DOT[j]} {loc['tiers'][j]}{COLON.get(lang, ': ')}{loc['sub'][j]}"
            meta = loc['meta'].format(n=len(rows), w=num(words // 1000 * 1000, lang),
                                      a=hrs, b=hrs + 3)
        else:
            head = HEAD[tier][0]
            meta = (f'{len(rows)} lessons &bull; ~{words // 1000},000 words '
                    f'&bull; {hrs}-{hrs + 3} hours')
        s = (s[:m.start()] + f'<h3>{head}</h3>\n          '
             f'<div class="module-meta">{meta}</div>' + s[m.end():])

    # The blurb paragraph under each module header.
    for j, tier in enumerate(TIERS):
        head = (f"{DOT[j]} {loc['tiers'][j]}{COLON.get(lang, ': ')}{loc['sub'][j]}") if lang else HEAD[tier][0]
        blurb = loc['blurb'][j] if lang else HEAD[tier][1]
        i = s.find(head)
        if i < 0:
            raise AssertionError(f'{path}: no heading for {tier}')
        p = re.compile(r'<p style="margin-bottom:1\.5rem;color:var\(--muted\)">.*?</p>', re.S).search(s, i)
        if p:
            s = s[:p.start()] + f'<p style="margin-bottom:1.5rem;color:var(--muted)">{blurb}</p>' + s[p.end():]

    # The lesson lists themselves.
    blocks = list(re.finditer(r'<ul class="lesson-list">.*?</ul>', s, re.S))
    if len(blocks) != len(TIERS):
        raise AssertionError(f'{path}: expected {len(TIERS)} lesson lists, found {len(blocks)}')
    for tier, m in zip(reversed(TIERS), reversed(blocks)):
        items = '\n'.join(LI.format(href=r['href'], n=r['order'],
                                    title=H.escape(r['title'], quote=False))
                          for r in by[tier])
        s = s[:m.start()] + '<ul class="lesson-list">\n' + items + '\n            </ul>' + s[m.end():]

    # Every other count on the English page. There is one number, and it is the
    # length of the listing; the page used to carry three different ones because
    # each was typed where it stood. The locale pages were swept above.
    # The meta and social descriptions are English on every page, locale
    # pages included, so this one runs everywhere. The locale copies were
    # left at 86 lessons and still advertised quizzes the course does not
    # have.
    s = re.sub(r'Free trading course: \d+ lessons',
               f'Free trading course: {total} lessons', s)
    s = s.replace('institutional trading with quizzes and progress tracking.',
                  'institutional trading with problems to work and progress tracking.')
    if not lang:
        s = re.sub(r'<strong>\d+ free lessons</strong>',
                   f'<strong>{total} free lessons</strong>', s)
        s = re.sub(r'through all \d+ lessons', f'through all {total} lessons', s)
        s = re.sub(r'>\d+ interactive lessons', f'>{total} interactive lessons', s)

    # Start buttons and prerequisite lines. A Start button is the lowest slot in
    # its tier; a prerequisite is the previous tier's last slot. Typed by hand,
    # all four buttons opened the wrong lesson, one of them an orphan file, and
    # on the locale pages they still named the pre-renumber tiers.
    btns = list(re.finditer(r'<a href="[^"]*" class="btn btn-primary">([^<]*)</a>', s))
    if len(btns) < len(TIERS):
        raise AssertionError(f'{path}: expected {len(TIERS)} Start buttons, found {len(btns)}')
    tier_btns = btns[:len(TIERS)] if lang else None
    for i, tier in enumerate(reversed(TIERS)):
        j = len(TIERS) - 1 - i
        first = by[TIERS[j]][0]
        if lang:
            m = tier_btns[j]
            arrow = '\u2190' if lang == 'ar' else '\u2192'
            label = loc['start'][j] + ' ' + arrow
            s = (s[:m.start()] + f'<a href="{first["href"]}" class="btn btn-primary">'
                 f'{label}</a>' + s[m.end():])
        else:
            pat = re.compile(r'<a href="[^"]*" class="btn btn-primary">Start '
                             + TIERS[j].capitalize() + r' Tier')
            m = pat.search(s)
            if not m:
                raise AssertionError(f'no Start button for {TIERS[j]}')
            s = (s[:m.start()] + f'<a href="{first["href"]}" class="btn btn-primary">'
                 f'Start {TIERS[j].capitalize()} Tier' + s[m.end():])

    pres = list(re.finditer(r'<strong>[^<]*</strong>[^<]*', s))
    pres = [m for m in pres if _isprereq(m.group(0), loc)]
    for i in range(1, len(TIERS)):
        last = by[TIERS[i - 1]][-1]['order']
        if lang:
            want = loc['prereq'][i - 1].format(last=last)
        else:
            want = (f'<strong>Prerequisites:</strong> Complete the '
                    f'{TIERS[i - 1].capitalize()} tier first (lessons 1&ndash;{last})')
        if i - 1 < len(pres):
            m = pres[i - 1]
            s = s[:m.start()] + want + s[m.end():]
            pres = [x for x in re.finditer(r'<strong>[^<]*</strong>[^<]*', s)
                    if _isprereq(x.group(0), loc)]

    # The four "What You'll Learn" panels. These were typed, and each described
    # a different tier from the one it sat under; one of them was a list of
    # indicator names. They are now that tier's own modules and lesson titles.
    for tier, m in zip(reversed(TIERS), reversed(_panels(s))):
        s = s[:m[0]] + _panel(by[tier], loc) + s[m[1]:]
    return s


def _nouns(meta):
    """What a locale puts around its lesson count and its word count: the noun
    after each, the approximation marker before the word count, and the gap
    between a count and its noun. The gap is the locale's own: the format says
    "{n} Lektionen" and "{n}レッスン", and a space emitted into the
    second is a gap Japanese does not set."""
    lw = meta.split('{n}')[1].split('&bull;')[0].strip()
    ww = meta.split('{w}')[1].split('&bull;')[0].strip()
    pre = meta.split('{w}')[0].split('&bull;')[-1].lstrip()
    gaps = (' ' if meta.split('{n}')[1][:1] == ' ' else '',
            ' ' if meta.split('{w}')[1][:1] == ' ' else '')
    return lw, ww, pre, gaps


def _label(fmt):
    """The bold label a prerequisite line opens with, e.g. Voraussetzungen."""
    return fmt.split('<strong>')[1].split('</strong>')[0]


def _key(text):
    """Letters only, folded, so a tag, an &nbsp; and a stray colon cannot decide
    a match: the French page stores its label as `Prérequis :` and this file
    writes it as `Prérequis&nbsp;:`, and they are the same label."""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'&[a-z]+;|&#\d+;', '', text)
    return re.sub(r'[^\w]', '', text, flags=re.U).lower()


def _isprereq(frag, loc):
    want = _key(_label(loc['prereq'][0] if loc else '<strong>Prerequisites:</strong>'))
    return _key(frag.split('</strong>')[0]) == want


def _panels(s):
    """Byte spans of the four `grid two-col` blocks, matched by balancing divs."""
    out = []
    for m in re.finditer(r'<div class="grid two-col">', s):
        i, depth = m.end(), 1
        for t in re.finditer(r'<div\b|</div>', s[m.end():]):
            depth += 1 if t.group(0) != '</div>' else -1
            if depth == 0:
                i = m.end() + t.end()
                break
        out.append((m.start(), i))
    if len(out) != len(TIERS):
        raise AssertionError(f'expected {len(TIERS)} learn panels, found {len(out)}')
    return out


CAP = 4  # titles shown per module; the remainder is named, never dropped silently


def _panel(rows, loc=None):
    mods, order = {}, []
    for e in rows:
        if e['category'] not in mods:
            mods[e['category']] = []
            order.append(e['category'])
        mods[e['category']].append(e)
    out = ['<div class="grid two-col">']
    for cat in order:
        es = mods[cat]
        lo, hi = es[0]['order'], es[-1]['order']
        items = [f'                  <li>{H.escape(e["title"], quote=False)}</li>'
                 for e in es[:CAP]]
        if len(es) > CAP:
            k = len(es) - CAP
            items.append('                  <li>'
                         + (loc['more'].format(k=k) if loc else f'and {k} more')
                         + '</li>')
        out.append('              <div>')
        out.append(f'                <h4 style="margin:0 0 .25rem 0">{H.escape(cat, quote=False)}</h4>')
        span = loc['range'].format(lo=lo, hi=hi) if loc else f'Lessons {lo}&ndash;{hi}'
        out.append('                <div style="font-size:.8rem;color:var(--muted);'
                   f'margin-bottom:.5rem">{span}</div>')
        out.append('                <ul style="margin:0;padding-left:1.5rem;list-style:disc">')
        out.extend(items)
        out.append('                </ul>')
        out.append('              </div>')
    out.append('            </div>')
    return '\n'.join(out)


LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']


def _path(lang):
    return INDEX if not lang else lang + '/' + INDEX


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    todo = args if args else [None] + LANGS
    todo = [None if a in (None, 'en') else a for a in todo]
    stale = []
    for lang in todo:
        out = render(lang)
        path = _path(lang)
        cur = open(path, encoding='utf-8').read()
        if '--check' in sys.argv:
            if out != cur:
                stale.append(path)
            continue
        if out != cur:
            open(path, 'w', encoding='utf-8').write(out)
        n = sum(len(v) for v in corpus(lang).values())
        print(f'{path}: {n} lessons' + ('' if out != cur else ' (unchanged)'))
    if '--check' in sys.argv:
        print(('STALE: ' + ', '.join(stale)) if stale else 'all indexes up to date')
        sys.exit(1 if stale else 0)
