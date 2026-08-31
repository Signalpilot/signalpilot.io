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

if __name__=='__main__':
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
