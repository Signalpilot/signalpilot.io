# -*- coding: utf-8 -*-
"""Tier 4: does each lesson TEACH before it demands or demonstrates?

The Tier 1-3 checkers ask whether a lesson is accurate, consistent and
scaffolded. All three can pass while the lesson is still hard to follow,
because they say nothing about ORDER. A lesson can carry perfect learning
objectives, a correct case study and a well-formed action list and still open
by telling the reader to widen stops with ATR nine screens before ATR is
explained.

This checks the reading order instead, against one rule: a reader should meet
the idea before they meet a demonstration of it or an instruction based on it.

  hook          a few sentences of motivation                     fine, expected
  objectives    what the lesson will do                           fine
  prerequisites what to read first                                fine
  teaching      enough explanation to have met the idea           <- the anchor
  case study    a worked story                                    belongs AFTER
  action steps  do this yourself                                  belongs AFTER

The lesson is read as a sequence of SECTIONS -- a heading and everything under
it until the next heading -- because that is the unit the reader actually
experiences, and because every naive shortcut here produces a wrong answer:

* Teaching is not the same as prose. Looking for the first <p> of 260+
  characters reported lesson 78 as "case study 1833w before teaching" when it
  is correctly ordered: it teaches its five-layer risk stack across 52
  paragraphs and 58 list items, none longer than 215 characters. The anchor
  accumulates explanation across paragraphs, list items and table cells.

* A case study is a SECTION, not a phrase. "Case study" also occurs in
  id="live-trading-case-studies", in an objectives bullet reading "Case study
  analysis: real trades", and in "Carlos (composite example)" naming an
  illustration inside a teaching section -- none of which is a case study
  placed before the teaching. Only a section counts.

* "This week" is an action-steps heading and also an ordinary sentence
  ("This week? Five losing trades in a row."). Only the heading counts.

* Lessons teach in whatever container the author reached for. Lesson 62 puts
  all four career stages inside <pre> blocks; counting only <p> and <li> made
  it look as though Jason's story arrived before any teaching at all. Every
  container that carries 50+ characters of visible text in this corpus is
  counted: p, li, pre, td, blockquote, dd.

ANCHOR_CHARS is deliberately low. The defensible claim is "this lesson
  demonstrates before it has explained anything", not "before it explained as
  much as I would like" -- at 500 the metric was separating 491 characters of
  explanation from 500 and calling that a defect.
"""
import re, glob, sys

PERSONAS = ('marcus|sarah|jason|rachel|tyler|jordan|brandon|chris|amy|eric|alex|'
            'lisa|carlos|david|emma|priya|kevin|nina|derek|brian|greg|megan|'
            'laura|ryan|tom|michael|lauren|jake|amanda|monica|jenna')
NARR = re.compile(rf'(?i)\b(he|she|his|her|him|hers|{PERSONAS})\b')

CASE   = re.compile(r'(?i)case study|composite example|worked example|real[- ]world example')
ACT    = re.compile(r'(?i)quick wins?|action steps?|action plan|your turn|practice this|'
                    r'this week[:,]|practice exercise')
OBJ    = re.compile(r"(?i)what you'?ll (?:learn|master|gain|know)|in this lesson[:,]|"
                    r'learning objective|by the end of this lesson')
PREREQ = re.compile(r'(?i)prerequisite')
# A section whose body says "(composite example)" early is a case study even
# when its heading is a headline ("From $50K to $214K: The System That Worked").
COMPOSITE = re.compile(r'(?i)composite example|case study')

HEADING = re.compile(
    r'(?is)<h[1-4]\b[^>]*>(.*?)</h[1-4]>'
    r'|<summary\b[^>]*>(.*?)</summary>'
    r'|<div class="section-break"[^>]*>\s*<span[^>]*>(.*?)</span>')
BLOCK = re.compile(r'(?is)<(p|li|td|dd|pre|blockquote)\b[^>]*>(.*?)</\1>')

MIN_BLOCK = 50       # shorter than this is a label, a crumb or a table stub
ANCHOR_CHARS = 200   # explanation the reader must meet to count as taught
NARR_HITS = 2        # more personal pronouns/names than this and it is a story
COMPOSITE_HEAD = 400 # how far into a section to look for a composite-example tell


def txt(h):
    h = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'<[a-zA-Z!/?][^>]*>', ' ', h)).strip()


def sections(body):
    """[(start, label, kind)] in document order, kind in obj/prereq/case/act/teach."""
    marks = []
    for m in HEADING.finditer(body):
        label = txt(next(g for g in m.groups() if g is not None))
        marks.append((m.start(), label))
    # Everything before the first heading is the hook; label it as such.
    spans = [(0, '', marks[0][0] if marks else len(body))]
    for i, (pos, label) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(body)
        spans.append((pos, label, end))
    out = []
    for pos, label, end in spans:
        head = txt(body[pos:pos + COMPOSITE_HEAD * 3])[:COMPOSITE_HEAD]
        if PREREQ.search(label):
            kind = 'prereq'
        elif OBJ.search(label):
            kind = 'obj'
        elif ACT.search(label):
            kind = 'act'
        elif CASE.search(label) or COMPOSITE.search(head):
            kind = 'case'
        else:
            kind = 'teach'
        out.append((pos, end, label, kind))
    return out


def profile(path):
    body = open(path, encoding='utf-8').read().split('<div class="prose">', 1)[-1]
    n = len(body) or 1
    secs = sections(body)

    def first(kind):
        return next((s for s in secs if s[3] == kind), None)

    case, act, obj = (first(k) for k in ('case', 'act', 'obj'))

    total, teach = 0, None
    for start, end, label, kind in secs:
        if kind != 'teach':
            continue
        for m in BLOCK.finditer(body, start, end):
            t = txt(m.group(2))
            if len(t) < MIN_BLOCK or len(NARR.findall(t)) > NARR_HITS:
                continue
            total += len(t)
            if total >= ANCHOR_CHARS:
                teach = m.start()
                break
        if teach is not None:
            break
    at = lambda s: None if s is None else s[0]
    return body, n, teach, at(case), at(act), at(obj)


def main(paths):
    bad = 0
    print(f'{"lesson":<38} {"case":>6} {"act":>6} {"teach":>6}  findings')
    print('-' * 84)
    for f in paths:
        body, n, teach, case, act, obj = profile(f)
        finds = []
        if teach is None:
            finds.append('NO TEACHING SECTION')
        else:
            if case is not None and case < teach:
                words = len(txt(body[case:teach]).split())
                finds.append(f'case study {words}w before teaching')
            if act is not None and act < teach:
                finds.append('action steps before teaching')
        if obj is not None and case is not None and case < obj:
            finds.append('case before objectives')
        if finds:
            bad += 1
            g = lambda x: '-' if x is None else round(x / n, 2)
            print(f'{f.split("/")[-1][:-5]:<38} {g(case):>6} {g(act):>6} {g(teach):>6}  '
                  + '; '.join(finds))
    print('-' * 84)
    print(f'lessons that demonstrate or instruct before they teach: {bad}/{len(paths)}')
    return bad


if __name__ == '__main__':
    files = sorted(glob.glob('education/curriculum/*/*.html'))
    sys.exit(1 if main(files) else 0)
