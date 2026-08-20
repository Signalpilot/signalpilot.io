/**
 * Simple Code Copy Button Enhancement
 * Adds copy buttons to code blocks that don't have them
 */

(function() {
  'use strict';

  function init() {
    // Find all code blocks without existing copy buttons
    const codeBlocks = document.querySelectorAll('.highlight');

    codeBlocks.forEach((block, index) => {
      // Skip if already has a copy button
      if (block.querySelector('.code-copy-btn')) {
        return;
      }

      // Create copy button
      const button = document.createElement('button');
      button.className = 'code-copy-btn';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
        </svg>
      `;

      // Position the button
      block.style.position = 'relative';
      button.style.position = 'absolute';
      button.style.top = '8px';
      button.style.right = '8px';
      button.style.padding = '6px 8px';
      button.style.background = 'rgba(0, 188, 212, 0.1)';
      button.style.border = '1px solid rgba(0, 188, 212, 0.3)';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.style.color = '#00bcd4';
      button.style.transition = 'all 0.2s';
      button.style.zIndex = '10';

      // Hover effect
      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(0, 188, 212, 0.2)';
        button.style.borderColor = 'rgba(0, 188, 212, 0.5)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(0, 188, 212, 0.1)';
        button.style.borderColor = 'rgba(0, 188, 212, 0.3)';
      });

      // Copy functionality
      button.addEventListener('click', async () => {
        const codeElement = block.querySelector('code');
        if (!codeElement) return;

        const text = codeElement.textContent;

        try {
          await navigator.clipboard.writeText(text);

          // Success feedback
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          `;
          button.style.color = '#4caf50';
          button.style.borderColor = 'rgba(76, 175, 80, 0.5)';

          // Reset after 2 seconds
          setTimeout(() => {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
              </svg>
            `;
            button.style.color = '#00bcd4';
            button.style.borderColor = 'rgba(0, 188, 212, 0.3)';
          }, 2000);

        } catch (err) {
          console.error('Failed to copy code:', err);

          // Error feedback
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          `;
          button.style.color = '#ff5722';
        }
      });

      // Add button to code block
      block.appendChild(button);
    });

    console.log('[Simple Code Copy] Added copy buttons to', codeBlocks.length, 'code blocks');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
