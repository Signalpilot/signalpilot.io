#!/usr/bin/env python3
"""
Add Organization schema to all language versions of the homepage.
"""
import os

organization_schema = '''  <!-- Organization Schema for Knowledge Graph -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Signal Pilot Labs",
    "url": "https://www.signalpilot.io",
    "logo": "https://www.signalpilot.io/monogram-square-favicon_192x192.png",
    "description": "Professional non-repainting TradingView indicators with Pentarch™ cycle detection for trading stocks, crypto, forex, and more.",
    "sameAs": [
      "https://www.linkedin.com/company/signal-pilot",
      "https://twitter.com/signalpilot",
      "https://www.trustpilot.com/review/signalpilot.io"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "url": "https://www.signalpilot.io",
      "contactType": "Customer Support",
      "availableLanguage": ["en", "de", "es", "fr", "ar", "it", "pt", "ja", "nl", "ru", "hu", "tr"]
    }
  }
  </script>

'''

def add_schema_to_file(filepath):
    """Add Organization schema to a homepage file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if schema is already present
    if '"@type": "Organization"' in content or '"name": "Signal Pilot Labs"' in content:
        print(f"⏭️  Organization schema already present in {filepath}")
        return True

    # Find the insertion point (after Organization/Society closing tag or before HowTo)
    insertion_marker = '  <!-- HowTo Schema for Getting Started Guide -->'

    if insertion_marker in content:
        # Insert the Organization schema
        new_content = content.replace(
            insertion_marker,
            organization_schema + insertion_marker
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        lang = filepath.split('/')[-2] if '/' in filepath else 'en'
        print(f"✓ Added Organization schema to {lang}/index.html")
        return True
    else:
        print(f"✗ Could not find insertion point in {filepath}")
        return False

# Process all language versions
languages = ['de', 'es', 'fr', 'ar', 'it', 'pt', 'ja', 'nl', 'ru', 'hu', 'tr']
base_path = '/home/user/signalpilot.io'
successful = 0
failed = 0

for lang in languages:
    filepath = f'{base_path}/{lang}/index.html'
    if add_schema_to_file(filepath):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")
