# -*- coding: utf-8 -*-
"""Fail a translated lesson that is not safe to publish."""
import re, os, sys, json
from html.parser import HTMLParser
sys.path.insert(0, os.path.dirname(__file__))
from glossary import LOCKED, WORD_BOUNDED, BANNED_SUBSTRINGS

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}


def _strip(h):
    h = re.sub(r'<script[\s\S]*?</script>', '', h)
    h = re.sub(r'<style[\s\S]*?</style>', '', h)
    return re.sub(r'<[^>]*>', ' ', h)


def _tag_errors(h):
    class P(HTMLParser):
        def __init__(s): super().__init__(convert_charrefs=True); s.st=[]; s.err=0
        def handle_starttag(s, tag, a):
            if tag not in VOID: s.st.append(tag)
        def handle_endtag(s, tag):
            if tag in VOID: return
            if tag in s.st:
                while s.st and s.st.pop() != tag: pass
            else: s.err += 1
    p = P(); p.feed(h); return p.err, len(p.st)


def verify(src_html, out_html, lang, rel):
    errs = []
    s_txt, o_txt = _strip(src_html), _strip(out_html)

    for term in LOCKED:
        # Python's \b sits between a word and a non-word character, and Japanese
        # kana count as word characters — so \bATR\b never matches "ATRの".
        # Bound on Latin letters and digits instead, which still prevents a
        # match inside a longer English word.
        pat = (r'(?<![A-Za-z0-9])' + re.escape(term) + r'(?![A-Za-z0-9])'
               if term in WORD_BOUNDED else re.escape(term))
        n_src = len(re.findall(pat, s_txt))
        n_out = len(re.findall(pat, o_txt))
        if n_src and n_out < n_src:
            errs.append(f'locked term lost: "{term}" {n_src} -> {n_out}')

    # A banned phrase is a problem when the translation introduces it. The
    # English lessons legitimately use "risk-free" to describe HFT arbitrage
    # and paper trading, and a faithful translation of that is not a defect.
    low_o, low_s = o_txt.lower(), s_txt.lower()
    for bad in BANNED_SUBSTRINGS:
        if low_o.count(bad) > low_s.count(bad):
            errs.append(f'translation introduced banned phrase: "{bad}"')

    e, openn = _tag_errors(out_html)
    se, sopen = _tag_errors(src_html)
    if e > se or openn > sopen:
        errs.append(f'tag balance worse than source: err {se}->{e}, open {sopen}->{openn}')

    # the hreflang/canonical links this pipeline adds also carry href=, so
    # compare only the links that came from the source document
    def content_hrefs(h):
        h = re.sub(r'<link rel="(?:alternate|canonical)"[^>]*>', '', h)
        return len(re.findall(r'href="', h))
    if content_hrefs(src_html) != content_hrefs(out_html):
        errs.append(f'href count changed: {content_hrefs(src_html)} -> {content_hrefs(out_html)}')

    if f'<html lang="{lang}"' not in out_html:
        errs.append('html lang not set')
    if f'/{lang}/education/{rel}' not in out_html:
        errs.append('canonical missing or wrong')
    n_alt = out_html.count('rel="alternate" hreflang')
    if n_alt != 13:
        errs.append(f'hreflang count {n_alt} != 13')
    if 'sp-disclaimer' not in out_html:
        errs.append('disclaimer missing')

    for b in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', out_html):
        try: json.loads(b)
        except Exception as ex: errs.append(f'JSON-LD invalid: {ex}')
    return errs
