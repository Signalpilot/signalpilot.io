# -*- coding: utf-8 -*-
"""Build a translated page that does not live under education/.

build.py exists for the curriculum, whose pages all sit under one directory and
all get the course disclaimer. The rest of the site -- the seven indicator
pages, the tools hub, the legal pages -- is the same problem with a different
path, so this is the same three steps (memory -> inject -> verify) driven by a
repo-relative path instead of a lesson slug.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import extract
from inject import inject, LANGS
from verify import verify
from overrides import apply as apply_overrides

HERE = os.path.dirname(os.path.abspath(__file__))


def build(page, langs=None, write=True):
    """page: repo-relative path of the English page, e.g. 'pentarch/index.html'"""
    html, segs = extract(page)
    uniq = {s['en'] for s in segs}
    results = []
    for lang in (langs or LANGS):
        mem_p = f'{HERE}/memory/{lang}.json'
        mem = json.load(open(mem_p, encoding='utf-8')) if os.path.exists(mem_p) else {}
        mem = apply_overrides(page, lang, mem)
        missing = [e for e in uniq if e not in mem]
        if missing:
            results.append((lang, 'SKIP', f'{len(missing)} untranslated strings', missing[:3]))
            continue
        tmap = {s['id']: mem[s['en']] for s in segs}
        out = inject(page, lang, tmap, None, page=page)
        errs = verify(html, out, lang, None, page=page)
        if errs:
            results.append((lang, 'FAIL', '; '.join(errs[:3]), []))
            continue
        dest = os.path.join(lang, page)
        if write:
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            open(dest, 'w', encoding='utf-8').write(out)
        results.append((lang, 'OK', dest if write else '(dry run)', []))
    return results


if __name__ == '__main__':
    page = sys.argv[1]
    langs = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    for lang, status, msg, extra in build(page, langs):
        print(f'  {lang}  {status:<5} {msg}')
        for e in extra:
            print(f'          missing: {e[:70]}')
