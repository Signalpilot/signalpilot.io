/**
 * Language Switcher - Clean Dropdown with Google Translate
 * Matches the exact implementation of main signalpilot.io site
 */

(function() {
  'use strict';

  // Use flagcdn.com country codes for cross-platform flag images (Windows compatible)
  const languages = [
    { code: 'en', name: 'English', flagCode: 'us' },
    { code: 'es', name: 'Español', flagCode: 'es' },
    { code: 'fr', name: 'Français', flagCode: 'fr' },
    { code: 'de', name: 'Deutsch', flagCode: 'de' },
    { code: 'it', name: 'Italiano', flagCode: 'it' },
    { code: 'pt', name: 'Português', flagCode: 'pt' },
    { code: 'ru', name: 'Русский', flagCode: 'ru' },
    { code: 'zh-CN', name: '中文 (简体)', flagCode: 'cn' },
    { code: 'zh-TW', name: '中文 (繁體)', flagCode: 'tw' },
    { code: 'ja', name: '日本語', flagCode: 'jp' },
    { code: 'ko', name: '한국어', flagCode: 'kr' },
    { code: 'ar', name: 'العربية', flagCode: 'sa' },
    { code: 'hi', name: 'हिन्दी', flagCode: 'in' },
    { code: 'tr', name: 'Türkçe', flagCode: 'tr' },
    { code: 'pl', name: 'Polski', flagCode: 'pl' },
    { code: 'nl', name: 'Nederlands', flagCode: 'nl' },
    { code: 'sv', name: 'Svenska', flagCode: 'se' },
    { code: 'no', name: 'Norsk', flagCode: 'no' },
    { code: 'da', name: 'Dansk', flagCode: 'dk' },
    { code: 'fi', name: 'Suomi', flagCode: 'fi' },
    { code: 'cs', name: 'Čeština', flagCode: 'cz' },
    { code: 'el', name: 'Ελληνικά', flagCode: 'gr' },
    { code: 'iw', name: 'עברית', flagCode: 'il' },
    { code: 'id', name: 'Bahasa Indonesia', flagCode: 'id' },
    { code: 'th', name: 'ไทย', flagCode: 'th' },
    { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' },
    { code: 'uk', name: 'Українська', flagCode: 'ua' },
    { code: 'ro', name: 'Română', flagCode: 'ro' },
    { code: 'hu', name: 'Magyar', flagCode: 'hu' },
    { code: 'bg', name: 'Български', flagCode: 'bg' }
  ];

  // Helper: Get flag image HTML (using flagcdn - same as main site)
  // flagcdn has w20, w40, w80 sizes
  function getFlagImg(flagCode, size = 40) {
    const displaySize = 26;
    const displayHeight = 17;
    return `<img src="https://flagcdn.com/w${size}/${flagCode}.png" width="${displaySize}" height="${displayHeight}" alt="${flagCode.toUpperCase()}" style="vertical-align:middle;border-radius:2px">`;
  }

  let currentLang = 'en';

  // Helper: Get base domain (from main site)
  function baseDomain(host) {
    const p = host.split('.');
    return p.length > 2 ? p.slice(-2).join('.') : host;
  }

  // Helper: Set cookie with domain support (from main site)
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

  // Set Google Translate cookie (from main site)
  function setGoogTrans(langCode) {
    const target = (langCode === 'zh') ? 'zh-CN' : langCode;
    const val = '/en/' + target;
    setCookie('googtrans', val, 365);
    const root = '.' + baseDomain(location.hostname.replace(/^www\./, ''));
    setCookie('googtrans', val, 365, root);
  }

  // Apply language and direction attributes (from main site)
  function applyDirLang(langCode) {
    document.documentElement.lang = (langCode === 'zh') ? 'zh-CN' : langCode;
    document.documentElement.dir = (langCode === 'ar' || langCode === 'iw') ? 'rtl' : 'ltr';
  }

  // Get current language from cookie or localStorage
  function getCurrentLanguage() {
    // Check localStorage first
    const stored = localStorage.getItem('sp_lang');
    if (stored && stored !== 'en') {
      return stored;
    }

    // Check cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }

    return 'en';
  }

  // Change language (from main site approach)
  function changeLanguage(langCode) {
    if (langCode === 'en') {
      // Reset to English
      localStorage.removeItem('sp_lang');
      setCookie('googtrans', '', -1);
      const root = '.' + baseDomain(location.hostname.replace(/^www\./, ''));
      setCookie('googtrans', '', -1, root);
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
      location.reload();
    } else {
      // Save to localStorage
      localStorage.setItem('sp_lang', langCode);

      // Set cookies and attributes
      setGoogTrans(langCode);
      applyDirLang(langCode);

      // Reload page
      location.reload();
    }
  }

  // Create dropdown menu
  function createDropdownMenu() {
    const menu = document.createElement('div');
    menu.className = 'lang-dropdown-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Language selection');

    currentLang = getCurrentLanguage();

    languages.forEach(lang => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'menuitem');
      button.setAttribute('data-lang', lang.code);
      button.innerHTML = `${getFlagImg(lang.flagCode)} ${lang.name}`;

      if (lang.code === currentLang) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'true');
      }

      button.addEventListener('click', () => {
        changeLanguage(lang.code);
      });

      menu.appendChild(button);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-dropdown') && menu.classList.contains('active')) {
        menu.classList.remove('active');
      }
    });

    return menu;
  }

  // Initialize
  function init() {
    const container = document.getElementById('google_translate_element');
    if (!container) return;

    // Get current language info
    currentLang = getCurrentLanguage();
    const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

    // Turn container itself into the button
    container.id = 'langToggle';
    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', `Select language (current: ${currentLangObj.name})`);
    container.setAttribute('aria-haspopup', 'true');
    container.setAttribute('aria-expanded', 'false');
    container.innerHTML = getFlagImg(currentLangObj.flagCode);

    // Create dropdown menu and append to body
    const menu = createDropdownMenu();
    document.body.appendChild(menu);

    // Toggle menu
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');
      menu.classList.toggle('active');
      container.setAttribute('aria-expanded', !isActive);
    });

    // Apply language attributes on page load
    const lang = getCurrentLanguage();
    if (lang && lang !== 'en') {
      applyDirLang(lang);
    }

    // Load Google Translate in background
    loadGoogleTranslate();
  }

  // Load Google Translate script silently (matches main site approach)
  function loadGoogleTranslate() {
    // Only load if we have a non-English language selected
    const lang = getCurrentLanguage();
    if (!lang || lang === 'en') return;

    // Add the translate element hidden off-screen (main site approach)
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'google_translate_container';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hiddenDiv);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: languages.map(l => l.code).join(','),
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false  // KEY! Prevents Google's UI from showing
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

  // Aggressive banner cleanup
  function cleanupGoogleUI() {
    // Remove banner frames
    const frames = document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame, .skiptranslate');
    frames.forEach(f => {
      if (f.parentNode) f.parentNode.removeChild(f);
    });

    // Reset body position
    document.body.style.top = '0';
    document.body.style.position = 'relative';

    // Remove body top attribute that Google adds
    if (document.body.hasAttribute('style')) {
      const style = document.body.getAttribute('style');
      if (style && style.includes('top:')) {
        document.body.setAttribute('style', style.replace(/top:\s*[^;]+;?/g, ''));
      }
    }
  }

  // Run cleanup multiple times to catch delayed injections
  window.addEventListener('load', () => {
    cleanupGoogleUI();
    setTimeout(cleanupGoogleUI, 500);
    setTimeout(cleanupGoogleUI, 1000);
    setTimeout(cleanupGoogleUI, 2000);
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
