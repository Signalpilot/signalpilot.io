# -*- coding: utf-8 -*-
"""Hold the course total to the catalogue, everywhere a page asserts it.

    python3 scripts/curriculum/total.py           move the corpus to len(index.json)
    python3 scripts/curriculum/total.py --check   exit with the number of stale files

The number of lessons in the course is typed in about a thousand places: the
badge on every lesson page in twelve languages, the meta descriptions and the
schema on the pages around them, four JavaScript assets, and the marketing site
in twelve languages again. It was typed there because for a long time it did
not move. Then it moved twice, and both times the corpus spent weeks
disagreeing with itself about how many lessons it had.

So it is a build artifact now, like the index, the glossary and the tier lines.
`education/curriculum/total.txt` records the figure the corpus currently
asserts; the catalogue decides what it should be; this file moves one to the
other and then rewrites the record.

The state file is the whole design, and it is there because the obvious version
does not work. A rule that rewrote every "N lessons" it found would rewrite the
tier counts (24, 28, 18, 15), the reading paths' own lengths, and the badge
thresholds in `badges.js` -- all of them legitimate lesson counts that are not
this one. Only the number the corpus last agreed on may move.

Two further traps, both real. A word count reads exactly like a lesson count:
Portuguese writes ~217.000 palavras and 85.000, so no rule here matches a bare
figure. And a citation reads like a count in the languages that put the noun
first: Arabic writes "the lesson 37 spent a lesson" with the numeral between
two forms of the same word, which is why a match preceded by this language's
citation form is skipped.
"""
import os, re, sys, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
CAT = 'education/curriculum/index.json'
STATE = 'education/curriculum/total.txt'
LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']

# The lesson noun in each language, as the built pages actually spell it. A
# number moves only when one of these follows it.
NOUN = {
    None: r'(?:comprehensive\s+)?lessons?\b',
    'de': r'(?:kostenlose\s+|interaktive\s+)?Lektionen\b',
    'es': r'(?:lecciones|lecci&oacute;n)\b',
    'fr': r'(?:le&ccedil;ons?|leçons?)\b',
    'it': r'lezioni?\b',
    'pt': r'aulas?\b',
    'nl': r'lessen\b',
    'ru': r'урок\w*',
    'ja': r'レッスン',
    'tr': r'ders\b',
    'hu': r'lecke\b',
    'ar': r'(?:درسًا|درساً|دروس|درس)',
}

# The citation form, where one exists: a numeral preceded by this is naming a
# lesson rather than counting them.
CITE = {
    None: r'(?:[Ll]esson|#)\s*$',
    'de': r'Lektion\s*$',
    'es': r'Lecci(?:ón|&oacute;n)\s*$',
    'fr': r'Le(?:çon|&ccedil;on)\s*$',
    'it': r'Lezione\s*$',
    'pt': r'Aula\s*$',
    'nl': r'Les\s*$',
    'ru': r'[Уу]рок\w*\s*$',
    'ja': r'レッスン\s*$',
    'tr': r'Ders\s*$',
    'hu': r'lecke\s*$',
    'ar': r'الدرس\s*$',
}

# Hungarian agrees its elative suffix with the number's own vowels, so the
# suffix is recomputed rather than carried: nyolcvanöt and kilencven are both
# front and take -ből, but kilencvenhat is back and takes -ból.
HU_BACK = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 1, 9: 0,
           10: 0, 20: 0, 30: 1, 40: 0, 50: 0, 60: 1, 70: 0, 80: 0, 90: 0, 100: 1}

ENT = re.compile(r'&(?:#\d+|#x[0-9a-fA-F]+|\w+);')


def hu_suffix(n):
    unit = n % 10
    key = unit if unit else (n % 100 if n % 100 else 100)
    return 'ból' if HU_BACK.get(key, 0) else 'ből'


def _mask(t):
    """Entity references carry digits of their own -- the badge on every quiz
    page opens with &#128221; -- so they are blanked before any number in a
    badge is read. Length is preserved so offsets stay valid."""
    return ENT.sub(lambda m: ' ' * len(m.group(0)), t)


def catalogue_total():
    return len(json.load(open(CAT, encoding='utf-8')))


def stated():
    return int(open(STATE, encoding='utf-8').read().strip())


def _badge(s, old, new, lang):
    """The lesson badge carries the slot and then the total. Only the total
    moves, and only when it currently reads as the old total. A badge with one
    number is a quiz or a related-lesson card and is left alone."""
    out, hits, pos = [], 0, 0
    for m in re.finditer(r'<span class="badge">(.*?)</span>', s, re.S):
        body = m.group(1)
        nums = list(re.finditer(r'\d+', _mask(body)))
        if len(nums) < 2 or nums[-1].group(0) != str(old):
            continue
        last = nums[-1]
        rep = body[:last.start()] + str(new) + body[last.end():]
        if lang == 'hu':
            rep = re.sub(r'(\d+)-b[őo]l',
                         lambda mm: '%s-%s' % (mm.group(1), hu_suffix(int(mm.group(1)))), rep)
        out.append(s[pos:m.start(1)]); out.append(rep)
        pos = m.end(1); hits += 1
    out.append(s[pos:])
    return ''.join(out), hits


def _one_phrase(s, old, new, lang):
    """The old total, immediately followed by this language's lesson noun and
    not preceded by its citation form."""
    pat = re.compile(r'(?<![\d.,])' + str(old) + r'([\s\u00a0]*|-)(?=' + NOUN[lang] + ')')
    cite = re.compile(CITE[lang])
    hits = [0]

    def sub(m):
        if cite.search(s[max(0, m.start() - 24):m.start()]):
            return m.group(0)
        hits[0] += 1
        return str(new) + m.group(1)
    return pat.sub(sub, s), hits[0]


def _phrase(s, old, new, lang):
    """A locale page is not wholly in its own language: the schema block on
    each one carries the English course description verbatim, and the social
    slides under <lang>/assets are the English files reached through a symlink.
    So every file is read twice, once in its own language and once in English,
    and the value constraint is what keeps the second pass safe."""
    s, hits = _one_phrase(s, old, new, lang)
    if lang is not None:
        s, more = _one_phrase(s, old, new, None)
        hits += more
    return s, hits


SKIP_DIRS = ('node_modules', '.git', 'scripts', 'content-plan',
             'INSTAGRAM_CONTENT_HUB')


def _lang(path):
    """The locale a file belongs to, from the first path segment that names
    one. Blog articles are blog/articles/<slug>/<lang>/index.html, so the
    segment is not always the first."""
    for seg in path.split(os.sep):
        if seg in LANGS:
            return seg
    return None


def files():
    """Every file on the site whose total this tool owns. The twelve education
    indexes are hubs.py's and are skipped; so is scripts/, whose documents
    carry the figure as status prose rather than as a claim to a reader."""
    out = []
    for base, dirs, names in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for name in sorted(names):
            if not name.endswith(('.html', '.js', '.md')):
                continue
            p = os.path.normpath(os.path.join(base, name))
            if p.replace(os.sep, '/').endswith('education/index.html'):
                continue
            out.append((p, _lang(p)))
    return sorted(out)


def main(argv):
    check = '--check' in argv
    new, old = catalogue_total(), stated()
    if old == new:
        print('course total %d; the corpus already agrees with the catalogue' % new)
        return 0
    touched = []
    for p, lang in files():
        s0 = open(p, encoding='utf-8').read()
        s, h1 = _badge(s0, old, new, lang)
        s, h2 = _phrase(s, old, new, lang)
        if s != s0:
            touched.append((p, h1 + h2))
            if not check:
                open(p, 'w', encoding='utf-8').write(s)
    if not check:
        open(STATE, 'w', encoding='utf-8').write('%d\n' % new)
    for p, h in touched[:25]:
        print('%-72s %d' % (p, h))
    if len(touched) > 25:
        print('... and %d more' % (len(touched) - 25))
    print()
    print('course total %d was %d; %d files %s'
          % (new, old, len(touched), 'stale' if check else 'rewritten'))
    return len(touched) if check else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
