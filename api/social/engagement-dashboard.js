// GET /api/social/engagement-dashboard
// Engagement analytics dashboard with stats, history, and performance metrics

import {
  getEngagementLog,
  getEngagementCount,
} from '../../lib/social/queue-manager.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'data', 'social', 'engagement-config.json');

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, days = 7 } = req.query;

    // Verify token
    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const config = loadConfig();
    if (!config) {
      return res.status(500).json({ error: 'Failed to load config' });
    }

    // Get engagement log
    const log = await getEngagementLog(500);

    // Get today's counts
    const today = new Date().toISOString().slice(0, 10);
    const todayLog = log.filter((e) => e.timestamp?.slice(0, 10) === today);

    const instagramLikesToday = todayLog.filter((e) => e.platform === 'instagram' && e.action === 'like').length;
    const instagramCommentsToday = todayLog.filter((e) => e.platform === 'instagram' && e.action === 'comment').length;
    const twitterLikesToday = todayLog.filter((e) => e.platform === 'twitter' && e.action === 'like').length;
    const twitterRepliesToday = todayLog.filter((e) => e.platform === 'twitter' && e.action === 'reply').length;

    // Calculate daily stats for the past N days
    const dayStatsMap = {};
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      const dayLog = log.filter((e) => e.timestamp?.slice(0, 10) === dateStr && e.action !== 'engagement_error' && e.action !== 'cron_error');

      dayStatsMap[dateStr] = {
        date: dateStr,
        instagram: {
          likes: dayLog.filter((e) => e.platform === 'instagram' && e.action === 'like').length,
          comments: dayLog.filter((e) => e.platform === 'instagram' && e.action === 'comment').length,
        },
        twitter: {
          likes: dayLog.filter((e) => e.platform === 'twitter' && e.action === 'like').length,
          replies: dayLog.filter((e) => e.platform === 'twitter' && e.action === 'reply').length,
        },
      };
    }

    const dayStats = Object.values(dayStatsMap).sort((a, b) => b.date.localeCompare(a.date));

    // Get engagement errors
    const errors = log
      .filter((e) => e.action === 'engagement_error' || e.action === 'cron_error')
      .slice(0, 20);

    // Calculate target performance (which targets get most engagement)
    const targetEngagements = {};
    log.forEach((entry) => {
      if (entry.action === 'like' || entry.action === 'comment' || entry.action === 'reply') {
        const target = entry.target || entry.query || entry.author || 'unknown';
        if (!targetEngagements[target]) {
          targetEngagements[target] = {
            target,
            platform: entry.platform,
            count: 0,
            lastEngaged: entry.timestamp,
            actions: [],
          };
        }
        targetEngagements[target].count++;
        targetEngagements[target].lastEngaged = entry.timestamp;
        targetEngagements[target].actions.push(entry.action);
      }
    });

    const topTargets = Object.values(targetEngagements)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Response formatting
    const dashboard = {
      status: {
        enabled: config.enabled,
        instagramEnabled: config.instagram?.enabled,
        twitterEnabled: config.twitter?.enabled,
        timestamp: new Date().toISOString(),
      },
      today: {
        date: today,
        instagram: {
          likes: {
            count: instagramLikesToday,
            limit: config.instagram?.likeDaily || 50,
            remaining: Math.max(0, (config.instagram?.likeDaily || 50) - instagramLikesToday),
            percentUsed: Math.round((instagramLikesToday / (config.instagram?.likeDaily || 50)) * 100),
          },
          comments: {
            count: instagramCommentsToday,
            limit: config.instagram?.commentDaily || 10,
            remaining: Math.max(0, (config.instagram?.commentDaily || 10) - instagramCommentsToday),
            percentUsed: Math.round((instagramCommentsToday / (config.instagram?.commentDaily || 10)) * 100),
          },
          total: instagramLikesToday + instagramCommentsToday,
        },
        twitter: {
          likes: {
            count: twitterLikesToday,
            limit: config.twitter?.likeDaily || 100,
            remaining: Math.max(0, (config.twitter?.likeDaily || 100) - twitterLikesToday),
            percentUsed: Math.round((twitterLikesToday / (config.twitter?.likeDaily || 100)) * 100),
          },
          replies: {
            count: twitterRepliesToday,
            limit: config.twitter?.replyDaily || 20,
            remaining: Math.max(0, (config.twitter?.replyDaily || 20) - twitterRepliesToday),
            percentUsed: Math.round((twitterRepliesToday / (config.twitter?.replyDaily || 20)) * 100),
          },
          total: twitterLikesToday + twitterRepliesToday,
        },
        totalEngagements: instagramLikesToday + instagramCommentsToday + twitterLikesToday + twitterRepliesToday,
      },
      historicalStats: dayStats,
      topTargets,
      recentErrors: errors,
      recentEngagements: log
        .filter((e) => e.action !== 'engagement_error' && e.action !== 'cron_error')
        .slice(0, 20),
      config: {
        instagramTargets: config.instagram?.targets || [],
        twitterSearchQueries: config.twitter?.searchQueries || [],
        rateLimiting: config.rateLimiting,
        safety: config.safety,
        scheduling: config.scheduling,
      },
    };

    return res.status(200).json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: error.message });
  }
}
