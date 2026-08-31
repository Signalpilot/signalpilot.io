import re,html,textwrap,sys
s=open(sys.argv[1],encoding='utf-8').read()
m=re.search(r'<div class="wrap article-grid"',s); b=s[m.start():]
b=b[:b.index('<div class="section-break"><span>Related')]
b=re.sub(r'<h3[^>]*>(.*?)</h3>',r'\n\n### \1\n',b,flags=re.S)
b=re.sub(r'<div class="section-break"><span>(.*?)</span></div>',r'\n\n== \1 ==\n',b,flags=re.S)
b=re.sub(r'<tr>','\n|ROW| ',b); b=re.sub(r'<t[dh][^>]*>',' | ',b)
b=re.sub(r'<li>',r'\n  * ',b)
b=re.sub(r'</p>|</li>|<br>','\n\n',b)
b=re.sub(r'<[^>]+>','',b)
b=html.unescape(b)
for para in re.split(r'\n\s*\n',b):
    t=' '.join(para.split())
    if not t: continue
    if t.startswith('###') or t.startswith('=='): print('\n'+t)
    elif t.startswith('|ROW|'): print('   '+t.replace('|ROW|','').strip())
    elif t.startswith('*'): print(textwrap.fill(t,94,subsequent_indent='    '))
    else: print(textwrap.fill(t,94)+'\n')
