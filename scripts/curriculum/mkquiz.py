#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a module quiz page from its question data.

The guidebook's rule, in **Between the pages**: one quiz per module, at the
end, and every question hands the reader numbers and asks for a number back.
A question answerable by somebody who only read the definitions is a defect,
not a question. The quiz is also where the module's serial pays out a second
time, because by then the reader holds all the columns.

A quiz page is not a lesson. It carries no data-part frame, and the lesson
checkers skip it because they select on a leading slot number in the
filename. It carries the same chrome as a lesson so a reader does not feel
they have left the course.

    python3 scripts/curriculum/mkquiz.py <module number>|all

Build order matters. inject.py points a locale page's links at the same
locale only where that file already exists, so build and translate the quiz
BEFORE rebuilding the lesson that links to it, or eleven locale pages ship a
link out of their own language and locales.py reports it.
"""
import html as H
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from quizdata import QUIZZES          # noqa: E402

TIER_LABEL = {'beginner': 'Beginner', 'intermediate': 'Intermediate',
              'advanced': 'Advanced', 'professional': 'Professional'}

HEAD = '''<!doctype html>
<html lang="en" dir="ltr" data-theme="dark">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17835897996"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-440EJBMYST');
  gtag('config', 'AW-17835897996');
</script>
  <link rel="manifest" href="/education/manifest.json">
  <link rel="icon" type="image/x-icon" href="/education/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/education/assets/icons/icon-180x180.png">
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover"/>
  <meta name="robots" content="index,follow"/>
  <!-- AGGRESSIVE CACHE PREVENTION: Forces fresh load every time -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0"/>
  <meta http-equiv="Pragma" content="no-cache"/>
  <meta http-equiv="Expires" content="0"/>
  <title>{title} &mdash; Signal Pilot Education</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#05070d">
  <link rel="canonical" href="https://www.signalpilot.io{url}">
  <!-- Open Graph / Social Media Preview -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://www.signalpilot.io{url}">
  <meta property="og:title" content="{title} &mdash; Signal Pilot Education">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://www.signalpilot.io/education/preview.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Signal Pilot Education">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://www.signalpilot.io{url}">
  <meta name="twitter:title" content="{title} &mdash; Signal Pilot Education">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="https://www.signalpilot.io/education/preview.png">
  <meta name="sp-level" content="{level}">
  <meta name="sp-order" content="Q{mod}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Gugi&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <!-- SignalPilot Theme System -->
  <link rel="stylesheet" href="/education/assets/signalpilot-theme.css">
  <link rel="stylesheet" href="/education/assets/edu.css">
  <link rel="stylesheet" href="/education/assets/chatbot.css">
  <link rel="stylesheet" href="/education/assets/lang-switcher.css">
  <link rel="stylesheet" href="/education/assets/notes.css">
  <link rel="stylesheet" href="/education/assets/auth-ui.css">
  <link rel="stylesheet" href="/education/assets/trial-cta.css">
  <link rel="stylesheet" href="/education/assets/blog-links.css">
  <link rel="stylesheet" href="/education/assets/discussions.css">
  <!-- Logger must load first, before other scripts that use it -->
  <script src="/education/assets/logger.js"></script>
  <script src="/education/assets/dev-utils.js" defer></script>
<script src="/education/assets/structured-data.js" defer></script>
<script src="/education/assets/lazy-load.js" defer></script>
<script defer data-domain="signalpilot.io" src="https://plausible.io/js/script.js"></script>
</head>
<body class="table-accordions-mobile">

  <div class="bg-stars" aria-hidden="true"></div>
  <canvas id="constellations" class="sp-constellations" aria-hidden="true"></canvas>
  <div class="bg-aurora" aria-hidden="true"></div>

<header class="sp-header">
  <div class="wrap">
    <a href="https://www.signalpilot.io" class="brand">
      <span>Signal Pilot</span>
    </a>
    <nav id="mainnav" aria-label="Main"><ul>
      <li><a href="/education/">Education</a></li>
      <li><a href="/education/search.html">Search</a></li>
      <li><a href="/education/my-library.html">My Library</a></li>
      <li><a href="https://www.signalpilot.io/blog" target="_blank" rel="noopener">Blog</a></li>
    </ul></nav>
    <div class="header-ctls">
      <div id="google_translate_element"></div><button id="themeToggle" class="btn btn-ghost btn-sm" type="button" aria-label="Toggle theme">
        <span id="theme-icon">&#9781;</span>
      </button><button id="menuToggle" class="menu-toggle" aria-expanded="false"><span class="menu-toggle-text">Menu </span>&#9776;</button></div>
  </div>
</header>

<article class="article">
  <header>
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/education/">Home</a> &rsaquo; <a href="/education/{tier}.html">{level} Curriculum</a> &rsaquo; <span>{title}</span>
      </nav>
      <span class="badge">&#128221; Quiz &bull; Module {mod}</span>
      <h1 class="headline xl">{title}</h1>
      <div class="meta">{nq} questions &bull; Lessons {lo}&ndash;{hi}<span class="view-count" data-view-count style="display:none"> &bull; <span data-view-num></span></span></div>

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
          <div style="font-size:.85rem;color:var(--muted)">Work every question before you read the answers</div>
        </div>
      </div>
    </div>
  </header>

  <div class="wrap article-grid">
    <div class="prose">
'''

TAIL = '''
<div class="section-break"><span>Related Lessons</span></div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%, 250px),1fr));gap:1rem;margin:1.5rem 0">
{related}
      </div>

      <blockquote class="sp-disclaimer"><strong>Educational only.</strong> Trading involves substantial risk of loss. Not financial advice. Past performance does not guarantee future results.</blockquote>

    </div>
  </div>

  <div class="wrap" style="margin:3rem auto;text-align:center">
    <div style="padding:2rem;border:1px solid rgba(91,138,255,.18);border-radius:14px;background:rgba(91,138,255,.04)">
      <a class="btn btn-primary" href="https://www.signalpilot.io">
        Back to Signal Pilot →
      </a>
    </div>
  </div>
</article>

<footer class="sp-footer">
  <div class="wrap">
    <div>&copy; <span id="year"></span> Signal Pilot Labs, Inc. All rights reserved.</div>
    <div class="links"><a href="https://discord.gg/5guVbGEyj8" target="_blank" rel="noopener">Discuss on Discord</a><a href="https://www.signalpilot.io/affiliates.html">Affiliates</a><a href="https://www.signalpilot.io/privacy.html">Privacy</a><a href="https://www.signalpilot.io/terms.html">Terms</a></div>
  </div>
</footer>

<script src="/education/assets/edu.js"></script>
<script src="/education/assets/edu-enhanced.js"></script>
<script>
  window.addEventListener('scroll', () => {{
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrolled = window.scrollY;
    const percent = Math.min(Math.round((scrolled / (docHeight - winHeight)) * 100), 100);

    const circle = document.querySelector('.progress-circle');
    if (circle) {{
      circle.style.setProperty('--progress', percent + '%');
      circle.querySelector('span').textContent = percent + '%';
    }}
  }}, {{ passive: true }});

  localStorage.setItem('sp_edu_last_article', JSON.stringify({{ title: {title_js}, level: '{level}', order: 'Q{mod}', url: window.location.pathname, progress: 0 }}));
</script>
<!-- SignalPilot Theme Switcher -->
<script src="/education/assets/signalpilot-theme.js"></script>
<script src="/education/assets/spaced-repetition.js" defer></script>
<script src="/education/assets/chatbot.js" defer></script>
<script src="/education/assets/notes.js" defer></script>
<script src="/education/assets/analytics.js"></script>
<script src="/education/assets/social-share.js"></script>
<script src="/education/assets/pwa-init.js"></script>
<script src="/education/assets/config.js"></script>
<script src="/education/assets/supabase-client.js"></script>
<script src="/education/assets/auth-ui.js"></script>
  <script src="/education/assets/library.js"></script>
  <script>window.addEventListener('load',function(){{if(window.library?.isBookmarked()){{var b=document.getElementById('bookmark-btn');if(b)b.innerHTML='&#11088; Bookmarked'}}}})</script>
    <!-- Enhanced Analytics & A/B Testing -->
  <script src="/education/assets/enhanced-analytics.js" defer></script>
  <script src="/education/assets/ab-test-tldr.js" defer></script>
  <!-- Google Translate -->
  <script src="/education/assets/lang-switcher.js"></script>
  <!-- Discussion System -->
    <script src="/education/assets/trial-cta.js"></script>
  <script src="/education/assets/blog-links.js"></script>
  <script src="/education/assets/discussions.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {{
      if (window.DiscussionSystem) {{
        window.DiscussionSystem.init('{slug}');
      }}
    }});
  </script>
  <script defer src="/assets/js/view-counter.js"></script>
</body>
</html>
'''


def render(q):
    cat = {x['order']: x for x in
           json.load(open('education/curriculum/index.json', encoding='utf-8'))}
    lo, hi = q['slots'][0], q['slots'][-1]
    url = '/education/curriculum/%s/%s.html' % (q['tier'], q['slug'])
    body = [HEAD.format(title=q['title'], desc=q['desc'], url=url, tier=q['tier'],
                        level=TIER_LABEL[q['tier']], mod=q['mod'], nq=len(q['questions']),
                        lo=lo, hi=hi)]

    body.append('      <p style="font-size:1.15rem;font-weight:500;line-height:1.6;'
                'margin:0 0 1.75rem 0;padding-left:1rem;border-left:3px solid '
                'var(--accent,#00d4aa)">%s</p>\n' % q['intro'])
    body.append('      <p style="font-size:.9rem;color:var(--muted);margin-bottom:2rem">'
                '<strong>Covers:</strong> %s</p>\n' % q['covers'])
    body.append('      <p>Every question below hands you numbers and asks for a number '
                'back. Work all %d with a calculator before you scroll to the answers; '
                'each answer shows the arithmetic, so a wrong result tells you which '
                'step to go back to rather than only that you were wrong.</p>\n'
                % len(q['questions']))

    body.append('\n      <h3>The questions</h3>\n')
    for i, item in enumerate(q['questions'], 1):
        body.append('\n      <h4>%d. %s</h4>\n' % (i, item['title']))
        body.append(item['setup'])
        body.append('      <p><strong>Ask.</strong> %s</p>\n' % item['ask'])

    body.append('\n      <div class="section-break"></div>\n')
    body.append('\n      <h3>The answers</h3>\n')
    body.append('      <p>Each one is worked in full. Where a figure comes from a '
                'lesson rather than from this page, the lesson is named.</p>\n')
    for i, item in enumerate(q['questions'], 1):
        body.append('\n      <h4>%d. %s</h4>\n' % (i, item['title']))
        body.append(item['answer'])
        # The result on its own line. A number that matters never sits buried
        # in a sentence, and in a quiz it is the thing the reader came for.
        body.append('      <p style="padding-left:1rem;border-left:3px solid '
                    'var(--accent,#00d4aa)"><strong>Answer.</strong> %s</p>\n'
                    % item['result'])

    if q.get('close'):
        body.append('\n      <h3>%s</h3>\n' % q['close_head'])
        body.append(q['close'])

    card = ('        <div class="card" style="padding:1rem">\n'
            '          <span class="badge">Lesson %d</span>\n'
            '          <h4 style="margin:.5rem 0 .5rem 0;font-size:1rem">%s</h4>\n'
            '          <p style="font-size:.9rem;color:var(--muted);margin-bottom:.75rem">%s</p>\n'
            '          <a href="%s" class="btn btn-sm btn-ghost">Read Lesson &rarr;</a>\n'
            '        </div>')
    rel = '\n'.join(card % (s, H.escape(cat[s]['title'], quote=False), why, cat[s]['href'])
                     for s, why in q['related'])
    body.append(TAIL.format(related=rel, level=TIER_LABEL[q['tier']], mod=q['mod'],
                            slug=q['slug'], title_js=json.dumps(q['title'])))
    return ''.join(body)


def main(argv):
    want = QUIZZES if (not argv or argv[0] == 'all') else \
        [q for q in QUIZZES if str(q['mod']) in argv]
    if not want:
        print('no such module'); return 2
    for q in want:
        p = 'education/curriculum/%s/%s.html' % (q['tier'], q['slug'])
        open(p, 'w', encoding='utf-8').write(render(q))
        words = len(re.sub(r'<[^>]+>', ' ', render(q)).split())
        print('%-58s %d questions, ~%d words' % (p, len(q['questions']), words))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
