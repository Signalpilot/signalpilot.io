# -*- coding: utf-8 -*-
"""Translate one academy lesson into one locale.

Used by hand, one locale at a time, because translation is written rather than
generated. The two helpers are what make it safe:

    python3 scripts/curriculum/translate.py keys <slug>
        Prints every string in the lesson that is missing from at least one
        locale's memory, numbered. That numbering is the contract: the same
        index means the same English string for every locale, so one key list
        serves all eleven.

    from translate import put
    put('de', {0:'...', 1:'...'})
        Merges a locale's translations into scripts/i18n/memory/<locale>.json.
        An entry that already exists with a DIFFERENT value is kept, not
        overwritten, and reported -- memory is shared across all 85 lessons and
        a silent overwrite would change other pages.

Then:  python3 scripts/i18n/build.py curriculum/<tier>/<slug>.html <locale>
       python3 scripts/i18n/checks/run.py <slug>
"""
import glob, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEYFILE = os.path.join(ROOT, 'scripts/curriculum/.keys.json')
LOCALES = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']


def lesson_path(slug):
    hits = glob.glob(os.path.join(ROOT, f'education/curriculum/*/{slug}.html'))
    if not hits:
        raise SystemExit(f'no lesson matching {slug}')
    return hits[0]


def keys(slug, write=True):
    """Strings missing from at least one locale, in document order."""
    sys.path.insert(0, os.path.join(ROOT, 'scripts/i18n'))
    from extract import extract
    _, segs = extract(lesson_path(slug))
    seen = []
    for s in segs:
        if s['en'] not in seen:
            seen.append(s['en'])
    mem = {L: json.load(open(os.path.join(ROOT, f'scripts/i18n/memory/{L}.json'), encoding='utf-8'))
           for L in LOCALES}
    todo = [u for u in seen if any(u not in mem[L] for L in LOCALES)]
    if write:
        json.dump(todo, open(KEYFILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return seen, todo, mem


def put(locale, d):
    p = os.path.join(ROOT, f'scripts/i18n/memory/{locale}.json')
    m = json.load(open(p, encoding='utf-8'))
    K = json.load(open(KEYFILE, encoding='utf-8'))
    add = skip = 0
    conflicts = []
    for i, tr in d.items():
        en = K[int(i)]
        if en in m:
            if m[en] != tr:
                conflicts.append((i, en))
            else:
                skip += 1
            continue
        m[en] = tr
        add += 1
    json.dump(m, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print(f'{locale}: +{add} new, {skip} already present (memory now {len(m)})')
    for i, en in conflicts:
        print(f'   kept the existing translation at {i}: {en[:60]!r}')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'keys':
        slug = sys.argv[2]
        seen, todo, mem = keys(slug)
        print(f'{len(seen)} unique strings; {len(todo)} missing in at least one locale')
        for L in LOCALES:
            n = sum(1 for u in todo if u not in mem[L])
            if n:
                print(f'  {L}: {n} missing')
        print()
        for i, t in enumerate(todo):
            print(f'{i}|{t}')
    else:
        print(__doc__)
