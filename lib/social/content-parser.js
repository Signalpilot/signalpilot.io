// Content Parser: Extracts structured post data from content plan markdown files
// Handles both Part 1 (posts 000-325) and Part 2 (posts 326-650) formats

/**
 * Parse a single Part 1 post block (posts 000-325)
 * Format: ### Tweet N: + code blocks, ### Caption: + code block
 */
function parsePart1Post(block) {
  // Extract post number and title
  const headerMatch = block.match(/^#{1,3}\s+(?:⭐\s+)?(?:[^\s]+\s+)?POST\s+(\d+)\s*[—–-]\s*(.+)/m);
  if (!headerMatch) return null;

  const postNumber = parseInt(headerMatch[1], 10);
  const title = headerMatch[2].trim();

  // Extract metadata from table
  const type = extractTableField(block, 'Type') || '';
  const pillar = extractTableField(block, 'Pillar') || '';
  const cta = extractTableField(block, 'CTA') || '';
  const source = extractTableField(block, 'Source') || '';

  // Extract tweets - try multiple formats
  const tweets = [];

  // Format 1: "### Tweet N:" with code blocks
  const tweetRegex = /### Tweet \d+[^:]*:\s*\n```\n([\s\S]*?)```/g;
  let match;
  while ((match = tweetRegex.exec(block)) !== null) {
    const text = match[1].trim();
    if (text) tweets.push(text);
  }

  // Format 2: "### Twitter/X Copy" with code block
  if (tweets.length === 0) {
    const twitterCopyMatch = block.match(/###[^\n]*Twitter[^\n]*Copy\s*\n```\n?([\s\S]*?)```/i);
    if (twitterCopyMatch) {
      const text = twitterCopyMatch[1].trim();
      if (text) tweets.push(text);
    }
  }

  // Extract Instagram caption - try multiple formats
  let instagramCaption = '';

  // Format 1: "### Caption:" with code block
  const captionMatch = block.match(/### Caption:\s*\n```\n([\s\S]*?)```/);
  if (captionMatch) {
    instagramCaption = captionMatch[1].trim();
  }

  // Format 2: "### Instagram Caption" with code block
  if (!instagramCaption) {
    const igCaptionMatch = block.match(/###[^\n]*Instagram[^\n]*Caption\s*\n```\n?([\s\S]*?)```/i);
    if (igCaptionMatch) {
      instagramCaption = igCaptionMatch[1].trim();
    }
  }

  // Extract hashtags from caption
  const hashtags = extractHashtags(instagramCaption);

  return {
    postNumber,
    title,
    type: normalizeType(type),
    pillar,
    cta,
    source,
    twitter: { tweets },
    instagram: { caption: instagramCaption },
    hashtags,
  };
}

/**
 * Parse a single Part 2 post block (posts 326-650)
 * Format: **Copy:** + blockquotes, **Caption:** + blockquotes
 */
function parsePart2Post(block) {
  // Extract post number and title
  const headerMatch = block.match(/^#{1,3}\s+(?:[^\n]*)?POST\s+(\d+)\s*[—–-]\s*(.+)/m);
  if (!headerMatch) return null;

  const postNumber = parseInt(headerMatch[1], 10);
  const title = headerMatch[2].trim();

  // Extract inline metadata
  const typeMatch = block.match(/\*\*Type:\*\*\s*([^|]+)/);
  const pillarMatch = block.match(/\*\*Pillar:\*\*\s*([^|]+)/);
  const ctaMatch = block.match(/\*\*CTA:\*\*\s*(.+)/);

  const type = typeMatch ? typeMatch[1].trim() : '';
  const pillar = pillarMatch ? pillarMatch[1].trim() : '';
  const cta = ctaMatch ? ctaMatch[1].trim() : '';

  // Extract Twitter copy
  const tweets = [];
  const twitterSection = extractSection(block, 'Twitter');
  if (twitterSection) {
    // Try blockquote format: **Copy:** followed by > lines
    const blockquoteMatch = twitterSection.match(/\*\*Copy:\*\*\s*\n((?:>.*\n?)+)/);
    // Try code block format: **Copy:** followed by ```...```
    const codeBlockMatch = twitterSection.match(/\*\*Copy:\*\*\s*\n```\n?([\s\S]*?)```/);

    if (blockquoteMatch) {
      const tweetText = blockquoteMatch[1]
        .split('\n')
        .map(line => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim();
      if (tweetText) tweets.push(tweetText);
    } else if (codeBlockMatch) {
      const tweetText = codeBlockMatch[1].trim();
      if (tweetText) tweets.push(tweetText);
    }
  }

  // Extract Instagram caption
  let instagramCaption = '';
  const instaSection = extractSection(block, 'Instagram');
  if (instaSection) {
    // Try blockquote format: **Caption:** followed by > lines
    const blockquoteMatch = instaSection.match(/\*\*Caption:\*\*\s*\n((?:>.*\n?)+)/);
    // Try code block format: **Caption:** followed by ```...```
    const codeBlockMatch = instaSection.match(/\*\*Caption:\*\*\s*\n```\n?([\s\S]*?)```/);

    if (blockquoteMatch) {
      instagramCaption = blockquoteMatch[1]
        .split('\n')
        .map(line => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim();
    } else if (codeBlockMatch) {
      instagramCaption = codeBlockMatch[1].trim();
    }
  }

  // Extract hashtags - from dedicated line or from caption
  let hashtags = [];
  const hashtagLineMatch = block.match(/\*\*Hashtags:\*\*\s*(.+)/);
  if (hashtagLineMatch) {
    hashtags = hashtagLineMatch[1].match(/#\w+/g) || [];
  }
  if (hashtags.length === 0) {
    hashtags = extractHashtags(instagramCaption);
  }

  return {
    postNumber,
    title,
    type: normalizeType(type),
    pillar,
    cta,
    source: '',
    twitter: { tweets },
    instagram: { caption: instagramCaption },
    hashtags,
  };
}

/**
 * Extract a field value from a markdown table: | Field | Value |
 */
function extractTableField(text, fieldName) {
  const regex = new RegExp(`\\|\\s*${fieldName}\\s*\\|\\s*(.+?)\\s*\\|`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract a section starting with ### sectionName until the next ### or ##
 */
function extractSection(text, sectionName) {
  // Find section start: any heading level (##, ###) with optional emoji prefix
  const startRegex = new RegExp(`^#{2,3}[^\\n]*${sectionName}`, 'mi');
  const startMatch = startRegex.exec(text);
  if (!startMatch) return null;

  const sectionStart = startMatch.index;
  // Find the next heading (##, ###) or horizontal rule that ends this section
  const rest = text.slice(sectionStart + startMatch[0].length);
  const endMatch = rest.match(/\n#{1,3}\s+(?!Slide|Key|Caption)/);
  const sectionEnd = endMatch
    ? sectionStart + startMatch[0].length + endMatch.index
    : text.length;

  return text.slice(sectionStart, sectionEnd);
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#\w+/g);
  return matches || [];
}

/**
 * Normalize post type names to consistent format
 */
function normalizeType(type) {
  const cleaned = type.replace(/\*\*/g, '').trim().toLowerCase();
  const typeMap = {
    'education hub': 'Education',
    'education hub lesson': 'Education',
    'education': 'Education',
    'blog article': 'Blog',
    'blog': 'Blog',
    'quote card': 'Quote',
    'quote': 'Quote',
    'product demo': 'Product',
    'product': 'Product',
    'chronicle lore': 'Chronicle',
    'chronicle': 'Chronicle',
    'docs/cheatsheet': 'Docs',
    'docs': 'Docs',
    'main site': 'Marketing',
    'marketing': 'Marketing',
    'launch post': 'Manifesto',
    'manifesto': 'Manifesto',
  };
  return typeMap[cleaned] || type.trim();
}

/**
 * Split a markdown file into individual post blocks
 */
function splitIntoPosts(content, isPart2) {
  // Both parts use "# POST", "## POST", or "# ⭐ POST" headers
  // Use a universal pattern that handles any heading level and optional emoji prefixes
  const parts = content.split(/(?=^#{1,3}\s+(?:⭐\s+)?(?:[^\n]*)?POST\s+\d+)/m);
  return parts.filter(p => /^#{1,3}\s+(?:⭐\s+)?(?:[^\n]*)?POST\s+\d+/m.test(p));
}

/**
 * Parse an entire content plan file
 */
function parseContentFile(content, isPart2 = false) {
  const blocks = splitIntoPosts(content, isPart2);
  const posts = [];

  for (const block of blocks) {
    // Try primary parser first, fall back to the other if no content extracted
    let post = isPart2 ? parsePart2Post(block) : parsePart1Post(block);
    const hasContent = post && (post.twitter.tweets.length > 0 || post.instagram.caption);
    if (!hasContent) {
      const alt = isPart2 ? parsePart1Post(block) : parsePart2Post(block);
      if (alt && (alt.twitter.tweets.length > 0 || alt.instagram.caption)) {
        post = alt;
      }
    }
    if (post) {
      posts.push(post);
    }
  }

  return posts;
}

/**
 * Parse both content plan files and merge results
 */
function parseAllContent(part1Content, part2Content) {
  const part1Posts = parseContentFile(part1Content, false);
  const part2Posts = parseContentFile(part2Content, true);
  const allPosts = [...part1Posts, ...part2Posts];

  // Sort by post number
  allPosts.sort((a, b) => a.postNumber - b.postNumber);

  return allPosts;
}

/**
 * Validate parsed posts and return a report
 */
function validatePosts(posts) {
  const issues = [];
  const seen = new Set();

  for (const post of posts) {
    // Check for duplicates
    if (seen.has(post.postNumber)) {
      issues.push(`Duplicate post number: ${post.postNumber}`);
    }
    seen.add(post.postNumber);

    // Check for empty Twitter content
    if (post.twitter.tweets.length === 0) {
      issues.push(`Post ${post.postNumber}: No Twitter tweets found`);
    }

    // Check for empty Instagram caption
    if (!post.instagram.caption) {
      issues.push(`Post ${post.postNumber}: No Instagram caption found`);
    }

    // Check for missing title
    if (!post.title) {
      issues.push(`Post ${post.postNumber}: Missing title`);
    }
  }

  return {
    totalPosts: posts.length,
    withTwitter: posts.filter(p => p.twitter.tweets.length > 0).length,
    withInstagram: posts.filter(p => p.instagram.caption).length,
    issues,
    valid: issues.length === 0,
  };
}

export {
  parseContentFile,
  parseAllContent,
  validatePosts,
  parsePart1Post,
  parsePart2Post,
  splitIntoPosts,
  normalizeType,
};
