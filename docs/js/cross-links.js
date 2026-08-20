/**
 * Signal Pilot Cross-Links
 * Injects cross-property navigation links in the footer.
 * Links between docs, education hub, blog, and main site for SEO link equity.
 */
(function() {
  'use strict';

  var links = [
    { label: 'Signal Pilot', href: 'https://www.signalpilot.io/', title: 'Signal Pilot — Main Site' },
    { label: 'Education', href: 'https://education.signalpilot.io/', title: 'Signal Pilot Education Hub' },
    { label: 'Blog', href: 'https://www.signalpilot.io/blog/', title: 'Signal Pilot Blog' },
    { label: 'TradingView', href: 'https://www.tradingview.com/u/SignalPilot/', title: 'Signal Pilot on TradingView' }
  ];

  function init() {
    var footer = document.querySelector('.md-footer-meta__inner');
    if (!footer) return;

    var nav = document.createElement('nav');
    nav.className = 'sp-cross-links';
    nav.setAttribute('aria-label', 'Signal Pilot properties');

    var html = '<span class="sp-cross-links__label">Signal Pilot:</span>';
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var current = window.location.hostname === new URL(l.href).hostname;
      html += '<a href="' + l.href + '" title="' + l.title + '"' +
        (current ? ' aria-current="true"' : ' rel="noopener" target="_blank"') +
        ' class="sp-cross-links__link' + (current ? ' sp-cross-links__link--current' : '') + '">' +
        l.label + '</a>';
      if (i < links.length - 1) html += '<span class="sp-cross-links__sep" aria-hidden="true">·</span>';
    }

    nav.innerHTML = html;
    footer.insertBefore(nav, footer.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
