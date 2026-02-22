// POST /api/social/refresh-ig-token
// Cron-triggered: Refreshes the Instagram/Facebook long-lived access token
// Schedule: "0 3 * * *" (Daily at 3AM UTC)
// Automatically updates Vercel environment variable with new token (if VERCEL_TOKEN configured)

import { refreshLongLivedToken, verifyToken } from '../../lib/social/instagram-client.js';
import { logPosting, logError, setTokenExpiresAt } from '../../lib/social/queue-manager.js';

/**
 * Update INSTAGRAM_ACCESS_TOKEN in Vercel environment variables
 * Requires VERCEL_TOKEN, VERCEL_PROJECT_ID environment variables
 */
async function updateVercelEnvVar(newToken) {
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken || !projectId) {
    console.warn('⚠️ Vercel API credentials not configured (VERCEL_TOKEN, VERCEL_PROJECT_ID)');
    return { success: false, reason: 'Vercel credentials missing' };
  }

  try {
    const url = new URL('https://api.vercel.com/v10/projects/' + projectId + '/env');
    if (teamId) url.searchParams.set('teamId', teamId);

    // Create new env var or update existing
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'INSTAGRAM_ACCESS_TOKEN',
        value: newToken,
        target: ['production', 'preview', 'development'],
        type: 'secret',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Vercel API error:', error);
      return { success: false, reason: error.error?.message || 'Vercel API failed' };
    }

    console.log('✅ INSTAGRAM_ACCESS_TOKEN updated in Vercel');
    return { success: true };
  } catch (err) {
    console.error('Failed to update Vercel env var:', err.message);
    return { success: false, reason: err.message };
  }
}

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

    // Attempt to automatically update Vercel environment variable
    const updateResult = await updateVercelEnvVar(result.access_token);
    let message = 'Token refreshed successfully';
    if (updateResult.success) {
      message = '✅ Token refreshed and auto-updated in Vercel';
    } else {
      message = `⚠️ Token refreshed but Vercel auto-update failed: ${updateResult.reason}. Manual update may be needed.`;
    }

    // Log success
    await logPosting({
      platform: 'instagram',
      action: 'token_refresh',
      expiresIn: result.expires_in,
      expiresAt: expiresAtIso,
      autoUpdateSuccess: updateResult.success,
      reason: message,
    });

    return res.status(200).json({
      success: true,
      message,
      vercelAutoUpdateSuccess: updateResult.success,
      tokenType: result.token_type,
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
