# Pentarch Video Generator

Production-ready video generator for the 90-second Pentarch promotional video.

## Features

✨ **Complete 4-Scene Video**
- **Scene 1 (12s)**: Animated intro with rotating phase wheel (TD, IGN, WRN, CAP, BDN)
- **Scene 2 (25s)**: Split-screen trader comparison (Traditional vs Pentarch)
- **Scene 3 (28s)**: Animated pricing tier cards with glow effects
- **Scene 4 (15s)**: Call-to-action with button and branding

🎨 **Visual Effects**
- Animated starfield background with twinkling
- Rotating phase wheel with color-coded segments
- Glowing circles and accent effects
- Smooth fade-in/fade-out transitions
- Pulsing CTA button

🎬 **Video Output**
- 1920x1080 resolution (Full HD)
- 60 FPS smooth playback
- H.264 codec (MP4 format)
- AAC audio codec

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Ensure FFmpeg is installed (for audio/video processing)
# On Ubuntu/Debian:
sudo apt-get install ffmpeg

# On macOS:
brew install ffmpeg
```

## Usage

### Basic Usage

```bash
python pentarch_generator.py
```

This will:
1. Look for `adam_voiceover.mp3` in the parent directory
2. Generate the complete video
3. Save as `pentarch_video.mp4` in the current directory

### With Custom Audio

```bash
# Modify the script to use your audio file
# Edit the line in __main__ section:
AUDIO_FILE = "path/to/your/audio.mp3"
```

### Output Location

The video will be saved as `pentarch_video.mp4` in the current directory.

## Color Scheme

- **TD (Tender Develop)**: Purple `#9433EA`
- **IGN (Ignite)**: Teal `#00C8C8`
- **WRN (Warn)**: Yellow `#FFEB3B`
- **CAP (Capitalize)**: Orange `#FF8C00`
- **BDN (Breakdown)**: Red `#FF2828`

## Customization

### Adjust Scene Durations

Edit the duration constants in the script:

```python
DURATION_SCENE_1 = 12  # Intro
DURATION_SCENE_2 = 25  # Trader comparison
DURATION_SCENE_3 = 28  # Pricing tiers
DURATION_SCENE_4 = 15  # CTA
```

### Change Text Content

Modify the text strings in each `create_scene_X()` function.

### Adjust Colors

Edit the `COLORS` dictionary at the top of the script.

### Performance Settings

- **FPS**: Change `FPS = 60` (lower = faster generation)
- **Resolution**: Change `WIDTH` and `HEIGHT`
- **Codec**: Modify the `write_videofile()` call

## Troubleshooting

### Audio Not Found

Ensure `adam_voiceover.mp3` is in the parent directory (`/home/user/signalpilot.io/`).

### FFmpeg Errors

Install FFmpeg:
```bash
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg          # macOS
```

### Memory Issues

Lower the FPS or resolution for faster generation during testing.

## Requirements

- Python 3.8+
- FFmpeg (for video encoding)
- 2+ GB RAM (for video generation)
- 1+ GB disk space (for output file)

## Generated Files

- `pentarch_video.mp4` - Final video file

## Notes

- First run may take 5-15 minutes depending on system specs
- Generated frames are 1920x1080 at 60 FPS (5400 total frames)
- Audio will be automatically synced to the video
