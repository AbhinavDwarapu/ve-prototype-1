import type { Clip, ValidAssetType } from "@/stores/timeline/types";
import type { ClipDraft, ProjectDraft } from "./types";

export const mediaTypes = new Set<ValidAssetType>(["audio", "video"]);

const numberOrFallback = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback;

export const roundToInt = (value: number, fallback: number, min: number) =>
  Math.max(min, Math.round(numberOrFallback(value, fallback)));

export const clampNumber = (value: number, fallback: number, min: number) =>
  Math.max(min, numberOrFallback(value, fallback));

export function getProjectDraft(settings: ProjectDraft): ProjectDraft {
  return {
    width: settings.width,
    height: settings.height,
    fps: settings.fps,
    durationSec: settings.durationSec,
    pixelsPerSecond: settings.pixelsPerSecond,
  };
}

export function getClipDraft(
  clip: Clip,
  fps: number,
  pixelsPerSecond: number,
): ClipDraft {
  const startFrame = roundToInt((clip.startPx / pixelsPerSecond) * fps, 0, 0);
  const durationInFrames = roundToInt(
    (clip.widthPx / pixelsPerSecond) * fps,
    1,
    1,
  );

  return {
    startFrame,
    durationInFrames,
    endFrame: startFrame + durationInFrames,
    playbackRate: clip.playbackRate ?? 1,
    volume: clip.volume ?? 1,
    trimBefore: clip.trimBefore ?? 0,
    trimAfter: clip.trimAfter ?? 0,
  };
}
