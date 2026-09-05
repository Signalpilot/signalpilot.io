# -*- coding: utf-8 -*-
"""Set every stored translation's percent sign the way its locale sets one.

    python3 scripts/i18n/pctsweep.py            # report
    python3 scripts/i18n/pctsweep.py --write    # rewrite

numfmt.set_percent is the rule; this applies it to the two places a
translation is stored, the shared memory and a lesson's own overrides.

One shape is left alone: a value laid out in a monospaced box, where a space
beside a percent sign is holding a column in place and taking it out slides
everything to its right. None of those are live -- the boxes the lessons print
their arithmetic in are not translated segments -- so this reports them and
does not touch them.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numfmt

LANGS = ['ar', 'de', 'es', 'fr', 'hu', 'it', 'ja', 'nl', 'pt', 'ru', 'tr']
COLUMNS = re.compile(r'\n|  +')


def files(lang):
    yield f'{HERE}/memory/{lang}.json'
    for p in sorted(glob.glob(f'{HERE}/lessons/*/{lang}.json')):
        yield p


def sweep(write=False):
    total = held = 0
    for lang in LANGS:
        changed = skipped = 0
        for path in files(lang):
            if not os.path.exists(path):
                continue
            table = json.load(open(path, encoding='utf-8'))
            out, dirty = {}, False
            for k, v in table.items():
                if isinstance(v, str) and ('%' in v or '％' in v):
                    if COLUMNS.search(v):
                        if numfmt.set_percent(v, lang) != v:
                            skipped += 1
                    else:
                        new = numfmt.set_percent(v, lang)
                        if new != v:
                            v, dirty = new, True
                            changed += 1
                out[k] = v
            if dirty and write:
                # Match what wrote the file: build.py flattens the shared
                # memory, translate.py indents a lesson's own overrides. A
                # different indent would rewrite every line of a nine-megabyte
                # file to change four hundred of them.
                indent = 0 if path.endswith('memory/%s.json' % lang) else 1
                json.dump(out, open(path, 'w', encoding='utf-8'),
                          ensure_ascii=False, indent=indent, sort_keys=True)
        total += changed
        held += skipped
        print('%-3s %-6s %5d rewritten   %3d monospaced, left alone'
              % (lang, numfmt.percent_form(lang), changed, skipped))
    print('\n%d values %s, %d held back' % (total, 'rewritten' if write else 'to rewrite', held))
    return total


if __name__ == '__main__':
    sweep('--write' in sys.argv)
