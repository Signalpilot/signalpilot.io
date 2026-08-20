#!/usr/bin/env node
/**
 * Generate proper favicon.ico from PNG sources
 *
 * This script creates a multi-resolution ICO file for proper Google indexing.
 * ICO files can contain multiple sizes (16x16, 32x32, 48x48) in one file.
 *
 * Requirements:
 * - npm install sharp ico-endec --save-dev
 *
 * Usage:
 * - node create-favicon.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Favicon ICO Generator for Signal Pilot Education Hub\n');

// Check if required packages are installed
try {
  require.resolve('sharp');
  require.resolve('ico-endec');
} catch (e) {
  console.error('❌ Missing dependencies. Please install:');
  console.error('   npm install sharp ico-endec --save-dev\n');
  process.exit(1);
}

const sharp = require('sharp');
const { encode } = require('ico-endec');

const SOURCE_FILE = path.join(__dirname, 'icon-512x512.png');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'favicon.ico');

async function generateFavicon() {
  console.log('📁 Source:', SOURCE_FILE);
  console.log('📁 Output:', OUTPUT_FILE);
  console.log('');

  // Check if source exists
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('❌ Source file not found:', SOURCE_FILE);
    console.error('   Please ensure icon-512x512.png exists in /assets/icons/');
    process.exit(1);
  }

  try {
    console.log('🖼️  Generating favicon sizes...');

    // Generate different sizes
    const sizes = [16, 32, 48];
    const images = [];

    for (const size of sizes) {
      console.log(`   ✓ Creating ${size}x${size}...`);
      const buffer = await sharp(SOURCE_FILE)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      images.push(buffer);
    }

    console.log('📦 Encoding to ICO format...');
    const icoBuffer = encode(images);

    console.log('💾 Writing favicon.ico...');
    fs.writeFileSync(OUTPUT_FILE, icoBuffer);

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`✅ Success! Generated ${OUTPUT_FILE} (${stats.size} bytes)`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Commit favicon.ico to your repository');
    console.log('   2. Deploy and verify at https://www.signalpilot.io/education/favicon.ico');
    console.log('   3. Request re-indexing in Google Search Console');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
    process.exit(1);
  }
}

generateFavicon();
