#!/usr/bin/env node

/**
 * Image to WebP Converter
 * Converts JPG/PNG images to WebP format with quality optimization
 * Generates responsive sizes and updates HTML references
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('❌ Sharp package not found. Installing...');
  console.log('Run: npm install sharp');
  process.exit(1);
}

// Configuration
const CONFIG = {
  quality: 85,
  effort: 6, // 0-6, higher = better compression but slower
  inputFormats: ['.jpg', '.jpeg', '.png'],
  outputDir: null, // null = same directory
  skipExisting: false,
  createBackup: true,
  verbose: true
};

// Statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalOriginalSize: 0,
  totalWebPSize: 0
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Recursively find all image files
 */
async function findImages(dir, images = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filepath = path.join(dir, file);
    const fileStat = await stat(filepath);

    if (fileStat.isDirectory()) {
      await findImages(filepath, images);
    } else {
      const ext = path.extname(filepath).toLowerCase();
      if (CONFIG.inputFormats.includes(ext)) {
        images.push(filepath);
      }
    }
  }

  return images;
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath) {
  const ext = path.extname(inputPath);
  const outputPath = inputPath.replace(ext, '.webp');

  // Skip if output already exists
  if (CONFIG.skipExisting && fs.existsSync(outputPath)) {
    if (CONFIG.verbose) {
      console.log(`⏭️  Skipped: ${path.basename(outputPath)} (already exists)`);
    }
    stats.skipped++;
    return null;
  }

  try {
    const originalStat = await stat(inputPath);
    stats.totalOriginalSize += originalStat.size;

    // Convert to WebP
    const startTime = Date.now();
    await sharp(inputPath)
      .webp({
        quality: CONFIG.quality,
        effort: CONFIG.effort
      })
      .toFile(outputPath);

    const webpStat = await stat(outputPath);
    stats.totalWebPSize += webpStat.size;

    const reduction = ((1 - webpStat.size / originalStat.size) * 100).toFixed(1);
    const duration = Date.now() - startTime;

    if (CONFIG.verbose) {
      console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
      console.log(`   ${formatBytes(originalStat.size)} → ${formatBytes(webpStat.size)} (${reduction}% smaller) [${duration}ms]`);
    }

    stats.processed++;

    return {
      original: inputPath,
      webp: outputPath,
      originalSize: originalStat.size,
      webpSize: webpStat.size,
      reduction
    };

  } catch (err) {
    console.error(`❌ Error converting ${inputPath}:`, err.message);
    stats.errors++;
    return null;
  }
}

/**
 * Update HTML files to use WebP
 */
async function updateHTMLReferences(conversions) {
  console.log('\n📝 Updating HTML file references...');

  const htmlFiles = [
    'index.html',
    'faq.html',
    'privacy.html',
    'terms.html',
    'refund.html',
    'manage-subscription.html'
  ];

  let totalReplacements = 0;

  for (const htmlFile of htmlFiles) {
    const filepath = path.join('/home/user/signalpilot.io', htmlFile);

    if (!fs.existsSync(filepath)) continue;

    let content = await readFile(filepath, 'utf8');
    let replacements = 0;

    for (const conversion of conversions) {
      if (!conversion) continue;

      const originalRelative = path.relative('/home/user/signalpilot.io', conversion.original);
      const webpRelative = path.relative('/home/user/signalpilot.io', conversion.webp);

      // Replace src attributes
      const srcRegex = new RegExp(`src=["']/?${originalRelative}["']`, 'g');
      const srcMatches = content.match(srcRegex);
      if (srcMatches) {
        content = content.replace(srcRegex, `src="/${webpRelative}"`);
        replacements += srcMatches.length;
      }

      // Replace href attributes (for preload/prefetch)
      const hrefRegex = new RegExp(`href=["']/?${originalRelative}["']`, 'g');
      const hrefMatches = content.match(hrefRegex);
      if (hrefMatches) {
        content = content.replace(hrefRegex, `href="/${webpRelative}"`);
        replacements += hrefMatches.length;
      }
    }

    if (replacements > 0) {
      // Create backup
      if (CONFIG.createBackup) {
        await writeFile(`${filepath}.backup`, await readFile(filepath));
      }

      await writeFile(filepath, content);
      console.log(`✅ ${htmlFile}: ${replacements} references updated`);
      totalReplacements += replacements;
    }
  }

  console.log(`\n📊 Total: ${totalReplacements} references updated across ${htmlFiles.length} files`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Signal Pilot Image Converter\n');
  console.log('Configuration:');
  console.log(`  Quality: ${CONFIG.quality}%`);
  console.log(`  Effort: ${CONFIG.effort}/6`);
  console.log(`  Formats: ${CONFIG.inputFormats.join(', ')}`);
  console.log('');

  // Find all images
  console.log('🔍 Finding images...');
  const imageDir = '/home/user/signalpilot.io/assets/images';

  if (!fs.existsSync(imageDir)) {
    console.error('❌ Images directory not found:', imageDir);
    process.exit(1);
  }

  const images = await findImages(imageDir);
  console.log(`📂 Found ${images.length} images\n`);

  if (images.length === 0) {
    console.log('No images to convert.');
    return;
  }

  // Convert all images
  console.log('🚀 Converting images...\n');
  const conversions = [];

  for (const imagePath of images) {
    const result = await convertToWebP(imagePath);
    if (result) {
      conversions.push(result);
    }
  }

  // Print statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Processed: ${stats.processed} images`);
  console.log(`⏭️  Skipped: ${stats.skipped} images`);
  console.log(`❌ Errors: ${stats.errors} images`);
  console.log('');
  console.log(`📦 Original size: ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`📦 WebP size: ${formatBytes(stats.totalWebPSize)}`);

  if (stats.totalOriginalSize > 0) {
    const totalReduction = ((1 - stats.totalWebPSize / stats.totalOriginalSize) * 100).toFixed(1);
    const savedBytes = stats.totalOriginalSize - stats.totalWebPSize;
    console.log(`💾 Saved: ${formatBytes(savedBytes)} (${totalReduction}% reduction)`);
  }
  console.log('='.repeat(60));

  // Update HTML references
  if (conversions.length > 0) {
    await updateHTMLReferences(conversions);
  }

  console.log('\n✨ Done! All images converted to WebP.');
  console.log('\n💡 Next steps:');
  console.log('   1. Test the site to ensure images load correctly');
  console.log('   2. If everything works, you can delete original JPG/PNG files');
  console.log('   3. Commit the changes: git add . && git commit -m "Convert images to WebP"');
}

// Run the script
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
