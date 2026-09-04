# -*- coding: utf-8 -*-
"""Hold the education JavaScript against the catalogue.

    python3 scripts/curriculum/sitejs.py

Lesson URLs, slugs and lesson totals typed into a script drift exactly as
they do in a page, and fail more quietly: a wrong URL is a click into a
404, a wrong total is a milestone that never fires. Both had happened.
"""
import os, re, json, glob, collections
os.chdir('/home/user/signalpilot.io')
CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))
HREFS = {x['href'] for x in CAT}
SLOTS = {x['order'] for x in CAT}
SLUGS = {os.path.basename(x['href']).replace('.html','') for x in CAT}

F = collections.defaultdict(list)
for p in sorted(glob.glob('education/assets/*.js')) + sorted(glob.glob('education/*.html')):
    s = open(p, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'["\'](/education/curriculum/\w+/[\w-]+\.html)["\']', s):
        if m.group(1) not in HREFS:
            F[p].append(('href', m.group(1)))
    for m in re.finditer(r'["\'](\d{2}-[a-z0-9-]{4,})["\']', s):
        if m.group(1) not in SLUGS:
            F[p].append(('slug', m.group(1)))
    for m in re.finditer(r'\btotal(?:Lessons|Count)?\s*[:=]\s*(\d{2,3})\b', s):
        if int(m.group(1)) not in (85, 24, 28, 18, 15):
            F[p].append(('total', m.group(0)))
    for m in re.finditer(r'\b(?:TOTAL_LESSONS|LESSON_COUNT|totalLessons)\s*[:=]\s*(\d+)', s):
        if int(m.group(1)) != 85:
            F[p].append(('const', m.group(0)))
n = 0
for p, rows in F.items():
    seen = set(); out = []
    for k, v in rows:
        if (k, v) in seen: continue
        seen.add((k, v)); out.append((k, v))
    print('%s' % p)
    for k, v in out[:12]: print('    [%-5s] %s' % (k, v))
    if len(out) > 12: print('    ... and %d more' % (len(out)-12))
    n += len(out)
print()
print('%d findings' % n)
