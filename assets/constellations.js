/* Constellations background — light CPU, DPI aware, pauses on blur */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const CANVAS_ID = 'constellations';
  let c = document.getElementById(CANVAS_ID);
  if (!c) {
    c = document.createElement('canvas');
    c.id = CANVAS_ID;
    c.className = 'sp-constellations';
    document.body.prepend(c);
  }
  const ctx = c.getContext('2d');
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W=0, H=0, RAF=0, STARS=[], N=0;

  function resize(){
    const vw = window.innerWidth, vh = window.innerHeight;
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    c.width = Math.floor(vw * dpr);
    c.height = Math.floor(vh * dpr);
    c.style.width = vw + 'px';
    c.style.height = vh + 'px';
    W = c.width; H = c.height;
    // star count scales with area; cap low on mobiles
    const density = (vw >= 1024 ? 0.12 : 0.06); // stars per 10k px²
    const target = Math.round((vw*vh/10000) * density);
    if (!STARS.length) STARS = new Array(target).fill(0).map(seed);
    else if (target > STARS.length) STARS.push(...new Array(target-STARS.length).fill(0).map(seed));
    else STARS = STARS.slice(0, target);
    N = STARS.length;
  }

  function seed(){
    return {
      x: Math.random()*W,
      y: Math.random()*H,
      vx: (Math.random()*2-1) * 0.04 * dpr,
      vy: (Math.random()*2-1) * 0.04 * dpr,
      r: (Math.random()*0.9 + 0.4) * dpr,
      a: 0.55 + Math.random()*0.35
    };
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    // Draw stars
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i=0;i<N;i++){
      const s = STARS[i];
      s.x += s.vx; s.y += s.vy;
      if (s.x < -5) s.x = W+5; if (s.x > W+5) s.x = -5;
      if (s.y < -5) s.y = H+5; if (s.y > H+5) s.y = -5;
      ctx.globalAlpha = s.a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    // Draw lines between near stars
    ctx.lineWidth = 0.6 * dpr;
    for (let i=0;i<N;i++){
      for (let j=i+1;j<N;j++){
        const a = STARS[i], b = STARS[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if (d < (140* dpr)*(140* dpr)){ // threshold^2
          ctx.globalAlpha = 0.12 * (1 - d / (140* dpr * 140* dpr));
          ctx.strokeStyle = '#bcd5ff';
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    RAF = requestAnimationFrame(step);
  }

  function start(){ if(!RAF) RAF = requestAnimationFrame(step); }
  function stop(){ if(RAF){ cancelAnimationFrame(RAF); RAF=0; } }

  resize(); start();
  window.addEventListener('resize', ()=>{stop(); resize(); start();}, {passive:true});
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
})();
