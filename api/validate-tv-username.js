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
    // Check if the TradingView profile page exists
    const tvResponse = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(trimmed)}/`, {
      method: 'HEAD',
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      redirect: 'manual',
    });

    // TradingView returns 2xx for existing profiles, 302/404 for non-existing
    if (tvResponse.status >= 200 && tvResponse.status < 300) {
      return res.status(200).json({ valid: true, username: trimmed });
    }

    // Fall back to GET if HEAD doesn't return 2xx
    if (tvResponse.status !== 404) {
      const getResponse = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(trimmed)}/`, {
        method: 'GET',
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        redirect: 'manual',
      });

      if (getResponse.status >= 200 && getResponse.status < 300) {
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
