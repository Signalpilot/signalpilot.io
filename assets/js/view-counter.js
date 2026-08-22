/* Signal Pilot — article view counter.
 *
 * Shows how many times a piece has been read. All 12 language versions of an
 * article share one counter, so the locale is stripped before the count is
 * requested and a German reader and an English reader add to the same total.
 *
 * The number shown is whatever the server reports. If the counter is
 * unreachable or reports nothing, the element stays hidden rather than
 * showing a placeholder figure.
 */
(function () {
  'use strict';

  var LOCALES = ['de', 'es', 'fr', 'it', 'pt', 'nl', 'ru', 'ja', 'tr', 'hu', 'ar'];

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

  /* Path -> counter key. Returns null for anything that is not a countable
   * page, so the script is inert if it is ever included somewhere else. */
  function slugFor(path) {
    var p = path.replace(/\/+$/, '');                 // drop trailing slash
    var seg = p.split('/').filter(Boolean);
    if (!seg.length) return null;

    if (LOCALES.indexOf(seg[0]) !== -1) seg.shift();  // /de/education/...

    // /blog/articles/<slug>[/<locale>]  and  /blog/<locale>/articles/<slug>
    if (seg[0] === 'blog') {
      var rest = seg.slice(1);
      if (LOCALES.indexOf(rest[0]) !== -1) rest.shift();
      if (rest[0] === 'articles' && rest[1]) return 'blog:' + rest[1];
      return null;
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

  function init() {
    var el = document.querySelector('[data-view-count]');
    if (!el) return;
    var slug = slugFor(location.pathname);
    if (!slug) return;

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(el, d.views); })
      .catch(function () { /* leave hidden */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof module !== 'undefined') module.exports = { slugFor: slugFor, label: label };
})();
