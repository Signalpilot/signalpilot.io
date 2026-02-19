#!/usr/bin/env python3
"""
Add BreadcrumbList schema to policy pages.
"""

def get_breadcrumb_schema(page_name, page_url):
    """Generate BreadcrumbList schema for a page."""
    return f'''  <!-- BreadcrumbList Schema for Navigation -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.signalpilot.io/"
      }},
      {{
        "@type": "ListItem",
        "position": 2,
        "name": "{page_name}",
        "item": "https://www.signalpilot.io/{page_url}"
      }}
    ]
  }}
  </script>

'''

pages = {
    '/home/user/signalpilot.io/privacy.html': ('Privacy Policy', 'privacy.html'),
    '/home/user/signalpilot.io/terms.html': ('Terms of Service', 'terms.html'),
    '/home/user/signalpilot.io/refund.html': ('Refund Policy', 'refund.html'),
    '/home/user/signalpilot.io/manage-subscription.html': ('Manage Subscription', 'manage-subscription.html'),
}

for filepath, (page_name, page_url) in pages.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        continue

    # Check if BreadcrumbList already exists
    if 'BreadcrumbList' in content:
        print(f"⏭️  BreadcrumbList already present in {filepath}")
        continue

    # Insert before closing </head>
    breadcrumb_schema = get_breadcrumb_schema(page_name, page_url)
    new_content = content.replace('  </style>\n</head>', f'  </style>\n\n{breadcrumb_schema}</head>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✓ Added BreadcrumbList schema to {filepath}")

print("\n📊 BreadcrumbList schemas added")
