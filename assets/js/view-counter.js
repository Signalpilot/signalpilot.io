/* Signal Pilot — article view counter.
 *
 * Shows how many times a piece has been read. All 12 language versions of an
 * article share one counter, so the locale is stripped before the count is
 * requested and a German reader and an English reader add to the same total.
 *
 * Three kinds of page are counted:
 *   /education/curriculum/<level>/<lesson>.html   -> edu:<lesson>
 *   /blog/articles/<slug>/[<locale>/]             -> blog:<slug>
 *   /blog/?post=<slug>                            -> blog:<slug>
 *
 * The last of those is the Soro embed, which swaps between its list and an
 * article without a page load. There is no markup of ours on that page, so
 * the counter builds its own element and re-checks whenever the URL changes.
 *
 * The number shown is whatever the server reports. If the counter is
 * unreachable or reports nothing, the element stays hidden rather than
 * showing a placeholder figure.
 */
(function () {
  'use strict';

  var LOCALES = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar'];

  /* What the API will accept. Anything else is dropped rather than sent, so a
   * hand-edited ?post= cannot turn into a request. */
  var SLUG_OK = /^[a-z0-9][a-z0-9-]{0,79}$/;

  /* Plural forms per locale, keyed by the category Intl.PluralRules returns.
   * Languages that do not inflect after a numeral (ja, tr, hu) use one form. */
  var LABELS = {
    en: { one: 'view', other: 'views' },
    de: { one: 'Aufruf', other: 'Aufrufe' },
    es: { one: 'visualización', other: 'visualizaciones' },
    fr: { one: 'vue', other: 'vues' },
    it: { one: 'visualizzazione', other: 'visualizzazioni' },
    pt: { one: 'visualização', other: 'visualizações' },
    nl: { one: 'weergave', other: 'weergaven' },
    ru: { one: 'просмотр', few: 'просмотра', many: 'просмотров', other: 'просмотра' },
    ja: { other: '回閲覧' },
    tr: { other: 'görüntülenme' },
    hu: { other: 'megtekintés' },
    ar: { zero: 'مشاهدة', one: 'مشاهدة', two: 'مشاهدتان', few: 'مشاهدات', many: 'مشاهدة', other: 'مشاهدة' }
  };

  function lang() {
    var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return LABELS[l] ? l : 'en';
  }

  function label(n, l) {
    var forms = LABELS[l];
    var cat = 'other';
    try {
      cat = new Intl.PluralRules(l).select(n);
    } catch (e) { /* older browser: fall through to 'other' */ }
    return forms[cat] || forms.other || forms.one;
  }

  function format(n, l) {
    try { return new Intl.NumberFormat(l).format(n); } catch (e) { return String(n); }
  }

  function postParam(search) {
    var q = String(search || '');
    var m = /[?&]post=([^&#]*)/.exec(q);
    if (!m) return null;
    var slug;
    try { slug = decodeURIComponent(m[1]); } catch (e) { slug = m[1]; }
    return SLUG_OK.test(slug) ? slug : null;
  }

  /* Path (+ query) -> counter key. Returns null for anything that is not a
   * countable page, so the script is inert if it is ever included elsewhere. */
  function slugFor(path, search) {
    var p = String(path).replace(/\/+$/, '');         // drop trailing slash
    var seg = p.split('/').filter(Boolean);

    if (LOCALES.indexOf(seg[0]) !== -1) seg.shift();  // /de/education/...

    // /blog/articles/<slug>[/<locale>]  and  /blog/<locale>/articles/<slug>
    // and the Soro embed's /blog/?post=<slug>
    if (seg[0] === 'blog') {
      var rest = seg.slice(1);
      if (LOCALES.indexOf(rest[0]) !== -1) rest.shift();
      if (rest[0] === 'articles' && rest[1]) return 'blog:' + rest[1];
      var q = postParam(search);
      return q ? 'blog:' + q : null;
    }

    // /chronicle/<slug>
    if (seg[0] === 'chronicle' && seg[1]) return 'chronicle:' + seg[1];

    // /education/curriculum/<level>/<lesson>.html
    if (seg[0] === 'education' && seg[1] === 'curriculum' && seg[3]) {
      return 'edu:' + seg[3].replace(/\.html$/, '');
    }
    return null;
  }

  function render(el, views) {
    if (!(views > 0)) return;                          // nothing real to show
    var l = lang();
    var out = el.querySelector('[data-view-num]') || el;
    out.textContent = format(views, l) + ' ' + label(views, l);
    // Revealed by clearing the inline style, not the hidden attribute:
    // `.article-meta span { display: flex }` outranks the UA [hidden] rule.
    el.style.display = '';
  }

  /* The page's own element if it has one. On the Soro embed there is none, so
   * build one and hang it under the article's date. Returns null while the
   * embed is showing its list, which is when there is nothing to count. */
  function element() {
    var own = document.querySelector('[data-view-count]:not([data-view-injected])');
    if (own) return own;

    var head = document.querySelector('.soro-blog-article.visible header')
            || document.querySelector('.soro-blog-article header');
    if (!head) return null;

    var el = head.querySelector('[data-view-injected]');
    if (!el) {
      el = document.createElement('span');
      el.className = 'soro-blog-article-views';
      el.setAttribute('data-view-count', '');
      el.setAttribute('data-view-injected', '');
      el.style.display = 'none';
      el.innerHTML = '<span data-view-num></span>';
      head.appendChild(el);
    }
    return el;
  }

  var wanted = null;      // slug this page is currently showing
  var counted = {};       // slugs already POSTed in this page session

  function ask(slug, el) {
    var first = !counted[slug];
    counted[slug] = true;

    var req = first
      ? fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug })
        })
      : fetch('/api/views?slug=' + encodeURIComponent(slug));

    req.then(function (r) { return r.ok ? r.json() : null; })
       .then(function (d) {
         if (!d) return;
         if (slug !== wanted) return;                  // navigated away meanwhile
         render(el, d.views);
       })
       .catch(function () { /* leave hidden */ });
  }

  function sync() {
    var slug = slugFor(location.pathname, location.search);
    wanted = slug;

    if (!slug) return;
    var el = element();
    if (!el) return;                                   // embed still rendering

    // A fresh article view starts hidden until the server answers.
    if (el.getAttribute('data-view-slug') === slug) return;
    el.setAttribute('data-view-slug', slug);
    el.style.display = 'none';
    ask(slug, el);
  }

  function watch() {
    // The Soro embed swaps its list and article views with pushState, so the
    // URL can change without a load and the article markup arrives later.
    var mount = document.getElementById('soro-blog');
    if (mount && window.MutationObserver) {
      new MutationObserver(function () { sync(); })
        .observe(mount, { childList: true, subtree: true });
    }
    window.addEventListener('popstate', sync);

    var push = history.pushState;
    if (typeof push === 'function') {
      history.pushState = function () {
        var r = push.apply(this, arguments);
        sync();
        return r;
      };
    }
  }

  function start() { sync(); watch(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  if (typeof module !== 'undefined') module.exports = { slugFor: slugFor, label: label };
})();
