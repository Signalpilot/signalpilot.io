const q = JSON.parse(require('fs').readFileSync('data/social/content-queue.json','utf8'));
const nums = [16,21,101,201,251,288,291,341,342,345,398,519,581,641,650];
for (const n of nums) {
  const p = q.find(x => x.postNumber === n);
  if (p === undefined || p.twitter === undefined) continue;
  console.log('=== #' + n + ': ' + p.title + ' ===');
  p.twitter.tweets.forEach((t, i) => {
    // Check which criteria it meets
    const hasNum = /\d+%|\$\d+|\d+x|\d+ (day|week|month|hour|minute|candle|bar|period|trade)/.test(t);
    const hasAction = /set |place |enter |exit |wait |look for|watch for|check |use |apply /i.test(t);
    const hasExample = /example|e\.g\.|for instance|like when|such as|scenario/i.test(t);
    const flags = (hasNum ? 'N' : '.') + (hasAction ? 'A' : '.') + (hasExample ? 'E' : '.');
    console.log('[' + i + '] (' + t.length + 'ch) [' + flags + '] ' + t.substring(0, 180));
  });
  console.log('');
}
