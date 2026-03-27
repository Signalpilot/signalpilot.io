// Vercel Serverless Function: Gumroad Webhook → EasyPOS Fiscalization + Make.com forwarding
// Endpoint: POST /api/gumroad-fiscalize
//
// This endpoint replaces the direct Gumroad → Make.com ping. It:
//   1. Receives the Gumroad sale webhook
//   2. Fiscalizes the invoice via EasyPOS
//   3. Forwards the original payload to Make.com so the existing scenario still works
//
// Setup:
//   1. In Gumroad → Settings → Ping, set URL to: https://www.signalpilot.io/api/gumroad-fiscalize
//   2. Set env vars in Vercel: EASYPOS_API_URL, EASYPOS_API_KEY, MAKE_GUMROAD_WEBHOOK_URL

import { registerInvoice } from '../lib/easypos-client.js';

// Map Gumroad product permalinks/IDs to EasyPOS article details
const PRODUCT_MAP = {
  'monthly': {
    articleId: 'SP-MONTHLY',
    name: 'SignalPilot Monthly Subscription',
    vatCode: 'B', // 20% VAT
    soldIn: 'cope',
  },
  'yearly': {
    articleId: 'SP-YEARLY',
    name: 'SignalPilot Yearly Subscription',
    vatCode: 'B',
    soldIn: 'cope',
  },
  'lifetime': {
    articleId: 'SP-LIFETIME',
    name: 'SignalPilot Lifetime License',
    vatCode: 'B',
    soldIn: 'cope',
  },
  'pentarch-solo': {
    articleId: 'SP-PENTARCH',
    name: 'Pentarch Solo License',
    vatCode: 'B',
    soldIn: 'cope',
  },
};

const DEFAULT_PRODUCT = {
  articleId: 'SP-PRODUCT',
  name: 'SignalPilot Product',
  vatCode: 'B',
  soldIn: 'cope',
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Gumroad sends form-encoded or JSON data via ping
    const sale = req.body;

    if (!sale || !sale.email) {
      return res.status(400).json({ error: 'Invalid webhook payload — missing sale data' });
    }

    console.log(`[fiscalize] Gumroad sale received: ${sale.order_number || sale.sale_id} — ${sale.product_name} — ${sale.email}`);

    // Parse price: Gumroad sends price as cents (integer) or dollar string like "$29.00"
    let priceInCents = 0;
    if (typeof sale.price === 'number') {
      priceInCents = sale.price;
    } else if (typeof sale.price === 'string') {
      // Remove currency symbols and parse
      priceInCents = Math.round(parseFloat(sale.price.replace(/[^0-9.]/g, '')) * 100);
    }
    const priceValue = priceInCents / 100;

    if (priceValue <= 0) {
      console.log(`[fiscalize] Skipping zero-price sale (free/refund): ${sale.order_number}`);
      // Still forward to Make.com for free trials
      await forwardToMake(req.body).catch(() => {});
      return res.status(200).json({ success: true, skipped: true, reason: 'Zero price — no invoice needed' });
    }

    // Determine product details from permalink
    const permalink = sale.product_permalink || sale.permalink || '';
    const productKey = permalink.split('/').pop()?.toLowerCase();
    const product = PRODUCT_MAP[productKey] || {
      ...DEFAULT_PRODUCT,
      name: sale.product_name || DEFAULT_PRODUCT.name,
    };

    const quantity = parseInt(sale.quantity, 10) || 1;
    const totalAmount = priceValue * quantity;

    // Build EasyPOS invoice
    const invoice = {
      articles: [
        {
          articleId: product.articleId,
          vatCode: product.vatCode,
          name: product.name,
          soldIn: product.soldIn,
          price: priceValue,
          units: quantity,
        },
      ],
      payment: [
        {
          type: 'CARD', // Gumroad payments are card-based
          amount: totalAmount,
        },
      ],
    };

    // Add currency if not ALL (Albanian Lek)
    const currency = (sale.currency || 'USD').toUpperCase();
    if (currency !== 'ALL') {
      invoice.currency = {
        code: currency,
        exRate: 1, // You may want to set a real exchange rate or let EasyPOS handle it
      };
    }

    // Add buyer info if available
    if (sale.full_name || sale.email) {
      invoice.buyer = {
        buyerIDType: 'PASS',
        buyerIDNum: sale.email,
        buyerName: sale.full_name || sale.email,
      };
      if (sale.country) {
        invoice.buyer.buyerCountry = sale.country;
      }
      if (sale.city) {
        invoice.buyer.buyerTown = sale.city;
      }
      if (sale.street) {
        invoice.buyer.buyerAddress = sale.street;
      }
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
      console.log(`[fiscalize] Invoice registered — FIC: ${result.fic}, IIC: ${result.iic}, Make.com forwarded: ${makeForwarded}`);
      return res.status(200).json({
        success: true,
        order_number: sale.order_number || sale.sale_id,
        fic: result.fic,
        iic: result.iic,
        invoice_number: result.invoiceNumber,
        verification_link: result.link,
        make_forwarded: makeForwarded,
      });
    }

    console.error(`[fiscalize] EasyPOS error:`, JSON.stringify(result.error), `Make.com forwarded: ${makeForwarded}`);
    return res.status(200).json({
      success: false,
      error: 'Fiscalization failed',
      details: result.error,
      order_number: sale.order_number || sale.sale_id,
      make_forwarded: makeForwarded,
    });

  } catch (error) {
    console.error('[fiscalize] Unexpected error:', error.message);
    // Even on error, try to forward to Make.com so the email flow isn't broken
    await forwardToMake(req.body).catch(() => {});
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Forward the original Gumroad payload to Make.com webhook
 * so the existing "Code Generation & Welcome Email" scenario keeps working.
 */
async function forwardToMake(payload) {
  const makeUrl = process.env.MAKE_GUMROAD_WEBHOOK_URL;
  if (!makeUrl) {
    console.log('[fiscalize] MAKE_GUMROAD_WEBHOOK_URL not set — skipping Make.com forwarding');
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
