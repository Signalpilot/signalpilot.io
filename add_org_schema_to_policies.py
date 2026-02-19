#!/usr/bin/env python3
"""
Add Organization schema to policy pages for better knowledge graph integration.
"""

org_schema = '''  <!-- Organization Schema for Legal Entity -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Signal Pilot Labs",
    "url": "https://www.signalpilot.io",
    "logo": "https://www.signalpilot.io/monogram-square-favicon_192x192.png",
    "description": "Professional non-repainting TradingView indicators with Pentarch™ cycle detection",
    "sameAs": [
      "https://www.linkedin.com/company/signal-pilot",
      "https://twitter.com/signalpilot",
      "https://www.trustpilot.com/review/signalpilot.io"
    ]
  }
  </script>

'''

pages = [
    '/home/user/signalpilot.io/privacy.html',
    '/home/user/signalpilot.io/terms.html',
    '/home/user/signalpilot.io/refund.html',
    '/home/user/signalpilot.io/manage-subscription.html',
]

for filepath in pages:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        continue

    # Check if Organization schema already exists
    if '"@type": "Organization"' in content or '"name": "Signal Pilot Labs"' in content:
        print(f"⏭️  Organization schema already present in {filepath}")
        continue

    # Insert before BreadcrumbList schema
    if 'BreadcrumbList' in content:
        new_content = content.replace(
            '  <!-- BreadcrumbList Schema',
            org_schema + '  <!-- BreadcrumbList Schema'
        )
    else:
        # If no BreadcrumbList, insert before closing head
        new_content = content.replace(
            '  </style>\n\n  <!-- BreadcrumbList',
            f'  </style>\n\n{org_schema}  <!-- BreadcrumbList'
        )
        if new_content == content:
            # Try alternative pattern
            new_content = content.replace(
                '</style>\n</head>',
                f'</style>\n\n{org_schema}</head>'
            )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✓ Added Organization schema to {filepath}")

print("\n📊 Organization schemas added")
