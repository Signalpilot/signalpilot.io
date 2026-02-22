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

const FACEBOOK_GRAPH_BASE = 'https://graph.facebook.com/v21.0';
const INSTAGRAM_GRAPH_BASE = 'https://graph.instagram.com/v21.0';
const SITE_URL = 'https://www.signalpilot.io';

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  // Optional fallback for direct Instagram account ID (useful if Page isn't linked)
  const directAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error(
      'Instagram credentials not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID'
    );
  }

  return { accessToken, accountId, directAccountId };
}

/**
 * Resolve the correct account ID for the current token type.
 * - IGAAM tokens (Instagram Login) → use the Instagram user ID from /me
 *   (INSTAGRAM_BUSINESS_ACCOUNT_ID is typically a Facebook Page ID which
 *    doesn't work on graph.instagram.com)
 * - EAA tokens (Facebook Login) → resolve Instagram business account from Facebook Page ID
 *   Use /PAGE_ID/instagram_business_account to get the actual IG account ID
 *
 * Result is cached for the lifetime of the serverless invocation.
 */
let _resolvedAccountId = null;

async function resolveAccountId() {
  if (_resolvedAccountId) return _resolvedAccountId;

  const { accessToken, accountId, directAccountId } = getConfig();
  const tokenType = detectTokenType();

  if (tokenType === 'instagram') {
    // For IGAAM tokens, query /me on graph.instagram.com to get the real IG user ID
    const url = `${INSTAGRAM_GRAPH_BASE}/me?fields=id&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      throw new Error(`Failed to resolve Instagram account ID: ${data.error.message}`);
    }
    _resolvedAccountId = data.id;
  } else {
    // For EAA tokens (Facebook Login), accountId is typically a Facebook Page ID
    // Try to resolve it to the actual Instagram business account ID
    if (directAccountId) {
      // Use direct account ID if provided (bypass Page resolution)
      _resolvedAccountId = directAccountId;
    } else {
      // Attempt to resolve from Facebook Page ID
      const url = `${FACEBOOK_GRAPH_BASE}/${accountId}?fields=instagram_business_account&access_token=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        // If resolution fails, try using accountId directly as fallback
        console.warn(`Failed to resolve Instagram account from Facebook Page ${accountId}: ${data.error.message}. Using accountId directly.`);
        _resolvedAccountId = accountId;
      } else if (data.instagram_business_account?.id) {
        _resolvedAccountId = data.instagram_business_account.id;
      } else {
        // No linked account, use accountId directly
        _resolvedAccountId = accountId;
      }
    }
  }

  return _resolvedAccountId;
}

/**
 * Get the correct Graph API base URL for the current token type
 * IGAAM tokens (Instagram Login) → graph.instagram.com
 * EAA tokens (Facebook Login) → graph.facebook.com
 */
function getGraphBase() {
  const { accessToken } = getConfig();
  if (accessToken.startsWith('IGAAM') || accessToken.startsWith('IGQVJ')) {
    return INSTAGRAM_GRAPH_BASE;
  }
  return FACEBOOK_GRAPH_BASE;
}

/**
 * Make a Graph API request with error handling
 */
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
 * Build the public URL for a slide image
 * @param {number} postNumber - Post number (e.g., 35)
 * @param {number} slideNumber - Slide number (1-based)
 * @returns {string} Public URL
 */
function getSlideUrl(postNumber, slideNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  return `${SITE_URL}/assets/social/post-${paddedNum}/slide-${slideNumber}.png?v=${Date.now()}`;
}

/**
 * Upload a single image as a carousel item container
 * @param {string} imageUrl - Public URL of the image
 * @returns {string} Container ID
 */
async function createImageContainer(imageUrl) {
  const accountId = await resolveAccountId();
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
  const accountId = await resolveAccountId();
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
  const accountId = await resolveAccountId();
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
  const url = `${getGraphBase()}/${containerId}?fields=status,status_code&access_token=${accessToken}`;
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
    url = `${INSTAGRAM_GRAPH_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
  } else {
    // Facebook Login tokens use fb_exchange_token
    url = `${FACEBOOK_GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`;
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
  const url = `${getGraphBase()}/me?fields=id,name&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Token verification failed: ${data.error.message}`);
  }

  // Also check token expiry
  const debugUrl = `${getGraphBase()}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
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

/**
 * Like an Instagram post
 * @param {string} mediaId - Instagram media ID to like
 * @returns {{ id: string }} Like response
 */
async function likePost(mediaId) {
  const data = await graphRequest(`/${mediaId}/likes`, {});
  return data;
}

/**
 * Search for posts by hashtag
 * Note: Hashtag search is deprecated in Graph API v21
 * This function now searches for posts from target accounts as an alternative
 * (since hashtag search requires special permissions and is unreliable)
 * @param {string} hashtag - Hashtag to search (without #)
 * @param {number} limit - Max results (default 10)
 * @returns {{ data: Array<{id, caption, timestamp}> }}
 */
async function searchPostsByHashtag(hashtag, limit = 10) {
  // Graph API v21 deprecated hashtag search endpoints
  // Return empty results - use account-based discovery instead
  console.warn(`Hashtag search for #${hashtag} not supported in Graph API v21 - using empty results`);
  return {
    data: [],
    message: 'Hashtag search deprecated in Graph API v21 - please use account-based engagement instead'
  };
}

/**
 * Get recent posts from an Instagram account
 * Requires business discovery permission
 * @param {string} username - Instagram username (without @)
 * @param {number} limit - Max posts to fetch (default 5)
 * @returns {{ account_id: string, posts: Array<{id, caption, timestamp}> }}
 */
async function getAccountPosts(username, limit = 5) {
  const { accessToken, accountId } = getConfig();
  const graphBase = getGraphBase();

  // Use BUSINESS_DISCOVERY to find the account
  const discoveryUrl = `${graphBase}/${accountId}?fields=business_discovery.username(${username}){id,name,website,username,profile_picture_url,ig_username}&access_token=${accessToken}`;

  const discoveryResponse = await fetch(discoveryUrl);
  const discoveryData = await discoveryResponse.json();

  if (discoveryData.error) {
    throw new Error(`Account discovery failed for @${username}: ${discoveryData.error.message}`);
  }

  const targetAccountId = discoveryData.business_discovery?.id;
  if (!targetAccountId) {
    throw new Error(`Could not find account @${username}`);
  }

  // Get their recent posts
  const postsUrl = `${graphBase}/${targetAccountId}?fields=ig_business_account{media.limit(${limit}){id,caption,media_type,timestamp}}&access_token=${accessToken}`;

  const postsResponse = await fetch(postsUrl);
  const postsData = await postsResponse.json();

  if (postsData.error) {
    throw new Error(`Failed to fetch posts from @${username}: ${postsData.error.message}`);
  }

  return {
    account_id: targetAccountId,
    account_name: username,
    posts: postsData.ig_business_account?.media?.data || [],
  };
}

/**
 * Comment on an Instagram post
 * Requires pages_manage_metadata permission (or higher)
 * @param {string} mediaId - Media ID to comment on
 * @param {string} text - Comment text
 * @returns {{ id: string }} Comment response
 */
async function commentOnPost(mediaId, text) {
  // Max comment length is typically 1000 characters
  if (text.length > 1000) {
    throw new Error('Comment exceeds 1000 character limit');
  }

  const data = await graphRequest(`/${mediaId}/comments`, {
    message: text,
  });
  return data;
}

/**
 * Get info about a specific Instagram user
 * @param {string} username - Instagram username
 * @returns {{ id: string, name: string, username: string, website: string, profile_picture_url: string }}
 */
async function getAccountInfo(username) {
  const { accessToken, accountId } = getConfig();
  const graphBase = getGraphBase();

  const url = `${graphBase}/${accountId}?fields=business_discovery.username(${username}){id,name,username,website,profile_picture_url,biography,followers_count}&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Failed to get account info for @${username}: ${data.error.message}`);
  }

  return data.business_discovery || null;
}

export {
  postCarousel,
  getSlideUrl,
  refreshLongLivedToken,
  verifyToken,
  detectTokenType,
  resolveAccountId,
  getGraphBase,
  checkContainerStatus,
  SITE_URL,
  likePost,
  searchPostsByHashtag,
  getAccountPosts,
  commentOnPost,
  getAccountInfo,
};
