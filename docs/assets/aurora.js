// FILE: docs/assets/aurora.js — Aurora mount for MkDocs Material
(function(){
  function mountAurora(){
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const big = window.innerWidth >= 1024;

    const wrap = document.createElement('div');
    wrap.className = 'sp-aurora';
    const layer = document.createElement('div');
    layer.className = 'layer';
    wrap.appendChild(layer);

    if (big && !reduce){
      const v = document.createElement('video');
      v.autoplay = v.muted = v.playsInline = true;
      v.loop = true; v.preload = 'metadata';
      v.setAttribute('aria-hidden','true');
      v.poster = '/assets/aurora/aurora.webp';
      const s1 = document.createElement('source'); s1.type='video/webm'; s1.src='/assets/aurora/aurora-720p.webm';
      const s2 = document.createElement('source'); s2.type='video/mp4';  s2.src='/assets/aurora/aurora-720p.mp4';
      v.append(s1,s2);
      wrap.appendChild(v);

      const onVis = () => document.hidden ? v.pause() : v.play().catch(()=>{});
      document.addEventListener('visibilitychange', onVis);

      const io = new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting) v.play().catch(()=>{}); });
      },{root:null, threshold:0});
      io.observe(document.body);
    }

    document.body.prepend(wrap);
  }

  // Mount once docs DOM exists (Material’s instant nav swaps pages)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAurora);
  } else mountAurora();

  // Re-run on Material's "page loaded" event (for instant navigation)
  document.addEventListener('DOMContentLoaded', function(){
    const el = document.querySelector('main.md-main');
    if (!el) return;
    el.addEventListener('md-content-loaded', function(){
      // no-op; background is global and persists between pages
    });
  });
})();
