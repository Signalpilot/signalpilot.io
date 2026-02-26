// Instagram Reels Client: Posts Reels via Facebook Graph API
// Uses native fetch() — no external dependencies needed
//
// Flow for Reels posting:
// 1. Upload video file via multipart form (video is hosted on Vercel)
// 2. Create media container with video_url
// 3. Publish the Reel
//
// Videos are served from the Vercel deployment at:
// https://www.signalpilot.io/data/social/reels/reel-XXX.mp4

const FACEBOOK_GRAPH_BASE = 'https://graph.facebook.com/v21.0';
const INSTAGRAM_GRAPH_BASE = 'https://graph.instagram.com/v21.0';
const SITE_URL = 'https://www.signalpilot.io';

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const directAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error(
      'Instagram credentials not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID'
    );
  }

  return { accessToken, accountId, directAccountId };
}

let _resolvedAccountId = null;

async function resolveAccountId() {
  if (_resolvedAccountId) return _resolvedAccountId;

  const { accessToken, accountId, directAccountId } = getConfig();

  // Try direct account ID first
  if (directAccountId) {
    _resolvedAccountId = directAccountId;
    return _resolvedAccountId;
  }

  // Try Instagram user endpoint
  try {
    const url = `${INSTAGRAM_GRAPH_BASE}/me?fields=id&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.id) {
      _resolvedAccountId = data.id;
      return _resolvedAccountId;
    }
  } catch (e) {
    // Fallback below
  }

  // Fallback to Facebook Page resolution
  try {
    const url = `${FACEBOOK_GRAPH_BASE}/${accountId}?fields=instagram_business_account&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.instagram_business_account?.id) {
      _resolvedAccountId = data.instagram_business_account.id;
      return _resolvedAccountId;
    }
  } catch (e) {
    // Continue to final fallback
  }

  // Final fallback: use accountId directly
  _resolvedAccountId = accountId;
  return _resolvedAccountId;
}

function getGraphBase() {
  const { accessToken } = getConfig();
  if (accessToken.startsWith('IGAAM') || accessToken.startsWith('IGQVJ')) {
    return INSTAGRAM_GRAPH_BASE;
  }
  return FACEBOOK_GRAPH_BASE;
}

async function graphRequest(endpoint, params = {}, method = 'POST') {
  const { accessToken } = getConfig();
  const url = `${getGraphBase()}${endpoint}`;

  const body = new URLSearchParams({
    access_token: accessToken,
    ...params,
  });

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();

  if (data.error) {
    const err = data.error;
    throw new Error(
      `Instagram API error ${err.code}: ${err.message} (type: ${err.type})`
    );
  }

  return data;
}

/**
 * Build the public URL for a Reel video
 * @param {number} postNumber - Post number (e.g., 35)
 * @returns {string} Public URL to video file
 */
function getReelUrl(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  return `${SITE_URL}/data/social/reels/reel-${paddedNum}.mp4?v=${Date.now()}`;
}

/**
 * Create a Reel media container
 * @param {string} videoUrl - Public URL of the video file
 * @param {string} caption - Reel caption text
 * @returns {string} Reel container ID
 */
async function createReelContainer(videoUrl, caption) {
  const accountId = await resolveAccountId();
  const data = await graphRequest(`/${accountId}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    thumb_offset: 0, // Use first frame as thumbnail
  });
  return data.id;
}

/**
 * Check container status
 * @param {string} containerId
 * @returns {{ status: string, status_code: string }}
 */
async function checkContainerStatus(containerId) {
  const { accessToken } = getConfig();
  const url = `${getGraphBase()}/${containerId}?fields=status,status_code&access_token=${accessToken}`;
  const response = await fetch(url);
  return response.json();
}

/**
 * Wait for a container to be ready (status = FINISHED)
 * Instagram processes videos asynchronously
 * @param {string} containerId
 * @param {number} maxWaitMs - Maximum wait time (default 120s for video processing)
 */
async function waitForContainer(containerId, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await checkContainerStatus(containerId);
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Container ${containerId} failed: ${status.status}`);
    }
    // Wait 3 seconds between checks (video processing takes longer)
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`Container ${containerId} not ready after ${maxWaitMs}ms`);
}

/**
 * Publish a media container (Reel)
 * @param {string} containerId - Container ID to publish
 * @returns {{ id: string }} Published media ID
 */
async function publishMedia(containerId) {
  const accountId = await resolveAccountId();
  const data = await graphRequest(`/${accountId}/media_publish`, {
    creation_id: containerId,
  });
  return data;
}

/**
 * Post a Reel to Instagram
 * @param {number} postNumber - Post number (for building video URL)
 * @param {string} caption - Reel caption with hashtags
 * @returns {{ mediaId: string, postNumber: number }}
 */
async function postReel(postNumber, caption) {
  // Get video URL
  const videoUrl = getReelUrl(postNumber);

  // Step 1: Create Reel container
  const reelId = await createReelContainer(videoUrl, caption);

  // Step 2: Wait for video processing (longer than images)
  await waitForContainer(reelId, 120000);

  // Step 3: Publish
  const result = await publishMedia(reelId);

  return {
    mediaId: result.id,
    postNumber,
  };
}

export {
  postReel,
  checkContainerStatus,
  waitForContainer,
  resolveAccountId,
};
