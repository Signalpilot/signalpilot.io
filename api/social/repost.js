// POST /api/social/repost?token=<ADMIN_TOKEN>&post=33
// Manually repost a specific post to Instagram without advancing the queue
// Use this to re-publish posts that were deleted or need to be reposted
//
// Query params:
//   token  - SOCIAL_ADMIN_TOKEN for auth
//   post   - Post number to repost (e.g. 33)

import { logPosting, logError } from '../../lib/social/queue-manager.js';
import { postCarousel } from '../../lib/social/instagram-client.js';
import { readFileSync } from 'fs';
import { join } from 'path';

let contentCache = null;

function loadContent() {
  if (!contentCache) {
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    contentCache = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return contentCache;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  // Auth check
  const adminToken = req.query.token;
  if (!adminToken || adminToken !== process.env.SOCIAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const postNumber = parseInt(req.query.post, 10);
  if (!postNumber || isNaN(postNumber)) {
    return res.status(400).json({ error: 'Missing or invalid ?post= parameter' });
  }

  try {
    const posts = loadContent();
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      return res.status(404).json({ error: `Post ${postNumber} not found in content-queue.json` });
    }

    const caption = post.instagram?.caption;
    if (!caption) {
      return res.status(400).json({ error: `Post ${postNumber} has no Instagram caption` });
    }

    const slideCount = post.instagram?.slideCount || 0;
    if (slideCount < 2) {
      return res.status(400).json({ error: `Post ${postNumber} has ${slideCount} slide(s) (need 2+)` });
    }

    // Post carousel to Instagram via Graph API
    const result = await postCarousel(postNumber, slideCount, caption);

    // Log it (but do NOT advance queue position)
    await logPosting({
      platform: 'instagram',
      postNumber,
      title: post.title,
      type: post.type,
      slideCount: result.slideCount,
      mediaId: result.mediaId,
      action: 'reposted',
      note: 'Manual repost via /api/social/repost',
    });

    return res.status(200).json({
      success: true,
      reposted: {
        postNumber,
        title: post.title,
        slideCount: result.slideCount,
        mediaId: result.mediaId,
      },
    });
  } catch (error) {
    console.error('Repost error:', error.message);

    await logError({
      platform: 'instagram',
      postNumber,
      action: 'repost_error',
      reason: error.message,
    });

    return res.status(500).json({ success: false, error: error.message });
  }
}
