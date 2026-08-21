# -*- coding: utf-8 -*-
"""Build translated lessons: memory + lesson map -> injected page -> verified -> written."""
import sys, os, json, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import extract
from inject import inject, LANGS
from verify import verify

HERE = os.path.dirname(os.path.abspath(__file__))


def build(lesson_rel, langs=None, write=True):
    """lesson_rel e.g. 'curriculum/beginner/01-the-liquidity-lie.html'"""
    src = os.path.join('education', lesson_rel)
    slug = os.path.basename(lesson_rel).replace('.html', '')
    html, segs = extract(src)
    uniq = {s['en'] for s in segs}
    results = []
    for lang in (langs or LANGS):
        mem_p = f'{HERE}/memory/{lang}.json'
        les_p = f'{HERE}/lessons/{slug}/{lang}.json'
        mem = json.load(open(mem_p, encoding='utf-8')) if os.path.exists(mem_p) else {}
        les = json.load(open(les_p, encoding='utf-8')) if os.path.exists(les_p) else {}
        table = {**mem, **les}
        missing = [e for e in uniq if e not in table]
        if missing:
            results.append((lang, 'SKIP', f'{len(missing)} untranslated strings', missing[:3]))
            continue
        tmap = {s['id']: table[s['en']] for s in segs}
        out = inject(src, lang, tmap, lesson_rel)
        errs = verify(html, out, lang, lesson_rel)
        if errs:
            results.append((lang, 'FAIL', '; '.join(errs[:3]), []))
            continue
        if write:
            dest = os.path.join(lang, 'education', lesson_rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            open(dest, 'w', encoding='utf-8').write(out)
            # anything new in this lesson joins the memory for the next one
            mem.update({k: v for k, v in les.items()})
            json.dump(mem, open(mem_p, 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=0, sort_keys=True)
        results.append((lang, 'OK', dest if write else '(dry run)', []))
    return results


if __name__ == '__main__':
    rel = sys.argv[1]
    langs = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    for lang, status, msg, extra in build(rel, langs):
        print(f'  {lang}  {status:<5} {msg}')
        for e in extra: print(f'          missing: {e[:70]}')
