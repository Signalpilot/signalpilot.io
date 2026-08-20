// Scans /articles/*.html and builds /articles/index.json for the Education landing page.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, 'articles');
const OUT = path.join(ARTICLES, 'index.json');

function pick(re, html, def='') {
  const m = html.match(re);
  return m ? m[1].trim() : def;
}

const files = (await fs.readdir(ARTICLES)).filter(f => f.endsWith('.html')).sort();
const out = [];

for (const f of files) {
  const html = await fs.readFile(path.join(ARTICLES, f), 'utf8');

  const title = pick(/<title>(.*?)\s*—\s*SignalPilot Education<\/title>/i, html)
             || pick(/<h1[^>]*>(.*?)<\/h1>/i, html);

  const description = pick(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i, html);
  const level = pick(/<meta\s+name=["']sp-level["']\s+content=["']([^"']+)["']/i, html)
             || pick(/<span class="badge">(.*?)<\/span>/i, html);

  const order = Number(pick(/<meta\s+name=["']sp-order["']\s+content=["']([^"']+)["']/i, html) || '9999');

  out.push({ href: `/articles/${f}`, title, description, level, order });
}

// Sort within level by order, then title
out.sort((a, b) => (a.level === b.level)
  ? (a.order - b.order || a.title.localeCompare(b.title))
  : (a.level < b.level ? -1 : 1));

await fs.writeFile(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote ${out.length} entries to articles/index.json`);
