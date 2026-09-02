# -*- coding: utf-8 -*-
"""Regenerate education/index.html's curriculum section from the catalogue.

education/index.html is the main landing page, so its lesson list has to sit in
the HTML for search engines rather than be fetched by script -- which is why
this generates at build time, while learning-path.html and the four tier pages
read index.json in the browser.

Run after adding, renaming or reordering any lesson:

    python3 scripts/curriculum/hubs.py            # rewrite
    python3 scripts/curriculum/hubs.py --check    # exit 1 if stale
"""
import html as H, json, os, re, sys

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
LI = ('              <li class="lesson-item"><a href="{href}" style="flex:1;text-decoration:none;'
      'color:inherit;display:flex;justify-content:space-between;align-items:center">'
      '<span><strong>#{n}:</strong> {title}</span></a></li>')


def render():
    cat = json.load(open(CAT, encoding='utf-8'))
    by = {t: sorted([e for e in cat if e['level'].lower() == t], key=lambda e: e['order'])
          for t in TIERS}
    s = open(INDEX, encoding='utf-8').read()

    # Page-wide counts first. The per-tier counters written afterwards are more
    # specific, and doing this last overwrote them with the whole-course total.
    total = len(cat)
    tw = sum(e.get('wordCount', 0) for e in cat)
    s = re.sub(r'4 progressive tiers, [\d,]+ lessons, ~[\d,]+ words',
               f'4 progressive tiers, {total} lessons, ~{tw // 1000},000 words', s)
    s = re.sub(r'(?<![•\d ])\b\d\d\b(?= lessons)(?![^<]*•)', str(total), s)

    # Per-tier heading, blurb and counters. Back to front so earlier offsets stay valid.
    metas = list(re.finditer(r'<h3>([^<]*)</h3>\s*<div class="module-meta">([^<]*)</div>', s))
    if len(metas) != len(TIERS):
        raise AssertionError(f'expected {len(TIERS)} module headers, found {len(metas)}')
    for tier, m in zip(reversed(TIERS), reversed(metas)):
        rows = by[tier]
        words = sum(e.get('wordCount', 0) for e in rows)
        hrs = max(1, round(words / 9000))
        head, _ = HEAD[tier]
        new = (f'<h3>{head}</h3>\n          <div class="module-meta">{len(rows)} lessons '
               f'&bull; ~{words // 1000},000 words &bull; {hrs}-{hrs + 3} hours</div>')
        s = s[:m.start()] + new + s[m.end():]

    # The blurb paragraph under each module header.
    for tier in TIERS:
        head, blurb = HEAD[tier]
        i = s.find(head)
        if i < 0:
            continue
        p = re.compile(r'<p style="margin-bottom:1\.5rem;color:var\(--muted\)">.*?</p>', re.S).search(s, i)
        if p:
            s = s[:p.start()] + f'<p style="margin-bottom:1.5rem;color:var(--muted)">{blurb}</p>' + s[p.end():]

    # The lesson lists themselves.
    blocks = list(re.finditer(r'<ul class="lesson-list">.*?</ul>', s, re.S))
    if len(blocks) != len(TIERS):
        raise AssertionError(f'expected {len(TIERS)} lesson lists, found {len(blocks)}')
    for tier, m in zip(reversed(TIERS), reversed(blocks)):
        items = '\n'.join(LI.format(href=e['href'], n=e['order'],
                                    title=H.escape(e['title'], quote=False))
                          for e in by[tier])
        s = s[:m.start()] + '<ul class="lesson-list">\n' + items + '\n            </ul>' + s[m.end():]

    # Every other count on the page. There is one number, and it is the length
    # of the listing; the page used to carry three different ones because each
    # was typed where it stood.
    s = re.sub(r'Free trading course: \d+ lessons',
               f'Free trading course: {total} lessons', s)
    s = re.sub(r'<strong>\d+ free lessons</strong>',
               f'<strong>{total} free lessons</strong>', s)
    s = re.sub(r'through all \d+ lessons', f'through all {total} lessons', s)
    s = re.sub(r'>\d+ interactive lessons', f'>{total} interactive lessons', s)

    # Start buttons and prerequisite lines. A Start button is the lowest slot in
    # its tier; a prerequisite is the previous tier's last slot. Typed by hand,
    # all four buttons opened the wrong lesson and one opened an orphan file.
    for i, tier in enumerate(TIERS):
        first = by[tier][0]
        pat = re.compile(r'<a href="[^"]*" class="btn btn-primary">Start '
                         + tier.capitalize() + r' Tier')
        m = pat.search(s)
        if not m:
            raise AssertionError(f'no Start button for {tier}')
        s = (s[:m.start()] + f'<a href="{first["href"]}" class="btn btn-primary">'
             f'Start {tier.capitalize()} Tier' + s[m.end():])
        if i == 0:
            continue
        prev = TIERS[i - 1]
        last = by[prev][-1]['order']
        want = (f'<strong>Prerequisites:</strong> Complete the {prev.capitalize()} '
                f'tier first (lessons 1&ndash;{last})')
        pat = re.compile(r'<strong>Prerequisites:</strong>[^<]*')
        for m in list(re.finditer(pat, s))[i - 1:i]:
            s = s[:m.start()] + want + s[m.end():]

    # The four "What You'll Learn" panels. These were typed, and each described
    # a different tier from the one it sat under; one of them was a list of
    # indicator names. They are now that tier's own modules and lesson titles.
    for tier, m in zip(reversed(TIERS), reversed(_panels(s))):
        s = s[:m[0]] + _panel(by[tier]) + s[m[1]:]
    return s


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


def _panel(rows):
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
            items.append(f'                  <li>and {len(es) - CAP} more</li>')
        out.append('              <div>')
        out.append(f'                <h4 style="margin:0 0 .25rem 0">{H.escape(cat, quote=False)}</h4>')
        out.append('                <div style="font-size:.8rem;color:var(--muted);'
                   f'margin-bottom:.5rem">Lessons {lo}&ndash;{hi}</div>')
        out.append('                <ul style="margin:0;padding-left:1.5rem;list-style:disc">')
        out.extend(items)
        out.append('                </ul>')
        out.append('              </div>')
    out.append('            </div>')
    return '\n'.join(out)


if __name__ == '__main__':
    out = render()
    cur = open(INDEX, encoding='utf-8').read()
    if '--check' in sys.argv:
        stale = out != cur
        print('education/index.html is ' + ('STALE against index.json' if stale else 'up to date'))
        sys.exit(1 if stale else 0)
    open(INDEX, 'w', encoding='utf-8').write(out)
    print(f'education/index.html regenerated from the catalogue: {len(json.load(open(CAT, encoding="utf-8")))} lessons')
