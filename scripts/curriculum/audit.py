# -*- coding: utf-8 -*-
"""Curriculum rubric checker: score every English lesson against the audit rubric.

Tier 1 = factual / compliance defects (must fix)
Tier 2 = cross-lesson consistency drift
Tier 3 = pedagogical scaffolding gaps

Usage: python3 audit.py            -> table + totals
       python3 audit.py --json     -> worklist to $SP/audit/worklist.json
       python3 audit.py <slug>     -> detail for one lesson
"""
import re, os, sys, json, glob

ROOT = 'education/curriculum'
FILES = sorted(glob.glob(f'{ROOT}/*/*.html'))

def txt(h):
    """Visible text only - strip script/style, then tags."""
    h = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', h)
    return re.sub(r'<[^>]+>', ' ', h)

# ---- Tier 1 -----------------------------------------------------------------
FLATTERY = re.compile(
    r'(?i)(?:more than|ahead of|better than|understand[^.]{0,40}than)\s*\d{1,2}%\s*of\s*'
    r'(?:retail|traders|day traders|people)'
    r'|\b\d{1,2}%\s*of\s*(?:retail\s*)?traders\s*(?:lose|fail|blow|never|ignore)')
BASERATE = re.compile(
    r'(?i)\b(?:9[0-9]|8[0-9]|7[0-9])%\s*of\s*(?:traders|retail|day traders|people)'
    r'|\bmost traders (?:lose|fail|blow up)\b'
    r'|\bblows? up \d{1,2}% of traders\b')
VAGUE = re.compile(r'(?i)\b(?:studies show|research shows|research suggests|'
                   r'statistics show|data shows that|it\'s well documented)')
# A lesson is allowed to QUOTE a bogus statistic in order to debunk it. Lesson 62
# does exactly that with the "90% of traders lose 90% in 90 days" myth, and the
# check must not push an author into deleting the debunking.
DEBUNK = re.compile(r'(?i)no source|never been produced|nobody has ever|is a myth|'
                    r'made up|no study|unsourced|invented|has no basis')


def debunked(text, m, window=260):
    return bool(DEBUNK.search(text[m.end():m.end() + window]))
# A "case study" of a real, dated market episode (2020 COVID QE, the 2022 QT
# bear) needs no composite label -- it happened. What needs one is an invented
# PERSON: a first name carrying a possessive or a parenthetical, next to a
# case-study heading. Lessons 41 and 64 were false positives under the old rule.
CASE = re.compile(r'(?i)(real[- ]world example|real example|case study)'
                  r'[^<\n]{0,60}?\b[A-Z][a-z]{2,}(?:\'s|\u2019s)')
LABEL = re.compile(r'(?i)composite|illustrative|hypothetical|for illustration')
DISC_COMPONENT = re.compile(r'sp-disclaimer')
DISC_WORDS = re.compile(r'(?i)not financial advice|educational purposes|'
                        r'does not guarantee|no representation')

# ---- Tier 2 -----------------------------------------------------------------
AVG_R = re.compile(r'(?i)average r-multiple|\bavg\.? r\b|\baverage r\b')
PAYOFF = re.compile(r'(?i)payoff ratio')
SHARPE = re.compile(r'(?i)sharpe')
# Sharpe quoted next to a sample under 100
SMALL_SHARPE = re.compile(
    r'(?i)sharpe[^.]{0,80}?\b([1-9]\d?)\s*(?:trades|setups|examples)'
    r'|\b([1-9]\d?)\s*(?:trades|setups|examples)[^.]{0,80}?sharpe')

# ---- Tier 3 -----------------------------------------------------------------
PREREQ = re.compile(r'(?i)prerequisite')
OBJECTIVES = re.compile(r'(?i)what you\'?ll learn|learning objective|'
                        r'by the end of this lesson|in this lesson you')
TAKEAWAY = re.compile(r'(?i)key-takeaway|key takeaway')
ACTION = re.compile(r'(?i)action step|this week|exercise|practice')
INDICATOR = re.compile(r'Janus|Atlas|Plutus|Pentarch|Omnideck|Augury|'
                       r'Volume Oracle|Pilot Line')
Q_QUESTION = re.compile(r'class="quiz-question"')
Q_EXPLAIN = re.compile(r'class="quiz-explanation"')


def score(path):
    h = open(path, encoding='utf-8').read()
    t = txt(h)
    nq = len(Q_QUESTION.findall(h))
    nx = len(Q_EXPLAIN.findall(h))
    d = {
        'slug': os.path.basename(path)[:-5],
        'tier': path.split('/')[2],
        'path': path,
        # tier 1
        't1_flattery':  sum(1 for m in FLATTERY.finditer(t) if not debunked(t, m)),
        't1_baserate':  sum(1 for m in BASERATE.finditer(t) if not debunked(t, m)),
        't1_vague':     sum(1 for m in VAGUE.finditer(t) if not debunked(t, m)),
        't1_unlabelled_case': int(bool(CASE.search(t)) and not bool(LABEL.search(t))),
        't1_no_disclaimer':   int(not DISC_COMPONENT.search(h) and not DISC_WORDS.search(t)),
        't1_nonstd_disclaimer': int(not DISC_COMPONENT.search(h) and bool(DISC_WORDS.search(t))),
        # tier 2
        't2_avg_r':     len(AVG_R.findall(t)),
        't2_payoff':    len(PAYOFF.findall(t)),
        't2_small_sharpe': len([m for m in SMALL_SHARPE.finditer(t)
                                if any(g and int(g) < 100 for g in m.groups())]),
        # tier 3
        't3_no_prereq':      int(not PREREQ.search(t)),
        't3_no_objectives':  int(not OBJECTIVES.search(t)),
        't3_no_takeaway':    int(not TAKEAWAY.search(h)),
        't3_no_action':      int(not ACTION.search(t)),
        't3_no_indicator':   int(not INDICATOR.search(t)),
        't3_no_quiz':        int(nq == 0),
        't3_quiz_gap':       max(0, nq - nx),
        'nq': nq, 'nx': nx,
    }
    d['t1'] = sum(v for k, v in d.items() if k.startswith('t1_'))
    d['t2'] = d['t2_small_sharpe'] + (1 if d['t2_avg_r'] and not d['t2_payoff'] else 0)
    d['t3'] = sum(v for k, v in d.items() if k.startswith('t3_'))
    d['total'] = d['t1'] * 3 + d['t2'] * 2 + d['t3']
    return d


rows = [score(f) for f in FILES]

if len(sys.argv) > 1 and sys.argv[1] == '--json':
    os.makedirs(f"{os.environ.get('SP','.')}/audit", exist_ok=True)
    p = f"{os.environ.get('SP','.')}/audit/worklist.json"
    json.dump(rows, open(p, 'w'), indent=1)
    print('wrote', p, len(rows))
elif len(sys.argv) > 1:
    for r in rows:
        if sys.argv[1] in r['slug']:
            for k, v in r.items():
                if v or k in ('slug', 'tier'):
                    print(f'  {k:<22} {v}')
else:
    print(f"{'lesson':<44}{'T1':>4}{'T2':>4}{'T3':>4}{'wgt':>5}")
    for r in sorted(rows, key=lambda r: -r['total']):
        print(f"{r['slug']:<44}{r['t1']:>4}{r['t2']:>4}{r['t3']:>4}{r['total']:>5}")
    print('-' * 61)
    print(f"{'TOTALS ('+str(len(rows))+' lessons)':<44}"
          f"{sum(r['t1'] for r in rows):>4}{sum(r['t2'] for r in rows):>4}"
          f"{sum(r['t3'] for r in rows):>4}{sum(r['total'] for r in rows):>5}")
    clean = [r for r in rows if r['total'] == 0]
    print(f"lessons already clean: {len(clean)}")
