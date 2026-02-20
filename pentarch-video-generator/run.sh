#!/bin/bash

# Pentarch Video Generator - Quick Start Script

echo "🎬 Pentarch Video Generator"
echo "============================"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python3 found"

# Check if audio file exists
AUDIO_PATH="../adam_voiceover.mp3"
if [ ! -f "$AUDIO_PATH" ]; then
    echo "⚠️  Audio file not found: $AUDIO_PATH"
    echo "    Please place adam_voiceover.mp3 in the parent directory"
    echo ""
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."

# Check for moviepy
if ! python3 -c "import moviepy" 2>/dev/null; then
    echo "❌ Required packages not installed"
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

echo "✅ All dependencies ready"
echo ""

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg not found"
    echo "    Install with:"
    echo "    Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "    macOS: brew install ffmpeg"
    echo ""
fi

# Run the generator
echo "🚀 Starting video generation..."
echo ""

python3 pentarch_generator.py

echo ""
echo "✅ Done! Check for pentarch_video.mp4"
