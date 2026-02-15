// POST /api/social/refresh-ig-token
// Cron-triggered: Refreshes the Instagram/Facebook long-lived access token
// Schedule: "0 6 * * 0" (Sundays at 6AM UTC)

import { refreshLongLivedToken } from '../../lib/social/instagram-client.js';
import { logPosting, logError } from '../../lib/social/queue-manager.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');

  // Verify cron secret
  const cronSecret = req.headers['authorization'];
  const adminToken = req.query.token;
  const isAuthorized =
    (cronSecret && cronSecret === `Bearer ${process.env.CRON_SECRET}`) ||
    (adminToken && adminToken === process.env.SOCIAL_ADMIN_TOKEN);

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await refreshLongLivedToken();

    // Log success
    await logPosting({
      platform: 'instagram',
      action: 'token_refresh',
      expiresIn: result.expires_in,
      reason: 'Token refreshed successfully',
    });

    // Note: The new token needs to be manually updated in Vercel env vars
    // The refresh extends the token for another 60 days
    return res.status(200).json({
      success: true,
      message: 'Token refreshed. Update INSTAGRAM_ACCESS_TOKEN in Vercel env vars with the new token.',
      tokenType: result.token_type,
      newToken: result.access_token,
      expiresInDays: Math.round(result.expires_in / 86400),
    });
  } catch (error) {
    console.error('Token refresh error:', error.message);

    await logError({
      platform: 'instagram',
      action: 'token_refresh_failed',
      reason: error.message,
    });

    return res.status(500).json({ success: false, error: error.message });
  }
}
