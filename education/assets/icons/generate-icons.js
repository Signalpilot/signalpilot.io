#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, 'icon-512x512.png');
const sizes = [72, 96, 128, 144, 152, 384];

async function generateIcons() {
  logger.log('🎨 Generating PWA icons from 512x512 source...\n');

  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  for (const size of sizes) {
    const outputPath = path.join(__dirname, `icon-${size}x${size}.png`);

    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 5, g: 7, b: 13, alpha: 1 } // Match app background
        })
        .png()
        .toFile(outputPath);

      logger.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  logger.log('\n🎉 Icon generation complete!');
  logger.log('\nGenerated sizes:', sizes.map(s => `${s}x${s}`).join(', '));
  logger.log('Existing sizes: 192x192, 512x512');
  logger.log('\n✅ All PWA icon sizes are now available!');
}

generateIcons().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
