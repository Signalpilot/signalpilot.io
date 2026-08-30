# -*- coding: utf-8 -*-
"""Per-lesson quality signals.

These do NOT grade a lesson. Grading is a read, one lesson at a time, and the
judgements live in scripts/curriculum/quality.json. What this does is make 82
reads tractable, and catch the two things a sequential human read cannot:

  * REDUNDANCY across lessons. A passage repeated in lesson 21 and lesson 44 is
    invisible when you read them a week apart. Shingle hashing finds it.
  * PROMISE vs DELIVERY. An objective that names something the lesson never
    covers is only visible if you hold the objectives in mind for 3,000 words.

Everything else here is a reading aid: burden, sentence length, how much of the
lesson is story rather than explanation, and which technical terms the lesson
uses without ever defining.

    python3 scripts/curriculum/quality.py            # summary table
    python3 scripts/curriculum/quality.py --dupes    # cross-lesson passages
    python3 scripts/curriculum/quality.py --json     # machine-readable
"""
import re, sys, glob, json, html, collections

SHINGLE = 12          # words per fingerprint
MIN_PASSAGE = 18      # words before a shared passage is worth reporting
BOILER = re.compile(
    r'(?is)<!--\s*Prerequisites.*?-->|'
    r'<div class="callout-warning"[^>]*>\s*<h4>[^<]*Prerequisites.*?</div>|'
    r'<h[23][^>]*>\s*Related Lessons.*|'
    r'<div class="discussion-section".*|'
    r'<div class="callout-info"[^>]*>\s*<p>You&#39;re about halfway.*?</div>|'
    r"<div class=\"callout-info\"[^>]*>\s*<p>You're about halfway.*?</div>|"
    r'<footer.*')

# Terms a lesson may use; flagged when used but never explained in that lesson.
TERMS = ['VWAP','TWAP','ATR','RSI','EMA','SMA','MACD','VIX','POC','HVN','LVN',
         'CVD','HTF','LTF','MTF','FVG','DOM','COT','OBV','ADX','R:R','P&L',
         'delta','gamma','vega','theta','skew','basis','slippage','drawdown',
         'expectancy','profit factor','Sharpe','Kelly','cointegration',
         'order flow','order book','dark pool','market maker','absorption',
         'exhaustion','imbalance','liquidity','spread','iceberg','spoofing']
OBJ_LEAD = (r"(?:what you'?ll (?:learn|master|gain|know)"
            r"|in this lesson,? you'?ll learn"
            r"|by the end of this lesson"
            r"|learning objectives?)")
DEFINES = re.compile(r'(?i)\b(is|are|means?|refers? to|stands for|defined as|'
                     r'definition|:—|\bi\.e\.|that is)\b')


def body(path):
    raw = open(path, encoding='utf-8').read()
    b = raw.split('<div class="prose">', 1)[-1]
    return BOILER.sub(' ', b)


def visible(h):
    h = re.sub(r'(?is)<(script|style|svg)\b.*?</\1>', ' ', h)
    h = re.sub(r'(?s)<!--.*?-->', ' ', h)
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[a-zA-Z!/?][^>]*>', ' ', h))).strip()


def words(t):
    return re.findall(r"[a-z']+", t.lower())


def shingles(ws, n=SHINGLE):
    return [(' '.join(ws[i:i + n]), i) for i in range(len(ws) - n + 1)]


def objectives(b):
    m = re.search(OBJ_LEAD + r".*?<ul[^>]*>(.*?)</ul>", b, re.I | re.S)
    if not m:
        return []
    return [visible(x) for x in re.findall(r'(?is)<li[^>]*>(.*?)</li>', m.group(1))]


def headings(b):
    out = []
    for m in re.finditer(r'(?is)<h[2-4]\b[^>]*>(.*?)</h[2-4]>'
                         r'|<div class="section-break"[^>]*>\s*<span[^>]*>(.*?)</span>', b):
        out.append(visible(next(g for g in m.groups() if g is not None)))
    return out


STOP = set('the a an and or of to in for with on at by is are be as it its that this you your '
           'from what how why when where which who will can not but if then than so do does '
           'more most less least all any each every into out up down over under about'.split())


def promise_gap(b):
    """Objectives whose content words barely appear outside the objectives block."""
    objs = objectives(b)
    if not objs:
        return None, []
    rest = set(words(visible(re.sub(OBJ_LEAD + r'.*?</ul>', ' ', b, flags=re.I | re.S))))
    gaps = []
    for o in objs:
        key = [w for w in words(o) if w not in STOP and len(w) > 3]
        if not key:
            continue
        hit = sum(1 for w in set(key) if w in rest)
        if hit / len(set(key)) < 0.5:
            gaps.append(o[:90])
    return len(objs), gaps


def undefined_terms(b):
    t = visible(b)
    out = []
    for term in TERMS:
        pat = re.compile(rf'(?<![A-Za-z]){re.escape(term)}(?![A-Za-z])'
                         if term.isupper() or not term.isalpha() else rf'\b{re.escape(term)}\b',
                         0 if term.isupper() else re.I)
        hits = list(pat.finditer(t))
        if not hits:
            continue
        first = hits[0]
        window = t[max(0, first.start() - 120): first.end() + 200]
        if not DEFINES.search(window):
            out.append((term, len(hits)))
    return out


def profile(path):
    b = body(path)
    t = visible(b)
    ws = words(t)
    sents = [s for s in re.split(r'(?<=[.!?])\s+', t) if len(s.split()) > 2]
    nobj, gaps = promise_gap(b)
    story = sum(len(visible(m.group(0)).split())
                for m in re.finditer(r'(?is)<div class="(?:example-block|callout callout-(?:danger|success))"[^>]*>.*?</div>', b))
    return dict(
        slug=path.split('/')[-1][:-5],
        words=len(ws),
        sentences=len(sents),
        avg_sentence=round(len(ws) / max(1, len(sents)), 1),
        headings=len(headings(b)),
        objectives=nobj,
        promise_gaps=gaps,
        story_words=story,
        story_share=round(story / max(1, len(ws)), 2),
        undefined=undefined_terms(b),
    )


def dupes(paths):
    seen = collections.defaultdict(list)
    per = {}
    for p in paths:
        ws = words(visible(body(p)))
        per[p] = ws
        for sh, i in shingles(ws):
            seen[sh].append((p, i))
    hits = collections.defaultdict(list)
    for sh, locs in seen.items():
        files = {p for p, _ in locs}
        if len(files) > 1:
            for p, i in locs:
                hits[p].append((i, sh, sorted(files - {p})))
    # merge adjacent shingle hits into passages
    out = []
    for p, lst in hits.items():
        lst.sort()
        run = []
        for i, sh, others in lst:
            if run and i == run[-1][0] + 1 and run[-1][2] == others:
                run.append((i, sh, others))
            else:
                if run:
                    out.append((p, run))
                run = [(i, sh, others)]
        if run:
            out.append((p, run))
    passages = []
    for p, run in out:
        n = len(run) + SHINGLE - 1
        if n < MIN_PASSAGE:
            continue
        start = run[0][0]
        text = ' '.join(per[p][start:start + n])
        passages.append(dict(slug=p.split('/')[-1][:-5], n_words=n,
                             shared_with=[o.split('/')[-1][:-5] for o in run[0][2]],
                             text=text))
    # one row per distinct passage, listing every lesson that carries it
    grouped = {}
    for d in passages:
        key = d['text']
        g = grouped.setdefault(key, dict(n_words=d['n_words'], text=key, lessons=set()))
        g['lessons'].add(d['slug'])
        g['lessons'].update(d['shared_with'])
    out2 = [dict(n_words=g['n_words'], text=g['text'], lessons=sorted(g['lessons']))
            for g in grouped.values()]
    out2.sort(key=lambda d: (-len(d['lessons']), -d['n_words']))
    return out2


def main():
    paths = sorted(glob.glob('education/curriculum/*/*.html'))
    if '--dupes' in sys.argv:
        ps = dupes(paths)
        print(f'shared passages of {MIN_PASSAGE}+ words: {len(ps)}\n')
        for d in ps[:60]:
            print(f"{d['n_words']:>4}w  in {len(d['lessons'])}: {', '.join(d['lessons'])}")
            print(f'        {d["text"][:170]}...')
        return
    profs = [profile(p) for p in paths]
    if '--json' in sys.argv:
        print(json.dumps(dict(profiles=profs, dupes=dupes(paths)), ensure_ascii=False, indent=1))
        return
    print(f'{"lesson":<38}{"words":>6}{"sent":>6}{"hdgs":>5}{"obj":>4}{"gap":>4}{"story":>6}{"undef":>6}')
    print('-' * 84)
    for d in profs:
        print(f'{d["slug"]:<38}{d["words"]:>6}{d["avg_sentence"]:>6}{d["headings"]:>5}'
              f'{d["objectives"] or 0:>4}{len(d["promise_gaps"]):>4}{d["story_share"]:>6}{len(d["undefined"]):>6}')


if __name__ == '__main__':
    main()
