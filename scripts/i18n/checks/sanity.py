# -*- coding: utf-8 -*-
"""Catch self-correction artifacts and doubled words in a translation.

I once wrote "(3 180 $... non : 5 150 $ économisés)" into a French string --
a mid-sentence correction that the number, script and leak checks all pass
because it invents no number, contaminates no script and is not English.
Only re-reading found it. This looks for that shape directly.
"""
import re, sys, ctx

# an ellipsis or dash followed by a correction word, in any of the 11 locales
CORRECTION = re.compile(
    r'(?:\.\.\.|…|--)\s*(?:no|non|nein|nee|não|nie|нет|いや|hayır|nem|لا|'
    r'wait|sorry|actually|correction|scratch that|rather|vielmehr|plutôt|'
    r'mejor dicho|anzi|melhor|скорее)\b', re.I)
# Japanese corrects itself without a space or a word boundary: "10,000株…では
# なく15,000株". numcheck caught one of those before this check did.
CORRECTION_JA = re.compile(r'(?:\.\.\.|…|——)\s*[^。]{0,12}?(?:ではなく|じゃなく|ではなくて)')
# the same word twice in a row (catches "the the", "de de", "は は").
# A stutter puts the repeat next to its twin -- one space, or a line wrap.
# Three or more spaces between them is column alignment inside a <pre> table
# ("yes            yes"), which is not a stutter, so the gap is bounded.
DOUBLED = re.compile(r'(?<![\w])([A-Za-zÀ-ÿА-Яа-я]{3,}|[\u0600-\u06ff]{2,})\s{1,2}\1(?![\w])', re.I)

# Reduplication that is simply correct in the language: German pronoun+article
# pairs ("die die", "sie sie", "der der"), Turkish and Italian intensifiers
# ("sik sik" = often, "adim adim" = step by step, "via via" = gradually).
OK_DOUBLES = {
    'de': {'die die', 'sie sie', 'der der', 'das das', 'dem dem', 'den den', 'was was', 'verlierer verlierer'},
    'tr': {'sik sik', 'adim adim', 'çok çok', 'uzun uzun', 'mum mum', 'ciddi ciddi', 'topu topu', 'sık sık', 'adım adım', 'yavaş yavaş', 'kat kat', 'yer yer', 'tek tek', 'tekrar tekrar', 'bir bir', 'ayrı ayrı', 'teker teker', 'kademe kademe', 'dilim dilim', 'dakika dakika', 'saat saat', 'gün gün', 'parça parça', 'azar azar', 'satır satır', 'satir satir', 'emir emir', 'fiyat fiyat', 'zaman zaman', 'fersah fersah', 'döne döne', 'birer birer', 'ikişer ikişer', 'üçer üçer', 'dörder dörder', 'beşer beşer', 'altışar altışar'},
    # French reflexives put the subject and object pronoun side by side:
    # "vous vous battez", "nous nous attendons". Grammar, not a stutter.
    'fr': {'vous vous', 'nous nous', 'se se', 'reste reste', 'sont sont'},
    'it': {'via via','passo passo','man mano','piano piano'},
    'nl': {'dat dat', 'die die', 'aan aan', 'wat wat', 'verliezers verliezers', 'het het', 'je je'},
    # Russian "что что-то" (that something) and Arabic case-marked repeats
    # ("سوق سوقًا" = one market ... another market) are grammar, not stutters.
    'ru': {'что что'},
    'ar': {'سوق سوق', 'صفاً صفاً', 'صفا صفا', 'أمراً أمراً', 'أمرا أمرا', 'أمرًا أمرًا',
           'واحداً واحداً', 'واحدا واحدا', 'اثنتين اثنتين', 'اثنين اثنين', 'ثلاثاً ثلاثاً', 'أربعاً أربعاً', 'شمعة شمعة', 'يوماً يوماً'},
    # Hungarian forms "one X after another" by repeating the noun:
    # "ügylet ügylet után" is trade after trade, not a stutter.
    'hu': {'ügylet ügylet', 'nap nap', 'az az', 'évről évre', 'lépés lépés', 'melyik melyik', 'felállás felállás', 'kitörés kitörés',
           # "hatra hatra" is six against six; "a választás választás" is
           # "the choice is a choice", predicate repeating its subject.
           'hatra hatra', 'választás választás'},
}


# Acronyms that are not in the locked glossary but still pass through unchanged
# in every locale. I once typed "FOMA" for "FOMO" in Italian: no invented
# number, no script contamination, not English -- nothing else would see it.
PASSTHROUGH = ['ChoCH', 'BOS', 'OTE',
               'SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'META', 'BTC', 'NQ']
# Deliberately NOT here: the locked glossary already guards ATR/EMA/RSI/POC/
# VWAP/CVD/HFT/FVG/HVN/LVN/OHLC/VIX, and the economic releases localise for
# real -- Spanish writes IPC for CPI and IPP for PPI -- as does FOMO, which
# Arabic renders as الخوف من فوات الفرصة in most of its memory.


# A sentence-ending period glued straight onto a digit ("gelir.100 $") is a
# lost space, not punctuation -- three of these survived every other check
# because they invent no number, lose no term and are not English.

# A doubled word that straddles an inline tag is never deliberate: the article
# before a <strong> and the article the bold itself carries are separate
# segments, each correct alone ("muestran la" + "<strong>la calidad</strong>").
# Reduplication a language actually uses -- "via via", "je je" -- is written
# inside one segment, so restricting the match to a tag boundary needs no
# whitelist and admits words of any length.
STRADDLE = re.compile(
    r'(?<![\w])([A-Za-zÀ-ÿА-Яа-я\u0600-\u06ff]{2,})'
    r'(\s*(?:</?(?:strong|b|em|i|a|code|span|mark|u)\b[^>]*>\s*){1,4})'
    r'\1(?![\w])', re.I)
SIBLING = re.compile(r'</[a-zA-Z]')

GLUED = re.compile(r'[a-zA-ZÀ-ÿА-я]\.\d')


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        for k, v in ps:
            m = GLUED.search(v)
            if m and not GLUED.search(k):
                report(f'  {lang}: period glued to a digit {m.group(0)!r}\n'
                       f'        ...{v[max(0, m.start() - 45):m.start() + 45]}...')
                bad += 1
            for name, pat in (('correction', CORRECTION),
                              ('correction', CORRECTION_JA),
                              ('doubled word', DOUBLED)):
                m = pat.search(v)
                if m and not (name == 'doubled word'
                              and m.group(0).lower() in OK_DOUBLES.get(lang, set())):
                    report(f'  {lang}: {name} {m.group(0)!r}\n'
                           f'        ...{v[max(0, m.start() - 45):m.start() + 45]}...')
                    bad += 1
            # an acronym present in the English must survive intact
            for t in PASSTHROUGH:
                pat = r'(?<![A-Za-z0-9])' + t + r'(?![A-Za-z0-9])'
                if len(re.findall(pat, k)) > len(re.findall(pat, v)):
                    report(f'  {lang}: lost acronym {t} -> {v[:90]}')
                    bad += 1
    # A stutter can also straddle two strings: the word before a <strong>
    # and the first word after it are separate segments, each correct alone.
    # Only the assembled page shows it, so read the built page as well.
    for lang, raw in ctx.built_raw(slug):
        ok = OK_DOUBLES.get(lang, set())
        for m in STRADDLE.finditer(raw):
            # A run that closes one element and opens the next spans two
            # siblings, not one sentence: the previous and next buttons at the
            # foot of every lesson are "&larr; Curriculum" and "Curriculum
            # &rarr;", which is a pair of links and not a stutter.
            if SIBLING.search(m.group(2)):
                continue
            if f'{m.group(1)} {m.group(1)}'.lower() in ok:
                continue
            report(f'  {lang}: doubled word across a tag {m.group(1)!r}\n'
                   f'        ...{" ".join(raw[max(0, m.start() - 70):m.end() + 40].split())}...')
            bad += 1
    for lang, txt in ctx.built(slug):
        ok = OK_DOUBLES.get(lang, set())
        for m in DOUBLED.finditer(txt):
            if m.group(0).lower() in ok:
                continue
            report(f'  {lang}: doubled word across the page {m.group(0)!r}\n'
                   f'        ...{" ".join(txt[max(0, m.start() - 60):m.start() + 60].split())}...')
            bad += 1
    return bad


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
