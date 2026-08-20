/**
 * Blog Links System - SignalPilot Education Hub
 *
 * Fetches blog posts from blog.signalpilot.io and displays relevant articles
 * at the end of lessons based on topic matching.
 */

(function() {
  'use strict';

  const BLOG_API_URL = 'https://www.signalpilot.io/blog/api/articles.json';
  const CACHE_KEY = 'sp_blog_articles';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // Map indicators to priority blog articles for indicator-aware matching
  const INDICATOR_BLOG_MAP = {
    'Pentarch': ['how-to-trade-cycles-with-pentarch', 'why-markets-move-in-cycles', 'cycles-within-cycles', 'identifying-cycle-length'],
    'Janus Atlas': ['support-and-resistance-explained', 'how-smart-money-moves', 'the-only-pattern-that-repeats'],
    'Plutus Flow': ['accumulation-vs-distribution', 'volume-profile-basics'],
    'Volume Oracle': ['accumulation-vs-distribution', 'volume-profile-basics', 'how-smart-money-moves'],
    'Volume Oracle': ['accumulation-vs-distribution', 'volume-profile-basics'],
    'Harmonic Oscillator': ['when-to-ignore-divergence', 'the-confirmation-trap'],
    'Omnideck': ['inside-signal-pilot', 'multi-timeframe-confirmation'],
    'Augury Grid': ['multi-timeframe-confirmation', 'timeframe-selection']
  };

  // Fallback articles if fetch fails (synced from blog.signalpilot.io)
  const FALLBACK_ARTICLES = [
    {
      title: "Why Your Indicators Keep Failing (And What Actually Works)",
      url: "https://www.signalpilot.io/blog/articles/why-your-indicators-keep-failing/",
      description: "You've got RSI, MACD, Bollinger Bands, maybe a few moving averages. Your chart looks like a rainbow exploded on it. And somehow, you're still getting chopped up.",
      tags: ["indicators", "rsi", "beginner", "tradingview"]
    },
    {
      title: "The Repainting Problem: How Most TradingView Indicators Cheat",
      url: "https://www.signalpilot.io/blog/articles/the-repainting-problem/",
      description: "That indicator with the perfect backtest? The one that nails every top and bottom? It's lying to you. Here's how to spot the deception.",
      tags: ["indicators", "repainting", "tradingview", "backtesting"]
    },
    {
      title: "Why Backtesting Results Are Worthless (And What to Do Instead)",
      url: "https://www.signalpilot.io/blog/articles/why-backtesting-results-are-worthless/",
      description: "You found an indicator with a 78% win rate. Backtested over two years. Then you start trading it live and everything falls apart.",
      tags: ["indicators", "backtesting", "intermediate"]
    },
    {
      title: "The Confirmation Trap: Why More Indicators Mean Worse Results",
      url: "https://www.signalpilot.io/blog/articles/the-confirmation-trap/",
      description: "Your chart has four indicators. They rarely agree. When they do, the move is already over. Here's why adding more tools makes trading harder.",
      tags: ["indicators", "psychology", "intermediate"]
    },
    {
      title: "The Psychology of Getting Stopped Out (And Why It Keeps Happening)",
      url: "https://www.signalpilot.io/blog/articles/psychology-of-getting-stopped-out/",
      description: "Your analysis was perfect. Entry was clean. Then price tapped your stop to the tick and reversed. It feels personal. Here's what's really happening.",
      tags: ["psychology", "stop-loss", "risk-management", "intermediate"]
    },
    {
      title: "Why You Keep Breaking Your Own Trading Rules",
      url: "https://www.signalpilot.io/blog/articles/why-you-break-trading-rules/",
      description: "You have a trading plan. It's written down. And yet you took that trade you knew you shouldn't take. Here's the neuroscience behind it.",
      tags: ["psychology", "risk-management", "intermediate"]
    },
    {
      title: "The Real Reason Most Traders Blow Their First Account",
      url: "https://www.signalpilot.io/blog/articles/why-traders-blow-first-account/",
      description: "Early wins, growing confidence, increasing size, then everything gone. The sequence is predictable. Here's how to break the script.",
      tags: ["psychology", "risk-management", "beginner"]
    },
    {
      title: "What Profitable Traders Know That You Don't",
      url: "https://www.signalpilot.io/blog/articles/what-profitable-traders-know/",
      description: "They're not smarter than you. They don't have better indicators. But something is actually different about how they approach trading.",
      tags: ["psychology", "advanced"]
    },
    {
      title: "The Only Pattern That Actually Repeats in Markets",
      url: "https://www.signalpilot.io/blog/articles/the-only-pattern-that-repeats/",
      description: "Head and shoulders. Double tops. They don't work reliably. But there's one pattern that genuinely repeats on every timeframe, in every market.",
      tags: ["cycles", "market-structure", "intermediate"]
    },
    {
      title: "How Smart Money Actually Moves (And How to See It)",
      url: "https://www.signalpilot.io/blog/articles/how-smart-money-moves/",
      description: "\"Follow the smart money.\" But what does that actually mean? And how do you do it when they're trying to hide?",
      tags: ["cycles", "smart-money", "order-flow", "volume", "advanced"]
    },
    {
      title: "Why Markets Move in Cycles (And How to Profit From It)",
      url: "https://www.signalpilot.io/blog/articles/why-markets-move-in-cycles/",
      description: "Markets trend about 20-30% of the time. The rest? Cycles. Understanding why changes how you trade everything.",
      tags: ["cycles", "market-structure", "intermediate"]
    },
    {
      title: "Accumulation vs Distribution: Reading What the Chart Won't Tell You",
      url: "https://www.signalpilot.io/blog/articles/accumulation-vs-distribution/",
      description: "Two charts look identical. One precedes a massive rally, one precedes a devastating decline. Here's how to tell the difference.",
      tags: ["cycles", "volume", "smart-money", "liquidity", "advanced"]
    },
    {
      title: "The 3 Questions to Ask Before Every Trade",
      url: "https://www.signalpilot.io/blog/articles/3-questions-before-every-trade/",
      description: "Your indicator gives a signal. Your finger hovers over the buy button. Stop. Three questions need answers first.",
      tags: ["risk-management", "beginner"]
    },
    {
      title: "Stop Loss Placement: Why Yours Is Probably Wrong",
      url: "https://www.signalpilot.io/blog/articles/stop-loss-placement/",
      description: "Price hits your stop exactly, reverses, and hits your target without you. It's not conspiracy. Your methodology is flawed.",
      tags: ["stop-loss", "risk-management", "liquidity", "intermediate"]
    },
    {
      title: "Timeframe Selection: Why It Matters More Than Your Indicator",
      url: "https://www.signalpilot.io/blog/articles/timeframe-selection/",
      description: "The 5-minute chart says buy. The 4-hour says sell. The daily says wait. Who's right? Timeframe selection changes everything.",
      tags: ["timeframe", "indicators", "beginner"]
    },
    {
      title: "What TradingView Doesn't Tell You About Free Scripts",
      url: "https://www.signalpilot.io/blog/articles/tradingview-free-scripts/",
      description: "100,000+ free indicators. Reviews and likes to guide your choice. What could go wrong? A lot, actually.",
      tags: ["tradingview", "indicators", "repainting", "beginner"]
    },
    {
      title: "Position Sizing 101: The Math That Keeps You in the Game",
      url: "https://www.signalpilot.io/blog/articles/position-sizing-101/",
      description: "Most traders obsess over entries. The ones who survive obsess over position sizing. Here's the math that separates them.",
      tags: ["risk-management", "beginner"]
    },
    {
      title: "The 1% Rule: Why Professional Traders Risk So Little",
      url: "https://www.signalpilot.io/blog/articles/the-1-percent-rule/",
      description: "Risking 1% per trade sounds overly cautious. Here's why it's actually the most aggressive approach that still works.",
      tags: ["risk-management", "intermediate"]
    },
    {
      title: "When to Cut Losses Early (Before Your Stop Gets Hit)",
      url: "https://www.signalpilot.io/blog/articles/when-to-cut-losses-early/",
      description: "Your stop loss is your maximum risk. But sometimes the smart move is to exit before it's hit. Here's how to know the difference.",
      tags: ["risk-management", "stop-loss", "advanced"]
    },
    {
      title: "Rules-Based vs Discretionary Trading: Which Actually Works?",
      url: "https://www.signalpilot.io/blog/articles/rules-based-vs-discretionary/",
      description: "Some traders swear by rigid systems. Others trust their gut. Here's what actually matters - and why most traders get this wrong.",
      tags: ["psychology", "intermediate"]
    },
    {
      title: "Building Your First Trading System: A Step-by-Step Guide",
      url: "https://www.signalpilot.io/blog/articles/building-your-first-system/",
      description: "Most traders jump from setup to setup. Systematic traders build once and execute forever. Here's how to create your first real trading system.",
      tags: ["backtesting", "beginner"]
    },
    {
      title: "Backtesting Without Fooling Yourself: How to Test Strategies Honestly",
      url: "https://www.signalpilot.io/blog/articles/backtesting-without-fooling-yourself/",
      description: "Your backtest shows 80% wins. You trade it live and get destroyed. Here's why - and how to backtest in a way that actually predicts forward performance.",
      tags: ["backtesting", "indicators", "intermediate"]
    },
    {
      title: "Candlestick Basics: Reading Price Action Like a Pro",
      url: "https://www.signalpilot.io/blog/articles/candlestick-basics/",
      description: "Candlesticks are the language of price. Here's how to read them - and which patterns actually matter for trading.",
      tags: ["market-structure", "beginner"]
    },
    {
      title: "Support and Resistance Explained: The Foundation of Every Trade",
      url: "https://www.signalpilot.io/blog/articles/support-and-resistance-explained/",
      description: "Support and resistance are the foundation of technical analysis. Here's how to identify real levels - and how to trade them without getting chopped up.",
      tags: ["market-structure", "liquidity", "beginner"]
    },
    {
      title: "What Is a Trading Edge? (And How to Know If You Have One)",
      url: "https://www.signalpilot.io/blog/articles/what-is-a-trading-edge/",
      description: "Everyone talks about having an \"edge.\" But what does that actually mean? Here's how to understand, identify, and develop a real trading edge.",
      tags: ["psychology", "backtesting", "beginner"]
    }
  ];

  let articlesCache = null;

  // ========================================
  // Fetch & Cache Functions
  // ========================================

  /**
   * Get cached articles from localStorage
   */
  function getCachedArticles() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { articles, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return articles;
    } catch (e) {
      return null;
    }
  }

  /**
   * Save articles to localStorage cache
   */
  function cacheArticles(articles) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        articles,
        timestamp: Date.now()
      }));
    } catch (e) {
      // localStorage full or unavailable
    }
  }

  /**
   * Fetch articles from blog API
   */
  async function fetchArticles() {
    // Check cache first
    const cached = getCachedArticles();
    if (cached) {
      articlesCache = cached;
      return cached;
    }

    try {
      const response = await fetch(BLOG_API_URL, {
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Fetch failed');

      const data = await response.json();
      const articles = data.articles || [];

      // Cache for future use
      cacheArticles(articles);
      articlesCache = articles;
      return articles;

    } catch (error) {
      // CORS or network error - use fallback
      console.log('[Blog Links] Using fallback articles (API unavailable)');
      articlesCache = FALLBACK_ARTICLES;
      return FALLBACK_ARTICLES;
    }
  }

  // ========================================
  // Keyword Extraction
  // ========================================

  /**
   * Extract keywords from the current lesson page
   */
  function getLessonKeywords() {
    const keywords = new Set();

    // Check meta tags
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.content.split(',').forEach(t => keywords.add(t.trim().toLowerCase()));
    }

    // Analyze page content
    const prose = document.querySelector('.prose');
    if (prose) {
      const text = prose.textContent.toLowerCase();
      const keywordChecks = [
        'liquidity', 'volume', 'order flow', 'market structure', 'rsi',
        'risk management', 'psychology', 'institutional', 'smart money',
        'stop loss', 'timeframe', 'tradingview', 'indicators', 'repainting',
        'backtesting', 'trading rules', 'confirmation bias', 'cycles',
        'divergence', 'momentum', 'support', 'resistance'
      ];

      keywordChecks.forEach(keyword => {
        if (text.includes(keyword)) {
          keywords.add(keyword.replace(/\s+/g, '-'));
        }
      });
    }

    // Check URL for hints
    const path = window.location.pathname.toLowerCase();
    if (path.includes('liquidity')) keywords.add('liquidity');
    if (path.includes('volume')) keywords.add('volume');
    if (path.includes('flow')) keywords.add('order-flow');
    if (path.includes('structure')) keywords.add('market-structure');
    if (path.includes('risk')) keywords.add('risk-management');
    if (path.includes('psychology') || path.includes('bias')) keywords.add('psychology');
    if (path.includes('stop')) keywords.add('stop-loss');
    if (path.includes('repaint')) keywords.add('repainting');
    if (path.includes('indicator')) keywords.add('indicators');

    // Check lesson level
    const levelMeta = document.querySelector('meta[name="sp-level"]');
    if (levelMeta) {
      keywords.add(levelMeta.content.toLowerCase());
    }

    return [...keywords];
  }

  /**
   * Extract indicators mentioned in the current lesson
   */
  function getLessonIndicators() {
    const indicators = new Set();
    const indicatorNames = Object.keys(INDICATOR_BLOG_MAP);

    // Check meta tag for indicators
    const indicatorMeta = document.querySelector('meta[name="sp-indicators"]');
    if (indicatorMeta) {
      indicatorMeta.content.split(',').forEach(i => {
        const trimmed = i.trim();
        if (indicatorNames.includes(trimmed)) {
          indicators.add(trimmed);
        }
      });
    }

    // Scan page content for indicator names
    const prose = document.querySelector('.prose');
    if (prose) {
      const text = prose.textContent;
      indicatorNames.forEach(name => {
        if (text.includes(name)) {
          indicators.add(name);
        }
      });
    }

    // Check page title
    const title = document.querySelector('h1');
    if (title) {
      indicatorNames.forEach(name => {
        if (title.textContent.includes(name)) {
          indicators.add(name);
        }
      });
    }

    return [...indicators];
  }

  // ========================================
  // Article Matching
  // ========================================

  /**
   * Score an article based on keyword matches and indicator relevance
   */
  function scoreArticle(article, keywords, lessonIndicators) {
    if (!article.tags || !Array.isArray(article.tags)) return 0;

    let score = 0;
    const articleTags = article.tags.map(t => t.toLowerCase());

    keywords.forEach(keyword => {
      if (articleTags.includes(keyword)) {
        score += 2; // Direct match
      } else if (articleTags.some(tag => tag.includes(keyword) || keyword.includes(tag))) {
        score += 1; // Partial match
      }
    });

    // When scoring articles, check if lesson uses specific indicators
    // If article matches an indicator the lesson covers, boost score by 100
    for (const indicator of lessonIndicators) {
      const priorityArticles = INDICATOR_BLOG_MAP[indicator] || [];
      if (priorityArticles.some(slug => article.url.includes(slug))) {
        score += 100;
      }
    }

    return score;
  }

  /**
   * Get relevant blog posts based on lesson keywords and indicators
   */
  function getRelevantPosts(articles, keywords) {
    // Get indicators for this lesson
    const lessonIndicators = getLessonIndicators();

    // Score and sort articles
    const scored = articles
      .map(article => ({ ...article, score: scoreArticle(article, keywords, lessonIndicators) }))
      .filter(article => article.score > 0)
      .sort((a, b) => b.score - a.score);

    // Take top 3, or fallback to first 3 if no matches
    if (scored.length > 0) {
      return scored.slice(0, 3);
    }

    // No keyword matches - return general beginner-friendly articles
    return articles
      .filter(a => a.tags && a.tags.includes('beginner'))
      .slice(0, 2);
  }

  // ========================================
  // Rendering
  // ========================================

  /**
   * Render the blog links section HTML
   */
  function renderBlogLinks(posts) {
    if (posts.length === 0) return '';

    const postCards = posts.map(post => `
      <a href="${post.url}" class="blog-link-card" target="_blank" rel="noopener">
        <h4 class="blog-link-card__title">${post.title}</h4>
        <p class="blog-link-card__desc">${post.description}</p>
        <span class="blog-link-card__cta">Read on Blog &rarr;</span>
      </a>
    `).join('');

    return `
      <div class="blog-links-section">
        <div class="section-break"><span>Deeper Reading</span></div>
        <p class="blog-links-intro">Continue your learning with these related articles from the Signal Pilot blog:</p>
        <div class="blog-links-grid">
          ${postCards}
        </div>
      </div>
    `;
  }

  /**
   * Inject blog links into the page
   */
  function injectBlogLinks(articles) {
    // Don't run on non-lesson pages
    const article = document.querySelector('article, .article');
    if (!article) return;

    // Don't inject if already present
    if (document.querySelector('.blog-links-section')) return;

    // Get relevant posts
    const keywords = getLessonKeywords();
    const posts = getRelevantPosts(articles, keywords);

    if (posts.length === 0) return;

    // Find insertion point
    const relatedSection = Array.from(document.querySelectorAll('.section-break')).find(el =>
      el.textContent.toLowerCase().includes('related')
    );
    const discussionSection = document.querySelector('.discussion-section');
    const navArticle = document.querySelector('.nav-article');
    const prose = document.querySelector('.prose');

    const html = renderBlogLinks(posts);

    // Insert before related lessons, discussion, or nav
    if (relatedSection) {
      relatedSection.insertAdjacentHTML('beforebegin', html);
    } else if (discussionSection) {
      discussionSection.insertAdjacentHTML('beforebegin', html);
    } else if (navArticle) {
      navArticle.insertAdjacentHTML('beforebegin', html);
    } else if (prose) {
      prose.insertAdjacentHTML('beforeend', html);
    }
  }

  // ========================================
  // Initialization
  // ========================================

  async function init() {
    // Small delay to ensure page content is loaded
    await new Promise(resolve => setTimeout(resolve, 100));

    const articles = await fetchArticles();
    injectBlogLinks(articles);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.BlogLinks = {
    init,
    fetchArticles,
    getArticles: () => articlesCache
  };

})();
