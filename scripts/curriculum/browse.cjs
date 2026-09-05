// Load every page in a real browser, click everything clickable, and report
// any error the page throws. Catches what the static checker cannot: a handler
// that exists but throws, a null dereference, a race on load.
//
//   python3 -m http.server 8899 --bind 127.0.0.1 &
//   npm i --no-save playwright
//   node scripts/curriculum/browse.cjs /education/index.html [more paths]
//
// Third-party hosts are aborted so the run measures this site rather than an
// ad network's uptime. Chromium comes from PLAYWRIGHT_BROWSERS_PATH.
const {chromium} = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8899';
const EXE = process.env.CHROME || undefined;   // undefined = Playwright's own
const THIRD = /googletagmanager|google-analytics|plausible\.io|fonts\.googleapis|fonts\.gstatic|doubleclick|jsdelivr|unpkg|supabase\.co|translate\.google/;
(async () => {
  const browser = await chromium.launch(EXE ? {headless:true, executablePath:EXE} : {headless:true});
  let total = 0;
  for (const path of process.argv.slice(2)) {
    const ctx = await browser.newContext();
    await ctx.route('**/*', r => THIRD.test(r.request().url()) ? r.abort() : r.continue());
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + String(e).split('\n')[0].slice(0,160)));
    page.on('console', m => { if (m.type()!=='error') return;
      const t=m.text();
      if (/net::ERR|Failed to load resource|Supabase|Chart\.js|blocked|ERR_FAILED/i.test(t)) return;
      errs.push('console: ' + t.slice(0,160)); });
    let clicked=0, broke=[];
    try {
      await page.goto(BASE+path, {waitUntil:'domcontentloaded', timeout:25000});
      await page.waitForTimeout(1500);
      const targets = await page.$$('button:not([disabled]), [onclick], [role="button"]');
      for (const t of targets.slice(0,50)) {
        try {
          if (!(await t.isVisible())) continue;
          const n = errs.length;
          await t.click({timeout:1200, noWaitAfter:true});
          clicked++;
          await page.waitForTimeout(100);
          if (errs.length>n) {
            const label=((await t.innerText().catch(()=>''))||'').trim().replace(/\s+/g,' ').slice(0,34)
                        || (await t.getAttribute('id')) || '?';
            broke.push(label+' -> '+errs[errs.length-1]);
          }
          await page.keyboard.press('Escape').catch(()=>{});
        } catch(e){}
      }
    } catch(e){ errs.push('navigation: '+e.message.split('\n')[0].slice(0,90)); }
    const u=[...new Set(errs)]; total+=u.length;
    console.log((u.length?'FAIL ':'ok   ')+path.padEnd(50)+'clicked '+String(clicked).padStart(3)+(u.length?'  '+u.length+' err':''));
    u.slice(0,5).forEach(e=>console.log('       '+e));
    broke.slice(0,4).forEach(e=>console.log('       click: '+e));
    await ctx.close();
  }
  await browser.close();
  console.log('\ntotal distinct errors: '+total);
  process.exit(total ? 1 : 0);
})();
