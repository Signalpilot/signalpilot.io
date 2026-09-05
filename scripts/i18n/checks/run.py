# -*- coding: utf-8 -*-
"""Run every translation check against one lesson, or against all of them.

    python3 scripts/i18n/checks/run.py 01-the-liquidity-lie
    python3 scripts/i18n/checks/run.py --all

Each check answers one question the others cannot see the answer to, which is
why there are eight rather than one. verify.py (run by the builder) covers a
ninth: locked terms, banned claims and segment counts.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ctx
import scripts_check, numcheck, sanity, persona, labels, leak, invisible, pct

CHECKS = [('script', scripts_check), ('numbers', numcheck), ('sanity', sanity),
          ('persona', persona), ('labels', labels), ('leak', leak),
          ('invisible', invisible), ('percent', pct)]


def one(slug, verbose=True):
    lines = []
    total = 0
    for name, mod in CHECKS:
        n = mod.run(slug, report=lines.append)
        total += n
    if verbose or total:
        print(f'{slug:<38} {"clean" if not total else str(total) + " findings"}')
        for l in lines:
            print(l)
    return total


if __name__ == '__main__':
    if '--all' in sys.argv:
        bad = sum(one(s, verbose=False) for s in ctx.slugs())
        print(f'\ntotal findings: {bad}')
        sys.exit(1 if bad else 0)
    sys.exit(1 if one(sys.argv[1]) else 0)
