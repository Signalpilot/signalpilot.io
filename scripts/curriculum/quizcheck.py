# -*- coding: utf-8 -*-
"""Validate quiz explanations across the curriculum.

Replaces what an LLM reviewer would do, deterministically:
  1. every .quiz-question has exactly one .quiz-explanation
  2. the letter named in "Correct: X." matches the option with data-correct="true"
  3. every number used in an explanation appears elsewhere in the same lesson
  4. no data-explanation attributes (not extracted for i18n -> would ship as English)
  5. no banned house-rule violations (flattery, vague sourcing, metric misuse)
  6. no raw < or > inside explanation prose

Usage: python3 scripts/curriculum/quizcheck.py [slug-substring]
"""
import re, sys, glob, os

Q = re.compile(r'<div class="quiz-question".*?(?=<div class="quiz-question"|</section|</article)', re.S)
OPT = re.compile(r'<div class="quiz-option"([^>]*)>(.*?)</div>', re.S)
EXP = re.compile(r'<div class="quiz-explanation">(.*?)</div>', re.S)
LETTER = re.compile(r'Correct:\s*([A-Z])\b')
OPT_LETTER = re.compile(r'^\s*([A-Z])\)')
NUM = re.compile(r'\d[\d,.]*')
BANNED = re.compile(r'(?i)studies show|research shows|statistics show|% of (?:retail |day )?traders|'
                    r'average r-multiple|you now understand|ahead of \d')

def strip(t): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t)).strip()

def check(path):
    h = open(path, encoding='utf-8').read()
    page_nums = set(NUM.findall(re.sub(r'<div class="quiz-explanation">.*?</div>', ' ', h, flags=re.S)))
    page_nums = {n.rstrip('.,').replace(',', '') for n in page_nums}
    issues = []
    for qi, qm in enumerate(Q.finditer(h), 1):
        block = qm.group()
        exps = EXP.findall(block)
        if len(exps) == 0:
            issues.append((qi, 'MISSING', 'no .quiz-explanation')); continue
        if len(exps) > 1:
            issues.append((qi, 'DUPLICATE', f'{len(exps)} explanations')); continue
        body = exps[0]
        text = strip(body)
        # 2. letter agreement
        correct = [OPT_LETTER.match(strip(t)) for a, t in OPT.findall(block) if 'data-correct="true"' in a]
        named = LETTER.search(text)
        if named:
            if not correct:
                issues.append((qi, 'NO-KEY', f'explanation says "{named.group(1)}" but no option is data-correct="true"'))
            elif correct[0] and correct[0].group(1) != named.group(1):
                issues.append((qi, 'LETTER', f'says {named.group(1)}, key is {correct[0].group(1)}'))
        # 3. numbers not present verbatim in the lesson. These are NOT automatically
        # defects: an explanation may legitimately derive a figure (179.50 - 175.50 = 4.00,
        # 560 shares x $4.00 = $2,240). So this is a REVIEW class, adjudicated by hand,
        # not a blocker. What it must catch is a figure that is neither stated nor derivable.
        for n in NUM.findall(text):
            k = n.rstrip('.,').replace(',', '')
            if len(k) > 1 and k not in page_nums:
                issues.append((qi, 'review:NUMBER', f'"{n}" not verbatim in the lesson - confirm it is derived'))
        # 4/5/6
        if 'data-explanation' in block:
            issues.append((qi, 'ATTR', 'data-explanation present (not translatable)'))
        b = BANNED.search(text)
        if b:
            issues.append((qi, 'HOUSE', f'banned phrasing: "{b.group()}"'))
        if re.search(r'(?<![=\w"])[<>](?![/a-zA-Z!])', body):
            issues.append((qi, 'RAW-ANGLE', 'raw < or > in prose'))
    return issues

sel = sys.argv[1] if len(sys.argv) > 1 else ''
show_review = '--all' in sys.argv
total = review = 0
for f in sorted(glob.glob('education/curriculum/*/*.html')):
    if sel and sel not in f: continue
    iss = check(f)
    review += sum(1 for _, k, _ in iss if k.startswith('review:'))
    shown = iss if show_review else [i for i in iss if not i[1].startswith('review:')]
    if shown:
        print(f'{os.path.basename(f)[:-5]}')
        for qi, kind, detail in shown:
            print(f'    Q{qi:<3} {kind:<14} {detail}')
    total += len(iss)
blockers = total - review
print(f'quiz BLOCKERS: {blockers}   review items: {review}')
sys.exit(1 if blockers else 0)
