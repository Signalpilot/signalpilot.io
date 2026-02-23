import React from 'react';
import {
  Composition,
  useVideoConfig,
  Img,
  useCurrentFrame,
  interpolate,
  Easing,
  Audio,
} from 'remotion';

/**
 * Instagram Reel Composition
 * 1080x1920, 30fps, 30 seconds
 *
 * Structure:
 * 0-3 sec: Hook text (animated slide-in from bottom)
 * 3-24 sec: Carousel slides with dissolve transitions
 * 24-30 sec: CTA overlay (animated slide-in from bottom)
 */
export const ReelComposition = ({
  postNumber,
  hookText,
  carouselSlides,
  caption,
  backgroundColor = '#0a0e27',
  accentColor = '#00d9ff',
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Hook phase: 0-3 seconds (0-90 frames @ 30fps)
  const hookEnd = Math.round(3 * fps);
  const hookProgress = Math.min(frame / hookEnd, 1);
  const hookOpacity = interpolate(hookProgress, [0, 0.1, 1], [0, 1, 1]);
  const hookYOffset = interpolate(
    hookProgress,
    [0, 1],
    [200, 0],
    { easing: Easing.out(Easing.cubic) }
  );

  // Carousel phase: 3-24 seconds (90-720 frames)
  const carouselStart = hookEnd;
  const carouselDuration = Math.round(21 * fps); // 21 seconds for slides
  const carouselEnd = carouselStart + carouselDuration;
  const slideCount = carouselSlides.length;
  const secondsPerSlide = carouselDuration / fps / slideCount; // ~2.1 sec per slide

  let currentSlideIndex = 0;
  let slideProgress = 0;

  if (frame >= carouselStart && frame < carouselEnd) {
    const carouselFrame = frame - carouselStart;
    const slideFrames = carouselDuration / slideCount;
    currentSlideIndex = Math.floor(carouselFrame / slideFrames);
    slideProgress = (carouselFrame % slideFrames) / slideFrames;
  } else if (frame >= carouselEnd) {
    currentSlideIndex = slideCount - 1;
    slideProgress = 1;
  }

  // CTA phase: 24-30 seconds (720-900 frames)
  const ctaStart = carouselEnd;
  const ctaPhaseFrame = Math.max(0, frame - ctaStart);
  const ctaProgress = Math.min(ctaPhaseFrame / (6 * fps), 1);
  const ctaOpacity = interpolate(ctaProgress, [0, 0.1, 1], [0, 1, 1]);
  const ctaYOffset = interpolate(
    ctaProgress,
    [0, 1],
    [100, 0],
    { easing: Easing.out(Easing.cubic) }
  );

  // Dissolve transition between slides
  const nextSlideOpacity = interpolate(
    slideProgress,
    [0.8, 1],
    [0, 1]
  );
  const currentSlideOpacity = interpolate(
    slideProgress,
    [0, 0.2],
    [1, 0]
  );

  // Helper: extract key insight from caption (first 2 lines)
  const hookTextContent = hookText || (() => {
    const lines = caption.split('\n');
    return lines.slice(0, 2).join(' ').substring(0, 60) + '...';
  })();

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
      {/* CAROUSEL SLIDES */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Current slide */}
        {carouselSlides[currentSlideIndex] && (
          <Img
            src={carouselSlides[currentSlideIndex]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: currentSlideOpacity,
              position: 'absolute',
            }}
          />
        )}

        {/* Next slide (fading in) */}
        {currentSlideIndex + 1 < carouselSlides.length && (
          <Img
            src={carouselSlides[currentSlideIndex + 1]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: nextSlideOpacity,
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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* HOOK TEXT (0-3 seconds) */}
      {frame < hookEnd && (
        <div
          style={{
            position: 'absolute',
            bottom: 120 + hookYOffset,
            left: 20,
            right: 20,
            textAlign: 'center',
            opacity: hookOpacity,
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              lineHeight: 1.2,
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {hookTextContent}
          </h1>
        </div>
      )}

      {/* SLIDE COUNTER (subtle, upper right) */}
      {frame >= carouselStart && frame < carouselEnd && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 30,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 16,
            fontWeight: '600',
            zIndex: 20,
          }}
        >
          {currentSlideIndex + 1}/{slideCount}
        </div>
      )}

      {/* CTA OVERLAY (24-30 seconds) */}
      {frame >= ctaStart && (
        <div
          style={{
            position: 'absolute',
            bottom: 40 + ctaYOffset,
            left: 20,
            right: 20,
            textAlign: 'center',
            opacity: ctaOpacity,
            zIndex: 30,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}22)`,
              border: `2px solid ${accentColor}`,
              borderRadius: 12,
              padding: '16px 20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p
              style={{
                color: accentColor,
                fontSize: 18,
                fontWeight: '700',
                margin: '8px 0 0 0',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              Save this 📌
            </p>
            <p
              style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600',
                margin: '4px 0 0 0',
                opacity: 0.9,
              }}
            >
              Link in bio 🔗
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Remotion Composition Definition
 * Register the Reel for rendering
 */
export const RemotionRoot = ({ postNumber, carouselSlides, hookText, caption }) => {
  return (
    <Composition
      id="InstagramReel"
      component={ReelComposition}
      durationInFrames={30 * 30} // 30 seconds @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        postNumber,
        carouselSlides,
        hookText,
        caption,
        backgroundColor: '#0a0e27',
        accentColor: '#00d9ff',
      }}
    />
  );
};
