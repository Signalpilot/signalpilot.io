#!/usr/bin/env python3
"""
Add SoftwareApplication and Review schemas to all language versions of homepage.
"""
import re
import os

software_app_schema = '''  <!-- SoftwareApplication Schema for Enhanced SERP Features -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Signal Pilot",
    "description": "Professional non-repainting TradingView indicators suite with Pentarch™ cycle detection. Seven elite indicators for complete market cycle analysis across all markets and timeframes.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web-based (TradingView)",
    "downloadUrl": "https://www.signalpilot.io/#pricing",
    "screenshot": "https://www.signalpilot.io/preview.png",
    "offers": {
      "@type": "Offer",
      "price": "69",
      "priceCurrency": "USD",
      "url": "https://www.signalpilot.io/#pricing"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.0",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "3"
    },
    "author": {
      "@type": "Organization",
      "name": "Signal Pilot Labs",
      "url": "https://www.signalpilot.io"
    },
    "featureList": [
      "Pentarch: 5-phase market cycle detection",
      "OmniDeck: All-in-one market structure overlay",
      "Volume Oracle: Smart money flow tracking",
      "Janus Atlas: Institutional reference points",
      "Plutus Flow: Cumulative delta ribbon",
      "Augury Grid: Multi-symbol watchlist",
      "Harmonic Oscillator: 7-oscillator voting system",
      "100% non-repainting indicators",
      "Works on all markets and timeframes",
      "Comprehensive documentation and education"
    ]
  }
  </script>

'''

insertion_marker = '  </script>\n\n  <!-- Sticky buttons override - must load last to override theme-switcher.js -->'

def add_schema_to_file(filepath):
    """Add schema.org enhancements to a homepage file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if schema is already present
    if 'SoftwareApplication' in content:
        print(f"⏭️  Schema already present in {filepath}")
        return True

    # Find the insertion point (after VideoObject schema, before Sticky buttons)
    if insertion_marker in content:
        # Insert the SoftwareApplication schema
        new_content = content.replace(
            insertion_marker,
            software_app_schema + insertion_marker
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        lang = filepath.split('/')[-2] if '/' in filepath else 'en'
        print(f"✓ Added SoftwareApplication schema to {lang}/index.html")
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
