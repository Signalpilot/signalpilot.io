// Vercel Serverless Function: Trial Form Submission Proxy
// Endpoint: POST /api/submit-trial
//
// Validates form data server-side, then forwards to Make.com webhook.
// This keeps the webhook URL hidden from the frontend and blocks
// bots that POST empty/garbage data directly.

const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu1.make.com/7klx329gnfpknko32nubiu43nadwoouz';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
