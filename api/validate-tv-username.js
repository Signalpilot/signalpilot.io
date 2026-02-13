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

  try {
    // Check if the TradingView profile page exists
    const tvResponse = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(trimmed)}/`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SignalPilot/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'manual',
    });

    // TradingView returns 200 for existing profiles
    // Returns 302/404 for non-existing ones
    if (tvResponse.status === 200) {
      return res.status(200).json({ valid: true, username: trimmed });
    }

    // If HEAD doesn't work reliably, fall back to GET
    if (tvResponse.status === 405 || tvResponse.status === 403) {
      const getResponse = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(trimmed)}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SignalPilot/1.0)',
          'Accept': 'text/html',
        },
        redirect: 'manual',
      });

      if (getResponse.status === 200) {
        return res.status(200).json({ valid: true, username: trimmed });
      }

      return res.status(200).json({ valid: false, reason: 'not_found' });
    }

    return res.status(200).json({ valid: false, reason: 'not_found' });

  } catch (error) {
    console.error('TradingView validation error:', error.message);
    // On network error, allow the submission (fail open) but flag it
    return res.status(200).json({ valid: true, uncertain: true, error: 'validation_unavailable' });
  }
}
