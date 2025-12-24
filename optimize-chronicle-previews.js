#!/usr/bin/env node

/**
 * Chronicle Preview Image Optimizer
 * Creates optimized OG preview images for social sharing
 * Target: 1200x630 JPEG at ~80% quality (under 300KB)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CHRONICLE_DIR = '/home/user/signalpilot.io/chronicle';
const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 630;
const JPEG_QUALITY = 80;

// Image mappings
const IMAGES = [
  'arbiter-harmonic-oscillator.png',
  'cartographer-janus-atlas.png',
  'commander-omnideck.png',
  'council-assembles.png',
  'elite-seven-council.png',
  'hierarchy-of-signals.png',
  'non-repainting-matters.png',
  'pilots-oath.png',
  'prophet-volume-oracle.png',
  'scales-plutus-flow.png',
  'sovereign-pentarch.png',
  'watchman-augury-grid.png'
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function optimizeImage(filename) {
  const inputPath = path.join(CHRONICLE_DIR, filename);
  const outputFilename = filename.replace('.png', '-preview.jpg');
  const outputPath = path.join(CHRONICLE_DIR, outputFilename);

  if (!fs.existsSync(inputPath)) {
    console.log(`  Skipping ${filename} (not found)`);
    return null;
  }

  const originalStat = fs.statSync(inputPath);

  await sharp(inputPath)
    .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: JPEG_QUALITY,
      progressive: true,
      mozjpeg: true
    })
    .toFile(outputPath);

  const newStat = fs.statSync(outputPath);
  const reduction = ((1 - newStat.size / originalStat.size) * 100).toFixed(1);

  console.log(`  ${filename}`);
  console.log(`    ${formatBytes(originalStat.size)} -> ${formatBytes(newStat.size)} (${reduction}% smaller)`);

  return {
    original: filename,
    preview: outputFilename,
    originalSize: originalStat.size,
    previewSize: newStat.size
  };
}

async function main() {
  console.log('Chronicle Preview Image Optimizer');
  console.log('==================================');
  console.log(`Target: ${PREVIEW_WIDTH}x${PREVIEW_HEIGHT} JPEG @ ${JPEG_QUALITY}% quality\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  const results = [];

  for (const image of IMAGES) {
    const result = await optimizeImage(image);
    if (result) {
      results.push(result);
      totalOriginal += result.originalSize;
      totalOptimized += result.previewSize;
    }
  }

  console.log('\n==================================');
  console.log('Summary:');
  console.log(`  Original total: ${formatBytes(totalOriginal)}`);
  console.log(`  Preview total:  ${formatBytes(totalOptimized)}`);
  console.log(`  Saved: ${formatBytes(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
  console.log('\nPreview files created with -preview.jpg suffix');
}

main().catch(console.error);
