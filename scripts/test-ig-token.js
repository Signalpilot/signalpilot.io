#!/usr/bin/env node

/**
 * Test Instagram API Token Permissions
 * 
 * Usage:
 *   node scripts/test-ig-token.js [TOKEN]
 * 
 * If TOKEN is not provided, tries to use INSTAGRAM_ACCESS_TOKEN env var
 */

import fetch from 'node-fetch';

const INSTAGRAM_GRAPH_BASE = 'https://graph.instagram.com/v21.0';
const FACEBOOK_GRAPH_BASE = 'https://graph.facebook.com/v21.0';

function getToken() {
  const tokenFromArg = process.argv[2];
  if (tokenFromArg) return tokenFromArg;

  const tokenFromEnv = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!tokenFromEnv) {
    console.error('ERROR: No token provided');
    console.error('Usage: node scripts/test-ig-token.js <TOKEN>');
    console.error('   OR: INSTAGRAM_ACCESS_TOKEN=<TOKEN> node scripts/test-ig-token.js');
    process.exit(1);
  }
  return tokenFromEnv;
}

function detectTokenType(token) {
  if (token.startsWith('IGAAM') || token.startsWith('IGQVJ')) {
    return 'instagram';
  }
  return 'facebook';
}

async function makeRequest(url, label) {
  console.log(`\n📍 ${label}`);
  console.log(`   URL: ${url.split('?')[0]}...`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error(`   ❌ ERROR: ${data.error.message}`);
      if (data.error.code) console.error(`   Code: ${data.error.code}`);
      if (data.error.type) console.error(`   Type: ${data.error.type}`);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`   ❌ Network error: ${err.message}`);
    return null;
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const daysLeft = Math.round((date - now) / (1000 * 60 * 60 * 24));
  const timeStr = date.toISOString().split('T')[0];
  return `${timeStr} (${daysLeft} days)`;
}

async function main() {
  const token = getToken();
  const tokenType = detectTokenType(token);
  const graphBase = tokenType === 'instagram' ? INSTAGRAM_GRAPH_BASE : FACEBOOK_GRAPH_BASE;

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('Instagram API Token Permissions Test');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`\nToken Type: ${tokenType.toUpperCase()}`);
  console.log(`Token Prefix: ${token.substring(0, 20)}...`);
  console.log(`Token Length: ${token.length}`);
  console.log(`Graph Base: ${graphBase}`);

  // Test 1: Get user info
  const meUrl = `${graphBase}/me?fields=id,name,username,email&access_token=${token}`;
  const me = await makeRequest(meUrl, '1. User Info (/me)');
  
  if (me && me.id) {
    console.log(`   ✅ User ID: ${me.id}`);
    if (me.name) console.log(`   ✅ Name: ${me.name}`);
    if (me.username) console.log(`   ✅ Username: ${me.username}`);
    if (me.email) console.log(`   ✅ Email: ${me.email}`);
  }

  // Test 2: Get permissions
  const permUrl = `${FACEBOOK_GRAPH_BASE}/me?permissions&access_token=${token}`;
  const perms = await makeRequest(permUrl, '2. Permissions (/me?permissions)');
  
  if (perms && perms.data) {
    const granted = perms.data.filter(p => p.status === 'granted');
    const declined = perms.data.filter(p => p.status === 'declined');
    
    console.log(`   ✅ Total Permissions: ${perms.data.length}`);
    console.log(`   ✅ Granted: ${granted.length}`);
    if (declined.length > 0) console.log(`   ⚠️  Declined: ${declined.length}`);
    
    console.log('\n   Granted Permissions:');
    granted.forEach(p => {
      const required = [
        'instagram_business_basic',
        'instagram_business_content_publish',
        'instagram_content_publish',
        'pages_manage_posts'
      ].includes(p.permission);
      const icon = required ? '⭐' : '  ';
      console.log(`     ${icon} ${p.permission}`);
    });
    
    if (declined.length > 0) {
      console.log('\n   Declined Permissions:');
      declined.forEach(p => {
        console.log(`     ❌ ${p.permission}`);
      });
    }
  }

  // Test 3: Debug token
  const debugUrl = `${graphBase}/debug_token?input_token=${token}&access_token=${token}`;
  const debug = await makeRequest(debugUrl, '3. Token Debug Info (/debug_token)');
  
  if (debug && debug.data) {
    const d = debug.data;
    console.log(`   ✅ Valid: ${d.is_valid}`);
    if (d.app_id) console.log(`   ✅ App ID: ${d.app_id}`);
    if (d.application) console.log(`   ✅ Application: ${d.application}`);
    if (d.user_id) console.log(`   ✅ User ID: ${d.user_id}`);
    if (d.issued_at) console.log(`   ✅ Issued: ${new Date(d.issued_at * 1000).toISOString().split('T')[0]}`);
    if (d.expires_at) {
      const expiresDate = new Date(d.expires_at * 1000);
      const now = new Date();
      const daysLeft = Math.round((expiresDate - now) / (1000 * 60 * 60 * 24));
      console.log(`   ✅ Expires: ${expiresDate.toISOString().split('T')[0]} (${daysLeft} days)`);
      
      if (daysLeft < 7) {
        console.log(`   ⚠️  WARNING: Token expires in ${daysLeft} day(s)!`);
      }
    }
    if (d.scopes && d.scopes.length > 0) {
      console.log(`\n   Scopes (${d.scopes.length}):`);
      d.scopes.forEach(scope => {
        console.log(`     • ${scope}`);
      });
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('Summary');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  let status = '✅ PASS';
  const issues = [];
  
  if (me?.id) {
    console.log('✅ Token is valid and authenticated');
  } else {
    console.log('❌ Token is invalid');
    status = '❌ FAIL';
    issues.push('Token validation failed');
  }

  if (perms?.data) {
    const requiredScopes = [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_content_publish',
      'pages_manage_posts'
    ];
    const grantedScopes = perms.data
      .filter(p => p.status === 'granted')
      .map(p => p.permission);
    
    const missing = requiredScopes.filter(s => !grantedScopes.includes(s));
    if (missing.length > 0) {
      console.log(`⚠️  Missing scopes: ${missing.join(', ')}`);
      status = '⚠️  WARN';
      issues.push(`Missing ${missing.length} required scope(s)`);
    } else {
      console.log('✅ All required scopes are granted');
    }
  }

  if (debug?.data) {
    const d = debug.data;
    if (!d.is_valid) {
      console.log('❌ Token is not valid');
      status = '❌ FAIL';
      issues.push('Token marked as invalid');
    }
    
    const expiresAt = new Date(d.expires_at * 1000);
    const now = new Date();
    const daysLeft = Math.round((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      console.log('❌ Token has expired');
      status = '❌ FAIL';
      issues.push('Token expired');
    } else if (daysLeft < 7) {
      console.log(`⚠️  Token expires in ${daysLeft} day(s)`);
      status = '⚠️  WARN';
      issues.push(`Expires soon (${daysLeft} days)`);
    } else {
      console.log(`✅ Token valid for ${daysLeft} more days`);
    }
  }

  console.log(`\nOverall Status: ${status}`);
  if (issues.length > 0) {
    console.log(`Issues found: ${issues.join(' | ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
