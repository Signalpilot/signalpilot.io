# -*- coding: utf-8 -*-
"""Build one academy lesson from the site template.

The chrome (head, nav, progress, discussion, sidebar, footer) is lifted from a
real lesson so a new page is structurally identical to an existing one. Only the
metadata and the prose are supplied per lesson.

    from mklesson import build
    build(meta=dict(slot=2, title='The Order Book', slug='02-the-order-book',
                    desc='...', level='Beginner', module='1: The Mechanism',
                    minutes=7, prev=('01-what-a-market-solves','What a Market Solves'),
                    next=('03-what-a-fill-is','What a Fill Actually Is')),
          prose=..., related=[(slot,title,slug,why), ...])

Writes to education/curriculum/_staging/ and refuses to write anything that is
not well-formed, is missing one of the seven parts, links to a page that does
not exist, or breaks the structural half of the reading contract. Word count is
reported, never enforced.
"""
import re,os,html
from html.parser import HTMLParser

ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# The chrome donor. This used to point at old lesson 24, which the renumber
# moved out from under it. Slot 1 is an academy lesson already in the target
# form and its path is fixed by the syllabus, so it will not move again.
TPL=os.path.join(ROOT,'education/curriculum/beginner/01-what-a-market-solves.html')
STAGE=os.path.join(ROOT,'education/curriculum/_staging')
# The structural half of the reading contract, and it is HARD: these are the
# things that made the old corpus unreadable -- one finding restated in a pull
# quote, a stats table, a callout and a quiz; material hidden behind an
# accordion; emphasis spent until none of it means anything.
BUDGET={'callouts':1,'accordions':0,'tables':2,'emoji_headings':0}

# There is NO word rule here, of any kind. There was a ceiling at 1800 that
# refused to write anything longer -- slot 15 was refused three times and
# trimmed to fit, which is cutting a lesson to satisfy a number. That was
# removed. An advisory at 2500 was left in its place, and that was removed too:
# it never refused anything, but it printed a verdict on length, and a verdict
# is a ceiling that argues instead of blocking. It also did nothing the second
# read does not already do, which is ask whether anything is said twice.
# The count is printed below as a fact, with nothing attached to it.
PARTS=['claim','prereq','development','worked','problems','bounds','sources']
TIERDIR={'Beginner':'beginner','Intermediate':'intermediate','Advanced':'advanced','Professional':'professional'}
BADGE={'Beginner':'&#128994;','Intermediate':'&#128993;','Advanced':'&#128992;','Professional':'&#128308;'}

def wellformed(s):
    VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    errs=[]
    class P(HTMLParser):
        def __init__(s2): super().__init__(convert_charrefs=False); s2.st=[]
        def handle_starttag(s2,t,a):
            if t not in VOID: s2.st.append((t,s2.getpos()))
        def handle_endtag(s2,t):
            if t in VOID: return
            if not s2.st: errs.append(f'stray </{t}> at {s2.getpos()}'); return
            if s2.st[-1][0]!=t:
                errs.append(f'</{t}> at {s2.getpos()} closes <{s2.st[-1][0]}> opened at {s2.st[-1][1]}')
                s2.st.pop(); return
            s2.st.pop()
    p=P(); p.feed(s); p.close()
    if p.st: errs.append('left open: '+','.join(t for t,_ in p.st))
    return errs

def measure(s):
    m=re.search(r'<div class="wrap article-grid"',s)
    b=s[m.start():] if m else s
    i=b.find('<div class="discussion-section"')
    if i>0: b=b[:i]
    b=re.sub(r'<script.*?</script>|<style.*?</style>','',b,flags=re.S)
    return {'words':len(re.findall(r'\w+',html.unescape(re.sub(r'<[^>]+>',' ',b)))),
            'callouts':len(re.findall(r'class="callout',b)),
            'accordions':len(re.findall(r'<details',b)),
            'tables':len(re.findall(r'<table',b)),
            'emoji_headings':len(re.findall(r'<h[234][^>]*>[^<]*[\U0001F300-\U0001FAFF]',b))}

def build(meta,prose,related):
    m=meta; lvl=m['level']; tier=TIERDIR[lvl]
    url=f"https://www.signalpilot.io/education/curriculum/{tier}/{m['slug']}.html"
    s=open(TPL,encoding='utf-8').read()
    head=s[:s.index('<article class="article">')]
    T=f"{m['title']} &mdash; Signal Pilot Education"
    head=re.sub(r'<title>.*?</title>',f'<title>{T}</title>',head,flags=re.S)
    head=re.sub(r'<meta name="description" content=".*?">',f'<meta name="description" content="{m["desc"]}">',head,flags=re.S)
    for a,b in [('property="og:title" content="',T),('name="twitter:title" content="',T),
                ('property="og:description" content="',m['desc']),('name="twitter:description" content="',m['desc']),
                ('rel="canonical" href="',url),('property="og:url" content="',url),('name="twitter:url" content="',url)]:
        head=re.sub(re.escape(a)+r'.*?"',a+b+'"',head)
    # A module boundary is also a tier boundary: slot 24 is the last Beginner
    # lesson and slot 25 lives in intermediate/. Resolving "next" against this
    # lesson's own tier would have produced beginner/25-..., which the dead-link
    # check below catches -- so the tier of each neighbour can be named.
    ptier=m.get('prev_tier',tier); ntier=m.get('next_tier',tier)
    nx=f"https://www.signalpilot.io/education/curriculum/{ntier}/{m['next'][0]}.html" if m.get('next') else ''
    pv=f"https://www.signalpilot.io/education/curriculum/{ptier}/{m['prev'][0]}.html" if m.get('prev') else ''
    # The donor is slot 1, which has no previous lesson and so carries no
    # <link rel="prev"> at all. Substituting into a tag that is not there is a
    # silent no-op, which is how slots 4 and 6-10 shipped with no prev link in
    # the head while the visible navigation was correct. Drop whatever the
    # donor had and write both tags at an anchor that is always present.
    head = re.sub(r'\s*<link rel="prev"[^>]*/>', '', head)
    tags = (f'<link rel="prev" href="{pv}"/>\n  ' if pv else '') + f'<link rel="next" href="{nx}"/>'
    head, n_rel = re.subn(r'<link rel="next"[^>]*/>', lambda _: tags, head)
    if n_rel != 1:
        raise AssertionError(f'slot {m["slot"]}: <link rel="next"> not found in the donor head')
    head=re.sub(r'(<meta name="sp-level" content=").*?"',rf'\g<1>{lvl}"',head)
    head=re.sub(r'(<meta name="sp-order" content=").*?"',rf'\g<1>{m["slot"]}"',head)

    # An appendix is a lesson in form -- same seven parts, same reading
    # contract -- but it is not one of the numbered 85, so it must not claim a
    # slot in the badge or a place in the linear path. Everything else, the
    # dead-link guard included, applies to it unchanged.
    apx = bool(m.get('appendix'))
    badge = (f"&#128218; Appendix &bull; {m['module']}" if apx
             else f"{BADGE[lvl]} {lvl} &bull; Lesson {m['slot']} of 85")
    modline = m['module'] if apx else f"Module {m['module']}"
    hdr=f'''<article class="article">
  <header>
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/education/">Home</a> &rsaquo; <a href="/education/{tier}.html">{lvl} Curriculum</a> &rsaquo; <span>{m['title']}</span>
      </nav>
      <span class="badge">{badge}</span>
      <h1 class="headline xl">{m['title']}</h1>
      <div class="meta">Reading time ~{m['minutes']} min &bull; {modline}<span class="view-count" data-view-count style="display:none"> &bull; <span data-view-num></span></span></div>

      <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(118,221,255,0.2); margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-2);">
        <div>
          <div style="font-weight: 600; color: var(--text-1);">Signal Pilot</div>
          <div>Professional Trading Education</div>
        </div>
      </div>

      <div class="article-progress" style="--progress:0%">
        <div class="progress-circle"><span>0%</span></div>
        <div class="progress-text">
          <strong>You&rsquo;re making progress!</strong>
          <div style="font-size:.85rem;color:var(--muted)">Keep reading to mark this lesson complete</div>
        </div>
      </div>
    </div>
  </header>

  <div class="wrap article-grid">
    <div class="prose">
'''
    cards=''.join(f'''        <div class="card" style="padding:1rem">
          <span class="badge">Lesson {sl}</span>
          <h4 style="margin:.5rem 0 .5rem 0;font-size:1rem">{ti}</h4>
          <p style="font-size:.9rem;color:var(--muted);margin-bottom:.75rem">{why}</p>
          <a href="/education/curriculum/{tr}/{sg}.html" class="btn btn-sm btn-ghost">Read Lesson &rarr;</a>
        </div>
''' for sl,ti,tr,sg,why in related)
    rel=f'''<div class="section-break"><span>Related Lessons</span></div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%, 250px),1fr));gap:1rem;margin:1.5rem 0">
{cards}      </div>

      '''
    tail=s[s.index('<blockquote class="sp-disclaimer">'):]
    # Repoint the previous/next links STRUCTURALLY, by the anchor they sit on.
    # These used to be replaced by the donor's own two hrefs, which stopped
    # matching the moment the donor changed -- so slots 4, 6 and 7 shipped with
    # slot 1's navigation: "Next Lesson" went to lesson 2 from every one of them.
    pv = f"/education/curriculum/{ptier}/{m['prev'][0]}.html" if m.get('prev') else f'/education/{tier}.html'
    nx = f"/education/curriculum/{ntier}/{m['next'][0]}.html" if m.get('next') else f'/education/{tier}.html'
    # The donor writes the arrows as literal characters, not entities.
    tail, n_prev = re.subn(r'(<a class="btn btn-ghost" href=")[^"]*(">\s*(?:&larr;|←))',
                           lambda mm: mm.group(1) + pv + mm.group(2), tail)
    tail, n_next = re.subn(r'(<a class="btn btn-primary" href=")[^"]*(">\s*Next Lesson)',
                           lambda mm: mm.group(1) + nx + mm.group(2), tail)
    if n_prev != 1 or n_next != 1:
        raise AssertionError(f"slot {m['slot']}: navigation anchors not found "
                             f"(prev {n_prev}, next {n_next}) -- the template changed")
    if not m.get('prev'):
        tail = re.sub(r'((?:&larr;|\u2190)\s*)Previous Lesson', r'\g<1>Curriculum', tail)
    if not m.get('next'):
        tail = re.sub(r'Next Lesson(\s*(?:&rarr;|\u2192))', r'Curriculum\g<1>', tail)

    # The tail also carries the donor's own identity in two script blocks: the
    # "continue reading" record and the discussion thread key. Copied verbatim,
    # every rebuilt lesson claims to be the donor -- slots 1-5 shipped sharing
    # one comment thread, so a reader commenting on the spread lesson posted
    # into old lesson 24's thread.
    disc = (m['slug'] if apx
            else f"{tier}-{int(m['slot']):02d}-{m['slug'].split('-', 1)[1]}")
    rec = ("sp_edu_last_article', JSON.stringify({ title: '%s', level: '%s', order: '%s', "
           "url: window.location.pathname, progress: 0 }"
           % (m['title'].replace("'", "\\'"), lvl, m['slot']))
    tail = re.sub(r"sp_edu_last_article', JSON\.stringify\(\{[^}]*\}", lambda _: rec, tail)
    tail = re.sub(r"DiscussionSystem\.init\('[^']*'\)",
                  f"DiscussionSystem.init('{disc}')", tail)

    out=head+hdr+prose+rel+tail

    # No lesson ships a link to a page that does not exist. Ten slots are still
    # unwritten, and their slugs are exactly the ones a neighbouring lesson
    # wants to point at, so this has to be checked rather than remembered.
    dead=[u for u in sorted(set(re.findall(r'href="(/education/curriculum/[^"]+)"',out)))
          if not os.path.exists(os.path.join(ROOT,u.lstrip('/')))]
    if dead:
        raise AssertionError(f"slot {m['slot']}: links to pages that do not exist: {dead}")

    errs=wellformed(out)
    if errs: raise AssertionError(f"slot {m['slot']}: HTML not well-formed: {errs}")
    got=[p for p in PARTS if f'data-part="{p}"' in out]
    if len(got)<len(PARTS):
        raise AssertionError(f"slot {m['slot']}: missing parts: {[p for p in PARTS if p not in got]}")
    mm=measure(out)
    over={k:(v,BUDGET[k]) for k,v in mm.items() if k in BUDGET and v>BUDGET[k]}
    if over: raise AssertionError(f"slot {m['slot']}: breaks the reading contract: {over}")
    os.makedirs(STAGE,exist_ok=True)
    p=os.path.join(STAGE, f"new-{m['slug']}.html" if apx
                  else f"new-{int(m['slot']):02d}-{m['slug'].split('-',1)[1]}.html")
    open(p,'w',encoding='utf-8').write(out)
    note=''
    print(f"slot {m['slot']:>2}  {mm['words']:>5}w  {os.path.relpath(p,ROOT)}{note}")
    return p
