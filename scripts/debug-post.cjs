const fs = require('fs');
const contentQueue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));
const gridData = JSON.parse(fs.readFileSync('data/social/9grid-structures.json', 'utf8'));

const postNum = parseInt(process.argv[2] || '96');
const post = contentQueue.find(p => p.postNumber === postNum);
const gridPost = gridData.posts.find(g => g.postNumber === postNum);

if (!post) { console.log('Post not found'); process.exit(1); }

console.log('=== POST', postNum, '===');
console.log('Type:', post.type);
console.log('Title:', post.title);
console.log('');

// Show tweets
const tweets = (post.twitter?.tweets || []).map(t => t.replace(/\\n/g, '\n').replace(/🧵$/, '').trim());
console.log('Content sources:', tweets.length, 'items');
tweets.forEach((t, i) => console.log(`  [${i}]: ${t.substring(0, 80)}...`));

// Show slide structure
const slideStructure = gridPost?.slideStructure || [];
console.log('\nSlide structure (' + slideStructure.length + ' entries):');
slideStructure.forEach((s, i) => console.log(`  [${i}]: ${s}`));

// Show extracted key points
function extractKeyPoints(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('http'));
  return lines.map(l => l.replace(/^[→•\-\d.]+\s*/, '').trim()).filter(l => l.length > 5);
}

const contentTweets = tweets.length > 2 ? tweets.slice(1, -1) : tweets.slice(0);
const allContentPoints = [];
const seenPts = new Set();
for (const t of contentTweets) {
  for (const p of extractKeyPoints(t)) {
    const key = p.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    if (key.length > 3 && !seenPts.has(key)) {
      seenPts.add(key);
      allContentPoints.push(p);
    } else if (seenPts.has(key)) {
      console.log('  DEDUP CAUGHT:', key.substring(0, 60));
    }
  }
}

console.log('\nPooled unique points:', allContentPoints.length);
allContentPoints.forEach((p, i) => console.log(`  [${i}]: ${p.substring(0, 80)}`));

// Show how they'd be distributed
const numContentSlides = (gridPost?.slideCount || 6) - 2;
const ptsPerSlide = Math.max(1, Math.ceil(allContentPoints.length / numContentSlides));
console.log('\nDistribution:', numContentSlides, 'content slides,', ptsPerSlide, 'pts/slide');
for (let i = 0; i < numContentSlides; i++) {
  const start = i * ptsPerSlide;
  const pts = allContentPoints.slice(start, start + ptsPerSlide);
  const struct = slideStructure[i + 1] || '';
  const structParts = struct.split(':');
  const structContent = structParts.slice(1).join(':')?.trim() || '';
  console.log(`  Slide ${i+2}: structContent="${structContent.substring(0,50)}" | pts[0]="${(pts[0]||'').substring(0,50)}"`);
}
