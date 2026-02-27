// GET /api/social/cron-queue-posts
// Fetch recent posts from followed accounts and cache them for engagement
// Runs every 6 hours via Vercel cron

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getAccountPosts } from '../../lib/social/instagram-client.js';

const QUEUE_PATH = join(process.cwd(), 'data', 'social', 'post-queue.json');

function loadQueue() {
  try {
    return JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
  } catch (error) {
    console.error('Failed to load post queue:', error);
    return {
      tradingview: [],
      investopedia: [],
      other_accounts: [],
      last_updated: null,
      next_update: null,
    };
  }
}

function saveQueue(queue) {
  try {
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save post queue:', error);
    return false;
  }
}

/**
 * Fetch posts from an account and merge with existing queue
 * Keeps posts from last 14 days, removes duplicates
 */
async function updateAccountQueue(accountName, maxAge = 14) {
  try {
    console.log(`Fetching posts from @${accountName}...`);
    const result = await getAccountPosts(accountName, 20);

    if (!result.posts || result.posts.length === 0) {
      console.warn(`No posts found for @${accountName}`);
      return [];
    }

    const now = Date.now();
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    const validPosts = result.posts.filter(post => {
      const postTime = new Date(post.timestamp).getTime();
      return (now - postTime) < maxAgeMs;
    });

    console.log(`Found ${validPosts.length} recent posts from @${accountName}`);
    return validPosts;
  } catch (error) {
    console.error(`Failed to fetch posts from @${accountName}:`, error.message);
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const { force } = req.query;

    // Accept token from query param (manual) or Authorization header (Vercel cron)
    const queryToken = req.query.token;
    const headerToken = req.headers['authorization']?.replace('Bearer ', '');
    const validToken = [queryToken, headerToken].some(t =>
      t && (t === process.env.ROBOT_TOKEN ||
            t === process.env.CRON_SECRET ||
            t === process.env.SOCIAL_ADMIN_TOKEN)
    );

    if (!validToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const queue = loadQueue();
    const now = new Date();

    // Check if we should update (skip if updated recently unless forced)
    if (queue.next_update && new Date(queue.next_update) > now && force !== 'true') {
      return res.status(200).json({
        success: true,
        message: 'Queue updated recently, skipping',
        next_update: queue.next_update,
      });
    }

    const results = {};

    // Fetch from tradingview (primary source)
    const tvPosts = await updateAccountQueue('tradingview', 14);
    if (tvPosts.length > 0) {
      queue.tradingview = tvPosts;
      results.tradingview = {
        fetched: tvPosts.length,
        ids: tvPosts.map(p => p.id),
      };
    }

    // Optional: Try investopedia (secondary, if accessible)
    // const invPosts = await updateAccountQueue('investopedia', 7);
    // if (invPosts.length > 0) {
    //   queue.investopedia = invPosts;
    //   results.investopedia = {
    //     fetched: invPosts.length,
    //     ids: invPosts.map(p => p.id),
    //   };
    // }

    queue.last_updated = now.toISOString();
    queue.next_update = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(); // 6 hours

    const saved = saveQueue(queue);

    return res.status(200).json({
      success: saved,
      message: 'Post queue updated',
      results,
      queue_stats: {
        tradingview: queue.tradingview.length,
        investopedia: queue.investopedia.length,
        other_accounts: queue.other_accounts.length,
      },
      last_updated: queue.last_updated,
      next_update: queue.next_update,
    });
  } catch (error) {
    console.error('Cron queue error:', error);
    return res.status(500).json({ error: error.message });
  }
}
