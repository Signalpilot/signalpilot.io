/**
 * Language Switcher
 *
 * Two tiers:
 *   1. Signal Pilot translations — the twelve languages the curriculum is
 *      actually written in. Picking one navigates to the real translated page
 *      (/de/education/..., /ja/education/..., and so on) and clears any Google
 *      Translate cookie so nothing gets translated a second time on top.
 *   2. Google Translate — every other language Google offers, applied to the
 *      English original.
 */

(function() {
  'use strict';

  // Locales we have hand-translated. Order matters: this is the menu order.
  const NATIVE = [
    { code: 'en', name: 'English',    flagCode: 'us' },
    { code: 'de', name: 'Deutsch',    flagCode: 'de' },
    { code: 'es', name: 'Español',    flagCode: 'es' },
    { code: 'fr', name: 'Français',   flagCode: 'fr' },
    { code: 'it', name: 'Italiano',   flagCode: 'it' },
    { code: 'pt', name: 'Português',  flagCode: 'pt' },
    { code: 'nl', name: 'Nederlands', flagCode: 'nl' },
    { code: 'ru', name: 'Русский',    flagCode: 'ru' },
    { code: 'ja', name: '日本語',      flagCode: 'jp' },
    { code: 'tr', name: 'Türkçe',     flagCode: 'tr' },
    { code: 'hu', name: 'Magyar',     flagCode: 'hu' },
    { code: 'ar', name: 'العربية',     flagCode: 'sa' }
  ];

  // Everything else Google Translate can reach, applied to the English page.
  const MACHINE = [
    { code: 'zh-CN', name: '中文 (简体)', flagCode: 'cn' },
    { code: 'zh-TW', name: '中文 (繁體)', flagCode: 'tw' },
    { code: 'ko', name: '한국어', flagCode: 'kr' },
    { code: 'hi', name: 'हिन्दी', flagCode: 'in' },
    { code: 'pl', name: 'Polski', flagCode: 'pl' },
    { code: 'uk', name: 'Українська', flagCode: 'ua' },
    { code: 'sv', name: 'Svenska', flagCode: 'se' },
    { code: 'no', name: 'Norsk', flagCode: 'no' },
    { code: 'da', name: 'Dansk', flagCode: 'dk' },
    { code: 'fi', name: 'Suomi', flagCode: 'fi' },
    { code: 'cs', name: 'Čeština', flagCode: 'cz' },
    { code: 'ro', name: 'Română', flagCode: 'ro' },
    { code: 'bg', name: 'Български', flagCode: 'bg' },
    { code: 'el', name: 'Ελληνικά', flagCode: 'gr' },
    { code: 'iw', name: 'עברית', flagCode: 'il' },
    { code: 'id', name: 'Bahasa Indonesia', flagCode: 'id' },
    { code: 'th', name: 'ไทย', flagCode: 'th' },
    { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' }
  ];

  const LOCALE_RE = /^\/(de|es|fr|it|pt|nl|ru|ja|tr|hu|ar)(?=\/|$)/;

  // Paths that exist in every locale directory. Anything else has no native
  // translation, so those pages fall back to Google Translate.
  const NATIVE_PATHS = [
    /^\/education\/curriculum\//,
    /^\/education\/(index\.html)?$/,
    /^\/chronicle\//,
    /^\/(index\.html)?$/,
    /^\/(affiliates|faq|manage-subscription|privacy|refund|roadmap|terms|trial-thanks)\.html$/
  ];

  function getFlagImg(flagCode, size = 40) {
    return `<img src="https://flagcdn.com/w${size}/${flagCode}.png" width="26" height="17" alt="${flagCode.toUpperCase()}" loading="lazy" style="vertical-align:middle;border-radius:2px;flex-shrink:0">`;
  }

  // --- path helpers -------------------------------------------------------

  // '/de/education/index.html' -> 'de'   ;  '/education/index.html' -> 'en'
  function pathLocale() {
    const m = location.pathname.match(LOCALE_RE);
    return m ? m[1] : 'en';
  }

  // '/de/education/index.html' -> '/education/index.html'
  function basePath() {
    const p = location.pathname;
    const m = p.match(LOCALE_RE);
    return m ? (p.slice(m[0].length) || '/') : p;
  }

  function hasNativeVersion(path) {
    return NATIVE_PATHS.some(re => re.test(path));
  }

  function nativeUrl(langCode) {
    const base = basePath();
    const prefix = langCode === 'en' ? '' : '/' + langCode;
    return prefix + base + location.search + location.hash;
  }

  // --- cookies ------------------------------------------------------------

  function baseDomain(host) {
    const p = host.split('.');
    return p.length > 2 ? p.slice(-2).join('.') : host;
  }

  function setCookie(name, value, days, domain) {
    let expires = '';
    if (days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 864e5);
      expires = '; expires=' + d.toUTCString();
    }
    const dom = domain ? '; domain=' + domain : '';
    document.cookie = name + '=' + value + expires + '; path=/' + dom;
  }

  function rootDomain() {
    return '.' + baseDomain(location.hostname.replace(/^www\./, ''));
  }

  function setGoogTrans(langCode) {
    const val = '/en/' + (langCode === 'zh' ? 'zh-CN' : langCode);
    setCookie('googtrans', val, 365);
    setCookie('googtrans', val, 365, rootDomain());
  }

  function clearGoogTrans() {
    setCookie('googtrans', '', -1);
    setCookie('googtrans', '', -1, rootDomain());
    try { localStorage.removeItem('sp_lang'); } catch (e) {}
  }

  function googTransCookie() {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match && match[1] ? match[1] : null;
  }

  function applyDirLang(langCode) {
    document.documentElement.lang = (langCode === 'zh') ? 'zh-CN' : langCode;
    document.documentElement.dir = (langCode === 'ar' || langCode === 'iw') ? 'rtl' : 'ltr';
  }

  // Which entry should be highlighted. A locale in the URL always wins: we are
  // reading a real translation, whatever a stale cookie says.
  function activeCode() {
    const loc = pathLocale();
    if (loc !== 'en') return loc;
    return googTransCookie() || 'en';
  }

  // --- navigation ---------------------------------------------------------

  function goNative(langCode) {
    clearGoogTrans();
    const target = nativeUrl(langCode);
    if (target === location.pathname + location.search + location.hash) {
      location.reload();
    } else {
      location.href = target;
    }
  }

  function goMachine(langCode) {
    try { localStorage.setItem('sp_lang', langCode); } catch (e) {}
    setGoogTrans(langCode);
    applyDirLang(langCode);
    // Always machine-translate the English original, never one of our own
    // translations — layering Google on top of hand-written German is worse
    // than either on its own.
    const english = basePath() + location.search + location.hash;
    if (english !== location.pathname + location.search + location.hash) {
      location.href = english;
    } else {
      location.reload();
    }
  }

  function changeLanguage(langCode, isNative) {
    if (isNative && hasNativeVersion(basePath())) {
      goNative(langCode);
      return;
    }
    if (isNative && langCode === 'en') {
      clearGoogTrans();
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
      location.href = basePath() + location.search + location.hash;
      return;
    }
    // No hand-translated version of this particular page: fall back to Google.
    goMachine(langCode);
  }

  // --- menu ---------------------------------------------------------------

  function makeHeading(text) {
    const h = document.createElement('div');
    h.className = 'lang-group-label';
    h.textContent = text;
    return h;
  }

  function makeButton(lang, isNative, current, translated) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    button.setAttribute('data-lang', lang.code);
    button.innerHTML = `${getFlagImg(lang.flagCode)}<span>${lang.name}</span>`;
    if (isNative && !translated && lang.code !== 'en') {
      button.classList.add('lang-approx');
      button.title = 'This page has no hand-written translation yet — Google Translate will be used.';
    }
    if (lang.code === current) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'true');
    }
    button.addEventListener('click', () => changeLanguage(lang.code, isNative));
    return button;
  }

  function createDropdownMenu() {
    const menu = document.createElement('div');
    menu.className = 'lang-dropdown-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Language selection');

    const current = activeCode();
    const translated = hasNativeVersion(basePath());

    menu.appendChild(makeHeading('Signal Pilot translations'));
    NATIVE.forEach(lang => menu.appendChild(makeButton(lang, true, current, translated)));

    menu.appendChild(makeHeading('More languages · Google Translate'));
    MACHINE.forEach(lang => menu.appendChild(makeButton(lang, false, current, translated)));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-dropdown') && menu.classList.contains('active')) {
        menu.classList.remove('active');
      }
    });

    return menu;
  }

  // --- init ---------------------------------------------------------------

  function init() {
    const container = document.getElementById('google_translate_element');
    if (!container) return;

    const current = activeCode();
    const all = NATIVE.concat(MACHINE);
    const currentLangObj = all.find(l => l.code === current) || NATIVE[0];

    container.id = 'langToggle';
    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', `Select language (current: ${currentLangObj.name})`);
    container.setAttribute('aria-haspopup', 'true');
    container.setAttribute('aria-expanded', 'false');
    container.innerHTML = getFlagImg(currentLangObj.flagCode);

    const menu = createDropdownMenu();
    document.body.appendChild(menu);

    container.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');
      menu.classList.toggle('active');
      container.setAttribute('aria-expanded', String(!isActive));
    });
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        container.click();
      }
    });

    if (pathLocale() !== 'en') {
      // We are on one of our own translations. Make sure a leftover cookie
      // cannot machine-translate it a second time.
      if (googTransCookie()) clearGoogTrans();
      return;
    }

    if (current !== 'en') {
      applyDirLang(current);
      loadGoogleTranslate(current);
    }
  }

  function loadGoogleTranslate(lang) {
    if (!lang || lang === 'en') return;

    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'google_translate_container';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hiddenDiv);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: NATIVE.concat(MACHINE).map(l => l.code).join(','),
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_container');
    };

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = function() {
      console.warn('Failed to load Google Translate');
    };
    document.head.appendChild(script);
  }

  function cleanupGoogleUI() {
    const frames = document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame, .skiptranslate');
    frames.forEach(f => { if (f.parentNode) f.parentNode.removeChild(f); });
    document.body.style.top = '0';
    document.body.style.position = 'relative';
    if (document.body.hasAttribute('style')) {
      const style = document.body.getAttribute('style');
      if (style && style.includes('top:')) {
        document.body.setAttribute('style', style.replace(/top:\s*[^;]+;?/g, ''));
      }
    }
  }

  window.addEventListener('load', () => {
    cleanupGoogleUI();
    setTimeout(cleanupGoogleUI, 500);
    setTimeout(cleanupGoogleUI, 1000);
    setTimeout(cleanupGoogleUI, 2000);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
