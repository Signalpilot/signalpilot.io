# -*- coding: utf-8 -*-
"""Flag translated strings left identical to the English source.

A value equal to its key is only legitimate when the English is entirely made
of things that never translate: locked terms, numbers, punctuation, emoji and
ticker symbols. The residue test below strips those automatically.

What it cannot know is that a WORD is spelled the same in both languages
("Session" in German, "Tokyo" in French). Those live in checks/reviewed.json
as {"<english string>": ["lang", ...]}. Anything not on that list is an
unreviewed suspect and fails the run, so a pass here means every identical
string has actually been looked at.
"""
import json, os, re, sys, ctx
from glossary import LOCKED

TICKERS = ['SPY','QQQ','AAPL','BTC','ES','NQ','MTF','WR','R','A','B','C','D','K']
NOTRANS = sorted(set(LOCKED) | set(TICKERS), key=len, reverse=True)

def residue(s):
    # Entity names are markup, not words. Without this, '&minus;12%' leaves the
    # letters of "minus" behind and a bare percentage looks like untranslated
    # prose; likewise '&times;' inside a formula.
    s = re.sub(r'&(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#x[0-9A-Fa-f]+);', ' ', s)
    for t in NOTRANS:
        # A term written lowercase in the glossary is ordinary trade vocabulary,
        # and verify.py already matches it case-insensitively because German
        # capitalises nouns and a table label capitalises its first word. Strip
        # it the same way here, or "Market makers" leaves a residue and a
        # correctly locked term reads as an untranslated one. Codes and product
        # names carry uppercase and stay case-sensitive, so "CAP" is never
        # stripped by the word "cap".
        # An English plural of a locked term is still the locked term, so
        # "Market makers" and "backtests" must strip as cleanly as their
        # singulars. Only lowercase trade vocabulary takes the plural; a code
        # like CAP or a product name does not.
        tail = r's?' if t.islower() else r''
        flags = re.IGNORECASE if t.islower() else 0
        s = re.sub(r'(?<![A-Za-z0-9])' + re.escape(t) + tail + r'(?![A-Za-z0-9])',
                   ' ', s, flags=flags)
    return re.sub(r'[^A-Za-z]', '', s)


REV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reviewed.json')
reviewed = json.load(open(REV_PATH, encoding='utf-8')) if os.path.exists(REV_PATH) else {}


def run(slug, report=print):
    unreviewed = 0
    for lang, ps in ctx.pairs(slug):
        for k, v in ps:
            if k == v and len(residue(k)) > 2 and lang not in reviewed.get(k, []):
                report(f'  {lang}: identical to English -> {k[:90]!r}')
                unreviewed += 1
    return unreviewed


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
