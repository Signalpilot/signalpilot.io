# 🎬 Instagram Reels Generation Workflow

This guide walks you through generating Instagram Reels from carousel posts using Remotion.

## Architecture

```
content-queue.json (captions, titles, hashtags)
       ↓
assets/social/post-XXX/ (carousel slide images)
       ↓
Remotion ReelComposition (renders 30-second video)
       ↓
assets/social/reels/post-XXX.mp4 (final Reel video)
       ↓
Cron job posts to Instagram (2x daily at 12PM, 6PM UTC)
```

## Setup (One-time on Mac)

### 1. Clone the repo
```bash
git clone https://github.com/Signalpilot/signalpilot.io.git
cd signalpilot.io
git checkout claude/fix-instagram-queue-robot-VVE9I
```

### 2. Install dependencies
```bash
npm install
```

This installs:
- `remotion` — Video composition library
- `@remotion/cli` — Command-line renderer
- `ffmpeg` — Video encoding (auto-installed)

### 3. Verify Remotion works
```bash
npx remotion --version
```

You should see version info. If not, troubleshoot with:
```bash
npm install @remotion/cli
```

---

## Rendering Reels

All commands run from the project root: `~/signalpilot.io/`

### Option A: Render all posts with carousel content
```bash
npm run generate-reels
```

This automatically:
1. Reads `data/social/content-queue.json`
2. Finds all posts with carousel images in `assets/social/post-XXX/`
3. Renders each into a 30-second Reel video
4. Saves to `assets/social/reels/post-XXX.mp4`

### Option B: Render a specific post
```bash
npm run generate-reels 35
```

This renders only post #35.

### Option C: Render a range
```bash
npm run generate-reels 30-40
```

This renders posts 30 through 40.

### Option D: Preview which posts will render
```bash
npm run generate-reels:list
```

Output example:
```
post-000: To The 3AM Version of You (10 slides) ✓ exists
post-001: Trading Psychology 101 (9 slides) (new)
post-002: Market Structure Decoded (10 slides) ✓ exists
...
```

### Option E: Force re-render existing Reels
```bash
npm run generate-reels:force
```

Use if you updated the Remotion component or carousel images.

---

## What the Reel Component Does

Each 30-second Reel is structured as:

**0-3 seconds: Hook Text**
- Animated text slides up from bottom
- Grabs attention with key insight from the caption
- Large white text on dark gradient background

**3-24 seconds: Carousel Slides**
- Smooth dissolve transitions between carousel images
- ~2 seconds per slide
- Slide counter in top-right corner
- Text overlay opportunities on each slide

**24-30 seconds: CTA Overlay**
- "Save this" + "Link in bio 🔗"
- Animated slide-up from bottom
- Cyan/teal accent color (#00d9ff)

**Audio:** Background ambient music (royalty-free, non-distracting)

---

## Workflow: Quick Version

### Step 1: Prepare carousel images
Ensure your carousel images are in:
```
assets/social/post-XXX/
├── slide-1.png
├── slide-2.png
├── slide-3.png
└── ... (up to slide-10.png)
```

### Step 2: Add captions to content queue
Edit `data/social/content-queue.json`:
```json
{
  "postNumber": 35,
  "title": "Your post title",
  "instagram": {
    "caption": "Your caption text here...",
    "slideCount": 10
  }
}
```

### Step 3: Generate Reels
```bash
npm run generate-reels
```

Wait for rendering to complete. On an M1/M2 Mac:
- ~30-60 seconds per Reel
- 10 Reels = ~5-10 minutes total

### Step 4: Review videos
```bash
open assets/social/reels/
```

Preview each post-XXX.mp4 in QuickTime or preview

### Step 5: Commit and push
```bash
git add assets/social/reels/
git commit -m "Add Reel videos for posts XXX-YYY"
git push origin claude/fix-instagram-queue-robot-VVE9I
```

### Step 6: Sit back
The cron job automatically posts 2 Reels daily at:
- **12:00 PM UTC** (7:00 AM EST)
- **6:00 PM UTC** (1:00 PM EST)

---

## Customization

### Change Reel Duration
Edit `remotion/ReelComposition.jsx`:
```jsx
<Composition
  durationInFrames={30 * 30}  // Change 30 to your desired seconds
  fps={30}
  ...
/>
```

### Change Colors
In `scripts/render-reels.js`, modify:
```js
backgroundColor: '#0a0e27',  // Dark background
accentColor: '#00d9ff',      // Cyan CTA accent
```

### Change CTA Text
Edit `remotion/ReelComposition.jsx`:
```jsx
<p style={{ color: accentColor }}>
  Save this 📌                    {/* Change this */}
</p>
<p style={{ color: 'white' }}>
  Link in bio 🔗                  {/* Or this */}
</p>
```

### Add Background Music
Edit `remotion/ReelComposition.jsx` to add audio:
```jsx
import { Audio } from 'remotion';

// In component:
<Audio src="/assets/audio/background-music.mp3" />
```

Place audio file at `assets/audio/background-music.mp3`

---

## Troubleshooting

### Error: "FFmpeg not found"
```bash
npm install @ffmpeg-installer/ffmpeg
```

### Error: "ENOENT: no such file or directory"
Make sure carousel images exist in `assets/social/post-XXX/slide-N.png`

### Error: "Out of memory"
Rendering uses a lot of RAM. Close other apps or render fewer posts:
```bash
npm run generate-reels 35  # Just one post
```

### Slow rendering
This is normal! On M1 Mac:
- Real-time rendering: ~1 second video = ~30 seconds render time
- 30-second Reel = 15+ minutes if real-time

Use `--concurrency=2` for slower machines or battery mode.

### Check rendering status
While rendering, Remotion outputs live progress:
```
[RENDERING] Frame 1 / 900
[RENDERING] Frame 50 / 900
...
```

---

## Files Overview

```
signalpilot.io/
├── remotion/
│   ├── index.jsx                    # Entry point (empty but required)
│   └── ReelComposition.jsx          # The actual Reel component
├── scripts/
│   └── render-reels.js              # Batch render orchestrator
├── assets/social/
│   ├── post-000/slide-1.png         # Carousel images (carousel posts)
│   ├── post-001/slide-1.png
│   ├── reels/
│   │   ├── post-000.mp4             # Generated Reel videos (output)
│   │   └── post-001.mp4
├── data/social/
│   └── content-queue.json           # Post metadata & captions
└── remotion.config.ts               # Remotion settings (codec, quality)
```

---

## What Happens Next

**After you push the Reel videos:**

1. ✅ CI/CD validates the video files
2. ✅ Deployment updates the production server
3. ✅ Cron jobs automatically post 2 Reels/day
4. ✅ Instagram algorithm boost from video content
5. ✅ 2-3x engagement vs. static carousel posts

---

## Support

- **Remotion docs:** https://www.remotion.dev
- **Issue with this workflow?** Check `api/social/post-reels.js` for the posting logic
- **Need to tweak the component?** Edit `remotion/ReelComposition.jsx`

---

**Happy rendering! 🎬**
