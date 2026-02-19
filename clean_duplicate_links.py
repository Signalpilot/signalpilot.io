#!/usr/bin/env python3
"""
Clean up duplicate chronicle links in FAQ files.
Ensures each FAQ answer has exactly one link to a Chronicle page.
"""
import re
import os

def clean_duplicates(filepath):
    """Remove duplicate chronicle links from FAQ file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: find multiple consecutive chronicle links and keep only first
    # Look for pattern: </a> <a href="/chronicle/ (indicating duplicate)
    pattern = r'(<a href="/chronicle/[^"]*"[^>]*>[^<]*→</a>)\s*<a href="/chronicle/[^"]*"[^>]*>[^<]*→</a>'

    cleaned_content = re.sub(pattern, r'\1', content)

    if cleaned_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        return True
    return False

faq_files = [
    '/home/user/signalpilot.io/de/faq.html',
    '/home/user/signalpilot.io/es/faq.html',
    '/home/user/signalpilot.io/fr/faq.html',
    '/home/user/signalpilot.io/ar/faq.html',
    '/home/user/signalpilot.io/it/faq.html',
    '/home/user/signalpilot.io/pt/faq.html',
    '/home/user/signalpilot.io/ja/faq.html',
    '/home/user/signalpilot.io/nl/faq.html',
    '/home/user/signalpilot.io/ru/faq.html',
    '/home/user/signalpilot.io/hu/faq.html',
    '/home/user/signalpilot.io/tr/faq.html',
]

print("=== Cleaning Duplicate Links ===\n")

cleaned_count = 0
for filepath in faq_files:
    if os.path.exists(filepath):
        if clean_duplicates(filepath):
            lang = filepath.split('/')[-2]
            print(f"✓ {lang.upper()}: Duplicates removed")
            cleaned_count += 1

print(f"\n✓ Cleaned {cleaned_count} files")
