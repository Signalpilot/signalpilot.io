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
    return s


if __name__ == '__main__':
    out = render()
    cur = open(INDEX, encoding='utf-8').read()
    if '--check' in sys.argv:
        stale = out != cur
        print('education/index.html is ' + ('STALE against index.json' if stale else 'up to date'))
        sys.exit(1 if stale else 0)
    open(INDEX, 'w', encoding='utf-8').write(out)
    print(f'education/index.html regenerated from the catalogue: {len(json.load(open(CAT, encoding="utf-8")))} lessons')
