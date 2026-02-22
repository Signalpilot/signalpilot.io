/**
 * API Diagnostic Endpoint
 * 
 * Runs API diagnostics in the production environment where credentials are set
 * GET /api/social/api-diagnostic?token=ROBOT_TOKEN
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  // Verify token
  if (token !== process.env.ROBOT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      instagram: {},
      twitter: {},
    };

    // Instagram diagnostics
    console.log('[DIAGNOSTIC] Checking Instagram...');
    const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!igToken) {
      diagnostics.instagram.error = 'INSTAGRAM_ACCESS_TOKEN not set';
    } else if (!igAccountId) {
      diagnostics.instagram.error = 'INSTAGRAM_BUSINESS_ACCOUNT_ID not set';
    } else {
      diagnostics.instagram.tokenPresent = true;
      diagnostics.instagram.tokenType = igToken.startsWith('IGAAM')
        ? 'IGAAM (Instagram Login)'
        : 'EAA (Facebook Login)';
      diagnostics.instagram.accountId = igAccountId;

      // Test token validity
      try {
        const graphBase = igToken.startsWith('IGAAM')
          ? 'https://graph.instagram.com/v21.0'
          : 'https://graph.facebook.com/v21.0';

        const meResponse = await fetch(
          `${graphBase}/me?fields=id,name,username&access_token=${igToken}`
        );
        const meData = await meResponse.json();

        if (meData.error) {
          diagnostics.instagram.tokenValid = false;
          diagnostics.instagram.tokenError = meData.error.message;
          diagnostics.instagram.errorCode = meData.error.code;
        } else {
          diagnostics.instagram.tokenValid = true;
          diagnostics.instagram.accountInfo = {
            id: meData.id,
            name: meData.name,
            username: meData.username,
          };
        }
      } catch (error) {
        diagnostics.instagram.networkError = error.message;
      }
    }

    // Twitter diagnostics
    console.log('[DIAGNOSTIC] Checking Twitter...');
    const twApiKey = process.env.TWITTER_API_KEY;
    const twApiSecret = process.env.TWITTER_API_SECRET;
    const twAccessToken = process.env.TWITTER_ACCESS_TOKEN;
    const twAccessSecret = process.env.TWITTER_ACCESS_SECRET;
    const twBearerToken = process.env.TWITTER_BEARER_TOKEN;

    diagnostics.twitter.credentialsPresent = {
      apiKey: !!twApiKey,
      apiSecret: !!twApiSecret,
      accessToken: !!twAccessToken,
      accessSecret: !!twAccessSecret,
      bearerToken: !!twBearerToken,
    };

    if (!twApiKey || !twApiSecret || !twAccessToken || !twAccessSecret) {
      diagnostics.twitter.error = 'Missing v1.1 API credentials';
    } else {
      try {
        // Test v1.1 API
        const credentials = Buffer.from(`${twApiKey}:${twApiSecret}`).toString('base64');
        const response = await fetch(
          'https://api.twitter.com/1.1/account/verify_credentials.json',
          {
            headers: {
              Authorization: `Basic ${credentials}`,
              'User-Agent': 'TwitterAPI',
            },
          }
        );

        const data = await response.json();

        if (response.status === 200) {
          diagnostics.twitter.v1ApiValid = true;
          diagnostics.twitter.accountInfo = {
            screenName: data.screen_name,
            followers: data.followers_count,
            verified: data.verified,
          };
        } else {
          diagnostics.twitter.v1ApiValid = false;
          diagnostics.twitter.error = data.errors?.[0]?.message || 'Unknown error';
        }
      } catch (error) {
        diagnostics.twitter.networkError = error.message;
      }
    }

    // v2 API check
    if (!twBearerToken) {
      diagnostics.twitter.v2ApiWarning = 'No bearer token set';
    } else {
      try {
        const response = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            Authorization: `Bearer ${twBearerToken}`,
            'User-Agent': 'TwitterAPI',
          },
        });

        const data = await response.json();

        if (response.status === 200 && data.data) {
          diagnostics.twitter.v2ApiValid = true;
          diagnostics.twitter.v2AccountInfo = {
            id: data.data.id,
            username: data.data.username,
          };
        } else {
          diagnostics.twitter.v2ApiValid = false;
          diagnostics.twitter.v2Error = data.errors?.[0]?.message || 'Unknown error';
        }
      } catch (error) {
        diagnostics.twitter.v2NetworkError = error.message;
      }
    }

    // Summary
    const summary = {
      instagram:
        diagnostics.instagram.error
          ? 'FAILED'
          : diagnostics.instagram.tokenValid
            ? 'WORKING'
            : 'TOKEN INVALID',
      twitter:
        diagnostics.twitter.error
          ? 'FAILED'
          : diagnostics.twitter.v1ApiValid
            ? 'WORKING'
            : 'INVALID CREDENTIALS',
    };

    return res.status(200).json({
      success: true,
      summary,
      diagnostics,
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
