# -*- coding: utf-8 -*-
"""Shared context for the per-lesson translation checks.

Each check answers one question about one lesson in all eleven locales. They
all need the same two things: the English strings the page actually contains,
and the table that maps each of those to its translation. The table is the
same merge the builder does -- shared memory underneath, the lesson's own file
on top -- so a check sees exactly what gets injected into the page.
"""
import json, os, re, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
I18N = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(I18N))
sys.path.insert(0, I18N)

# Elements that do not break the run of text around them, so a word before
# one and a word after it really are neighbours in the sentence.
INLINE = {'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'del', 'dfn',
          'em', 'i', 'ins', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span',
          'strong', 'sub', 'sup', 'time', 'u', 'var'}

LANGS = ['ar', 'de', 'es', 'fr', 'hu', 'it', 'ja', 'nl', 'pt', 'ru', 'tr']


TIERS = ('beginner', 'intermediate', 'advanced', 'professional')


def lesson_path(slug):
    for tier in TIERS:
        p = os.path.join(ROOT, 'education', 'curriculum', tier, slug + '.html')
        if os.path.exists(p):
            return p
    raise SystemExit(f'no lesson named {slug}')


def keys(slug):
    """Every English string the page contains, in document order."""
    from extract import extract
    _, segs = extract(lesson_path(slug))
    seen, out = set(), []
    for s in segs:
        if s['en'] not in seen:
            seen.add(s['en'])
            out.append(s['en'])
    return out


# Shared memory is about thirty-four thousand entries per locale and does not
# change while a process runs, but tables() is called once per check per lesson
# -- seven checks across seventy-six lessons reloaded eleven files each, which
# is nearly six thousand loads of two and a half megabytes, and is why
# run.py --all never finished in a usable time. Load each one once.
_MEM = {}


def _memory(lang):
    if lang not in _MEM:
        p = f'{I18N}/memory/{lang}.json'
        _MEM[lang] = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    return _MEM[lang]


def tables(slug):
    """{lang: {english: translation}} merged the way the builder merges it."""
    out = {}
    for lang in LANGS:
        les_p = f'{I18N}/lessons/{slug}/{lang}.json'
        les = json.load(open(les_p, encoding='utf-8')) if os.path.exists(les_p) else {}
        mem = _memory(lang)
        out[lang] = {**mem, **les} if les else mem
    return out


def pairs(slug):
    """Yield (lang, [(english, translation), ...]) for strings on this page."""
    ks = keys(slug)
    for lang, table in sorted(tables(slug).items()):
        yield lang, [(k, table[k]) for k in ks if k in table]

def built(slug):
    """Yield (lang, visible text) for each locale page that has been built.

    A check that only sees string pairs cannot see what happens where two
    strings meet. The Turkish education index once read "olası olası piyasa
    senaryolarını" because a bolded word and the segment after it both carried
    it, and each string on its own was correct.

    Only inline elements let their neighbours fuse. Two table cells reading
    "never" are not a stutter, so every block boundary gets a bar that no
    same-line pattern can cross.
    """
    from verify import _strip
    rel = os.path.relpath(lesson_path(slug), os.path.join(ROOT, 'education'))
    for lang in LANGS:
        p = os.path.join(ROOT, lang, 'education', rel)
        if os.path.exists(p):
            h = re.sub(r'<(/?)([a-zA-Z][\w-]*)([^>]*)>',
                       lambda m: ('' if m.group(2).lower() in INLINE else '\u2502')
                                 + m.group(0), open(p, encoding='utf-8').read())
            yield lang, _strip(h)


def slugs():
    # Only the four tier directories. The glob used to be curriculum/*/*.html,
    # which also swept in curriculum/_merged/ and curriculum/_staging/ -- and
    # lesson_path() looks in the tiers only, so the first of those raised
    # SystemExit and run.py --all died before it had checked anything. The
    # corpus-wide sweep has to walk the same set lesson_path() can resolve.
    return sorted(os.path.basename(p)[:-5]
                  for tier in TIERS
                  for p in glob.glob(os.path.join(ROOT, 'education/curriculum', tier, '*.html')))
