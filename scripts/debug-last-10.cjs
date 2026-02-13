const fs = require('fs');
const q = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));

const nums = [101,201,288,291,341,342,345,398,519,641];
for (const n of nums) {
  const p = q.find(x => x.postNumber === n);
  if (!p || !p.twitter) continue;
  const tweets = p.twitter.tweets;
  console.log('=== #' + n + ': ' + p.title + ' (' + tweets.length + ' tweets) ===');

  // Score value like the audit does
  const middle = tweets.slice(1, -1);
  let hasNumbers = 0, hasExample = 0, hasSpecific = 0;
  for (const t of middle) {
    const lower = t.toLowerCase();
    if (/\d+%|\$\d+|\d+x|\d+ (day|week|month|hour|minute|candle|bar|period)/.test(t)) { hasNumbers++; }
    if (/example|e\.g\.|for instance|like when|such as|scenario/.test(lower)) { hasExample++; }
    if (/step \d|rule \d|tip \d|#\d/.test(lower)) { hasSpecific++; }
    if (/set |place |enter |exit |wait |look for|watch for|check |use |apply /.test(lower)) { hasSpecific++; }
  }
  const score = Math.min(hasNumbers, 3) * 0.5 + Math.min(hasExample, 2) * 0.7 + Math.min(hasSpecific, 3) * 0.5;
  const bonus = middle.length >= 5 ? 0.5 : middle.length >= 3 ? 0.3 : 0;
  const total = score + bonus;
  let grade = 'C';
  if (total >= 3) grade = 'A+';
  else if (total >= 2.5) grade = 'A';
  else if (total >= 2) grade = 'A-';
  else if (total >= 1.5) grade = 'B+';
  else if (total >= 1) grade = 'B';
  else if (total >= 0.5) grade = 'B-';

  console.log('  Value score: ' + total.toFixed(1) + ' → ' + grade);
  console.log('  Numbers: ' + hasNumbers + ', Examples: ' + hasExample + ', Specific: ' + hasSpecific);
  console.log('  Middle tweets: ' + middle.length);

  for (let i = 0; i < middle.length; i++) {
    const t = middle[i];
    const lower = t.toLowerCase();
    const n2 = /\d+%|\$\d+|\d+x|\d+ (day|week|month|hour|minute|candle|bar|period)/.test(t) ? 'N' : '.';
    const e2 = /example|e\.g\.|for instance|like when|such as|scenario/.test(lower) ? 'E' : '.';
    const s2 = (/step \d|rule \d|tip \d|#\d/.test(lower) || /set |place |enter |exit |wait |look for|watch for|check |use |apply /.test(lower)) ? 'S' : '.';
    console.log('  [' + (i+1) + '] [' + n2 + e2 + s2 + '] ' + t.substring(0, 150));
  }
  console.log('');
}
