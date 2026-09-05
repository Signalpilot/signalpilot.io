# -*- coding: utf-8 -*-
"""Audit every interactive element on the education pages.

Six checks, all of them about whether a thing that looks clickable does
anything:

  script      a <script src> that 404s
  onclick     an inline onclick calling a function no loaded script defines
  button      a <button> with no onclick, no id any script binds, and no class
              any script selects
  href        an internal link whose target file does not exist
  anchor      a same-page #fragment with no element carrying that id
  event       a CustomEvent dispatched with nobody listening, or listened for
              with nobody dispatching

Run: python3 scripts/curriculum/ui.py [page ...]
Exits non-zero on findings, like the other checkers.
"""
import io, os, re, sys, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BUILTINS = {
    'window', 'document', 'alert', 'confirm', 'console', 'history', 'location',
    'this', 'event', 'Math', 'JSON', 'navigator', 'parseInt', 'parseFloat',
    'Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'localStorage',
    'sessionStorage', 'setTimeout', 'setInterval', 'fetch', 'Promise', 'e',
}


def read(p):
    return io.open(p, encoding='utf-8').read()


def scripts_for(html, page):
    """Inline scripts plus the contents of every local <script src>."""
    srcs = re.findall(r'<script[^>]+src="([^"]+)"', html)
    parts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S)
    missing = []
    for s in srcs:
        if not s.startswith('/'):
            continue
        f = os.path.join(ROOT, s.split('?')[0].lstrip('/'))
        if os.path.exists(f):
            parts.append(read(f))
        else:
            missing.append(s)
    return '\n'.join(parts), missing


def defined(name, js):
    root = name.split('.')[0]
    if root in BUILTINS:
        return True
    pats = [r'function\s+%s\b', r'\b%s\s*=\s*function', r'\b%s\s*=\s*\(',
            r'\b(?:const|let|var)\s+%s\b', r'window\.%s\s*=', r'\b%s\s*:\s*(?:function|\()',
            r'\b%s\s*\(\s*\)\s*\{']
    return any(re.search(p % re.escape(root), js) for p in pats)


def id_bound(bid, js):
    """Is this element id reachable from script?

    Either named literally, or built by a template literal: my-library binds
    five certificate buttons through getElementById(`cert-${key}-btn`).
    """
    if re.search(r'[\'"`]#?%s[\'"`]' % re.escape(bid), js):
        return True
    parts = bid.split('-')
    for i in range(len(parts)):
        head, tail = '-'.join(parts[:i]), '-'.join(parts[i + 1:])
        pat = r'`%s\$\{[^}]+\}%s`' % (re.escape(head + '-' if head else ''),
                                       re.escape('-' + tail if tail else ''))
        if re.search(pat, js):
            return True
    return False


def audit(page):
    html = read(os.path.join(ROOT, page))
    js, missing = scripts_for(html, page)
    out = collections.defaultdict(list)
    out['script'] = missing

    # onclick handlers with no definition. A call preceded by a dot is a method
    # on whatever expression came before it (this.closest(x).remove()), not a
    # global the page has to define.
    for h in re.findall(r'onclick="([^"]*)"', html):
        for m in re.finditer(r'(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(', h):
            name = m.group(1)
            if not defined(name, js):
                out['onclick'].append(name)

    # buttons that nothing can reach
    for tag in re.findall(r'<button\b[^>]*>', html):
        if 'onclick=' in tag or 'type="submit"' in tag or 'form=' in tag:
            continue
        bid = re.search(r'\bid="([^"]+)"', tag)
        cls = re.findall(r'\bclass="([^"]*)"', tag)
        classes = cls[0].split() if cls else []
        if bid and id_bound(bid.group(1), js):
            continue
        if any(re.search(r'[\'"][^\'"]*\.%s\b' % re.escape(c), js) or
               re.search(r'classList\.[a-z]+\([\'"]%s[\'"]' % re.escape(c), js)
               for c in classes):
            continue
        if bid or classes:
            out['button'].append((bid.group(1) if bid else '') or ' '.join(classes))

    # internal links that go nowhere
    ids = set(re.findall(r'\bid="([^"]+)"', html))
    for h in set(re.findall(r'href="([^"]+)"', html)):
        if h.startswith('#'):
            if len(h) > 1 and h[1:] not in ids:
                out['anchor'].append(h)
        elif h.startswith('/'):
            # A path built inside a JavaScript template literal is not a path:
            # ${folder} is filled in at render time, so there is no file to
            # look for and reporting one is a false alarm.
            if '${' in h:
                continue
            f = h.split('#')[0].split('?')[0].lstrip('/')
            f = f + 'index.html' if f.endswith('/') else f
            if f and not os.path.exists(os.path.join(ROOT, f)):
                out['href'].append(h)
    return {k: sorted(set(map(str, v))) for k, v in out.items() if v}


def events():
    """Custom events across every script: dispatched, listened, or orphaned."""
    disp, lis = collections.Counter(), collections.Counter()
    for dp, _, fs in os.walk(os.path.join(ROOT, 'education')):
        for f in fs:
            if not f.endswith(('.js', '.html')):
                continue
            s = read(os.path.join(dp, f))
            for n in re.findall(r"CustomEvent\(\s*'(sp:[\w:]+)'", s):
                disp[n] += 1
            for n in re.findall(r"addEventListener\(\s*'(sp:[\w:]+)'", s):
                lis[n] += 1
    bad, notes = [], []
    for n in sorted(set(disp) | set(lis)):
        if lis[n] and not disp[n]:
            # a dead feature: something waits for a signal nobody sends
            bad.append('%s listened %dx, never dispatched' % (n, lis[n]))
        elif disp[n] and not lis[n]:
            # a forward hook: harmless, but worth seeing
            notes.append('%s dispatched %dx, nobody listening' % (n, disp[n]))
    return bad, notes


def main(argv):
    pages = argv or sorted(
        'education/' + f for f in os.listdir(os.path.join(ROOT, 'education'))
        if f.endswith('.html'))
    total = 0
    for p in pages:
        found = audit(p)
        n = sum(len(v) for v in found.values())
        total += n
        label = os.path.basename(p)
        print('%-34s %s' % (label, 'clean' if not n else '%d findings' % n))
        for kind, items in sorted(found.items()):
            for it in items[:8]:
                print('    %-8s %s' % (kind, it))
            if len(items) > 8:
                print('    %-8s ... and %d more' % (kind, len(items) - 8))
    ev, notes = events()
    print()
    print('%-34s %s' % ('custom events', 'clean' if not ev else '%d findings' % len(ev)))
    for e in ev:
        print('    event    %s' % e)
    for e in notes:
        print('    note     %s' % e)
    total += len(ev)
    print()
    print('total %d findings' % total)
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
