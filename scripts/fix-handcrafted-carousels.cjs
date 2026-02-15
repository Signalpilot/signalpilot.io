#!/usr/bin/env node
/**
 * Fix hand-crafted carousel HTML files:
 * 1. Replace <img> logo tags with text <span class="brand-mark">SIGNAL PILOT</span>
 * 2. Add brand-mark to any slide-wrapper missing branding
 * 3. Fix "SignalPilot"/"SIGNALPILOT" → "Signal Pilot"/"SIGNAL PILOT"
 * 4. Remove generic subtitles ("What You Get", "The Difference")
 */
const fs = require('fs');
const path = require('path');

const SOCIAL_DIR = 'INSTAGRAM_CONTENT_HUB/social';
let fixed = 0;

const dirs = fs.readdirSync(SOCIAL_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^post-\d+$/.test(d.name))
  .sort((a, b) => a.name.localeCompare(b.name));

for (const dir of dirs) {
  const htmlPath = path.join(SOCIAL_DIR, dir.name, 'carousel.html');
  if (!fs.existsSync(htmlPath)) continue;

  let html = fs.readFileSync(htmlPath, 'utf8');
  const originalHtml = html;
  const fixes = [];

  // 1. Replace <img> logo/brand tags with text brand-mark
  const imgLogoRegex = /<img[^>]*class="[^"]*(?:logo|brand-mark|cine-logo)[^"]*"[^>]*>/gi;
  if (imgLogoRegex.test(html)) {
    html = html.replace(imgLogoRegex, '<span class="brand-mark">SIGNAL PILOT</span>');
    fixes.push('replaced <img> logo with text brand-mark');
  }

  // 2. Fix "SignalPilot" → "Signal Pilot" in brand marks
  if (html.includes('>SignalPilot<') || html.includes('>SIGNALPILOT<')) {
    html = html.replace(/>SignalPilot</g, '>Signal Pilot<');
    html = html.replace(/>SIGNALPILOT</g, '>SIGNAL PILOT<');
    fixes.push('fixed brand text spacing');
  }

  // 3. Remove generic subtitles
  const genericSubs = ['What You Get', 'The Difference'];
  for (const sub of genericSubs) {
    const subRegex = new RegExp(`<div class="slide-subtitle">${sub}</div>`, 'g');
    if (subRegex.test(html)) {
      html = html.replace(subRegex, '');
      fixes.push(`removed generic subtitle "${sub}"`);
    }
  }

  // 4. Add brand-mark to slide-wrappers that don't have one
  // Parse each slide-wrapper and check for branding
  const parts = html.split(/(class="slide-wrapper")/);
  let rebuiltHtml = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    const marker = parts[i]; // 'class="slide-wrapper"'
    let slideHtml = parts[i + 1] || '';

    // Find the end of this slide-wrapper's content div
    if (!slideHtml.includes('brand-mark') && !slideHtml.includes('cine-logo')) {
      // This slide is missing branding — inject before the closing </div> of slide-content
      const contentEndIdx = slideHtml.lastIndexOf('</div>');
      if (contentEndIdx > 0) {
        // Find second-to-last </div> (the one closing slide-content, not slide-wrapper)
        const beforeEnd = slideHtml.lastIndexOf('</div>', contentEndIdx - 1);
        if (beforeEnd > 0) {
          slideHtml = slideHtml.substring(0, beforeEnd) +
            '\n        <span class="brand-mark">SIGNAL PILOT</span>\n      ' +
            slideHtml.substring(beforeEnd);
          fixes.push('injected brand-mark');
        }
      }
    }

    rebuiltHtml += marker + slideHtml;
  }
  html = rebuiltHtml;

  if (html !== originalHtml) {
    fs.writeFileSync(htmlPath, html);
    fixed++;
    if (fixes.length <= 3) {
      console.log(`  Fixed ${dir.name}: ${[...new Set(fixes)].join(', ')}`);
    } else {
      const uniqueFixes = [...new Set(fixes)];
      console.log(`  Fixed ${dir.name}: ${uniqueFixes.join(', ')}`);
    }
  }
}

console.log(`\nDone! Fixed ${fixed} carousel(s).`);
