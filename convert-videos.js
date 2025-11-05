#!/usr/bin/env node

/**
 * Video to WebM/MP4 Converter
 * Compresses videos with optimal settings for web delivery
 * Generates multiple formats (WebM + MP4) for browser compatibility
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const execPromise = promisify(exec);

// Check if ffmpeg is installed
let ffmpegInstalled = false;
let useFluentFFmpeg = false;

async function checkFFmpeg() {
  try {
    await execPromise('ffmpeg -version');
    ffmpegInstalled = true;
    console.log('✅ ffmpeg found (native)');
    return true;
  } catch (err) {
    console.log('⚠️  Native ffmpeg not found, checking fluent-ffmpeg...');

    try {
      require('fluent-ffmpeg');
      useFluentFFmpeg = true;
      console.log('✅ fluent-ffmpeg package found');
      return true;
    } catch (err2) {
      console.error('❌ Neither ffmpeg nor fluent-ffmpeg found.');
      console.log('\nInstall options:');
      console.log('  Option 1 (Native): apt-get install ffmpeg');
      console.log('  Option 2 (Node):   npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg');
      return false;
    }
  }
}

// Configuration
const CONFIG = {
  inputFormats: ['.mp4', '.mov', '.avi', '.webm'],
  outputFormats: ['webm', 'mp4'], // Generate both for compatibility
  webm: {
    videoBitrate: '1000k',    // 1 Mbps (good quality)
    audioBitrate: '128k',
    codec: 'libvpx-vp9',      // VP9 codec (better than VP8)
    audioCodec: 'libopus'
  },
  mp4: {
    videoBitrate: '1000k',
    audioBitrate: '128k',
    codec: 'libx264',         // H.264 codec
    audioCodec: 'aac',
    preset: 'medium'          // Encoding speed (slow = better quality)
  },
  createBackup: true,
  verbose: true
};

// Statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalOriginalSize: 0,
  totalCompressedSize: 0
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
 * Recursively find all video files
 */
async function findVideos(dir, videos = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filepath = path.join(dir, file);
    const fileStat = await stat(filepath);

    if (fileStat.isDirectory()) {
      await findVideos(filepath, videos);
    } else {
      const ext = path.extname(filepath).toLowerCase();
      if (CONFIG.inputFormats.includes(ext)) {
        videos.push(filepath);
      }
    }
  }

  return videos;
}

/**
 * Convert video using native ffmpeg
 */
async function convertWithNativeFFmpeg(inputPath, outputPath, format) {
  const config = CONFIG[format];

  let command;
  if (format === 'webm') {
    command = `ffmpeg -i "${inputPath}" -c:v ${config.codec} -b:v ${config.videoBitrate} -c:a ${config.audioCodec} -b:a ${config.audioBitrate} -y "${outputPath}"`;
  } else if (format === 'mp4') {
    command = `ffmpeg -i "${inputPath}" -c:v ${config.codec} -b:v ${config.videoBitrate} -preset ${config.preset} -c:a ${config.audioCodec} -b:a ${config.audioBitrate} -movflags +faststart -y "${outputPath}"`;
  }

  await execPromise(command);
}

/**
 * Convert video using fluent-ffmpeg
 */
async function convertWithFluentFFmpeg(inputPath, outputPath, format) {
  const ffmpeg = require('fluent-ffmpeg');

  // Try to use bundled ffmpeg
  try {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log('   Using bundled ffmpeg:', ffmpegPath);
  } catch (err) {
    console.log('   Using system ffmpeg');
  }

  const config = CONFIG[format];

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (format === 'webm') {
      command
        .videoCodec(config.codec)
        .videoBitrate(config.videoBitrate)
        .audioCodec(config.audioCodec)
        .audioBitrate(config.audioBitrate);
    } else if (format === 'mp4') {
      command
        .videoCodec(config.codec)
        .videoBitrate(config.videoBitrate)
        .audioCodec(config.audioCodec)
        .audioBitrate(config.audioBitrate)
        .addOption('-preset', config.preset)
        .addOption('-movflags', '+faststart'); // Enable streaming
    }

    command
      .on('start', (cmd) => {
        if (CONFIG.verbose) {
          console.log('   Command:', cmd);
        }
      })
      .on('progress', (progress) => {
        if (CONFIG.verbose && progress.percent) {
          process.stdout.write(`\r   Progress: ${Math.floor(progress.percent)}%`);
        }
      })
      .on('end', () => {
        if (CONFIG.verbose) {
          process.stdout.write('\r   Progress: 100%\n');
        }
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Convert video to optimized format
 */
async function convertVideo(inputPath, format) {
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const dirname = path.dirname(inputPath);
  const outputPath = path.join(dirname, `${basename}-optimized.${format}`);

  // Skip if output already exists
  if (fs.existsSync(outputPath)) {
    if (CONFIG.verbose) {
      console.log(`⏭️  Skipped: ${basename}-optimized.${format} (already exists)`);
    }
    stats.skipped++;
    return null;
  }

  try {
    const originalStat = await stat(inputPath);
    stats.totalOriginalSize += originalStat.size;

    console.log(`\n🎬 Converting: ${path.basename(inputPath)} → ${basename}-optimized.${format}`);
    console.log(`   Original size: ${formatBytes(originalStat.size)}`);
    console.log(`   Target format: ${format.toUpperCase()}`);
    console.log(`   Video bitrate: ${CONFIG[format].videoBitrate}`);

    const startTime = Date.now();

    // Convert using available method
    if (useFluentFFmpeg) {
      await convertWithFluentFFmpeg(inputPath, outputPath, format);
    } else {
      await convertWithNativeFFmpeg(inputPath, outputPath, format);
    }

    const compressedStat = await stat(outputPath);
    stats.totalCompressedSize += compressedStat.size;

    const reduction = ((1 - compressedStat.size / originalStat.size) * 100).toFixed(1);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ ${basename}-optimized.${format} created`);
    console.log(`   Compressed size: ${formatBytes(compressedStat.size)}`);
    console.log(`   Reduction: ${reduction}% (${formatBytes(originalStat.size - compressedStat.size)} saved)`);
    console.log(`   Duration: ${duration}s`);

    stats.processed++;

    return {
      original: inputPath,
      compressed: outputPath,
      format: format,
      originalSize: originalStat.size,
      compressedSize: compressedStat.size,
      reduction
    };

  } catch (err) {
    console.error(`❌ Error converting ${inputPath} to ${format}:`, err.message);
    stats.errors++;
    return null;
  }
}

/**
 * Update HTML files to use optimized videos
 */
async function updateHTMLReferences(conversions) {
  console.log('\n📝 Updating HTML file references...');

  const htmlFiles = [
    'index.html',
    'faq.html',
    'privacy.html',
    'terms.html',
    'refund.html',
    'manage-subscription.html',
    'roadmap.html'
  ];

  let totalReplacements = 0;

  for (const htmlFile of htmlFiles) {
    const filepath = path.join('/home/user/signalpilot.io', htmlFile);

    if (!fs.existsSync(filepath)) continue;

    let content = await readFile(filepath, 'utf8');
    let replacements = 0;

    // Group conversions by original file
    const conversionsByOriginal = {};
    for (const conversion of conversions) {
      if (!conversion) continue;

      if (!conversionsByOriginal[conversion.original]) {
        conversionsByOriginal[conversion.original] = [];
      }
      conversionsByOriginal[conversion.original].push(conversion);
    }

    // Update HTML with <video> tag supporting multiple sources
    for (const [originalPath, formats] of Object.entries(conversionsByOriginal)) {
      const originalRelative = path.relative('/home/user/signalpilot.io', originalPath);

      // Build source tags for different formats
      const webmFile = formats.find(f => f.format === 'webm');
      const mp4File = formats.find(f => f.format === 'mp4');

      // Replace simple src attributes with multi-source <video> tag
      const srcRegex = new RegExp(`<video[^>]*src=["']/?${originalRelative}["'][^>]*>`, 'g');
      const matches = content.match(srcRegex);

      if (matches) {
        for (const match of matches) {
          // Extract attributes from original video tag
          const autoplayMatch = match.match(/autoplay/);
          const loopMatch = match.match(/loop/);
          const mutedMatch = match.match(/muted/);
          const playsinlineMatch = match.match(/playsinline/);
          const controlsMatch = match.match(/controls/);
          const posterMatch = match.match(/poster=["']([^"']+)["']/);

          const webmRelative = webmFile ? path.relative('/home/user/signalpilot.io', webmFile.compressed) : null;
          const mp4Relative = mp4File ? path.relative('/home/user/signalpilot.io', mp4File.compressed) : null;

          let newVideoTag = '<video';
          if (autoplayMatch) newVideoTag += ' autoplay';
          if (loopMatch) newVideoTag += ' loop';
          if (mutedMatch) newVideoTag += ' muted';
          if (playsinlineMatch) newVideoTag += ' playsinline';
          if (controlsMatch) newVideoTag += ' controls';
          if (posterMatch) newVideoTag += ` poster="${posterMatch[1]}"`;
          newVideoTag += '>\n';

          // Add WebM source first (smaller, better compression)
          if (webmRelative) {
            newVideoTag += `  <source src="/${webmRelative}" type="video/webm">\n`;
          }

          // Add MP4 source as fallback
          if (mp4Relative) {
            newVideoTag += `  <source src="/${mp4Relative}" type="video/mp4">\n`;
          }

          newVideoTag += '  Your browser does not support the video tag.\n</video>';

          content = content.replace(match, newVideoTag);
          replacements++;
        }
      }
    }

    if (replacements > 0) {
      // Create backup
      if (CONFIG.createBackup) {
        await writeFile(`${filepath}.backup`, await readFile(filepath));
      }

      await writeFile(filepath, content);
      console.log(`✅ ${htmlFile}: ${replacements} video references updated`);
      totalReplacements += replacements;
    }
  }

  console.log(`\n📊 Total: ${totalReplacements} video references updated across ${htmlFiles.length} files`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🎬 Signal Pilot Video Converter\n');

  // Check ffmpeg availability
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    process.exit(1);
  }

  console.log('\nConfiguration:');
  console.log(`  Output formats: ${CONFIG.outputFormats.join(', ')}`);
  console.log(`  Video bitrate: ${CONFIG.webm.videoBitrate} (WebM), ${CONFIG.mp4.videoBitrate} (MP4)`);
  console.log(`  Audio bitrate: ${CONFIG.webm.audioBitrate}`);
  console.log('');

  // Find all videos
  console.log('🔍 Finding videos...');
  const videoDir = '/home/user/signalpilot.io/assets/videos';

  if (!fs.existsSync(videoDir)) {
    console.error('❌ Videos directory not found:', videoDir);
    process.exit(1);
  }

  const videos = await findVideos(videoDir);
  console.log(`📂 Found ${videos.length} video(s)\n`);

  if (videos.length === 0) {
    console.log('No videos to convert.');
    return;
  }

  // Convert all videos to both formats
  const conversions = [];

  for (const videoPath of videos) {
    for (const format of CONFIG.outputFormats) {
      const result = await convertVideo(videoPath, format);
      if (result) {
        conversions.push(result);
      }
    }
  }

  // Print statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Processed: ${stats.processed} video(s)`);
  console.log(`⏭️  Skipped: ${stats.skipped} video(s)`);
  console.log(`❌ Errors: ${stats.errors} video(s)`);
  console.log('');
  console.log(`📦 Original size: ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`📦 Compressed size: ${formatBytes(stats.totalCompressedSize)}`);

  if (stats.totalOriginalSize > 0) {
    const totalReduction = ((1 - stats.totalCompressedSize / stats.totalOriginalSize) * 100).toFixed(1);
    const savedBytes = stats.totalOriginalSize - stats.totalCompressedSize;
    console.log(`💾 Saved: ${formatBytes(savedBytes)} (${totalReduction}% reduction)`);
  }
  console.log('='.repeat(60));

  // Update HTML references
  if (conversions.length > 0) {
    await updateHTMLReferences(conversions);
  }

  console.log('\n✨ Done! All videos converted.');
  console.log('\n💡 Next steps:');
  console.log('   1. Test videos on your site (check both WebM and MP4 play)');
  console.log('   2. WebM plays first (better compression), MP4 is fallback');
  console.log('   3. If everything works, delete original large video files');
  console.log('   4. Commit: git add . && git commit -m "Compress videos for web"');
}

// Run the script
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
