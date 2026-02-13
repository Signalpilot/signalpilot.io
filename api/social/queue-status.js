// GET /api/social/queue-status
// Returns current queue state for the admin dashboard

import { getStatus, getPostingLog, getErrorLog } from '../../lib/social/queue-manager.js';
import { getInstagramTotalPosts } from '../../lib/social/posting-schedule.js';

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

  try {
    const status = await getStatus();
    const recentPosts = await getPostingLog(10);
    const recentErrors = await getErrorLog(10);

    return res.status(200).json({
      success: true,
      ...status,
      instagramTotalPosts: getInstagramTotalPosts(),
      recentPosts,
      recentErrors,
    });
  } catch (error) {
    console.error('Error fetching queue status:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
