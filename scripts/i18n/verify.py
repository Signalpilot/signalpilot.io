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
    # A tag name must start with a letter, /, ! or ? -- otherwise a raw '<'
    # in prose ("ADX < 20") makes a naive <[^>]*> swallow everything up to
    # the next '>', hiding real text from the locked-term and count checks.
    return re.sub(r'<[a-zA-Z!/?][^>]*>', ' ', h)


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


def verify(src_html, out_html, lang, rel, page=None):
    page = page or ('education/' + rel)
    errs = []
    s_txt, o_txt = _strip(src_html), _strip(out_html)

    for term in LOCKED:
        # Python's \b sits between a word and a non-word character, and Japanese
        # kana count as word characters — so \bATR\b never matches "ATRの".
        # Bound on Latin letters and digits instead, which still prevents a
        # match inside a longer English word.
        pat = (r'(?<![A-Za-z0-9])' + re.escape(term) + r'(?![A-Za-z0-9])'
               if term in WORD_BOUNDED else re.escape(term))
        # Terms written lowercase in the glossary are ordinary trade vocabulary
        # ("order flow", "dark pool"). German capitalises nouns and Turkish
        # recases them, so match those case-insensitively — what matters is that
        # the term survived, not its capitalisation. Codes and product names
        # carry uppercase and stay case-sensitive, so "CAP" is never matched by
        # the word "cap".
        flags = re.IGNORECASE if term.islower() else 0
        n_src = len(re.findall(pat, s_txt, flags))
        n_out = len(re.findall(pat, o_txt, flags))
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
    if f'/{lang}/{page}' not in out_html:
        errs.append('canonical missing or wrong')
    n_alt = out_html.count('rel="alternate" hreflang')
    if n_alt != 13:
        errs.append(f'hreflang count {n_alt} != 13')
    # Only the pages this pipeline adds the disclaimer to must carry one. It is
    # appended inside the page's own article or main, so a page with neither --
    # the password form, the printable plan template -- has nowhere to put it
    # and is not failed for that. A product or legal page carries its own
    # compliance copy and is checked against the source instead: whatever block
    # it came with must survive.
    can_host = '</article>' in src_html or '</main>' in src_html
    if page.startswith('education/') and can_host:
        if 'sp-disclaimer' not in out_html:
            errs.append('disclaimer missing')
    elif 'sp-disclaimer' in src_html and 'sp-disclaimer' not in out_html:
        errs.append('disclaimer lost')

    for b in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', out_html):
        try: json.loads(b)
        except Exception as ex: errs.append(f'JSON-LD invalid: {ex}')
    return errs
