/**
 * Remove title tooltips from sidebar navigation links
 * Prevents duplicate text appearing on hover in mobile navigation
 *
 * USAGE: Add this file to your HTML before </body> tag:
 * <script src="assets/remove-tooltips.js"></script>
 *
 * OR in mkdocs.yml:
 * extra_javascript:
 *   - assets/remove-tooltips.js
 */

(function() {
  'use strict';

  function removeTooltips() {
    // Remove title attributes from ALL sidebar links (mobile and desktop)
    const sidebarLinks = document.querySelectorAll('.md-sidebar .md-nav__link[title], .md-nav__link[title]');

    sidebarLinks.forEach(link => {
      // Store original title for accessibility if needed
      const originalTitle = link.getAttribute('title');

      // Remove the title attribute to prevent browser tooltips
      link.removeAttribute('title');

      // Keep aria-label for screen readers if title was meaningful
      if (originalTitle && !link.hasAttribute('aria-label')) {
        link.setAttribute('aria-label', originalTitle);
      }
    });

    console.log(`[Tooltip Fix] Removed ${sidebarLinks.length} title attributes from sidebar links`);
  }

  // Run immediately if DOM is ready
  function init() {
    removeTooltips();

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver(function(mutations) {
      let needsUpdate = false;

      mutations.forEach(mutation => {
        // Check if any new nodes were added with title attributes
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE &&
              (node.matches('.md-nav__link[title]') ||
               node.querySelector('.md-nav__link[title]'))) {
            needsUpdate = true;
          }
        });
      });

      if (needsUpdate) {
        removeTooltips();
      }
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['title']
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
