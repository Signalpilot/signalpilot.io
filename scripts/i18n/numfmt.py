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
    'it': dict(dec=',', grp='.',  cur='{n} $',      pct='{n}%', grp_min=4),
    'pt': dict(dec=',', grp='.',  cur='{n} $',      pct='{n} %', grp_min=4),
    'nl': dict(dec=',', grp='.',  cur='${n}',       pct='{n}%', grp_min=4),
    'ru': dict(dec=',', grp=' ',  cur='{n} $',      pct='{n} %', grp_min=4),
    # Japanese punctuates numbers exactly as English does, so only the
    # currency word changes.
    'ja': dict(dec='.', grp=',',  cur='{n}ドル',     pct='{n}%', grp_min=4),
    'tr': dict(dec=',', grp='.',  cur='{n} $',      pct='%{n}', grp_min=4),
    # Hungarian leaves four-digit integers unseparated and groups from five,
    # and binds the percent sign to the number it suffixes: 50%-os.
    'hu': dict(dec=',', grp=' ',  cur='{n} $',      pct='{n}%', grp_min=5),
    'ar': dict(dec='.', grp=',',  cur='{n} دولار',  pct='{n}%', grp_min=4),
}

# ~ approx, sign, $, digits with English separators, an optional space, R/x
# multiplier, percent. The space is captured and re-emitted so "0.0700 R"
# comes back as "0,0700 R" rather than losing its gap.
# Anything else -- ':', '-' between digits, '/', '>', '=', an arrow, a K/M/B
# suffix -- fails to match and is left alone.
PURE = re.compile(r'^(~?)([-+−]?)(\$?)(\d[\d,]*(?:\.\d+)?)(\s?)([Rx]?)\s?(%?)$')


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
    # A quote pair -- "50.03 / 50.04" -- is two numbers, not a ratio, and a
    # German table that prints 50,04 in one column and 50.03 / 50.04 in the
    # next is inconsistent with itself. Localise it only when both halves are
    # numbers this module is already sure about.
    if ' / ' in text:
        halves = text.split(' / ')
        if len(halves) == 2 and all(PURE.match(h) for h in halves):
            done = [localise(h, lang) or h for h in halves]
            out = ' / '.join(done)
            return out if out != text else None
        return None
    m = PURE.match(text)
    if not m:
        return None
    approx, sign, cur, number, gap, suffix, pct = m.groups()

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
    body += gap + suffix

    if cur:
        body = conf['cur'].format(n=body)
    if pct:
        body = conf['pct'].format(n=body)

    out = approx + sign + body
    return out if out != text else None


# ---------------------------------------------------------------------------
# The same convention, applied to the prose around the cells.
#
# LOCALE['pct'] above formats a numeric-only table cell. Nothing ever applied
# it to the translated sentences beside those cells, so a page could print
# "66,7 %" in a cell and "66,7%" in the paragraph under it, and did -- German,
# Spanish, French and Italian were close to evenly split. These two functions
# put the rule in one place: checks/pct.py reports a sentence that disagrees
# with it and pctsweep.py rewrites one.
#
# The exception is the bound suffix: German "20%ige", Hungarian "1%-a",
# Russian "2%-й", Dutch "2%-stops". The sign binds to the number it suffixes
# in every one of those languages, so a spacing locale keeps it tight when a
# letter follows, or a hyphen and a letter. A hyphen and a *digit* is a range,
# "61,8 %-78,6 %", and takes the ordinary form on both sides.
#
# The space is an ordinary one, not a non-breaking one, because the cells it
# has to match are plain text nodes that cannot carry an entity.
GAP = r'[  ]|&nbsp;'
OCCURRENCE = re.compile(r'(\d)(?:%s)?([%%％])' % GAP)
BOUND = re.compile(r'^-?[^\W\d_]')
# The number a Turkish percent sign moves in front of has to stop at its own
# last digit. '[\d.,]*' does not: in "%2, %5 ya da" it ran from the 2 through
# the comma and the space to the second sign, and turned a list of two
# percentages into one number with a doubled sign. And a sign with a digit
# behind it is already leading that digit's number, so "53/55 %96" is a
# fraction beside a percentage, not a percentage of 55.
LEADING = re.compile(r'(\d+(?:[.,]\d+)*)(?:%s)?%%(?!\d)' % GAP)


def percent_form(lang):
    """'space', 'tight' or 'lead' -- how `lang` sets the percent sign."""
    pct = LOCALE[lang]['pct']
    return 'lead' if pct.startswith('%') else 'space' if ' ' in pct else 'tight'


def set_percent(text, lang):
    """Rewrite every percent sign in `text` into `lang`'s form."""
    form = percent_form(lang)
    if form == 'lead':
        return LEADING.sub(lambda m: '%' + m.group(1), text)

    def one(m):
        if form == 'space' and not BOUND.match(text[m.end():]):
            return m.group(1) + ' %'
        return m.group(1) + '%'

    out = OCCURRENCE.sub(one, text)
    return out.replace('％', '%') if form == 'tight' else out
