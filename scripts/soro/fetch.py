#!/usr/bin/env python3
"""Pull the Soro feed into the repo as our own JSON.

Soro serves one English feed and has no locale switch: passing lang, locale or
language returns the identical bytes. So the only way a German reader sees a
German card is if we hold the text ourselves. This script fetches the list and
every article body once and writes them to blog/api/soro.json, which is the
English source of truth the locale files are translated from.

    python3 scripts/soro/fetch.py            # fetch and write
    python3 scripts/soro/fetch.py --check    # report new slugs, write nothing

A post already in the file is left alone: its body is not refetched, the
translations keyed to it stay valid, and a cover adopted by covers.py is not
replaced by Soro's. Only new slugs are added.
"""
import json
import os
import re
import sys
import urllib.request

TOKEN = '73a35a9b-8411-466a-b8d7-3de77cf0b535'
BASE = 'https://app.trysoro.com/api/embed/' + TOKEN
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'blog', 'api', 'soro.json')


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'signalpilot-soro-sync'})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode('utf-8')


def feed():
    """The embed script carries its own list inline as var SORO_ARTICLES."""
    js = get(BASE)
    m = re.search(r'var SORO_ARTICLES = (\[.*?\]);\n', js, re.S)
    if not m:
        raise SystemExit('soro: SORO_ARTICLES not found in the embed script')
    return json.loads(m.group(1))


def body(post_id):
    d = json.loads(get(BASE + '/article/' + post_id))
    return (d.get('article') or d).get('content') or ''


def main():
    check = '--check' in sys.argv
    path = os.path.normpath(OUT)
    have = {}
    if os.path.exists(path):
        have = {p['slug']: p for p in json.load(open(path, encoding='utf-8'))['posts']}

    posts, added = [], []
    for a in feed():
        slug = a['slug']
        if slug in have:
            posts.append(have[slug])
            continue
        added.append(slug)
        posts.append({
            'slug': slug,
            'id': a['id'],
            'title': a['title'],
            'excerpt': a['excerpt'],
            'date': a['isoDate'][:10],
            'image': a['image'],
            'body': '' if check else body(a['id']),
        })

    posts.sort(key=lambda p: p['date'], reverse=True)
    print('soro: %d in the feed, %d new (%s)'
          % (len(posts), len(added), ', '.join(added) or 'none'))
    if check:
        return 1 if added else 0

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'posts': posts}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('soro: wrote %s' % os.path.relpath(path, os.getcwd()))
    return 0


if __name__ == '__main__':
    sys.exit(main())
