#!/usr/bin/env node

/**
 * API Diagnostic Tool
 * Tests Instagram and Twitter API connections, permissions, and credentials
 * 
 * Usage: node scripts/api-diagnostic.js <robot-token>
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const robotToken = process.argv[2];

if (!robotToken) {
  console.log('❌ Missing robot token');
  console.log('Usage: node scripts/api-diagnostic.js <robot-token>');
  process.exit(1);
}

const SEPARATOR = '═══════════════════════════════════════════════════════════════';

async function runDiagnostics() {
  console.log('\n' + SEPARATOR);
  console.log('🔧 API DIAGNOSTIC TOOL');
  console.log(SEPARATOR + '\n');

  // Load config
  const configPath = join(process.cwd(), 'data', 'social', 'engagement-config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  // Test Instagram
  console.log('\n📷 INSTAGRAM DIAGNOSTICS\n');
  await testInstagram(config);

  // Test Twitter
  console.log('\n🐦 TWITTER DIAGNOSTICS\n');
  await testTwitter(config);

  // Summary
  console.log('\n' + SEPARATOR);
  console.log('📋 SUMMARY');
  console.log(SEPARATOR);
}

async function testInstagram(config) {
  console.log('Testing Instagram API...\n');

  // Check env vars
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token) {
    console.log('❌ INSTAGRAM_ACCESS_TOKEN not set in environment');
    return;
  }
  if (!accountId) {
    console.log('❌ INSTAGRAM_BUSINESS_ACCOUNT_ID not set in environment');
    return;
  }

  console.log(`✓ Token present: ${token.slice(0, 10)}...`);
  console.log(`✓ Account ID: ${accountId}`);
  console.log(`✓ Token type: ${token.startsWith('IGAAM') ? 'IGAAM (Instagram Login)' : 'EAA (Facebook Login)'}`);

  // Test 1: Verify token validity
  console.log('\n1️⃣  Token Verification');
  console.log('─────────────────────');

  const graphBase = token.startsWith('IGAAM') || token.startsWith('IGQVJ')
    ? 'https://graph.instagram.com/v21.0'
    : 'https://graph.facebook.com/v21.0';

  try {
    const meUrl = `${graphBase}/me?fields=id,name,username&access_token=${token}`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();

    if (meData.error) {
      console.log(`❌ Token verification failed: ${meData.error.message}`);
      console.log(`   Code: ${meData.error.code}`);
      return;
    }

    console.log(`✅ Token is valid`);
    console.log(`   ID: ${meData.id}`);
    console.log(`   Name: ${meData.name || 'N/A'}`);
    console.log(`   Username: ${meData.username || 'N/A'}`);
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return;
  }

  // Test 2: Account discovery for targets
  console.log('\n2️⃣  Target Account Discovery');
  console.log('────────────────────────────');

  const igTargets = config.instagram.targets.filter((t) => t.type === 'account');
  console.log(`Testing ${igTargets.length} target accounts...\n`);

  for (const target of igTargets) {
    try {
      const searchUrl = `${graphBase}/ig_hashtag_search?user_id=${accountId}&access_token=${token}`;
      
      // Actually try to get the account info
      const accountUrl = `${graphBase}/ig_hashtag_search?user_id=${accountId}&access_token=${token}`;
      const response = await fetch(accountUrl);
      const data = await response.json();

      if (data.error) {
        console.log(`❌ @${target.value}: ${data.error.message}`);
        console.log(`   Error code: ${data.error.code || 'N/A'}`);
      } else {
        console.log(`✅ @${target.value}: Accessible`);
      }
    } catch (error) {
      console.log(`⚠️  @${target.value}: ${error.message}`);
    }
  }

  // Test 3: Permission check
  console.log('\n3️⃣  Permission Verification');
  console.log('───────────────────────────');

  try {
    const permUrl = `${graphBase}/me/permissions?access_token=${token}`;
    const permResponse = await fetch(permUrl);
    const permData = await permResponse.json();

    if (permData.error) {
      console.log(`❌ Cannot read permissions: ${permData.error.message}`);
    } else if (permData.data) {
      const perms = permData.data.map((p) => p.permission).filter((p) => p.includes('instagram'));
      console.log(`✅ Instagram permissions:`);
      if (perms.length === 0) {
        console.log(`   ⚠️  No Instagram-specific permissions found`);
      } else {
        perms.forEach((p) => console.log(`   • ${p}`));
      }
    }
  } catch (error) {
    console.log(`⚠️  Cannot verify permissions: ${error.message}`);
  }

  // Test 4: Rate limit check
  console.log('\n4️⃣  Rate Limit Status');
  console.log('────────────────────');

  try {
    const testUrl = `${graphBase}/${accountId}?fields=name&access_token=${token}`;
    const response = await fetch(testUrl);
    const rateLimit = response.headers.get('x-app-usage') || 'Not provided';
    const callCount = response.headers.get('x-call-count') || 'Not provided';

    console.log(`✓ Rate limit headers:`);
    console.log(`  x-app-usage: ${rateLimit}`);
    console.log(`  x-call-count: ${callCount}`);
  } catch (error) {
    console.log(`⚠️  Cannot check rate limits: ${error.message}`);
  }

  console.log('\n✨ Instagram diagnostics complete');
}

async function testTwitter(config) {
  console.log('Testing Twitter API...\n');

  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  // Check what's configured
  console.log('Checking credentials...\n');

  if (!apiKey) console.log('❌ TWITTER_API_KEY not set');
  else console.log(`✓ TWITTER_API_KEY: ${apiKey.slice(0, 10)}...`);

  if (!apiSecret) console.log('❌ TWITTER_API_SECRET not set');
  else console.log(`✓ TWITTER_API_SECRET: ${apiSecret.slice(0, 10)}...`);

  if (!accessToken) console.log('❌ TWITTER_ACCESS_TOKEN not set');
  else console.log(`✓ TWITTER_ACCESS_TOKEN: ${accessToken.slice(0, 10)}...`);

  if (!accessSecret) console.log('❌ TWITTER_ACCESS_SECRET not set');
  else console.log(`✓ TWITTER_ACCESS_SECRET: ${accessSecret.slice(0, 10)}...`);

  if (!bearerToken) {
    console.log('⚠️  TWITTER_BEARER_TOKEN not set (needed for v2 API)');
  } else {
    console.log(`✓ TWITTER_BEARER_TOKEN: ${bearerToken.slice(0, 10)}...`);
  }

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('\n❌ Missing required Twitter credentials');
    return;
  }

  // Test 1: Verify credentials with v1.1
  console.log('\n1️⃣  Credential Verification (v1.1 API)');
  console.log('──────────────────────────────────────');

  try {
    // Basic auth for v1.1
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const response = await fetch('https://api.twitter.com/1.1/account/verify_credentials.json', {
      headers: {
        Authorization: authHeader,
        'User-Agent': 'TwitterAPI',
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log(`✅ API credentials are valid`);
      console.log(`   Screen name: ${data.screen_name || 'N/A'}`);
      console.log(`   Followers: ${data.followers_count || 'N/A'}`);
    } else if (data.errors) {
      console.log(`❌ Credential error: ${data.errors[0].message}`);
    } else {
      console.log(`❌ Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log(`⚠️  Network error: ${error.message}`);
  }

  // Test 2: v2 API bearer token
  console.log('\n2️⃣  Bearer Token Verification (v2 API)');
  console.log('──────────────────────────────────────');

  if (!bearerToken) {
    console.log('⚠️  No bearer token provided for v2 API');
  } else {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'User-Agent': 'TwitterAPI',
        },
      });

      const data = await response.json();

      if (response.status === 200 && data.data) {
        console.log(`✅ Bearer token is valid (v2 API)`);
        console.log(`   User ID: ${data.data.id}`);
        console.log(`   Username: ${data.data.username}`);
      } else if (data.errors) {
        console.log(`❌ Bearer token error: ${data.errors[0].message}`);
      } else {
        console.log(`❌ Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  Network error: ${error.message}`);
    }
  }

  // Test 3: Search query validation
  console.log('\n3️⃣  Search Query Validation');
  console.log('───────────────────────────');

  const queries = config.twitter.searchQueries.slice(0, 2);
  console.log(`Testing ${queries.length} search queries...\n`);

  for (const query of queries) {
    if (!bearerToken) {
      console.log(`⚠️  "${query}": Cannot test without bearer token`);
      continue;
    }

    try {
      const encoded = encodeURIComponent(query);
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encoded}&max_results=10`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'User-Agent': 'TwitterAPI',
          },
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        const count = data.meta?.result_count || 0;
        console.log(`✅ "${query}": Found ${count} tweets`);
      } else if (data.errors) {
        console.log(`❌ "${query}": ${data.errors[0].message}`);
      } else {
        console.log(`⚠️  "${query}": ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  "${query}": ${error.message}`);
    }
  }

  console.log('\n✨ Twitter diagnostics complete');
}

runDiagnostics().catch(console.error);
