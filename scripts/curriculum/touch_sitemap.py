# -*- coding: utf-8 -*-
"""Refresh <lastmod> on a lesson's twelve sitemap URLs (English plus eleven locales).

Usage: python3 scripts/curriculum/touch_sitemap.py <tier>/<slug> [YYYY-MM-DD]
"""
import sys, re, xml.dom.minidom

LANGS = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
P = 'sitemap.xml'


def touch(rel, date):
    s = open(P, encoding='utf-8').read()
    want = ['education/curriculum/%s.html' % rel]
    want += ['%s/education/curriculum/%s.html' % (l, rel) for l in LANGS]
    hit = 0
    for path in want:
        pat = re.compile(r'(<url>\s*<loc>https://www\.signalpilot\.io/%s</loc>\s*<lastmod>)[^<]*(</lastmod>)'
                         % re.escape(path))
        s, n = pat.subn(lambda m: m.group(1) + date + m.group(2), s, count=1)
        hit += n
    xml.dom.minidom.parseString(s)
    open(P, 'w', encoding='utf-8').write(s)
    return hit, len(want)


if __name__ == '__main__':
    d = sys.argv[2] if len(sys.argv) > 2 else '2026-09-02'
    hit, tot = touch(sys.argv[1], d)
    print('%d of %d URLs refreshed to %s' % (hit, tot, d))
