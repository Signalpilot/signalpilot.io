// Vercel Serverless Function: Gumroad Webhook → EasyPOS Fiscalization + Make.com forwarding
// Endpoint: POST /api/gumroad-fiscalize
//
// This endpoint replaces the direct Gumroad → Make.com ping. It:
//   1. Receives the Gumroad sale/refund webhook
//   2. On sale: fiscalizes the invoice via EasyPOS, stores IIC in Redis
//   3. On refund: looks up the IIC and cancels the invoice via EasyPOS
//   4. Forwards the original payload to Make.com so the existing scenario still works
//
// Setup:
//   1. In Gumroad → Settings → Ping, set URL to: https://www.signalpilot.io/api/gumroad-fiscalize
//   2. Set env vars in Vercel: EASYPOS_API_URL, EASYPOS_API_KEY, MAKE_GUMROAD_WEBHOOK_URL

import { registerInvoice, cancelInvoice } from '../lib/easypos-client.js';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Map Gumroad product permalinks/IDs to EasyPOS article details
const PRODUCT_MAP = {
  'monthly': {
    articleId: 'SP-MONTHLY',
    name: 'SignalPilot Monthly Subscription',
    vatCode: 'B', // 20% VAT
    soldIn: 'XPP',
  },
  'yearly': {
    articleId: 'SP-YEARLY',
    name: 'SignalPilot Yearly Subscription',
    vatCode: 'B',
    soldIn: 'XPP',
  },
  'lifetime': {
    articleId: 'SP-LIFETIME',
    name: 'SignalPilot Lifetime License',
    vatCode: 'B',
    soldIn: 'XPP',
  },
  'pentarch-solo': {
    articleId: 'SP-PENTARCH',
    name: 'Pentarch Solo Subscription',
    vatCode: 'B',
    soldIn: 'XPP',
  },
};

const DEFAULT_PRODUCT = {
  articleId: 'SP-PRODUCT',
  name: 'SignalPilot Product',
  vatCode: 'B',
  soldIn: 'XPP',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sale = req.body;

    if (!sale || !sale.email) {
      return res.status(400).json({ error: 'Invalid webhook payload — missing sale data' });
    }

    const saleId = sale.sale_id || sale.order_number;
    const isRefund = sale.refunded === true || sale.refunded === 'true';

    console.log(`[fiscalize] Gumroad ${isRefund ? 'REFUND' : 'sale'}: ${saleId} — ${sale.product_name} — ${sale.email}`);

    // Handle refunds → cancel the original invoice
    if (isRefund) {
      return await handleRefund(saleId, sale, req, res);
    }

    // Handle new sale → register invoice
    return await handleSale(sale, saleId, req, res);

  } catch (error) {
    console.error('[fiscalize] Unexpected error:', error.message);
    await forwardToMake(req.body).catch(() => {});
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleSale(sale, saleId, req, res) {
  // Parse price — Gumroad sends price in cents (2900 = $29.00)
  let priceInCents = 0;
  if (typeof sale.price === 'number') {
    priceInCents = sale.price;
  } else if (typeof sale.price === 'string') {
    priceInCents = Math.round(parseFloat(sale.price.replace(/[^0-9.]/g, '')));
  }
  const priceValue = priceInCents / 100;

  if (priceValue <= 0) {
    console.log(`[fiscalize] Skipping zero-price sale: ${saleId}`);
    await forwardToMake(req.body).catch(() => {});
    return res.status(200).json({ success: true, skipped: true, reason: 'Zero price — no invoice needed' });
  }

  // Determine product
  const permalink = sale.product_permalink || sale.permalink || '';
  const productKey = permalink.split('/').pop()?.toLowerCase();
  const product = PRODUCT_MAP[productKey] || {
    ...DEFAULT_PRODUCT,
    name: sale.product_name || DEFAULT_PRODUCT.name,
  };

  const quantity = parseInt(sale.quantity, 10) || 1;
  const totalAmount = priceValue * quantity;

  // Build invoice
  const invoice = {
    articles: [{
      articleId: product.articleId,
      vatCode: product.vatCode,
      name: product.name,
      soldIn: product.soldIn,
      price: priceValue,
      units: quantity,
    }],
    payment: [{
      type: 'CARD',
      amount: totalAmount,
    }],
  };

  // Add currency with live exchange rate
  const currency = (sale.currency || 'USD').toUpperCase();
  if (currency !== 'ALL') {
    const exRate = await fetchExchangeRate(currency);
    invoice.currency = { code: currency, exRate };
  }

  console.log(`[fiscalize] Sending to EasyPOS:`, JSON.stringify(invoice));

  // Run fiscalization and Make.com forwarding in parallel
  const [fiscalResult, makeResult] = await Promise.allSettled([
    registerInvoice(invoice),
    forwardToMake(req.body),
  ]);

  const result = fiscalResult.status === 'fulfilled' ? fiscalResult.value : { success: false, error: fiscalResult.reason?.message };
  const makeForwarded = makeResult.status === 'fulfilled' && makeResult.value;

  if (result.success) {
    // Store IIC in Redis so we can cancel on refund (keep for 1 year)
    await redis.set(`fiscal:${saleId}`, result.iic, { ex: 365 * 24 * 60 * 60 }).catch(err =>
      console.error(`[fiscalize] Redis store failed: ${err.message}`)
    );

    console.log(`[fiscalize] Invoice registered — FIC: ${result.fic}, IIC: ${result.iic}, Make.com: ${makeForwarded}`);
    return res.status(200).json({
      success: true,
      order_number: saleId,
      fic: result.fic,
      iic: result.iic,
      invoice_number: result.invoiceNumber,
      verification_link: result.link,
      make_forwarded: makeForwarded,
    });
  }

  // All retries failed — store in Redis for manual retry later
  console.error(`[fiscalize] EasyPOS error after retries:`, JSON.stringify(result.error), `Make.com: ${makeForwarded}`);
  await redis.lpush('fiscal:failed', JSON.stringify({ saleId, invoice, error: result.error, timestamp: new Date().toISOString() })).catch(err =>
    console.error(`[fiscalize] Failed to store for retry: ${err.message}`)
  );

  return res.status(200).json({
    success: false,
    error: 'Fiscalization failed after retries',
    details: result.error,
    order_number: saleId,
    make_forwarded: makeForwarded,
  });
}

async function handleRefund(saleId, sale, req, res) {
  // Forward to Make.com regardless
  const makeForwarded = await forwardToMake(req.body).catch(() => false);

  // Look up the original invoice IIC from Redis
  const iic = await redis.get(`fiscal:${saleId}`).catch(() => null);

  if (!iic) {
    console.error(`[fiscalize] Refund: no IIC found for sale ${saleId} — cannot cancel invoice`);
    return res.status(200).json({
      success: false,
      error: 'No fiscalized invoice found for this sale — cannot cancel',
      order_number: saleId,
      make_forwarded: makeForwarded,
    });
  }

  console.log(`[fiscalize] Cancelling invoice IIC: ${iic} for refunded sale: ${saleId}`);

  const result = await cancelInvoice(iic);

  if (result.success) {
    // Clean up Redis
    await redis.del(`fiscal:${saleId}`).catch(() => {});

    console.log(`[fiscalize] Invoice cancelled — FIC: ${result.fic}, IIC: ${result.iic}`);
    return res.status(200).json({
      success: true,
      cancelled: true,
      order_number: saleId,
      fic: result.fic,
      iic: result.iic,
      invoice_number: result.invoiceNumber,
      verification_link: result.link,
      make_forwarded: makeForwarded,
    });
  }

  console.error(`[fiscalize] Cancel failed:`, JSON.stringify(result.error));
  return res.status(200).json({
    success: false,
    error: 'Invoice cancellation failed',
    details: result.error,
    order_number: saleId,
    make_forwarded: makeForwarded,
  });
}

/**
 * Forward the original Gumroad payload to Make.com webhook.
 */
async function forwardToMake(payload) {
  const makeUrl = process.env.MAKE_GUMROAD_WEBHOOK_URL;
  if (!makeUrl) {
    console.log('[fiscalize] MAKE_GUMROAD_WEBHOOK_URL not set — skipping');
    return false;
  }

  const response = await fetch(makeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`[fiscalize] Make.com forwarding failed: ${response.status}`);
    return false;
  }

  console.log('[fiscalize] Forwarded to Make.com successfully');
  return true;
}

/**
 * Fetch live exchange rate from free ExchangeRate-API.
 * Returns how many ALL (Lek) per 1 unit of the given currency.
 */
async function fetchExchangeRate(currencyCode) {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${currencyCode}`);
    const data = await response.json();
    if (data.result === 'success' && data.rates?.ALL) {
      console.log(`[fiscalize] Exchange rate: 1 ${currencyCode} = ${data.rates.ALL} ALL`);
      return data.rates.ALL;
    }
  } catch (err) {
    console.error(`[fiscalize] Exchange rate fetch failed: ${err.message}`);
  }
  console.log(`[fiscalize] Using fallback exchange rate for ${currencyCode}`);
  return currencyCode === 'EUR' ? 98 : 83;
}
