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
 * Instagram Story Composition
 * 1080x1920, 30fps, 5 seconds
 *
 * Structure:
 * Single background image with animated text overlay
 * Perfect for quick engagement hooks and CTAs
 */
export const StoryComposition = ({
  postNumber,
  backgroundImage,
  storyText,
  backgroundColor = '#0a0e27',
  accentColor = '#00d9ff',
  position = 'bottom', // 'top' | 'center' | 'bottom'
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Text animation: slide up from bottom with fade
  const textProgress = Math.min(frame / (0.3 * fps), 1); // First 0.3 sec
  const textOpacity = interpolate(textProgress, [0, 0.1, 1], [0, 0.5, 1]);
  const textYOffset = interpolate(
    textProgress,
    [0, 1],
    [100, 0],
    { easing: Easing.out(Easing.cubic) }
  );

  // Pulse effect on the text (subtle)
  const pulseProgress = (frame % (2 * fps)) / (2 * fps);
  const pulseScale = interpolate(pulseProgress, [0, 0.5, 1], [1, 1.05, 1]);

  // Exit animation: fade out last second
  const exitProgress = Math.max(
    0,
    (frame - (durationInFrames - fps)) / fps
  );
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  const positionMap = {
    top: { top: '15%' },
    center: { top: '50%', transform: 'translateY(-50%)' },
    bottom: { bottom: '20%' },
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* BACKGROUND IMAGE */}
      {backgroundImage && (
        <Img
          src={backgroundImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
          }}
        />
      )}

      {/* Overlay gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* STORY TEXT */}
      <div
        style={{
          position: 'absolute',
          ...positionMap[position],
          left: 20,
          right: 20,
          textAlign: 'center',
          opacity: Math.min(textOpacity, exitOpacity),
          transform: `translateY(${textYOffset}px) scale(${pulseScale})`,
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: 44,
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            lineHeight: 1.3,
            textShadow: '0 4px 12px rgba(0,0,0,0.9)',
            letterSpacing: '-0.5px',
          }}
        >
          {storyText}
        </h2>
      </div>

      {/* BRANDING ELEMENT (bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          opacity: Math.min(0.8, exitOpacity),
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: accentColor,
            fontWeight: '700',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          🔗 LINK IN BIO
        </div>
      </div>
    </div>
  );
};

/**
 * Remotion Composition Definition for Stories
 */
export const RemotionStory = ({ postNumber, backgroundImage, storyText, position }) => {
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
        backgroundImage,
        storyText,
        backgroundColor: '#0a0e27',
        accentColor: '#00d9ff',
        position: position || 'bottom',
      }}
    />
  );
};
