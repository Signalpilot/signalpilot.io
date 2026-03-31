// EasyPOS Fiscalization API Client
// Docs: https://easypos.al/api/easypos
// Dev API: https://api.dev.easypos.al/fiscalisation-service/v1
// Prod API: https://api.easypos.al/fiscalisation-service/v1
//
// Auth: Authorization: Bearer <JWT token>
// Required header: integration-app

import { randomUUID } from 'crypto';

const DEFAULT_API_URL = 'https://api.dev.easypos.al/fiscalisation-service/v1';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // ms

/**
 * Call EasyPOS API with retry logic.
 * Retries up to MAX_RETRIES times if no fic is returned.
 */
async function callWithRetry(url, body) {
  const apiKey = process.env.EASYPOS_API_KEY;

  if (!apiKey) {
    throw new Error('EASYPOS_API_KEY is not configured');
  }

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS[attempt - 1] || 8000;
      console.log(`[easypos] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'integration-app': 'SIGNAL PILOT',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Success — got fic back
      if (data.fic && data.iic) {
        if (attempt > 0) {
          console.log(`[easypos] Succeeded on retry ${attempt}`);
        }
        return {
          success: true,
          fic: data.fic,
          iic: data.iic,
          link: data.link,
          invoiceNumber: data.invoiceNumber,
          orderId: data.orderId,
          totalPrice: data.totalPrice,
          raw: data,
        };
      }

      // No fic — store error and retry
      lastError = data.error || data.message || data;
      console.error(`[easypos] Attempt ${attempt + 1} failed — no fic:`, JSON.stringify(lastError));

    } catch (err) {
      lastError = err.message;
      console.error(`[easypos] Attempt ${attempt + 1} network error:`, err.message);
    }
  }

  return {
    success: false,
    error: lastError,
  };
}

/**
 * Register an invoice with EasyPOS for Albanian fiscalization.
 * Retries up to 3 times if no fic is returned.
 */
export async function registerInvoice(invoice) {
  const apiUrl = process.env.EASYPOS_API_URL || DEFAULT_API_URL;

  // Ensure docId exists (EasyPOS requires a unique ID per invoice)
  if (!invoice.docId) {
    invoice.docId = randomUUID();
  }

  return callWithRetry(`${apiUrl}/invoice/register`, invoice);
}

/**
 * Cancel a previously registered invoice.
 * Retries up to 3 times if no fic is returned.
 */
export async function cancelInvoice(iicRef) {
  const apiUrl = process.env.EASYPOS_API_URL || DEFAULT_API_URL;

  return callWithRetry(`${apiUrl}/invoice/cancel`, {
    docId: randomUUID(),
    correctiveInvoice: { iicRef },
  });
}
