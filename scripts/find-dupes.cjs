const fs = require('fs');
const path = require('path');
const SOCIAL_DIR = 'INSTAGRAM_CONTENT_HUB/social';
const dirs = fs.readdirSync(SOCIAL_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^post-\d+$/.test(d.name));

for (const dir of dirs) {
  const htmlPath = path.join(SOCIAL_DIR, dir.name, 'carousel.html');
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');

  const titles = [...html.matchAll(/class="slide-title[^"]*">(.*?)<\/h2>/g)].map(m => m[1].trim());
  const seen = {};
  for (const t of titles) { const k = t.toLowerCase(); seen[k] = (seen[k] || 0) + 1; }
  const dupes = Object.entries(seen).filter(([,c]) => c > 1);
  if (dupes.length > 0) {
    console.log(dir.name + ' TITLE DUPES:');
    dupes.forEach(([text, count]) => console.log('  ' + count + 'x: ' + text.substring(0, 80)));
  }

  const bodies = [...html.matchAll(/class="(?:slide-body|card-desc|callout-text)">(.*?)<\//g)]
    .map(m => m[1].trim()).filter(b => b.length > 20);
  const seenB = {};
  for (const b of bodies) { seenB[b] = (seenB[b] || 0) + 1; }
  const dupesB = Object.entries(seenB).filter(([,c]) => c > 1);
  if (dupesB.length > 0) {
    console.log(dir.name + ' BODY DUPES:');
    dupesB.forEach(([text, count]) => console.log('  ' + count + 'x: ' + text.substring(0, 80)));
  }
}
