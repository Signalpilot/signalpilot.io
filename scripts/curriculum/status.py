#!/usr/bin/env python3
"""Derive the state of the academy rebuild from the files themselves.

Nothing here trusts a claim. Every column is read off disk. Run it first,
after a compaction, after a crash, or any time the next step is unclear:

    python3 scripts/curriculum/status.py            # one screen, whole course
    python3 scripts/curriculum/status.py --next     # the single next action
    python3 scripts/curriculum/status.py 27         # one slot in detail
"""
import csv,glob,json,os,re,sys,html

ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAP=os.path.join(ROOT,'scripts/curriculum/slotmap.tsv')
LOCALES=['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
# The seven parts of the academy form, as they are marked in the HTML.
PARTS=['claim','prereq','development','worked','problems','bounds','sources']

def slots():
    return list(csv.DictReader(open(MAP,encoding='utf-8'),delimiter='\t'))

def find(pattern,base=ROOT):
    return sorted(glob.glob(os.path.join(base,pattern)))

RENUMBERED=os.path.exists(os.path.join(ROOT,'scripts/curriculum/.renumbered'))

def enfile(row):
    """The English file backing a slot.

    Before the renumber runs, a slot's content still lives at its SOURCE
    number. Resolving by the new number would silently match whatever old
    lesson happens to carry that number -- which it did, and reported old
    lesson 27 as the state of new slot 27.
    """
    n = row['new'] if RENUMBERED else row['source']
    if n=='-': return None
    hits=find(f'education/curriculum/*/{int(n):02d}-*.html')
    return hits[0] if hits else None

def staged(new):
    hits=find(f'education/curriculum/_staging/new-{int(new):02d}-*.html')
    return hits[0] if hits else None

def parts_present(path):
    s=open(path,encoding='utf-8').read()
    return [p for p in PARTS if f'data-part="{p}"' in s]

# A lesson counts as finished only when the ledger records a second read that
# found something. See academy-ledger.tsv.
# The reading contract, from SYLLABUS.md. A lesson that breaks it is not finished,
# however good the prose is.
BUDGET={'words':1800,'callouts':1,'accordions':0,'tables':2,'emoji_headings':0}

def measure(path):
    s=open(path,encoding='utf-8').read()
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

def overbudget(path):
    return {k:(v,BUDGET[k]) for k,v in measure(path).items() if v>BUDGET[k]}

def words(path):
    s=open(path,encoding='utf-8').read()
    m=re.search(r'<div class="wrap article-grid"',s)
    s=s[m.start():] if m else s
    s=re.sub(r'<script.*?</script>|<style.*?</style>','',s,flags=re.S)
    return len(re.findall(r'\w+',html.unescape(re.sub(r'<[^>]+>',' ',s))))

def locales_built(path):
    """How many of the 11 locales carry a build of this file."""
    rel=os.path.relpath(path,ROOT)
    return [L for L in LOCALES if os.path.exists(os.path.join(ROOT,L,rel[len('education/'):]))
            or os.path.exists(os.path.join(ROOT,L,rel))]

def ledger():
    p=os.path.join(ROOT,'scripts/curriculum/academy-ledger.tsv')
    if not os.path.exists(p): return {}
    out={}
    for r in csv.DictReader(open(p,encoding='utf-8'),delimiter='\t'):
        out[r['slot'].strip()]=r
    return out

def state(row,led):
    """The single word that describes where this slot is."""
    new=row['new']
    p=enfile(row)
    if row['kind']=='NEW' and not p and not staged(new): return 'TOWRITE',None
    p=p or staged(new)
    if not p: return 'MISSING',None
    got=parts_present(p)
    if len(got)<len(PARTS): return 'PROSE',p          # exists, not yet in academy form
    if overbudget(p): return 'BLOATED',p              # in form, but breaks the reading contract
    if len(locales_built(p))<11: return 'ENGLISH',p   # in form, not yet translated
    if new not in led: return 'UNLOGGED',p
    if led[new].get('read2','').strip().lower()!='yes': return 'UNREAD',p
    if not led[new].get('found','').strip(): return 'UNREAD',p
    return 'DONE',p

def main():
    rows=slots(); led=ledger()
    if len(sys.argv)>1 and sys.argv[1].isdigit():
        r=[x for x in rows if x['new']==str(int(sys.argv[1]))][0]
        st,p=state(r,led)
        print(f"slot {r['new']}  module {r['module']}  {r['title']}")
        print(f"  source   : {r['source']} ({r['kind']})")
        print(f"  renumber : {'done' if RENUMBERED else 'NOT YET - file resolved by source number'}")
        print(f"  state    : {st}")
        print(f"  file     : {p or '-'}")
        if p:
            print(f"  words    : {words(p)}")
            print(f"  parts    : {'/'.join(parts_present(p)) or 'none'}")
            print(f"  missing  : {'/'.join(x for x in PARTS if x not in parts_present(p)) or 'none'}")
            print(f"  locales  : {len(locales_built(p))}/11")
            ob=overbudget(p)
            print(f"  budget   : " + ('ok' if not ob else ', '.join(f'{k} {v[0]}>{v[1]}' for k,v in ob.items())))
        return
    counts={}; firsts={}
    for r in rows:
        st,p=state(r,led)
        counts[st]=counts.get(st,0)+1
        firsts.setdefault(st,r)
    if '--next' in sys.argv:
        # Course order, not state order. Working the easy state first is how a
        # module ends up with holes in the middle of it.
        verb={'TOWRITE':'write from nothing','PROSE':'rebuild into academy form',
              'BLOATED':'cut to the reading contract','MISSING':'find the source file',
              'UNREAD':'READ IT END TO END and record what that found',
              'ENGLISH':'translate into 11 locales','UNLOGGED':'add the ledger row'}
        for r in rows:
            st,p=state(r,led)
            if st=='DONE': continue
            print(f"NEXT: slot {r['new']} (module {r['module']}) - {verb[st]} - {r['title']}")
            if r['source']!='-':
                print(f"      source: old lesson {r['source']}  {enfile(r) or ''}")
                if st=='PROSE': print(f"      READ THE SOURCE FIRST. It is not a rewrite until it has been read.")
            return
        print('NEXT: nothing outstanding.'); return
    cur=None
    for r in rows:
        if r['module']!=cur:
            cur=r['module']
            print(f"\n--- Module {cur} " + "-"*54)
        st,p=state(r,led)
        w=words(p) if p else 0
        loc=len(locales_built(p)) if p else 0
        src=f"<{r['source']}" if r['source']!='-' else " NEW"
        print(f"  {int(r['new']):>2} {src:>5} {st:<9} {w:>5}w {loc:>2}/11  {r['title'][:44]}")
    # The hub pages are generated from the catalogue; if they have drifted the
    # site is advertising lessons that do not match what it links to.
    try:
        import subprocess
        rc=subprocess.run([sys.executable,os.path.join(ROOT,'scripts/curriculum/hubs.py'),'--check'],
                          capture_output=True,text=True).returncode
        print('\n  hubs: ' + ('education/index.html matches the catalogue' if rc==0
              else 'STALE -- run python3 scripts/curriculum/hubs.py'))
    except Exception as e:
        print('\n  hubs: could not check (%s)' % e)
    print('\n' + "="*66)
    print('  '+'   '.join(f'{k}:{v}' for k,v in sorted(counts.items(),key=lambda kv:-kv[1])))
    print(f'  {len(rows)} slots total')

if __name__=='__main__':
    main()
