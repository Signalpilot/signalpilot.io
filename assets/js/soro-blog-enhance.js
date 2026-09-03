/* Signal Pilot — Soro blog embed enhancements.
 *
 * The embed at #soro-blog renders its index as a vertical stack of full-width
 * cards, which grows without limit as posts accumulate. This turns that list
 * into a horizontal, scroll-snapped carousel with arrow controls, and leaves
 * the article view alone.
 *
 * Everything here is an overlay on markup we do not own, so it is written to
 * fail quietly: if the embed changes its class names the styles simply stop
 * matching and the original stack comes back.
 *
 * The embed re-renders on theme switch and on its own list/article
 * navigation, so the controls are rebuilt whenever the mount changes.
 */
(function () {
  'use strict';

  var MOUNT = 'soro-blog';
  var LIST = '.soro-blog-list';
  var CARD = '.soro-blog-card';

  var CSS = [
    /* An ID plus a class outranks the embed's own single-class rules, so this
       wins wherever its stylesheet lands in the head. */
    '#' + MOUNT + ' ' + LIST + '{',
    '  display:flex;flex-direction:row;flex-wrap:nowrap;',
    '  gap:1rem;overflow-x:auto;overflow-y:hidden;',
    '  scroll-snap-type:x mandatory;scroll-behavior:smooth;',
    '  scrollbar-width:none;-ms-overflow-style:none;',
    '  padding:.25rem .25rem 1rem;margin:0;',
    '  overscroll-behavior-x:contain;',
    '}',
    '#' + MOUNT + ' ' + LIST + '::-webkit-scrollbar{display:none}',

    '#' + MOUNT + ' ' + CARD + '{',
    '  flex:0 0 auto;width:320px;max-width:82vw;',
    '  display:flex;flex-direction:column;gap:.85rem;',
    '  scroll-snap-align:start;',
    '}',
    '#' + MOUNT + ' .soro-blog-card-image{',
    '  width:100%;height:170px;flex-shrink:0;',
    '}',
    '#' + MOUNT + ' .soro-blog-card-content{flex:1 1 auto;display:flex;flex-direction:column}',
    '#' + MOUNT + ' .soro-blog-card-excerpt{-webkit-line-clamp:3;flex:1 1 auto}',

    /* Controls */
    '.soro-rail{position:relative}',
    '.soro-rail-btn{',
    '  position:absolute;top:calc(50% - 1rem);transform:translateY(-50%);',
    '  z-index:2;width:40px;height:40px;border-radius:999px;',
    '  display:flex;align-items:center;justify-content:center;',
    '  border:1px solid rgba(255,255,255,.18);',
    '  background:rgba(10,14,22,.82);color:#f5f5f5;',
    '  cursor:pointer;padding:0;',
    '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
    '  transition:opacity .18s,background .18s,border-color .18s;',
    '}',
    '[data-theme="light"] .soro-rail-btn{',
    '  border-color:rgba(0,0,0,.14);background:rgba(255,255,255,.9);color:#0b1020;',
    '}',
    '.soro-rail-btn:hover{border-color:rgba(118,221,255,.55)}',
    '.soro-rail-btn:focus-visible{outline:2px solid #76ddff;outline-offset:2px}',
    '.soro-rail-btn[disabled]{opacity:0;pointer-events:none}',
    '.soro-rail-prev{left:-8px}',
    '.soro-rail-next{right:-8px}',
    '@media (max-width:720px){.soro-rail-btn{display:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '  #' + MOUNT + ' ' + LIST + '{scroll-behavior:auto}',
    '  .soro-rail-btn{transition:none}',
    '}',

    /* View count injected by view-counter.js into the article header. */
    '#' + MOUNT + ' .soro-blog-article-views{',
    '  display:inline-flex;align-items:center;gap:.4rem;',
    '  font-size:14px;color:#a0a0a0;margin-left:.75rem;',
    '}'
  ].join('\n');

  function styles() {
    if (document.getElementById('soro-rail-css')) return;
    var el = document.createElement('style');
    el.id = 'soro-rail-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function arrow(dir) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'soro-rail-btn soro-rail-' + (dir < 0 ? 'prev' : 'next');
    b.setAttribute('aria-label', dir < 0 ? 'Previous articles' : 'Next articles');
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
      + 'stroke-linejoin="round" aria-hidden="true"><polyline points="'
      + (dir < 0 ? '15 18 9 12 15 6' : '9 18 15 12 9 6') + '"/></svg>';
    return b;
  }

  /* One "page" is as much of the rail as is on screen, less a card's worth of
     overlap so the reader keeps their place. */
  function step(list) {
    var card = list.querySelector(CARD);
    var w = card ? card.getBoundingClientRect().width + 16 : 336;
    return Math.max(w, list.clientWidth - w);
  }

  function attach(list) {
    if (list.getAttribute('data-rail') === 'on') return;
    list.setAttribute('data-rail', 'on');

    var rail = document.createElement('div');
    rail.className = 'soro-rail';
    list.parentNode.insertBefore(rail, list);
    rail.appendChild(list);

    var prev = arrow(-1);
    var next = arrow(1);
    rail.appendChild(prev);
    rail.appendChild(next);

    function update() {
      // Scroll snapping parks the rail a few pixels in, and sub-pixel card
      // widths leave a sliver at the far end, so both ends need slack.
      var SLACK = 8;
      var max = list.scrollWidth - list.clientWidth;
      prev.disabled = list.scrollLeft <= SLACK;
      next.disabled = list.scrollLeft >= max - SLACK;
    }

    prev.addEventListener('click', function () {
      list.scrollBy({ left: -step(list), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      list.scrollBy({ left: step(list), behavior: 'smooth' });
    });

    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Card images load late and change scrollWidth, so re-check after layout.
    setTimeout(update, 0);
    setTimeout(update, 600);
    update();
  }

  function sync() {
    var mount = document.getElementById(MOUNT);
    if (!mount) return;
    styles();
    var list = mount.querySelector(LIST);
    if (list) attach(list);
  }

  function start() {
    sync();
    var mount = document.getElementById(MOUNT);
    if (mount && window.MutationObserver) {
      new MutationObserver(sync).observe(mount, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
