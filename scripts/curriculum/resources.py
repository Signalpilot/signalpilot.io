# -*- coding: utf-8 -*-
"""Build education/resources.html from the worksheet sources themselves.

    python3 scripts/curriculum/resources.py            rewrite the page
    python3 scripts/curriculum/resources.py --check    exit with 1 if it is stale

The page was typed. It listed nine of the fourteen sources on disk, every one
of them citing a lesson between 20 and 63, so a reader who had reached the
professional tier found nothing that belonged to it: modules 9 to 14 hold
thirty lessons and had no worksheet at all. It also handed out the Markdown
rather than the rendered PDF, so Download delivered a file most readers cannot
open.

Nothing here is typed now. Each source names its own lesson in its footer, so
the mapping is read off the file rather than maintained beside it; the blurb is
the source's own opening paragraph; and the tier and module come from the
catalogue. A new worksheet appears on the page by existing.
"""
import os, re, sys, json, glob, html, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
PAGE = 'education/resources.html'
CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))
BY_SLOT = {r['order']: r for r in CAT}
BY_HREF = {r['href']: r for r in CAT}
TIERS = ['Beginner', 'Intermediate', 'Advanced', 'Professional']


def sources(kind):
    """Every Markdown source of one kind, as the page needs to state it."""
    out = []
    for p in sorted(glob.glob('education/resources/%s/*.md' % kind)):
        s = open(p, encoding='utf-8').read()
        title = re.search(r'^#\s+(.+)$', s, re.M).group(1).strip()
        # The worksheets name their lesson as a URL in the footer; the four
        # templates name it in the attribution line and carry no footer link.
        # Both are the file stating its own origin, so read whichever is there
        # rather than keeping a table of slugs beside the directory.
        href = re.findall(r'/education/curriculum/[^\s)]*\.html', s)
        if href:
            row = BY_HREF.get(href[-1])
            if row is None:
                raise SystemExit('%s: footer names %s, which is not in the '
                                 'catalogue' % (p, href[-1]))
        else:
            m = re.search(r'companion to Lesson (\d+)', s)
            if not m:
                raise SystemExit('%s: names no lesson' % p)
            row = BY_SLOT.get(int(m.group(1)))
            if row is None:
                raise SystemExit('%s: names lesson %s, which does not exist'
                                 % (p, m.group(1)))
        # The first real paragraph after the italic attribution line. Not
        # everything here is a worksheet: a couple of the templates open
        # straight into a table, so skip headings, quotes, rules, lists and
        # table rows rather than assuming a prose lead.
        blurb = ''
        for x in (y.strip() for y in s.split('\n\n')):
            if not x or x.startswith(('#', '*', '>', '-', '|', '`')):
                continue
            blurb = ' '.join(x.split())
            break
        if not blurb:
            raise SystemExit('%s: no opening paragraph to quote' % p)
        pdf = p[:-3] + '.pdf'
        if not os.path.exists(pdf):
            raise SystemExit('%s: no rendered PDF; run mkpdf.cjs' % p)
        out.append({'title': title, 'row': row, 'blurb': blurb,
                    'pdf': '/' + pdf, 'md': '/' + p})
    return out


def esc(t):
    return html.escape(t, quote=False).replace('&amp;', '&')


def card(w):
    r = w['row']
    return f"""
      <div class="card" style="padding:2rem">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;margin-bottom:1rem">
          <div>
            <span class="badge">{esc(r['category'])}</span>
            <h3 style="margin:.5rem 0">{esc(w['title'])}</h3>
            <p style="margin:0;font-size:.9rem;color:var(--muted)">Works from <a href="{r['href']}">Lesson {r['order']}: {esc(r['title'])}</a></p>
          </div>
          <a href="{w['pdf']}" download class="btn btn-primary">Download PDF</a>
        </div>
        <p style="color:var(--muted);margin-bottom:.75rem">{esc(w['blurb'])}</p>
        <p style="font-size:.85rem;margin:0"><a href="{w['md']}" download style="color:var(--muted)">Markdown source</a></p>
      </div>"""


def coverage(ws):
    """One row per tier: how many of its modules a sheet of any kind reaches.

    Counting only the worksheets read as though the beginner tier had nothing,
    when it has two templates. A reader does not care which directory a sheet
    came out of."""
    mods = collections.OrderedDict()
    for r in CAT:
        mods.setdefault(r['level'], set()).add(r['category'])
    hit = collections.defaultdict(set)
    for w in ws:
        hit[w['row']['level']].add(w['row']['category'])
    rows = []
    for t in TIERS:
        rows.append(f"""
        <tr><td>{t}</td><td>{len(hit[t])} of {len(mods.get(t, ()))}</td>
        <td>{sum(1 for w in ws if w['row']['level'] == t)}</td></tr>""")
    return ''.join(rows)


def build():
    ws = sources('worksheets')
    tp = sources('templates')
    allw = ws + tp
    body = []
    for t in TIERS:
        rows = [w for w in ws if w['row']['level'] == t]
        if not rows:
            continue
        rows.sort(key=lambda w: w['row']['order'])
        body.append(f'\n    <div class="section-break"><span>{t} tier</span></div>')
        body.append('\n    <div style="display:grid;gap:1.5rem;margin-bottom:3rem">')
        body += [card(w) for w in rows]
        body.append('\n    </div>')
    tp.sort(key=lambda w: w['row']['order'])

    s = open(PAGE, encoding='utf-8').read()
    a = s.index('<section class="wrap" style="max-width:900px;margin:3rem auto">')
    b = s.index('  </section>', a) + len('  </section>')
    new = f"""<section class="wrap" style="max-width:900px;margin:3rem auto">

    <div class="card" style="padding:1.5rem 2rem;margin-bottom:3rem">
      <h3 style="margin:0 0 .75rem">What is covered</h3>
      <p style="color:var(--muted);margin:0 0 1rem;font-size:.95rem">A worksheet belongs to one lesson. This is how much of the course the {len(allw)} of them reach.</p>
      <table style="width:100%;font-size:.95rem">
        <thead><tr><th style="text-align:left">Tier</th><th style="text-align:left">Modules reached</th><th style="text-align:left">Sheets</th></tr></thead>
        <tbody>{coverage(allw)}</tbody>
      </table>
    </div>

    <div class="section-break"><span>Lesson worksheets</span></div>
    <p style="margin-bottom:2rem">Each worksheet takes one lesson&rsquo;s problems and gives them a shape to fill in. The right-hand column carries what the lesson measured on its own bars, so your answer has something to disagree with.</p>
{''.join(body)}

    <div class="section-break"><span>Standing templates</span></div>
    <p style="margin-bottom:2rem">Not a one-off measurement but an instrument you keep: the record you write down, the size you take, and what a backtest is allowed to be evidence of.</p>

    <div style="display:grid;gap:1.5rem;margin-bottom:3rem">{''.join(card(w) for w in tp)}
    </div>

  </section>"""
    return s[:a] + new + s[b:], len(ws), len(tp)


def main(argv):
    out, nw, nt = build()
    cur = open(PAGE, encoding='utf-8').read()
    if out == cur:
        print('%d worksheets, %d templates, page already current' % (nw, nt))
        return 0
    if '--check' in argv:
        print('%s is stale' % PAGE)
        return 1
    open(PAGE, 'w', encoding='utf-8').write(out)
    print('%s rewritten: %d worksheets, %d templates' % (PAGE, nw, nt))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
