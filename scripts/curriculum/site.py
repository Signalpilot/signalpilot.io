# -*- coding: utf-8 -*-
"""Hold every page outside the lessons against the catalogue.

    python3 scripts/curriculum/site.py

audit.py checks the 85 lesson pages. This checks everything a reader meets
around them: the tier pages, the index, the library, the calculators, the
glossary and the rest. It asks the same question the guidebook asks of the
index -- does this page type a fact the catalogue already knows? Every one
of these had drifted at the renumber and none of them said so.

Checks: local links resolve; link text that cites a lesson cites the right
one; lesson counts asserted in prose match the catalogue; the pre-rebuild
register, "article" for "lesson", is gone; and no page names a slot that
does not exist.
"""
import os, re, json, glob, html, collections
os.chdir('/home/user/signalpilot.io')

CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))
BY_HREF = {x['href']: x for x in CAT}
BY_SLOT = {x['order']: x for x in CAT}

# The four tier sizes and the whole-course total are the only counts most pages
# may assert. The paths page is the exception: each card states the length of
# its own path, and those lengths are data rather than prose, so they are read
# from the file that defines them and go stale only if that file does.
PATHLEN = {len(x['lessons'])
           for x in json.load(open('education/curriculum/paths.json',
                                   encoding='utf-8'))}

# The four tier sizes and the whole-course total, read from the catalogue
# rather than typed. They were typed, as (24, 28, 18, 15, 85), and the first
# lesson added after that turned every one of them into a false finding at
# once -- which is the same defect this checker exists to catch on the pages.
import collections as _c
TIERSIZE = _c.Counter(x['level'] for x in CAT)
COUNTS = set(TIERSIZE.values()) | {len(CAT)}

def flat(s):
    s = re.sub(r'<script[\s\S]*?</script>', ' ', s)
    s = re.sub(r'<style[\s\S]*?</style>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))

PAGES = sorted(glob.glob('education/*.html')) + sorted(glob.glob('education/free/*.html')) \
      + sorted(glob.glob('education/tools/*.html')) + sorted(glob.glob('education/docs/*.html')) \
      + sorted(glob.glob('education/resources/*.html'))

# The marketing pages assert the same two totals the education pages do, and
# they were the last place to hear that either had moved. total.py could not
# reach them: it matches a figure next to the lesson noun, and the home page
# puts the number and the noun in separate elements ("100" over "lessons,
# beginner to professional") while the FAQ puts an adjective between them
# ("100 interactive lessons"). Both read as prose and neither is a pattern
# total.py can safely widen to. So they are checked here instead, against
# the catalogue rather than against a typed constant.
CLAIMS = ['index.html', 'faq.html'] + ['%s/index.html' % l for l in
         ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']]

F = collections.defaultdict(list)
def rep(p,k,m): F[p].append((k,m))

for p in PAGES:
    s = open(p, encoding='utf-8').read()
    t = flat(s)

    # 1. every local href resolves. A path built inside a JavaScript template
    # literal is not a path -- ${folder} is filled in at render time -- so it
    # is skipped rather than reported as a file nobody can find.
    for m in re.finditer(r'href="(/[^"#?]*\.(?:html|json|pdf|csv|xml|txt))[^"]*"', s):
        if '${' in m.group(1):
            continue
        if not os.path.exists('.' + m.group(1)):
            rep(p, 'dead', m.group(1))
    for m in re.finditer(r'src="(/[^"#?]*\.(?:js|css|png|jpg|jpeg|webp|svg|ico))[^"]*"', s):
        if '${' in m.group(1):
            continue
        if not os.path.exists('.' + m.group(1)):
            rep(p, 'dead-src', m.group(1))

    # 2. link text that names a lesson must name the right one
    for m in re.finditer(r'href="(/education/curriculum/\w+/(\d+)-[^"]*\.html)"[^>]*>([^<]{4,120})</a>', s):
        href, slot, shown = m.group(1), int(m.group(2)), flat(m.group(3)).strip()
        row = BY_HREF.get(href)
        if not row:
            rep(p, 'offcat', '%s links to %s, not in the catalogue' % (shown[:40], href))
            continue
        n = re.search(r'\b(?:lesson|article|#)\s*#?(\d+)\b', shown, re.I)
        if n and int(n.group(1)) != row['order']:
            rep(p, 'wrongnum', '%r points at slot %d' % (shown[:64], row['order']))
        if re.match(r'^(?:start|begin|read|view|open|go|continue|learn)\b', shown, re.I):
            continue  # a call to action, not a citation of the target's title
        words = [w for w in re.findall(r'[A-Za-z]{4,}', shown)]
        title = row['title'].lower()
        if words and not any(w.lower() in title for w in words) and len(shown) > 12:
            rep(p, 'wrongtitle', '%r but that page is %r' % (shown[:56], row['title']))

    # 3. counts of lessons asserted in prose
    for m in re.finditer(r'\b(\d{1,3})\s+(?:lessons|articles|comprehensive lessons|comprehensive articles)\b', t, re.I):
        if m.group(1) == '0':
            continue  # an empty progress placeholder that script fills in
        ok = set(COUNTS)
        if p.endswith('education/paths.html'):
            ok |= PATHLEN
        if int(m.group(1)) not in ok:
            rep(p, 'count', '%r' % t[max(0,m.start()-70):m.end()+30].strip()[:120])

    # 4. the old register
    for m in re.finditer(r'\barticles?\b', t, re.I):
        rep(p, 'register', '%r' % t[max(0,m.start()-60):m.end()+50].strip()[:110]); break

    # 5. lesson numbers named in prose that do not exist
    for m in re.finditer(r'\b[Ll]esson\s+#?(\d{1,3})\b', t):
        if int(m.group(1)) not in BY_SLOT:
            rep(p, 'noslot', 'names lesson %s, which does not exist' % m.group(1))

# 6. the two totals the marketing pages assert, held to the catalogue
WORDS_K = sum(r.get('wordCount', 0) for r in CAT) // 1000
for p in CLAIMS:
    if not os.path.exists(p):
        continue
    s6 = open(p, encoding='utf-8').read()
    for m in re.finditer(r'(\d{2,4})\s*(?:interactive\s+)?lessons\b', flat(s6)):
        if int(m.group(1)) != len(CAT):
            rep(p, 'count', 'claims %s lessons, catalogue has %d'
                            % (m.group(1), len(CAT)))
    # the stat block puts the figure and its label in separate elements
    for m in re.finditer(r'>(\d{2,4})</p>\s*<p[^>]*>\s*lessons\b', s6):
        if int(m.group(1)) != len(CAT):
            rep(p, 'count', 'stat block claims %s lessons, catalogue has %d'
                            % (m.group(1), len(CAT)))
    for m in re.finditer(r'>(\d{2,4})k</p>\s*<p[^>]*>\s*words\b', s6):
        if int(m.group(1)) != WORDS_K:
            rep(p, 'count', 'stat block claims %sk words, catalogue has %dk'
                            % (m.group(1), WORDS_K))
    for m in re.finditer(r'([\d,]{5,9})\+?\s*words\b', flat(s6)):
        if int(m.group(1).replace(',', '')) // 1000 != WORDS_K:
            rep(p, 'count', 'claims %s words, catalogue has %d,000'
                            % (m.group(1), WORDS_K))

ORDER = ['dead','dead-src','offcat','wrongnum','wrongtitle','count','register','noslot']
tot = collections.Counter()
for p in PAGES + [c for c in CLAIMS if c not in PAGES]:
    if not F[p]: continue
    seen=set(); rows=[]
    for k,m in sorted(F[p], key=lambda x: ORDER.index(x[0])):
        if (k,m) in seen: continue
        seen.add((k,m)); rows.append((k,m)); tot[k]+=1
    print('%s' % p)
    for k,m in rows[:14]: print('    [%-10s] %s' % (k,m))
    if len(rows) > 14: print('    ... and %d more' % (len(rows)-14))
print()
print('%d pages scanned, %d findings %s'
      % (len(PAGES) + len(CLAIMS), sum(tot.values()), dict(tot)))
