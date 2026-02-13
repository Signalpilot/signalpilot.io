// Vercel Serverless Function: Validate TradingView Username
// Endpoint: /api/validate-tv-username?username=SomeUser

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ valid: false, error: 'Username parameter required' });
  }

  const trimmed = username.trim();

  // Basic format checks before hitting TradingView
  if (trimmed.length < 2 || trimmed.length > 50) {
    return res.status(200).json({ valid: false, reason: 'invalid_format' });
  }
  if (/\s/.test(trimmed) || /@/.test(trimmed)) {
    return res.status(200).json({ valid: false, reason: 'invalid_format' });
  }

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    // Use GET with redirect following — HEAD is unreliable with CDNs (Cloudflare
    // returns 200 for all HEAD requests regardless of whether the user exists).
    const tvResponse = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(trimmed)}/`, {
      method: 'GET',
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    // TradingView returns 404 for non-existent profiles
    if (tvResponse.status === 404) {
      return res.status(200).json({ valid: false, reason: 'not_found' });
    }

    // Any non-2xx response means the profile doesn't exist or something went wrong
    if (tvResponse.status < 200 || tvResponse.status >= 300) {
      return res.status(200).json({ valid: false, reason: 'not_found' });
    }

    // Got 200 — read the body to verify this is a real profile page,
    // not a Cloudflare challenge, soft-404, or generic error page
    const body = await tvResponse.text();
    const lowerBody = body.toLowerCase();

    // Check for "not found" indicators (soft 404 pages that return HTTP 200)
    const isNotFound =
      lowerBody.includes('page not found') ||
      lowerBody.includes('page_not_found') ||
      lowerBody.includes('"error":404') ||
      tvResponse.url.includes('/error');

    if (isNotFound) {
      return res.status(200).json({ valid: false, reason: 'not_found' });
    }

    // Verify the page actually contains profile-specific content for this user
    const hasProfile =
      body.includes(`/u/${trimmed}/`) ||
      body.includes(`"username":"${trimmed}"`) ||
      body.includes(`@${trimmed}`);

    if (hasProfile) {
      return res.status(200).json({ valid: true, username: trimmed });
    }

    // If we got 200 but can't confirm profile content, fail closed
    return res.status(200).json({ valid: false, reason: 'unverifiable' });

  } catch (error) {
    console.error('TradingView validation error:', error.message);
    // Fail closed — do not mark as valid when we cannot verify
    return res.status(200).json({ valid: false, uncertain: true, error: 'validation_unavailable' });
  }
}
