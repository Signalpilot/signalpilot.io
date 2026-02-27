// Instagram Stories Client: Posts Stories via Facebook Graph API
// Uses native fetch() — no external dependencies needed
//
// Flow for Stories posting:
// 1. Upload story image/video as a container (POST /{ig-user-id}/media)
// 2. Publish the story (POST /{ig-user-id}/media_publish)
//
// Stories are served from the Vercel deployment at:
// https://www.signalpilot.io/data/social/stories/story-XXXX.mp4

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

  if (directAccountId) {
    _resolvedAccountId = directAccountId;
    return _resolvedAccountId;
  }

  try {
    const url = `${INSTAGRAM_GRAPH_BASE}/me?fields=id&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.id) {
      _resolvedAccountId = data.id;
      return _resolvedAccountId;
    }
  } catch (e) {
    // Continue to fallback
  }

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
      `Instagram API error ${err.code}: ${err.message} (type: ${err.type}, subcode: ${err.error_subcode || 'none'}, fbtrace: ${err.fbtrace_id || 'none'}, url: ${url})`
    );
  }

  return data;
}

/**
 * Build the public URL for a Story video
 * @param {number} storyNumber - Story number (e.g., 1, 2, 3...)
 * @returns {string} Public URL to video file
 */
function getStoryUrl(storyNumber) {
  const paddedNum = String(storyNumber).padStart(4, '0');
  return `${SITE_URL}/data/social/stories/story-${paddedNum}.mp4?v=${Date.now()}`;
}

/**
 * Create a Story media container
 * @param {string} mediaUrl - Public URL of the video/image file
 * @param {string} mediaType - 'STORIES' for Stories
 * @returns {string} Story container ID
 */
async function createStoryContainer(mediaUrl, mediaType = 'STORIES') {
  const accountId = await resolveAccountId();
  const params = {
    media_type: mediaType,
    access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
  };

  // Determine if it's video or image by file extension
  if (mediaUrl.includes('.mp4') || mediaUrl.includes('.mov')) {
    params.video_url = mediaUrl;
  } else {
    params.image_url = mediaUrl;
  }

  const data = await graphRequest(`/${accountId}/media`, params);
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
 * @param {string} containerId
 * @param {number} maxWaitMs - Maximum wait time (default 60s for stories)
 */
async function waitForContainer(containerId, maxWaitMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await checkContainerStatus(containerId);
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Container ${containerId} failed: ${status.status}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Container ${containerId} not ready after ${maxWaitMs}ms`);
}

/**
 * Publish a media container (Story)
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
 * Post a Story to Instagram
 * @param {number} storyNumber - Story number (for building video URL)
 * @returns {{ mediaId: string, storyNumber: number }}
 */
async function postStory(storyNumber) {
  // Get story URL
  const storyUrl = getStoryUrl(storyNumber);

  // Step 1: Create Story container
  const storyId = await createStoryContainer(storyUrl, 'STORIES');

  // Step 2: Wait for processing
  await waitForContainer(storyId, 60000);

  // Step 3: Publish
  const result = await publishMedia(storyId);

  return {
    mediaId: result.id,
    storyNumber,
  };
}

export {
  postStory,
  checkContainerStatus,
  waitForContainer,
  resolveAccountId,
};
