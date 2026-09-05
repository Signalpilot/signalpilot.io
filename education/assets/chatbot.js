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
            beginner: `**Beginner Tier** (24 lessons) - How a market works, what it costs, what risk is

📚 [View All Beginner Lessons](/education/beginner.html)

**What you'll learn:**
• The order book, the spread and the market maker, derived from one problem
• What a fill is, and the five numbers a candle keeps out of its interval
• Why every position opens at a loss, and what the four charges are
• Expectancy, and how long before your own record can settle anything
• Position sizing, where the stop goes, and risk of ruin

**Key Lessons:**
• Lesson 1: What a Market Solves
• Lesson 10: Every Trade Starts Negative
• Lesson 17: Expectancy
• Lesson 22: Risk of Ruin

**Duration:** 6-12 min per lesson
**Best for:** Anyone who has not yet priced a round trip`,

            intermediate: `**Intermediate Tier** (28 lessons) - Reading the auction, and when the reading applies

📚 [View All Intermediate Lessons](/education/intermediate.html)

**What you'll learn:**
• Where liquidity rests, and why the displayed book is an advertisement
• Absorption, exhaustion, volume at price and hidden size
• Structure, order blocks and sweeps, with the definitions written down
• Regimes, timeframes, sessions, volatility, correlation and the macro cycle
• What an indicator is, and what it discards to be one

**Key Lessons:**
• Lesson 25: Where Liquidity Rests
• Lesson 32: Market Structure
• Lesson 36: Markets Have Modes
• Lesson 48: What an Indicator Is

**Duration:** 8-14 min per lesson
**Best for:** Traders who can already price their own costs`,

            advanced: `**Advanced Tier** (18 lessons) - Who else is in the book, and building a system

📚 [View All Advanced Lessons](/education/advanced.html)

**What you'll learn:**
• What the spread pays for, and the fee that routes your order
• What a millisecond is worth, and what a million shares takes
• What would have to happen, and backtesting treated as evidence
• The price of looking, the horizon you fix, the benchmark you chose
• Drawdown, capacity, the delay you remove, machine learning as a filter

**Key Lessons:**
• Lesson 53: What the Spread Is Paying For
• Lesson 63: Backtesting as Evidence
• Lesson 64: The Price of Looking
• Lesson 67: The Drawdown You Should Expect

**Duration:** 10-16 min per lesson
**Best for:** Traders building something they intend to test`,

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

**Pro tip:** Work one lesson a day, in order, and do the problems. Retrieval
is the only rehearsal that fixes anything. 🔥`,

            curriculum: `**SignalPilot Education Hub Curriculum:**

**4-Tier Progressive System:**

🟢 **Tier 1: Beginner** (24 lessons)
→ How a market works, what it costs, and what risk is

🟡 **Tier 2: Intermediate** (28 lessons)
→ Reading the auction, and when the reading applies

🔴 **Tier 3: Advanced** (18 lessons)
→ Who else is in the book, and building a system

⚫ **Tier 4: Professional** (15 lessons)
→ Portfolio, profession and specialisms

**Total:** 95 comprehensive lessons

📚 [View Full Curriculum](/)

**Recommended path:** in order, 1 to 85. Each lesson spends a figure an
earlier one measured, so the sequence is the argument.

**Time commitment:** ~6-16 min per lesson`,

            rsi: `**Oscillators and RSI:**

**Main Lesson:** [Lesson 51: Oscillators Under Regime](/education/curriculum/intermediate/51-oscillators-under-regime.html)

**Key Concepts:**
• An oscillator is a function of prices you already have, so it adds no information
• The same reading means different things in a trend and in a range
• What matters is what the oscillator discards, and how long it takes to discard it
• A threshold is a setting, not a measurement, and it has to be stated

**Related:** [Lesson 48: What an Indicator Is](/education/curriculum/intermediate/48-what-an-indicator-is.html), [Lesson 36: Markets Have Modes](/education/curriculum/intermediate/36-markets-have-modes.html)

**Common mistake:** Reading an extreme as a signal without first stating the regime, and without ever measuring how often the reading was right`,

            spread: `**The Spread:**

**Main Lesson:** [Lesson 4: The Spread Is the Price of Immediacy](/education/curriculum/beginner/04-the-spread.html)

**Key Concepts:**
• The spread is what immediacy costs, not a fee somebody charges you
• It is one of four charges, and lesson 10 prices all four on one trade
• Ranked against what an instrument moves in a day, the cost runs from a fifth of one per cent to 52 per cent
• Posting instead of crossing earns the spread, and lesson 58 prices what that gives away

**Related:** [Lesson 10: Every Trade Starts Negative](/education/curriculum/beginner/10-every-trade-starts-negative.html), [Lesson 53: What the Spread Is Paying For](/education/curriculum/advanced/53-market-makers-business.html)

**Where the numbers are:** Lesson 12 ranks instruments by cost as a share of daily movement`,

            automation: `**Automation and Execution:**

**Main Lesson:** [Lesson 69: The Delay You Remove](/education/curriculum/advanced/69-automation.html)

**Key Concepts:**
• Automation removes a delay; the question is what that delay was costing
• Slippage and fees belong in the backtest, because they are in the result
• A hard daily-loss limit binds before any other limit you set
• The pace you actually trade at is measurable, and it is slower than most plans assume

**Related:** [Lesson 75: Which Limit Binds First](/education/curriculum/professional/75-institutional-risk-controls.html), [Lesson 76: The Pace You Actually Trade At](/education/curriculum/professional/76-trading-day.html)

**Rule:** Deploy nothing whose failure you have not priced`,

            chatbot: `**About This Chatbot:**

I'm a pattern-matching assistant (no AI API needed!) built to help you navigate the 95 lessons.

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
• Knowledge base from all 95 lessons
• No data sent to external APIs
• Conversation history saved locally

**Pro tip:** Try asking full questions like "How does bid-ask spread work as a leading indicator?" for best results!`,

            start: `**Getting Started:**

**Recommended Learning Path:**

**Weeks 1-4: Beginner** (24 lessons, slots 1-24)
→ Start: [Lesson 1: What a Market Solves](/education/curriculum/beginner/01-what-a-market-solves.html)
→ Focus: the mechanism, what trading costs, and what risk actually is

**Weeks 5-9: Intermediate** (28 lessons, slots 25-52)
→ [Lesson 25: Where Liquidity Rests](/education/curriculum/intermediate/25-where-liquidity-rests.html)
→ Focus: reading the auction, and the context that decides when a reading applies

**Weeks 10-13: Advanced** (18 lessons, slots 53-70)
→ [Lesson 53: What the Spread Is Paying For](/education/curriculum/advanced/53-market-makers-business.html)
→ Focus: who else is in the book, and building a system that survives testing

**Weeks 14+: Professional** (15 lessons, slots 71-85)
→ [Lesson 71: How Many Bets You Are Carrying](/education/curriculum/professional/71-positions-are-one-position.html)
→ Focus: portfolio, the arithmetic of the profession, and four specialisms

**Time commitment:** 6-16 min per lesson
**Goal:** one lesson a day, in order. Each one spends what the last one measured.

**Quick actions:**
• [Browse All Lessons](/)
• [Search Lessons](/education/search.html)`,

            lessons: `**About Our Lessons:**

**Structure:** every lesson has the same seven parts, in this order:
• The claim - what the lesson finds, in its first 200 words, with a figure
• Prerequisites - what it spends, and which lesson measured it
• Development - the argument, built rather than asserted
• Worked example - one, with every number recomputable from the page
• Bounds - where the finding stops being true
• Problems - what to go and measure on your own data
• Sources - what the lesson leans on, and how

**Length:** 1,400 to 5,000 words. Length is an output, never a target.

**Style:** every figure on the page is derived on the page. No composite
trader, no invented track record, no P&L story. If a number is quoted from
an earlier lesson, that lesson printed it.

**Total:** 95 lessons across 4 tiers, in 11 modules

**What makes them different:**
✅ Every claim is falsifiable, and says what would disprove it
✅ Every figure is recomputed, not repeated
✅ Each lesson ends by promising what the next one finds, with its number
✅ The bounds are as long as the argument
✅ Available in 11 languages besides English

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

💡 **Tip:** Use the search bar at the top to search all 95 lessons, or browse by tier on the homepage.

**Quick links:**
• [Beginner Lessons](/education/beginner.html)
• [Intermediate Lessons](/education/intermediate.html)
• [Advanced Lessons](/education/advanced.html)
• [Search All Lessons](/education/search.html)`
        };
    }

    initPatterns() {
        // Matched in order, first hit wins -- so the specific keys must come
        // before the broad tier patterns, and no broad pattern may contain a
        // word that a specific one owns. Short codes and common substrings are
        // bounded so they cannot match inside an unrelated word.
        return [
            // Help / meta. "about" alone is far too broad: it swallowed every
            // "tell me about X" question, so ask for an explicit self-reference.
            { regex: /^(help|what can you do|commands|menu)$/i, key: 'help' },
            { regex: /(what are you|who are you|are you (a |an )?(bot|ai|human)|how (do|does) (you|this chat) work|about (you|this bot|the bot|this chatbot))/i, key: 'chatbot' },

            // Specific concepts, before the tiers that mention the same words
            { regex: /\b(rsi|relative strength|overbought|oversold)\b/i, key: 'rsi' },
            { regex: /(spread|bid.ask|bid ask|market maker|liquidity cost)/i, key: 'spread' },
            { regex: /\b(automation|automate|api|apis|kill switch|paper trad\w*|backtest\w*|webhook\w*|\bbots?\b)/i, key: 'automation' },
            { regex: /(progress|track my|completion|streak|badge)/i, key: 'progress' },

            // Getting started, before 'beginner' (which used to own "start")
            { regex: /(where (do|should) i (start|begin)|how do i start|getting started|get started|learning path|study plan|first lesson)/i, key: 'start' },

            // Curriculum shape
            { regex: /(curriculum|all lessons|lesson list|tiers|structure|syllabus)/i, key: 'curriculum' },

            // Tiers
            { regex: /(beginner|foundation|tier 1|tier 2|basics?)/i, key: 'beginner' },
            { regex: /(intermediate|order flow|microstructure|tier 3|tier 4)/i, key: 'intermediate' },
            { regex: /(advanced|professional|tier 5|tier 6|tier 7)/i, key: 'advanced' },
            { regex: /(lesson|lessons|course|content|what.*learn)/i, key: 'lessons' },

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
                                <p>I can help you navigate our 85 trading lessons, explain concepts, and guide your learning path!</p>
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
                `<strong>Hi! 👋</strong> I'm your SignalPilot Learning Assistant.<br><br>I can help you navigate our 85 trading lessons, explain concepts, and guide your learning path!<br><br><em>Try: "What should I learn first?" or "Explain RSI regime interpretation"</em>`,
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
