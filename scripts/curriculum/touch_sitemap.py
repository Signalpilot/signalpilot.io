# -*- coding: utf-8 -*-
"""Refresh <lastmod> on a page's twelve sitemap URLs (English plus eleven locales).

A page the sitemap has never seen -- a new lesson, a module quiz -- is inserted
rather than silently skipped, immediately after the same locale's entry for the
page named by --after, so the file keeps its grouping.

Usage: python3 scripts/curriculum/touch_sitemap.py <tier>/<slug> [YYYY-MM-DD]
                                                   [--after <tier>/<slug>]
"""
import sys, re, xml.dom.minidom

LANGS = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
P = 'sitemap.xml'
BLOCK = ('  <url>\n    <loc>https://www.signalpilot.io/%s</loc>\n'
         '    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n'
         '    <priority>%s</priority>\n  </url>\n')


def paths(rel):
    return (['education/curriculum/%s.html' % rel] +
            ['%s/education/curriculum/%s.html' % (l, rel) for l in LANGS])


def touch(rel, date, after=None):
    s = open(P, encoding='utf-8').read()
    want = paths(rel)
    prev = paths(after) if after else [None] * len(want)
    hit = added = 0
    for path, ref in zip(want, prev):
        pat = re.compile(r'(<url>\s*<loc>https://www\.signalpilot\.io/%s</loc>\s*<lastmod>)[^<]*(</lastmod>)'
                         % re.escape(path))
        s, n = pat.subn(lambda m: m.group(1) + date + m.group(2), s, count=1)
        hit += n
        if n or not ref:
            continue
        # New page. Put it after the reference page's entry in the same locale,
        # inheriting that entry's priority so English and locales keep theirs.
        m = re.search(r'  <url>\s*<loc>https://www\.signalpilot\.io/%s</loc>.*?</url>\n'
                      % re.escape(ref), s, re.S)
        if not m:
            continue
        pri = re.search(r'<priority>([^<]+)</priority>', m.group(0)).group(1)
        s = s[:m.end()] + BLOCK % (path, date, pri) + s[m.end():]
        added += 1
    xml.dom.minidom.parseString(s)
    open(P, 'w', encoding='utf-8').write(s)
    return hit, added, len(want)


if __name__ == '__main__':
    argv = sys.argv[1:]
    after = None
    if '--after' in argv:
        i = argv.index('--after')
        after = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    d = argv[1] if len(argv) > 1 else '2026-09-02'
    hit, added, tot = touch(argv[0], d, after)
    print('%d of %d URLs refreshed to %s, %d added' % (hit, tot, d, added))
