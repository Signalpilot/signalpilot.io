# -*- coding: utf-8 -*-
"""Negative control for structure.py.

A checker that reports nothing is indistinguishable from a checker that has
gone blind, and the first version of structure.py was wrong in both directions
at once: it reported 26 lessons, most of which were correctly ordered, while
the rule it claimed to enforce was never tested against a known violation.

So this takes a lesson that is correctly ordered, breaks it in three specific
ways, and asserts that each break is caught. Run it whenever structure.py
changes.

  control        untouched                      -> no findings
  case-first     case study hoisted to the top  -> case before teaching
  act-first      quick wins hoisted to the top  -> action steps before teaching
  no-teaching    every explanatory block removed  -> no teaching section

Lesson 78 is the fixture on purpose: it teaches its five-layer risk stack in
52 short paragraphs and 58 list items, so it is exactly the shape that the
naive "first long paragraph" anchor got wrong.
"""
import os, re, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import structure as S

FIXTURE = 'education/curriculum/professional/78-professional-risk-systems.html'
CASE_MARK = 'COMPOSITE CASE STUDY'
NEXT_PART = '<div class="section-break"><span>Part 2'


def findings(path):
    body, n, teach, case, act, obj = S.profile(path)
    out = []
    if teach is None:
        out.append('no teaching section')
    else:
        if case is not None and case < teach:
            out.append('case before teaching')
        if act is not None and act < teach:
            out.append('action steps before teaching')
    if obj is not None and case is not None and case < obj:
        out.append('case before objectives')
    return out


def build(tmp, name, prose, head):
    p = os.path.join(tmp, name + '.html')
    open(p, 'w', encoding='utf-8').write(head + '<div class="prose">' + prose)
    return p


def main():
    raw = open(FIXTURE, encoding='utf-8').read()
    head, prose = raw.split('<div class="prose">', 1)

    i = prose.find(CASE_MARK)
    j = prose.find(NEXT_PART, i)
    blk_start = prose.rfind('<div', 0, i)
    case_block = prose[blk_start:j]

    k = prose.find('Quick Wins for Tomorrow')
    ks = prose.rfind('<details', 0, k)
    ke = prose.find('</details>', k) + len('</details>')
    act_block = prose[ks:ke]

    # Strip explanation everywhere, not just before the case study: leaving the
    # case study's own sub-sections intact means teaching is simply found later,
    # which is 'case before teaching', not 'no teaching section'.
    stripped = re.sub(r'(?is)<(p|li|pre|blockquote|td|dd)\b[^>]*>.*?</\1>', '', prose)

    cases = [
        ('control',     prose,                                          set()),
        ('case-first',  case_block + prose[:blk_start] + prose[j:],      {'case before teaching'}),
        ('act-first',   act_block + prose[:ks] + prose[ke:],             {'action steps before teaching'}),
        ('no-teaching', stripped,                                        {'no teaching section'}),
    ]

    bad = 0
    with tempfile.TemporaryDirectory() as tmp:
        for name, body, must in cases:
            got = set(findings(build(tmp, name, body, head)))
            ok = (not got) if not must else must <= got
            if not ok:
                bad += 1
            exp = ', '.join(sorted(must)) or 'clean'
            act = ', '.join(sorted(got)) or 'clean'
            print(f'{"ok  " if ok else "FAIL"} {name:<12} expected {exp:<32} got {act}')
    print('-' * 84)
    print('structure.py self-test:', 'passed' if not bad else f'{bad} FAILED')
    return bad


if __name__ == '__main__':
    sys.exit(1 if main() else 0)
