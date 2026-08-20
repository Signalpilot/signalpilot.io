// FILE: /assets/aurora.js  (Education hub)
// OPTIMIZED: Disabled video aurora for performance - CSS gradients only
(function(){
  function mountAurora(){
    // Video disabled for better performance
    // Using CSS-only aurora from sp-bg.js instead
    return;
  }
  // Keeping function for backwards compatibility but disabled
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAurora);
  } else mountAurora();
})();
