# -*- coding: utf-8 -*-
"""Pull the translatable segments out of a lesson, with stable ids.

A segment is either a text node between tags, or the value of a
human-facing attribute. Script and style contents are never touched.
Ids are positional, so the same lesson always yields the same ids and a
translation file stays valid as long as the English page does not change.
"""
import re, json, sys, hashlib

TAG = re.compile(r'(<[^>]*>)')
ATTR = re.compile(r'\b(title|alt|aria-label|placeholder)="([^"]*)"')
# Two letters is enough: a lone "or" between two <strong> tags is a
# segment like any other, and a 3-letter floor silently left it in English.
HAS_WORDS = re.compile(r'[A-Za-z]{2}')
SKIP_EXACT = {'Signal Pilot', 'Discord', 'TradingView'}


def segments(html):
    """Yield (kind, index, text). kind is 'text' or 'attr'."""
    parts = TAG.split(html)
    protect = False
    for i, seg in enumerate(parts):
        if seg.startswith('<'):
            low = seg.lower()
            if low.startswith(('<script', '<style')):
                protect = True
            elif low.startswith(('</script', '</style')):
                protect = False
            if not protect:
                for m in ATTR.finditer(seg):
                    v = m.group(2).strip()
                    if v and HAS_WORDS.search(v) and not v.startswith(('http', '/', '#')):
                        yield ('attr', i, m.group(1), v)
            continue
        if protect:
            continue
        v = seg.strip()
        if v and HAS_WORDS.search(v) and v not in SKIP_EXACT:
            yield ('text', i, None, v)


def extract(path):
    html = open(path, encoding='utf-8', errors='replace').read()
    body_at = html.find('<body')
    out, seen = [], {}
    for kind, idx, attr, val in segments(html):
        if body_at >= 0 and kind == 'text' and idx == 0:
            pass
        key = f'{kind}:{idx}' + (f':{attr}' if attr else '')
        out.append({'id': key, 'en': val})
        seen[key] = val
    return html, out


if __name__ == '__main__':
    path = sys.argv[1]
    html, segs = extract(path)
    words = sum(len(s['en'].split()) for s in segs)
    print(json.dumps({'source': path, 'count': len(segs), 'words': words,
                      'sha': hashlib.sha1(html.encode()).hexdigest()[:12],
                      'segments': segs}, ensure_ascii=False, indent=1))
