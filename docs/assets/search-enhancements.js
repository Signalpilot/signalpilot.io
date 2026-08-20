/**
 * Signal Pilot Docs - Search Enhancements
 * Improves search UX with better ranking, fuzzy matching, and result grouping
 */

(function() {
  'use strict';

  /* ========================================
     1. SEARCH ENHANCEMENT CONFIGURATION
     ======================================== */

  const SEARCH_CONFIG = {
    // Result grouping - group duplicate section titles
    groupDuplicates: true,

    // Fuzzy matching - handle typos (1-2 character difference)
    fuzzySearch: true,
    fuzzyThreshold: 2,

    // Boost factors for different result types
    boosts: {
      mainPage: 3.0,      // Main product pages (no hash)
      section: 1.0,       // Section headers (with hash)
      exactMatch: 2.5,    // Exact title match
      partialMatch: 1.0   // Partial match
    },

    // Minimum search length before triggering
    minSearchLength: 2,

    // Debounce delay (ms)
    debounceDelay: 150,

    // Maximum results to show
    maxResults: 20
  };

  /* ========================================
     2. SEARCH RESULT RANKING IMPROVEMENTS
     ======================================== */

  /**
   * Calculate enhanced relevance score for search results
   */
  function calculateEnhancedScore(result, searchTerms) {
    let score = result.score || 0;
    const location = result.location || '';
    const title = (result.title || '').toLowerCase();
    const text = (result.text || '').toLowerCase();

    // Boost main pages (no hash in location)
    if (!location.includes('#')) {
      score *= SEARCH_CONFIG.boosts.mainPage;
    } else {
      score *= SEARCH_CONFIG.boosts.section;
    }

    // Boost exact title matches
    const searchQuery = searchTerms.join(' ').toLowerCase();
    if (title === searchQuery) {
      score *= SEARCH_CONFIG.boosts.exactMatch;
    } else if (title.includes(searchQuery)) {
      score *= SEARCH_CONFIG.boosts.partialMatch;
    }

    // Boost if all search terms appear in title
    const allTermsInTitle = searchTerms.every(term =>
      title.includes(term.toLowerCase())
    );
    if (allTermsInTitle) {
      score *= 1.5;
    }

    // Penalize empty content
    if (!text || text.length < 50) {
      score *= 0.5;
    }

    // Boost based on content length (longer = more substantive)
    if (text.length > 500) {
      score *= 1.3;
    } else if (text.length > 200) {
      score *= 1.1;
    }

    return score;
  }

  /**
   * Group duplicate results by similar titles
   */
  function groupDuplicateResults(results) {
    if (!SEARCH_CONFIG.groupDuplicates) {
      return results;
    }

    const groups = new Map();

    results.forEach(result => {
      const title = (result.title || '').trim();

      // Check if this title already exists
      if (groups.has(title)) {
        const existing = groups.get(title);
        // Keep the higher scored result
        if (result.enhancedScore > existing.enhancedScore) {
          groups.set(title, result);
        }
      } else {
        groups.set(title, result);
      }
    });

    return Array.from(groups.values());
  }

  /**
   * Remove product name prefixes for cleaner comparison
   */
  function normalizeTitle(title) {
    return title
      .replace(/^(Pentarch|Janus|Omnideck|Augury|Volume Oracle|Harmonic|Plutus)\s+/i, '')
      .replace(/v\d+\.\d+\s*/gi, '')
      .trim()
      .toLowerCase();
  }

  /* ========================================
     3. FUZZY SEARCH IMPLEMENTATION
     ======================================== */

  /**
   * Calculate Levenshtein distance between two strings
   */
  function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check if query matches term with fuzzy threshold
   */
  function fuzzyMatch(query, term) {
    query = query.toLowerCase();
    term = term.toLowerCase();

    // Exact match
    if (term.includes(query) || query.includes(term)) {
      return true;
    }

    // Fuzzy match within threshold
    if (SEARCH_CONFIG.fuzzySearch) {
      const distance = levenshteinDistance(query, term);
      return distance <= SEARCH_CONFIG.fuzzyThreshold;
    }

    return false;
  }

  /* ========================================
     4. MULTI-WORD SEARCH LOGIC
     ======================================== */

  /**
   * Extract search terms from query
   */
  function extractSearchTerms(query) {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length >= 2) // Ignore single chars
      .map(term => term.replace(/[^\w\s]/g, '')); // Remove punctuation
  }

  /**
   * Check if result matches all search terms
   */
  function matchesAllTerms(result, searchTerms) {
    const title = (result.title || '').toLowerCase();
    const text = (result.text || '').toLowerCase();
    const combined = title + ' ' + text;

    return searchTerms.every(term =>
      combined.includes(term) ||
      (SEARCH_CONFIG.fuzzySearch && fuzzyMatchInText(term, combined))
    );
  }

  /**
   * Fuzzy match term within text
   */
  function fuzzyMatchInText(term, text) {
    const words = text.split(/\s+/);
    return words.some(word => fuzzyMatch(term, word));
  }

  /* ========================================
     5. SEARCH RESULT ENHANCEMENT INTERCEPTOR
     ======================================== */

  let originalSearchFunction = null;
  let debounceTimer = null;

  /**
   * Enhanced search result processor
   */
  function enhanceSearchResults(results, query) {
    if (!results || results.length === 0) {
      return results;
    }

    const searchTerms = extractSearchTerms(query);

    // Filter results to match ALL search terms
    let filteredResults = results.filter(result =>
      matchesAllTerms(result, searchTerms)
    );

    // Calculate enhanced scores
    filteredResults = filteredResults.map(result => ({
      ...result,
      enhancedScore: calculateEnhancedScore(result, searchTerms)
    }));

    // Sort by enhanced score
    filteredResults.sort((a, b) => b.enhancedScore - a.enhancedScore);

    // Group duplicates
    if (SEARCH_CONFIG.groupDuplicates) {
      filteredResults = groupDuplicateResults(filteredResults);
    }

    // Limit results
    filteredResults = filteredResults.slice(0, SEARCH_CONFIG.maxResults);

    return filteredResults;
  }

  /**
   * Intercept and enhance search functionality
   */
  function interceptSearch() {
    // Wait for search component to be ready
    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) {
      console.warn('[SP Search] Search input not found, retrying...');
      setTimeout(interceptSearch, 100);
      return;
    }

    console.log('[SP Search] Search input found, attaching handlers');

    // Add custom search event handler with debouncing
    searchInput.addEventListener('input', function(e) {
      clearTimeout(debounceTimer);

      const query = e.target.value;

      console.log(`[SP Search] Input event: "${query}" (${query.length} chars)`);

      if (query.length < SEARCH_CONFIG.minSearchLength) {
        console.log('[SP Search] Query too short, skipping');
        return;
      }

      debounceTimer = setTimeout(() => {
        console.log(`[SP Search] Processing query: "${query}"`);
        enhanceSearchUI(query);

        // Check if results are present
        setTimeout(() => {
          const resultList = document.querySelector('.md-search-result__list');
          const meta = document.querySelector('.md-search-result__meta');
          if (resultList) {
            console.log('[SP Search] Result list HTML:', resultList.innerHTML.substring(0, 200));
          }
          if (meta) {
            console.log('[SP Search] Meta text:', meta.textContent);
          }
        }, 500);
      }, SEARCH_CONFIG.debounceDelay);
    });

    // Monitor search results and enhance them
    observeSearchResults();
  }

  /* ========================================
     6. SEARCH UI ENHANCEMENTS
     ======================================== */

  /**
   * Observe search results and enhance display
   */
  function observeSearchResults() {
    const searchResultContainer = document.querySelector('.md-search-result');
    if (!searchResultContainer) {
      console.warn('[SP Search] Search result container not found, retrying...');
      setTimeout(observeSearchResults, 100);
      return;
    }

    console.log('[SP Search] Observing search results container');

    // Use MutationObserver to watch for result updates
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log('[SP Search] Results changed, enhancing display');
          enhanceResultDisplay();

          // Debug: Log result count
          const results = document.querySelectorAll('.md-search-result__item');
          console.log(`[SP Search] Found ${results.length} results to display`);
        }
      });
    });

    observer.observe(searchResultContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  /**
   * Enhance search result display
   */
  function enhanceResultDisplay() {
    const results = document.querySelectorAll('.md-search-result__item');

    results.forEach((result, index) => {
      // Add result index for styling
      result.dataset.resultIndex = index;

      // Highlight main page results
      const link = result.querySelector('a');
      if (link && link.href && !link.href.includes('#')) {
        result.classList.add('sp-search-main-page');
      }

      // Add context hints for section results
      if (link && link.href && link.href.includes('#')) {
        addContextHint(result, link);
      }
    });
  }

  /**
   * Add context hint showing which page a section belongs to
   */
  function addContextHint(resultElement, link) {
    // Check if hint already exists
    if (resultElement.querySelector('.sp-search-context')) {
      return;
    }

    const href = link.href;
    const match = href.match(/\/([^\/]+)\/#/);

    if (match) {
      const pageName = match[1]
        .replace(/-/g, ' ')
        .replace(/v\d+/gi, '')
        .trim();

      // Create context hint
      const hint = document.createElement('span');
      hint.className = 'sp-search-context';
      hint.textContent = `in ${pageName}`;

      // Insert after title
      const title = resultElement.querySelector('.md-search-result__title');
      if (title) {
        title.appendChild(hint);
      }
    }
  }

  /**
   * Enhance search UI with better feedback
   */
  function enhanceSearchUI(query) {
    const meta = document.querySelector('.md-search-result__meta');
    if (meta && query.length >= SEARCH_CONFIG.minSearchLength) {
      const terms = extractSearchTerms(query);
      if (terms.length > 1) {
        meta.setAttribute('data-search-hint',
          `Searching for all: ${terms.join(', ')}`);
      }
    }
  }

  /* ========================================
     7. MOBILE OPTIMIZATIONS
     ======================================== */

  /**
   * Mobile-specific enhancements
   */
  function addMobileOptimizations() {
    // Only apply on mobile/tablet
    if (!window.matchMedia('(max-width: 76.24em)').matches) {
      return;
    }

    const searchInput = document.querySelector('.md-search__input');
    if (!searchInput) return;

    // Prevent zoom on iOS when focusing search
    searchInput.style.fontSize = '16px';

    // Add touch-friendly clear button
    const clearButton = document.querySelector('.md-search__icon[type="reset"]');
    if (clearButton) {
      clearButton.style.minWidth = '44px';
      clearButton.style.minHeight = '44px';
    }

    // Improve touch targets for results
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 76.24em) {
        .md-search-result__item {
          min-height: 44px;
        }
        .md-search-result__link {
          padding: 12px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ========================================
     8. STYLING FOR ENHANCED SEARCH
     ======================================== */

  function addEnhancedStyles() {
    const style = document.createElement('style');
    style.id = 'sp-search-enhancements';
    style.textContent = `
      /* Main page results styling */
      .sp-search-main-page {
        border-left: 3px solid var(--md-primary-fg-color);
        background: var(--md-default-bg-color--light, rgba(0, 0, 0, 0.02));
      }

      .sp-search-main-page .md-search-result__title {
        font-weight: 600;
        color: var(--md-primary-fg-color);
      }

      /* Context hints for sections */
      .sp-search-context {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        font-size: 0.75em;
        font-weight: normal;
        color: var(--md-default-fg-color--light);
        background: var(--md-code-bg-color);
        border-radius: 3px;
        opacity: 0.8;
      }

      /* Search meta with hints */
      .md-search-result__meta[data-search-hint]::after {
        content: " · " attr(data-search-hint);
        color: var(--md-primary-fg-color);
        font-weight: 500;
      }

      /* Better result spacing */
      .md-search-result__item {
        transition: background-color 0.2s, border-color 0.2s;
      }

      .md-search-result__item:hover {
        background-color: var(--md-default-bg-color--light, rgba(0, 0, 0, 0.03));
      }

      /* Mobile optimizations */
      @media (max-width: 76.24em) {
        .sp-search-context {
          display: block;
          margin: 4px 0 0 0;
          font-size: 0.7em;
        }

        .md-search-result__link {
          line-height: 1.5;
        }

        .md-search__input {
          font-size: 16px !important; /* Prevent iOS zoom */
        }
      }

      /* Dark mode adjustments */
      [data-md-color-scheme="slate"] .sp-search-main-page {
        background: rgba(255, 255, 255, 0.05);
      }

      [data-md-color-scheme="slate"] .sp-search-context {
        background: rgba(255, 255, 255, 0.1);
      }
    `;

    document.head.appendChild(style);
  }

  /* ========================================
     9. INITIALIZATION
     ======================================== */

  function init() {
    // Add enhanced styles
    addEnhancedStyles();

    // Intercept search functionality
    interceptSearch();

    // Add mobile optimizations
    addMobileOptimizations();

    console.log('✅ Search enhancements loaded');
    console.log('   - Fuzzy matching enabled');
    console.log('   - Multi-word search active');
    console.log('   - Result grouping enabled');
    console.log('   - Mobile optimizations applied');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-apply on page navigation (for SPA-like behavior)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
      setTimeout(() => {
        addMobileOptimizations();
        observeSearchResults();
      }, 100);
    });
  }

})();
