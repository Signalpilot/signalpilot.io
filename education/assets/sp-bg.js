// sp-bg.js — universal background injector (stars + constellations + aurora)
(function(){
  if (window.__spbg_init) return; window.__spbg_init = true;
  const d=document, w=window;
  const prefersReduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // CSS - soft gradient like blog.signalpilot.io
  const CSS_ID='sp-bg-css';
  if(!d.getElementById(CSS_ID)){
    const s=d.createElement('style'); s.id=CSS_ID; s.textContent = `
    .bg-stars{display:none}
    .sp-constellations{display:none}
    .bg-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none;
      background:linear-gradient(180deg, rgba(156,192,255,0.08) 0%, rgba(124,202,255,0.05) 30%, transparent 60%)}
    `;
    d.head.appendChild(s);
  }

  // Nodes - only create aurora div, skip stars and constellations
  function ensure(sel, tag, cls, attrs){
    let el = d.querySelector(sel);
    if(!el){
      el = d.createElement(tag);
      if(cls) el.className = cls;
      if(attrs) for(const k in attrs) el.setAttribute(k, attrs[k]);
      d.body.prepend(el);
    }
    return el;
  }
  ensure('.bg-aurora','div','bg-aurora',{'aria-hidden':'true'});

  // Constellations disabled for cleaner look
})();