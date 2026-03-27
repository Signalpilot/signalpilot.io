// EasyPOS Fiscalization API Client
// Docs: https://easypos.al/api/easypos
// Dev API: https://api.dev.easypos.al/fiscalisation-service/v1
// Prod API: https://api.easypos.al/fiscalisation-service/v1
//
// Auth: Authorization: Bearer <JWT token>
// Required header: integration-app

import { randomUUID } from 'crypto';

const DEFAULT_API_URL = 'https://api.dev.easypos.al/fiscalisation-service/v1';

/**
 * Register an invoice with EasyPOS for Albanian fiscalization.
 * @param {object} invoice - Invoice with articles, payment, buyer (optional), currency (optional)
 * @returns {Promise<object>} - { success, fic, iic, link, invoiceNumber, raw }
 */
export async function registerInvoice(invoice) {
  const apiUrl = process.env.EASYPOS_API_URL || DEFAULT_API_URL;
  const apiKey = process.env.EASYPOS_API_KEY;

  if (!apiKey) {
    throw new Error('EASYPOS_API_KEY is not configured');
  }

  // Ensure docId exists (EasyPOS requires a unique ID per invoice)
  if (!invoice.docId) {
    invoice.docId = randomUUID();
  }

  const response = await fetch(`${apiUrl}/invoice/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'integration-app': 'SIGNAL PILOT',
    },
    body: JSON.stringify(invoice),
  });

  const data = await response.json();

  // Successful response contains fic and iic
  if (data.fic && data.iic) {
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

  return {
    success: false,
    error: data.error || data.message || data,
    raw: data,
  };
}

/**
 * Cancel a previously registered invoice.
 * @param {string} iicRef - The IIC of the original invoice to cancel
 * @returns {Promise<object>} - { success, fic, iic, link, invoiceNumber, raw }
 */
export async function cancelInvoice(iicRef) {
  const apiUrl = process.env.EASYPOS_API_URL || DEFAULT_API_URL;
  const apiKey = process.env.EASYPOS_API_KEY;

  if (!apiKey) {
    throw new Error('EASYPOS_API_KEY is not configured');
  }

  const response = await fetch(`${apiUrl}/invoice/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'integration-app': 'SIGNAL PILOT',
    },
    body: JSON.stringify({
      docId: randomUUID(),
      correctiveInvoice: { iicRef },
    }),
  });

  const data = await response.json();

  if (data.fic && data.iic) {
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

  return {
    success: false,
    error: data.error || data.message || data,
    raw: data,
  };
}
