
// edu.js — site-wide behaviors for Education Hub
(function(){
  // Theme is now handled by signalpilot-theme.js
  // Keeping only non-theme functionality here

  const LOCALE_RE = /^\/(de|es|fr|it|pt|nl|ru|ja|tr|hu|ar)(?=\/|$)/;
  const locale = (location.pathname.match(LOCALE_RE) || [null,''])[1];

  // Paths that exist inside every locale directory. Everything else (search,
  // calculators, the tier hubs) is English-only, so its link is left alone.
  const LOCALISED = [/^\/education\/curriculum\//, /^\/education\/(index\.html)?$/];

  // Keep the reader inside their language when the target has a translation.
  // Idempotent: the locale prefix is stripped before it is put back, so an
  // href that is already localised comes out unchanged.
  function localise(href){
    if(!locale) return href;
    let url;
    try { url = new URL(href, location.origin); } catch(e){ return href; }
    if(url.origin !== location.origin && url.hostname !== 'www.signalpilot.io') return href;
    const path = url.pathname.replace(LOCALE_RE, '') || '/';
    if(!LOCALISED.some(re => re.test(path))) return href;
    return url.origin + '/' + locale + path + url.search + url.hash;
  }

  // 0) Keep every in-page link inside the reader's language.
  //    The locale pages are generated from the English original, so every
  //    internal href in them is written without a locale prefix: previous and
  //    next lesson, the related-lesson cards, the cross-references in the
  //    prose and the "Home" breadcrumb all pointed at the English page. A
  //    reader who finished a Turkish lesson and clicked "Sonraki ders" landed
  //    in English and had to pick their language again. Rewriting here rather
  //    than in the 825 generated files keeps one copy of the rule.
  if(locale){
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#') return;
      const fixed = localise(href);
      if(fixed !== href) a.setAttribute('href', fixed);
    });
  }

  // 1) Mobile menu — mirrors the page's own <nav>, so it is translated and
  //    locale-correct without a second hardcoded copy of the link list.
  (function(){
    const menuBtn = document.getElementById('menuToggle');
    if(!menuBtn) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';

    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.setAttribute('role','dialog');
    mobileNav.setAttribute('aria-modal','true');

    // The toggle already carries a translated label ("Menu ", "Menü ", ...).
    const label = (menuBtn.querySelector('.menu-toggle-text')?.textContent || 'Menu').trim() || 'Menu';
    mobileNav.setAttribute('aria-label', label);

    const header = document.createElement('div');
    header.className = 'mobile-nav-header';
    const title = document.createElement('span');
    title.style.cssText = 'color:#fff;font-weight:700;font-size:1.1rem';
    title.textContent = label;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-nav-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    header.appendChild(title);
    header.appendChild(closeBtn);

    const links = document.createElement('div');
    links.className = 'mobile-nav-links';

    const source = document.querySelectorAll('#mainnav a');
    if(source.length){
      source.forEach(a => {
        const copy = document.createElement('a');
        copy.href = localise(a.getAttribute('href'));
        copy.textContent = a.textContent.trim();
        if(a.target) copy.target = a.target;
        if(a.rel) copy.rel = a.rel;
        if(a.getAttribute('aria-current')) copy.setAttribute('aria-current', a.getAttribute('aria-current'));
        links.appendChild(copy);
      });
    } else {
      // No nav on this page (shouldn't happen) — fall back to the hub.
      const a = document.createElement('a');
      a.href = localise('/education/');
      a.textContent = 'Education';
      links.appendChild(a);
    }

    mobileNav.appendChild(header);
    mobileNav.appendChild(links);
    document.body.appendChild(backdrop);
    document.body.appendChild(mobileNav);

    function open(){
      backdrop.classList.add('active');
      mobileNav.classList.add('active');
      menuBtn.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close(){
      backdrop.classList.remove('active');
      mobileNav.classList.remove('active');
      menuBtn.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
      menuBtn.focus();
    }

    menuBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && mobileNav.classList.contains('active')) close();
    });
  })();

  // 2) Build ToC from h2/h3
  const toc = document.querySelector('aside.toc');
  if(toc){
    const hs = document.querySelectorAll('.prose h2, .prose h3');
    if(hs.length){
      const box = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = 'On this page'; box.appendChild(title);
      hs.forEach(h => {
        if(!h.id){
          const id = h.textContent.trim().toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');
          h.id = id;
        }
        const a=document.createElement('a'); a.href='#'+h.id; a.textContent = h.textContent;
        if(h.tagName==='H3') a.style.marginLeft='.5rem';
        box.appendChild(a);
      });
      toc.appendChild(box);
    }
  }

  // 3) Footer year
  (function(){ var y=document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); })();

  // 4) One-and-done brand background
  (function(w,d){ if(w.__spbg_loaded) return; w.__spbg_loaded=true;
    var s=d.createElement('script'); s.src='/education/assets/sp-bg.js'; s.defer=true; d.head.appendChild(s);
  })(window,document);
})();
