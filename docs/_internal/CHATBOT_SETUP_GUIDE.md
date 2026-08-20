# 🤖 SignalPilot Chatbot - Quick Setup Guide

Your documentation now has an AI-powered chatbot! Here's how to get started.

## 🎯 What is This?

The SignalPilot Chatbot is an intelligent assistant that knows everything about your documentation. Users can ask questions in natural language and get instant, accurate answers powered by AI.

## 🚀 For End Users

### Step 1: Find the Chatbot
Look for the **purple chat button** in the bottom-right corner of any documentation page.

### Step 2: Open Settings
1. Click the chat button to open the chat window
2. Click the **gear icon** (⚙️) in the top-right of the chat
3. The settings panel will open

### Step 3: Configure Your API

You have **three options**:

#### Option A: Use OpenAI (Recommended)
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. In settings, select **"OpenAI (GPT-4)"**
3. Paste your API key
4. Click **"Save Settings"**

**Cost**: ~$0.01-0.05 per conversation (very affordable)

#### Option B: Use Anthropic Claude
1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. In settings, select **"Anthropic (Claude)"**
3. Paste your API key
4. Click **"Save Settings"**

**Cost**: ~$0.015-0.08 per conversation

#### Option C: Use Custom Backend (Advanced)
If your organization provides a backend endpoint:
1. Select **"Custom Backend"**
2. Enter the endpoint URL
3. Click **"Save Settings"**

### Step 4: Start Chatting!

Try asking:
- "How do I set up alerts?"
- "What is Pentarch?"
- "Explain non-repainting indicators"
- "What are the best practices?"

The bot will search the documentation and provide accurate answers!

## 🔐 Privacy & Security

✅ **Your API key is safe**:
- Stored only in your browser (localStorage)
- Never sent to SignalPilot servers
- Only used to communicate with your chosen AI provider

✅ **Your conversations**:
- Stored locally in your browser only
- Can be cleared anytime
- Not visible to anyone else

✅ **Your data**:
- Questions go directly to OpenAI/Anthropic from your browser
- No tracking by SignalPilot (except optional Google Analytics)

## 💰 Cost Breakdown

### OpenAI Pricing
- **GPT-3.5 Turbo**: ~$0.002 per conversation (super cheap!)
- **GPT-4**: ~$0.03 per conversation (more capable)

### Anthropic Pricing
- **Claude Sonnet**: ~$0.015 per conversation
- **Claude Opus**: ~$0.08 per conversation (most capable)

**Example**: 100 conversations with GPT-4 = ~$3.00

Most users spend less than $5/month even with heavy usage.

## 🎨 Features

- **Conversation Memory**: Remembers context from previous messages
- **Quick Actions**: Pre-made questions for common topics
- **Mobile Friendly**: Works great on phones and tablets
- **Dark Mode**: Automatically matches your system theme
- **Keyboard Shortcuts**: Press Enter to send messages
- **Copy/Paste**: Works with code snippets and links

## 🛠️ For Administrators

### Setting Up a Shared Backend (Optional)

Instead of requiring each user to have their own API key, you can set up a shared backend:

#### Benefits
- Users don't need their own API keys
- Centralized cost management
- Usage analytics
- Custom rate limiting

#### Quick Backend Setup (Node.js)

1. **Install dependencies**:
```bash
npm init -y
npm install express openai cors dotenv
```

2. **Create `server.js`**:
```javascript
require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { system, message, history } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: system },
        ...history.slice(-10), // Last 10 messages
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chatbot backend running on port ${PORT}`);
});
```

3. **Create `.env`**:
```
OPENAI_API_KEY=sk-your-key-here
PORT=3000
```

4. **Run**:
```bash
node server.js
```

5. **Deploy** to Vercel, Railway, or any hosting:
```bash
# Example with Vercel
npm i -g vercel
vercel
```

6. **Configure chatbot**:
   - Users select "Custom Backend"
   - Enter: `https://your-backend.vercel.app/api/chat`
   - No API key needed!

### Pre-configuring the Chatbot

Edit `js/chatbot.js` line 593:

```javascript
// Option 1: Force custom backend
window.signalpilotChatbot = new SignalPilotChatbot({
  apiProvider: 'custom',
  apiEndpoint: 'https://your-backend.com/api/chat'
});

// Option 2: Set default but allow user override
window.signalpilotChatbot = new SignalPilotChatbot({
  apiEndpoint: 'https://your-backend.com/api/chat'
});
```

### Rate Limiting (Recommended)

Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // 50 requests per 15 minutes
});

app.use('/api/', limiter);
```

## 📊 Monitoring Usage

### Track Costs
Monitor your OpenAI/Anthropic dashboard:
- [OpenAI Usage](https://platform.openai.com/usage)
- [Anthropic Console](https://console.anthropic.com/)

### Set Budget Limits
Set monthly spending limits to prevent surprises:
- OpenAI: Settings → Billing → Usage Limits
- Anthropic: Console → Settings → Billing

### Google Analytics (Already Integrated)
The chatbot automatically logs to your existing GA:
- Event: `chatbot_message`
- Category: `engagement`

## 🐛 Common Issues

### "API Error" message
- **Check API key**: Make sure it's correct and active
- **Check credits**: Verify your account has credits
- **Try different provider**: Switch between OpenAI/Anthropic

### Chatbot not appearing
- **Clear cache**: Hard refresh (Ctrl+Shift+R)
- **Check console**: Open browser DevTools → Console for errors
- **Verify files**: Ensure `chatbot.js` and `chatbot.css` load

### Slow responses
- **Use GPT-3.5**: Faster and cheaper than GPT-4
- **Check connection**: Slow internet affects response time
- **Provider status**: Check OpenAI/Anthropic status pages

### Mobile issues
- **Update browser**: Use latest Chrome/Safari
- **Clear app cache**: Settings → Storage → Clear
- **Responsive works**: Chatbot is fully mobile-optimized

## 🎓 Tips for Best Results

### Ask Specific Questions
❌ "Tell me about indicators"
✅ "How do I set up alerts for the Pentarch indicator?"

### Use Follow-ups
The bot remembers context:
- "What is Pentarch?"
- "How do I use it for day trading?"
- "Can you show me best practices?"

### Try Quick Actions
Click the suggested questions to get started quickly.

### Clear When Done
Click the trash icon to clear conversation and start fresh.

## 📞 Support

Need help?
1. Check `CHATBOT_README.md` for technical details
2. Review browser console for error messages
3. Contact SignalPilot support
4. Submit GitHub issue

## ✨ Enjoy Your New AI Assistant!

The chatbot is now live on all documentation pages. Your users can get instant, accurate answers about SignalPilot anytime!

---

**Questions?** Contact your documentation administrator.
