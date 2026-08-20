<script>
// sp-bg.js — SignalPilot universal background injector (stars + constellations + aurora)
// Works on main site, Education hub, and Docs without per-page edits.
(function(){
  if (window.__spbg_init) return; window.__spbg_init = true;
  const d=document, w=window, html=d.documentElement;
  const prefersReduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Inject minimal CSS once (stars, canvas, aurora CSS, video class) ----
  const CSS_ID='sp-bg-css';
  if(!d.getElementById(CSS_ID)){
    const s=d.createElement('style'); s.id=CSS_ID; s.textContent = `
    .bg-stars{position:fixed;inset:0;z-index:-3;pointer-events:none;opacity:.70;
      background:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,.9), transparent 60%),
        radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,.7), transparent 60%),
        radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,.8), transparent 60%),
        radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,.8), transparent 60%),
        radial-gradient(1px 1px at 55% 10%, rgba(255,255,255,.7), transparent 60%),
        radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,.7), transparent 60%),
        radial-gradient(1px 1px at 44% 74%, rgba(255,255,255,.7), transparent 60%),
        radial-gradient(1px 1px at 78% 88%, rgba(255,255,255,.7), transparent 60%);
      filter:drop-shadow(0 0 2px rgba(255,255,255,.25))}
    .sp-constellations{position:fixed;inset:0;z-index:-2;pointer-events:none}
    .bg-aurora-video{position:fixed;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;pointer-events:none;opacity:.86;mix-blend-mode:screen;filter:saturate(120%)}
    .bg-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.85;
      background:
       radial-gradient(45% 35% at 12% 12%,rgba(125,200,255,.40),transparent 62%),
       radial-gradient(36% 28% at 85% 14%,rgba(155,140,255,.38),transparent 65%),
       radial-gradient(48% 36% at 78% 88%,rgba(118,221,255,.28),transparent 70%),
       radial-gradient(26% 22% at 8% 72%,rgba(151,124,255,.22),transparent 66%);
      filter:blur(60px) saturate(130%) brightness(110%); mix-blend-mode:screen;
      animation:spAur 36s linear infinite alternate}
    @keyframes spAur{from{transform:translate3d(-2%,-1%,0) scale(1.02)}to{transform:translate3d(2%,1%,0) scale(1.05)}}
    @media (prefers-reduced-motion: reduce){ .bg-aurora{animation:none} .bg-aurora-video{display:none} }
    `;
    d.head.appendChild(s);
  }

  // ---- Ensure background nodes are present (no duplicates) ----
  function ensure(sel, tag, cls, attrs){
    let el = d.querySelector(sel);
    if(!el){
      el = d.createElement(tag);
      if(cls) el.className = cls;
      if(attrs) for(const k in attrs) el.setAttribute(k, attrs[k]);
      // put backgrounds at the very top of <body>
      d.body.prepend(el);
    }
    return el;
  }
  ensure('.bg-stars','div','bg-stars',{'aria-hidden':'true'});
  const canvas = ensure('#constellations','canvas','sp-constellations',{'id':'constellations','aria-hidden':'true'});

  // Aurora layer (CSS glow) always; video optional
  ensure('.bg-aurora','div','bg-aurora',{'aria-hidden':'true'});
  if(!prefersReduce && !d.querySelector('.bg-aurora-video') && (w.SP_BG_VIDEO_SRC_MP4 || w.SP_BG_VIDEO_SRC_WEBM)){
    const v=d.createElement('video'); v.className='bg-aurora-video';
    v.autoplay=true; v.muted=true; v.playsInline=true; v.loop=true; v.preload='auto'; v.setAttribute('aria-hidden','true');
    if(w.SP_BG_VIDEO_SRC_WEBM){ const s1=d.createElement('source'); s1.src=w.SP_BG_VIDEO_SRC_WEBM; s1.type='video/webm'; v.appendChild(s1); }
    if(w.SP_BG_VIDEO_SRC_MP4){ const s2=d.createElement('source'); s2.src=w.SP_BG_VIDEO_SRC_MP4;  s2.type='video/mp4';  v.appendChild(s2); }
    // insert beneath stars/canvas but above CSS aurora
    const aur = d.querySelector('.bg-aurora'); d.body.insertBefore(v, aur||d.body.firstChild);
    v.addEventListener('canplay', ()=> v.play().catch(()=>{}), {once:true});
  }

  // ---- Constellations painter (self-contained; skips if already running) ----
  if (w.__spConstellationsInit) return; w.__spConstellationsInit = true;
  const ctx = canvas.getContext('2d',{alpha:true});
  let dpr = Math.max(1, Math.min(2, w.devicePixelRatio || 1));
  let width, height, points, raf;
  function R(a,b){ return a + Math.random()*(b-a); }
  function reset(){
    width = canvas.clientWidth || w.innerWidth;
    height = canvas.clientHeight || w.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const area = width * height;
    const target = Math.min(120, Math.max(60, Math.floor(area / 12000))); // density auto
    points = Array.from({length:target},()=>({ x:R(0,width), y:R(0,height), vx:R(-0.15,0.15), vy:R(-0.15,0.15) }));
  }
  function step(){
    ctx.clearRect(0,0,width,height);
    for(const p of points){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -20) p.x = width+20; else if(p.x > width+20) p.x = -20;
      if(p.y < -20) p.y = height+20; else if(p.y > height+20) p.y = -20;
    }
    const L = Math.min(width,height) * 0.10; // link distance
    for(let i=0;i<points.length;i++){
      for(let j=i+1;j<points.length;j++){
        const dx=points[i].x - points[j].x, dy=points[i].y - points[j].y;
        const dist = Math.hypot(dx,dy);
        if(dist < L){
          const a = 1 - (dist/L);
          ctx.strokeStyle = `rgba(180,200,255,${a*0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(step);
  }
  function start(){ if(prefersReduce) return; cancelAnimationFrame(raf); reset(); step(); }
  const ro = new ResizeObserver(start); ro.observe(canvas);
  w.addEventListener('orientationchange', start);
  start();
})();
</script>
