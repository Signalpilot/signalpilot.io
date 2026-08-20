/**
 * SignalPilot Education Hub Chatbot
 * Simple pattern-matching chatbot (no API required)
 *
 * Adapted from signalpilot-docs with education-focused knowledge base
 */

class SignalPilotChatbot {
    constructor() {
        this.isOpen = false;
        this.messageHistory = [];
        this.knowledgeBase = this.initKnowledgeBase();
        this.patterns = this.initPatterns();

        this.init();
    }

    initKnowledgeBase() {
        return {
            // Lesson tiers
            beginner: `**Beginner Tier** (20 lessons) - Essential foundations for trading

📚 [View All Beginner Lessons](/beginner.html)

**What you'll learn:**
• Why RSI >70 isn't always overbought
• The truth about liquidity (it's engineered, not natural)
• Order flow basics and market microstructure
• Volume analysis fundamentals
• Regime-based indicator interpretation

**Key Lessons:**
• Lesson 1: The Liquidity Lie
• Lesson 2: Volume Doesn't Lie
• Lesson 5: RSI >70 Is Often a BUY Signal
• Lesson 6: Moving Averages Truth

**Duration:** 12-15 min per lesson
**Best for:** New traders or those learning institutional concepts`,

            intermediate: `**Intermediate Tier** (27 lessons) - Market microstructure & order flow

📚 [View All Intermediate Lessons](/intermediate.html)

**What you'll learn:**
• Bid-ask spread dynamics as a leading indicator
• Order book analysis (absorption vs exhaustion)
• Footprint charts and volume profiling
• Dark pool activity and institutional flow
• Market making and HFT mechanics

**Key Lessons:**
• Lesson 21: Bid-Ask Spread Dynamics
• Lesson 22: Order Book Analysis
• Lesson 24: Footprint Charts
• Lesson 25: Dark Pool Detection

**Duration:** 12-15 min per lesson
**Best for:** Traders ready for advanced order flow concepts`,

            advanced: `**Advanced Tier** (27 lessons) - Implementation & automation

📚 [View All Advanced Lessons](/advanced.html)

**What you'll learn:**
• Trading automation (APIs, bots, execution)
• Backtesting systems and walk-forward optimization
• Position sizing and risk management frameworks
• Kill switches and circuit breakers
• Multi-timeframe analysis

**Key Lessons:**
• Lesson 57: Trading Automation & APIs
• Advanced Risk Management
• System Development & Testing
• Professional Trading Infrastructure

**Duration:** 15-20 min per lesson
**Best for:** Experienced traders building systematic strategies`,

            progress: `**Your Progress:**

Your learning progress is automatically tracked as you read lessons!

**How tracking works:**
✅ Progress saved locally (no account needed)
✅ Syncs across devices (coming soon via Supabase)
✅ Completion badges unlocked per tier
✅ Streak tracking for daily lessons

**View your progress:**
• Home page shows overall completion %
• Each tier page shows lessons completed
• Green checkmarks = completed lessons

**Pro tip:** Complete at least 1 lesson/day to build a learning streak! 🔥`,

            curriculum: `**SignalPilot Education Hub Curriculum:**

**4-Tier Progressive System:**

🟢 **Tier 1: Beginner** (20 lessons)
→ Foundations, debunking myths, core concepts

🟡 **Tier 2: Intermediate** (27 lessons)
→ Order flow, microstructure, volume analysis

🔴 **Tier 3: Advanced** (27 lessons)
→ Institutional tactics, automation, algorithms

⚫ **Tier 4: Professional** (8 lessons)
→ Trading business, career paths, mastery

**Total:** 82 comprehensive lessons

📚 [View Full Curriculum](/)

**Recommended path:**
1. Start with Beginner (Lessons 1-20)
2. Move to Intermediate when comfortable
3. Advanced tier for implementation
4. Professional tier for career development

**Time commitment:** ~12-20 min per lesson`,

            rsi: `**RSI Lessons:**

**Main Lesson:** [Lesson 5: RSI >70 Is Often a BUY Signal](/curriculum/beginner/05-rsi-extremes.html)

**Key Concepts:**
• RSI >70 in uptrends = continuation (not reversal)
• RSI <30 in downtrends = continuation (not reversal)
• Regime determines interpretation (trending vs ranging)
• Harmonic Oscillator = 7-component voting system

**Real example:** Sarah lost $11,400 selling "overbought" RSI in trends, then made +$13,000 back using regime-based RSI interpretation

**Practical framework:**
1. Identify regime FIRST (trending or ranging)
2. Trending: RSI >70 = stay long, RSI pullback to 40-50 = add
3. Ranging: RSI >70 = sell, RSI <30 = buy

**Common mistake:** Fading RSI extremes without checking market regime`,

            spread: `**Bid-Ask Spread Lessons:**

**Main Lesson:** [Lesson 21: Bid-Ask Spread Dynamics](/curriculum/intermediate/21-bid-ask-spread-dynamics.html)

**Key Concepts:**
• Spread is a tax on impatience (not a fixed cost)
• Spread changes predict price moves (leading indicator)
• Spread widening = market makers see hidden flow
• Spread must be <10% of stop loss

**Real example:** Nina paid $45K in spread costs over 18 weeks (18 trades/day × $25/round-trip) without tracking it

**Practical rules:**
1. Calculate: Spread ÷ Stop Loss = % (must be <10%)
2. Use limit orders (save 85% on spread costs)
3. Reduce frequency if spread >10% of stop
4. Never trade illiquid hours (spread 4-8× wider)

**Spread as signal:** Widening without news = something's coming (market makers protecting themselves)`,

            automation: `**Trading Automation:**

**Main Lesson:** [Lesson 57: Trading Automation & APIs](/curriculum/advanced/57-trading-automation-apis.html)

**Key Concepts:**
• Automation amplifies mistakes (1 bug = 47 orders in 90 sec)
• Kill switches are mandatory (max loss, volatility filters, remote stop)
• Paper trading REQUIRED before live (2-4 weeks minimum)
• Slippage must be in backtests (real-world friction)

**Real example:** Mike lost $97K in 4 months due to: runaway loop ($23K), API bans ($15K), no kill switches ($38K), overfitting ($8K), slippage ($11K)

**7-Step Framework:**
1. Paper trade 2-4 weeks (find bugs with fake money)
2. Multi-layer kill switches (5 circuit breakers)
3. Order management (track IDs, prevent duplicates)
4. Rate limit management (stay at 70% of API max)
5. Walk-forward optimization (not curve-fitting)
6. Slippage/fees in backtest (-0.15% market orders)
7. Monitoring dashboard + alerts

**Rule:** Never deploy without kill switches`,

            chatbot: `**About This Chatbot:**

I'm a pattern-matching assistant (no AI API needed!) built to help you navigate the 82 lessons.

**I can help with:**
• Lesson recommendations ("What should I learn first?")
• Concept explanations ("Explain RSI regime interpretation")
• Finding lessons ("Lessons about spread costs")
• Progress tracking ("How do I track progress?")

**What I can't do:**
• Trade recommendations
• Real-time market analysis
• Account-specific advice
• Execute trades

**How I work:**
• Pattern matching (instant responses)
• Knowledge base from all 82 lessons
• No data sent to external APIs
• Conversation history saved locally

**Pro tip:** Try asking full questions like "How does bid-ask spread work as a leading indicator?" for best results!`,

            start: `**Getting Started:**

**Recommended Learning Path:**

**Week 1-3: Beginner Foundations** (20 lessons)
→ Start: [Lesson 1: The Liquidity Lie](/curriculum/beginner/01-the-liquidity-lie.html)
→ Focus: Debunking retail myths, understanding liquidity engineering

**Week 4-7: Intermediate Microstructure** (27 lessons)
→ [Lesson 21: Bid-Ask Spread Dynamics](/curriculum/intermediate/21-bid-ask-spread-dynamics.html)
→ Order flow, order books, footprint charts, institutional flow

**Week 8-11: Advanced Implementation** (27 lessons)
→ Automation, backtesting, algorithms, professional systems

**Week 12+: Professional Development** (8 lessons)
→ Trading business, career pathways, ongoing mastery

**Time commitment:** 12-20 min/lesson
**Goal:** 1 lesson per day (build a streak!)

**Quick actions:**
• [Browse All Lessons](/)
• [Search Lessons](/search.html)
• [View Progress](/) (homepage shows completion %)`,

            lessons: `**About Our Lessons:**

**Structure:** Each lesson includes:
• TL;DR Summary (3-minute version)
• Real trader case study (with P&L numbers)
• Multi-part content (5-7 sections)
• Checkpoints every 5-10 minutes
• Practice exercise (hands-on)
• Interactive quiz
• Downloadable checklist (PDF)

**Length:** 12-20 minutes per lesson (900-1000 lines)

**Style:** Professional trading education (institutional concepts, not retail hype)

**Total:** 82+ comprehensive lessons across 7 tiers

**What makes them different:**
✅ Story-driven (real trader mistakes)
✅ Data-heavy (actual P&L tables, metrics)
✅ Mistake-focused (learn from failures)
✅ Implementation details (checklists, frameworks)
✅ No fluff (institutional-grade content)

📚 [Browse All Lessons](/)`,

            help: `**I can help you with:**

📚 **Lessons:** "Beginner lessons" | "RSI lessons" | "Spread lessons"
🎯 **Getting Started:** "How do I start?" | "Learning path"
📊 **Concepts:** "Explain RSI" | "What is spread dynamics?"
🔧 **Features:** "Track progress" | "How does the chatbot work?"
🚀 **Automation:** "Trading automation" | "Kill switches"

**Try asking:**
• "What are the beginner lessons?"
• "Explain RSI regime interpretation"
• "How does bid-ask spread work?"
• "Show me automation lessons"
• "What should I learn first?"
• "How do I track my progress?"

**Popular topics:**
• RSI myths (Lesson 5)
• Spread costs (Lesson 21)
• Automation (Lesson 57)
• Volume analysis (Lesson 2)

Just type your question naturally! 💬`,

            default: `I'm not sure about that specific question.

Try asking about:
📚 **Lessons:** Beginner, Intermediate, Advanced tiers
🎯 **Concepts:** RSI, spreads, automation, volume, order flow
📊 **Getting Started:** Learning path, progress tracking
🔧 **Features:** Chatbot, search, curriculum

Type **"help"** to see all available topics!

💡 **Tip:** Use the search bar at the top to search all 82 lessons, or browse by tier on the homepage.

**Quick links:**
• [Beginner Lessons](/beginner.html)
• [Intermediate Lessons](/intermediate.html)
• [Advanced Lessons](/advanced.html)
• [Search All Lessons](/search.html)`
        };
    }

    initPatterns() {
        return [
            // Help/Meta
            { regex: /^(help|what can you do|commands|menu)$/i, key: 'help' },
            { regex: /(about|chatbot|how.*work|what are you)/i, key: 'chatbot' },

            // Lesson tiers
            { regex: /(beginner|foundation|start|tier 1|tier 2|basic)/i, key: 'beginner' },
            { regex: /(intermediate|order flow|microstructure|tier 3|tier 4)/i, key: 'intermediate' },
            { regex: /(advanced|automation|professional|tier 5|tier 6|tier 7)/i, key: 'advanced' },
            { regex: /(curriculum|all lessons|lesson list|tiers|structure)/i, key: 'curriculum' },
            { regex: /(lesson|lessons|course|content|what.*learn)/i, key: 'lessons' },

            // Specific concepts
            { regex: /(rsi|relative strength|overbought|oversold|70|30)/i, key: 'rsi' },
            { regex: /(spread|bid.ask|bid ask|market maker|liquidity cost)/i, key: 'spread' },
            { regex: /(automation|bot|api|kill switch|paper trad|backtest)/i, key: 'automation' },

            // Getting started
            { regex: /(start|begin|new|first|how do i|learning path|where.*start)/i, key: 'start' },
            { regex: /(progress|track|completion|streak|badge)/i, key: 'progress' },

            // Fallback
            { regex: /.*/, key: 'default' }
        ];
    }

    init() {
        this.createChatWidget();
        this.bindEvents();
        this.loadConversationHistory();
    }

    createChatWidget() {
        const chatbotHTML = `
            <div id="sp-chatbot-container" class="sp-chatbot-container sp-chatbot-closed">
                <!-- Chat Toggle Button -->
                <button id="sp-chatbot-toggle" class="sp-chatbot-toggle" aria-label="Open Learning Assistant">
                    <svg class="sp-chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    <svg class="sp-chatbot-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Chat Window -->
                <div id="sp-chatbot-window" class="sp-chatbot-window">
                    <!-- Header -->
                    <div class="sp-chatbot-header">
                        <div class="sp-chatbot-header-content">
                            <div class="sp-chatbot-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                </svg>
                            </div>
                            <div class="sp-chatbot-title">
                                <h3>Learning Assistant</h3>
                                <p class="sp-chatbot-status">Online • Ready to help</p>
                            </div>
                        </div>
                        <div class="sp-chatbot-actions">
                            <button class="sp-chatbot-action-btn" id="sp-chatbot-clear" title="Clear conversation">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Messages Container -->
                    <div id="sp-chatbot-messages" class="sp-chatbot-messages">
                        <div class="sp-chatbot-message sp-chatbot-bot-message">
                            <div class="sp-chatbot-message-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                                </svg>
                            </div>
                            <div class="sp-chatbot-message-content">
                                <p><strong>Hi! 👋</strong> I'm your SignalPilot Learning Assistant.</p>
                                <p>I can help you navigate our 82 trading lessons, explain concepts, and guide your learning path!</p>
                                <p><em>Try: "What should I learn first?" or "Explain RSI regime interpretation"</em></p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="sp-chatbot-quick-actions" id="sp-chatbot-quick-actions">
                        <button class="sp-chatbot-quick-btn" data-query="What should I learn first?">
                            🚀 Getting Started
                        </button>
                        <button class="sp-chatbot-quick-btn" data-query="Beginner lessons">
                            📚 Beginner
                        </button>
                        <button class="sp-chatbot-quick-btn" data-query="Explain RSI">
                            📊 RSI Myths
                        </button>
                        <button class="sp-chatbot-quick-btn" data-query="Trading automation">
                            🤖 Automation
                        </button>
                    </div>

                    <!-- Input Area -->
                    <div class="sp-chatbot-input-container">
                        <div class="sp-chatbot-input-wrapper">
                            <textarea
                                id="sp-chatbot-input"
                                class="sp-chatbot-input"
                                placeholder="Ask about lessons or concepts..."
                                rows="1"
                                aria-label="Message input"
                            ></textarea>
                            <button id="sp-chatbot-send" class="sp-chatbot-send-btn" aria-label="Send message">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="sp-chatbot-footer-text">
                            Powered by pattern matching • SignalPilot Education
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        this.elements = {
            container: document.getElementById('sp-chatbot-container'),
            toggle: document.getElementById('sp-chatbot-toggle'),
            window: document.getElementById('sp-chatbot-window'),
            messages: document.getElementById('sp-chatbot-messages'),
            input: document.getElementById('sp-chatbot-input'),
            sendBtn: document.getElementById('sp-chatbot-send'),
            clearBtn: document.getElementById('sp-chatbot-clear'),
            quickActions: document.getElementById('sp-chatbot-quick-actions')
        };
    }

    bindEvents() {
        // Toggle chat window
        this.elements.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleChat();
        });

        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter to send (Shift+Enter for new line)
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.elements.input.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });

        // Quick action buttons
        document.querySelectorAll('.sp-chatbot-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.currentTarget.dataset.query;
                this.elements.input.value = query;
                this.sendMessage();
            });
        });

        // Clear conversation
        this.elements.clearBtn.addEventListener('click', () => this.clearConversation());
    }

    toggleChat() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.elements.container.classList.remove('sp-chatbot-closed');
            this.elements.container.classList.add('sp-chatbot-open');
            // Only auto-focus on desktop, not mobile (prevents keyboard from opening on mobile)
            if (window.innerWidth > 768) {
                this.elements.input.focus();
            }
        } else {
            this.elements.container.classList.remove('sp-chatbot-open');
            this.elements.container.classList.add('sp-chatbot-closed');
        }
    }

    async sendMessage() {
        const userMessage = this.elements.input.value.trim();

        if (!userMessage) return;

        // Clear input
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';

        // Hide quick actions after first message
        if (this.elements.quickActions) {
            this.elements.quickActions.style.display = 'none';
        }

        // Add user message to chat
        this.addMessage(userMessage, 'user');

        // Add to history
        this.messageHistory.push({ role: 'user', content: userMessage });

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        // Simulate typing delay (800ms)
        setTimeout(() => {
            this.removeTypingIndicator(typingId);

            // Get bot response
            const response = this.getBotResponse(userMessage);

            // Add bot response
            this.addMessage(response, 'bot');

            // Add to history
            this.messageHistory.push({ role: 'assistant', content: response });

            // Save to localStorage
            this.saveConversationHistory();
        }, 800);
    }

    getBotResponse(userMessage) {
        const msg = userMessage.toLowerCase().trim();

        // Find matching pattern
        for (const pattern of this.patterns) {
            if (pattern.regex.test(msg)) {
                return this.knowledgeBase[pattern.key];
            }
        }

        return this.knowledgeBase.default;
    }

    addMessage(content, sender) {
        const messageHTML = `
            <div class="sp-chatbot-message sp-chatbot-${sender}-message">
                ${sender === 'bot' ? `
                    <div class="sp-chatbot-message-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </div>
                ` : ''}
                <div class="sp-chatbot-message-content">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;

        this.elements.messages.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Convert [text](url) to links
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener">$1</a>'
        );

        // Convert bare URLs to links
        formatted = formatted.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );

        return `<p>${formatted}</p>`;
    }

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingHTML = `
            <div id="${id}" class="sp-chatbot-message sp-chatbot-bot-message sp-chatbot-typing">
                <div class="sp-chatbot-message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                </div>
                <div class="sp-chatbot-message-content">
                    <div class="sp-chatbot-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        this.elements.messages.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    clearConversation() {
        if (confirm('Clear conversation history?')) {
            this.messageHistory = [];
            this.elements.messages.innerHTML = '';
            this.elements.quickActions.style.display = 'flex';
            localStorage.removeItem('sp-chatbot-history');

            // Re-add welcome message
            this.addMessage(
                `<strong>Hi! 👋</strong> I'm your SignalPilot Learning Assistant.<br><br>I can help you navigate our 82 trading lessons, explain concepts, and guide your learning path!<br><br><em>Try: "What should I learn first?" or "Explain RSI regime interpretation"</em>`,
                'bot'
            );
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('sp-chatbot-history', JSON.stringify(this.messageHistory.slice(-20)));
        } catch (e) {
            console.error('Failed to save conversation history:', e);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('sp-chatbot-history');
            if (saved) {
                this.messageHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load conversation history:', e);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.signalpilotChatbot = new SignalPilotChatbot();
    });
} else {
    window.signalpilotChatbot = new SignalPilotChatbot();
}
