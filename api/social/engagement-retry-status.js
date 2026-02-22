// GET /api/social/engagement-retry-status
// View the engagement retry queue and status

import {
  getEngagementRetryStatus,
} from '../../lib/social/queue-manager.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    // Verify token
    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const status = await getEngagementRetryStatus();

    return res.status(200).json({
      success: true,
      retryQueue: status,
      timestamp: new Date().toISOString(),
      nextRetryWindow: {
        description: 'Retries are automatically processed every 10 minutes via cron',
        endpoint: '/api/social/cron-engage-retry',
      },
    });
  } catch (error) {
    console.error('Retry status error:', error);
    return res.status(500).json({ error: error.message });
  }
}
