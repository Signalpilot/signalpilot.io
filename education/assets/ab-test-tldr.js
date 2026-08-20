/**
 * A/B Test: TL;DR Placement
 * Variant A: TL;DR at top (current/control)
 * Variant B: TL;DR after first section (Part 1)
 * Version: 1.0
 * Date: November 5, 2025
 */

(function() {
  'use strict';

  // Configuration
  const TEST_NAME = 'tldr_placement';
  const VARIANT_SPLIT = 0.5; // 50/50 split

  // Check if user already has a variant assigned
  let variant = localStorage.getItem('ab_tldr_variant');

  if (!variant) {
    // Assign variant based on random split
    variant = Math.random() < VARIANT_SPLIT ? 'A' : 'B';
    localStorage.setItem('ab_tldr_variant', variant);

    // Log assignment (for debugging)
    console.log(`[A/B Test] Assigned to variant: ${variant}`);
  } else {
    console.log(`[A/B Test] Existing variant: ${variant}`);
  }

  // Track variant assignment
  if (window.plausible) {
    plausible('AB Test Assignment', {
      props: {
        test: TEST_NAME,
        variant: variant,
        lesson: document.querySelector('h1.headline')?.textContent?.trim() || 'Unknown'
      }
    });
  }

  // Apply variant B (move TL;DR)
  if (variant === 'B') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyVariantB);
    } else {
      applyVariantB();
    }
  }

  function applyVariantB() {
    const tldr = document.querySelector('details');
    if (!tldr) {
      console.warn('[A/B Test] TL;DR element not found');
      return;
    }

    // Find the first H2 in the prose section
    const firstH2 = document.querySelector('.prose h2');
    if (!firstH2) {
      console.warn('[A/B Test] First H2 not found');
      return;
    }

    // Find the section break after the first H2 (if exists)
    let insertionPoint = firstH2;
    let currentElement = firstH2.nextElementSibling;

    // Look for next section break or H2
    while (currentElement) {
      if (currentElement.classList?.contains('section-break') ||
          currentElement.tagName === 'H2') {
        insertionPoint = currentElement;
        break;
      }
      currentElement = currentElement.nextElementSibling;
    }

    // Move TL;DR after the insertion point
    if (insertionPoint && insertionPoint.parentNode) {
      insertionPoint.parentNode.insertBefore(tldr, insertionPoint.nextSibling);
      console.log('[A/B Test] TL;DR moved to after first section (Variant B)');

      // Add a visual indicator for testing (remove in production)
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        tldr.style.border = '2px dashed orange';
        tldr.title = 'A/B Test: Variant B (TL;DR moved)';
      }
    }
  }

  // Track TL;DR interactions with variant info
  const tldrElement = document.querySelector('details');
  if (tldrElement) {
    let openTime = null;

    tldrElement.addEventListener('toggle', function() {
      if (this.open) {
        openTime = Date.now();

        if (window.plausible) {
          plausible('TL;DR Opened', {
            props: {
              ab_variant: variant,
              test: TEST_NAME,
              lesson: document.querySelector('h1.headline')?.textContent?.trim() || 'Unknown'
            }
          });
        }

        console.log(`[A/B Test] TL;DR opened (Variant ${variant})`);
      } else if (openTime) {
        const timeSpent = Math.round((Date.now() - openTime) / 1000);

        if (window.plausible && timeSpent >= 2) {
          plausible('TL;DR Read Time', {
            props: {
              seconds: timeSpent,
              ab_variant: variant,
              test: TEST_NAME
            }
          });
        }

        openTime = null;
      }
    });
  }

  // Track scroll depth with variant info (for completion comparison)
  let maxScroll = 0;
  const completionThreshold = 90;
  let completionTracked = false;

  window.addEventListener('scroll', () => {
    if (completionTracked) return;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      if (maxScroll >= completionThreshold && !completionTracked && window.plausible) {
        completionTracked = true;

        plausible('Lesson Completion', {
          props: {
            ab_variant: variant,
            test: TEST_NAME,
            lesson: document.querySelector('h1.headline')?.textContent?.trim() || 'Unknown'
          }
        });

        console.log(`[A/B Test] Lesson completion tracked (Variant ${variant})`);
      }
    }
  }, { passive: true });

  // Track session exit with variant info
  window.addEventListener('beforeunload', () => {
    if (window.plausible) {
      plausible('Session Exit', {
        props: {
          ab_variant: variant,
          test: TEST_NAME,
          max_scroll: maxScroll,
          lesson: document.querySelector('h1.headline')?.textContent?.trim() || 'Unknown'
        }
      });
    }
  });

  console.log('[A/B Test] ✓ TL;DR placement test initialized');

})();
