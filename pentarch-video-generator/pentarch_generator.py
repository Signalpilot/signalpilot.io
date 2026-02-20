#!/usr/bin/env python3
"""
Pentarch Video Generator - Creates the full 90-second Pentarch visualization video
Requires: moviepy, numpy, PIL, pygame
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy.video.io.ImageSequenceClip import ImageSequenceClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.VideoClip import VideoClip
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip
import os
import math
from pathlib import Path

# ==============================================================================
# COLOR SCHEME
# ==============================================================================
COLORS = {
    "td": (148, 51, 234),      # Purple
    "ign": (0, 200, 200),       # Teal
    "wrn": (255, 235, 59),      # Yellow
    "cap": (255, 140, 0),       # Orange
    "bdn": (255, 40, 40),       # Red
    "bg": (15, 15, 25),         # Dark background
    "text": (255, 255, 255),    # White
    "accent": (100, 255, 200),  # Cyan accent
}

ORDER_NAMES = ["TD", "IGN", "WRN", "CAP", "BDN"]
ORDER_COLORS = [COLORS["td"], COLORS["ign"], COLORS["wrn"], COLORS["cap"], COLORS["bdn"]]

# ==============================================================================
# VIDEO SETTINGS
# ==============================================================================
FPS = 60
WIDTH = 1920
HEIGHT = 1080
DURATION_SCENE_1 = 12  # Intro + Phase wheel
DURATION_SCENE_2 = 25  # Trader comparison
DURATION_SCENE_3 = 28  # Price tiers
DURATION_SCENE_4 = 15  # Call to action
TOTAL_DURATION = DURATION_SCENE_1 + DURATION_SCENE_2 + DURATION_SCENE_3 + DURATION_SCENE_4


# ==============================================================================
# HELPER FUNCTIONS - DRAWING
# ==============================================================================

def create_starfield(width, height, num_stars=150, seed=42):
    """Create a starfield background with twinkling effect."""
    np.random.seed(seed)
    stars = []
    for _ in range(num_stars):
        x = np.random.randint(0, width)
        y = np.random.randint(0, height)
        size = np.random.randint(1, 4)
        brightness = np.random.randint(100, 255)
        stars.append((x, y, size, brightness))
    return stars


def draw_starfield(img, stars, frame, twinkle_speed=2):
    """Draw stars with twinkling effect based on frame."""
    draw = ImageDraw.Draw(img)
    for x, y, size, base_brightness in stars:
        # Twinkling animation
        twinkle = math.sin(frame / twinkle_speed) * 0.5 + 0.5
        brightness = int(base_brightness * (0.5 + 0.5 * twinkle))
        color = (brightness, brightness, brightness)
        draw.ellipse([x, y, x + size, y + size], fill=color)


def draw_phase_wheel(img, phases, center_x, center_y, radius, frame, total_frames, rotation_speed=0.5):
    """Draw rotating phase wheel with 5 phases."""
    draw = ImageDraw.Draw(img)

    # Calculate rotation
    angle_per_frame = (360 / total_frames) * rotation_speed
    rotation = (frame * angle_per_frame) % 360

    # Draw phase segments
    segment_angle = 360 / len(phases)
    for i, (name, color) in enumerate(phases):
        start_angle = (i * segment_angle + rotation) % 360
        end_angle = ((i + 1) * segment_angle + rotation) % 360

        # Draw arc
        draw_arc(draw, center_x, center_y, radius, start_angle, end_angle, color, 8)

        # Draw label
        label_angle = math.radians((i * segment_angle + rotation + segment_angle / 2) % 360)
        label_x = center_x + int(math.cos(label_angle) * (radius + 80))
        label_y = center_y + int(math.sin(label_angle) * (radius + 80))

        draw.text((label_x - 30, label_y - 15), name, fill=color, font=get_font(40, bold=True))

        # Draw glow effect
        draw_glow_circle(draw, center_x, center_y, radius - 5, color, intensity=0.3)


def draw_arc(draw, center_x, center_y, radius, start_angle, end_angle, color, width):
    """Draw an arc on an image."""
    start_rad = math.radians(start_angle)
    end_rad = math.radians(end_angle)

    points = []
    num_points = int(abs(end_angle - start_angle) * 2)
    for i in range(num_points + 1):
        angle = start_rad + (end_rad - start_rad) * i / num_points
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        points.append((x, y))

    if len(points) > 1:
        draw.line(points, fill=color, width=width)


def draw_glow_circle(draw, center_x, center_y, radius, color, intensity=0.3):
    """Draw a glowing circle effect."""
    for i in range(1, 5):
        alpha = int(255 * intensity * (1 - i / 5))
        glow_color = tuple(int(c * (1 - i / 10)) for c in color)
        draw.ellipse(
            [center_x - radius - i * 10, center_y - radius - i * 10,
             center_x + radius + i * 10, center_y + radius + i * 10],
            outline=glow_color,
            width=2
        )


def get_font(size=40, bold=False):
    """Get a font with specified size."""
    try:
        font_name = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        return ImageFont.truetype(font_name, size)
    except:
        return ImageFont.load_default()


# ==============================================================================
# SCENE 1: INTRO + PHASE WHEEL (12 seconds)
# ==============================================================================

def create_scene_1():
    """Scene 1: Introduction with rotating phase wheel."""
    frames = []
    stars = create_starfield(WIDTH, HEIGHT)
    total_frames = int(DURATION_SCENE_1 * FPS)

    phases = list(zip(ORDER_NAMES, ORDER_COLORS))

    for frame_num in range(total_frames):
        # Create frame
        img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])

        # Draw starfield
        draw_starfield(img, stars, frame_num)

        # Draw main title
        draw = ImageDraw.Draw(img)
        title_alpha = min(255, int(frame_num / 10) * 255)
        draw.text((WIDTH // 2 - 400, 100), "PENTARCH", fill=COLORS["accent"], font=get_font(80, bold=True))

        # Draw phase wheel in center
        draw_phase_wheel(img, phases, WIDTH // 2, HEIGHT // 2, 200, frame_num, total_frames)

        # Draw subtitle with fade-in
        if frame_num > 120:  # After 2 seconds
            fade = min(1.0, (frame_num - 120) / 60)
            subtitle_color = tuple(int(c * fade) for c in COLORS["text"])
            draw.text((WIDTH // 2 - 300, HEIGHT - 200), "Five Orders. Infinite Possibilities.",
                     fill=subtitle_color, font=get_font(40))

        frames.append(np.array(img))

    return frames


# ==============================================================================
# SCENE 2: TRADER COMPARISON (25 seconds)
# ==============================================================================

def create_scene_2():
    """Scene 2: Split-screen trader comparison."""
    frames = []
    stars = create_starfield(WIDTH, HEIGHT, seed=123)
    total_frames = int(DURATION_SCENE_2 * FPS)

    for frame_num in range(total_frames):
        img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
        draw = ImageDraw.Draw(img)

        # Draw starfield
        draw_starfield(img, stars, frame_num)

        # Draw left side - Traditional trader
        traditional_progress = min(1.0, frame_num / 60)
        draw.rectangle([50, 150, WIDTH // 2 - 50, HEIGHT - 150], outline=COLORS["text"], width=3)
        draw.text((100, 180), "TRADITIONAL TRADER", fill=COLORS["text"], font=get_font(36, bold=True))

        # Draw metrics for traditional
        metrics_x, metrics_y = 100, 280
        metrics = [
            "• Emotional decisions",
            "• High fees",
            "• Limited orders",
            "• No strategy framework"
        ]
        for i, metric in enumerate(metrics):
            opacity = min(1.0, (frame_num - 60) / 30)
            color = tuple(int(c * opacity) for c in (255, 100, 100))
            draw.text((metrics_x, metrics_y + i * 50), metric, fill=color, font=get_font(28))

        # Draw right side - Pentarch trader
        pentarch_progress = min(1.0, (frame_num - 120) / 60)
        draw.rectangle([WIDTH // 2 + 50, 150, WIDTH - 50, HEIGHT - 150], outline=COLORS["accent"], width=3)
        draw.text((WIDTH // 2 + 100, 180), "PENTARCH TRADER", fill=COLORS["accent"], font=get_font(36, bold=True))

        # Draw metrics for pentarch
        metrics_x = WIDTH // 2 + 100
        metrics = [
            "• Rules-based execution",
            "• Transparent pricing",
            "• 5-order framework",
            "• Systematic approach"
        ]
        for i, metric in enumerate(metrics):
            opacity = min(1.0, (frame_num - 120) / 30)
            color = tuple(int(c * opacity * 255 / 255) if c < 255 else 255 for c in COLORS["accent"])
            draw.text((metrics_x, metrics_y + i * 50), metric, fill=color, font=get_font(28))

        frames.append(np.array(img))

    return frames


# ==============================================================================
# SCENE 3: PRICING TIERS (28 seconds)
# ==============================================================================

def create_scene_3():
    """Scene 3: Animated pricing tiers."""
    frames = []
    stars = create_starfield(WIDTH, HEIGHT, seed=456)
    total_frames = int(DURATION_SCENE_3 * FPS)

    tiers = [
        ("TIER 1", "$49/mo", COLORS["td"], "Entry Level"),
        ("TIER 2", "$149/mo", COLORS["ign"], "Professional"),
        ("TIER 3", "$299/mo", COLORS["wrn"], "Advanced"),
        ("TIER 4", "$599/mo", COLORS["cap"], "Elite"),
        ("TIER 5", "$999/mo", COLORS["bdn"], "Master")
    ]

    for frame_num in range(total_frames):
        img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
        draw = ImageDraw.Draw(img)

        # Draw starfield
        draw_starfield(img, stars, frame_num)

        # Title
        draw.text((WIDTH // 2 - 200, 80), "PRICING TIERS", fill=COLORS["accent"], font=get_font(60, bold=True))

        # Draw tier cards
        card_width = 320
        card_height = 400
        start_x = (WIDTH - (len(tiers) * card_width + (len(tiers) - 1) * 20)) // 2

        for i, (tier_name, price, color, description) in enumerate(tiers):
            # Animate card appearance
            delay = i * 40
            if frame_num > delay:
                progress = min(1.0, (frame_num - delay) / 40)
                card_x = start_x + i * (card_width + 20)
                card_y = int(HEIGHT // 2 - card_height // 2 - (1 - progress) * 200)

                # Draw card background
                draw.rectangle(
                    [card_x, card_y, card_x + card_width, card_y + card_height],
                    fill=COLORS["bg"],
                    outline=color,
                    width=4
                )

                # Draw glow
                draw_glow_circle(draw, card_x + card_width // 2, card_y + card_height // 2,
                               card_width // 2, color, intensity=0.2)

                # Draw text
                draw.text((card_x + 20, card_y + 30), tier_name, fill=color, font=get_font(24, bold=True))
                draw.text((card_x + 20, card_y + 80), price, fill=COLORS["text"], font=get_font(32, bold=True))
                draw.text((card_x + 20, card_y + 140), description, fill=COLORS["text"], font=get_font(18))

                # Draw features (animated)
                features = ["✓ Full access", "✓ Priority support", "✓ Advanced tools"]
                for j, feature in enumerate(features):
                    feature_progress = min(1.0, (frame_num - delay - 80) / 20)
                    feature_color = tuple(int(c * feature_progress) for c in color)
                    draw.text((card_x + 20, card_y + 200 + j * 40), feature, fill=feature_color, font=get_font(16))

        frames.append(np.array(img))

    return frames


# ==============================================================================
# SCENE 4: CALL TO ACTION (15 seconds)
# ==============================================================================

def create_scene_4():
    """Scene 4: Call to action with CTA button."""
    frames = []
    stars = create_starfield(WIDTH, HEIGHT, seed=789)
    total_frames = int(DURATION_SCENE_4 * FPS)

    for frame_num in range(total_frames):
        img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
        draw = ImageDraw.Draw(img)

        # Draw starfield
        draw_starfield(img, stars, frame_num)

        # Main message with fade-in
        fade = min(1.0, frame_num / 60)
        main_color = tuple(int(c * fade) for c in COLORS["accent"])
        draw.text((WIDTH // 2 - 400, 200), "Ready to trade smarter?", fill=main_color, font=get_font(72, bold=True))

        # Subtext
        if frame_num > 120:
            sub_fade = min(1.0, (frame_num - 120) / 60)
            sub_color = tuple(int(c * sub_fade) for c in COLORS["text"])
            draw.text((WIDTH // 2 - 350, 350), "Join 10,000+ traders using Pentarch", fill=sub_color, font=get_font(40))

        # CTA Button with pulse effect
        if frame_num > 240:
            pulse = math.sin(frame_num / 20) * 0.3 + 0.7
            button_color = tuple(int(c * pulse) for c in COLORS["wrn"])

            button_x1, button_y1 = WIDTH // 2 - 150, 500
            button_x2, button_y2 = WIDTH // 2 + 150, 580

            draw.rectangle([button_x1, button_y1, button_x2, button_y2], fill=button_color, width=0)
            draw.text((WIDTH // 2 - 80, button_y1 + 20), "START FREE TRIAL", fill=COLORS["bg"], font=get_font(28, bold=True))

        # Bottom branding
        if frame_num > 480:
            brand_fade = min(1.0, (frame_num - 480) / 60)
            brand_color = tuple(int(c * brand_fade) for c in (100, 100, 100))
            draw.text((WIDTH // 2 - 200, HEIGHT - 100), "www.signalpilot.io", fill=brand_color, font=get_font(24))

        frames.append(np.array(img))

    return frames


# ==============================================================================
# MAIN VIDEO GENERATION
# ==============================================================================

def generate_video(audio_path, output_path="pentarch_video.mp4"):
    """Generate the complete Pentarch video."""
    print("🎬 Generating Pentarch Video...")
    print(f"   Frame rate: {FPS} FPS")
    print(f"   Resolution: {WIDTH}x{HEIGHT}")
    print(f"   Total duration: {TOTAL_DURATION} seconds")

    # Create all scenes
    print("\n📹 Rendering Scene 1: Intro + Phase Wheel...")
    scene_1_frames = create_scene_1()

    print("📹 Rendering Scene 2: Trader Comparison...")
    scene_2_frames = create_scene_2()

    print("📹 Rendering Scene 3: Pricing Tiers...")
    scene_3_frames = create_scene_3()

    print("📹 Rendering Scene 4: Call to Action...")
    scene_4_frames = create_scene_4()

    # Combine all frames
    all_frames = scene_1_frames + scene_2_frames + scene_3_frames + scene_4_frames

    # Create video clip from frames
    video_clip = ImageSequenceClip(all_frames, fps=FPS)

    # Add audio if provided
    if audio_path and os.path.exists(audio_path):
        print(f"\n🔊 Adding audio: {audio_path}")
        audio_clip = AudioFileClip(audio_path)
        video_clip = video_clip.set_audio(audio_clip)
    else:
        print(f"\n⚠️  Audio file not found: {audio_path}")

    # Write video
    print(f"\n💾 Writing video to {output_path}...")
    video_clip.write_videofile(output_path, fps=FPS, codec="libx264", audio_codec="aac", verbose=False, logger=None)

    print(f"\n✅ Video generated successfully: {output_path}")
    return output_path


# ==============================================================================
# ENTRY POINT
# ==============================================================================

if __name__ == "__main__":
    # Configuration
    REPO_ROOT = Path(__file__).parent.parent
    AUDIO_FILE = REPO_ROOT / "adam_voiceover.mp3"
    OUTPUT_FILE = "pentarch_video.mp4"

    print(f"📂 Repository root: {REPO_ROOT}")
    print(f"🎵 Looking for audio: {AUDIO_FILE}")

    # Generate video
    generate_video(str(AUDIO_FILE), OUTPUT_FILE)
