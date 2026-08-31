# -*- coding: utf-8 -*-
"""Move the curriculum from its old 86-slot numbering to the 85-slot syllabus.

Dry run by default. Nothing is written without --execute.

    python3 scripts/curriculum/renumber.py            # show the plan
    python3 scripts/curriculum/renumber.py --execute  # do it
"""
import csv,glob,json,os,re,sys,shutil

ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
LOCALES=['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
# module -> tier. 1-3 beginner, 4-6 intermediate, 7-8 advanced, 9-11 professional.
def tier_of(mod):
    m=int(mod)
    return 'beginner' if m<=3 else 'intermediate' if m<=6 else 'advanced' if m<=8 else 'professional'

# Slugs are read by humans in a URL bar and in search results. Stripping every
# small word produced "03-fill" and "12-should-trade", which are worse than the
# titles they came from. Drop only leading articles, keep the sentence.
def slugify(t,maxlen=42):
    t=t.lower().replace('&rsquo;',"'").replace("'",'')
    t=re.sub(r'[^a-z0-9]+','-',t).strip('-')
    t=re.sub(r'^(the|a|an)-','',t)
    if len(t)<=maxlen: return t
    out=[]
    for w in t.split('-'):
        if len('-'.join(out+[w]))>maxlen: break
        out.append(w)
    return '-'.join(out) or t[:maxlen]

# A few titles need a hand-written slug rather than a truncated one.
SLUG_OVERRIDE={1:'what-a-market-solves',2:'the-order-book',3:'what-a-fill-is',
  4:'the-spread',5:'why-anyone-quotes',
  6:'the-candle-is-a-summary',9:'who-else-is-here',10:'every-trade-starts-negative',
  11:'slippage-and-impact',12:'what-should-you-trade',13:'what-you-are-buying',
  18:'what-an-edge-feels-like',19:'how-long-until-you-know',21:'where-the-stop-goes',
  24:'when-the-drawdown-arrives',26:'order-book-is-theater',27:'the-liquidity-lie',
  35:'sweeps-beyond-the-first',36:'markets-have-modes',38:'what-a-timeframe-is',
  39:'trading-more-than-one',48:'what-an-indicator-is',53:'market-makers-business',
  54:'where-your-order-goes',55:'what-speed-buys',57:'how-institutions-execute',
  62:'observation-to-hypothesis',67:'is-the-edge-gone',71:'positions-are-one-position',
  74:'where-portfolio-theory-fails',81:'capstone-your-system'}

def load():
    rows=list(csv.DictReader(open('scripts/curriculum/slotmap.tsv',encoding='utf-8'),delimiter='\t'))
    for r in rows:
        r['new']=int(r['new']); r['tier']=tier_of(r['module'])
        r['slug']=f"{r['new']:02d}-{SLUG_OVERRIDE.get(r['new']) or slugify(r['title'])}"
        r['dest']=f"education/curriculum/{r['tier']}/{r['slug']}.html"
        r['merges']=[int(x) for x in r['kind'].split('+')[1:]]
    return rows

def oldpath(n):
    h=glob.glob(f'education/curriculum/*/{int(n):02d}-*.html')
    return h[0] if h else None

def plan():
    rows=load()
    moves=[]; merges=[]; news=[]
    for r in rows:
        if r['source']=='-':
            st=glob.glob(f"education/curriculum/_staging/new-{r['new']:02d}-*.html")
            news.append((st[0] if st else None,r['dest'],r))
        else:
            src=oldpath(r['source'])
            moves.append((src,r['dest'],r))
        for m in r['merges']:
            merges.append((oldpath(m),f'education/curriculum/_merged/{int(m):02d}.html',r))
    return rows,moves,merges,news

def main():
    rows,moves,merges,news=plan()
    print(f'{len(moves)} moves, {len(merges)} merged-aside, {len(news)} new slots\n')
    dests=[d for _,d,_ in moves]+[d for _,d,_ in news]
    dup=[d for d in set(dests) if dests.count(d)>1]
    print('duplicate destinations:',dup or 'none')
    print('missing sources       :',[r['source'] for s,_,r in moves if not s] or 'none')
    print('unstaged new slots    :',[r['new'] for s,_,r in news if not s] or 'none')
    print()
    for src,dst,r in sorted(moves+news,key=lambda x:x[2]['new'])[:12]:
        print(f"  {r['new']:>2} M{r['module']:<2} {(src or 'NOT WRITTEN YET'):<58} -> {dst}")
    print('  ...')
    print(f"\nmerged aside: {[r for r,_,_ in [(x[2]['new'],0,0) for x in merges]][:0] or ''}")
    for src,dst,r in merges: print(f"  old {os.path.basename(src or '?'):<44} -> _merged/, redirect to slot {r['new']}")




# ---------------------------------------------------------------- execute ----
LOCALE_DIRS=LOCALES

def rel(p):  return p[len('education/'):] if p.startswith('education/') else p

def build_pathmap(rows):
    """old path (relative to education/) -> new path. Includes merged-aside."""
    pm={}
    for r in rows:
        if r['source']!='-':
            src=oldpath(r['source'])
            if src: pm[rel(src)]=rel(r['dest'])
        for m in r['merges']:
            src=oldpath(m)
            if src: pm[rel(src)]=f'curriculum/_merged/{m:02d}.html'
    return pm

def move_all(pm,run):
    """Move en + every locale copy. Returns list of (src,dst) actually moved."""
    done=[]
    for old,new in pm.items():
        for base in ['education']+[f'{L}/education' for L in LOCALE_DIRS]:
            s=os.path.join(base,old); d=os.path.join(base,new)
            if not os.path.exists(s): continue
            if run:
                os.makedirs(os.path.dirname(d),exist_ok=True)
                shutil.move(s,d)
            done.append((s,d))
    return done

def place_new(rows,run):
    placed=[]
    for r in rows:
        if r['source']!='-': continue
        st=glob.glob(f"education/curriculum/_staging/new-{r['new']:02d}-*.html")
        if not st: continue
        d=r['dest']
        if run:
            os.makedirs(os.path.dirname(d),exist_ok=True)
            shutil.move(st[0],d)
        placed.append((st[0],d))
    return placed

def rewrite_refs(pm,run):
    """One pass over every file, replacing each old path with its new one.

    Sequential str.replace would double-apply: rewriting 01->27 and then
    something->01 turns the second into 27 as well. A single regex pass with a
    lookup function touches each occurrence exactly once.
    """
    pat=re.compile(r'curriculum/[a-z]*/[0-9][0-9]-[a-z0-9-]*\.html')
    files=[]
    for ext in ('html','json','js','xml','txt','md'):
        files+=glob.glob(f'**/*.{ext}',recursive=True)
    files=[f for f in files if '/node_modules/' not in f and not f.startswith('.git')]
    changed=[]; hits=0
    for f in files:
        try: s=open(f,encoding='utf-8').read()
        except (UnicodeDecodeError,IsADirectoryError): continue
        n=[0]
        def sub(m):
            t=pm.get(m.group(0))
            if t: n[0]+=1; return t
            return m.group(0)
        out=pat.sub(sub,s)
        if n[0]:
            hits+=n[0]; changed.append((f,n[0]))
            if run: open(f,'w',encoding='utf-8').write(out)
    return changed,hits

def fix_meta(rows,run):
    """Per-lesson chrome: canonical, sp-order/level, breadcrumb, badge, prev/next."""
    by=sorted(rows,key=lambda r:r['new'])
    touched=0
    for i,r in enumerate(by):
        f=r['dest']
        if not os.path.exists(f): continue
        s=open(f,encoding='utf-8').read(); o=s
        tier=r['tier']; lvl=tier.capitalize()
        url=f"https://www.signalpilot.io/{r['dest']}"
        s=re.sub(r'(rel="canonical" href=")[^"]*"',rf'\g<1>{url}"',s)
        s=re.sub(r'(property="og:url" content=")[^"]*"',rf'\g<1>{url}"',s)
        s=re.sub(r'(name="twitter:url" content=")[^"]*"',rf'\g<1>{url}"',s)
        s=re.sub(r'(<meta name="sp-order" content=")[^"]*"',rf'\g<1>{r["new"]}"',s)
        s=re.sub(r'(<meta name="sp-level" content=")[^"]*"',rf'\g<1>{lvl}"',s)
        s=re.sub(r'href="/education/(beginner|intermediate|advanced|professional)\.html"',
                 f'href="/education/{tier}.html"',s)
        s=re.sub(r'>(Beginner|Intermediate|Advanced|Professional) Curriculum<',f'>{lvl} Curriculum<',s)
        s=re.sub(r'(<span class="badge">\s*&?#?[0-9A-Za-z;]*\s*)(Beginner|Intermediate|Advanced|Professional)(\s*&bull;\s*Lesson\s*)\d+(\s*of\s*)\d+',
                 rf'\g<1>{lvl}\g<3>{r["new"]}\g<4>85',s)
        s=re.sub(r'(<span class="badge">[^<]*?)(Beginner|Intermediate|Advanced|Professional)([^<]*?Lesson )\d+( of )\d+',
                 rf'\g<1>{lvl}\g<3>{r["new"]}\g<4>85',s)
        pv=by[i-1] if i>0 else None; nx=by[i+1] if i+1<len(by) else None
        s=re.sub(r'<link rel="prev" href="[^"]*"/>',
                 f'<link rel="prev" href="https://www.signalpilot.io/{pv["dest"]}"/>' if pv else '',s)
        s=re.sub(r'<link rel="next" href="[^"]*"/>',
                 f'<link rel="next" href="https://www.signalpilot.io/{nx["dest"]}"/>' if nx else '',s)
        s=re.sub(r'(<a class="btn btn-ghost" href=")[^"]*(">&larr;)',
                 rf'\g<1>/{pv["dest"]}\g<2>' if pv else rf'\g<1>/education/{tier}.html\g<2>',s)
        s=re.sub(r'(<a class="btn btn-primary" href=")[^"]*(">Next Lesson)',
                 rf'\g<1>/{nx["dest"]}\g<2>' if nx else rf'\g<1>/education/{tier}.html\g<2>',s)
        if s!=o:
            touched+=1
            if run: open(f,'w',encoding='utf-8').write(s)
    return touched


MODULE_NAMES={1:'The Mechanism',2:'The Cost of Trading',3:'Uncertainty, Risk and Ruin',
 4:'Reading the Auction',5:'Context',6:'Indicators, Honestly',7:'The Other Side',
 8:'Building a System',9:'Portfolio',10:'The Profession',11:'Electives'}

def fix_index(rows,run):
    """Rebuild the catalogue from the lesson files themselves.

    An earlier version copied each entry from the previous index.json, keyed by
    the old lesson number. Run twice, that reads a file whose keys are already
    the NEW numbers, and every title silently attaches to the wrong lesson --
    which is what happened. Title, description and word count now come from the
    page; only the hand-curated fields (tags, indicators) are carried over, and
    they are matched on href, which is stable.
    """
    import html as H
    p='education/curriculum/index.json'
    prev={}
    if os.path.exists(p):
        for e in json.load(open(p,encoding='utf-8')):
            prev[e['href']]=e
    out=[]
    for r in sorted(rows,key=lambda x:x['new']):
        f=r['dest']
        if not os.path.exists(f): continue      # never advertise a lesson that 404s
        s=open(f,encoding='utf-8').read()
        tier=r['tier']; href=f'/{f}'
        def grab(pat,d=''):
            m=re.search(pat,s,re.S)
            return H.unescape(re.sub(r'<[^>]+>','',m.group(1))).strip() if m else d
        title=grab(r'<h1[^>]*>(.*?)</h1>') or r['title']
        desc=grab(r'<meta name="description" content="(.*?)">')
        mins=re.search(r'class="meta">[^<]*?~(\d+)\s*min',s)
        body=s[s.find('<div class="wrap article-grid"'):]
        words=len(re.findall(r'\w+',H.unescape(re.sub(r'<[^>]+>',' ',body))))
        old=prev.get(href,{})
        out.append({'id':f"{tier}-{r['new']:02d}",'href':href,'title':title,'description':desc,
            'category':f"Module {r['module']}: {MODULE_NAMES[int(r['module'])]}",
            'level':tier.capitalize(),'order':r['new'],'status':'complete','wordCount':words,
            'readingTime':(mins.group(1)+' min') if mins else old.get('readingTime','10 min'),
            'tags':old.get('tags',[]),'spIndicators':old.get('spIndicators',[]),
            'lastUpdated':'2026-08-31'})
    if run: json.dump(out,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
    return out

def add_redirects(pm,rows,run):
    p='education/vercel.json'
    d=json.load(open(p,encoding='utf-8'))
    have={x['source'] for x in d['redirects']}
    merged_target={}
    for r in rows:
        for m in r['merges']: merged_target[f'curriculum/_merged/{m:02d}.html']=r['dest']
    added=0
    for old,new in sorted(pm.items()):
        src=f'/education/{old}'
        dst=f"/{merged_target.get(new)}" if new in merged_target else f'/education/{new}'
        if src==dst or src in have: continue
        d['redirects'].append({'source':src,'destination':dst,'permanent':True})
        have.add(src); added+=1
    if run: json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
    return added

def execute(run):
    rows=load()
    pm=build_pathmap(rows)
    moved=move_all(pm,run)
    placed=place_new(rows,run)
    changed,hits=rewrite_refs(pm,run)
    meta=fix_meta(rows,run) if run else 0
    idx=fix_index(rows,run)
    reds=add_redirects(pm,rows,run)
    print(f'  files moved       : {len(moved)}   ({len(pm)} lessons x en+11 locales)')
    print(f'  new lessons placed: {len(placed)}')
    print(f'  reference rewrites: {hits} in {len(changed)} files')
    print(f'  lesson chrome fixed: {meta}')
    print(f'  index.json entries : {len(idx)}')
    print(f'  redirects added    : {reds}')
    if run: open('scripts/curriculum/.renumbered','w').write('done\n')


if __name__=='__main__':
    if '--execute' in sys.argv:
        print('EXECUTING'); execute(True)
    else:
        main(); print('\nDRY RUN. Pass --execute to apply.')


BADGE_EMOJI={'beginner':'\U0001F7E2','intermediate':'\U0001F7E1',
             'advanced':'\U0001F7E0','professional':'\U0001F534'}

def fix_badges(rows,run):
    """Tier emoji on the lesson badge, and the tier/number on related-lesson cards.

    The chrome pass rewrote the level word and the lesson number but left the
    coloured dot in front of it, so moved lessons read '\U0001F7E1 Beginner'. And the
    related cards still carried old-scheme labels ('Intermediate #25') even
    though their hrefs had been rewritten -- so the label and the link disagreed.
    The href is now the source of truth for the label.
    """
    by={r['new']:r for r in rows}
    href_re=re.compile(r'href="/education/curriculum/([a-z]+)/(\d\d)-')
    fixed=0
    for r in rows:
        f=r['dest']
        if not os.path.exists(f): continue
        s=open(f,encoding='utf-8').read(); o=s
        # the page's own badge
        s=re.sub(r'(<span class="badge">)\s*[\U0001F300-\U0001FAFF]?\s*(Beginner|Intermediate|Advanced|Professional)(\s*&bull;)',
                 rf'\g<1>{BADGE_EMOJI[r["tier"]]} \g<2>\g<3>',s)
        # related cards: label follows the link
        def card(m):
            block=m.group(0)
            h=href_re.search(block)
            if not h: return block
            tier,num=h.group(1),int(h.group(2))
            return re.sub(r'<span class="badge">[^<]*</span>',
                          f'<span class="badge">{tier.capitalize()} #{num}</span>',block,count=1)
        s=re.sub(r'<div class="card"[^>]*>.*?</div>',card,s,flags=re.S)
        if s!=o:
            fixed+=1
            if run: open(f,'w',encoding='utf-8').write(s)
    return fixed
