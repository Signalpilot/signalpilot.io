#!/usr/bin/env python3
"""Adopt hand-made cover images for the Soro auto-posts.

Soro gives every post its own image, but they are close enough in palette that
the blog grid reads as fifteen versions of one picture. This lets a real cover
replace it: drop files named after the post's slug into a directory, run this,
and the card uses yours instead.

    python3 scripts/soro/covers.py ~/Desktop/covers
    python3 scripts/soro/covers.py ~/Desktop/covers --check

A file is matched by its basename against a slug, so pentarch-cycle-phases-
explained.webp lands on that post and anything unmatched is named rather than
silently ignored. Adopted files are copied to blog/assets/soro-covers/ and
recorded in blog/api/soro.json, which localise.py then carries into all eleven
locale files. A post with no cover of ours keeps Soro's.

Run scripts/soro/localise.py afterwards so the locale cards pick the change up.
"""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
DEST = os.path.join(ROOT, 'blog', 'assets', 'soro-covers')
FEED = os.path.join(ROOT, 'blog', 'api', 'soro.json')
OK = ('.webp', '.png', '.jpg', '.jpeg', '.avif')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if not args:
        raise SystemExit('usage: covers.py <directory of images> [--check]')
    src, check = args[0], '--check' in sys.argv

    feed = json.load(open(FEED, encoding='utf-8'))
    slugs = {p['slug'] for p in feed['posts']}

    found, unmatched = {}, []
    for name in sorted(os.listdir(src)):
        stem, ext = os.path.splitext(name)
        if ext.lower() not in OK:
            continue
        if stem in slugs:
            found[stem] = os.path.join(src, name)
        else:
            unmatched.append(name)

    for name in unmatched:
        print('covers: no post called %s' % os.path.splitext(name)[0], file=sys.stderr)
    missing = sorted(slugs - set(found))
    for slug in missing:
        print('covers: still on Soro\'s image -- %s' % slug)

    print('covers: %d of %d posts have one of ours' % (len(found), len(slugs)))
    if check:
        return 1 if missing else 0

    os.makedirs(DEST, exist_ok=True)
    for slug, path in sorted(found.items()):
        ext = os.path.splitext(path)[1].lower()
        shutil.copyfile(path, os.path.join(DEST, slug + ext))
        for p in feed['posts']:
            if p['slug'] == slug:
                p['image'] = '/blog/assets/soro-covers/' + slug + ext
        print('covers: %s%s' % (slug, ext))

    with open(FEED, 'w', encoding='utf-8') as f:
        json.dump(feed, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('covers: run scripts/soro/localise.py to carry these into the locale cards')
    return 0


if __name__ == '__main__':
    sys.exit(main())
