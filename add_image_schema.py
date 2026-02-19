#!/usr/bin/env python3
"""
Add Image schema to all homepage versions for improved image search.
"""

image_schema = '''  <!-- Image Schema for Rich Image Results -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": "https://www.signalpilot.io/preview.png",
    "name": "Signal Pilot - Institutional-Grade TradingView Indicators",
    "description": "Non-repainting TradingView indicators with Pentarch™ cycle detection. Complete market cycle analysis: TD→IGN→WRN→CAP→BDN. Works on all markets.",
    "width": 1200,
    "height": 630,
    "creditText": "Signal Pilot Labs"
  }
  </script>

'''

def add_schema_to_file(filepath):
    """Add Image schema to a homepage file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if schema is already present
    if '"@type": "ImageObject"' in content:
        print(f"⏭️  Image schema already present in {filepath}")
        return True

    # Find the insertion point (before Performance hints or Structured Data marker)
    insertion_marker = '  <!-- Performance Optimization Hints -->'

    if insertion_marker not in content:
        # Try alternative insertion point
        insertion_marker = '  <!-- =======================================================================\n       STRUCTURED DATA'

    if insertion_marker in content:
        # Insert the Image schema
        new_content = content.replace(
            insertion_marker,
            image_schema + insertion_marker
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        lang = filepath.split('/')[-2] if '/' in filepath else 'en'
        print(f"✓ Added Image schema to {lang}/index.html")
        return True
    else:
        print(f"✗ Could not find insertion point in {filepath}")
        return False

# Process all language versions including English
languages = [''] + ['de', 'es', 'fr', 'ar', 'it', 'pt', 'ja', 'nl', 'ru', 'hu', 'tr']
base_path = '/home/user/signalpilot.io'
successful = 0
failed = 0

for lang in languages:
    filepath = f'{base_path}/{lang}/index.html' if lang else f'{base_path}/index.html'
    if add_schema_to_file(filepath):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")
