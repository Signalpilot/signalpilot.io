// POST /api/social/refresh-ig-token
// Cron-triggered: Refreshes the Instagram/Facebook long-lived access token
// Schedule: "0 6 * * 0" (Sundays at 6AM UTC)

import { refreshLongLivedToken, verifyToken } from '../../lib/social/instagram-client.js';
import { logPosting, logError, setTokenExpiresAt } from '../../lib/social/queue-manager.js';

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
    // First verify current token validity
    let tokenInfo;
    try {
      tokenInfo = await verifyToken();
    } catch (verifyErr) {
      console.warn('Current token verification failed:', verifyErr.message);
      // Continue anyway - refresh might still work
    }

    // Refresh the token
    const result = await refreshLongLivedToken();
    const expiresAtMs = Date.now() + result.expires_in * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();

    // Store token expiration time for monitoring
    await setTokenExpiresAt(expiresAtIso);

    // Log success
    await logPosting({
      platform: 'instagram',
      action: 'token_refresh',
      expiresIn: result.expires_in,
      expiresAt: expiresAtIso,
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
      expiresAt: expiresAtIso,
      currentTokenInfo: tokenInfo,
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
