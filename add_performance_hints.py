#!/usr/bin/env python3
"""
Add performance optimization hints to all homepage versions.
Includes DNS prefetch, preconnect, and link prefetch for better Core Web Vitals.
"""

performance_hints = '''  <!-- Performance Optimization Hints -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
  <link rel="dns-prefetch" href="https://gumroad.com">
  <link rel="dns-prefetch" href="https://www.trustpilot.com">
  <link rel="preconnect" href="https://cdn.tailwindcss.com">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">

  <!-- Prefetch important pages for faster navigation -->
  <link rel="prefetch" href="faq.html">
  <link rel="prefetch" href="privacy.html">
  <link rel="prefetch" href="roadmap.html">

'''

def add_hints_to_file(filepath):
    """Add performance hints to a homepage file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if hints are already present
    if 'dns-prefetch' in content and 'preconnect' in content:
        print(f"⏭️  Performance hints already present in {filepath}")
        return True

    # Find the insertion point (after OpenGraph, before Structured Data)
    insertion_marker = '  <!-- =======================================================================\n       STRUCTURED DATA - Product Schema Markup for Rich Snippets\n       ======================================================================= -->'

    if insertion_marker in content:
        # Insert the performance hints
        new_content = content.replace(
            insertion_marker,
            performance_hints + insertion_marker
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        lang = filepath.split('/')[-2] if '/' in filepath else 'en'
        print(f"✓ Added performance hints to {lang}/index.html")
        return True
    else:
        print(f"✗ Could not find insertion point in {filepath}")
        return False

# Process main English homepage
base_path = '/home/user/signalpilot.io'
filepath = f'{base_path}/index.html'
if add_hints_to_file(filepath):
    print(f"✓ Added performance hints to en/index.html")
else:
    print(f"✗ Failed to add performance hints to en/index.html")

# Process all language versions
languages = ['de', 'es', 'fr', 'ar', 'it', 'pt', 'ja', 'nl', 'ru', 'hu', 'tr']
successful = 1 if add_hints_to_file(f'{base_path}/index.html') else 0
failed = 0

for lang in languages:
    filepath = f'{base_path}/{lang}/index.html'
    if add_hints_to_file(filepath):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")
