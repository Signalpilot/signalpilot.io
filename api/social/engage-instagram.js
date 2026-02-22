// POST /api/social/engage-instagram
// Engagement endpoint for Instagram auto-like/comment actions
// Actions: like, comment on posts from target accounts/hashtags

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  markEngaged,
  isEngaged,
  incrementEngagementCounter,
  getEngagementCount,
  logEngagement,
} from '../../lib/social/queue-manager.js';
import {
  likePost,
  getAccountPosts,
  searchPostsByHashtag,
  commentOnPost,
} from '../../lib/social/instagram-client.js';

function loadConfig() {
  try {
    const configPath = join(process.cwd(), 'data', 'social', 'engagement-config.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return { instagram: { likeDaily: 30, commentDaily: 5 } };
  }
}

/**
 * Engage on Instagram (like/comment)
 * Query params:
 *   action: 'like' | 'comment'
 *   target: 'username' | 'hashtag:HASHTAG'
 *   mediaId: (required for comment action) Media ID to comment on
 *   text: (required for comment action) Comment text
 *   token: API token for auth
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, target, mediaId, text, token } = req.query;
    const config = loadConfig();

    // Verify token
    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Validate action
    if (!action || !['like', 'comment'].includes(action)) {
      return res.status(400).json({ error: 'action must be "like" or "comment"' });
    }

    if (action === 'like') {
      return await handleLike(target, res, config);
    } else if (action === 'comment') {
      return await handleComment(mediaId, text, res, config);
    }
  } catch (error) {
    console.error('Instagram engagement error:', error);
    await logEngagement({
      platform: 'instagram',
      action: 'engagement_error',
      error: error.message,
    });
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handle like action
 * Target: 'username' or 'hashtag:HASHTAG'
 */
async function handleLike(target, res, config) {
  if (!target) {
    return res.status(400).json({ error: 'target required for like action' });
  }

  const DAILY_LIKE_LIMIT = config.instagram.likeDaily;

  // Check daily limit
  const likeCount = await getEngagementCount('instagram', 'like');
  if (likeCount >= DAILY_LIKE_LIMIT) {
    return res.status(429).json({
      error: `Daily like limit (${DAILY_LIKE_LIMIT}) reached`,
      currentCount: likeCount,
    });
  }

  let posts = [];

  try {
    if (target.startsWith('hashtag:')) {
      // Search by hashtag
      const hashtag = target.replace('hashtag:', '');
      const result = await searchPostsByHashtag(hashtag, 5);
      posts = result.data || [];
    } else {
      // Get posts from username
      const result = await getAccountPosts(target, 5);
      posts = result.posts || [];
    }
  } catch (error) {
    return res.status(400).json({ error: `Failed to fetch posts: ${error.message}` });
  }

  if (!posts || posts.length === 0) {
    return res.status(404).json({ error: 'No posts found for target' });
  }

  // Filter out already-liked posts
  const unlikedPosts = [];
  for (const post of posts) {
    const alreadyLiked = await isEngaged('instagram', post.id, 'like');
    if (!alreadyLiked) {
      unlikedPosts.push(post);
    }
  }

  if (unlikedPosts.length === 0) {
    return res.status(409).json({ error: 'All posts from target already liked' });
  }

  // Like the first unliked post
  const post = unlikedPosts[0];
  try {
    await likePost(post.id);
    await markEngaged('instagram', post.id, 'like');
    await incrementEngagementCounter('instagram', 'like');

    await logEngagement({
      platform: 'instagram',
      action: 'like',
      target,
      mediaId: post.id,
      caption: post.caption?.substring(0, 100),
    });

    return res.status(200).json({
      success: true,
      action: 'like',
      mediaId: post.id,
      caption: post.caption,
      likeCount: likeCount + 1,
      dailyLimit: DAILY_LIKE_LIMIT,
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to like post: ${error.message}` });
  }
}

/**
 * Handle comment action
 */
async function handleComment(mediaId, text, res, config) {
  if (!mediaId || !text) {
    return res.status(400).json({ error: 'mediaId and text required for comment action' });
  }

  const DAILY_COMMENT_LIMIT = config.instagram.commentDaily;

  // Check daily limit
  const commentCount = await getEngagementCount('instagram', 'comment');
  if (commentCount >= DAILY_COMMENT_LIMIT) {
    return res.status(429).json({
      error: `Daily comment limit (${DAILY_COMMENT_LIMIT}) reached`,
      currentCount: commentCount,
    });
  }

  // Check if already commented
  const alreadyCommented = await isEngaged('instagram', mediaId, 'comment');
  if (alreadyCommented) {
    return res.status(409).json({ error: 'Already commented on this post' });
  }

  try {
    const result = await commentOnPost(mediaId, text);

    await markEngaged('instagram', mediaId, 'comment');
    await incrementEngagementCounter('instagram', 'comment');

    await logEngagement({
      platform: 'instagram',
      action: 'comment',
      mediaId,
      text: text.substring(0, 100),
    });

    return res.status(200).json({
      success: true,
      action: 'comment',
      mediaId,
      text,
      commentCount: commentCount + 1,
      dailyLimit: DAILY_COMMENT_LIMIT,
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to comment: ${error.message}` });
  }
}
