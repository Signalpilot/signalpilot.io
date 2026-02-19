#!/usr/bin/env python3
"""
Add HowTo schema to all language versions of the homepage.
"""
import os

howto_schema = '''  <!-- HowTo Schema for Getting Started Guide -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use Signal Pilot Indicators",
    "description": "Step-by-step guide to installing and using Signal Pilot non-repainting TradingView indicators for professional market cycle analysis.",
    "image": "https://www.signalpilot.io/preview.png",
    "step": [
      {
        "@type": "HowToStep",
        "position": "1",
        "name": "Get Signal Pilot Access",
        "description": "Purchase a Signal Pilot subscription from our website. Choose between monthly, yearly, or lifetime access. All plans include access to all 7 indicators and future updates.",
        "url": "https://www.signalpilot.io/#pricing"
      },
      {
        "@type": "HowToStep",
        "position": "2",
        "name": "Access Your Dashboard",
        "description": "Log into your Signal Pilot account dashboard to view your subscription details, access documentation, and get your unique API key for TradingView."
      },
      {
        "@type": "HowToStep",
        "position": "3",
        "name": "Add to TradingView",
        "description": "Open TradingView, search for Signal Pilot indicators in the community scripts library, and add your favorite indicators to your chart."
      },
      {
        "@type": "HowToStep",
        "position": "4",
        "name": "Customize Settings",
        "description": "Adjust indicator parameters for your preferred timeframes and markets (stocks, crypto, forex, indices, commodities)."
      },
      {
        "@type": "HowToStep",
        "position": "5",
        "name": "Start Trading with Confidence",
        "description": "Use the Pentarch cycle detection and other indicators to identify complete market cycles and execute informed trades across all markets."
      }
    ]
  }
  </script>

'''

def add_schema_to_file(filepath):
    """Add HowTo schema to a homepage file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if schema is already present
    if '"@type": "HowTo"' in content:
        print(f"⏭️  HowTo schema already present in {filepath}")
        return True

    # Find the insertion point (before Meta Pixel Code)
    insertion_marker = '  <!-- Meta Pixel Code -->'

    if insertion_marker in content:
        # Insert the HowTo schema
        new_content = content.replace(
            insertion_marker,
            howto_schema + insertion_marker
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        lang = filepath.split('/')[-2] if '/' in filepath else 'en'
        print(f"✓ Added HowTo schema to {lang}/index.html")
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
