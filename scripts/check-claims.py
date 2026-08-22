# -*- coding: utf-8 -*-
"""Fail if the English source makes a claim the brand does not make.

verify.py already blocks these phrases in translated pages. This is the
same check on the English they are translated FROM, so a bad claim never
reaches the pipeline in the first place.

A phrase is legitimate when the page is denying it, quoting it as a
mistaken belief, or using the words in an unrelated sense ("no risk
system"). Those lines are listed in ALLOWED, each with the reason it
stands. Anything else is a failure.
"""
import re, sys, os, glob

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'i18n'))
from glossary import BANNED_SUBSTRINGS

# Structurally legitimate uses of the words, on any page.
ALLOWED_PATTERNS = [
    # the risk-free RATE, the standard term in a Sharpe/Sortino formula
    (r'(?:returns?|r)\s*[-\u2212]\s*risk[- ]free', 'risk-free rate in a formula'),
    (r'risk[- ]free\s*:\s*\d', 'risk-free rate, given a value'),
    # "no risk management" and friends: a missing system, not a missing risk
    (r'no risk (?:management|system|protocol|limits|controls)', 'unrelated sense'),
]

# file -> {snippet: why it is allowed to stay}
ALLOWED = {
    'education/calculators.html': {
        'bet 10% on "sure things,"': 'warns against it',
    },
    'education/curriculum/intermediate/23-market-making-hft.html': {
        'never actually risk-free': 'denies the claim',
    },
    'education/curriculum/beginner/12-paper-trading.html': {
        "can't lose anything real": 'literal fact about simulated money',
        "can't gain anything real": 'literal fact about simulated money',
    },
    'education/curriculum/beginner/20-swing-trading-framework.html': {
        'C) Swing trading has no risk since you hold longer': 'wrong quiz answer',
    },
    'education/curriculum/beginner/07-revenge-trading.html': {
        '"I\'m on fire. I can\'t lose!"': 'quoted euphoria, criticised',
    },
    'education/curriculum/beginner/09-position-sizing.html': {
        'Oversizing Because "It\'s a Sure Thing"': 'names it as mistake #3',
    },
    'education/curriculum/professional/78-professional-risk-systems.html': {
        'they have no risk system': 'unrelated sense',
        'risk 10% on a "sure thing."': 'criticises it',
    },
    'education/curriculum/professional/80-career-pathways-trading.html': {
        'don\'t promise "get rich quick"': 'disavows it',
    },
    'education/curriculum/professional/81-final-capstone-project.html': {
        'no risk limits': 'unrelated sense',
    },
}

pat = re.compile('|'.join(re.escape(p) for p in BANNED_SUBSTRINGS), re.I)

fails = 0
for path in sorted(glob.glob('education/**/*.html', recursive=True)):
    allowed = ALLOWED.get(path, {})
    for n, line in enumerate(open(path, encoding='utf-8'), 1):
        for m in pat.finditer(line):
            if any(a in line for a in allowed):
                continue
            window = line[max(0, m.start() - 40):m.end() + 40]
            if any(re.search(p, window, re.I) for p, _ in ALLOWED_PATTERNS):
                continue
            print(f'{path}:{n}: banned claim {m.group()!r}')
            print(f'    {line.strip()[:150]}')
            fails += 1

print(f'banned claims in English source: {fails}')
sys.exit(1 if fails else 0)
