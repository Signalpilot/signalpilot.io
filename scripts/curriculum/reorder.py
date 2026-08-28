# -*- coding: utf-8 -*-
"""Relocate "Quick Wins for Tomorrow" to just ABOVE the closing quiz.

The first pass anchored on the depth of the quiz *questions*, which is a depth
INSIDE <div class="quiz">. So in 62 lessons the action block landed nested in
the quiz container, under the "Test Your Understanding" banner -- structurally
balanced, pedagogically wrong. The reader is told to go do three things while
sitting in the middle of the test.

This pass anchors on the top level of the prose region instead: the last
depth-0 boundary before the quiz is the quiz container's own open tag, and if
a "Test Your Understanding" section break sits immediately above it, that
break is the real top of the assessment block and the action goes above it.
"""
import re, sys, glob

VOID = {'br','img','input','hr','meta','link','source','area','base','col',
        'embed','param','track','wbr','path','circle','rect','line','polyline',
        'polygon','stop','use','ellipse','marker'}
TAG = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(/?)>')

def walk(s):
    d = 0
    for m in TAG.finditer(s):
        closing, name, attrs, selfclose = m.groups()
        yield m.start(), d, m
        if name.lower() in VOID or selfclose:
            continue
        d += -1 if closing else 1

def balance(s):
    d = 0
    for _, _, m in walk(s):
        closing, name, _, selfclose = m.groups()
        if name.lower() in VOID or selfclose:
            continue
        d += -1 if closing else 1
    return d

QW = re.compile(r'[ \t]*<details[^>]*>\s*<summary[^>]*>[^<]*Quick Wins.*?</details>\s*',
                re.S | re.I)
HEAD  = re.compile(r'<h[1-6][^>]*>([^<]*)</h[1-6]>')
LEAD  = re.compile(r'<p[^>]*>([^<]{0,160})</p>')
QUIZWORD = re.compile(r'(?i)test your|quick check|knowledge check'
                      r'|check your|\bquiz\b')
BREAK = re.compile(r'<div class="section-break"><span>([^<]*)</span></div>')

def move(path, dry=False):
    s = open(path).read()
    head, sep, body = s.partition('<div class="prose">')
    if not sep:
        return 'no prose region'
    m = QW.search(body)
    if not m:
        return 'no quick-wins block'
    block = m.group()
    qs = [q.start() for q in re.finditer(r'class="quiz-question"', body)]
    if not qs:
        return 'no quiz to anchor on'
    gap = len(body) * 0.05
    cluster = qs[0]
    for a, b2 in zip(qs, qs[1:]):
        if b2 - a > gap:
            cluster = b2

    stripped = body[:m.start()] + body[m.end():]
    qpos = cluster - len(block) if cluster > m.start() else cluster

    tops = [pos for pos, d, _ in walk(stripped[:qpos]) if d == 0]
    if not tops:
        return 'no top-level boundary before the quiz'
    best = tops[-1]
    # The assessment usually opens with a banner or two -- a section break, a
    # heading, sometimes a one-line "test your understanding of X" lead-in --
    # before the container itself. Walk back over every consecutive sibling
    # that reads as assessment framing, so the action block lands above the
    # whole block rather than wedged between a banner and the quiz it labels.
    for prev in reversed(tops[:-1]):
        b = (BREAK.match(stripped, prev) or HEAD.match(stripped, prev)
             or LEAD.match(stripped, prev))
        if b and QUIZWORD.search(b.group(1)):
            best = prev
        else:
            break
    if best == m.start():
        return 'already in place'

    out = head + sep + stripped[:best] + block + stripped[best:]
    if balance(out) != balance(s):
        return 'REFUSED: tag balance would change'
    if len(out) != len(s):
        return f'REFUSED: length changed {len(s)} -> {len(out)}'
    if not dry:
        open(path, 'w').write(out)
    return 'moved'

if __name__ == '__main__':
    dry = '--dry' in sys.argv
    ok = skip = 0
    for f in sorted(glob.glob('education/curriculum/*/*.html')):
        r = move(f, dry)
        if r == 'moved':
            ok += 1
        else:
            skip += 1
            print(f'  {f.split("/")[-1][:-5]:<38} {r}')
    print(f'\nmoved: {ok}   left alone: {skip}   {"(dry)" if dry else ""}')
