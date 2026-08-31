# -*- coding: utf-8 -*-
"""Localise a numeric-only text node.

The extractor only yields a text node that contains two consecutive ASCII
letters, so a table cell reading "66.7%" or "$48.50" is never a translatable
segment and shipped to every locale in English punctuation -- a German page
showing "1.33x" and "66.7%" where "1,33x" and "66,7 %" is correct.

These are not translations; they are number formatting, and formatting is
deterministic. This module rewrites such a node for a target locale and
returns None for anything it is not certain about, which is most things:
ranges ("10-15%"), ratios ("2:1"), arrows, comparisons, magnitude suffixes
("$250K") and bare integers all come back None and ship unchanged.

Conventions are the corpus's own, measured from the translated prose rather
than assumed -- grouping and decimal characters, which side the dollar sign
sits on, and whether the percent sign takes a space, leads, or neither.
"""
import re

# dec / grp: decimal and grouping characters
# cur:       '{n} $' | '${n}' | '{n}ドル' | '{n} دولار'
# pct:       '{n} %' | '{n}%' | '%{n}'
# grp_min:   fewest integer digits that get a grouping separator
LOCALE = {
    'de': dict(dec=',', grp='.',  cur='{n} $',      pct='{n} %', grp_min=4),
    'es': dict(dec=',', grp='.',  cur='{n} $',      pct='{n} %', grp_min=4),
    'fr': dict(dec=',', grp=' ',  cur='{n} $',      pct='{n} %', grp_min=4),
    'it': dict(dec=',', grp='.',  cur='{n} $',      pct='{n} %', grp_min=4),
    'pt': dict(dec=',', grp='.',  cur='{n} $',      pct='{n} %', grp_min=4),
    'nl': dict(dec=',', grp='.',  cur='${n}',       pct='{n} %', grp_min=4),
    'ru': dict(dec=',', grp=' ',  cur='{n} $',      pct='{n} %', grp_min=4),
    # Japanese punctuates numbers exactly as English does, so only the
    # currency word changes.
    'ja': dict(dec='.', grp=',',  cur='{n}ドル',     pct='{n}%', grp_min=4),
    'tr': dict(dec=',', grp='.',  cur='{n} $',      pct='%{n}', grp_min=4),
    # Hungarian leaves four-digit integers unseparated and groups from five.
    'hu': dict(dec=',', grp=' ',  cur='{n} $',      pct='{n} %', grp_min=5),
    'ar': dict(dec='.', grp=',',  cur='{n} دولار',  pct='{n} %', grp_min=4),
}

# ~ approx, sign, $, digits with English separators, R/x multiplier, percent.
# Anything else -- ':', '-' between digits, '/', '>', '=', an arrow, a K/M/B
# suffix -- fails to match and is left alone.
PURE = re.compile(r'^(~?)([-+−]?)(\$?)(\d[\d,]*(?:\.\d+)?)([Rx]?)\s?(%?)$')


def _regroup(digits, grp, grp_min):
    if len(digits) < grp_min or not grp:
        return digits
    out = []
    while len(digits) > 3:
        out.insert(0, digits[-3:])
        digits = digits[:-3]
    out.insert(0, digits)
    return grp.join(out)


def localise(text, lang):
    """Return the node rewritten for `lang`, or None to leave it in English."""
    conf = LOCALE.get(lang)
    if not conf:
        return None
    m = PURE.match(text)
    if not m:
        return None
    approx, sign, cur, number, suffix, pct = m.groups()

    # A bare integer with no grouping, no currency and no percent reads the
    # same in every locale -- and a four-digit one is as likely to be a year
    # as a quantity, so introducing a separator would be an error.
    grouped = ',' in number
    has_dec = '.' in number
    if not (grouped or has_dec or cur or pct):
        return None

    intpart, _, frac = number.replace(',', '').partition('.')
    body = _regroup(intpart, conf['grp'], conf['grp_min']) if grouped else intpart
    if has_dec:
        body += conf['dec'] + frac
    body += suffix

    if cur:
        body = conf['cur'].format(n=body)
    if pct:
        body = conf['pct'].format(n=body)

    out = approx + sign + body
    return out if out != text else None
