import React from 'react';
import { Composition } from 'remotion';
import { ReelComposition } from './ReelComposition';

/**
 * Main Remotion entry point
 * This registers all compositions available for rendering
 */

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="InstagramReel"
        component={ReelComposition}
        durationInFrames={30 * 30} // 30 seconds @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          postNumber: 35,
          hookText: 'To the 3am version of you.',
          carouselSlides: [],
          caption: 'Instagram Reel Composition',
          backgroundColor: '#0a0e27',
          accentColor: '#00d9ff',
        }}
      />
    </>
  );
};
