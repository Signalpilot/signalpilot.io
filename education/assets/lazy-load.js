// Lazy Loading for Images and Media
// Improves initial page load performance by deferring offscreen images

(function() {
  'use strict';

  // Check if native lazy loading is supported
  const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

  // Placeholder image (1x1 transparent pixel)
  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

  // Configuration
  const CONFIG = {
    rootMargin: '50px', // Start loading 50px before entering viewport
    threshold: 0.01,
    placeholderClass: 'lazy-placeholder',
    loadedClass: 'lazy-loaded',
    errorClass: 'lazy-error'
  };

  // Intersection Observer for lazy loading
  let observer = null;

  // Initialize lazy loading
  function init() {
    // Use native lazy loading if supported
    if (supportsNativeLazyLoading) {
      initNativeLazyLoading();
    } else {
      initIntersectionObserver();
    }

    // Also handle dynamically added images
    observeDOM();
  }

  // Native lazy loading (modern browsers)
  function initNativeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    images.forEach(img => {
      // Set loading attribute
      img.loading = 'lazy';

      // Move data-src to src
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }

      // Handle srcset
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        delete img.dataset.srcset;
      }

      img.classList.add(CONFIG.loadedClass);
    });

    logger.log('[LazyLoad] Using native lazy loading for', images.length, 'images');
  }

  // Intersection Observer (fallback for older browsers)
  function initIntersectionObserver() {
    if (!window.IntersectionObserver) {
      // Fallback: load all images immediately
      loadAllImages();
      return;
    }

    observer = new IntersectionObserver(onIntersection, {
      rootMargin: CONFIG.rootMargin,
      threshold: CONFIG.threshold
    });

    // Observe all images with data-src
    const images = document.querySelectorAll('img[data-src], iframe[data-src]');
    images.forEach(el => observer.observe(el));

    logger.log('[LazyLoad] Observing', images.length, 'elements with Intersection Observer');
  }

  // Handle intersection
  function onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        loadElement(element);
        observer.unobserve(element);
      }
    });
  }

  // Load a single element
  function loadElement(element) {
    const src = element.dataset.src;
    const srcset = element.dataset.srcset;

    if (!src) return;

    // Add placeholder class
    element.classList.add(CONFIG.placeholderClass);

    // Handle images
    if (element.tagName === 'IMG') {
      const img = new Image();

      img.onload = () => {
        element.src = src;
        if (srcset) element.srcset = srcset;

        element.classList.remove(CONFIG.placeholderClass);
        element.classList.add(CONFIG.loadedClass);

        // Clean up data attributes
        delete element.dataset.src;
        delete element.dataset.srcset;
      };

      img.onerror = () => {
        element.classList.remove(CONFIG.placeholderClass);
        element.classList.add(CONFIG.errorClass);
        logger.warn('[LazyLoad] Failed to load image:', src);
      };

      img.src = src;
      if (srcset) img.srcset = srcset;
    }

    // Handle iframes (for videos, embeds)
    else if (element.tagName === 'IFRAME') {
      element.src = src;
      element.classList.remove(CONFIG.placeholderClass);
      element.classList.add(CONFIG.loadedClass);
      delete element.dataset.src;
    }
  }

  // Fallback: load all images immediately
  function loadAllImages() {
    const elements = document.querySelectorAll('img[data-src], iframe[data-src]');
    elements.forEach(loadElement);
    logger.log('[LazyLoad] Fallback: loaded all', elements.length, 'elements immediately');
  }

  // Observe DOM for dynamically added images
  function observeDOM() {
    if (!window.MutationObserver) return;

    const domObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if the node itself is an image
            if ((node.tagName === 'IMG' || node.tagName === 'IFRAME') && node.dataset.src) {
              if (observer && !supportsNativeLazyLoading) {
                observer.observe(node);
              } else if (supportsNativeLazyLoading) {
                node.loading = 'lazy';
                node.src = node.dataset.src;
                if (node.dataset.srcset) node.srcset = node.dataset.srcset;
              }
            }

            // Check descendants
            const images = node.querySelectorAll?.('img[data-src], iframe[data-src]');
            images?.forEach(img => {
              if (observer && !supportsNativeLazyLoading) {
                observer.observe(img);
              } else if (supportsNativeLazyLoading) {
                img.loading = 'lazy';
                img.src = img.dataset.src;
                if (img.dataset.srcset) img.srcset = img.dataset.srcset;
              }
            });
          }
        });
      });
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Helper function to convert existing images to lazy-load
  function convertToLazyLoad(selector = 'img') {
    const images = document.querySelectorAll(selector);

    images.forEach(img => {
      if (img.src && !img.dataset.src && !img.classList.contains('no-lazy')) {
        img.dataset.src = img.src;
        img.src = PLACEHOLDER;

        if (img.srcset) {
          img.dataset.srcset = img.srcset;
          img.srcset = '';
        }

        if (observer && !supportsNativeLazyLoading) {
          observer.observe(img);
        } else if (supportsNativeLazyLoading) {
          img.loading = 'lazy';
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        }
      }
    });

    logger.log('[LazyLoad] Converted', images.length, 'images to lazy-load');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utility functions
  window.LazyLoad = {
    convertToLazyLoad,
    loadElement,
    loadAllImages
  };

})();
