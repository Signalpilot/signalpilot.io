# -*- coding: utf-8 -*-
"""Every digit in a translation must be licensed by the English source.

A translated lesson can invent a number in a dozen quiet ways: a decimal
comma read as a thousands separator, a percentage rewritten from memory, a
clock time converted twice. This tokenises both sides into bare digit runs
and flags any run in the translation the English cannot produce.

Most of the file is the list of things that ARE legitimate: Japanese myriad
grouping, 12-hour to 24-hour clocks, K/M/B suffixes expanded, imperial units
converted to metric, small cardinals spelled out in English and written as
digits elsewhere.
"""
import re, sys, ctx
DIGITS=re.compile(r'\d(?:[.,  ]?\d)*')

def toks(s):
    # Japanese myriad grouping: 1万4,700 == 14700, 3万2,000 == 32000
    # and the next unit up: 5億 == 500000000. Apply 億 first so a compound
    # like 5億2,000万 collapses left to right.
    def oku(m):
        hi = float(re.sub(r'[,\u00a0 ]', '', m.group(1)))
        man = int(re.sub(r'[,\u00a0 ]', '', m.group(2))) if m.group(2) else 0
        lo = re.sub(r'[,\u00a0 ]', '', m.group(3) or '') or '0'
        return str(round(hi*100000000 + man*10000 + int(lo)))
    s = re.sub(r'(\d[\d,\u00a0 ]*(?:\.\d+)?)\u5104(?:([\d,\u00a0 ]+)\u4e07)?([\d,\u00a0 ]*)', oku, s)
    def myriad(m):
        hi = float(re.sub(r'[,\u00a0 ]', '', m.group(1)))
        lo = re.sub(r'[,\u00a0 ]', '', m.group(2) or '') or '0'
        return str(round(hi*10000 + int(lo)))
    s = re.sub(r'(\d[\d,\u00a0 ]*(?:\.\d+)?)\u4e07([\d,\u00a0 ]*)', myriad, s)
    return {re.sub(r'[.,  ]','',m.group()) for m in DIGITS.finditer(s)}

def allowed(en):
    """Every digit-string the English can legitimately turn into."""
    a=set(toks(en))
    for t in list(a):
        a.add(t.lstrip('0') or '0')
    # locales write times as 12.05 / 12,05, which normalises to one run
    for h,m in re.findall(r'(\d{1,2}):(\d{2})', en):
        a.add(f'{h}{m}'); a.add(f'{int(h)}{m}')
    # 12-hour -> 24-hour clock, e.g. 1:15 PM -> 13:15
    for h,m in re.findall(r'(\d{1,2}):(\d{2})\s*PM', en):
        if int(h)!=12: a.add(f'{int(h)+12}{m}'); a.add(str(int(h)+12))
    for h,m in re.findall(r'(\d{1,2}):(\d{2})\s*AM', en):
        a.add(f'{int(h)}{m}'); a.add(str(int(h)))
    # bare 12-hour clock: "2pm" -> 14:00, "9am" -> 09:00
    for h in re.findall(r'(\d{1,2})\s*[ap]m', en, re.I):
        for v in ({str(int(h)+12), str(int(h)+12)+'00'} if int(h) != 12 else {str(int(h))}):
            a.add(v)
        # locales spell the o'clock out: "2pm" -> "14:00" / "14.00"
        a.add('00')
    # An ISO date "2024-03-15" is written "15.03.2024" in German and Russian,
    # "2024.03.15." in Hungarian. Separator stripping collapses each into one
    # run, so allow every ordering of the same three fields.
    for y, mo, dd in re.findall(r'\b(\d{4})-(\d{2})-(\d{2})\b', en):
        for a_, b_, c_ in ((y, mo, dd), (dd, mo, y), (mo, dd, y)):
            a.add(f'{a_}{b_}{c_}')
            a.add(f'{int(a_)}{int(b_)}{int(c_)}' if a_ != y else f'{a_}{int(b_)}{int(c_)}')
    # A range shares one meridiem the way a range shares a K suffix:
    # "1-3pm" means 13:00 to 15:00, and "9:30-11am" means 09:30 to 11:00.
    for lo, hi, mer in re.findall(r'(\d{1,2})\s*[-\u2013]\s*(\d{1,2})\s*([ap])m', en, re.I):
        for h in (lo, hi):
            v = int(h) + (12 if mer.lower() == 'p' and int(h) != 12 else 0)
            a.add(str(v)); a.add(f'{v}00')
    # "$432.20-50" abbreviates the upper bound to its last two digits. Every
    # locale writes it out in full, so license the expanded figure.
    for whole, frac, hi in re.findall(r'(\d+)\.(\d{2})\s*[-\u2013]\s*(\d{2})\b', en):
        a.add(f'{whole}{hi}')
    # A US "10/23" date is written "23.10." or "23/10" almost everywhere else,
    # and the separator stripping in toks() collapses that into one run. Both
    # orders name the same day, so allow either concatenation.
    for d1, d2 in re.findall(r'\b(\d{1,2})/(\d{1,2})\b', en):
        for x, y in ((d1, d2), (d2, d1)):
            a.add(f'{x}{y}'); a.add(f'{int(x)}{int(y)}')
            # German and Russian zero-pad both fields: "5/15" is "15.05."
            a.add(f'{int(x):02d}{int(y):02d}')
    # $17.3K -> 17300 ; 47K -> 47000
    # a range shares one suffix: "$3-5K" means 3,000 to 5,000
    for lo,hi in re.findall(r'(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)\s*[Kk]\b', en):
        for v in (lo,hi): a.add(str(round(float(v)*1000)))
    for num,_ in re.findall(r'(\d+(?:\.\d+)?)(K|k)', en):
        v=float(num)*1000
        a.add(str(round(v)))
    # "$12M" -> 12000000. Most locales keep "12 million" and the bare 12 already
    # matches, but Japanese writes it in myriads (1,200万), which toks()
    # normalises to the full 12000000.
    # spelled out, too: "1 million shares" is 1,000,000, which Japanese writes
    # as the myriad 100万 -- a figure no bare "1" in the source can produce.
    for num, word in re.findall(r'(\d+(?:\.\d+)?)\s*(thousand|million|billion)\b', en, re.I):
        a.add(str(round(float(num) * {'thousand': 1_000, 'million': 1_000_000,
                                    'billion': 1_000_000_000}[word.lower()])))
    # a spelled-out range shares its word the way "$3-5K" shares its suffix:
    # "70-90 million shares" means 70,000,000 to 90,000,000, and Japanese
    # writes both ends as myriads (7,000万 / 9,000万).
    for lo, hi, word in re.findall(
            r'(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)\s*(thousand|million|billion)\b',
            en, re.I):
        for v in (lo, hi):
            a.add(str(round(float(v) * {'thousand': 1_000, 'million': 1_000_000,
                                        'billion': 1_000_000_000}[word.lower()])))
    # a range shares one suffix here too: "$15-20M" means 15,000,000 to 20,000,000
    for lo, hi in re.findall(r'(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)\s*M\b', en):
        for v in (lo, hi): a.add(str(round(float(v)*1_000_000)))
    for num in re.findall(r'(\d+(?:\.\d+)?)\s*M\b', en):
        a.add(str(round(float(num)*1_000_000)))
    # "$7.5B" -> 7500000000. Japanese writes that in oku (75億), which toks()
    # normalises to the full figure -- a number no bare "75" can license.
    for lo, hi in re.findall(r'(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)\s*B\b', en):
        for v in (lo, hi): a.add(str(round(float(v)*1_000_000_000)))
    for num in re.findall(r'(\d+(?:\.\d+)?)\s*B\b', en):
        a.add(str(round(float(num)*1_000_000_000)))
    # Spanish and Portuguese have no word for a short-scale billion and write
    # "9.000 millones"; French writes trillions as "4 000 Md$". Both are the
    # same figure counted one scale down.
    for lo, hi in re.findall(r'(\d+(?:\.\d+)?)\s*[-\u2013]\s*(\d+(?:\.\d+)?)\s*(?:B\b|billions?\b)', en, re.I):
        for v in (lo, hi):
            a.add(str(round(float(v) * 1_000)))
            a.add(str(round(float(v) * 1_000_000_000)))
    for num in re.findall(r'(\d+(?:\.\d+)?)\s*(?:B\b|billions?\b)', en, re.I):
        a.add(str(round(float(num) * 1_000)))
    for num in re.findall(r'(\d+(?:\.\d+)?)\s*(?:T\b|trillions?\b)', en, re.I):
        a.add(str(round(float(num) * 1_000)))
        a.add(str(round(float(num) * 1_000_000)))
        a.add(str(round(float(num) * 1_000_000_000_000)))
    # Locales spell a bare hour as a full clock time: English "2 AM" becomes
    # Dutch "2.00 uur", German "2:00 Uhr", Italian "ore 2:00". Those tokenise
    # to "200", which no bare "2" in the source can produce. Only do this for
    # strings that actually talk about clock time, so a plain "6 contracts"
    # never licenses "600".
    if (re.search(r'\b(?:[AaPp]\.?[Mm]|ET|EST|EDT)\b', en)
            or re.search(r'\d\s*[ap]m\b', en, re.I)
            or re.search(r'\b\d{1,2}:\d{2}\b', en)):
        # A range shares one meridiem: "3:50-4:00 PM" means 15:50 and 16:00.
        # Locales that write the clock with a dot ("15.50 uur") tokenise the
        # whole time as one run, which no 12-hour form in the source can produce.
        for h, mm in re.findall(r'(\d{1,2}):(\d{2})', en):
            if int(h) < 12:
                a.add(f'{int(h) + 12}{mm}')
        for d in re.findall(r'\d{1,2}', en):
            h = int(d)
            if h <= 24:
                a.add(f'{h}00')
                if h < 12:
                    a.add(str(h + 12)); a.add(f'{h + 12}00')
    # Imperial units become metric in every locale but English, so a converted
    # figure is a faithful translation, not an invented number. Allow the
    # rounded equivalent (and the neighbours rounding could land on).
    CONV = ((r'(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)\b', 0.3048),
            (r'(\d+(?:\.\d+)?)\s*(?:miles|mile|mi)\b', 1.609344),
            (r'(\d+(?:\.\d+)?)\s*(?:inches|inch|in)\b', 2.54),
            (r'(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)\b', 0.453592))
    for pat_u, factor in CONV:
        for num in re.findall(pat_u, en, re.I):
            v = float(num) * factor
            for cand in (round(v), int(v), int(v) + 1, round(v, 1)):
                a.add(str(cand).rstrip('0').rstrip('.') if isinstance(cand, float) else str(cand))
    # "Feb 23, 2024" / "June 12, 10:30" tokenise as one run across the comma,
    # so also allow every plain digit run appearing in the source
    a |= set(re.findall(r'\d+', en))
    # "Apr 8, 2024" tokenises as one run, so pull years straight from the source
    a |= set(re.findall(r'\d{4}', en))
    # Japanese writes month names as numbers: "October 2023" -> "2023年10月"
    MONTHS = ('january february march april may june july august september '
              'october november december').split()
    for i, m in enumerate(MONTHS, 1):
        if re.search(m[:3], en, re.I):
            a.add(str(i))
    # English spells small cardinals as words ("the ten", "forty years").
    # Japanese, Russian and Arabic write them as digits, which is correct in
    # those languages and must not read as an invented number.
    WORDS = {'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,
             'eight':8,'nine':9,'ten':10,'eleven':11,'twelve':12,
             'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,
             'seventeen':17,'eighteen':18,'nineteen':19,'twenty':20,
             'thirty':30,'forty':40,'fifty':50,'sixty':60,'seventy':70,
             'eighty':80,'ninety':90,'hundred':100,'thousand':1000,
             'million':1000000,'billion':1000000000,
             'half':2,'quarter':4,'dozen':12}
    for w, v in WORDS.items():
        if re.search(r'(?<![A-Za-z])' + w + r'(?![A-Za-z])', en, re.I):
            a.add(str(v))
    a |= spelled(en)
    return a


_UNITS = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
          'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11,
          'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
          'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19}
_TENS = {'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
         'seventy': 70, 'eighty': 80, 'ninety': 90}
_SCALE = {'thousand': 1000, 'million': 1000000, 'billion': 1000000000}


def spelled(en):
    """Every integer the English writes out in words.

    The WORDS table below maps single words, so a compound produced its parts
    and never itself: "forty-seven" gave 40 and 7, "two hundred" gave 2 and 100,
    "twenty-three" gave 20 and 3. Locales that write the digits then read as
    inventing a number. Only compounds above nine are returned; the single words
    are already covered.
    """
    out, cur, total, started = set(), 0, 0, False

    def flush():
        nonlocal cur, total, started
        if started and total + cur > 9:
            out.add(str(total + cur))
        cur = total = 0
        started = False

    for w in re.findall(r'[a-z]+', en.lower()):
        if w in _UNITS:
            cur += _UNITS[w]; started = True
        elif w in _TENS:
            cur += _TENS[w]; started = True
        elif w == 'hundred' and started:
            cur = (cur or 1) * 100
        elif w in _SCALE and started:
            total += (cur or 1) * _SCALE[w]; cur = 0
        elif w != 'and':
            flush()
    flush()
    return out


def licensed(t, ok, own=None):
    if t in ok or (t.lstrip('0') or '0') in ok:
        return True
    # French, Russian and Hungarian group thousands with a space, so two
    # numbers either side of a space fuse into one run: "15h30 450,80 $"
    # tokenises as 3045080. Allow a run that splits cleanly into two figures
    # the English already licenses, and only that -- one split, both halves.
    #
    # The halves must come from THIS segment, not from the neighbour window.
    # Fusion is a rendering artefact inside one string, so both figures have to
    # be in that string; drawing them from a neighbour licenses almost any
    # digit run. A Hungarian typo, "100,02 helyett 50,02", passed because the
    # next segment began "Five thousand" and contained a 2, so 10002 split into
    # 1000 + 2 and neither half came from the string being checked.
    src = ok if own is None else own
    for i in range(1, len(t)):
        lo, hi = t[:i], t[i:]
        if ((lo in src or (lo.lstrip('0') or '0') in src)
                and (hi in src or (hi.lstrip('0') or '0') in src)):
            return True
    return False


ENDS = re.compile(r'[.?!:;\u3002][\'")\]\u201d\u300d\u00bb]*\s*$')


def window(ps, i, span=4):
    """The segments that belong to the same sentence as segment i.

    An inline tag cuts a sentence into pieces -- "the S&P 500 gained an average
    of" | "0.4%" | "in the 24 hours before FOMC" -- and word order moves a
    figure from one piece to another, so a figure's licence has to come from
    the whole sentence rather than from the piece it landed in. Walking out
    while the join is mid-sentence is what makes that safe: two pieces are the
    same sentence only when the left one does not end on a full stop. A fixed
    +/-1 window was too narrow -- a one-word <strong> between the halves
    ("25% of the" | "risk" | ", which is the number...") puts three segments
    between the number and where Japanese word order needs it.
    """
    lo, hi = max(0, i - 1), min(len(ps) - 1, i + 1)
    while lo > 0 and i - lo < span and not ENDS.search(ps[lo - 1][0]):
        lo -= 1
    while hi + 1 < len(ps) and hi - i < span and not ENDS.search(ps[hi][0]):
        hi += 1
    return range(lo, hi + 1)


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        for i, (k, v) in enumerate(ps):
            ok = set()
            for j in window(ps, i):
                ok |= allowed(ps[j][0])
            own = allowed(k)
            extra = {t for t in toks(v)
                     if len(t) > 1 and t.strip('0') and not licensed(t, ok, own)}
            if extra:
                report(f'  {lang}: {sorted(extra)} | {k[:62]}\n         -> {v[:82]}')
                bad += 1
    return bad


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
