# -*- coding: utf-8 -*-
"""Put the glossary's terms for a lesson at the foot of that lesson.

A reader who meets a settled term mid-page has nowhere to go but the index.
Every lesson is named by at least one glossary entry, so every lesson can
carry the short list of terms defined against its own arithmetic.

The block is generated, never typed: it is derived from
education/curriculum/glossary.json, which is the same file the glossary page
is built from, so the two can never disagree about which lesson a term
belongs to.

    python3 scripts/curriculum/lessonterms.py           insert or refresh
    python3 scripts/curriculum/lessonterms.py --check   exit with the count stale

Term names carry translate="no". They are the headwords of an English
reference page and the link points at it, so translating them would send a
reader to an anchor that does not exist. Only the two sentences around them
are translatable, and they are the same two sentences on all eighty-five
lessons, which is two keys in the memory rather than a hundred and seventy.
"""
import os, re, sys, json, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
DATA = 'education/curriculum/glossary.json'
OPEN = '<div class="section-break"><span>Terms From This Lesson</span></div>'
ANCHOR = '<blockquote class="sp-disclaimer">'
LEAD = ('Each of these is defined in the glossary against the arithmetic on '
        'this page.')


def sortkey(term):
    return re.sub(r'[^a-z0-9]', '', re.sub(r'\s*\([^)]*\)', '', term).lower())


def by_lesson():
    out = collections.defaultdict(list)
    for e in json.load(open(DATA, encoding='utf-8')):
        for n in e['lessons']:
            out[n].append(e['term'])
    for n in out:
        out[n].sort(key=sortkey)
    return out


def block(terms):
    # The literal character, not &middot;: the entity spells two ASCII
    # letters, which is enough to make the separator a translatable key in
    # every locale, and it would be one that must never be translated.
    links = ' · '.join(
        '<a href="/education/glossary.html#%s" translate="no">%s</a>'
        % (sortkey(t)[0], t) for t in terms)
    return (OPEN + '\n\n'
            '      <p style="font-size:.9rem;color:var(--muted)">%s</p>\n\n'
            '      <p style="font-size:.95rem;line-height:2">%s</p>\n\n      '
            % (LEAD, links))


def lessons():
    out = {}
    for p in sorted(glob.glob('education/curriculum/*/*.html')):
        m = re.match(r'(\d+)-', os.path.basename(p))
        if m:
            out[int(m.group(1))] = p
    return out


def main(argv):
    check = '--check' in argv
    terms, pages = by_lesson(), lessons()
    stale, missing = [], []
    for slot, path in sorted(pages.items()):
        if slot not in terms:
            missing.append(slot)
            continue
        s = open(path, encoding='utf-8').read()
        want = block(terms[slot])
        i = s.find(OPEN)
        j = s.index(ANCHOR)
        if i == -1:
            have, cut = '', j
        else:
            have, cut = s[i:j], i
        if have == want:
            continue
        stale.append(slot)
        if not check:
            open(path, 'w', encoding='utf-8').write(s[:cut] + want + s[j:])
    for slot in missing:
        print('lesson %d is named by no glossary entry' % slot)
    print()
    print('%d lessons, %d %s, %d unnamed'
          % (len(pages), len(stale), 'stale' if check else 'written', len(missing)))
    return len(stale) + len(missing) if check else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
