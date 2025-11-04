#!/bin/bash

# Convert Pentarch JPG images to WebP format
# Requires: webp package (install with: sudo apt-get install webp)

echo "Converting Pentarch images to WebP format..."
echo "Quality setting: 85 (good balance of size vs quality)"
echo ""

cd assets/images/pentarch || exit 1

for i in {1..9}; do
  if [ -f "${i}.jpg" ]; then
    echo "Converting ${i}.jpg to ${i}.webp..."
    cwebp -q 85 "${i}.jpg" -o "${i}.webp"

    if [ $? -eq 0 ]; then
      # Show file size comparison
      jpg_size=$(stat -f%z "${i}.jpg" 2>/dev/null || stat -c%s "${i}.jpg")
      webp_size=$(stat -f%z "${i}.webp" 2>/dev/null || stat -c%s "${i}.webp")
      savings=$((100 - (webp_size * 100 / jpg_size)))
      echo "✓ ${i}.webp created (${savings}% smaller)"
    else
      echo "✗ Failed to convert ${i}.jpg"
    fi
    echo ""
  else
    echo "⚠ ${i}.jpg not found, skipping..."
  fi
done

echo "Done! WebP images created."
echo ""
echo "Next steps:"
echo "1. git add assets/images/pentarch/*.webp"
echo "2. git commit -m 'Add WebP versions of Pentarch charts'"
echo "3. git push"
