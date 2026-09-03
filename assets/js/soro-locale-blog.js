/* Signal Pilot — Soro auto-posts on the localised blogs.
 *
 * Soro serves one English feed and has no locale switch: passing lang, locale
 * or language returns the identical bytes, English strings and all. So the
 * German blog cannot show German cards by asking Soro for them. It shows them
 * because we hold the German text ourselves, in blog/api/soro.de.json, written
 * by hand and rebuilt by scripts/soro/localise.py.
 *
 * Card text is translated. The article body is not: fifteen posts carry
 * 21,014 words, which is 231,154 across eleven locales and grows with every
 * auto-post, so the card links to the English article and says so in the
 * reader's own language rather than pretending otherwise.
 *
 * The markup is the embed's own — .soro-blog-list holding a.soro-blog-card —
 * so soro-blog-enhance.js turns it into the same carousel without knowing the
 * difference, and view-counter.js counts the same slugs.
 */
(function () {
  'use strict';

  var MOUNT = 'soro-blog';
  var LANGS = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar'];

  /* The locale is the page's own, not the URL's: /blog/de/ and a de subdomain
     both declare it on <html>, and a mismatch would show the wrong language. */
  function lang() {
    var l = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return LANGS.indexOf(l) === -1 ? null : l;
  }

  var CSS = [
    '#' + MOUNT + '{color:var(--text,#e8eaed)}',
    '#' + MOUNT + ' .soro-blog-list{display:flex;flex-direction:column;gap:1.5rem;margin:0}',
    '#' + MOUNT + ' .soro-blog-card{',
    '  display:flex;gap:1.25rem;padding:1.25rem;text-decoration:none;color:inherit;',
    '  border:1px solid rgba(255,255,255,.1);border-radius:12px;background:transparent;',
    '  transition:border-color .2s,box-shadow .2s;',
    '}',
    '[data-theme="light"] #' + MOUNT + ' .soro-blog-card{border-color:rgba(0,0,0,.1)}',
    '#' + MOUNT + ' .soro-blog-card:hover{',
    '  border-color:rgba(118,221,255,.45);box-shadow:0 4px 14px rgba(0,0,0,.18);',
    '}',
    '#' + MOUNT + ' .soro-blog-card-image{',
    '  width:140px;height:100px;object-fit:cover;border-radius:8px;flex-shrink:0;',
    '}',
    '#' + MOUNT + ' .soro-blog-card-content{flex:1;min-width:0}',
    '#' + MOUNT + ' .soro-blog-card-title{',
    '  font-size:1.05rem;font-weight:600;line-height:1.3;margin:0 0 .5rem;color:inherit;',
    '}',
    '#' + MOUNT + ' .soro-blog-card-excerpt{',
    '  font-size:.875rem;line-height:1.5;margin:0 0 .75rem;color:var(--muted,#9aa0a6);',
    '  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;',
    '}',
    '#' + MOUNT + ' .soro-blog-card-date{font-size:.75rem;color:var(--muted,#9aa0a6)}',
    '#' + MOUNT + ' .soro-blog-card-lang{',
    '  display:block;font-size:.7rem;margin-top:.35rem;opacity:.72;color:var(--muted,#9aa0a6);',
    '}'
  ].join('\n');

  function styles() {
    if (document.getElementById('soro-locale-css')) return;
    var el = document.createElement('style');
    el.id = 'soro-locale-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  /* The reader's own date format, from their own locale. Falls back to the
     stored ISO date rather than to an English month name. */
  function when(iso, l) {
    try {
      var p = iso.split('-');
      var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      return new Intl.DateTimeFormat(l, {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      }).format(d);
    } catch (e) { return iso; }
  }

  function card(post, ui, l) {
    var a = document.createElement('a');
    a.className = 'soro-blog-card';
    a.href = '/blog/?post=' + encodeURIComponent(post.slug);
    a.setAttribute('data-slug', post.slug);

    if (post.image) {
      var img = document.createElement('img');
      img.className = 'soro-blog-card-image';
      img.src = post.image;
      img.alt = post.title;
      img.loading = 'lazy';
      a.appendChild(img);
    }

    var body = document.createElement('div');
    body.className = 'soro-blog-card-content';

    var h = document.createElement('h2');
    h.className = 'soro-blog-card-title';
    h.textContent = post.title;

    var p = document.createElement('p');
    p.className = 'soro-blog-card-excerpt';
    p.textContent = post.excerpt;

    var t = document.createElement('time');
    t.className = 'soro-blog-card-date';
    t.dateTime = post.date;
    t.textContent = when(post.date, l);

    // Said on every card, because a reader who clicks expecting their own
    // language and lands in English has been misled by the card.
    var note = document.createElement('span');
    note.className = 'soro-blog-card-lang';
    note.textContent = ui.english;

    body.appendChild(h);
    body.appendChild(p);
    body.appendChild(t);
    body.appendChild(note);
    a.appendChild(body);
    return a;
  }

  function render(mount, data, l) {
    var list = document.createElement('section');
    list.className = 'soro-blog-list';
    list.setAttribute('role', 'feed');
    list.setAttribute('aria-label', data.ui.latest);
    data.posts.forEach(function (post) { list.appendChild(card(post, data.ui, l)); });

    // Read by soro-blog-enhance.js when it builds the carousel controls.
    mount.setAttribute('data-rail-prev', data.ui.prev);
    mount.setAttribute('data-rail-next', data.ui.next);

    mount.innerHTML = '';
    mount.appendChild(list);

    var heading = document.querySelector('[data-soro-heading]');
    if (heading) heading.textContent = data.ui.latest;
  }

  function start() {
    var mount = document.getElementById(MOUNT);
    var l = lang();
    if (!mount || !l) return;                 // English page, or not a blog

    // Injected before the fetch, not after it: these rules and the carousel's
    // in soro-blog-enhance.js have equal specificity, so whichever style
    // element lands last wins, and the carousel has to be the one that does.
    styles();

    fetch('/blog/api/soro.' + l + '.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.posts || !d.posts.length) return;
        render(mount, d, l);
      })
      .catch(function () { /* the static library below stands on its own */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
