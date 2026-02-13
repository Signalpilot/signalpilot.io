// Vercel Serverless Function: Trial Form Submission Proxy
// Endpoint: POST /api/submit-trial
//
// Validates form data server-side, then forwards to Make.com webhook.
// This keeps the webhook URL hidden from the frontend and blocks
// bots that POST empty/garbage data directly.

const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

const TV_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function tvUsernameExists(username) {
  try {
    const resp = await fetch(`https://www.tradingview.com/u/${encodeURIComponent(username)}/`, {
      method: 'GET',
      headers: {
        'User-Agent': TV_UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (resp.status === 404 || resp.status < 200 || resp.status >= 300) {
      return { exists: false };
    }

    const body = await resp.text();
    const lower = body.toLowerCase();

    // Soft-404 detection
    if (lower.includes('page not found') || lower.includes('page_not_found') ||
        lower.includes('"error":404') || resp.url.includes('/error')) {
      return { exists: false };
    }

    // Verify profile content is present
    const lowerUser = username.toLowerCase();
    const hasProfile =
      lower.includes(`/u/${lowerUser}/`) ||
      lower.includes(`"username":"${lowerUser}"`) ||
      lower.includes(`@${lowerUser}`);

    if (hasProfile) return { exists: true };

    // Got 200 but can't confirm (e.g. Cloudflare challenge) — uncertain
    return { exists: null };
  } catch {
    // Network error — uncertain
    return { exists: null };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!WEBHOOK_URL) {
    console.error('MAKE_WEBHOOK_URL environment variable is not configured');
    return res.status(500).json({ error: 'Submission failed' });
  }

  const body = req.body || {};
  const email = (body.email || '').trim();
  const tvUsername = (body.tradingview_username || '').trim();
  const consent = !!body.consent;
  const timestamp = body.timestamp || new Date().toISOString();
  const source = body.source || 'website_trial_form';

  // --- Server-side validation (mirrors frontend checks) ---

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!tvUsername) {
    return res.status(400).json({ error: 'TradingView username is required' });
  }
  if (tvUsername.length < 2 || tvUsername.length > 50) {
    return res.status(400).json({ error: 'Invalid TradingView username length' });
  }
  if (/\s/.test(tvUsername) || /@/.test(tvUsername)) {
    return res.status(400).json({ error: 'Invalid TradingView username format' });
  }

  // --- Verify TradingView username actually exists ---

  const tvCheck = await tvUsernameExists(tvUsername);
  if (tvCheck.exists === false) {
    return res.status(400).json({
      error: 'TradingView username does not exist',
      detail: 'The username "' + tvUsername + '" was not found on TradingView. Please enter your real TradingView username.'
    });
  }
  // tvCheck.exists === null (uncertain) is allowed through — we don't want to
  // block real users because of a Cloudflare challenge or network hiccup.

  // --- Forward to Make.com ---

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        tradingview_username: tvUsername,
        consent,
        timestamp,
        source
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Make.com webhook error:', response.status);
      return res.status(502).json({ error: 'Submission failed' });
    }
  } catch (error) {
    console.error('Webhook network error:', error.message);
    return res.status(502).json({ error: 'Submission failed' });
  }
}
