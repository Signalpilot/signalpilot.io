/**
 * TOC Active Section Highlighter
 * Highlights the TOC link corresponding to the section currently in view
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }

  function initTOC() {
    const toc = document.querySelector('.toc');
    if (!toc) return;

    const tocLinks = toc.querySelectorAll('a[href^="#"]');
    if (tocLinks.length === 0) return;

    // Get all headings that have corresponding TOC links
    const headingIds = Array.from(tocLinks)
      .map(link => link.getAttribute('href').substring(1))
      .filter(id => id && id !== 'on-this-page');

    const headings = headingIds
      .map(id => document.getElementById(id))
      .filter(heading => heading !== null);

    if (headings.length === 0) return;

    // Create a map of heading IDs to TOC links
    const linkMap = new Map();
    tocLinks.forEach(link => {
      const id = link.getAttribute('href').substring(1);
      if (id && id !== 'on-this-page') {
        linkMap.set(id, link);
      }
    });

    // IntersectionObserver callback
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = linkMap.get(id);

        if (!link) return;

        if (entry.isIntersecting) {
          // Remove active class from all links
          tocLinks.forEach(l => l.classList.remove('active'));

          // Add active class to current link
          link.classList.add('active');
        }
      });
    };

    // Create observer with threshold
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when heading is 20% from top
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all headings
    headings.forEach(heading => {
      observer.observe(heading);
    });

    // Highlight first link on page load if at top
    if (window.scrollY < 200) {
      tocLinks.forEach(l => l.classList.remove('active'));
      if (tocLinks[0]) {
        tocLinks[0].classList.add('active');
      }
    }

    // Smooth scroll for TOC clicks
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const yOffset = -100; // Offset for sticky header
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });

            // Update active state immediately
            tocLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });
  }
})();
