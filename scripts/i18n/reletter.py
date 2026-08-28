# -*- coding: utf-8 -*-
"""Resolve option strings whose ONLY change is the letter prefix.

Redistributing the quiz answer keys moved option text between letters. The text
itself is unchanged, so the existing translation applies verbatim under the new
letter -- re-translating it would be wasteful and would risk drift.

A translation must keep the label INDEX (labels.py maps Latin A-H and Arabic
أبجده onto the same positions), so emit the target locale's letter at the new
index in whatever style that locale already used: "A)", "A）" or "أ)".
"""
import json, os, re, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import extract

HERE = os.path.dirname(os.path.abspath(__file__))
LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']
ARABIC = 'أبجده'
EN_OPT = re.compile(r'^([A-H])\)\s*(.+)$', re.S)
# leading label in a translation: latin or arabic letter, either paren width
TR_OPT = re.compile(rf'^([A-H]|[{ARABIC}])([\)）])(\s*)(.+)$', re.S)


def idx_of(ch):
    return 'ABCDEFGH'.index(ch) if ch in 'ABCDEFGH' else ARABIC.index(ch)


def relabel(translation, new_idx):
    """Rewrite a translated option's leading letter to new_idx, keeping style."""
    m = TR_OPT.match(translation)
    if not m:
        return None
    letter, paren, space, body = m.groups()
    if letter in 'ABCDEFGH':
        new = 'ABCDEFGH'[new_idx]
    else:
        if new_idx >= len(ARABIC):
            return None
        new = ARABIC[new_idx]
    return f'{new}{paren}{space}{body}'


def run(apply=False):
    mem = {l: json.load(open(f'{HERE}/memory/{l}.json', encoding='utf-8')) for l in LANGS}
    body_idx = {l: {} for l in LANGS}
    for l in LANGS:
        for k, v in mem[l].items():
            m = EN_OPT.match(k)
            if m:
                body_idx[l].setdefault(m.group(2).strip(), v)
    resolved = skipped = 0
    for f in sorted(glob.glob('education/curriculum/*/*.html')):
        _, segs = extract(f)
        seen = set()
        for s in segs:
            e = s['en']
            if e in seen:
                continue
            seen.add(e)
            m = EN_OPT.match(e)
            if not m:
                continue
            new_idx = idx_of(m.group(1))
            body = m.group(2).strip()
            for l in LANGS:
                if e in mem[l]:
                    continue
                src = body_idx[l].get(body)
                if not src:
                    skipped += 1
                    continue
                out = relabel(src, new_idx)
                if out is None:
                    skipped += 1
                    continue
                mem[l][e] = out
                resolved += 1
    print(f'resolved {resolved} option translations by re-lettering'
          f'{"" if apply else " (dry run)"}; {skipped} could not be resolved')
    if apply:
        for l in LANGS:
            json.dump(mem[l], open(f'{HERE}/memory/{l}.json', 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=1)
        print('memory updated')


run(apply='--apply' in sys.argv)
