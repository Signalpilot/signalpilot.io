// Vercel Serverless Function: per-article view counter
// Endpoint: /api/views
//   GET  ?slug=blog:my-article   -> { views }            (read only)
//   POST { slug: 'blog:my-...' } -> { views, counted }   (count then read)
//
// One article has ONE counter shared by all 12 language versions, so the
// number reads as "this article has been read N times" rather than "N
// German readers". The client strips the locale before sending the slug.
//
// Privacy: no cookies and no raw IP is ever stored. To stop a refresh from
// inflating the count we keep a short-lived marker keyed by a hash of
// (ip + user-agent + today's date). The date makes the hash rotate every
// day, so it cannot be used to follow anyone over time, and the marker
// itself expires after 24h.

import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

// Only these three prefixes exist, and a slug is lowercase kebab-case.
// This is what stops an arbitrary POST from creating junk keys in Redis.
const SLUG_RE = /^(blog|chronicle|edu):[a-z0-9][a-z0-9-]{0,79}$/;

const VIEW_KEY = (slug) => `views:${slug}`;
const SEEN_KEY = (slug, visitor) => `views:seen:${slug}:${visitor}`;
const SEEN_TTL = 60 * 60 * 24; // 24h

let client = null;
function getRedis() {
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return client;
}

function visitorHash(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip'] || 'unknown';
  const ua = req.headers['user-agent'] || '';
  const day = new Date().toISOString().slice(0, 10); // rotates daily
  const salt = process.env.VIEW_COUNTER_SALT || 'signalpilot';
  return createHash('sha256').update(`${ip}|${ua}|${day}|${salt}`).digest('hex').slice(0, 16);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const slug = String((req.method === 'POST' ? body?.slug : req.query?.slug) || '');

  if (!SLUG_RE.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Not configured: report it honestly rather than inventing a number.
    return res.status(503).json({ error: 'View counter not configured' });
  }

  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      const views = Number(await redis.get(VIEW_KEY(slug))) || 0;
      return res.status(200).json({ slug, views });
    }

    res.setHeader('Cache-Control', 'no-store');

    // SET NX succeeds only the first time this visitor opens this article
    // today; on a refresh it fails and we just read the current total back.
    const first = await redis.set(SEEN_KEY(slug, visitorHash(req)), 1, {
      nx: true, ex: SEEN_TTL,
    });

    const views = first
      ? await redis.incr(VIEW_KEY(slug))
      : Number(await redis.get(VIEW_KEY(slug))) || 0;

    return res.status(200).json({ slug, views, counted: Boolean(first) });
  } catch (err) {
    console.error('views:', err);
    return res.status(500).json({ error: 'Counter unavailable' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
