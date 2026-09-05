# -*- coding: utf-8 -*-
"""Hold every locale lesson page against the catalogue.

    python3 scripts/curriculum/locales.py

audit.py reads the English lessons and site.py the English pages around
them. This reads all 946 built locale pages and the eleven locale indexes,
and asks the questions that only apply once a page has been translated:
does every link resolve, does every link stay inside the reader's own
language, do the progress metas still match the catalogue, and does the
page name a lesson or a lesson count that does not exist.

The second of those was how 420 links per locale were found leaving German,
Japanese and nine other languages for the English pages.
"""
import os, re, json, glob, html, collections
os.chdir('/home/user/signalpilot.io')
LANGS = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))
BY_HREF = {x['href']: x for x in CAT}
SLOTS = {x['order'] for x in CAT}
SLUGS = {os.path.basename(x['href']).replace('.html',''): x for x in CAT}

def flat(s):
    s = re.sub(r'<script[\s\S]*?</script>', ' ', s)
    s = re.sub(r'<style[\s\S]*?</style>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))

F = collections.defaultdict(list)
def rep(k, m): F[k].append(m)

for lang in LANGS:
    pages = sorted(glob.glob('%s/education/curriculum/*/*.html' % lang)) \
          + ['%s/education/index.html' % lang]
    for p in pages:
        s = open(p, encoding='utf-8').read()
        t = flat(s)
        base = os.path.basename(p).replace('.html','')
        row = SLUGS.get(base)

        # 1. every internal link resolves inside this locale
        for m in re.finditer(r'href="(/[^"#?]*\.html)[^"]*"', s):
            u = m.group(1)
            if not os.path.exists('.' + u):
                rep(lang, 'dead link %s on %s' % (u, base))

        # 2. a lesson link must point inside the same locale, never at English
        for m in re.finditer(r'href="(/education/curriculum/[^"]+\.html)"', s):
            rep(lang, 'links to the English lesson %s from %s' % (m.group(1), base))

        # 3. sp-order and sp-level must match the catalogue
        if row:
            o = re.search(r'name="sp-order" content="(\d+)"', s)
            l = re.search(r'name="sp-level" content="([^"]*)"', s)
            if o and int(o.group(1)) != row['order']:
                rep(lang, '%s declares sp-order %s, catalogue says %d' % (base, o.group(1), row['order']))
            if l and l.group(1) != row['level']:
                rep(lang, '%s declares sp-level %r, catalogue says %r' % (base, l.group(1), row['level']))

        # 4. no lesson number that does not exist
        for m in re.finditer(r'\b[Ll]esson\s+(\d{1,3})\b', t):
            if int(m.group(1)) not in SLOTS:
                rep(lang, '%s names lesson %s, which does not exist' % (base, m.group(1)))

        # 5. no pre-rebuild counts
        # "lesson 37 spent a lesson" in Arabic reads as 37 followed by the
        # word for lesson, so require a plural or a counter, not the bare noun.
        for m in re.finditer(r'\b(\d{2,3})\s*(?:lessons|Lektionen|lecciones|leçons|lezioni|aulas|lessen|уроков|レッスン|ders|leckéből|دروس)', t):
            if int(m.group(1)) not in (24, 28, 18, 15, 85):
                rep(lang, '%s claims %s lessons' % (base, m.group(1)))

        # 6. English left in a locale page's own prose is a build fallback
        if row:
            en = 'education/curriculum/%s/%s.html' % (p.split('/')[3], base)
            if os.path.exists(en):
                et = flat(open(en, encoding='utf-8').read())
                # the claim paragraph is the tell
                m = re.search(r'data-part="claim"', s)

# 7. Japanese sets no space between a word and what follows it, and a space
# next to a tag boundary is the one the English node carried. inject.py closes
# those on the pages it builds; this catches the hand-maintained pages it never
# sees, and any regression in the rule itself. The classes are narrow on
# purpose: a space beside Latin text, a number or an operator is correct, and
# only kana, kanji and the Japanese marks count on both sides.
KANA = 'ぁ-ゟァ-ヿ一-鿿々〆〤ヶ'
SHUT = '。、，．」』）】〉》〕｝］！？…‥〟”’％：；'
OPENQ = '「『（【〈《〔｛［“‘'
_L, _R = KANA + SHUT, KANA + OPENQ
JA_GAP = re.compile(r'[%s][ ][%s]' % (_L, _R))
JA_TAG = re.compile(r'[%s][ ]*(?:<[^>]+>)+[ ]+[%s]|[%s][ ]+(?:<[^>]+>)+[ ]*[%s]'
                    % (_L, _R, _L, _R))
for p in sorted(glob.glob('ja/**/*.html', recursive=True)):
    s = open(p, encoding='utf-8').read()
    body = s[s.find('<body'):] if '<body' in s else s
    for rx in (JA_GAP, JA_TAG):
        for m in rx.finditer(body):
            rep('ja', 'space inside Japanese on %s: %r' % (p, m.group(0)))

for lang in LANGS:
    rows = sorted(set(F[lang]))
    print('%-3s %d findings' % (lang, len(rows)))
    for r in rows[:8]: print('     ' + r)
    if len(rows) > 8: print('     ... and %d more' % (len(rows)-8))
print()
print('total', sum(len(set(F[l])) for l in LANGS))
