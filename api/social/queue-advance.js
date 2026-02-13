// POST /api/social/queue-advance
// Manually advance, skip, or reset the queue position
// Body: { platform: "twitter"|"instagram", action: "skip"|"reset", position?: number }

import { setLastPosted, getLastPosted, logPosting } from '../../lib/social/queue-manager.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const token = req.query.token;
  if (!token || token !== process.env.SOCIAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { platform, action, position } = req.body || {};

    if (!platform || !['twitter', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Use "twitter" or "instagram"' });
    }

    if (!action || !['skip', 'reset'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "skip" or "reset"' });
    }

    const current = await getLastPosted(platform);

    if (action === 'skip') {
      // Skip current next post (advance by 1)
      const newPosition = current.postOrder + 1;
      await setLastPosted(platform, newPosition);
      await logPosting({
        platform,
        postOrder: newPosition,
        action: 'manual_skip',
        reason: 'Admin skipped post',
      });
      return res.status(200).json({
        success: true,
        previousPosition: current.postOrder,
        newPosition,
      });
    }

    if (action === 'reset') {
      if (typeof position !== 'number' || position < 0) {
        return res.status(400).json({ error: 'Invalid position for reset. Provide a non-negative number.' });
      }
      await setLastPosted(platform, position);
      await logPosting({
        platform,
        postOrder: position,
        action: 'manual_reset',
        reason: `Admin reset queue to position ${position}`,
      });
      return res.status(200).json({
        success: true,
        previousPosition: current.postOrder,
        newPosition: position,
      });
    }
  } catch (error) {
    console.error('Queue advance error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
