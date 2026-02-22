import { Config } from 'remotion';

Config.Rendering.setImageFormat('png');
Config.Rendering.setCodec('h264');
Config.Rendering.setPixelFormat('yuv420p');
Config.Rendering.setCrf(18);

// Optimize for faster rendering
Config.Rendering.setNumberOfGifLoops(null);
Config.Rendering.setLogLevel('verbose');
