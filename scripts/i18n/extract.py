# -*- coding: utf-8 -*-
"""Pull the translatable segments out of a lesson, with stable ids.

A segment is either a text node between tags, or the value of a
human-facing attribute. Script and style contents are never touched.
Ids are positional, so the same lesson always yields the same ids and a
translation file stays valid as long as the English page does not change.
"""
import re, json, sys, hashlib

# A tag name must start with a letter (or !, /, ?), so "<10% DD" is text, not a
# tag -- and a '>' inside a quoted attribute value does not end the tag.
#
# Comments have to be matched first and on their own terms. An apostrophe
# inside one ("<!-- Ryan's case study -->") sends the quoted-attribute branch
# hunting for a closing quote that is not there, and the match then runs on
# past the comment and swallows whatever markup follows it. Everything inside
# that swallowed span stops being a segment, so it ships untranslated in every
# locale, silently, because no check can see a string that was never extracted.
TAG = re.compile(r'''(<!--.*?-->|<[a-zA-Z!/?][^>"']*(?:"[^"]*"[^>"']*|'[^']*'[^>"']*)*>)''', re.S)
ATTR = re.compile(r'\b(title|alt|aria-label|placeholder)="([^"]*)"')
# Two letters is enough: a lone "or" between two <strong> tags is a
# segment like any other, and a 3-letter floor silently left it in English.
HAS_WORDS = re.compile(r'[A-Za-z]{2}')
# The page's own description is the sentence a search result shows, and it is
# the only value in the head worth translating: the rest are URLs, dimensions
# and a colour. og:description and twitter:description repeat it word for word,
# and og:title and twitter:title repeat the <title>, so inject.py fills those
# four from the two the page already carries rather than putting four more
# copies of the same sentence through the memory.
META = re.compile(r'<meta name="description" content="([^"]*)"', re.I)
SKIP_EXACT = {'Signal Pilot', 'Discord', 'TradingView'}


NAME = re.compile(r'</?([a-zA-Z][a-zA-Z0-9]*)')
VOID = {'area','base','br','col','embed','hr','img','input','link','meta',
        'param','source','track','wbr'}


def segments(html):
    """Yield (kind, index, text). kind is 'text' or 'attr'.

    An element carrying the standard HTML translate="no" is skipped along with
    everything inside it. Bibliographies are the reason: an author's name, a
    book title and a journal title stay in English in every locale, and without
    this they enter the memory as 85 lessons' worth of strings that a checker
    then reports as untranslated leaks, once per locale, forever.
    """
    parts = TAG.split(html)
    protect = False
    notrans, notrans_tag = 0, None
    for i, seg in enumerate(parts):
        if seg.startswith('<'):
            low = seg.lower()
            if low.startswith(('<script', '<style')):
                protect = True
            elif low.startswith(('</script', '</style')):
                protect = False
            nm = NAME.match(seg)
            tag = nm.group(1).lower() if nm else None
            if notrans:
                # count nested elements of the same name so the right close ends it
                if tag == notrans_tag and not low.startswith('<!--'):
                    if low.startswith('</'):
                        notrans -= 1
                    elif tag not in VOID and not seg.rstrip().endswith('/>'):
                        notrans += 1
            elif 'translate="no"' in low and not low.startswith('</'):
                notrans, notrans_tag = 1, tag
            if not protect and not notrans:
                for m in ATTR.finditer(seg):
                    v = m.group(2).strip()
                    if v and HAS_WORDS.search(v) and not v.startswith(('http', '/', '#')):
                        yield ('attr', i, m.group(1), v)
                m = META.match(seg)
                if m and HAS_WORDS.search(m.group(1)):
                    yield ('attr', i, 'description', m.group(1).strip())
            continue
        if protect or notrans:
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
