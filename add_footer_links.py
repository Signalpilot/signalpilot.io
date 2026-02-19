#!/usr/bin/env python3
"""
Add consistent footer navigation to all pages for better internal linking and UX.
"""
import re

enhanced_footer = '''  <footer>
    <div class="container">
      <div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-top: 1px solid var(--border); padding-top: 2rem;">
        <div>
          <p>&copy; 2025 Signal Pilot Labs. All rights reserved.</p>
        </div>
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;">
          <a href="/">Home</a>
          <a href="/faq.html">FAQ</a>
          <a href="/roadmap.html">Roadmap</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/refund.html">Refund</a>
          <a href="/affiliates.html">Affiliates</a>
        </div>
      </div>
    </div>
  </footer>
'''

pages = [
    ('/home/user/signalpilot.io/privacy.html', 'privacy'),
    ('/home/user/signalpilot.io/terms.html', 'terms'),
    ('/home/user/signalpilot.io/refund.html', 'refund'),
    ('/home/user/signalpilot.io/affiliates.html', 'affiliates'),
    ('/home/user/signalpilot.io/manage-subscription.html', 'manage-subscription'),
    ('/home/user/signalpilot.io/roadmap.html', 'roadmap'),
    ('/home/user/signalpilot.io/404.html', '404'),
    ('/home/user/signalpilot.io/thanks.html', 'thanks'),
    ('/home/user/signalpilot.io/trial-thanks.html', 'trial-thanks'),
]

for filepath, page_name in pages:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        continue

    # Check if enhanced footer already present
    if 'gap: 1.5rem' in content and 'Privacy' in content:
        print(f"⏭️  Enhanced footer already present in {page_name}.html")
        continue

    # Find the closing </body> tag and insert footer before it
    if '</body>' in content:
        new_content = content.replace('  </footer>\n\n</body>', enhanced_footer + '\n\n</body>')

        # If it didn't match that pattern, try finding just </body>
        if new_content == content:
            # Look for existing footer and replace it
            footer_pattern = r'  <footer>\s*<div class="container">\s*<p>[^<]*</p>\s*</div>\s*</footer>'
            if re.search(footer_pattern, content):
                new_content = re.sub(footer_pattern, enhanced_footer.rstrip(), content)
            else:
                # No footer found, add one before </body>
                new_content = content.replace('</body>', f'{enhanced_footer}</body>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ Added/updated footer in {page_name}.html")
    else:
        print(f"⚠️  Could not find </body> in {page_name}.html")

print("\n📊 Footers added/updated")
