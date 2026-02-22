#!/usr/bin/env node

/**
 * Debug script to check post queue status and manually trigger posting
 * Usage: node scripts/debug-post.js <admin-token>
 */

import { getStatus, getErrorLog, getPostingLog } from '../lib/social/queue-manager.js';
import { getNextPostOrder, getPostNumber } from '../lib/social/posting-schedule.js';

const token = process.argv[2];

if (!token) {
  console.log('❌ Missing admin token');
  console.log('Usage: node scripts/debug-post.js <admin-token>');
  process.exit(1);
}

async function debug() {
  console.log('\n📊 QUEUE STATUS DEBUG\n');
  
  try {
    console.log('Fetching queue status...\n');
    
    // Check if matches env token
    if (token !== process.env.SOCIAL_ADMIN_TOKEN) {
      console.log('⚠️ Token mismatch! Make sure SOCIAL_ADMIN_TOKEN is set in env.');
    }
    
    const status = await getStatus();
    const errors = await getErrorLog(10);
    const posts = await getPostingLog(5);
    
    console.log('=== QUEUE STATE ===');
    console.log(JSON.stringify(status, null, 2));
    
    console.log('\n=== LAST 5 POSTS ===');
    posts.forEach((post, i) => {
      const time = new Date(post.timestamp).toISOString();
      console.log(`${i+1}. [${time}] Post ${post.postNumber}: ${post.action}`);
    });
    
    console.log('\n=== LAST 10 ERRORS ===');
    if (errors.length === 0) {
      console.log('✅ No errors!');
    } else {
      errors.forEach((err, i) => {
        const time = new Date(err.timestamp).toISOString();
        console.log(`${i+1}. [${time}] Post ${err.postNumber}: ${err.reason || err.message}`);
      });
    }
    
    // Check next post
    console.log('\n=== NEXT POST INFO ===');
    const nextPostOrder = await getNextPostOrder('instagram');
    const nextPostNum = getPostNumber('instagram', nextPostOrder);
    console.log(`Post order: ${nextPostOrder}`);
    console.log(`Post number: ${nextPostNum}`);
    
    // Token info
    console.log('\n=== TOKEN STATUS ===');
    const tokenExpire = process.env.INSTAGRAM_TOKEN_EXPIRES_AT;
    if (tokenExpire) {
      const expireDate = new Date(parseInt(tokenExpire));
      const now = new Date();
      const daysLeft = Math.floor((expireDate - now) / (1000 * 60 * 60 * 24));
      console.log(`Token expires in: ${daysLeft} days (${expireDate.toISOString()})`);
      if (daysLeft < 5) {
        console.log('⚠️ TOKEN EXPIRING SOON! Consider refreshing manually.');
      }
    }
    
    // Manual trigger
    console.log('\n=== TO MANUALLY POST ===');
    console.log(`curl "https://www.signalpilot.io/api/social/post-instagram/?token=${token}&force=true"`);
    console.log('\nOr retry with specific force:');
    console.log(`curl "https://www.signalpilot.io/api/social/post-instagram/?token=${token}&force=true&retry=true"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debug();
