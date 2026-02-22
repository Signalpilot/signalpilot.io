# Signalpilot Advanced Analytics & Coordination Guide

This document covers the 4 new powerful enhancements for your engagement system:

1. **Causal Inference** - Track what actions lead to conversions
2. **Competitor Benchmarking** - Compare yourself to the competition
3. **A/B Testing Framework** - Test changes with statistical rigor
4. **Multi-Account Orchestrator** - Coordinate across multiple accounts

---

## 🔗 1. CAUSAL INFERENCE ENGINE

**What it does**: Tracks which engagement actions (likes, comments, replies) actually lead to follows, DMs, or sales.

### Location
- Library: `/lib/social/causal-analyzer.js`
- API: `/api/social/causal-analysis.js`

### Usage

#### Record engagements and outcomes:
```bash
# Record when you like/comment on someone's post
curl -X POST http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-engagement",
    "data": {
      "targetUser": "username123",
      "action": "like",
      "timestamp": 1708608000000,
      "metadata": { "postId": "post123" }
    }
  }'

# Record when someone follows you (outcome)
curl -X POST http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-follow",
    "data": {
      "userId": "username123",
      "followedAt": 1708694400000
    }
  }'

# Record when someone DMs you (outcome)
curl -X POST http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-dm",
    "data": {
      "from": "username123",
      "receivedAt": 1708694400000,
      "text": "Hey, love your content!"
    }
  }'
```

#### Get analysis results:
```bash
# Get ranked effectiveness (best actions first)
curl "http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN&type=ranking"

# Response:
{
  "ranking": [
    {
      "action": "reply",
      "conversionRate": 18.2,
      "conversions": 11,
      "total": 60,
      "avgLeadTimeHours": "1.3"
    },
    {
      "action": "comment",
      "conversionRate": 5.4,
      ...
    }
  ],
  "bestAction": "reply",
  "recommendation": "REPLY is 3.4x more effective than comments. Allocate 60% effort to replies, 30% to comments, 10% to likes."
}

# Get funnel view (engagement → follows → DMs)
curl "http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN&type=funnel"

# Get all raw data
curl "http://localhost:3000/api/social/causal-analysis?token=YOUR_TOKEN&type=export"
```

### In Code Usage:
```javascript
import CausalAnalyzer from './lib/social/causal-analyzer.js';

const analyzer = new CausalAnalyzer();

// Record actions
analyzer.recordEngagement('user123', 'like');
analyzer.recordEngagement('user123', 'comment');
analyzer.recordNewFollower('user123'); // They followed!

// Analyze
const ranking = analyzer.getRanking();
console.log(ranking.recommendation); 
// "REPLY is 3.4x more effective..."
```

### Real-world Integration:
```javascript
// In your cron-engage.js, after each engagement:
if (success) {
  analyzer.recordEngagement(targetUser, actionType);
}

// In your follow tracking:
app.post('/api/track-new-follower', (req, res) => {
  analyzer.recordNewFollower(req.body.userId);
  res.json({ ok: true });
});
```

---

## 📊 2. COMPETITOR BENCHMARKING

**What it does**: Compare your metrics against competitors to see where you rank.

### Location
- Library: `/lib/social/competitor-analyzer.js`
- API: `/api/social/competitor-benchmark.js`

### Usage

#### Initialize benchmarking:
```bash
curl -X POST http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "init",
    "yourMetrics": {
      "successRate": 85,
      "avgEngagement": 7,
      "uniqueTargets": 12,
      "templateVariety": 4
    },
    "competitors": [
      {
        "name": "investopedia",
        "successRate": 82,
        "avgEngagement": 8,
        "uniqueTargets": 18,
        "templateVariety": 6
      },
      {
        "name": "tradingview",
        "successRate": 88,
        "avgEngagement": 9,
        "uniqueTargets": 20,
        "templateVariety": 8
      }
    ]
  }'
```

#### Add competitors over time:
```bash
curl -X POST http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-competitor",
    "name": "stocktwits",
    "metrics": {
      "successRate": 80,
      "avgEngagement": 6,
      "uniqueTargets": 10,
      "templateVariety": 5
    }
  }'
```

#### Get benchmark results:
```bash
# Full report
curl "http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN&report=full"

# Market position (are you premium, competitive, or needs improvement?)
curl "http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN&report=position"
# {
#   "tier": "COMPETITIVE",
#   "marketScore": 72,
#   "summary": "You're in COMPETITIVE tier (72% of metrics above average)"
# }

# Specific gaps and recommendations
curl "http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN&report=gaps"

# Your competitive advantages
curl "http://localhost:3000/api/social/competitor-benchmark?token=YOUR_TOKEN&report=advantages"
```

### In Code Usage:
```javascript
import CompetitorAnalyzer from './lib/social/competitor-analyzer.js';

const analyzer = new CompetitorAnalyzer(
  { successRate: 85, avgEngagement: 7 },
  [
    { name: 'competitor1', metrics: { successRate: 82, avgEngagement: 8 } }
  ]
);

const position = analyzer.getMarketPosition();
console.log(position.summary);
// "You're in COMPETITIVE tier (72% of metrics above average)"

const gaps = analyzer.getGapsAndRecommendations();
console.log(gaps.recommendations);
// ["Improve success rate from 85% to 87.2%. Try: 1) New templates..."]
```

---

## 🧪 3. A/B TESTING FRAMEWORK

**What it does**: Formally test template changes with statistical significance tests.

### Location
- Library: `/lib/social/ab-tester.js`
- API: `/api/social/ab-test.js`

### Usage

#### Create an A/B test:
```bash
curl -X POST http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "template_effectiveness_feb2026",
    "action": "create",
    "data": {
      "controlGroup": ["This is the move", "Exactly right"],
      "treatmentGroup": ["Game changer", "Bullish signal"]
    }
  }'
```

#### Record results:
```bash
# When you send engagement with control template
curl -X POST http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "template_effectiveness_feb2026",
    "action": "record",
    "data": {
      "group": "control",
      "success": true,
      "metadata": { "user": "user123", "platform": "instagram" }
    }
  }'

# When you send engagement with treatment template
curl -X POST http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "template_effectiveness_feb2026",
    "action": "record",
    "data": {
      "group": "treatment",
      "success": true,
      "metadata": { "user": "user456", "platform": "instagram" }
    }
  }'
```

#### Get test results:
```bash
# Get summary with statistical significance
curl "http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN&testName=template_effectiveness_feb2026&action=summary"

# Response:
{
  "statistics": {
    "absoluteImprovement": "8.2%",
    "relativeImprovement": "12.4%",
    "pValue": "0.0023",
    "isSignificant": true,
    "confidence": "95%"
  },
  "recommendation": "✅ TREATMENT WINS! 12.4% improvement. Recommend rolling out treatment to 100% of traffic."
}

# List all tests
curl "http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN&action=list"
```

#### End and export test:
```bash
# End the test
curl -X POST http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "template_effectiveness_feb2026",
    "action": "end"
  }'

# Export raw data
curl "http://localhost:3000/api/social/ab-test?token=YOUR_TOKEN&testName=template_effectiveness_feb2026&action=export"
```

### In Code Usage:
```javascript
import ABTest from './lib/social/ab-tester.js';

const test = new ABTest('templates_test', 
  ['Template A', 'Template B'], 
  ['New Template']
);

// After sending engagement
test.recordResult('control', success, { user: 'user123' });

// Check progress
const summary = test.getSummary();
if (summary.statistics.isSignificant) {
  console.log(summary.recommendation); 
  // "✅ TREATMENT WINS! 12.4% improvement."
}
```

### Integration Example:
```javascript
// In cron-engage.js
const testName = 'feb_2026_templates';
let controlRate = 0.5; // 50/50 split

if (Math.random() < controlRate) {
  template = selectFrom(test.controlGroup);
  abTest.recordResult('control', success);
} else {
  template = selectFrom(test.treatmentGroup);
  abTest.recordResult('treatment', success);
}
```

---

## 🎪 4. MULTI-ACCOUNT ORCHESTRATOR

**What it does**: Coordinate engagement across multiple accounts with smart load distribution and pattern-breaking delays.

### Location
- Library: `/lib/social/multi-account-orchestrator.js`
- API: `/api/social/multi-account.js`

### Usage

#### Set up accounts:
```bash
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-account",
    "data": {
      "username": "main_account",
      "config": {
        "platforms": ["instagram", "twitter"],
        "limits": { "dailyLikes": 30, "dailyComments": 5 },
        "successRate": 0.85,
        "cooldownMs": 300000
      }
    }
  }'

# Add alt accounts
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-account",
    "data": {
      "username": "alt_account_1",
      "config": {
        "platforms": ["instagram"],
        "limits": { "dailyLikes": 20, "dailyComments": 3 },
        "successRate": 0.78,
        "cooldownMs": 300000
      }
    }
  }'
```

#### Distribute engagement load:
```bash
# Get smart distribution (weighted by success rates & limits)
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "distribute-load",
    "data": {
      "total": 30,
      "strategy": "smart"
    }
  }'

# Response:
{
  "main_account": 18,
  "alt_account_1": 12
}
```

#### Select next account (with delays):
```bash
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "select-next-account",
    "data": {
      "actionType": "like"
    }
  }'

# Automatically waits appropriate cooldown + jitter before responding
```

#### Record engagement:
```bash
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record-engagement",
    "data": {
      "accountUsername": "main_account",
      "targetUser": "user123",
      "actionType": "like"
    }
  }'
```

#### Get account health:
```bash
curl "http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN&report=status"

# Response:
{
  "accounts": [
    {
      "username": "main_account",
      "dailyLikes": "28/30",
      "dailyComments": "4/5",
      "healthScore": "95",
      "status": "HEALTHY"
    },
    {
      "username": "alt_account_1",
      "dailyLikes": "18/20",
      "healthScore": "92",
      "status": "HEALTHY"
    }
  ],
  "recommendations": ["All accounts healthy. Continue current strategy."]
}

# Get health report
curl "http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN&report=health"

# Get suggested distribution
curl "http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN&report=distribution"
```

#### Get next target (prevent multi-account spam):
```bash
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-next-target",
    "data": {
      "targets": [
        { "username": "user1" },
        { "username": "user2" }
      ],
      "lookbackHours": 24
    }
  }'

# Returns a target that hasn't been engaged with by multiple accounts recently
```

#### Reset daily counters:
```bash
# Call once per day (at 12:01 AM)
curl -X POST http://localhost:3000/api/social/multi-account?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reset-daily-counters"
  }'
```

### In Code Usage:
```javascript
import MultiAccountOrchestrator from './lib/social/multi-account-orchestrator.js';

const orchestrator = new MultiAccountOrchestrator([
  { username: 'main', platforms: ['ig'], limits: { dailyLikes: 30 }, successRate: 0.85 },
  { username: 'alt1', platforms: ['ig'], limits: { dailyLikes: 20 }, successRate: 0.78 }
]);

// Distribute 30 likes
const distribution = orchestrator.distributeEngagementLoad(30, 'smart');
// { main: 18, alt1: 12 }

// Select account with delays
const account = await orchestrator.selectNextAccount('like');
// Waits ~5 min before returning, with random jitter

// Record engagement
orchestrator.recordEngagement(account, 'user123', 'like');

// Get health
const health = orchestrator.getCoordinationReport();
console.log(health.overallHealth); // "EXCELLENT"
```

### Integration with cron-engage.js:
```javascript
import MultiAccountOrchestrator from './lib/social/multi-account-orchestrator.js';

const orchestrator = new MultiAccountOrchestrator(accountConfigs);

async function cronEngage() {
  // Each day, reset counters
  if (new Date().getHours() === 0) {
    orchestrator.resetDailyCounters();
  }

  // Get distribution
  const distribution = orchestrator.distributeEngagementLoad(30, 'smart');

  for (const [accountUsername, count] of Object.entries(distribution)) {
    for (let i = 0; i < count; i++) {
      // Select account with built-in delays
      const account = await orchestrator.selectNextAccount('like');

      // Get target (ensures no multi-account spam)
      const { target } = orchestrator.getNextTarget(targets, 24);

      // Engage
      await engageOnTarget(account, target);

      // Record
      orchestrator.recordEngagement(account, target.username, 'like');
    }
  }
}
```

---

## 📈 Complete Workflow Example

Here's how all 4 features work together:

```javascript
// 1. CAUSAL INFERENCE: Track what works
analyzer.recordEngagement('user123', 'reply');
// Later, if they follow:
analyzer.recordNewFollower('user123');

// Get insight: "Replies are 3.4x more effective"
const ranking = analyzer.getRanking();

// 2. A/B TEST: Test improvement ideas
const test = new ABTest('new_replies_test',
  ['Old reply template'],
  ['New reply template']
);

// Randomly test both templates
if (Math.random() < 0.5) {
  template = test.controlGroup[0];
  test.recordResult('control', success);
} else {
  template = test.treatmentGroup[0];
  test.recordResult('treatment', success);
}

// 3. MULTI-ACCOUNT: Scale across accounts
const orchestrator = new MultiAccountOrchestrator(accounts);
const distribution = orchestrator.distributeEngagementLoad(50, 'weighted');

// 4. COMPETITOR BENCHMARK: Track progress
const benchmark = new CompetitorAnalyzer(myMetrics, competitorMetrics);
const position = benchmark.getMarketPosition();
// "You're in PREMIUM tier (88% of metrics above average)"
```

---

## 🚀 Quick Start Checklist

- [ ] Integrate causal analyzer into cron-engage.js
- [ ] Set up competitor data (at least 2-3 competitors)
- [ ] Create first A/B test for templates
- [ ] Add secondary accounts to multi-account orchestrator
- [ ] Review metrics weekly against benchmarks
- [ ] Implement learnings from causal analysis
- [ ] Roll out winning A/B test results

---

## 📊 Monitoring Dashboard

Create a simple dashboard that hits these endpoints daily:

```bash
# Morning report
curl "http://localhost:3000/api/social/multi-account?token=TOKEN&report=status" > ./reports/accounts.json
curl "http://localhost:3000/api/social/causal-analysis?token=TOKEN&type=ranking" > ./reports/causal.json
curl "http://localhost:3000/api/social/competitor-benchmark?token=TOKEN&report=position" > ./reports/benchmark.json
curl "http://localhost:3000/api/social/ab-test?token=TOKEN&action=list" > ./reports/tests.json
```

---

## 🔧 Environment Variables

Add to your `.env`:
```
SOCIAL_API_TOKEN=your_secure_token_here
```

---

**Questions?** Review the library files for detailed code documentation and examples.
