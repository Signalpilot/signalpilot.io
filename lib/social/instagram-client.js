// Instagram Client: Posts images and carousels via Facebook Graph API
// Uses native fetch() — no additional dependencies needed

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error('Instagram credentials not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID');
  }

  return { accessToken, accountId };
}

/**
 * Post a single image to Instagram
 * @param {string} imageUrl - Publicly accessible image URL
 * @param {string} caption - Post caption
 * @returns {{ mediaId: string }}
 */
async function postSingleImage(imageUrl, caption) {
  const { accessToken, accountId } = getConfig();

  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (containerData.error) {
    throw new Error(`Instagram container error: ${containerData.error.message}`);
  }

  const containerId = containerData.id;

  // Step 2: Wait for container to be ready
  await waitForContainer(containerId, accessToken);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  return { mediaId: publishData.id };
}

/**
 * Post a carousel (multiple images) to Instagram
 * @param {string[]} imageUrls - Array of publicly accessible image URLs
 * @param {string} caption - Post caption
 * @returns {{ mediaId: string }}
 */
async function postCarousel(imageUrls, caption) {
  const { accessToken, accountId } = getConfig();

  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error('Carousel requires 2-10 images');
  }

  // Step 1: Create individual media containers for each image
  const childIds = [];
  for (const url of imageUrls) {
    const res = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: url,
        is_carousel_item: true,
        access_token: accessToken,
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`Instagram carousel item error: ${data.error.message}`);
    }
    childIds.push(data.id);
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: accessToken,
    }),
  });

  const carouselData = await carouselRes.json();
  if (carouselData.error) {
    throw new Error(`Instagram carousel error: ${carouselData.error.message}`);
  }

  const containerId = carouselData.id;

  // Step 3: Wait for container to be ready
  await waitForContainer(containerId, accessToken);

  // Step 4: Publish
  const publishRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  return { mediaId: publishData.id };
}

/**
 * Wait for a media container to finish processing
 */
async function waitForContainer(containerId, accessToken, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      throw new Error(`Instagram container processing failed: ${JSON.stringify(data)}`);
    }

    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Instagram container processing timed out');
}

/**
 * Refresh a long-lived access token (valid for 60 days)
 * Should be called weekly to keep the token fresh
 * @returns {{ accessToken: string, expiresIn: number }}
 */
async function refreshAccessToken() {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!appId || !appSecret || !currentToken) {
    throw new Error('Facebook app credentials not configured for token refresh');
  }

  const res = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
  );

  const data = await res.json();
  if (data.error) {
    throw new Error(`Token refresh error: ${data.error.message}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export {
  postSingleImage,
  postCarousel,
  refreshAccessToken,
};
