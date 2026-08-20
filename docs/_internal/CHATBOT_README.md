# SignalPilot Documentation Chatbot

An intelligent AI-powered assistant that knows everything about the SignalPilot documentation. This chatbot helps users quickly find information, understand features, and get answers to their questions about SignalPilot indicators and tools.

## 🌟 Features

### Core Functionality
- **AI-Powered Responses**: Uses OpenAI GPT-4 or Anthropic Claude for intelligent, contextual answers
- **Documentation-Aware**: Automatically searches and references relevant documentation pages
- **Conversation Memory**: Maintains conversation history for contextual follow-up questions
- **Real-time Search**: Integrates with the existing search index for accurate context retrieval

### User Interface
- **Beautiful Material Design**: Matches the documentation site's Material theme
- **Mobile Responsive**: Fully optimized for mobile devices
- **Dark Mode Support**: Automatic dark/light mode based on user preferences
- **Quick Actions**: Pre-defined questions for common queries
- **Typing Indicators**: Visual feedback during AI processing
- **Smooth Animations**: Polished transitions and interactions

### Configuration Options
- **Multiple AI Providers**:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic Claude (Sonnet, Opus)
  - Custom backend endpoint
- **Local Storage**: API keys stored securely in browser (never sent to our servers)
- **Conversation Persistence**: Chat history saved locally
- **Customizable Settings**: Adjust provider, model, and endpoints

## 📸 Screenshots

The chatbot appears as a floating button in the bottom-right corner of every documentation page:

- **Closed State**: Purple gradient circular button with chat icon
- **Open State**: Full chat window with conversation history
- **Settings Panel**: Configure API provider and credentials

## 🚀 Quick Start

### For Users

1. **Open the Chatbot**
   - Click the purple chat button in the bottom-right corner
   - The chat window will slide up

2. **First-Time Setup**
   - Click the settings icon (gear) in the chat header
   - Choose your AI provider (OpenAI or Anthropic)
   - Enter your API key
   - Click "Save Settings"

3. **Start Chatting**
   - Type your question in the input box
   - Press Enter or click the send button
   - The AI will respond with information from the docs

### Example Questions

Try asking:
- "How do I set up alerts for Pentarch?"
- "What's the difference between Omnideck and Janus Atlas?"
- "Explain non-repainting indicators"
- "How do I use webhooks with SignalPilot?"
- "What are the best practices for using multiple indicators?"

## 🔧 Technical Details

### Files

```
/js/chatbot.js          - Main chatbot logic and UI
/css/chatbot.css        - Chatbot styling
integrate-chatbot.py    - Integration script
```

### How It Works

1. **User Input**: User types a question
2. **Context Retrieval**: Chatbot searches the documentation index for relevant content
3. **AI Request**: Question + context sent to AI provider (OpenAI/Anthropic)
4. **Response**: AI generates an answer based on documentation
5. **Display**: Response shown in chat with formatting

### Architecture

```
┌─────────────────────────────────────────────┐
│           User Interface (Browser)          │
├─────────────────────────────────────────────┤
│  Chat Widget (chatbot.js + chatbot.css)    │
│  ├─ Message Display                         │
│  ├─ Input Handler                           │
│  ├─ Settings Panel                          │
│  └─ Quick Actions                           │
├─────────────────────────────────────────────┤
│         Context Retrieval Layer             │
│  ├─ Search Index Reader                     │
│  ├─ Relevance Scoring                       │
│  └─ Context Formatting                      │
├─────────────────────────────────────────────┤
│            AI Provider Layer                │
│  ├─ OpenAI API (GPT-4)                      │
│  ├─ Anthropic API (Claude)                  │
│  └─ Custom Backend (optional)               │
└─────────────────────────────────────────────┘
```

### Context Retrieval

The chatbot uses the existing `search_index.json` file to find relevant documentation:

1. Splits user query into keywords
2. Searches all documentation pages for matches
3. Scores results based on:
   - Title matches (10 points)
   - Content matches (1 point per occurrence)
4. Takes top 3 most relevant pages
5. Sends page content as context to AI

### API Integration

#### OpenAI Integration
```javascript
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "...documentation context..."},
      {"role": "user", "content": "user question"}
    ]
  }
```

#### Anthropic Integration
```javascript
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: YOUR_API_KEY
  anthropic-version: 2023-06-01
  Content-Type: application/json
Body:
  {
    "model": "claude-3-sonnet-20240229",
    "system": "...documentation context...",
    "messages": [
      {"role": "user", "content": "user question"}
    ]
  }
```

## ⚙️ Configuration

### User Configuration (Browser)

Users configure the chatbot via the settings panel:

1. **API Provider**: Choose OpenAI, Anthropic, or Custom
2. **API Key**: Enter their personal API key
3. **Custom Endpoint**: (Optional) URL for custom backend

Settings are stored in `localStorage`:
```javascript
{
  "apiProvider": "openai",
  "apiKey": "sk-...",
  "apiEndpoint": null
}
```

### Developer Configuration

Modify default settings in `chatbot.js`:

```javascript
window.signalpilotChatbot = new SignalPilotChatbot({
  apiProvider: 'openai',    // 'openai', 'anthropic', or 'custom'
  apiKey: '',               // Pre-configure API key (not recommended)
  apiEndpoint: null,        // Custom backend URL
  maxTokens: 1000,         // Maximum response length
  temperature: 0.7,        // AI creativity (0-1)
  model: 'gpt-4',          // AI model to use
  debug: false             // Enable console logging
});
```

## 🔐 Security & Privacy

### API Key Storage
- API keys stored in browser's `localStorage` only
- Never transmitted to SignalPilot servers
- Only sent directly to chosen AI provider (OpenAI/Anthropic)
- Users can clear keys anytime via browser settings

### Data Privacy
- Conversation history stored locally in browser
- No data collected by SignalPilot servers
- All AI requests go directly from user's browser to AI provider
- Users should review AI provider's privacy policy

### Best Practices
1. **Never commit API keys** to git repositories
2. **Use environment variables** for backend configurations
3. **Implement rate limiting** if using custom backend
4. **Monitor API usage** to prevent excessive costs
5. **Educate users** about API key security

## 🛠️ Custom Backend (Optional)

For advanced use cases, you can set up a custom backend:

### Backend Requirements

Your backend should accept POST requests with:

```javascript
POST /api/chat
Content-Type: application/json

{
  "system": "System prompt with documentation context",
  "message": "User's question",
  "history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ]
}
```

Response format:
```javascript
{
  "response": "AI generated answer",
  "sources": ["url1", "url2"],  // Optional: source citations
  "confidence": 0.95            // Optional: confidence score
}
```

### Example Backend (Node.js + Express)

```javascript
const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  const { system, message, history } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

Then configure users to use: `https://your-backend.com/api/chat`

## 📊 Analytics (Optional)

Track chatbot usage with Google Analytics:

```javascript
// Add to chatbot.js after sending message
gtag('event', 'chatbot_message', {
  'event_category': 'engagement',
  'event_label': userMessage.substring(0, 50)
});
```

## 🐛 Troubleshooting

### Chatbot doesn't appear
- Check browser console for JavaScript errors
- Verify `chatbot.js` and `chatbot.css` are loading
- Clear browser cache and reload

### API errors
- Verify API key is correct and active
- Check API provider account has credits
- Ensure no CORS issues (use custom backend if needed)
- Check browser console for error details

### No responses or slow responses
- Check internet connection
- Verify AI provider API status
- Try different AI model (e.g., GPT-3.5 instead of GPT-4)
- Check API rate limits

### Styling issues
- Clear browser cache
- Check for CSS conflicts with other stylesheets
- Verify `chatbot.css` loads after other styles
- Test in different browsers

## 🚀 Deployment

### To Production

1. **Test Locally**
   ```bash
   # Serve locally
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

2. **Verify Integration**
   - Open any documentation page
   - Check chatbot button appears
   - Test chat functionality
   - Verify settings panel works

3. **Commit Changes**
   ```bash
   git add js/chatbot.js css/chatbot.css
   git commit -m "Add AI chatbot to documentation"
   git push origin main
   ```

4. **Deploy**
   - GitHub Pages will automatically rebuild
   - Chatbot will be live at docs.signalpilot.io

### Reverting

To remove the chatbot:

```bash
# Restore from backup
cp -r backups/pre-chatbot-YYYYMMDD-HHMMSS/* .

# Or use git
git revert <commit-hash>
```

## 📈 Future Enhancements

Potential improvements:

- [ ] Voice input support
- [ ] Multi-language support
- [ ] Conversation export (PDF/TXT)
- [ ] Suggested follow-up questions
- [ ] Integration with TradingView API
- [ ] Code snippet examples
- [ ] Video tutorial links
- [ ] User feedback system (thumbs up/down)
- [ ] Admin dashboard for analytics
- [ ] Automated testing suite

## 📝 Changelog

### Version 1.0.0 (2025-11-04)
- Initial release
- OpenAI and Anthropic API support
- Material Design UI
- Mobile responsive design
- Dark mode support
- Conversation history
- Settings panel
- Quick action buttons
- Context-aware responses

## 🤝 Contributing

To improve the chatbot:

1. **Test thoroughly** before committing
2. **Document changes** in this README
3. **Maintain backwards compatibility**
4. **Follow existing code style**
5. **Update integration script** if needed

## 📄 License

This chatbot implementation is part of the SignalPilot documentation project.

## 🆘 Support

For issues or questions:
- Check this README first
- Review browser console for errors
- Contact SignalPilot support
- Submit GitHub issue

---

**Built with ❤️ for the SignalPilot community**
