#!/usr/bin/env python3
"""
Add og:image size and twitter:image tags to all pages that are missing them.
"""
import re
import os

def add_og_image_meta_tags(filepath):
    """Add og:image:width, og:image:height, and twitter:image tags."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    # Check if already has og:image:width
    if 'og:image:width' in content:
        print(f"⏭️  Meta tags already optimized in {filepath}")
        return True

    # Find og:image tag and add width/height after it
    og_image_pattern = r'(<meta property="og:image" content="https://www\.signalpilot\.io/preview\.png">)'
    og_replacement = r'\1\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">'

    if re.search(og_image_pattern, content):
        content = re.sub(og_image_pattern, og_replacement, content)
    else:
        print(f"⚠️  Could not find og:image tag in {filepath}")
        return False

    # Update twitter:card to summary_large_image and add twitter:image
    twitter_card_pattern = r'<meta name="twitter:card" content="summary">'
    twitter_replacement = r'<meta name="twitter:card" content="summary_large_image">'

    if re.search(twitter_card_pattern, content):
        content = re.sub(twitter_card_pattern, twitter_replacement, content)

    # Add twitter:image if missing
    if 'twitter:image' not in content:
        # Find the last twitter meta tag and add twitter:image after it
        twitter_pattern = r'(<meta name="twitter:description" content="[^"]+">)'
        twitter_img = r'\1\n  <meta name="twitter:image" content="https://www.signalpilot.io/preview.png">'
        content = re.sub(twitter_pattern, twitter_img, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Added OG image size and Twitter image to {filepath}")
    return True

# Process all pages
pages = ['terms.html', 'refund.html', 'affiliates.html', 'manage-subscription.html']
base_path = '/home/user/signalpilot.io'
successful = 0
failed = 0

for page in pages:
    filepath = f'{base_path}/{page}'
    if add_og_image_meta_tags(filepath):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")
