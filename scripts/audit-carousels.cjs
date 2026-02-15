#!/usr/bin/env node
/**
 * Carousel Quality Audit — Checks ALL carousel HTML files for issues
 * Run this BEFORE rendering PNGs to catch problems early
 */
const fs = require('fs');
const path = require('path');

const SOCIAL_DIR = 'INSTAGRAM_CONTENT_HUB/social';

const issues = [];
let totalPosts = 0;
let cleanPosts = 0;

const dirs = fs.readdirSync(SOCIAL_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^post-\d+$/.test(d.name))
  .sort((a, b) => a.name.localeCompare(b.name));

for (const dir of dirs) {
  const htmlPath = path.join(SOCIAL_DIR, dir.name, 'carousel.html');
  if (!fs.existsSync(htmlPath)) continue;

  totalPosts++;
  const html = fs.readFileSync(htmlPath, 'utf8');
  const postIssues = [];

  // Count slides
  const slideCount = (html.match(/class="slide-wrapper"/g) || []).length;
  if (slideCount < 3) {
    postIssues.push(`Only ${slideCount} slides (minimum 3 expected)`);
  }

  // Check for brand-mark or cine-logo on slides
  const wrapperMatches = html.split('class="slide-wrapper"');
  for (let i = 1; i < wrapperMatches.length; i++) {
    const slideHtml = wrapperMatches[i].split('class="slide-wrapper"')[0] || wrapperMatches[i];
    if (!slideHtml.includes('brand-mark') && !slideHtml.includes('cine-logo')) {
      postIssues.push(`Slide ${i} missing brand-mark/cine-logo`);
    }
  }

  // Check for broken <img> logo tags (should have been converted to text in renderer, but flag in HTML)
  if (html.includes('<img') && html.includes('logo')) {
    postIssues.push('Contains <img> logo tag (broken image risk)');
  }

  // Extract all slide titles and check for truncation
  const titleMatches = [...html.matchAll(/class="slide-title[^"]*">(.*?)<\/h2>/g)];
  const titles = titleMatches.map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));

  for (const title of titles) {
    // Check for mid-word truncation (ends with partial word, no punctuation)
    if (title.length >= 55 && !/[.!?'"\u201d)\]]$/.test(title.trim())) {
      // Check if last char is a letter (potential mid-word cut)
      const lastChar = title.trim().slice(-1);
      if (/[a-z]/i.test(lastChar)) {
        postIssues.push(`Possible truncation: "${title.trim().slice(-30)}..."`);
      }
    }
  }

  // Check for duplicate titles
  const uniqueTitles = new Set(titles.map(t => t.trim().toLowerCase()));
  if (uniqueTitles.size < titles.length) {
    postIssues.push(`Duplicate titles found (${titles.length} titles, ${uniqueTitles.size} unique)`);
  }

  // Check for duplicate body content (extract all slide-body and concept-card text)
  const bodyMatches = [...html.matchAll(/class="(?:slide-body|card-desc|callout-text)">(.*?)<\//g)];
  const bodies = bodyMatches.map(m => m[1].trim()).filter(b => b.length > 20);
  const uniqueBodies = new Set(bodies);
  if (uniqueBodies.size < bodies.length) {
    const dupes = bodies.length - uniqueBodies.size;
    postIssues.push(`${dupes} duplicate body text block(s)`);
  }

  // Check for generic subtitles
  const subtitleMatches = [...html.matchAll(/class="slide-subtitle">(.*?)<\/div>/g)];
  for (const m of subtitleMatches) {
    const sub = m[1].trim();
    if (['What You Get', 'The Difference'].includes(sub)) {
      postIssues.push(`Generic subtitle: "${sub}"`);
    }
  }

  // Check for empty slides (slide-content with barely any text)
  const contentBlocks = [...html.matchAll(/<div class="slide-content">([\s\S]*?)(?=<\/div>\s*<\/div>)/g)];
  for (let i = 0; i < contentBlocks.length; i++) {
    const text = contentBlocks[i][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length < 10 && i > 0 && i < contentBlocks.length - 1) {
      postIssues.push(`Slide ${i + 1} has very little content (${text.length} chars)`);
    }
  }

  if (postIssues.length > 0) {
    issues.push({ post: dir.name, slideCount, issues: postIssues });
  } else {
    cleanPosts++;
  }
}

// Summary
console.log(`\n=== CAROUSEL AUDIT REPORT ===`);
console.log(`Total carousels: ${totalPosts}`);
console.log(`Clean (no issues): ${cleanPosts}`);
console.log(`With issues: ${issues.length}`);
console.log('');

if (issues.length > 0) {
  // Group by issue type
  const issueCounts = {};
  for (const item of issues) {
    for (const issue of item.issues) {
      const type = issue.split(':')[0].split('(')[0].trim();
      issueCounts[type] = (issueCounts[type] || 0) + 1;
    }
  }

  console.log('Issue Summary:');
  for (const [type, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x ${type}`);
  }
  console.log('');

  // List critical issues (truncation, duplicates, missing branding)
  const critical = issues.filter(i => i.issues.some(iss =>
    iss.includes('Duplicate') || iss.includes('truncation') || iss.includes('Generic subtitle') || iss.includes('<img>')
  ));

  if (critical.length > 0) {
    console.log(`CRITICAL ISSUES (${critical.length} posts):`);
    for (const item of critical.slice(0, 20)) {
      console.log(`  ${item.post} (${item.slideCount} slides):`);
      for (const iss of item.issues) {
        console.log(`    - ${iss}`);
      }
    }
    if (critical.length > 20) {
      console.log(`  ... and ${critical.length - 20} more`);
    }
  }

  console.log('');
  console.log(`NON-CRITICAL ISSUES (${issues.length - critical.length} posts with only minor issues):`);
  const nonCritical = issues.filter(i => !critical.includes(i));
  for (const item of nonCritical.slice(0, 10)) {
    console.log(`  ${item.post}: ${item.issues.join('; ')}`);
  }
  if (nonCritical.length > 10) {
    console.log(`  ... and ${nonCritical.length - 10} more`);
  }
} else {
  console.log('ALL CAROUSELS PASSED AUDIT! Ready for PNG rendering.');
}
