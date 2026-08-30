# -*- coding: utf-8 -*-
"""Render scripts/curriculum/quality.json as a readable audit page.

    python3 scripts/curriculum/report.py [out.html]

quality.json holds one record per lesson: the five rubric dimensions from
RUBRIC.md, an overall grade, what was found and what was changed. This turns
that into a mark sheet a person can actually read.
"""
import json, re, sys, os, html, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QJ = os.path.join(ROOT, 'scripts/curriculum/quality.json')
DIMS = [('easy_to_get', 'Easy to get'), ('easy_to_follow', 'Easy to follow'),
        ('worth_the_time', 'Worth the time'), ('delivers', 'Delivers'),
        ('evidence', 'Evidence')]
ORDER = ['S', 'A', 'B', 'C', 'D']


def letter(v):
    """The grade a dimension string opens with; the whole string when bare."""
    v = v.strip()
    if len(v) == 1:
        return v
    m = re.match(r'([SABCD])\b', v)
    return m.group(1) if m else '?'


def prose(v):
    """The dimension verdict without its leading grade, or '' when bare."""
    v = v.strip()
    if len(v) == 1:
        return ''
    return re.sub(r'^[SABCD]\s*[—\-:]\s*', '', v).strip()


def e(t):
    return html.escape(t, quote=False)


def ul(items, cls):
    if not items:
        return ''
    lis = ''.join(f'<li>{e(x)}</li>' for x in items)
    return f'<ul class="{cls}">{lis}</ul>'


def build():
    recs = sorted(json.load(open(QJ, encoding='utf-8')).values(), key=lambda r: r['n'])
    grades = collections.Counter(r['grade'] for r in recs)
    tiers = ['beginner', 'intermediate', 'advanced', 'professional']
    tier_n = collections.Counter(r['tier'] for r in recs)
    nfix = sum(len(r['fixes']) for r in recs)

    bar = ''.join(
        f'<span class="seg g-{g}" style="flex:{grades[g]}" title="{grades[g]} at {g}">'
        f'<b>{g}</b><i>{grades[g]}</i></span>'
        for g in ORDER if grades[g])

    rows = []
    for r in recs:
        chips = ''.join(
            f'<span class="chip g-{letter(r["dimensions"][k])}" '
            f'title="{lbl}">{letter(r["dimensions"][k])}</span>'
            for k, lbl in DIMS)
        verdicts = ''.join(
            f'<div class="v"><h4>{lbl}<span class="chip g-{letter(r["dimensions"][k])}">'
            f'{letter(r["dimensions"][k])}</span></h4>'
            f'<p>{e(prose(r["dimensions"][k])) or "&mdash;"}</p></div>'
            for k, lbl in DIMS)
        body = f'''<div class="detail">
      <div class="verdicts">{verdicts}</div>
      {f'<p class="summary">{e(r["summary"])}</p>' if r['summary'] else ''}
      <div class="cols">
        {f'<section><h5>Holds up</h5>{ul(r["strengths"], "good")}</section>' if r['strengths'] else ''}
        {f'<section><h5>Still open</h5>{ul(r["weaknesses"], "bad")}</section>' if r['weaknesses'] else ''}
      </div>
      {f'<section class="fixes"><h5>Changed &mdash; {len(r["fixes"])} {"fix" if len(r["fixes"]) == 1 else "fixes"}</h5>{ul(r["fixes"], "fix")}</section>' if r['fixes'] else ''}
    </div>'''
        rows.append(f'''<article class="row g-{r['grade']}" data-tier="{r['tier']}" data-grade="{r['grade']}">
    <button class="head" aria-expanded="false">
      <span class="num">{r['n']:02d}</span>
      <span class="name">{e(r['title'])}</span>
      <span class="tier">{r['tier']}</span>
      <span class="chips">{chips}</span>
      <span class="grade">{r['grade']}</span>
    </button>
    {body}
  </article>''')

    filters = ''.join(f'<button class="f" data-f="tier:{t}">{t}<i>{tier_n[t]}</i></button>'
                      for t in tiers)
    gfilters = ''.join(f'<button class="f g-{g}" data-f="grade:{g}">{g}<i>{grades[g]}</i></button>'
                       for g in ORDER if grades[g])

    sub = {'@@bar@@': bar, '@@rows@@': '\n'.join(rows), '@@filters@@': filters,
           '@@gfilters@@': gfilters, '@@nfix@@': str(nfix), '@@n@@': str(len(recs))}
    out = TPL
    for k, v in sub.items():
        out = out.replace(k, v)
    return out


TPL = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'report.tpl.html'),
           encoding='utf-8').read()

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'curriculum-audit.html'
    open(out, 'w', encoding='utf-8').write(build())
    print('wrote', out)
