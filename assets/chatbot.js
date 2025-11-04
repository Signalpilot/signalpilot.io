/**
 * Signal Pilot AI Chatbot
 * Custom chatbot for signalpilot.io
 * Helps users with pricing, products, FAQs, and navigation
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION & KNOWLEDGE BASE
  // ========================================

  const config = {
    name: 'Signal Pilot Assistant',
    version: '1.0.0',
    maxHistory: 20,
    maxBookmarks: 20,
    typingDelay: 800
  };

  const knowledgeBase = {
    greetings: [
      "Hey! I'm here to help you understand Signal Pilot. What would you like to know?",
      "Hi there! Ask me about pricing, our indicators, or how to get started.",
      "Hello! I can help you with product info, pricing, or answer any questions."
    ],

    pricing: {
      monthly: {
        price: "$99/month",
        description: "Flexible month-to-month billing. Cancel anytime. Includes all 7 elite indicators, email support (48h response), and all future updates.",
        link: "#pricing"
      },
      yearly: {
        price: "$699/year",
        description: "Save $489 vs monthly (best value). Priority email support (24h response), all 7 indicators, and lifetime updates.",
        link: "#pricing"
      },
      lifetime: {
        price: "$1,799-$3,499",
        description: "One-time payment for lifetime access. Includes private Discord community, founding member badge, feature voting rights, and everything in other plans forever.",
        link: "#pricing"
      },
      comparison: "All plans include the exact same 7 indicators. The only difference is billing frequency and support level. Monthly offers flexibility, Yearly saves you money (save $489/year), and Lifetime gives unlimited access forever with exclusive perks."
    },

    products: {
      pentarch: {
        name: "SP Pentarch",
        description: "Our flagship 5-phase cycle detection system. Maps complete market cycles: TD (Touchdown) → IGN (Ignition) → WRN (Warning) → CAP (Climax) → BDN (Breakdown). Works on any market, any timeframe.",
        features: ["5 event signals", "Regime bar colors", "Pilot line direction", "NanoFlow crosses"]
      },
      omnideck: {
        name: "SP OmniDeck",
        description: "Dashboard combining 10 systems into one overlay. Includes Bull Market Support Band, Running P&L tracker, and all components are independently toggleable.",
        features: ["10 systems combined", "Real-time P&L", "Dynamic support/resistance", "Customizable display"]
      },
      "volume-oracle": {
        name: "SP Volume Oracle",
        description: "Advanced volume analysis detecting divergences and buyer/seller pressure. Green ribbon shows accumulation, helps confirm price-volume relationships.",
        features: ["Volume divergence detection", "Buyer/seller pressure", "Price-volume confirmation"]
      },
      "plutus-flow": {
        name: "SP Plutus Flow",
        description: "Money flow analysis tracking smart money movements. Helps identify institutional buying and selling pressure.",
        features: ["Smart money tracking", "Flow analysis", "Institutional signals"]
      },
      "janus-atlas": {
        name: "SP Janus Atlas",
        description: "Multi-timeframe confirmation system showing convergence and divergence across timeframes. Increases signal confidence.",
        features: ["Multi-timeframe analysis", "Convergence signals", "Divergence detection"]
      },
      "augury-grid": {
        name: "SP Augury Grid",
        description: "Support and resistance detection with target price calculations. Helps identify key levels and price targets.",
        features: ["Dynamic S/R levels", "Target calculations", "Level strength scoring"]
      },
      "harmonic-oscillator": {
        name: "SP Harmonic Oscillator",
        description: "Composite momentum indicator combining 4 readings into a single line. Provides clear momentum signals.",
        features: ["4-in-1 momentum", "Composite signals", "Clear trend identification"]
      }
    },

    faqs: {
      repaint: "Zero repainting. Guaranteed. All signals finalize on candle close only. We audit every indicator for lookahead bias. If you can prove any repaint, we pay you $100 USD.",
      trial: "We offer a 7-day money-back guarantee, no questions asked. Full refund within 7 days of your first payment.",
      activation: "Access is typically granted within 1-8 hours after payment (usually under 2 hours). You'll receive a TradingView invite via email.",
      markets: "Works on ANY market and ANY timeframe on TradingView: stocks, forex, crypto, commodities, bonds, indices. From 1-minute to yearly charts.",
      tradingview: "Yes! You just need enough indicator slots. Free accounts get 3 slots (enough for Pentarch + 1-2 filters). Pro/Premium accounts get more slots and unlimited alerts.",
      updates: "All plans include every future indicator we launch, automatically and forever. You're buying into the entire Signal Pilot ecosystem.",
      support: "Monthly: Email support (48h response). Yearly: Priority email (24h response). Lifetime: Private Discord + priority support.",
      educational: "Signal Pilot is educational only. We provide technical analysis tools—not investment advice, trade recommendations, or guaranteed returns. You are solely responsible for your trading decisions.",
      refund: "Full refund within 7 days of your first payment, no questions asked. After 7 days, you can cancel anytime—no penalty. Card customers use self-service portal, PayPal customers manage via PayPal settings."
    },

    features: {
      nonrepainting: "100% non-repainting, audited signals that finalize on candle close only.",
      alerts: "Customizable alerts via TradingView: email, SMS, push notifications.",
      backtesting: "Full TradingView strategy tester compatibility for historical validation.",
      presets: "200+ preset configurations for different trading strategies.",
      documentation: "Comprehensive docs at docs.signalpilot.io with setup guides and examples.",
      education: "82 interactive lessons (250,000+ words) at education.signalpilot.io"
    },

    links: {
      pricing: "#pricing",
      demo: "#comparison-slider",
      faq: "#faq",
      why: "#why",
      inside: "#inside",
      docs: "https://docs.signalpilot.io/",
      education: "https://education.signalpilot.io/",
      roadmap: "/roadmap.html",
      refund: "/refund.html",
      privacy: "/privacy.html",
      terms: "/terms.html"
    }
  };

  // ========================================
  // PATTERN MATCHING & RESPONSES
  // ========================================

  const patterns = [
    // Greetings
    {
      regex: /^(hi|hello|hey|sup|yo|greetings)/i,
      response: () => knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)]
    },

    // Pricing queries
    {
      regex: /(how much|price|cost|pricing|plans|subscription)/i,
      response: () => {
        return `We have 3 plans:\n\n💳 **Monthly** - ${knowledgeBase.pricing.monthly.price}\n📅 **Yearly** - ${knowledgeBase.pricing.yearly.price} (save $489)\n♾️ **Lifetime** - ${knowledgeBase.pricing.lifetime.price}\n\n${knowledgeBase.pricing.comparison}\n\n[View pricing details](#pricing)`;
      }
    },

    // Monthly plan
    {
      regex: /(monthly|per month|month to month)/i,
      response: () => `**Monthly Plan**: ${knowledgeBase.pricing.monthly.price}\n\n${knowledgeBase.pricing.monthly.description}\n\n[See pricing](#pricing)`
    },

    // Yearly plan
    {
      regex: /(yearly|annual|per year)/i,
      response: () => `**Yearly Plan**: ${knowledgeBase.pricing.yearly.price}\n\n${knowledgeBase.pricing.yearly.description}\n\nYou save $489 compared to paying monthly!\n\n[See pricing](#pricing)`
    },

    // Lifetime plan
    {
      regex: /(lifetime|one.?time|forever)/i,
      response: () => `**Lifetime Plan**: ${knowledgeBase.pricing.lifetime.price}\n\n${knowledgeBase.pricing.lifetime.description}\n\nDynamic pricing: price increases as we sell more slots (only 350 total).\n\n[See pricing](#pricing)`
    },

    // Plan comparison
    {
      regex: /(difference|compare|which plan|what.*plan)/i,
      response: () => `${knowledgeBase.pricing.comparison}\n\n**Support levels:**\n- Monthly: Email (48h)\n- Yearly: Priority email (24h)\n- Lifetime: Discord + priority\n\n[Compare plans](#pricing)`
    },

    // Pentarch
    {
      regex: /(pentarch|what is pentarch)/i,
      response: () => {
        const p = knowledgeBase.products.pentarch;
        return `**${p.name}** - ${p.description}\n\n✨ Features:\n${p.features.map(f => `• ${f}`).join('\n')}\n\n[See it in action](#inside)`;
      }
    },

    // OmniDeck
    {
      regex: /(omnideck|omni deck)/i,
      response: () => {
        const p = knowledgeBase.products.omnideck;
        return `**${p.name}** - ${p.description}\n\n✨ Features:\n${p.features.map(f => `• ${f}`).join('\n')}\n\n[Learn more](#inside)`;
      }
    },

    // Volume Oracle
    {
      regex: /(volume oracle|volume)/i,
      response: () => {
        const p = knowledgeBase.products["volume-oracle"];
        return `**${p.name}** - ${p.description}\n\n✨ Features:\n${p.features.map(f => `• ${f}`).join('\n')}\n\n[Learn more](#inside)`;
      }
    },

    // Repainting
    {
      regex: /(repaint|repainting|does it repaint|lookahead)/i,
      response: () => `🚫 **${knowledgeBase.faqs.repaint}**\n\nWhat you see in history is exactly what you would have seen live.\n\n[Read our guarantee](#faq)`
    },

    // Free trial
    {
      regex: /(free trial|trial|demo|test|try)/i,
      response: () => `We don't have a traditional free trial, but we offer something better:\n\n**${knowledgeBase.faqs.trial}**\n\nYou can test everything risk-free for a full week!\n\n[Try the interactive demo](#comparison-slider) or [see pricing](#pricing)`
    },

    // Activation time
    {
      regex: /(how (fast|quick|long)|activation|access|when.*get)/i,
      response: () => `⚡ **${knowledgeBase.faqs.activation}**\n\nWe'll send you a TradingView invite-only link. Check your email and TradingView notifications.\n\n[Get started](#pricing)`
    },

    // Markets & timeframes
    {
      regex: /(markets?|timeframes?|what.*work|forex|stocks|crypto)/i,
      response: () => `📊 **${knowledgeBase.faqs.markets}**\n\nPentarch auto-adapts its 5-phase cycle detection to any timeframe.\n\n[See examples](#inside)`
    },

    // TradingView compatibility
    {
      regex: /(tradingview|free account|indicator slots)/i,
      response: () => `${knowledgeBase.faqs.tradingview}\n\n[See what's included](#pricing)`
    },

    // Updates
    {
      regex: /(update|future|new indicators)/i,
      response: () => `🎁 **${knowledgeBase.faqs.updates}**\n\nBuy once, benefit forever. No surprise charges.\n\n[See our roadmap](/roadmap.html)`
    },

    // Support
    {
      regex: /(support|help|contact)/i,
      response: () => `**Support by plan:**\n\n${knowledgeBase.faqs.support}\n\nEmail: [support@signalpilot.io](mailto:support@signalpilot.io)\n\n[Contact us](#faq)`
    },

    // Educational disclaimer
    {
      regex: /(financial advice|guarantee|profits|returns)/i,
      response: () => `⚠️ **${knowledgeBase.faqs.educational}**\n\nTrading involves substantial risk of loss. We provide tools for analysis, not financial advice.\n\n[Read full disclaimer](#faq)`
    },

    // Refund policy
    {
      regex: /(refund|money.?back|cancel|return)/i,
      response: () => `💰 **${knowledgeBase.faqs.refund}**\n\n[Full refund policy](/refund.html) | [See pricing](#pricing)`
    },

    // Features
    {
      regex: /(features|what.*included|what.*get)/i,
      response: () => `**Every plan includes:**\n\n✅ All 7 elite indicators\n✅ ${knowledgeBase.features.nonrepainting}\n✅ ${knowledgeBase.features.alerts}\n✅ ${knowledgeBase.features.backtesting}\n✅ ${knowledgeBase.features.presets}\n✅ Documentation & tutorials\n✅ All future updates\n\n[See details](#pricing)`
    },

    // Documentation
    {
      regex: /(docs|documentation|guide|tutorial)/i,
      response: () => `📚 **Documentation & Learning:**\n\n• [Setup Guides](${knowledgeBase.links.docs})\n• [Education Hub](${knowledgeBase.links.education}) - 82 lessons\n• [Video Tutorials](${knowledgeBase.links.docs})\n\nEverything you need to master the indicators!`
    },

    // Get started / Buy
    {
      regex: /(get started|buy|purchase|sign up|subscribe)/i,
      response: () => `🚀 **Ready to get started?**\n\n1. [Choose your plan](#pricing)\n2. Enter your TradingView username\n3. Complete payment (PayPal or card)\n4. Get access in 1-8 hours!\n\n7-day money-back guarantee on all plans.\n\n[View pricing](#pricing)`
    },

    // Navigation - Pricing
    {
      regex: /(show.*pricing|take.*pricing|go.*pricing|pricing page)/i,
      response: () => {
        scrollToSection('pricing');
        return "Taking you to pricing... 📊";
      }
    },

    // Navigation - Demo
    {
      regex: /(show.*demo|try.*demo|demo|comparison|before.*after)/i,
      response: () => {
        scrollToSection('comparison-slider');
        return "Here's our interactive demo! Drag the slider to compare. 👆";
      }
    },

    // Navigation - FAQ
    {
      regex: /(faq|questions|show.*faq)/i,
      response: () => {
        scrollToSection('faq');
        return "Taking you to FAQ... 💬";
      }
    },

    // Default fallback
    {
      regex: /.*/,
      response: () => `I'm not sure about that. Try asking about:\n\n• Pricing & plans\n• Our 7 indicators\n• How to get started\n• Refund policy\n• TradingView compatibility\n\nOr email us: [support@signalpilot.io](mailto:support@signalpilot.io)`
    }
  ];

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function saveToHistory(role, content) {
    const history = JSON.parse(localStorage.getItem('sp_chatbot_history') || '[]');
    history.push({ role, content, timestamp: Date.now() });
    if (history.length > config.maxHistory) {
      history.shift();
    }
    localStorage.setItem('sp_chatbot_history', JSON.stringify(history));
  }

  function loadHistory() {
    return JSON.parse(localStorage.getItem('sp_chatbot_history') || '[]');
  }

  function saveBookmark(content) {
    const bookmarks = JSON.parse(localStorage.getItem('sp_chatbot_bookmarks') || '[]');
    bookmarks.unshift({ content, timestamp: Date.now() });
    if (bookmarks.length > config.maxBookmarks) {
      bookmarks.pop();
    }
    localStorage.setItem('sp_chatbot_bookmarks', JSON.stringify(bookmarks));
  }

  function getBookmarks() {
    return JSON.parse(localStorage.getItem('sp_chatbot_bookmarks') || '[]');
  }

  // ========================================
  // MESSAGE PROCESSING
  // ========================================

  function processMessage(userInput) {
    const input = userInput.trim().toLowerCase();

    // Check for bookmark request
    if (input.includes('show bookmarks') || input.includes('my bookmarks')) {
      const bookmarks = getBookmarks();
      if (bookmarks.length === 0) {
        return "You haven't bookmarked any responses yet. Click the bookmark icon (🔖) on any message to save it!";
      }
      return `**Your Bookmarks:**\n\n${bookmarks.slice(0, 5).map((b, i) => `${i + 1}. ${b.content.substring(0, 100)}...`).join('\n\n')}`;
    }

    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(userInput)) {
        return pattern.response();
      }
    }

    // Fallback
    return patterns[patterns.length - 1].response();
  }

  // ========================================
  // UI CREATION
  // ========================================

  function createChatbot() {
    // Create button
    const button = document.createElement('button');
    button.className = 'chatbot-button';
    button.setAttribute('aria-label', 'Open chatbot');
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;

    // Create container
    const container = document.createElement('div');
    container.className = 'chatbot-container';
    container.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div class="chatbot-title">Signal Pilot Assistant</div>
            <div class="chatbot-status">Online • Typically replies instantly</div>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Close chatbot">✕</button>
      </div>

      <div class="chatbot-messages" id="chatbot-messages"></div>

      <div class="chatbot-suggestions" id="chatbot-suggestions"></div>

      <div class="chatbot-input-area">
        <input
          type="text"
          class="chatbot-input"
          id="chatbot-input"
          placeholder="Ask about pricing, products, or anything..."
          autocomplete="off"
        >
        <button class="chatbot-send" id="chatbot-send" aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(button);
    document.body.appendChild(container);

    return { button, container };
  }

  function addMessage(content, role = 'assistant', showBookmark = true) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${role}`;

    const avatar = role === 'assistant'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M12 2L2 7l10 5 10-5-10-5z"/>
           <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
         </svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
           <circle cx="12" cy="7" r="4"/>
         </svg>`;

    const bookmarkBtn = showBookmark && role === 'assistant'
      ? `<button class="chatbot-bookmark" aria-label="Bookmark this response" title="Save this response">🔖</button>`
      : '';

    messageDiv.innerHTML = `
      <div class="chatbot-avatar">${avatar}</div>
      <div class="chatbot-bubble">${formatMessage(content)}</div>
      ${bookmarkBtn}
    `;

    if (bookmarkBtn) {
      setTimeout(() => {
        const btn = messageDiv.querySelector('.chatbot-bookmark');
        btn.addEventListener('click', () => {
          saveBookmark(content);
          btn.textContent = '✓';
          btn.style.opacity = '0.5';
          setTimeout(() => {
            btn.textContent = '🔖';
            btn.style.opacity = '1';
          }, 1500);
        });
      }, 0);
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save to history
    saveToHistory(role, content);
  }

  function formatMessage(content) {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message assistant chatbot-typing';
    typingDiv.innerHTML = `
      <div class="chatbot-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="chatbot-bubble">
        <div class="chatbot-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
  }

  function createSuggestions() {
    const suggestionsContainer = document.getElementById('chatbot-suggestions');
    const suggestions = [
      "How much does it cost?",
      "What is Pentarch?",
      "Does it repaint?",
      "Show me pricing"
    ];

    suggestionsContainer.innerHTML = suggestions.map(s =>
      `<button class="chatbot-suggestion">${s}</button>`
    ).join('');

    suggestionsContainer.querySelectorAll('.chatbot-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        handleUserMessage(btn.textContent);
        suggestionsContainer.style.display = 'none';
      });
    });
  }

  function handleUserMessage(message) {
    if (!message || !message.trim()) return;

    const input = document.getElementById('chatbot-input');
    input.value = '';

    // Add user message
    addMessage(message, 'user', false);

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Process and respond
    setTimeout(() => {
      typingIndicator.remove();
      const response = processMessage(message);
      addMessage(response);
    }, config.typingDelay);
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function init() {
    const { button, container } = createChatbot();

    // Button click to toggle
    button.addEventListener('click', () => {
      const isActive = container.classList.toggle('active');
      if (isActive) {
        // Track chatbot opened (if analytics function exists)
        if (typeof trackEvent === 'function') {
          trackEvent('chatbot_opened', {});
        }

        // Show welcome message
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer.children.length === 0) {
          addMessage(knowledgeBase.greetings[0]);
          createSuggestions();
        }

        // Focus input
        document.getElementById('chatbot-input').focus();
      }
    });

    // Close button
    container.querySelector('.chatbot-close').addEventListener('click', () => {
      container.classList.remove('active');
    });

    // Send button
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    sendBtn.addEventListener('click', () => handleUserMessage(input.value));

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserMessage(input.value);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        button.click();
      }

      // Escape to close
      if (e.key === 'Escape' && container.classList.contains('active')) {
        container.classList.remove('active');
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
