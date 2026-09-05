# -*- coding: utf-8 -*-
"""Hold the 36 free-resource PDFs to the same course the lessons teach.

The landing page at education/free/index.html was rewritten for the rebuilt
curriculum and describes each download in the course's own terms. The files
behind it were not. They are the pre-rebuild course: their lesson references
are to slots and titles that no longer exist, their tier counts are from the
old shape, and several of them teach as fact the exact story a lesson exists
to refute.

    python3 scripts/curriculum/pdfs.py            list every finding
    python3 scripts/curriculum/pdfs.py --check    exit with the finding count

Three kinds of finding, in descending order of how much they cost a reader:

  refuted   the file asserts something a lesson measures and rejects. The
            landing page promises the lesson's finding and the file delivers
            the folklore, under one brand.
  lesson    a reference to a lesson number or title that does not exist, or
            that names a different lesson than the catalogue does.
  count     a tier lesson count that is not what the catalogue holds.
"""
import os, re, sys, json, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'scripts', 'curriculum'))
import pdftext

CAT = json.load(open('education/curriculum/index.json', encoding='utf-8'))
BY_SLOT = {r['order']: r for r in CAT}
TIER = collections.Counter(r['level'] for r in CAT)

# Each entry is a claim the curriculum measures and rejects, and the lesson
# that does the rejecting. The pattern has to be specific enough that a page
# describing the claim in order to refute it does not trip it.
REFUTED = [
    (r'hunt(?:ing)? retail stops|institutional traders hunt|sweep (?:the )?(?:lows|highs) . (?:buy|sell) the stops'
     r'|run the round . reverse|break the line . trap',
     27, 'the intent behind a sweep, which lesson 27 finds cannot be identified from price'),
    (r'smart money (?:sells to them|buys from them|must trade against retail)',
     9, 'smart money as a single agent trading against you, against lesson 9\'s four participants'),
    (r'positive delta\s*=\s*more buying|more buying than selling',
     8, 'delta as a count of buyers, where lesson 8 bounds the buy share between 50.0 and 62.5 per cent'),
    (r'aggressor side \((?:buy/sell|buy, sell)\)|showing time, price, volume, and aggressor side',
     7, 'the aggressor side as reported, where lesson 7 finds it inferred and right four times in five'),
    (r'>\s*70\s*=\s*overbought|overbought\b(?![^.]{0,80}(?:myth|not|regime))',
     51, 'a fixed oscillator level as a signal, where lesson 51 finds two implementations disagreeing 13 to 0'),
]
TIERPAT = re.compile(r'/curriculum/(beginner|intermediate|advanced|professional)/\s*\((\d+)\s*lessons\)', re.I)
LESSONPAT = re.compile(r'Lesson (\d+)\s*[:—-]\s*([A-Z][^\n]{3,60})')


def files():
    return sorted(glob.glob('education/resources/**/*.pdf', recursive=True))


def scan(path):
    t = pdftext.text(path)
    out = []
    for pat, slot, why in REFUTED:
        if re.search(pat, t, re.I):
            out.append(('refuted', 'asserts %s (lesson %d)' % (why, slot)))
    for m in LESSONPAT.finditer(t):
        n, shown = int(m.group(1)), m.group(2).strip()
        row = BY_SLOT.get(n)
        head = re.split(r'\s+[-–—]\s+', shown)[0].strip().rstrip('.,')
        if not row:
            out.append(('lesson', 'names lesson %d, which does not exist' % n))
        elif head.lower() not in row['title'].lower() and row['title'].lower() not in head.lower():
            out.append(('lesson', 'names lesson %d as %r; the catalogue says %r'
                        % (n, head[:44], row['title'])))
    for m in TIERPAT.finditer(t):
        level, n = m.group(1).capitalize(), int(m.group(2))
        if TIER[level] != n:
            out.append(('count', '%s is given as %d lessons; the catalogue holds %d'
                        % (level, n, TIER[level])))
    return out


ORDER = {'refuted': 0, 'lesson': 1, 'count': 2}


def main(argv):
    rows = []
    for p in files():
        for kind, msg in scan(p):
            rows.append((kind, p, msg))
    rows.sort(key=lambda r: (ORDER[r[0]], r[1]))
    last = None
    for kind, p, msg in rows:
        if p != last:
            print(p.replace('education/resources/', ''))
            last = p
        print('    [%-7s] %s' % (kind, msg))
    tally = collections.Counter(k for k, _, _ in rows)
    print()
    print('%d PDFs, %d findings across %d files  %s'
          % (len(files()), len(rows), len({p for _, p, _ in rows}), dict(tally)))
    return len(rows) if '--check' in argv else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
