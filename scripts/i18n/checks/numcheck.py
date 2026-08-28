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
        hi = int(m.group(1))
        man = int(re.sub(r'[,\u00a0 ]', '', m.group(2))) if m.group(2) else 0
        lo = re.sub(r'[,\u00a0 ]', '', m.group(3) or '') or '0'
        return str(hi*100000000 + man*10000 + int(lo))
    s = re.sub(r'(\d+)\u5104(?:([\d,\u00a0 ]+)\u4e07)?([\d,\u00a0 ]*)', oku, s)
    def myriad(m):
        hi = int(m.group(1))
        lo = re.sub(r'[,\u00a0 ]', '', m.group(2) or '') or '0'
        return str(hi*10000 + int(lo))
    s = re.sub(r'(\d+)\u4e07([\d,\u00a0 ]*)', myriad, s)
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
    # A US "10/23" date is written "23.10." or "23/10" almost everywhere else,
    # and the separator stripping in toks() collapses that into one run. Both
    # orders name the same day, so allow either concatenation.
    for d1, d2 in re.findall(r'\b(\d{1,2})/(\d{1,2})\b', en):
        for x, y in ((d1, d2), (d2, d1)):
            a.add(f'{x}{y}'); a.add(f'{int(x)}{int(y)}')
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
    # Locales spell a bare hour as a full clock time: English "2 AM" becomes
    # Dutch "2.00 uur", German "2:00 Uhr", Italian "ore 2:00". Those tokenise
    # to "200", which no bare "2" in the source can produce. Only do this for
    # strings that actually talk about clock time, so a plain "6 contracts"
    # never licenses "600".
    if re.search(r'\b(?:[AP]M|ET|EST|EDT)\b', en):
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
    return a


def run(slug, report=print):
    bad = 0
    for lang, ps in ctx.pairs(slug):
        for k, v in ps:
            ok = allowed(k)
            extra = {t for t in toks(v)
                     if len(t) > 1 and t not in ok and (t.lstrip('0') or '0') not in ok}
            if extra:
                report(f'  {lang}: {sorted(extra)} | {k[:62]}\n         -> {v[:82]}')
                bad += 1
    return bad


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)
