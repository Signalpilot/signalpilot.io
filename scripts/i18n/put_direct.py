# -*- coding: utf-8 -*-
"""Merge a {english: translation} JSON file into one locale's memory.

    python3 scripts/i18n/put_direct.py <lang> <file.json>

translate.put() reads a shared keyfile and addresses strings by index, which
is right when one person is working one page at a time and wrong the moment
two are working at once: the keyfile is global and the indices mean different
things to each of them. This addresses strings by their English text, so a
writer needs nothing but its own language's file, and two languages can never
collide because they are different files.

An existing value is kept rather than overwritten, and reported, so a merge
cannot quietly rewrite a string some other page already depends on.
"""
import os, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def merge(lang, mapping):
    p = os.path.join(ROOT, 'scripts/i18n/memory/%s.json' % lang)
    m = json.load(open(p, encoding='utf-8'))
    add = skip = 0
    conflicts = []
    for en, tr in mapping.items():
        if not isinstance(tr, str) or not tr.strip():
            raise SystemExit('%s: empty translation for %r' % (lang, en[:60]))
        if en in m:
            if m[en] == tr:
                skip += 1
            else:
                conflicts.append(en)
            continue
        m[en] = tr
        add += 1
    json.dump(m, open(p, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=0, sort_keys=True)
    return add, skip, conflicts


if __name__ == '__main__':
    lang, path = sys.argv[1], sys.argv[2]
    data = json.load(open(path, encoding='utf-8'))
    add, skip, conflicts = merge(lang, data)
    print('%s: +%d new, %d already present, %d kept as they were'
          % (lang, add, skip, len(conflicts)))
    for en in conflicts[:10]:
        print('   kept: %r' % en[:70])
