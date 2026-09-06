# -*- coding: utf-8 -*-
"""Compose the glossary's "Lesson N: Title" strings from what is already there.

    python3 scripts/i18n/lesson_refs.py <lang>          report
    python3 scripts/i18n/lesson_refs.py <lang> --write  merge into the memory

94 of the glossary's 294 strings are a lesson citation: the word "Lesson", a
number, and the lesson's own title. Every one of those titles is already
translated, because it is the h1 of a page this locale has been serving for
weeks. Retranslating them by hand would invite exactly the drift the corpus
spent this session removing -- a glossary calling lesson 34 one thing and
lesson 34 calling itself another.

So they are spliced instead. The locale's own word for "Lesson", and the shape
it puts the number in, are read off the badge string every lesson page carries
rather than typed here, which is how Hungarian gets "34. lecke" and Japanese
gets no space.
"""
import os, re, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))


# How each locale writes a lesson citation. Typed rather than parsed out of
# the badge string: parsing looked clever and produced "レッスン 1／全100回:" in
# Japanese and "الدرس 1 من 100:" in Arabic, because the badge is a count and a
# citation is not. Eleven lines are cheaper than a regex that is wrong twice.
#
# The colon is the locale's own: French puts a space before it, Japanese uses
# the fullwidth form, and Hungarian puts the number first with a full stop.
FORMAT = {
    'de': 'Lektion %d: %s',
    'es': 'Lecci\u00f3n %d: %s',
    'fr': 'Le\u00e7on %d&nbsp;: %s',
    'it': 'Lezione %d: %s',
    'pt': 'Aula %d: %s',
    'nl': 'Les %d: %s',
    'ru': '\u0423\u0440\u043e\u043a %d: %s',
    'ja': '\u30ec\u30c3\u30b9\u30f3%d\uff1a%s',
    'tr': 'Ders %d: %s',
    'hu': '%d. lecke: %s',
    'ar': '\u0627\u0644\u062f\u0631\u0633 %d: %s',
}


def refs(lang):
    mem = json.load(open('scripts/i18n/memory/%s.json' % lang, encoding='utf-8'))
    fmt = FORMAT.get(lang)
    if fmt is None:
        raise SystemExit('%s: no lesson-citation format' % lang)
    out, missing = {}, []
    for r in CAT:
        en = 'Lesson %d: %s' % (r['order'], r['title'])
        title = mem.get(r['title'])
        if not title:
            missing.append(r['order'])
            continue
        out[en] = fmt % (r['order'], title)
    return out, missing


if __name__ == '__main__':
    lang = sys.argv[1]
    out, missing = refs(lang)
    if missing:
        print('%s: %d titles untranslated: %s' % (lang, len(missing), missing[:8]))
    for en in list(out)[:3]:
        print('  %r -> %r' % (en, out[en]))
    if '--write' in sys.argv:
        sys.path.insert(0, 'scripts/i18n')
        from put_direct import merge
        add, skip, conflicts = merge(lang, out)
        print('%s: +%d new, %d already present, %d kept' % (lang, add, skip, len(conflicts)))
