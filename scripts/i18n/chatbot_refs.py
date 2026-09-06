# -*- coding: utf-8 -*-
"""Expand lesson placeholders in a translated chatbot answer.

    from chatbot_refs import expand
    expand('de', 'Siehe {L69} und {L75}.')

A chatbot answer cites lessons by number and title, and every one of those
titles is already translated: it is the h1 of a page this locale has been
serving for weeks. Retranslating them by hand invites the drift the corpus
keeps removing -- an answer calling lesson 69 one thing and lesson 69 calling
itself another -- so a translated answer writes {L69} and this splices in the
locale's own title, its own word for "Lesson", and the catalogue's own href.

The href stays the English path on purpose. chatbot.js rewrites it into the
reader's tree at render time, and only there does it know which pages exist in
that language.
"""
import os, re, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CAT = json.load(open(os.path.join(ROOT, 'education/curriculum/index.json'),
                     encoding='utf-8'))
SLOT = {r['order']: r for r in CAT}

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lesson_refs import FORMAT

_MEM = {}


def _memory(lang):
    if lang not in _MEM:
        p = os.path.join(ROOT, 'scripts/i18n/memory/%s.json' % lang)
        _MEM[lang] = json.load(open(p, encoding='utf-8'))
    return _MEM[lang]


def label(lang, n):
    """"Lektion 69: Die Verzoegerung, die du entfernst", in the locale's shape."""
    r = SLOT.get(n)
    if r is None:
        raise SystemExit('no lesson %d in the catalogue' % n)
    if lang == 'en':
        return 'Lesson %d: %s' % (n, r['title'])
    title = _memory(lang).get(r['title'])
    if not title:
        raise SystemExit('%s: lesson %d title is not translated' % (lang, n))
    return FORMAT[lang] % (n, title)


def link(lang, n):
    return '[%s](%s)' % (label(lang, n), SLOT[n]['href'])


def expand(lang, text):
    """{L69} becomes a full markdown link; {T69} becomes the bare title."""
    text = re.sub(r'\{L(\d+)\}', lambda m: link(lang, int(m.group(1))), text)
    text = re.sub(r'\{T(\d+)\}',
                  lambda m: _memory(lang).get(SLOT[int(m.group(1))]['title'])
                  if lang != 'en' else SLOT[int(m.group(1))]['title'], text)
    left = re.findall(r'\{[LT]\d+\}', text)
    if left:
        raise SystemExit('unexpanded: %s' % left)
    return text


if __name__ == '__main__':
    lang = sys.argv[1]
    print(expand(lang, sys.argv[2] if len(sys.argv) > 2 else '{L1} {L69} {L100}'))
