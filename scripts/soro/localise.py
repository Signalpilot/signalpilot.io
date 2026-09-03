#!/usr/bin/env python3
"""Write blog/api/soro.<lang>.json from the English feed plus hand translations.

Soro serves one English feed with no locale switch, so a German reader can only
see a German card if we hold the German text. The card text -- title and
excerpt -- is translated by hand, per post, in scripts/soro/locales.py. The
article body is not: 15 posts carry 21,014 words, which is 231,154 words across
eleven locales and grows with every auto-post, so the card links to the English
article and the card says so in the reader's own language.

    python3 scripts/soro/localise.py           # write the eleven locale files
    python3 scripts/soro/localise.py --check   # name posts with no translation

A post added to the feed appears here untranslated and --check names it, which
is the signal to add its two lines to locales.py.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import locales  # noqa: E402

LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar']


def main():
    check = '--check' in sys.argv
    src = json.load(open(os.path.join(ROOT, 'blog', 'api', 'soro.json'), encoding='utf-8'))
    posts = src['posts']

    missing = {}
    for lang in LANGS:
        card = locales.CARDS[lang]
        out, gap = [], []
        for p in posts:
            t = card.get(p['slug'])
            if not t:
                gap.append(p['slug'])
                continue
            out.append({
                'slug': p['slug'],
                'title': t[0],
                'excerpt': t[1],
                'date': p['date'],
                'image': p['image'],
            })
        if gap:
            missing[lang] = gap
        if check:
            continue
        path = os.path.join(ROOT, 'blog', 'api', 'soro.%s.json' % lang)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump({'lang': lang, 'ui': locales.UI[lang], 'posts': out},
                      f, ensure_ascii=False, indent=1)
            f.write('\n')
        print('soro: %s -- %d of %d posts' % (lang, len(out), len(posts)))

    if missing:
        for lang, gap in missing.items():
            print('soro: %s is missing %s' % (lang, ', '.join(gap)), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
