# -*- coding: utf-8 -*-
"""Rebuild translation-memory values after the English page merged its own nodes.

Removing an inline <strong> or <em> from a paragraph turns two or three
translated segments into one. The words are unchanged, so the honest way to
carry the translation across is to read the paragraph back off the built locale
page, not to retranslate it -- and reading it back is also what exposes the
join defects, which is the whole reason the tags are going.

    nodes  a list, one entry per key in scripts/curriculum/.keys.json order,
           of either an int (the index of the <p> or <li> in the built page,
           counting from the claim) or a (index, cut) pair, where cut is
           'after:<tag>' or 'before:<tag>', or a list of those applied in order,
           to keep one piece of a node split by more than one tag.
    edits  {lang: [(key_index, old, new), ...]} applied after extraction, for
           the places where the English wording genuinely changed.

Every substitution is asserted to hit exactly once, so a stale expectation is
a failure rather than a silent no-op.
"""
import re, json, os

PS = re.compile(r'<(p|li)\b[^>]*>(.*?)</\1>', re.S)
STRIP = re.compile(r'</?(?:strong|em)>')
LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']
HERE = os.path.dirname(os.path.abspath(__file__))


def _nodes(path):
    s = open(path, encoding='utf-8').read()
    return [m.group(2) for m in PS.finditer(s[s.find('data-part="claim"'):])]


def _one(raw, cut):
    # a node split by two tags needs two cuts, applied in order
    for c in ([cut] if isinstance(cut, str) else (cut or [])):
        how, tag = c.split(':', 1)
        # cut before stripping: STRIP would remove the tag we are cutting on
        raw = raw.split(tag, 1)[1] if how == 'after' else raw.split(tag, 1)[0]
    return STRIP.sub('', raw).strip()


def _guard(rel, keys):
    # .keys.json is regenerated per lesson and is easy to forget. Merging with a
    # previous lesson's key file writes this lesson's text under those keys and
    # silently corrupts them, so refuse unless every key is in this lesson.
    en = open(os.path.join(HERE, '..', '..', 'education', 'curriculum',
                           rel + '.html'), encoding='utf-8').read()
    missing = [k for k in keys if k not in en]
    if missing:
        raise SystemExit('.keys.json does not belong to %s: %d of %d keys absent, '
                         'first is %r\nRun translate.py keys <slug> first.'
                         % (rel, len(missing), len(keys), missing[0][:70]))


def merge(rel, nodes, edits=None, extra=None, langs=None):
    """rel e.g. 'beginner/05-why-anyone-quotes'. extra: {lang: [values]} appended."""
    keys = json.load(open(os.path.join(HERE, '.keys.json'), encoding='utf-8'))
    _guard(rel, keys)
    edits, extra = edits or {}, extra or {}
    for lang in (langs or LANGS):
        vals = []
        ns = _nodes('%s/education/curriculum/%s.html' % (lang, rel))
        for spec in nodes:
            idx, cut = spec if isinstance(spec, (tuple, list)) else (spec, None)
            vals.append(_one(ns[idx], cut))
        vals += list(extra.get(lang, []))
        for i, old, new in edits.get(lang, []):
            assert vals[i].count(old) == 1, (lang, i, vals[i].count(old), old[:60])
            vals[i] = vals[i].replace(old, new)
        assert len(vals) == len(keys), (lang, len(vals), len(keys))
        for v in vals:
            assert '<' not in v, (lang, v[:80])
        p = os.path.join(HERE, '..', 'i18n', 'memory', '%s.json' % lang)
        p = os.path.normpath(p)
        m = json.load(open(p, encoding='utf-8'))
        for k, v in zip(keys, vals):
            m[k] = v
        json.dump(m, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
        print('%s ok' % lang)
