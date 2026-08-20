/**
 * TOC Scroll Spy + Auto-Scroll
 * Custom scroll spy that highlights TOC items based on scroll position
 * Also scrolls TOC container to show active link
 */
(function() {
  'use strict';

  let headings = [];
  let tocLinks = [];
  let tocContainer = null;

  // Find heading currently in view
  function getCurrentHeading() {
    const scrollTop = window.scrollY;
    const offset = 100; // Account for sticky header

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.offsetTop - offset <= scrollTop) {
        return heading.id;
      }
    }
    return headings[0]?.id || null;
  }

  // Update TOC active state
  function updateTocActive() {
    const currentId = getCurrentHeading();
    if (!currentId) return;

    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('md-nav__link--active');
      } else {
        link.classList.remove('md-nav__link--active');
      }
    });

    // Scroll TOC to show active link
    scrollActiveIntoView();
  }

  function scrollActiveIntoView() {
    if (!tocContainer) return;

    const activeLink = tocContainer.querySelector('.md-nav__link--active');
    if (!activeLink) return;

    const containerRect = tocContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    // Only scroll if link is out of view
    if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
      const containerCenter = containerRect.height / 2;
      const linkCenter = linkRect.top - containerRect.top + (linkRect.height / 2);
      const scrollOffset = linkCenter - containerCenter;

      tocContainer.scrollBy({
        top: scrollOffset,
        behavior: 'smooth'
      });
    }
  }

  function init() {
    // Get TOC container
    tocContainer = document.querySelector('.md-sidebar--secondary .md-sidebar__scrollwrap');
    if (!tocContainer) return;

    // Get all TOC links
    tocLinks = Array.from(tocContainer.querySelectorAll('.md-nav__link[href^="#"]'));
    if (tocLinks.length === 0) return;

    // Get all headings that have corresponding TOC links
    const tocIds = tocLinks.map(link => link.getAttribute('href').substring(1));
    headings = tocIds
      .map(id => document.getElementById(id))
      .filter(el => el !== null);

    if (headings.length === 0) return;

    // Listen to scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateTocActive();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    setTimeout(updateTocActive, 100);

    console.log('[TOC Scroll Spy] Initialized with', headings.length, 'headings');
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on page navigation
  if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
      setTimeout(init, 100);
    });
  }
})();
