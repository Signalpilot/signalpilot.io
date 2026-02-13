// GET /api/social/preview-next
// Preview the next N posts for each platform

import { getNextPostOrder } from '../../lib/social/queue-manager.js';
import { getPostNumber, getInstagramColumn } from '../../lib/social/posting-schedule.js';
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

function findPost(posts, postNumber) {
  return posts.find(p => p.postNumber === postNumber) || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const token = req.query.token;
  if (!token || token !== process.env.SOCIAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const count = Math.min(parseInt(req.query.count) || 3, 9);
  const platform = req.query.platform || 'both';

  try {
    const posts = loadContent();
    const result = {};

    if (platform === 'twitter' || platform === 'both') {
      const twitterNext = await getNextPostOrder('twitter');
      const twitterPreviews = [];
      for (let i = 0; i < count; i++) {
        const postOrder = twitterNext + i;
        const postNumber = getPostNumber('twitter', postOrder);
        const post = findPost(posts, postNumber);
        if (post) {
          twitterPreviews.push({
            postOrder,
            postNumber,
            title: post.title,
            type: post.type,
            tweets: post.twitter.tweets,
            tweetCount: post.twitter.tweets.length,
          });
        }
      }
      result.twitter = twitterPreviews;
    }

    if (platform === 'instagram' || platform === 'both') {
      const instaNext = await getNextPostOrder('instagram');
      const instaPreviews = [];
      for (let i = 0; i < count; i++) {
        const postOrder = instaNext + i;
        const postNumber = getPostNumber('instagram', postOrder);
        const column = getInstagramColumn(postOrder);
        const post = findPost(posts, postNumber);
        if (post) {
          instaPreviews.push({
            postOrder,
            postNumber,
            column,
            title: post.title,
            type: post.type,
            caption: post.instagram.caption,
            captionPreview: post.instagram.caption?.substring(0, 200) + '...',
          });
        }
      }
      result.instagram = instaPreviews;
    }

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error generating preview:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
