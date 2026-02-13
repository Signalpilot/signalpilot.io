#!/usr/bin/env node
/**
 * Audit all 651 Twitter threads in content-queue.json
 * Grades: A+, A, A-, B+, B, B-, C, D, F
 * Criteria: Hook, Value, Flow, CTA, Accuracy, CharLimit
 */
const fs = require('fs');
const queue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));

const results = [];

// Common weak/generic phrases that lower quality
const genericPhrases = [
  'game changer', 'game-changer', 'level up', 'next level', 'secret weapon',
  'most traders', 'here\'s the thing', 'let me explain', 'thread 🧵',
  'a thread', 'read this', 'save this', 'bookmark this',
  'don\'t miss', 'you need to', 'stop what you\'re doing',
  'the truth is', 'real talk', 'hot take', 'unpopular opinion',
  'nobody talks about', 'they don\'t want you to know',
  'this is huge', 'mind blown', 'let that sink in'
];

const repetitiveCTAs = [
  'follow for more', 'like and retweet', 'share this',
  'drop a', 'comment below', 'let me know'
];

const strongHookPatterns = [
  /^\d+/, // starts with number
  /lost \$|made \$|blew|wiped/, // loss/gain story
  /mistake|wrong|fail|error/, // learning from failure
  /secret|hidden|overlooked/, // curiosity gap
  /stop |don't |never |avoid/, // warning/prohibition
  /\?$/, // question hook
  /I (spent|studied|analyzed|tested|traded)/, // personal experience
  /^The (biggest|worst|best|#1|most)/, // superlative
];

function countGeneric(tweets) {
  let count = 0;
  for (const t of tweets) {
    const lower = t.toLowerCase();
    for (const phrase of genericPhrases) {
      if (lower.includes(phrase)) { count++; break; }
    }
  }
  return count;
}

function hasRepetitiveCTA(lastTweet) {
  const lower = lastTweet.toLowerCase();
  for (const cta of repetitiveCTAs) {
    if (lower.includes(cta)) return true;
  }
  return false;
}

function scoreHook(tweet1) {
  const lower = tweet1.toLowerCase();
  let score = 0;

  // Length check — hooks should be punchy (under 200 chars ideal)
  if (tweet1.length < 150) score += 1;
  else if (tweet1.length < 200) score += 0.5;

  // Pattern matching
  for (const pat of strongHookPatterns) {
    if (pat.test(lower) || pat.test(tweet1)) { score += 1.5; break; }
  }

  // Specificity — contains numbers, percentages, or dollar amounts
  if (/\d+%|\$\d+|\d+x/.test(tweet1)) score += 1;

  // Has emoji (engagement boost)
  if (/[\u{1F600}-\u{1FFFF}]/u.test(tweet1)) score += 0.3;

  // Penalize generic hooks
  for (const phrase of genericPhrases) {
    if (lower.includes(phrase)) { score -= 1; break; }
  }

  // Map to grade
  if (score >= 3) return 'A+';
  if (score >= 2.5) return 'A';
  if (score >= 2) return 'A-';
  if (score >= 1.5) return 'B+';
  if (score >= 1) return 'B';
  if (score >= 0.5) return 'B-';
  return 'C';
}

function scoreValue(tweets) {
  // Middle tweets (skip first and last)
  const middle = tweets.slice(1, -1);
  let score = 0;
  let hasSpecific = 0;
  let hasNumbers = 0;
  let hasExample = 0;
  let genericCount = 0;

  for (const t of middle) {
    const lower = t.toLowerCase();
    // Specificity
    if (/\d+%|\$\d+|\d+x|\d+ (day|week|month|hour|minute|candle|bar|period)/.test(t)) hasNumbers++;
    if (/example|e\.g\.|for instance|like when|such as|scenario/.test(lower)) hasExample++;
    if (/step \d|rule \d|tip \d|#\d/.test(lower)) hasSpecific++;
    // Check for actionable content
    if (/set |place |enter |exit |wait |look for|watch for|check |use |apply/.test(lower)) hasSpecific++;
    // Generic filler
    for (const phrase of genericPhrases) {
      if (lower.includes(phrase)) { genericCount++; break; }
    }
  }

  score += Math.min(hasNumbers, 3) * 0.5;
  score += Math.min(hasExample, 2) * 0.7;
  score += Math.min(hasSpecific, 3) * 0.5;
  score -= genericCount * 0.5;

  // Bonus for longer threads (more value)
  if (middle.length >= 5) score += 0.5;
  else if (middle.length >= 3) score += 0.3;

  if (score >= 3) return 'A+';
  if (score >= 2.5) return 'A';
  if (score >= 2) return 'A-';
  if (score >= 1.5) return 'B+';
  if (score >= 1) return 'B';
  if (score >= 0.5) return 'B-';
  return 'C';
}

function scoreFlow(tweets) {
  let score = 2; // Start neutral

  // Check for transitional words between tweets
  let transitions = 0;
  for (let i = 1; i < tweets.length; i++) {
    const lower = tweets[i].toLowerCase();
    if (/^(but|and|so|now|here|this|that|the key|the problem|the solution|next|then|finally|first|second|third|instead|however|meanwhile|important)/.test(lower)) {
      transitions++;
    }
  }
  score += Math.min(transitions / tweets.length, 0.5) * 2;

  // Check for repetitive starts
  const starts = tweets.map(t => t.split(' ').slice(0, 2).join(' ').toLowerCase());
  const uniqueStarts = new Set(starts).size;
  if (uniqueStarts < starts.length * 0.6) score -= 1; // Too many same starts

  // Check for logical structure (numbered, step-by-step)
  const hasStructure = tweets.some(t => /^(\d+[\.\):]|step \d|rule \d|tip \d|#\d)/i.test(t.trim()));
  if (hasStructure) score += 0.5;

  // Penalize if any tweet is very short (under 50 chars) — feels incomplete
  const shortTweets = tweets.filter(t => t.length < 50).length;
  if (shortTweets > 1) score -= 0.3;

  if (score >= 3) return 'A';
  if (score >= 2.5) return 'A-';
  if (score >= 2) return 'B+';
  if (score >= 1.5) return 'B';
  if (score >= 1) return 'B-';
  return 'C';
}

function scoreCTA(lastTweet) {
  const lower = lastTweet.toLowerCase();
  let score = 1; // Start neutral

  // Has a call to action
  if (/signalpilot|try |check out|explore|visit|start|get started|join|discover/.test(lower)) score += 1;

  // Value-add CTA (not just "follow me")
  if (/free|no cost|trial|demo|7 indicators|suite/.test(lower)) score += 0.5;

  // Links/mentions product
  if (/signalpilot\.io|tradingview/.test(lower)) score += 0.3;

  // Too pushy penalization
  if (/buy now|limited time|act fast|hurry|don't miss out|last chance/.test(lower)) score -= 1;

  // Bland/generic CTA
  if (hasRepetitiveCTA(lastTweet)) score -= 0.5;

  // Natural feel — ends with a thought, not just a pitch
  if (lastTweet.length > 120) score += 0.3; // Substantial CTA tweet

  if (score >= 2.5) return 'A';
  if (score >= 2) return 'A-';
  if (score >= 1.5) return 'B+';
  if (score >= 1) return 'B';
  if (score >= 0.5) return 'B-';
  return 'C';
}

function charViolations(tweets) {
  const violations = [];
  tweets.forEach((t, i) => {
    if (t.length > 280) violations.push({ index: i, length: t.length, over: t.length - 280 });
  });
  return violations;
}

function overallGrade(hook, value, flow, cta, charIssues, genericCount, tweetCount) {
  const gradeMap = { 'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C': 2.0, 'D': 1.0, 'F': 0 };

  // Weighted average: Hook 30%, Value 30%, Flow 20%, CTA 20%
  let avg = gradeMap[hook] * 0.3 + gradeMap[value] * 0.3 + gradeMap[flow] * 0.2 + gradeMap[cta] * 0.2;

  // Penalize character violations heavily
  if (charIssues.length > 0) avg -= charIssues.length * 0.5;

  // Penalize high generic phrase count
  if (genericCount >= 3) avg -= 0.5;
  else if (genericCount >= 2) avg -= 0.3;

  // Bonus for good thread length
  if (tweetCount >= 6) avg += 0.1;

  if (avg >= 4.15) return 'A+';
  if (avg >= 3.85) return 'A';
  if (avg >= 3.5) return 'A-';
  if (avg >= 3.15) return 'B+';
  if (avg >= 2.85) return 'B';
  if (avg >= 2.5) return 'B-';
  if (avg >= 1.5) return 'C';
  if (avg >= 0.5) return 'D';
  return 'F';
}

function identifyIssues(post, tweets, hookGrade, valueGrade, flowGrade, ctaGrade, chars, genericCount) {
  const issues = [];

  const gradeVal = g => ({ 'A+': 5, 'A': 4, 'A-': 3.5, 'B+': 3, 'B': 2.5, 'B-': 2, 'C': 1, 'D': 0.5, 'F': 0 }[g] || 0);

  if (gradeVal(hookGrade) < 3) issues.push(`Weak hook — needs to be more specific/intriguing`);
  if (gradeVal(valueGrade) < 3) issues.push(`Middle tweets lack specificity — add numbers, examples, or actionable steps`);
  if (gradeVal(flowGrade) < 3) issues.push(`Flow is choppy — add transitions between tweets`);
  if (gradeVal(ctaGrade) < 3) issues.push(`CTA is generic — make it more value-driven`);
  if (chars.length > 0) issues.push(`${chars.length} tweet(s) exceed 280 chars: indices ${chars.map(c => c.index).join(', ')}`);
  if (genericCount >= 2) issues.push(`${genericCount} generic/cliché phrases detected`);

  // Check for repetitive tweet starts
  const starts = tweets.map(t => t.split(' ')[0].toLowerCase());
  const startCounts = {};
  starts.forEach(s => startCounts[s] = (startCounts[s] || 0) + 1);
  const repeated = Object.entries(startCounts).filter(([k, v]) => v >= 3);
  if (repeated.length > 0) issues.push(`Repetitive starts: "${repeated[0][0]}" used ${repeated[0][1]} times`);

  if (tweets.length <= 3) issues.push(`Thread too short (${tweets.length} tweets) — needs more depth`);

  return issues;
}

function suggestion(issues, grade) {
  if (issues.length === 0) return 'Production-ready';
  if (grade.startsWith('A')) return 'Minor polish: ' + issues[0];
  if (grade.startsWith('B')) return 'Needs work: ' + issues.slice(0, 2).join('; ');
  return 'Major rewrite needed: ' + issues.slice(0, 3).join('; ');
}

// ==================== AUDIT ALL POSTS ====================
for (const post of queue) {
  if (!post.twitter || !post.twitter.tweets || post.twitter.tweets.length === 0) {
    results.push({
      postNumber: post.postNumber,
      title: post.title || 'Untitled',
      category: post.category || 'unknown',
      tweetCount: 0,
      grade: 'F',
      hookScore: 'F', valueScore: 'F', flowScore: 'F', ctaScore: 'F',
      issues: ['No tweets found'],
      charViolations: [],
      suggestion: 'Thread has no content — needs full creation'
    });
    continue;
  }

  const tweets = post.twitter.tweets;
  const hook = scoreHook(tweets[0]);
  const value = scoreValue(tweets);
  const flow = scoreFlow(tweets);
  const cta = scoreCTA(tweets[tweets.length - 1]);
  const chars = charViolations(tweets);
  const genericCount = countGeneric(tweets);
  const grade = overallGrade(hook, value, flow, cta, chars, genericCount, tweets.length);
  const issues = identifyIssues(post, tweets, hook, value, flow, cta, chars, genericCount);
  const sug = suggestion(issues, grade);

  results.push({
    postNumber: post.postNumber,
    title: post.title || 'Untitled',
    category: post.category || 'unknown',
    tweetCount: tweets.length,
    grade,
    hookScore: hook,
    valueScore: value,
    flowScore: flow,
    ctaScore: cta,
    issues,
    charViolations: chars,
    suggestion: sug
  });
}

// ==================== SAVE FULL AUDIT ====================
fs.writeFileSync('data/social/audit-full.json', JSON.stringify(results, null, 2));

// ==================== PRINT SUMMARY ====================
const gradeDist = {};
results.forEach(r => { gradeDist[r.grade] = (gradeDist[r.grade] || 0) + 1; });

console.log('\n========================================');
console.log('  FULL AUDIT REPORT — 651 THREADS');
console.log('========================================\n');

console.log('GRADE DISTRIBUTION:');
const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D', 'F'];
for (const g of gradeOrder) {
  const count = gradeDist[g] || 0;
  const bar = '█'.repeat(Math.round(count / 3));
  const pct = ((count / results.length) * 100).toFixed(1);
  console.log(`  ${g.padEnd(3)} : ${String(count).padStart(3)} posts (${pct.padStart(5)}%) ${bar}`);
}

// A-grade+ count
const aGrade = results.filter(r => r.grade.startsWith('A')).length;
const bGrade = results.filter(r => r.grade.startsWith('B')).length;
const cGrade = results.filter(r => r.grade === 'C').length;
const dGrade = results.filter(r => r.grade === 'D' || r.grade === 'F').length;

console.log(`\nSUMMARY:`);
console.log(`  A-grade (production-ready): ${aGrade} (${((aGrade/results.length)*100).toFixed(1)}%)`);
console.log(`  B-grade (needs tweaks):     ${bGrade} (${((bGrade/results.length)*100).toFixed(1)}%)`);
console.log(`  C-grade (mediocre):         ${cGrade} (${((cGrade/results.length)*100).toFixed(1)}%)`);
console.log(`  D/F-grade (needs rewrite):  ${dGrade} (${((dGrade/results.length)*100).toFixed(1)}%)`);

// Category breakdown
console.log(`\nBY CATEGORY:`);
const cats = {};
results.forEach(r => {
  if (!cats[r.category]) cats[r.category] = { total: 0, a: 0, b: 0, c: 0, df: 0 };
  cats[r.category].total++;
  if (r.grade.startsWith('A')) cats[r.category].a++;
  else if (r.grade.startsWith('B')) cats[r.category].b++;
  else if (r.grade === 'C') cats[r.category].c++;
  else cats[r.category].df++;
});
for (const [cat, data] of Object.entries(cats)) {
  console.log(`  ${cat}: ${data.total} posts — A:${data.a} B:${data.b} C:${data.c} D/F:${data.df}`);
}

// Character violations
const charProblems = results.filter(r => r.charViolations.length > 0);
console.log(`\nCHARACTER VIOLATIONS: ${charProblems.length} posts have tweets over 280 chars`);
if (charProblems.length > 0) {
  for (const p of charProblems.slice(0, 10)) {
    console.log(`  #${p.postNumber}: ${p.charViolations.map(c => `tweet[${c.index}]=${c.length}ch`).join(', ')}`);
  }
  if (charProblems.length > 10) console.log(`  ... and ${charProblems.length - 10} more`);
}

// Top issues
const issueCounts = {};
results.forEach(r => r.issues.forEach(i => {
  const key = i.replace(/\d+/g, 'N').replace(/"[^"]+"/g, '"X"');
  issueCounts[key] = (issueCounts[key] || 0) + 1;
}));
console.log(`\nTOP ISSUES:`);
Object.entries(issueCounts).sort((a,b) => b[1]-a[1]).slice(0, 8).forEach(([issue, count]) => {
  console.log(`  ${count}x — ${issue}`);
});

// Posts needing most work (C or below)
const needsWork = results.filter(r => ['C', 'D', 'F'].includes(r.grade));
console.log(`\nPOSTS NEEDING MOST WORK (C or below): ${needsWork.length}`);
for (const p of needsWork.slice(0, 20)) {
  console.log(`  #${p.postNumber} [${p.grade}] "${p.title}" — ${p.issues[0] || 'multiple issues'}`);
}
if (needsWork.length > 20) console.log(`  ... and ${needsWork.length - 20} more`);

// B-grade posts (quick wins)
const bPosts = results.filter(r => r.grade.startsWith('B'));
console.log(`\nB-GRADE POSTS (quick fixes to reach A): ${bPosts.length}`);
for (const p of bPosts.slice(0, 15)) {
  console.log(`  #${p.postNumber} [${p.grade}] "${p.title}" — ${p.suggestion}`);
}
if (bPosts.length > 15) console.log(`  ... and ${bPosts.length - 15} more`);

console.log('\n========================================');
console.log(`  Audit saved to data/social/audit-full.json`);
console.log('========================================\n');
