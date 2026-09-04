#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corpus-wide checks that craft.py cannot see, because they are about the
relationships between lessons rather than the shape of one lesson.

    python3 scripts/curriculum/audit.py            all checks
    python3 scripts/curriculum/audit.py xref chain only those

Five checks, each one a rule a reader would call a defect rather than a
pattern that merely looks odd to a regex:

    xref    lesson references, internal links, link text against the target
            h1, prerequisites pointing backwards, and figures attributed to
            a lesson that does not print them
    chain   every lesson hands off to the next, and the next claim pays the
            promise with the same figure
    arith   every explicit a x b = c printed anywhere in the corpus, recomputed
    claim   figures asserted in a claim that the lesson body never supports
    dupes   a word repeated back to back in the English prose
    locale  a string the builder will need that some locale does not have,
            which is how a page builds green and still reads English
    hub     the four tier pages against the catalogue: counts, the lesson
            each one opens on, and the level its listing selects

Like craft.py this exits with the finding count, so a red label in a shell is
a count and not a crash.
"""
import os, re, sys, glob, html, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'scripts', 'curriculum'))
import craft

# ---------------------------------------------------------------- the corpus

PAGES = {}
for _p in glob.glob('education/curriculum/*/*.html'):
    if '_staging' in _p or '_merged' in _p:
        continue
    _m = re.match(r'(\d+)-', os.path.basename(_p))
    if _m:
        PAGES[int(_m.group(1))] = _p
SLOTS = sorted(PAGES)

RAW = {s: open(PAGES[s], encoding='utf-8').read() for s in SLOTS}


def flat(fragment):
    """Strip tags, but keep a space at every boundary so a table cell holding
    63 followed by one holding 70 does not read as 6370, and a pipe at every
    cell boundary so no rule ever reads across a column."""
    t = re.sub(r'</t[dhr]>', ' | ', fragment)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'[ \t]+', ' ', html.unescape(t))


def tight(fragment):
    return re.sub(r'\s+', ' ', flat(fragment)).strip()


BODY = {s: craft.prose(RAW[s]) for s in SLOTS}
TXT = {s: flat(BODY[s]) for s in SLOTS}


def h1(s):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', RAW[s], re.S)
    return tight(m.group(1)) if m else ''


H1 = {s: h1(s) for s in SLOTS}


def part(s, name):
    """The source of one data-part, up to whichever part or the related block
    comes next."""
    src = RAW[s]
    i = src.find('data-part="%s"' % name)
    if i < 0:
        return ''
    ends = [src.find('data-part="%s"' % p, i + 1) for p in craft.PARTS]
    ends += [src.find('<div class="section-break">'), src.find('<h3 data-part="problems"')]
    ends = [x for x in ends if x > i]
    return src[i:min(ends)] if ends else src[i:]


def related(s):
    i = RAW[s].find('<div class="section-break">')
    return RAW[s][i:] if i > 0 else ''


def claim_text(s):
    """The claim paragraph, capped at the 200-odd words the guidebook gives it."""
    t = RAW[s]
    i = t.find('data-part="claim"')
    a = t.rfind('<p', 0, i)
    return ' '.join(tight(t[a:t.find('</p>', i)]).split()[:210])


NUM = re.compile(r'(?<![\w.,])\d+(?:,\d{3})*(?:\.\d+)?')


def figures(t):
    """Every number in a fragment that could be a finding: two significant
    digits or more, with lesson and module numbers taken out first."""
    t = re.sub(r'\b[Ll]essons?\s+\d+', '', t)
    t = re.sub(r'\b[Mm]odule\s+\d+', '', t)
    return {n.replace(',', '') for n in NUM.findall(t)
            if len(n.replace(',', '').replace('.', '').lstrip('0')) >= 2}


FOUND = collections.defaultdict(list)


def report(slot, kind, message):
    FOUND[slot].append((kind, message))


# ------------------------------------------------------------------- 1. xref

NAV = {'read lesson', 'previous lesson', 'next lesson', 'curriculum'}

# Only the tight form counts as an attribution: the figure has to sit inside
# the noun phrase the reference governs. Loosen this and it starts reading
# derived results as quotations -- "the 14.7 months lesson 67 priced comes
# down to 14.1" is lesson 70 doing arithmetic, not lesson 70 misquoting.
DERIVE = re.compile(r'\b(is|are|was|were|be|becomes?|comes?|goes|went|arrives?|'
                    r'has|have|had|makes?|leaves?|gives?|means?|that|which|than|'
                    r'instead|rather|per cent|of)\b', re.I)
COUNTER = re.compile(r'\b(had|if|suppose|imagine|were|would|say)\b[^.;:|]{0,60}$', re.I)
ATTR = re.compile(
    r'lesson (\d{1,2})(?:&rsquo;s|’s|\'s)\s+([^.;:|]{0,25}?)(\d[\d,]*(?:\.\d+)?)'
    r'|lesson (\d{1,2}) (?:printed|measured|gave|found|charged|priced|counted'
    r'|established|reported)\s+([^.;:|]{0,15}?)(\d[\d,]*(?:\.\d+)?)', re.I)


def check_xref():
    for s in SLOTS:
        # a lesson reference resolves, and never points at the page itself
        for m in re.finditer(r'\blessons? (\d{1,2})\b', TXT[s], re.I):
            n = int(m.group(1))
            if n not in PAGES:
                report(s, 'xref', 'references lesson %d, which does not exist' % n)
            elif n == s:
                report(s, 'xref', 'refers to itself as lesson %d' % n)

        # every internal lesson href resolves
        for m in re.finditer(r'href="(/education/curriculum/[^"]+\.html)"', RAW[s]):
            if not os.path.exists('.' + m.group(1)):
                report(s, 'href', 'dead link %s' % m.group(1))

        # link text matches the target h1, in the prereq and related blocks
        # only, and never a navigation label
        for scope in (part(s, 'prereq'), related(s)):
            for m in re.finditer(r'href="/education/curriculum/\w+/(\d+)-[^"]*\.html"'
                                 r'[^>]*>([^<]{4,})</a>', scope):
                n = int(m.group(1))
                shown = tight(m.group(2))
                if shown.lower().strip(' →←') in NAV:
                    continue
                if re.fullmatch(r'[Ll]esson \d+', shown):
                    continue
                if n in H1 and shown != H1[n]:
                    report(s, 'title', 'link to %d reads %r, that page is titled %r'
                           % (n, shown, H1[n]))

        # prerequisites point backwards
        for m in re.finditer(r'/education/curriculum/\w+/(\d+)-', part(s, 'prereq')):
            n = int(m.group(1))
            if n >= s:
                report(s, 'prereq', 'prerequisite points forward, at lesson %d' % n)

        # an attributed figure appears on the page it is attributed to. Only
        # the possessive and explicit-verb forms, and only when the number sits
        # within 40 characters, so the page's own arithmetic is never captured.
        for m in ATTR.finditer(TXT[s]):
            n = int(m.group(1) or m.group(4))
            num = m.group(3) or m.group(6)
            gap = m.group(2) or m.group(5) or ''
            if n not in PAGES or n == s:
                continue
            if ',' in gap or DERIVE.search(gap):
                continue
            # a counterfactual stipulates a figure, it does not quote one
            if COUNTER.search(TXT[s][max(0, m.start() - 60):m.start()]):
                continue
            if len(num.replace(',', '').replace('.', '').lstrip('0')) < 3:
                continue
            if num.replace(',', '') not in TXT[n].replace(',', ''):
                report(s, 'figure', 'attributes %s to lesson %d, which does not print it'
                       % (num, n))


# ------------------------------------------------------------------ 2. chain

# Two handoff shapes live in the corpus and both are accepted. Slots 1 to 61
# carry the tease in the unmarked recap paragraph that follows the sources;
# slots 62 to 85 carry it in the last paragraph of the bounds. See the
# guidebook section on the handoff.

def trailing(s):
    t = RAW[s]
    i = t.find('data-part="sources"')
    if i < 0:
        return ''
    j = t.find('</p>', i)
    k = t.find('<div class="section-break">')
    ps = re.findall(r'<p[^>]*>(.*?)</p>', t[j:(k if k > 0 else len(t))], re.S)
    return tight(ps[0]) if ps else ''


def lastbound(s):
    ps = re.findall(r'<p[^>]*>(.*?)</p>', part(s, 'bounds'), re.S)
    return tight(ps[-1]) if ps else ''


# A tease clears the floor when it says what the next lesson FINDS. Naming the
# subject is not a promise, because nothing about it could turn out to be false.
FIND = re.compile(r'\b(finds?|found|shows?|proves?|turns out|measures?|counts?|'
                  r'prices?|costs?|comes to|works out|ends up|is worth|does not|'
                  r'never|cannot|fails?|answers? it|puts a number)\b', re.I)
TOPIC = re.compile(
    r'\b(is about|is where|asks what|asks who|asks how|asks the question|takes up|'
    r'looks at|covers|explores|turns to|moves to|is the subject|goes into|deals with|'
    r'leaves .{0,40} and asks|starts on)\b', re.I)


def handoffs():
    """Classify each of the 84 handoffs. PAID means the tease carries a figure
    the next claim also prints, which is what the guidebook asks for."""
    rows = []
    for s in SLOTS[:-1]:
        n = SLOTS[SLOTS.index(s) + 1]
        blob = trailing(s) + ' || ' + lastbound(s)
        # The promise is everything from the first time the next lesson is
        # named to the end of the paragraph: a tease often names it, sets the
        # scene, and only then states what it finds.
        m = re.search(r'(?:next lesson|next module|next one|next two|'
                      r'lesson %d\b)' % n, blob, re.I)
        if not m:
            # A tease that opens a module names it by number. Take the last
            # such mention: the first is usually the module being closed.
            ms = list(re.finditer(r'module \d+', blob, re.I))
            m = ms[-1] if ms else None
        seg = blob[m.start():] if m else ''
        promised = figures(seg)
        carried = figures(claim_text(n))
        if not seg:
            kind = 'NOHANDOFF'
        elif promised & carried:
            kind = 'PAID'
        elif FIND.search(seg):
            # a finding is stated; it just travels without its number
            kind = 'FINDING-NO-FIGURE'
        elif promised:
            kind = 'FIGURE-UNPAID'
        else:
            kind = 'TOPIC-ONLY'
        rows.append((kind, s, n, seg[:150]))
    return rows


def check_chain():
    rows = handoffs()
    counts = collections.Counter(r[0] for r in rows)
    print('handoffs %d  %s' % (len(rows), dict(counts)))
    for kind, s, n, seg in rows:
        if kind == 'NOHANDOFF':
            report(s, 'tease', 'does not hand off to lesson %d' % n)
        elif kind == 'FIGURE-UNPAID':
            report(s, 'tease', 'promises a figure lesson %d does not carry in its claim' % n)
        elif kind == 'TOPIC-ONLY':
            report(s, 'tease', 'names the topic of lesson %d but no finding: %s' % (n, seg[:90]))


# ------------------------------------------------------------------ 3. arith

DEC = r'\$?\d[\d,]*(?:\.\d+)?'
OPS = {'*': lambda a, b: a * b, '/': lambda a, b: a / b if b else None,
       '+': lambda a, b: a + b, '-': lambda a, b: a - b}
SIGN = {'&times;': '*', '×': '*', 'x': '*', '&divide;': '/', '÷': '/', '/': '/',
        '&plus;': '+', '+': '+', '&minus;': '-', '−': '-', '-': '-'}
OP = r'&times;|×|x|&divide;|÷|/|&plus;|\+|&minus;|−|-'
CHAIN = re.compile(r'(%s)((?:\s*(?:%s)\s*%s){1,4})\s*=\s*(%s)' % (DEC, OP, DEC, DEC))
STEP = re.compile(r'\s*(%s)\s*(%s)' % (OP, DEC))


def value(t):
    return float(t.replace(',', '').replace('$', '').replace('%', '').strip())


def check_arith():
    """Recompute every printed expression, evaluating a chain left to right the
    way the prose reads it, so 0.01 over 500 times 10,000 is not read as the
    last multiplication alone."""
    total = 0
    for s in SLOTS:
        for m in CHAIN.finditer(TXT[s]):
            try:
                acc = value(m.group(1))
                stated = value(m.group(3))
                for step in STEP.finditer(m.group(2)):
                    fn = OPS[SIGN[step.group(1).lower()]]
                    acc = fn(acc, value(step.group(2)))
                    if acc is None:
                        break
            except (ValueError, KeyError):
                continue
            if acc is None:
                continue
            total += 1
            if abs(acc - stated) > max(abs(stated) * 0.005, 0.02):
                report(s, 'arith', '%s prints %s, computes %.4f'
                       % (re.sub(r'\s+', ' ', m.group(0)), m.group(3), acc))
    print('%d explicit expressions recomputed' % total)


# ------------------------------------------------------------------ 4. claim


def supported(v, body, tol):
    """A claim figure is supported if the body works it, works its complement,
    works it in the other unit, or reaches it as the ratio or product of two
    figures the body does work. The tolerance is the precision the claim itself
    states, so a claim of 565 is paid by a table reading 565.3. Anything looser
    stops being a check."""
    for b in body:
        if abs(b - v) <= tol or abs(b * 100 - v) <= tol or abs(b / 100 - v) <= tol / 100:
            return True
        if abs(100 - b - v) <= tol or abs(1 - b - v) <= tol / 100:
            return True
    nonzero = [b for b in body if b]
    for i, x in enumerate(nonzero):
        for y in nonzero[i:]:
            if abs(x / y - v) <= tol or abs(y / x - v) <= tol or abs(x * y - v) <= tol:
                return True
    return False


def check_claim():
    """Every figure the claim asserts should be worked somewhere below it.
    The one accepted exception is a figure carried in from the previous
    lesson's tease, which is the handoff doing its job."""
    for s in SLOTS:
        pr = BODY[s]
        end = pr.find('</p>', pr.find('data-part="claim"'))
        head = flat(pr[:end])
        head = re.sub(r'\b[Ll]essons?\s+\d+', '', head)
        head = re.sub(r'\b[Mm]odule\s+\d+', '', head)
        body = set()
        for n in NUM.findall(flat(pr[end:])):
            try:
                body.add(float(n.replace(',', '')))
            except ValueError:
                pass
        i = SLOTS.index(s)
        inherited = figures(trailing(SLOTS[i - 1]) + ' ' + lastbound(SLOTS[i - 1])) if i else set()
        for n in NUM.findall(head):
            try:
                v = float(n.replace(',', ''))
            except ValueError:
                continue
            if len(n.replace(',', '').replace('.', '')) < 3:
                continue
            if n.replace(',', '') in inherited:
                continue
            places = len(n.split('.')[1]) if '.' in n else 0
            if not supported(v, body, max(0.5 * 10 ** -places, 0.005)):
                report(s, 'claim', 'claim states %s and the body never works it' % n)


# ------------------------------------------------------------------ 5. dupes

# Two characters or more, so a possessive running into a one-letter variable
# name -- lesson 10's s -- is not read as a stutter.
DUPE = re.compile(r'(?<![\u2019\'])\b(\w{2,})\s+\1\b', re.I)
OK_DOUBLES = {'had had', 'that that', 'is is'}


def check_dupes():
    for s in SLOTS:
        for m in DUPE.finditer(re.sub(r'\s+', ' ', TXT[s])):
            if m.group(0).lower() in OK_DOUBLES:
                continue
            report(s, 'dupes', 'repeated word: %s' % m.group(0))


# ------------------------------------------------------------------ 6. locale


def check_locale():
    """Every string the builder will ask for exists in every locale. The
    builder skips a locale silently when one string is missing, so a page can
    build, pass its own checks, and still be short a paragraph in eleven
    languages. That happened once, to lesson 63's closing bound."""
    sys.path.insert(0, os.path.join(ROOT, 'scripts', 'i18n'))
    try:
        from extract import extract
        from inject import LANGS
    except ImportError as exc:
        print('locale check unavailable: %s' % exc)
        return
    import json
    memory = {}
    for lang in LANGS:
        path = os.path.join(ROOT, 'scripts', 'i18n', 'memory', '%s.json' % lang)
        memory[lang] = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for s in SLOTS:
        slug = os.path.basename(PAGES[s]).replace('.html', '')
        wanted = {seg['en'] for seg in extract(PAGES[s])[1]}
        for lang in LANGS:
            per = os.path.join(ROOT, 'scripts', 'i18n', 'lessons', slug, '%s.json' % lang)
            table = dict(memory[lang])
            if os.path.exists(per):
                table.update(json.load(open(per, encoding='utf-8')))
            missing = [e for e in wanted if e not in table]
            if missing:
                report(s, 'locale', '%s is short %d string%s, first is %r'
                       % (lang, len(missing), '' if len(missing) == 1 else 's',
                          sorted(missing)[0][:70]))


# --------------------------------------------------------------------- 7. hub

TIER_PAGES = {'beginner': 'Beginner', 'intermediate': 'Intermediate',
              'advanced': 'Advanced', 'professional': 'Professional'}


def check_hub():
    """The four tier pages still type their counts and their opening link.
    Check both against the catalogue, because a typed fact drifts and this set
    had drifted so far that every one of the four opened the wrong lesson and
    one of them opened a file that no longer exists."""
    import json
    cat_path = os.path.join(ROOT, 'education', 'curriculum', 'index.json')
    if not os.path.exists(cat_path):
        print('hub check unavailable: no catalogue')
        return
    catalogue = json.load(open(cat_path, encoding='utf-8'))
    for page, level in TIER_PAGES.items():
        path = os.path.join(ROOT, 'education', '%s.html' % page)
        if not os.path.exists(path):
            continue
        rows = sorted([x for x in catalogue if x.get('level') == level],
                      key=lambda x: x['order'])
        if not rows:
            print('hub: no catalogue rows at level %r' % level)
            continue
        src = open(path, encoding='utf-8').read()
        # the reader's half of the page: no scripts, no attributes
        prose = flat(re.sub(r'<script[\s\S]*?</script>', ' ', src))
        first, n = rows[0], len(rows)
        slot = first['order']
        if ('%d lessons' % n) not in src:
            report(slot, 'hub', '%s.html never says %d lessons, which is what '
                   'the catalogue holds at this level' % (page, n))
        if ('href="%s"' % first['href']) not in src:
            report(slot, 'hub', '%s.html does not open on %s, the first lesson '
                   'of its tier' % (page, first['href']))
        if ("a.level === '%s'" % level) not in src:
            report(slot, 'hub', '%s.html does not select its listing by level %r'
                   % (page, level))
        for m in re.finditer(r'(?:Start|Begin)[^<]{0,40}?(?:Lesson|lesson)\D{0,12}(\d+)', prose):
            if int(m.group(1)) != slot:
                report(slot, 'hub', '%s.html says %r, and its tier starts at %d'
                       % (page, m.group(0).strip()[:50], slot))
        for m in re.finditer(r'\b[Aa]rticles?\b', prose):
            report(slot, 'hub', '%s.html still calls a lesson an article' % page)
            break


# -------------------------------------------------------------------- driver

CHECKS = collections.OrderedDict([
    ('xref', check_xref), ('chain', check_chain), ('arith', check_arith),
    ('claim', check_claim), ('dupes', check_dupes), ('locale', check_locale), ('hub', check_hub),
])
ORDER = ['xref', 'href', 'title', 'prereq', 'tease', 'arith', 'claim', 'dupes',
         'locale', 'hub', 'figure']


def main(argv):
    wanted = [a for a in argv if a in CHECKS] or list(CHECKS)
    unknown = [a for a in argv if a not in CHECKS]
    if unknown:
        print('unknown check: %s' % ', '.join(unknown))
        print('available: %s' % ', '.join(CHECKS))
        return 2
    for name in wanted:
        CHECKS[name]()
    print()
    tally = collections.Counter()
    for s in SLOTS:
        if not FOUND[s]:
            continue
        seen, rows = set(), []
        for kind, msg in sorted(FOUND[s], key=lambda x: ORDER.index(x[0])):
            if msg in seen:
                continue
            seen.add(msg)
            rows.append((kind, msg))
            tally[kind] += 1
        print('slot %-3d %s' % (s, os.path.basename(PAGES[s])))
        for kind, msg in rows:
            print('    [%-6s] %s' % (kind, msg))
    n = sum(tally.values())
    print()
    print('%d findings across %d lessons  %s'
          % (n, sum(1 for s in SLOTS if FOUND[s]), dict(tally) if tally else ''))
    return n


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
