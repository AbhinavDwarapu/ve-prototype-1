export type ProjectDraft = {
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  pixelsPerSecond: number;
};

export type ClipDraft = {
  startFrame: number;
  durationInFrames: number;
  endFrame: number;
  playbackRate: number;
  volume: number;
  trimBefore: number;
  trimAfter: number;
};
