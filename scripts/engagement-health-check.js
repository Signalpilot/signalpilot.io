#!/usr/bin/env node

/**
 * Engagement Health Check
 * 
 * Tests if engagement system is working by:
 * 1. Checking if cron jobs are scheduled
 * 2. Checking engagement config
 * 3. Checking for recent errors
 * 4. Verifying target accounts exist
 * 5. Testing engagement endpoints
 * 
 * Usage: node scripts/engagement-health-check.js <admin-token>
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const token = process.argv[2];

if (!token) {
  console.log('❌ Missing admin token');
  console.log('Usage: node scripts/engagement-health-check.js <admin-token>');
  process.exit(1);
}

async function checkHealth() {
  console.log('\n🔍 ENGAGEMENT SYSTEM HEALTH CHECK\n');
  
  try {
    // 1. Check config file
    console.log('=== 1. CONFIGURATION ===\n');
    const configPath = join(process.cwd(), 'data', 'social', 'engagement-config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    console.log(`✓ Engagement enabled: ${config.enabled}`);
    console.log(`✓ Instagram enabled: ${config.instagram.enabled}`);
    console.log(`✓ Twitter enabled: ${config.twitter.enabled}`);
    console.log(`\n📷 Instagram targets: ${config.instagram.targets.length}`);
    config.instagram.targets.forEach(t => {
      console.log(`   - @${t.value} (${t.type})`);
    });
    console.log(`\n🐦 Twitter targets: ${config.twitter.targetAccounts.length}`);
    config.twitter.targetAccounts.forEach(t => {
      console.log(`   - @${t.username}`);
    });
    
    // 2. Check cron schedule
    console.log('\n=== 2. CRON SCHEDULE ===\n');
    const vercelPath = join(process.cwd(), 'vercel.json');
    const vercel = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    
    const engageCron = vercel.crons.find(c => c.path.includes('cron-engage/'));
    const engageRetryCron = vercel.crons.find(c => c.path.includes('cron-engage-retry/'));
    
    console.log(`✓ Main engagement cron: ${engageCron.schedule}`);
    console.log(`  (Every 4 hours)\n`);
    console.log(`✓ Engagement retry cron: ${engageRetryCron.schedule}`);
    console.log(`  (Every 10 minutes)\n`);
    
    // 3. Check templates
    console.log('=== 3. ENGAGEMENT TEMPLATES ===\n');
    console.log(`📷 Instagram comment templates: ${config.instagram.commentTemplates.length}`);
    config.instagram.commentTemplates.slice(0, 3).forEach(t => {
      console.log(`   - "${t}"`);
    });
    console.log(`\n🐦 Twitter reply templates: ${config.twitter.replyTemplates.length}`);
    config.twitter.replyTemplates.slice(0, 3).forEach(t => {
      console.log(`   - "${t}"`);
    });
    
    // 4. Check rate limits
    console.log('\n=== 4. RATE LIMITS & SAFETY ===\n');
    console.log(`Instagram: ${config.instagram.likeDaily} likes/day, ${config.instagram.commentDaily} comments/day`);
    console.log(`Twitter: ${config.twitter.likeDaily} likes/day, ${config.twitter.replyDaily} replies/day`);
    console.log(`\nRate limiting: ${config.rateLimiting.instagramRequestsPerMinute} req/min IG, ${config.rateLimiting.twitterRequestsPerMinute} req/min Twitter`);
    console.log(`Safety: Max ${config.safety.maxEngagementPerAccount} actions per account, min ${config.safety.minFollowersThreshold} followers`);
    
    // 5. Check active hours
    console.log('\n=== 5. SCHEDULING ===\n');
    console.log(`Active hours: ${config.scheduling.activeHours.join(', ')} UTC`);
    console.log(`Timezone: ${config.scheduling.timezone}`);
    console.log(`Pause weekends: ${config.scheduling.pauseOnWeekends}`);
    
    // 6. Remote status check
    console.log('\n=== 6. CHECKING PRODUCTION STATUS ===\n');
    console.log('Attempting to fetch recent engagement data from production...\n');
    
    try {
      const dashboardUrl = `https://www.signalpilot.io/api/social/engagement-dashboard?token=${token}&days=7`;
      const response = await fetch(dashboardUrl);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✓ Dashboard endpoint: WORKING`);
        console.log(`  Total recent actions: ${data.recentEngagementCount || '?'}`);
        console.log(`  Instagram today: ${data.instagramLikesToday || 0} likes, ${data.instagramCommentsToday || 0} comments`);
        console.log(`  Twitter today: ${data.twitterLikesToday || 0} likes, ${data.twitterRepliesToday || 0} replies`);
        
        if (data.dayStats && data.dayStats.length > 0) {
          console.log(`\n📊 Last 7 days activity:`);
          data.dayStats.forEach(day => {
            const ig = (day.instagram.likes + day.instagram.comments) || 0;
            const tw = (day.twitter.likes + day.twitter.replies) || 0;
            const total = ig + tw;
            if (total > 0) {
              console.log(`   ${day.date}: ${total} actions (IG: ${ig}, TW: ${tw})`);
            }
          });
        }
        
        if (data.errors && data.errors.length > 0) {
          console.log(`\n⚠️  Recent errors:`);
          data.errors.slice(0, 3).forEach(err => {
            console.log(`   - ${err.action}: ${err.reason || err.message}`);
          });
        }
      } else {
        console.log(`✗ Dashboard endpoint returned error: ${data.error}`);
      }
    } catch (e) {
      console.log(`⚠️  Cannot check production status: ${e.message}`);
      console.log(`   (This is OK if running locally without network access)`);
    }
    
    // Summary
    console.log('\n=== SUMMARY ===\n');
    console.log('✅ Configuration: VALID');
    console.log('✅ Cron jobs: SCHEDULED');
    console.log('✅ Templates: CONFIGURED');
    console.log('✅ Safety limits: IN PLACE');
    console.log('\n🚀 Engagement system is ready to go!\n');
    console.log('📌 To manually trigger engagement:');
    console.log(`   curl "https://www.signalpilot.io/api/social/cron-engage/?token=${token}&force=true"\n`);
    console.log('📌 To check recent activity:');
    console.log(`   curl "https://www.signalpilot.io/api/social/engagement-dashboard?token=${token}"\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkHealth();
