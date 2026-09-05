/* Render the resource Markdown sources to PDF.
 *
 * Three template PDFs carried lesson attributions from the pre-rebuild course
 * -- "From Lesson 9: Position Sizing", where lesson 9 is now Who Else Is Here.
 * Correct Markdown sources for all three already existed in the repository and
 * cite the right lessons; nobody had ever rendered them. So the PDFs become
 * build artifacts of those sources rather than files with no origin.
 *
 *   node scripts/curriculum/mkpdf.cjs            render every source
 *   node scripts/curriculum/mkpdf.cjs --check    exit non-zero if any is stale
 *
 * The palette and type scale are read off the originals so a regenerated file
 * sits beside the ones still to be redone without looking foreign.
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const puppeteer = require('puppeteer-core');
const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'education', 'resources');

const CSS = `
  @page { size: Letter; margin: 18mm 16mm 20mm 16mm; }
  * { box-sizing: border-box; }
  body { font: 11pt/1.55 "Helvetica Neue", Helvetica, Arial, sans-serif;
         color: #1F2937; margin: 0; }
  h1 { font-size: 22pt; line-height: 1.2; color: #1E3A5F; margin: 0 0 .2em; }
  h2 { font-size: 14pt; color: #1E40AF; margin: 1.6em 0 .5em;
       border-bottom: 1px solid #E2E8F0; padding-bottom: .25em; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #1E3A5F; margin: 1.2em 0 .4em; page-break-after: avoid; }
  p, li { font-size: 11pt; }
  em { color: #4B5563; }
  hr { border: 0; border-top: 1px solid #E2E8F0; margin: 1.6em 0; }
  blockquote { background: #F8FAFC; border-left: 3px solid #2563EB;
               margin: 1.2em 0; padding: .8em 1em; color: #4B5563; font-size: 10pt; }
  blockquote p { margin: 0; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt;
          page-break-inside: avoid; }
  th { background: #DBEAFE; color: #1E3A5F; text-align: left; font-weight: 600; }
  th, td { border: 1px solid #E2E8F0; padding: .45em .6em; vertical-align: top; }
  tbody tr:nth-child(even) { background: #F8FAFC; }
  code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9.5pt;
         background: #F8FAFC; padding: .1em .3em; border-radius: 3px; }
  ul, ol { padding-left: 1.3em; }
  .brand { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase;
           color: #6B7280; margin: 0 0 .6em; }
`;

/* A deliberately small Markdown subset: exactly what the nine sources use. */
function md(src) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const lines = src.split(/\r?\n/);
  const out = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para.length = 0; } };
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { flush(); i++; continue; }
    if (/^---+\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
    let h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\s*\|/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      flush();
      const row = s => s.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = row(l);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { body.push(row(lines[i])); i++; }
      out.push('<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') +
        '</tr></thead><tbody>' + body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>');
      continue;
    }
    if (/^\s*>/.test(l)) {
      flush();
      const q = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push('<blockquote>' + md(q.join('\n')) + '</blockquote>');
      continue;
    }
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(l)) {
      flush();
      const ordered = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lines.length && /^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
        let txt = lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, '');
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
          txt += ' ' + lines[i].trim(); i++;
        }
        items.push(`<li>${inline(txt)}</li>`);
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    para.push(l.trim()); i++;
  }
  flush();
  return out.join('\n');
}

function sources() {
  const out = [];
  for (const dir of fs.readdirSync(SRC)) {
    const d = path.join(SRC, dir);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) {
      if (f.endsWith('.md')) out.push({ md: path.join(d, f), pdf: path.join(d, f.replace(/\.md$/, '.pdf')) });
    }
  }
  return out.sort((a, b) => a.md.localeCompare(b.md));
}

(async () => {
  const check = process.argv.includes('--check');
  const jobs = sources();
  const browser = await puppeteer.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  let wrote = 0, stale = 0;
  for (const j of jobs) {
    const src = fs.readFileSync(j.md, 'utf8');
    const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
      <div class="brand">Signal Pilot Education</div>${md(src)}`;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const buf = await page.pdf({
      format: 'Letter', printBackground: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;font:8pt Helvetica,Arial,sans-serif;color:#6B7280;
        padding:0 16mm;text-align:center">Signal Pilot Education Hub | signalpilot.io |
        Page <span class="pageNumber"></span></div>`,
      margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
    });
    await page.close();
    const rel = path.relative(ROOT, j.pdf);
    if (check) {
      if (!fs.existsSync(j.pdf)) { console.log(`missing  ${rel}`); stale++; }
      continue;
    }
    fs.writeFileSync(j.pdf, buf);
    console.log(`wrote    ${rel}  (${(buf.length / 1024).toFixed(0)} KB)`);
    wrote++;
  }
  await browser.close();
  console.log(`\n${jobs.length} sources, ${check ? stale + ' missing' : wrote + ' rendered'}`);
  process.exit(check ? stale : 0);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
