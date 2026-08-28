# -*- coding: utf-8 -*-
"""Tier 4: does each lesson TEACH before it demands or demonstrates?

The Tier 1-3 checkers ask whether a lesson is accurate, consistent and
scaffolded. All three can pass while the lesson is still hard to follow,
because they say nothing about ORDER. A lesson can carry perfect learning
objectives, a correct case study and a well-formed action list and still open
by telling the reader to widen stops with ATR nine screens before ATR is
explained.

This checks the reading order instead, against one rule: a reader should meet
the idea before they meet a demonstration of it or an instruction based on it.

  hook          a few sentences of motivation                     fine, expected
  objectives    what the lesson will do                           fine
  teaching      the first substantial explanatory paragraph       <- the anchor
  case study    a worked story                                    belongs AFTER
  action steps  do this yourself                                  belongs AFTER

"Teaching" is the first paragraph of 260+ characters that is not narrative --
narrative is detected by the density of personal pronouns and persona names,
so a paragraph about what Marcus did does not count as having taught anything.
"""
import re, glob, sys, json

PERSONAS = ('marcus|sarah|jason|rachel|tyler|jordan|brandon|chris|amy|eric|alex|'
            'lisa|carlos|david|emma|priya|kevin|nina')
NARR = re.compile(rf'(?i)\b(he|she|his|her|him|hers|{PERSONAS})\b')
CASE = re.compile(r'(?i)case study|composite example|worked example|real[- ]world example')
ACT  = re.compile(r'(?i)quick wins?|action steps?|this week|your turn|practice this')
OBJ  = re.compile(r"(?i)what you'?ll (?:learn|master|gain)|in this lesson[:,]|"
                  r'learning objective|by the end of this lesson')

def txt(h):
    h = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'<[a-zA-Z!/?][^>]*>', ' ', h))

def profile(path):
    body = open(path).read().split('<div class="prose">', 1)[-1]
    n = len(body) or 1
    # The anchor is the first substantial non-narrative paragraph. Some lessons
    # teach in short paragraphs and lists rather than long ones, so a flat
    # 260-character floor reports them as having no teaching at all. Fall back
    # to the first paragraph over 140 characters before concluding that.
    teach = None
    for floor in (260, 140):
        for p in re.finditer(r'<p[^>]*>(.*?)</p>', body, re.S):
            t = txt(p.group(1)).strip()
            if len(t) < floor or len(NARR.findall(t)) > 2:
                continue
            teach = p.start()
            break
        if teach is not None:
            break
    def at(pat):
        m = pat.search(body)
        return m.start() if m else None
    return body, n, teach, at(CASE), at(ACT), at(OBJ)

def main(paths):
    bad = 0
    print(f'{"lesson":<38} {"case":>6} {"act":>6} {"teach":>6}  findings')
    print('-' * 84)
    for f in paths:
        body, n, teach, case, act, obj = profile(f)
        finds = []
        if teach is None:
            finds.append('NO TEACHING PARAGRAPH')
        else:
            if case is not None and case < teach:
                words = len(txt(body[case:teach]).split())
                finds.append(f'case study {words}w before teaching')
            if act is not None and act < teach:
                finds.append('action steps before teaching')
            if obj is not None and case is not None and case < obj:
                finds.append('case before objectives')
        if finds:
            bad += 1
            g = lambda x: '-' if x is None else round(x / n, 2)
            print(f'{f.split("/")[-1][:-5]:<38} {g(case):>6} {g(act):>6} {g(teach):>6}  '
                  + '; '.join(finds))
    print('-' * 84)
    print(f'lessons that demonstrate or instruct before they teach: {bad}/{len(paths)}')
    return bad

if __name__ == '__main__':
    files = sorted(glob.glob('education/curriculum/*/*.html'))
    sys.exit(1 if main(files) else 0)
