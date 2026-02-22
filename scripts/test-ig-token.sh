#!/bin/bash

# Test Instagram API Token Permissions using curl
# 
# Usage:
#   ./scripts/test-ig-token.sh YOUR_TOKEN_HERE
#   ./scripts/test-ig-token.sh                  # Uses $INSTAGRAM_ACCESS_TOKEN env var

set -e

# Get token from argument or environment
TOKEN="${1:-$INSTAGRAM_ACCESS_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token provided"
  echo ""
  echo "Usage:"
  echo "  ./scripts/test-ig-token.sh YOUR_TOKEN_HERE"
  echo "  INSTAGRAM_ACCESS_TOKEN=YOUR_TOKEN ./scripts/test-ig-token.sh"
  exit 1
fi

# Detect token type
if [[ $TOKEN =~ ^(IGAAM|IGQVJ) ]]; then
  GRAPH_BASE="https://graph.instagram.com/v21.0"
  TOKEN_TYPE="Instagram"
else
  GRAPH_BASE="https://graph.facebook.com/v21.0"
  TOKEN_TYPE="Facebook"
fi

echo "═══════════════════════════════════════════════════════════════════"
echo "Instagram API Token Permissions Test"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Token Type: $TOKEN_TYPE"
echo "Token Prefix: ${TOKEN:0:20}..."
echo "Token Length: ${#TOKEN}"
echo "Graph Base: $GRAPH_BASE"
echo ""

# Test 1: Get user info
echo "1. Testing /me endpoint (User Info)"
echo "   URL: $GRAPH_BASE/me"
echo ""
curl -s "$GRAPH_BASE/me?fields=id,name,username,email&access_token=$TOKEN" | {
  if command -v jq &> /dev/null; then
    jq .
  else
    cat
  fi
}
echo ""

# Test 2: Get permissions
echo "2. Testing /me?permissions endpoint (Token Scopes)"
echo "   URL: https://graph.facebook.com/v21.0/me?permissions"
echo ""
curl -s "https://graph.facebook.com/v21.0/me?permissions&access_token=$TOKEN" | {
  if command -v jq &> /dev/null; then
    jq '.data[] | {permission: .permission, status: .status}'
  else
    cat
  fi
}
echo ""

# Test 3: Debug token
echo "3. Testing /debug_token endpoint (Token Metadata)"
echo "   URL: $GRAPH_BASE/debug_token"
echo ""
curl -s "$GRAPH_BASE/debug_token?input_token=$TOKEN&access_token=$TOKEN" | {
  if command -v jq &> /dev/null; then
    jq '.data | {is_valid, app_id, application, user_id, issued_at, expires_at, scopes}'
  else
    cat
  fi
}
echo ""

echo "═══════════════════════════════════════════════════════════════════"
echo "Done! Review output above to verify:"
echo ""
echo "✓ Token is valid (check /me response for user ID)"
echo "✓ All required scopes are granted (check /me?permissions)"
echo "✓ Token is not expired (check /debug_token expires_at)"
echo ""
echo "Required scopes for carousel posting:"
echo "  • instagram_business_basic"
echo "  • instagram_business_content_publish"
echo "  • instagram_content_publish (EAA)"
echo "  • pages_manage_posts (EAA)"
echo "═══════════════════════════════════════════════════════════════════"
