#!/usr/bin/env node
/**
 * parse-9grid.js
 *
 * Parses 9GRID_COMPLETE_PART1.md and 9GRID_COMPLETE_PART2.md,
 * extracting Instagram post structure for every post.
 *
 * Output: /home/user/signalpilot.io/data/social/9grid-structures.json
 */

const fs = require('fs');
const path = require('path');

const PART1 = path.resolve(__dirname, '../INSTAGRAM_CONTENT_HUB/9GRID_COMPLETE_PART1.md');
const PART2 = path.resolve(__dirname, '../INSTAGRAM_CONTENT_HUB/9GRID_COMPLETE_PART2.md');
const OUTPUT = path.resolve(__dirname, '../data/social/9grid-structures.json');

// ─── Part 1 Parser ───────────────────────────────────────────────────
// Part 1 format:
//   ## [emoji] COLOR | POST NNN | Title
//   ### INSTAGRAM — Carousel (N Slides)  OR  ### INSTAGRAM — Single Image
//   **Slide Structure:**
//   1. **Label:** Description
//   **Caption:**
//   ``` ... ```

function parsePart1(text) {
  const posts = [];

  // Split on post headers: "## ... | POST NNN | ..." or the special "## ... SPECIAL | POST 000 | ..."
  // We also need to catch the pre-launch header "# ⭐ PRE-LAUNCH: POST 000"
  // The actual content header is "## 🌟 SPECIAL | POST 000 | ..."
  const postPattern = /^##\s+.*?\|\s*POST\s+(\d+)\s*\|/gm;

  const headers = [];
  let match;
  while ((match = postPattern.exec(text)) !== null) {
    headers.push({ postNumber: parseInt(match[1], 10), index: match.index });
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const block = text.slice(start, end);
    const postNumber = headers[i].postNumber;

    // Find the Instagram section
    const igMatch = block.match(/###\s+INSTAGRAM\s*[—–-]\s*(.+)/i);
    if (!igMatch) continue;

    const formatRaw = igMatch[1].trim();

    // Determine format and slide count
    let format, slideCount;
    const carouselMatch = formatRaw.match(/Carousel\s*\((\d+)\s*Slides?\)/i);
    if (carouselMatch) {
      slideCount = parseInt(carouselMatch[1], 10);
      format = `Carousel (${slideCount} slides)`;
    } else if (/Single\s*Image/i.test(formatRaw)) {
      slideCount = 1;
      format = 'Single Image';
    } else {
      slideCount = 1;
      format = formatRaw;
    }

    // Extract slide structure (Part 1 uses numbered list after **Slide Structure:**)
    const slideStructure = [];
    const slideStructMatch = block.match(/\*\*Slide Structure:\*\*([\s\S]*?)(?=\n\*\*Caption|\n###|\n---)/);
    if (slideStructMatch) {
      const slideBlock = slideStructMatch[1];
      // Match numbered items: "1. **Label:** Description"
      const slideLines = slideBlock.match(/^\d+\.\s+.+/gm);
      if (slideLines) {
        for (const line of slideLines) {
          // Clean up: remove leading number and bold markers
          const cleaned = line
            .replace(/^\d+\.\s+/, '')
            .replace(/\*\*/g, '')
            .trim();
          slideStructure.push(cleaned);
        }
      }
    }

    // Extract caption
    let caption = '';
    // Part 1 captions are in code fences after **Caption:** or ### Caption:
    const captionHeaderIdx = block.search(/\*\*Caption:\*\*|###\s+Caption:/i);
    if (captionHeaderIdx !== -1) {
      const afterCaption = block.slice(captionHeaderIdx);
      // Look for content between ``` fences
      const fenceMatch = afterCaption.match(/```\s*\n([\s\S]*?)```/);
      if (fenceMatch) {
        caption = fenceMatch[1].trim();
      }
    }

    posts.push({
      postNumber,
      format,
      slideCount,
      slideStructure,
      caption
    });
  }

  return posts;
}


// ─── Part 2 Parser ───────────────────────────────────────────────────
// Part 2 format:
//   # POST NNN — Title
//   ### Instagram
//   **Format:** Carousel (N slides)  OR  **Format:** Single Image (Quote Card)
//   **Slide 1 — Label:**
//   content
//   **Caption:**
//   > caption lines with > prefix
//   **Hashtags:** ...

function parsePart2(text) {
  const posts = [];

  // Split on "# POST NNN" headers (level-1 heading)
  const postPattern = /^# POST\s+(\d+)\s*[—–-]\s*/gm;

  const headers = [];
  let match;
  while ((match = postPattern.exec(text)) !== null) {
    headers.push({ postNumber: parseInt(match[1], 10), index: match.index });
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const block = text.slice(start, end);
    const postNumber = headers[i].postNumber;

    // Find the Instagram section
    const igIdx = block.search(/^###\s+Instagram\s*$/im);
    if (igIdx === -1) continue;

    const igBlock = block.slice(igIdx);

    // Extract format
    const formatMatch = igBlock.match(/\*\*Format:\*\*\s*(.+)/);
    if (!formatMatch) continue;

    const formatRaw = formatMatch[1].trim();

    let format, slideCount;
    const carouselMatch = formatRaw.match(/Carousel\s*\((\d+)\s*slides?\)/i);
    if (carouselMatch) {
      slideCount = parseInt(carouselMatch[1], 10);
      format = `Carousel (${slideCount} slides)`;
    } else if (/Single\s*Image/i.test(formatRaw)) {
      slideCount = 1;
      format = 'Single Image';
    } else {
      slideCount = 1;
      format = formatRaw;
    }

    // Extract slide structure (Part 2 uses **Slide N — Label:** followed by content)
    const slideStructure = [];
    const slidePattern = /\*\*Slide\s+(\d+)\s*[—–-]\s*(.+?):\*\*\s*([\s\S]*?)(?=\*\*Slide\s+\d|^\*\*Caption:\*\*|^\*\*Hashtags:\*\*|^---|^###|^# POST)/gm;
    let slideMatch;
    // We need to search within the Instagram section only (igBlock)
    // But limit to before the caption
    const captionIdx = igBlock.search(/\*\*Caption:\*\*/);
    const slideArea = captionIdx !== -1 ? igBlock.slice(0, captionIdx) : igBlock;

    while ((slideMatch = slidePattern.exec(slideArea)) !== null) {
      const slideNum = parseInt(slideMatch[1], 10);
      const slideLabel = slideMatch[2].trim();
      const slideContent = slideMatch[3].trim();

      // Build a compact description from the content
      // Combine the label and a summary of the content
      const contentLines = slideContent
        .split('\n')
        .map(l => l.replace(/^[-•]\s*/, '').trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/^[""]|[""]$/g, '').trim());

      // First line is often a quoted title
      const firstLine = contentLines[0] || '';
      const rest = contentLines.slice(1);

      let description;
      if (rest.length > 0) {
        description = `${slideLabel}: ${firstLine} — ${rest.join('; ')}`;
      } else {
        description = `${slideLabel}: ${firstLine}`;
      }
      slideStructure.push(description);
    }

    // Extract caption (Part 2 uses > blockquote lines)
    let caption = '';
    if (captionIdx !== -1) {
      const afterCaption = igBlock.slice(captionIdx);
      // Caption continues with > lines until **Hashtags:** or --- or next section
      const captionEndMatch = afterCaption.match(/\*\*Caption:\*\*\s*\n([\s\S]*?)(?=\n\*\*Hashtags:\*\*|\n---|\n# POST|\n###\s|\n# [A-Z✅])/);
      if (captionEndMatch) {
        const rawCaption = captionEndMatch[1];
        // Remove > prefix from each line and clean up
        caption = rawCaption
          .split('\n')
          .map(line => {
            // Remove leading > and optional space
            return line.replace(/^>\s?/, '');
          })
          .join('\n')
          .trim();
      }
    }

    posts.push({
      postNumber,
      format,
      slideCount,
      slideStructure,
      caption
    });
  }

  return posts;
}


// ─── Main ────────────────────────────────────────────────────────────

function main() {
  console.log('Reading Part 1...');
  const text1 = fs.readFileSync(PART1, 'utf-8');
  console.log(`  Part 1: ${(text1.length / 1024).toFixed(0)} KB, ${text1.split('\n').length} lines`);

  console.log('Reading Part 2...');
  const text2 = fs.readFileSync(PART2, 'utf-8');
  console.log(`  Part 2: ${(text2.length / 1024).toFixed(0)} KB, ${text2.split('\n').length} lines`);

  console.log('\nParsing Part 1...');
  const part1Posts = parsePart1(text1);
  console.log(`  Found ${part1Posts.length} posts in Part 1`);

  console.log('Parsing Part 2...');
  const part2Posts = parsePart2(text2);
  console.log(`  Found ${part2Posts.length} posts in Part 2`);

  // Merge and sort by postNumber
  const allPosts = [...part1Posts, ...part2Posts].sort((a, b) => a.postNumber - b.postNumber);

  // Summary stats
  const formats = {};
  let totalSlides = 0;
  let withCaption = 0;
  let withSlides = 0;
  let missingCaption = [];
  let missingSlides = [];

  for (const p of allPosts) {
    formats[p.format] = (formats[p.format] || 0) + 1;
    totalSlides += p.slideCount;
    if (p.caption) withCaption++;
    else missingCaption.push(p.postNumber);
    if (p.slideStructure.length > 0) withSlides++;
    else if (p.slideCount > 1) missingSlides.push(p.postNumber);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Total posts parsed: ${allPosts.length}`);
  console.log(`Total slides: ${totalSlides}`);
  console.log(`Posts with captions: ${withCaption}`);
  console.log(`Posts with slide structure: ${withSlides}`);
  console.log(`\nFormat breakdown:`);
  for (const [fmt, count] of Object.entries(formats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${fmt}: ${count}`);
  }

  if (missingCaption.length > 0 && missingCaption.length <= 20) {
    console.log(`\nPosts missing caption: ${missingCaption.join(', ')}`);
  } else if (missingCaption.length > 20) {
    console.log(`\nPosts missing caption: ${missingCaption.length} posts (first 20: ${missingCaption.slice(0, 20).join(', ')})`);
  }

  if (missingSlides.length > 0 && missingSlides.length <= 20) {
    console.log(`Carousel posts missing slide structure: ${missingSlides.join(', ')}`);
  } else if (missingSlides.length > 20) {
    console.log(`Carousel posts missing slide structure: ${missingSlides.length} posts`);
  }

  // Post number range
  const numbers = allPosts.map(p => p.postNumber);
  console.log(`\nPost number range: ${Math.min(...numbers)} - ${Math.max(...numbers)}`);

  // Check for duplicates
  const seen = new Set();
  const dupes = [];
  for (const p of allPosts) {
    if (seen.has(p.postNumber)) dupes.push(p.postNumber);
    seen.add(p.postNumber);
  }
  if (dupes.length > 0) {
    console.log(`Duplicate post numbers: ${dupes.join(', ')}`);
  }

  // Write output
  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: ['9GRID_COMPLETE_PART1.md', '9GRID_COMPLETE_PART2.md'],
      totalPosts: allPosts.length,
      postRange: { min: Math.min(...numbers), max: Math.max(...numbers) },
      formatBreakdown: formats
    },
    posts: allPosts
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nOutput written to: ${OUTPUT}`);
  console.log(`File size: ${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB`);
}

main();
