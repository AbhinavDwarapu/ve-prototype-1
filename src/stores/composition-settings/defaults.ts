export const compositionSettingsDefaults = {
  fps: 60,
  durationSec: 60,
  width: 1280,
  height: 720,
  pixelsPerSecond: 100,
} as const;

export function getDurationInFrames(fps: number, durationSec: number) {
  return fps * durationSec;
}
