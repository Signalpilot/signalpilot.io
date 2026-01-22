/**
 * Signal Pilot Chatbot - Enhanced Version
 * Based on the superior docs chatbot design
 * Features: Auto-resize textarea, typing indicator, quick actions, markdown support
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================

  const config = {
    name: 'Signal Pilot Assistant',
    version: '3.0.0',
    typingDelay: 800,
    maxHistory: 100
  };

  // ========================================
  // KNOWLEDGE BASE
  // ========================================

  const knowledgeBase = {
    greetings: [
      "Hey! 👋 I'm here to help you understand Signal Pilot. What would you like to know?",
      "Hi there! Ask me about our 7-day free trial, pricing, or indicators.",
      "Hello! Want to try our indicators free for 7 days? Ask me how to get started!"
    ],

    pricing: {
      overview: `We have 3 plans:

💳 **Monthly** - $99/month
📅 **Yearly** - $699/year (save $489)
♾️ **Lifetime** - $1,799 (Founding 100 Edition)

All plans include the same 7 indicators. Start with a **7-day free trial** - no payment required!

[Start free trial →](#pricing)`,

      monthly: `**Monthly Plan - $99/month**

Flexible month-to-month billing. Cancel anytime. **Start with 7-day free trial!**

**Includes:**
• All 7 elite indicators
• Email support (48h response)
• All future updates

[Start free trial →](#pricing)`,

      yearly: `**Yearly Plan - $699/year**

Save $489 vs monthly (41% off) ⭐ **Most Popular** - Start with 7-day free trial!

**Includes:**
• All 7 elite indicators
• Priority email support (24h response)
• All future updates
• Advanced training resources
• Beta access

[Start free trial →](#pricing)`,

      lifetime: `**Lifetime Plan - $1,799 (Founding 100 Edition)**

One-time payment for lifetime access 🏆 Start with 7-day free trial!

**Includes everything, forever:**
• All 7 indicators + all future releases
• Private Discord community
• Founding member badge
• 200+ preset configurations
• Priority support

Limited to 100 founding members only.

[Start free trial →](#pricing)`
    },

    products: {
      all: `**All 7 Elite Indicators:**

1. **SP Pentarch** ⭐ - 5-phase cycle detection
2. **SP OmniDeck** - 10-in-1 dashboard
3. **SP Volume Oracle** - Regime detection
4. **SP Plutus Flow** - Money flow analysis
5. **SP Janus Atlas** - Multi-timeframe key levels
6. **SP Augury Grid** - Support/resistance matrix
7. **SP Harmonic Oscillator** - Momentum signals

Every plan includes all 7 indicators!

[See them in action →](#inside)`,

      pentarch: `**SP Pentarch** ⭐ *FLAGSHIP*

Our flagship 5-phase cycle detection system. Maps complete market cycles: **TD → IGN → WRN → CAP → BDN**

**Features:**
• 5 event signals
• Regime bar colors
• Pilot line direction
• NanoFlow crosses

Works on any market, any timeframe.

[Learn more →](#inside)`,

      omnideck: `**SP OmniDeck** - *ALL-IN-ONE*

Dashboard combining 10 systems into one overlay.

**Features:**
• 10 systems combined
• Real-time P&L tracker
• Dynamic support/resistance
• Customizable display
• Bull Market Support Band

All components independently toggleable.

[Learn more →](#inside)`,

      volumeoracle: `**SP Volume Oracle** - *REGIME DETECTION*

Advanced volume analysis detecting accumulation/distribution patterns.

**Features:**
• Volume divergence detection
• Buyer/seller pressure analysis
• Accumulation/distribution tracking
• Price-volume confirmation

Green ribbon shows accumulation before retail notices.

[Learn more →](#inside)`,

      plutusflow: `**SP Plutus Flow** - *ACCUMULATION*

Money flow analysis tracking volume patterns.

**Features:**
• Volume flow tracking
• Cumulative delta analysis
• Statistical volume signals
• Flow divergence detection

Reveals hidden buying/selling pressure.

[Learn more →](#inside)`,

      janusatlas: `**SP Janus Atlas** - *KEY LEVELS*

Auto-plots HTF levels, pivots, VWAP anchors, and volume profile zones.

**Features:**
• Multi-timeframe levels (D/W/M)
• VWAP anchors
• Volume profile (POC, VAH, VAL)
• Session markers

All key zones in one view.

[Learn more →](#inside)`,

      augurygrid: `**SP Augury Grid** - *S/R MATRIX*

Multi-symbol watchlist tracking 8 tickers simultaneously.

**Features:**
• 8 symbols at once
• Quality scores (0-100)
• Real-time P&L tracking
• Target price calculations
• Signal direction & timing

Your entire watchlist, ranked by quality.

[Learn more →](#inside)`,

      harmonicoscillator: `**SP Harmonic Oscillator** - *TIMING*

7-oscillator voting system with confidence ratings.

**Features:**
• 7-in-1 momentum
• Star rating (★ to ★★★★)
• Composite signals
• Clear trend identification

7/7 agreement = max confidence.

[Learn more →](#inside)`
    },

    faqs: {
      repaint: `🚫 **Zero repainting. Guaranteed.**

All signals finalize on candle close only. We audit every indicator for lookahead bias.

**$100 USD bounty** if you can prove any repaint.

What you see in history is exactly what you would have seen live.`,

      trial: `**Yes! 7-day free trial** ✅

No payment required upfront. Try all 7 indicators completely free for 7 days.

Just provide your TradingView username and you're in!

[Start free trial →](#pricing)`,

      activation: `⚡ **Access: 1-8 hours** (usually under 2 hours)

You'll receive a TradingView invite-only link via email. Check your email and TradingView notifications.

[Get started →](#pricing)`,

      markets: `📊 **Works on ANY market, ANY timeframe**

• Stocks, indices, forex, crypto, commodities, bonds
• 1-minute to yearly charts
• Pentarch auto-adapts to your timeframe

If it has OHLC + volume data, our indicators work.

[See examples →](#inside)`,

      tradingview: `**Works with free TradingView!** ✅

You just need enough indicator slots:
• Free accounts: 3 slots (Pentarch + 1-2 filters)
• Pro/Premium: More slots + unlimited alerts

[See pricing →](#pricing)`,

      updates: `🎁 **All future indicators included**

Every plan includes every future indicator we launch, automatically and forever.

Buy once, benefit forever. No surprise charges.

[See roadmap →](/roadmap.html)`,

      support: `**Support by plan:**

• **Monthly:** Email (48h response)
• **Yearly:** Priority email (24h response)
• **Lifetime:** Private Discord + priority support

Email: support@signalpilot.io`,

      educational: `⚠️ **Educational use only**

Signal Pilot provides technical analysis tools—not investment advice, trade recommendations, or guaranteed returns.

Trading involves substantial risk of loss. You are solely responsible for your trading decisions.

[Read full disclaimer →](#faq)`,

      refund: `💰 **7-day money-back guarantee**

After your free trial, if you pay and change your mind - full refund within 7 days, no questions asked.

After 7 days, you can cancel anytime—no penalty.

Manage via [self-service portal](/manage-subscription.html).

[Full policy →](/refund.html)`,

      manage: `📋 **Manage your subscription:**

Use our [self-service portal](/manage-subscription.html) to pause, cancel, or update payment methods.

You can cancel anytime—no penalty. You keep access until the end of your current billing period.

[Manage subscription →](/manage-subscription.html)`,

      allfaqs: `📚 **View complete FAQ**

I can answer quick questions, but for detailed information check our comprehensive FAQ page with 40+ questions covering:

• Getting Started
• All 7 Indicators (detailed)
• Platform & Technical
• Trading & Strategy
• Education & Learning
• Pricing & Plans
• Support & Account

[View full FAQ →](/faq.html)`
    },

    features: `**Every plan includes:**

✅ All 7 elite indicators
✅ 100% non-repainting (audited)
✅ Customizable TradingView alerts
✅ Full backtesting compatibility
✅ 200+ preset configurations
✅ Comprehensive documentation
✅ All future updates

[See details →](#pricing)`,

    links: {
      pricing: "#pricing",
      demo: "#comparison-slider",
      faq: "#faq",
      why: "#why",
      inside: "#inside",
      docs: "https://docs.signalpilot.io/",
      education: "https://education.signalpilot.io/",
      roadmap: "/roadmap.html",
      allfaqs: "/faq.html",
      manage: "/manage-subscription.html",
      refund: "/refund.html"
    }
  };

  // ========================================
  // PATTERN MATCHING
  // ========================================

  const patterns = [
    // Greetings
    { regex: /^(hi|hello|hey|sup|yo|greetings)/i, key: 'greetings' },

    // Pricing
    { regex: /(how much|price|cost|pricing|plans|subscription)/i, key: 'pricing.overview' },
    { regex: /(monthly|per month|month to month)/i, key: 'pricing.monthly' },
    { regex: /(yearly|annual|per year)/i, key: 'pricing.yearly' },
    { regex: /(lifetime|one.?time|forever)/i, key: 'pricing.lifetime' },
    { regex: /(difference|compare|which plan)/i, key: 'pricing.overview' },

    // Products
    { regex: /(all.*indicators|what.*included|7.*indicators|seven)/i, key: 'products.all' },
    { regex: /(pentarch|what is pentarch)/i, key: 'products.pentarch' },
    { regex: /(omnideck|omni deck)/i, key: 'products.omnideck' },
    { regex: /(volume oracle|volume)/i, key: 'products.volumeoracle' },
    { regex: /(plutus flow|plutus|money flow)/i, key: 'products.plutusflow' },
    { regex: /(janus atlas|janus|multi.?timeframe)/i, key: 'products.janusatlas' },
    { regex: /(augury grid|augury|support.*resistance)/i, key: 'products.augurygrid' },
    { regex: /(harmonic oscillator|harmonic|oscillator|momentum)/i, key: 'products.harmonicoscillator' },

    // FAQs
    { regex: /(repaint|repainting|does it repaint|lookahead)/i, key: 'faqs.repaint' },
    { regex: /(free trial|trial|demo|test|try)/i, key: 'faqs.trial' },
    { regex: /(how (fast|quick|long)|activation|access|when.*get)/i, key: 'faqs.activation' },
    { regex: /(markets?|timeframes?|what.*work|forex|stocks|crypto)/i, key: 'faqs.markets' },
    { regex: /(tradingview|free account|indicator slots)/i, key: 'faqs.tradingview' },
    { regex: /(update|future|new indicators)/i, key: 'faqs.updates' },
    { regex: /(support|help|contact)/i, key: 'faqs.support' },
    { regex: /(financial advice|guarantee|profits|returns)/i, key: 'faqs.educational' },
    { regex: /(manage.*subscription|pause.*subscription|cancel|unsubscribe|stop.*billing)/i, key: 'faqs.manage' },
    { regex: /(refund|money.?back|return)/i, key: 'faqs.refund' },
    { regex: /(more (info|faq|questions)|all.*faq|detailed|complete.*faq|full.*faq)/i, key: 'faqs.allfaqs' },

    // Features
    { regex: /(features|what.*included|what.*get)/i, key: 'features' },

    // Navigation
    { regex: /(show.*pricing|take.*pricing|go.*pricing)/i, action: 'scrollTo', target: 'pricing' },
    { regex: /(show.*demo|try.*demo|demo|comparison|before.*after)/i, action: 'scrollTo', target: 'comparison-slider' },
    { regex: /(faq|questions|show.*faq)/i, action: 'scrollTo', target: 'faq' },

    // Get started
    { regex: /(get started|buy|purchase|sign up|subscribe)/i, key: 'getstarted' }
  ];

  // Special responses
  knowledgeBase.getstarted = `🚀 **Ready to get started?**

1. [Start your free trial →](#pricing)
2. Enter your TradingView username
3. Get access in 1-8 hours!
4. Try free for 7 days - no payment required

[Start free trial →](#pricing)`;

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function parseMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function processMessage(input) {
    const text = input.trim();

    // Check for patterns
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        if (pattern.action === 'scrollTo') {
          scrollToSection(pattern.target);
          return `Taking you to ${pattern.target.replace('-', ' ')}... 👆`;
        }
        if (pattern.key) {
          const value = getNestedValue(knowledgeBase, pattern.key);
          if (Array.isArray(value)) {
            return value[Math.floor(Math.random() * value.length)];
          }
          return value || getFallbackResponse();
        }
      }
    }

    return getFallbackResponse();
  }

  function getFallbackResponse() {
    return `I'm not sure about that. Try asking about:

• **Pricing & plans**
• **Our 7 indicators**
• **How to get started**
• **Refund policy**
• **TradingView compatibility**

Or check our [comprehensive FAQ →](/faq.html) with 40+ detailed questions.

Email: support@signalpilot.io`;
  }

  // ========================================
  // UI CREATION
  // ========================================

  function createChatbot() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'sp-chatbot-toggle';
    toggle.setAttribute('aria-label', 'Open chatbot');
    // Windows needs emoji (same pattern as theme toggle), Mac uses inline SVG
    const isWindows = navigator.platform.indexOf('Win') > -1;
    if (isWindows) {
      toggle.innerHTML = `<span style="font-size:24px;line-height:1">❓</span>`;
    } else {
      toggle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }

    // Create window
    const window = document.createElement('div');
    window.className = 'sp-chatbot-window';
    window.innerHTML = `
      <div class="sp-chatbot-header">
        <div class="sp-chatbot-header-info">
          <div class="sp-chatbot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div class="sp-chatbot-title">Signal Pilot Assistant</div>
            <div class="sp-chatbot-status">AI Assistant • Automated responses</div>
          </div>
        </div>
        <button class="sp-chatbot-close" aria-label="Close chatbot">×</button>
      </div>

      <div class="sp-chatbot-messages" id="sp-chatbot-messages"></div>

      <div class="sp-chatbot-quick-actions" id="sp-chatbot-quick-actions">
        <button class="sp-chatbot-quick-btn" data-query="Do you have a free trial?">🎁 Free Trial</button>
        <button class="sp-chatbot-quick-btn" data-query="How much does it cost?">💰 Pricing</button>
        <button class="sp-chatbot-quick-btn" data-query="What is Pentarch?">⭐ Pentarch</button>
        <button class="sp-chatbot-quick-btn" data-query="Does it repaint?">🚫 Non-Repainting</button>
      </div>

      <div class="sp-chatbot-input-area">
        <textarea
          class="sp-chatbot-input"
          id="sp-chatbot-input"
          placeholder="Ask about pricing, products, or anything..."
          rows="1"
        ></textarea>
        <button class="sp-chatbot-send" id="sp-chatbot-send" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;

    // Force sticky positioning with inline styles
    toggle.style.position = 'fixed';
    toggle.style.bottom = '20px';
    toggle.style.right = '20px';
    toggle.style.zIndex = '10000';

    document.body.appendChild(toggle);
    document.body.appendChild(window);

    return { toggle, window };
  }

  function addMessage(content, isUser = false) {
    const container = document.getElementById('sp-chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `sp-chatbot-message ${isUser ? 'sp-chatbot-user-message' : 'sp-chatbot-bot-message'}`;

    const avatarSVG = isUser
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
           <circle cx="12" cy="7" r="4"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M12 2L2 7l10 5 10-5-10-5z"/>
           <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
         </svg>`;

    messageDiv.innerHTML = `
      <div class="sp-chatbot-avatar">${avatarSVG}</div>
      <div class="sp-chatbot-bubble">${parseMarkdown(content)}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById('sp-chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'sp-chatbot-message sp-chatbot-bot-message sp-chatbot-typing';
    typingDiv.innerHTML = `
      <div class="sp-chatbot-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="sp-chatbot-bubble">
        <div class="sp-chatbot-typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    return typingDiv;
  }

  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  function handleSend() {
    const input = document.getElementById('sp-chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    // Hide quick actions after first message
    const quickActions = document.getElementById('sp-chatbot-quick-actions');
    if (quickActions) {
      quickActions.style.display = 'none';
    }

    // Add user message
    addMessage(message, true);
    input.value = '';
    autoResizeTextarea(input);

    // Show typing indicator
    const typing = showTypingIndicator();

    // Process and respond
    setTimeout(() => {
      typing.remove();
      const response = processMessage(message);
      addMessage(response);
    }, config.typingDelay);
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function init() {
    const { toggle, window } = createChatbot();

    // Toggle button click
    toggle.addEventListener('click', () => {
      const isActive = window.classList.toggle('active');
      if (isActive) {
        const messages = document.getElementById('sp-chatbot-messages');
        if (messages.children.length === 0) {
          addMessage(knowledgeBase.greetings[0]);
        }
        // Only auto-focus on desktop to avoid triggering mobile keyboard
        if (window.innerWidth > 768) {
          document.getElementById('sp-chatbot-input').focus();
        }
      }
    });

    // Close button
    window.querySelector('.sp-chatbot-close').addEventListener('click', () => {
      window.classList.remove('active');
    });

    // Send button
    document.getElementById('sp-chatbot-send').addEventListener('click', handleSend);

    // Input handling
    const input = document.getElementById('sp-chatbot-input');
    input.addEventListener('input', (e) => autoResizeTextarea(e.target));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Quick action buttons
    document.querySelectorAll('.sp-chatbot-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        addMessage(query, true);
        const quickActions = document.getElementById('sp-chatbot-quick-actions');
        quickActions.style.display = 'none';
        const typing = showTypingIndicator();
        setTimeout(() => {
          typing.remove();
          addMessage(processMessage(query));
        }, config.typingDelay);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle.click();
      }
      // Escape to close
      if (e.key === 'Escape' && window.classList.contains('active')) {
        window.classList.remove('active');
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
