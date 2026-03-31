// Vercel Serverless Function: Retry failed EasyPOS fiscalizations
// Endpoint: POST /api/gumroad-fiscalize-retry
//
// Processes invoices from the fiscal:failed Redis queue that didn't
// get a fic on initial attempts. Can be triggered manually or via cron.

import { registerInvoice } from '../lib/easypos-client.js';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for auth (cron secret or admin token)
  const auth = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = { retried: 0, succeeded: 0, failed: 0, errors: [] };

  // Process up to 10 failed invoices per run
  for (let i = 0; i < 10; i++) {
    const raw = await redis.rpop('fiscal:failed').catch(() => null);
    if (!raw) break;

    let item;
    try {
      item = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      console.error('[fiscal-retry] Invalid queue item:', raw);
      continue;
    }

    results.retried++;
    console.log(`[fiscal-retry] Retrying sale ${item.saleId}...`);

    const result = await registerInvoice(item.invoice);

    if (result.success) {
      results.succeeded++;
      // Store IIC in Redis for refund lookup
      await redis.set(`fiscal:${item.saleId}`, result.iic, { ex: 365 * 24 * 60 * 60 }).catch(() => {});
      console.log(`[fiscal-retry] Success — FIC: ${result.fic}, IIC: ${result.iic}`);
    } else {
      results.failed++;
      results.errors.push({ saleId: item.saleId, error: result.error });
      // Put it back in the queue for next retry
      await redis.lpush('fiscal:failed', JSON.stringify({
        ...item,
        lastRetry: new Date().toISOString(),
        retryCount: (item.retryCount || 0) + 1,
      })).catch(() => {});
      console.error(`[fiscal-retry] Still failing for ${item.saleId}:`, JSON.stringify(result.error));
    }
  }

  console.log(`[fiscal-retry] Done: ${results.succeeded}/${results.retried} succeeded`);
  return res.status(200).json(results);
}
