// EasyPOS Fiscalization API Client
// Docs: https://easypos.al/api/easypos
// Cloud API: https://api.easypos.al/fiscalisation-service/v1

const DEFAULT_API_URL = 'https://api.easypos.al/fiscalisation-service/v1';

/**
 * Register an invoice with EasyPOS for Albanian fiscalization.
 * @param {object} invoice - EasyPOS invoice payload
 * @returns {Promise<object>} - { success, nslf, nivf, link, raw }
 */
export async function registerInvoice(invoice) {
  const apiUrl = process.env.EASYPOS_API_URL || DEFAULT_API_URL;
  const apiKey = process.env.EASYPOS_API_KEY;

  if (!apiKey) {
    throw new Error('EASYPOS_API_KEY is not configured');
  }

  const response = await fetch(`${apiUrl}/invoices/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify(Array.isArray(invoice) ? invoice : [invoice]),
  });

  const data = await response.json();

  // status 0 = success, 1 = error, 2 = pending
  if (data.status === 0) {
    return {
      success: true,
      nslf: data.response.nslf,
      nivf: data.response.nivf,
      link: data.response.link,
      text: data.response.text,
      raw: data,
    };
  }

  return {
    success: false,
    error: data.error || data,
    raw: data,
  };
}
