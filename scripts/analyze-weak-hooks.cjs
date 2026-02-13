#!/usr/bin/env node
const fs = require('fs');
const q = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('data/social/audit-full.json', 'utf8'));
const weakHook = audit.filter(a => (a.issues || []).some(i => i.includes('Weak hook')));

const strongHookPatterns = [
  /^\d/,
  /lost \$|made \$|blew|wiped/,
  /mistake|wrong|fail|error/,
  /secret|hidden|overlooked/,
  /stop |don't |never |avoid/,
  /\?$/,
  /I (spent|studied|analyzed|tested|traded)/,
  /^The (biggest|worst|best|#1|most)/,
];

let matchCount = 0;
let noMatch = 0;
let tooLong = 0;
let hasNumbers = 0;

for (const wh of weakHook) {
  const p = q.find(x => x.postNumber === wh.postNumber);
  if (!p || !p.twitter) continue;
  const hook = p.twitter.tweets[0];
  const lower = hook.toLowerCase();

  let matched = false;
  for (const pat of strongHookPatterns) {
    if (pat.test(lower) || pat.test(hook)) { matched = true; break; }
  }

  if (hook.length >= 150) tooLong++;
  if (/\d+%|\$\d+|\d+x/.test(hook)) hasNumbers++;

  if (matched) matchCount++;
  else {
    noMatch++;
    if (noMatch <= 15) {
      console.log('#' + wh.postNumber + ' [' + hook.length + 'ch] ' + hook.substring(0, 120).replace(/\n/g, ' | '));
    }
  }
}

console.log('\n=== WEAK HOOK ANALYSIS ===');
console.log('Total weak hooks:', weakHook.length);
console.log('Match strong pattern but still weak:', matchCount);
console.log('No pattern match:', noMatch);
console.log('Too long (>=150 ch):', tooLong);
console.log('Has numbers:', hasNumbers);
console.log('\nKey issue: hooks that match patterns but are >= 150 chars lose the "punchy" bonus');
