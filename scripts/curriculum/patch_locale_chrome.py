# -*- coding: utf-8 -*-
"""Patch the renumber's chrome changes into the locale pages directly.

Rebuilding through scripts/i18n/build.py would be the right way, and it cannot
run: 72 of the moved lessons carry body strings that were never translated
(build.py skips a whole locale if any string is missing, which is why those
pages have been stale builds for some time). Translating that prose now would
be wasted -- every one of those lessons is scheduled to be rewritten.

So this replaces only the chrome, string for string, using translations already
in memory. It touches the badge, the meta line, the breadcrumb tier label and
the canonical/og/twitter/prev/next URLs. It does not touch body prose.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import renumber

LOCALES = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
# "<Level> Curriculum" per locale and tier, matching the wording already in the
# corpus rather than a pattern invented here.
CRUMB = {
 'de':{'beginner':'Lehrplan für Anfänger','intermediate':'Lehrplan für die Mittelstufe','advanced':'Lehrplan für Fortgeschrittene','professional':'Lehrplan für Profis'},
 'es':{'beginner':'Currículo para principiantes','intermediate':'Currículo intermedio','advanced':'Currículo avanzado','professional':'Currículo profesional'},
 'fr':{'beginner':'Cursus débutant','intermediate':'Cursus intermédiaire','advanced':'Cursus avancé','professional':'Cursus professionnel'},
 'it':{'beginner':'Programma per principianti','intermediate':'Programma intermedio','advanced':'Programma avanzato','professional':'Programma professionale'},
 'pt':{'beginner':'Currículo para iniciantes','intermediate':'Currículo intermédio','advanced':'Currículo avançado','professional':'Currículo profissional'},
 'nl':{'beginner':'Curriculum voor beginners','intermediate':'Curriculum gevorderd','advanced':'Curriculum expert','professional':'Curriculum professioneel'},
 'ru':{'beginner':'Программа: начальный уровень','intermediate':'Программа: средний уровень','advanced':'Программа: продвинутый уровень','professional':'Программа: профессиональный уровень'},
 'ja':{'beginner':'初級カリキュラム','intermediate':'中級カリキュラム','advanced':'上級カリキュラム','professional':'プロフェッショナル・カリキュラム'},
 'tr':{'beginner':'Başlangıç müfredatı','intermediate':'Orta seviye müfredat','advanced':'İleri seviye müfredat','professional':'Profesyonel müfredat'},
 'hu':{'beginner':'Kezdő tananyag','intermediate':'Középhaladó tananyag','advanced':'Haladó tananyag','professional':'Profi tananyag'},
 'ar':{'beginner':'المنهج للمبتدئين','intermediate':'المنهج المتوسط','advanced':'المنهج المتقدّم','professional':'المنهج الاحترافي'}}

def run(write=True):
    import chrome_i18n as C
    mem = {L: json.load(open(f'scripts/i18n/memory/{L}.json', encoding='utf-8')) for L in LOCALES}
    touched = {L: 0 for L in LOCALES}
    unresolved = []
    for r in renumber.load():
        f = r['dest']
        if not os.path.exists(f): continue
        en = open(f, encoding='utf-8').read()
        badge_en = re.search(r'<span class="badge">([^<]*Lesson\s*\d+\s*of\s*\d+)</span>', en)
        meta_en  = re.search(r'class="meta">([^<]*)', en)
        tier = r['tier']; lvl_en = tier.capitalize()
        rel = f[len('education/'):]
        for L in LOCALES:
            lf = os.path.join(L, 'education', rel)
            if not os.path.exists(lf): continue
            s = open(lf, encoding='utf-8').read(); o = s
            if badge_en and badge_en.group(1) in mem[L]:
                # Replace the FIRST badge span, which is always the lesson badge
                # (related-lesson cards come later in the document). Matching the
                # locale's own wording instead failed on Hungarian ("60. lecke a
                # 86-bol") and Turkish, whose grammar does not put the two numbers
                # either side of a single joining word.
                s = re.sub(r'<span class="badge">[^<]*</span>',
                           '<span class="badge">' + mem[L][badge_en.group(1)] + '</span>', s, count=1)
            elif badge_en: unresolved.append((L, r['new'], 'badge'))
            if meta_en and meta_en.group(1) in mem[L]:
                s = re.sub(r'(class="meta">)[^<]*', lambda m: m.group(1) + mem[L][meta_en.group(1)], s, count=1)
            elif meta_en: unresolved.append((L, r['new'], 'meta'))
            # breadcrumb: the tier link and its label
            s = re.sub(r'href="/education/(?:beginner|intermediate|advanced|professional)\.html"',
                       f'href="/education/{tier}.html"', s)
            s = re.sub(r'(<a href="/education/' + tier + r'\.html"[^>]*>)[^<]*(</a>)',
                       lambda m: m.group(1) + CRUMB[L][tier] + m.group(2), s, count=1)
            # URLs the renumber moved
            for pat, val in [(r'(rel="canonical" href="https://www\.signalpilot\.io/)[^"]*"', f'\\1{L}/education/{rel}"'),
                             (r'(property="og:url" content="https://www\.signalpilot\.io/)[^"]*"', f'\\1{L}/education/{rel}"'),
                             (r'(name="twitter:url" content="https://www\.signalpilot\.io/)[^"]*"', f'\\1{L}/education/{rel}"')]:
                s = re.sub(pat, val, s)
            if s != o:
                touched[L] += 1
                if write: open(lf, 'w', encoding='utf-8').write(s)
    return touched, unresolved

if __name__ == '__main__':
    t, u = run('--dry' not in sys.argv)
    print('locale pages patched:', t)
    print('unresolved chrome strings:', len(u))
    for x in u[:8]: print('  ', x)
