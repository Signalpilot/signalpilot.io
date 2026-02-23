import React from 'react';
import {
  Composition,
  useVideoConfig,
  Img,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';

/**
 * Premium Instagram Story Composition (5 seconds @ 30fps)
 * 1080x1920
 *
 * Features:
 * - Kinetic text reveal animations with stagger effect
 * - Signal Pilot brand gradients and colors
 * - Multiple animation styles (fade, slide, scale, glitch)
 * - Smooth transitions and exit animations
 * - Animated branding footer
 * - Professional visual effects
 */

// Animation style options
const ANIMATION_STYLES = {
  FADE_SCALE: 'fade-scale',
  SLIDE_UP: 'slide-up',
  SLIDE_LEFT: 'slide-left',
  KINETIC_REVEAL: 'kinetic-reveal',
  GLITCH: 'glitch',
};

/**
 * Split text into lines and words for advanced text animations
 */
function splitTextForAnimation(text) {
  const lines = text.split('\n');
  return lines.map(line => ({
    line,
    words: line.split(/(\s+)/).filter(w => w.length > 0)
  }));
}

/**
 * Premium Story Component with enhanced animations
 */
const PremiumStoryContent = ({
  storyText,
  animationStyle = ANIMATION_STYLES.KINETIC_REVEAL,
  frame,
  fps,
  durationInFrames,
}) => {
  const lines = splitTextForAnimation(storyText);
  const totalLines = lines.length;
  const staggerDelay = 0.15; // seconds between line reveals

  // Animation timing
  const entryDuration = 3; // seconds for entry animations
  const holdDuration = 2; // seconds to hold at full opacity
  const exitDuration = 0.5; // seconds for exit

  const entryFrames = entryDuration * fps;
  const holdFrames = holdDuration * fps;
  const exitStartFrame = durationInFrames - (exitDuration * fps);

  // Overall fade in/out
  const entryProgress = Math.min(frame / entryFrames, 1);
  const exitProgress = frame > exitStartFrame
    ? (frame - exitStartFrame) / (exitDuration * fps)
    : 0;
  const masterOpacity = Math.min(1 - exitProgress, 1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Render animated text lines */}
      {lines.map((lineObj, lineIdx) => {
        // Calculate staggered animation for this line
        const lineStartFrame = lineIdx * staggerDelay * fps;
        const lineProgress = Math.max(0, Math.min((frame - lineStartFrame) / entryFrames, 1));

        let lineOpacity = 0;
        let lineTransform = '';

        // Apply animation style
        if (animationStyle === ANIMATION_STYLES.KINETIC_REVEAL) {
          lineOpacity = lineProgress;
          const slideY = interpolate(lineProgress, [0, 1], [40, 0], { easing: Easing.out(Easing.cubic) });
          lineTransform = `translateY(${slideY}px)`;
        } else if (animationStyle === ANIMATION_STYLES.FADE_SCALE) {
          lineOpacity = lineProgress;
          const scale = interpolate(lineProgress, [0, 1], [0.8, 1], { easing: Easing.out(Easing.cubic) });
          lineTransform = `scale(${scale})`;
        } else if (animationStyle === ANIMATION_STYLES.SLIDE_LEFT) {
          lineOpacity = lineProgress;
          const slideX = interpolate(lineProgress, [0, 1], [100, 0], { easing: Easing.out(Easing.cubic) });
          lineTransform = `translateX(${slideX}px)`;
        } else if (animationStyle === ANIMATION_STYLES.GLITCH) {
          lineOpacity = lineProgress;
          const glitch = Math.sin(frame * 0.1) * 3 * (1 - lineProgress);
          lineTransform = `translateX(${glitch}px)`;
        }

        // Determine line styling
        const isFirstLine = lineIdx === 0;
        const fontSize = isFirstLine ? 76 : 68;
        const fontWeight = isFirstLine ? 900 : 700;

        // Gradient for first line, white for others
        const textColor = isFirstLine ? 'url(#textGradient)' : 'white';
        const shadowColor = isFirstLine ? 'rgba(91, 138, 255, 0.4)' : 'rgba(0,0,0,0.6)';

        return (
          <div
            key={lineIdx}
            style={{
              fontSize,
              fontWeight,
              lineHeight: 1.2,
              marginBottom: lineIdx < totalLines - 1 ? '0px' : '0px',
              opacity: lineOpacity * masterOpacity,
              transform: lineTransform,
              transition: 'none',
              willChange: 'transform, opacity',
            }}
          >
            <svg
              width="0"
              height="0"
              style={{ position: 'absolute', pointerEvents: 'none' }}
            >
              <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5b8aff" />
                  <stop offset="50%" stopColor="#76ddff" />
                  <stop offset="100%" stopColor="#7ccaff" />
                </linearGradient>
              </defs>
            </svg>
            <span
              style={{
                color: isFirstLine ? undefined : textColor,
                backgroundImage: isFirstLine ? 'linear-gradient(135deg, #5b8aff, #76ddff, #7ccaff)' : 'none',
                backgroundClip: isFirstLine ? 'text' : 'unset',
                WebkitBackgroundClip: isFirstLine ? 'text' : 'unset',
                WebkitTextFillColor: isFirstLine ? 'transparent' : 'inherit',
                textShadow: `0 8px 24px ${shadowColor}`,
                letterSpacing: '-1px',
              }}
            >
              {lineObj.line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Animated Branding Footer
 */
const AnimatedBrandFooter = ({ frame, fps, durationInFrames }) => {
  const entryDelay = 2.5; // seconds before footer appears
  const entryDelayFrames = entryDelay * fps;
  const footerProgress = Math.max(0, Math.min((frame - entryDelayFrames) / (fps * 0.5), 1));

  const exitStartFrame = durationInFrames - (0.5 * fps);
  const exitProgress = frame > exitStartFrame
    ? (frame - exitStartFrame) / (0.5 * fps)
    : 0;
  const opacity = Math.min(footerProgress * (1 - exitProgress), 0.9);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        padding: '24px',
        border: '2px solid rgba(118, 221, 255, 0.6)',
        borderRadius: '16px',
        background: 'rgba(12, 17, 28, 0.9)',
        backdropFilter: 'blur(10px)',
        opacity,
        transform: `translateY(${interpolate(footerProgress, [0, 1], [20, 0], { easing: Easing.out(Easing.cubic) })}px)`,
        zIndex: 20,
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          color: '#76ddff',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '1px',
          marginBottom: '8px',
        }}
      >
        SIGNAL PILOT
      </div>
      <div
        style={{
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 500,
          opacity: 0.8,
        }}
      >
        TAP BIO FOR EDGE
      </div>
    </div>
  );
};

/**
 * Decorative corner accents
 */
const CornerAccents = ({ frame, fps, durationInFrames }) => {
  const pulse = (frame % (2 * fps)) / (2 * fps);
  const opacity = 0.4 + pulse * 0.2;

  return (
    <>
      {/* Top-right accent */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 40,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#76ddff',
          opacity,
          boxShadow: '0 0 20px rgba(118, 221, 255, 0.6)',
          willChange: 'opacity',
        }}
      />
      {/* Bottom-left accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#3ed598',
          opacity: opacity * 0.6,
          boxShadow: '0 0 15px rgba(62, 213, 152, 0.4)',
          willChange: 'opacity',
        }}
      />
    </>
  );
};

/**
 * Main Story Composition Component
 */
export const StoryComposition = ({
  postNumber,
  storyText,
  animationStyle = ANIMATION_STYLES.KINETIC_REVEAL,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #05070d 0%, #0c111c 50%, #101626 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated top bar accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #5b8aff 0%, #76ddff 100%)',
          opacity: 0.6,
        }}
      />

      {/* Depth overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(91, 138, 255, 0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Corner accents */}
      <CornerAccents frame={frame} fps={fps} durationInFrames={durationInFrames} />

      {/* Main text content */}
      <PremiumStoryContent
        storyText={storyText}
        animationStyle={animationStyle}
        frame={frame}
        fps={fps}
        durationInFrames={durationInFrames}
      />

      {/* Animated branding footer */}
      <AnimatedBrandFooter frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </div>
  );
};

/**
 * Remotion Composition Definition for Stories
 * Ready for rendering to MP4 with full animations
 */
export const RemotionStory = ({
  postNumber,
  storyText,
  animationStyle = ANIMATION_STYLES.KINETIC_REVEAL
}) => {
  return (
    <Composition
      id="InstagramStory"
      component={StoryComposition}
      durationInFrames={5 * 30} // 5 seconds @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        postNumber,
        storyText,
        animationStyle,
      }}
    />
  );
};

export { ANIMATION_STYLES };
