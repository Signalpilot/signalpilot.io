# -*- coding: utf-8 -*-
"""Move the "Quick Wins for Tomorrow" block below the teaching.

The block is a self-contained <details> element that currently sits near the
top of most lessons, so the reader is told to do things -- widen stops with
1.5x ATR, avoid the first fifteen minutes -- before the lesson has explained
any of the terms those instructions use. The chosen spine puts it after the
teaching and the case study, just before the quiz.

Two things make this safe to do mechanically. The block is one element, so
lifting it cannot orphan a tag. And the insertion point is chosen by tag
DEPTH rather than by a text pattern: we walk the prose region tracking how
deep we are, and only ever reinsert at a point where the depth matches the
depth the block was lifted from. A regex anchor would happily drop the block
inside a table cell.
"""
import re, sys, glob

VOID = {'br','img','input','hr','meta','link','source','area','base','col',
        'embed','param','track','wbr','path','circle','rect','line','polyline',
        'polygon','stop','use','ellipse','marker'}
TAG = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(/?)>')

def depths(s):
    """Yield (position, depth_before_this_tag) for every tag in s."""
    d = 0
    out = []
    for m in TAG.finditer(s):
        closing, name, attrs, selfclose = m.groups()
        out.append((m.start(), d, m))
        if name.lower() in VOID or selfclose:
            continue
        d += -1 if closing else 1
    return out

def balance(s):
    d = 0
    for m in TAG.finditer(s):
        closing, name, _, selfclose = m.groups()
        if name.lower() in VOID or selfclose:
            continue
        d += -1 if closing else 1
    return d

QW = re.compile(r'[ \t]*<details[^>]*>\s*<summary[^>]*>[^<]*Quick Wins.*?</details>\s*',
                re.S | re.I)

def move(path, dry=False):
    s = open(path).read()
    head, sep, body = s.partition('<div class="prose">')
    if not sep:
        return 'no prose region'
    m = QW.search(body)
    if not m:
        return 'no quick-wins block'
    block = m.group()
    # Lessons scatter knowledge checks through the text, so the first
    # quiz-question is often a mid-lesson check rather than the closing quiz.
    # Group the questions into clusters and anchor on the last cluster, which
    # is the end-of-lesson quiz the spine puts after the action steps.
    qs = [q.start() for q in re.finditer(r'class="quiz-question"', body)]
    if not qs:
        return 'no quiz to anchor on'
    gap = len(body) * 0.05
    cluster = qs[0]
    for a, b2 in zip(qs, qs[1:]):
        if b2 - a > gap:
            cluster = b2
    quiz = type('Q', (), {'start': staticmethod(lambda c=cluster: c)})()
    if m.start() > quiz.start():
        return 'already below the closing quiz'

    stripped = body[:m.start()] + body[m.end():]
    # quiz position shifts left by the length we removed
    qpos = quiz.start() - len(block) if quiz.start() > m.start() else quiz.start()

    # Anchor on the depth AT the closing quiz, not the depth the block happens
    # to sit at now. Those differ whenever the quiz lives inside a wrapper that
    # opened earlier, and matching the old depth then throws the block back to
    # the last top-level boundary -- which is near the top of the page, exactly
    # where we are trying to move it away from.
    here = balance(stripped[:qpos])
    best = None
    for pos, d, tm in depths(stripped[:qpos]):
        if d == here:
            best = pos
    if best is None:
        return f'no depth-{here} boundary before the quiz'

    out = head + sep + stripped[:best] + block + stripped[best:]
    if balance(out) != balance(s):
        return 'REFUSED: tag balance would change'
    if not dry:
        open(path, 'w').write(out)
    return f'moved (depth {here}, {len(block)} bytes)'

if __name__ == '__main__':
    dry = '--dry' in sys.argv
    ok = skip = 0
    for f in sorted(glob.glob('education/curriculum/*/*.html')):
        r = move(f, dry)
        if r.startswith('moved'):
            ok += 1
        else:
            skip += 1
            print(f'  {f.split("/")[-1][:-5]:<38} {r}')
    print(f'\nmoved: {ok}   left alone: {skip}   {"(dry run)" if dry else ""}')
