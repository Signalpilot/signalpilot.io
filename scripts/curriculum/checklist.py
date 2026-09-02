# -*- coding: utf-8 -*-
"""Regenerate the guidebook's step-four checklist from its own Ask lines.

The checklist is the operational form of the anatomy: the prose explains why a
rule matters, the checklist is the part that actually runs before a lesson is
committed. Keeping both by hand means they drift, and they drifted within a
day of being written, so this reads the Ask lines out of Anatomy and Between
the pages and rewrites the section between them.

    python3 scripts/curriculum/checklist.py
    python3 scripts/curriculum/checklist.py --check   # exit 1 if stale
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GB = os.path.join(ROOT, 'scripts/curriculum/GUIDEBOOK.md')
HEAD = '### Step four: the checklist'
TAIL = '### Step five is where the grade was actually won'


def unwrap(lines):
    """Join a bullet with the continuation lines that belong to it."""
    out = []
    for ln in lines:
        if ln.startswith('- '):
            out.append(ln[2:].strip())
        elif out and ln.strip() and not ln.startswith(('*', '#', '**')):
            out[-1] += ' ' + ln.strip()
        elif ln.strip() == '' or ln.startswith(('*', '#', '**')):
            if ln.strip() == '':
                continue
            break
    return out


def wrap(text, indent='  ', width=76):
    words, lines, cur = text.split(), [], '- '
    for w in words:
        if len(cur) + len(w) + 1 > width and cur.strip() != '-':
            lines.append(cur.rstrip())
            cur = indent + w + ' '
        else:
            cur += w + ' '
    lines.append(cur.rstrip())
    return '\n'.join(lines)


def build(g):
    anat = g[g.index('## Anatomy of a lesson'):g.index('## Between the pages')]
    out = [HEAD, '',
           'Generated from the Ask lines in **Anatomy** and **Between the pages** by',
           '`scripts/curriculum/checklist.py`. Change a rule there and regenerate; never',
           'retype this section, because a hand-kept copy drifts from its original',
           'inside a day.']
    for m in re.finditer(r'### \d+\. The (.+?)\n(.*?)(?=\n### |\Z)', anat, re.S):
        name, block = m.group(1), m.group(2)
        a = re.search(r'\*\*Ask\.\*\*(.*)', block, re.S)
        if not a:
            continue
        body = a.group(1)
        if body.lstrip().startswith('-') or '\n-' in body:
            qs = unwrap([l for l in body.split('\n')])
        else:
            qs = [' '.join(body.split())]
        qs = [q.rstrip(' -') for q in qs]
        out.append('\n**%s**' % (name[0].upper() + name[1:]))
        out += [wrap(q) for q in qs if q]
    btw = g[g.index('## Between the pages'):g.index('## Seven shapes')]
    qs = [' '.join(x.split()) for x in re.findall(r'\*Ask: (.+?)\*\n', btw, re.S)]
    out.append('\n**Between the pages**')
    out += [wrap(q[0].upper() + q[1:]) for q in qs]
    return '\n'.join(out) + '\n\n'


def main():
    g = io.open(GB, encoding='utf-8').read()
    new = g[:g.index(HEAD)] + build(g) + g[g.index(TAIL):]
    if '--check' in sys.argv:
        stale = new != g
        print('checklist is ' + ('STALE' if stale else 'up to date'))
        return 1 if stale else 0
    io.open(GB, 'w', encoding='utf-8').write(new)
    print('checklist regenerated: %d questions'
          % len(re.findall(r'^- ', build(g), re.M)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
