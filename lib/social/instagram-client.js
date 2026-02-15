// Instagram Client: Posts carousels via Facebook Graph API
// Uses native fetch() — no external dependencies needed
//
// Flow for carousel posting:
// 1. Upload each slide image as a container (POST /{ig-user-id}/media)
// 2. Create carousel container with all children (POST /{ig-user-id}/media)
// 3. Publish the carousel (POST /{ig-user-id}/media_publish)
//
// Images are served from the Vercel deployment at:
// https://www.signalpilot.io/assets/social/post-XXX/slide-N.png

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const SITE_URL = 'https://www.signalpilot.io';

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error(
      'Instagram credentials not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID'
    );
  }

  return { accessToken, accountId };
}

/**
 * Make a Graph API request with error handling
 */
async function graphRequest(endpoint, params = {}, method = 'POST') {
  const { accessToken } = getConfig();
  const url = `${GRAPH_API_BASE}${endpoint}`;

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
 * Build the public URL for a slide image
 * @param {number} postNumber - Post number (e.g., 35)
 * @param {number} slideNumber - Slide number (1-based)
 * @returns {string} Public URL
 */
function getSlideUrl(postNumber, slideNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  return `${SITE_URL}/assets/social/post-${paddedNum}/slide-${slideNumber}.png`;
}

/**
 * Upload a single image as a carousel item container
 * @param {string} imageUrl - Public URL of the image
 * @returns {string} Container ID
 */
async function createImageContainer(imageUrl) {
  const { accountId } = getConfig();
  const data = await graphRequest(`/${accountId}/media`, {
    image_url: imageUrl,
    is_carousel_item: 'true',
  });
  return data.id;
}

/**
 * Create a carousel container from child containers
 * @param {string[]} childIds - Array of container IDs from createImageContainer
 * @param {string} caption - Instagram caption text
 * @returns {string} Carousel container ID
 */
async function createCarouselContainer(childIds, caption) {
  const { accountId } = getConfig();
  const data = await graphRequest(`/${accountId}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
  });
  return data.id;
}

/**
 * Publish a media container (carousel or single image)
 * @param {string} containerId - Container ID to publish
 * @returns {{ id: string }} Published media ID
 */
async function publishMedia(containerId) {
  const { accountId } = getConfig();
  const data = await graphRequest(`/${accountId}/media_publish`, {
    creation_id: containerId,
  });
  return data;
}

/**
 * Check container status (useful for debugging upload issues)
 * @param {string} containerId
 * @returns {{ status: string, status_code: string }}
 */
async function checkContainerStatus(containerId) {
  const { accessToken } = getConfig();
  const url = `${GRAPH_API_BASE}/${containerId}?fields=status,status_code&access_token=${accessToken}`;
  const response = await fetch(url);
  return response.json();
}

/**
 * Wait for a container to be ready (status = FINISHED)
 * Instagram processes uploaded images asynchronously
 * @param {string} containerId
 * @param {number} maxWaitMs - Maximum wait time (default 60s)
 */
async function waitForContainer(containerId, maxWaitMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await checkContainerStatus(containerId);
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Container ${containerId} failed: ${status.status}`);
    }
    // Wait 2 seconds between checks
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Container ${containerId} not ready after ${maxWaitMs}ms`);
}

/**
 * Post a carousel to Instagram
 * @param {number} postNumber - Post number (for building slide URLs)
 * @param {number} slideCount - Number of slides to post
 * @param {string} caption - Instagram caption with hashtags
 * @returns {{ mediaId: string, slideCount: number }}
 */
async function postCarousel(postNumber, slideCount, caption) {
  // Instagram carousels support 2-10 items
  const effectiveSlideCount = Math.min(slideCount, 10);

  if (effectiveSlideCount < 2) {
    throw new Error(
      `Carousel needs at least 2 slides, post ${postNumber} has ${slideCount}`
    );
  }

  // Step 1: Upload each slide as a container
  const childIds = [];
  for (let i = 1; i <= effectiveSlideCount; i++) {
    const imageUrl = getSlideUrl(postNumber, i);
    const containerId = await createImageContainer(imageUrl);
    childIds.push(containerId);
    // Small delay between uploads to avoid rate limits
    if (i < effectiveSlideCount) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Step 2: Create carousel container
  const carouselId = await createCarouselContainer(childIds, caption);

  // Step 3: Wait for processing then publish
  await waitForContainer(carouselId);
  const result = await publishMedia(carouselId);

  return {
    mediaId: result.id,
    slideCount: effectiveSlideCount,
  };
}

/**
 * Detect whether the token is from Instagram Login (IGAAM) or Facebook Login (EAA)
 * @returns {'instagram' | 'facebook'} Token type
 */
function detectTokenType() {
  const { accessToken } = getConfig();
  if (accessToken.startsWith('IGAAM') || accessToken.startsWith('IGQVJ')) {
    return 'instagram';
  }
  return 'facebook';
}

/**
 * Refresh a long-lived token (they expire every 60 days)
 * Should be called weekly via cron to keep the token fresh
 *
 * Supports both token types:
 * - IGAAM tokens (Instagram Login): uses grant_type=ig_refresh_token
 * - EAA tokens (Facebook Login): uses grant_type=fb_exchange_token
 *
 * @returns {{ access_token: string, expires_in: number, token_type: string }}
 */
async function refreshLongLivedToken() {
  const { accessToken } = getConfig();
  const tokenType = detectTokenType();

  let url;
  if (tokenType === 'instagram') {
    // Instagram Login tokens use ig_refresh_token — no app secret needed
    url = `${GRAPH_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
  } else {
    // Facebook Login tokens use fb_exchange_token
    url = `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(
      `Token refresh failed (${tokenType} flow): ${data.error.message} (code: ${data.error.code})`
    );
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    token_type: tokenType,
  };
}

/**
 * Verify the access token is valid and has required permissions
 * @returns {{ userId: string, name: string, expiresAt: string }}
 */
async function verifyToken() {
  const { accessToken } = getConfig();
  const url = `${GRAPH_API_BASE}/me?fields=id,name&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Token verification failed: ${data.error.message}`);
  }

  // Also check token expiry
  const debugUrl = `${GRAPH_API_BASE}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
  const debugResponse = await fetch(debugUrl);
  const debugData = await debugResponse.json();

  return {
    userId: data.id,
    name: data.name,
    expiresAt: debugData.data?.expires_at
      ? new Date(debugData.data.expires_at * 1000).toISOString()
      : 'unknown',
  };
}

export {
  postCarousel,
  getSlideUrl,
  refreshLongLivedToken,
  verifyToken,
  detectTokenType,
  checkContainerStatus,
  SITE_URL,
};
