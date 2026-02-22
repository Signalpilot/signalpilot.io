// GET/POST /api/social/engagement-config
// Manage engagement configuration

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getEngagementLog } from '../../lib/social/queue-manager.js';

const CONFIG_PATH = join(process.cwd(), 'data', 'social', 'engagement-config.json');

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return null;
  }
}

function saveConfig(config) {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save engagement config:', error);
    return false;
  }
}

export default async function handler(req, res) {
  const { token, action } = req.query;

  // Verify token
  if (token !== process.env.ROBOT_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(action, res);
    } else if (req.method === 'POST') {
      return handlePost(action, req.body, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Engagement config error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGet(action, res) {
  const config = loadConfig();
  if (!config) {
    return res.status(500).json({ error: 'Failed to load config' });
  }

  if (action === 'status') {
    // Get current engagement stats
    const log = await getEngagementLog(100);

    const today = new Date().toISOString().slice(0, 10);
    const todaysEngagements = log.filter(
      (entry) => entry.timestamp?.slice(0, 10) === today && entry.action !== 'engagement_error'
    );

    const stats = {
      config: config,
      todayStats: {
        instagramLikes: todaysEngagements.filter((e) => e.platform === 'instagram' && e.action === 'like').length,
        instagramComments: todaysEngagements.filter((e) => e.platform === 'instagram' && e.action === 'comment').length,
        twitterLikes: todaysEngagements.filter((e) => e.platform === 'twitter' && e.action === 'like').length,
        twitterReplies: todaysEngagements.filter((e) => e.platform === 'twitter' && e.action === 'reply').length,
      },
      recentEngagements: log.slice(0, 20),
    };

    return res.status(200).json(stats);
  }

  return res.status(200).json(config);
}

async function handlePost(action, body, res) {
  const config = loadConfig();
  if (!config) {
    return res.status(500).json({ error: 'Failed to load config' });
  }

  if (action === 'enable') {
    config.enabled = true;
    if (body.instagram) config.instagram.enabled = true;
    if (body.twitter) config.twitter.enabled = true;
  } else if (action === 'disable') {
    config.enabled = false;
    if (body.instagram) config.instagram.enabled = false;
    if (body.twitter) config.twitter.enabled = false;
  } else if (action === 'update') {
    // Update specific settings
    if (body.instagram) {
      config.instagram = { ...config.instagram, ...body.instagram };
    }
    if (body.twitter) {
      config.twitter = { ...config.twitter, ...body.twitter };
    }
    if (body.rateLimiting) {
      config.rateLimiting = { ...config.rateLimiting, ...body.rateLimiting };
    }
    if (body.safety) {
      config.safety = { ...config.safety, ...body.safety };
    }
  } else {
    return res.status(400).json({ error: 'Unknown action' });
  }

  const saved = saveConfig(config);
  if (!saved) {
    return res.status(500).json({ error: 'Failed to save config' });
  }

  return res.status(200).json({
    success: true,
    action,
    config,
  });
}
