
// edu.js — site-wide behaviors for Education Hub
(function(){
  // Theme is now handled by signalpilot-theme.js
  // Keeping only non-theme functionality here

  // 1) Mobile menu - completely rebuilt
  (function(){
    const menuBtn = document.getElementById('menuToggle');
    if(!menuBtn) return;

    // Create mobile nav structure
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';

    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';

    const header = document.createElement('div');
    header.className = 'mobile-nav-header';
    header.innerHTML = '<span style="color:#fff;font-weight:700;font-size:1.1rem">Menu</span><button class="mobile-nav-close">&times;</button>';

    const links = document.createElement('div');
    links.className = 'mobile-nav-links';
    links.innerHTML = `
      <a href="/">Education</a>
      <a href="/education/my-library.html">My Library</a>
      <a href="/education/challenges.html">Challenges</a>
      <a href="/education/search.html">Search</a>
      <a href="/education/calculators.html">Calculators</a>
      <a href="https://www.signalpilot.io/blog" target="_blank" rel="noopener">Blog</a>
    `;

    mobileNav.appendChild(header);
    mobileNav.appendChild(links);
    document.body.appendChild(backdrop);
    document.body.appendChild(mobileNav);

    const closeBtn = header.querySelector('.mobile-nav-close');

    // Open/close functions
    function open(){
      backdrop.classList.add('active');
      mobileNav.classList.add('active');
      menuBtn.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';
    }

    function close(){
      backdrop.classList.remove('active');
      mobileNav.classList.remove('active');
      menuBtn.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }

    // Event listeners
    menuBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
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
