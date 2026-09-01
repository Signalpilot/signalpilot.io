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
not well-formed or that breaks the reading contract.
"""
import re,os,html
from html.parser import HTMLParser

ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# The chrome donor. This used to point at old lesson 24, which the renumber
# moved out from under it. Slot 1 is an academy lesson already in the target
# form and its path is fixed by the syllabus, so it will not move again.
TPL=os.path.join(ROOT,'education/curriculum/beginner/01-what-a-market-solves.html')
STAGE=os.path.join(ROOT,'education/curriculum/_staging')
BUDGET={'words':1800,'callouts':1,'accordions':0,'tables':2,'emoji_headings':0}
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
    nx=f"https://www.signalpilot.io/education/curriculum/{tier}/{m['next'][0]}.html" if m.get('next') else ''
    pv=f"https://www.signalpilot.io/education/curriculum/{tier}/{m['prev'][0]}.html" if m.get('prev') else ''
    head=re.sub(r'<link rel="prev"[^>]*/>',f'<link rel="prev" href="{pv}"/>' if pv else '',head)
    head=re.sub(r'<link rel="next" href=".*?"',f'<link rel="next" href="{nx}"',head)
    head=re.sub(r'(<meta name="sp-level" content=").*?"',rf'\g<1>{lvl}"',head)
    head=re.sub(r'(<meta name="sp-order" content=").*?"',rf'\g<1>{m["slot"]}"',head)

    hdr=f'''<article class="article">
  <header>
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/education/">Home</a> &rsaquo; <a href="/education/{tier}.html">{lvl} Curriculum</a> &rsaquo; <span>{m['title']}</span>
      </nav>
      <span class="badge">{BADGE[lvl]} {lvl} &bull; Lesson {m['slot']} of 85</span>
      <h1 class="headline xl">{m['title']}</h1>
      <div class="meta">Reading time ~{m['minutes']} min &bull; Module {m['module']}<span class="view-count" data-view-count style="display:none"> &bull; <span data-view-num></span></span></div>

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
    tail=tail.replace('/education/curriculum/intermediate/22-bid-ask-spread-dynamics.html',
                      f"/education/curriculum/{tier}/{m['prev'][0]}.html" if m.get('prev') else f'/education/{tier}.html')
    tail=tail.replace('/education/curriculum/intermediate/26-market-making-hft.html',
                      f"/education/curriculum/{tier}/{m['next'][0]}.html" if m.get('next') else f'/education/{tier}.html')
    if not m.get('prev'): tail=tail.replace('&larr; Previous Lesson','&larr; Curriculum')

    # The tail also carries the donor's own identity in two script blocks: the
    # "continue reading" record and the discussion thread key. Copied verbatim,
    # every rebuilt lesson claims to be the donor -- slots 1-5 shipped sharing
    # one comment thread, so a reader commenting on the spread lesson posted
    # into old lesson 24's thread.
    disc = f"{tier}-{int(m['slot']):02d}-{m['slug'].split('-', 1)[1]}"
    rec = ("sp_edu_last_article', JSON.stringify({ title: '%s', level: '%s', order: '%s', "
           "url: window.location.pathname, progress: 0 }"
           % (m['title'].replace("'", "\\'"), lvl, m['slot']))
    tail = re.sub(r"sp_edu_last_article', JSON\.stringify\(\{[^}]*\}", lambda _: rec, tail)
    tail = re.sub(r"DiscussionSystem\.init\('[^']*'\)",
                  f"DiscussionSystem.init('{disc}')", tail)

    out=head+hdr+prose+rel+tail
    errs=wellformed(out)
    if errs: raise AssertionError(f"slot {m['slot']}: HTML not well-formed: {errs}")
    got=[p for p in PARTS if f'data-part="{p}"' in out]
    if len(got)<len(PARTS):
        raise AssertionError(f"slot {m['slot']}: missing parts: {[p for p in PARTS if p not in got]}")
    mm=measure(out)
    over={k:(v,BUDGET[k]) for k,v in mm.items() if v>BUDGET[k]}
    if over: raise AssertionError(f"slot {m['slot']}: over budget: {over}")
    os.makedirs(STAGE,exist_ok=True)
    p=os.path.join(STAGE,f"new-{int(m['slot']):02d}-{m['slug'].split('-',1)[1]}.html")
    open(p,'w',encoding='utf-8').write(out)
    print(f"slot {m['slot']:>2}  {mm['words']:>5}w  {os.path.relpath(p,ROOT)}")
    return p
