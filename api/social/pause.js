// POST /api/social/pause
// Toggle pause/resume for the posting queue
// Body: { paused: true|false }

import { setPaused, isPaused, logPosting } from '../../lib/social/queue-manager.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const token = req.query.token;
  if (!token || token !== process.env.SOCIAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const paused = await isPaused();
    return res.status(200).json({ success: true, paused });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paused } = req.body || {};

    if (typeof paused !== 'boolean') {
      return res.status(400).json({ error: 'Body must include { paused: true|false }' });
    }

    await setPaused(paused);
    await logPosting({
      platform: 'all',
      action: paused ? 'paused' : 'resumed',
      reason: 'Admin toggled pause state',
    });

    return res.status(200).json({ success: true, paused });
  } catch (error) {
    console.error('Pause toggle error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
