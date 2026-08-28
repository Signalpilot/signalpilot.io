# -*- coding: utf-8 -*-
"""Shared context for the per-lesson translation checks.

Each check answers one question about one lesson in all eleven locales. They
all need the same two things: the English strings the page actually contains,
and the table that maps each of those to its translation. The table is the
same merge the builder does -- shared memory underneath, the lesson's own file
on top -- so a check sees exactly what gets injected into the page.
"""
import json, os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
I18N = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(I18N))
sys.path.insert(0, I18N)

LANGS = ['ar', 'de', 'es', 'fr', 'hu', 'it', 'ja', 'nl', 'pt', 'ru', 'tr']


def lesson_path(slug):
    for tier in ('beginner', 'intermediate', 'advanced', 'professional'):
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


def tables(slug):
    """{lang: {english: translation}} merged the way the builder merges it."""
    out = {}
    for lang in LANGS:
        mem_p = f'{I18N}/memory/{lang}.json'
        les_p = f'{I18N}/lessons/{slug}/{lang}.json'
        mem = json.load(open(mem_p, encoding='utf-8')) if os.path.exists(mem_p) else {}
        les = json.load(open(les_p, encoding='utf-8')) if os.path.exists(les_p) else {}
        out[lang] = {**mem, **les}
    return out


def pairs(slug):
    """Yield (lang, [(english, translation), ...]) for strings on this page."""
    ks = keys(slug)
    for lang, table in sorted(tables(slug).items()):
        yield lang, [(k, table[k]) for k in ks if k in table]


def slugs():
    return sorted(os.path.basename(p)[:-5]
                  for p in glob.glob(os.path.join(ROOT, 'education/curriculum/*/*.html')))
