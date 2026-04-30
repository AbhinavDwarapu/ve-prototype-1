import type { RefObject } from "react";

/** Pixels per second at scale 1, used for time ↔ horizontal position conversions. */
export const PX_PER_SECOND = 100;
export const COMPOSITION_FPS = 60;
export const COMPOSITION_DURATION_SEC = 60;
export const COMPOSITION_DURATION_FRAMES =
  COMPOSITION_FPS * COMPOSITION_DURATION_SEC;

/** Thresholds and speeds for horizontal auto-scroll while scrubbing near container edges. */
export const SCRUB_CONFIG = {
  scrollThreshold: 50,
  scrollSpeed: 15,
  leftScrollOffset: 128,
} as const;

/**
 * Clamps a numeric value to the inclusive range {@code [min, max]}.
 *
 * @param value - The value to clamp.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns {@code value} constrained to {@code [min, max]}.
 */
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Computes the total width in pixels of the timeline ruler at the given scale.
 *
 * @param durationInFrames - Total number of frames in the composition.
 * @param fps - Frames per second.
 * @param scale - Horizontal zoom factor (1 = base scale).
 * @returns Timeline width in pixels, or {@code 0} if any input is non-positive.
 */
export function getTimelineWidth(
  durationInFrames: number,
  fps: number,
  scale: number,
) {
  if (durationInFrames <= 0 || fps <= 0 || scale <= 0) {
    return 0;
  }

  return (durationInFrames / fps) * PX_PER_SECOND * scale;
}

/**
 * Returns the width in pixels of a single frame along the timeline.
 *
 * @param durationInFrames - Total number of frames.
 * @param timelineWidth - Full width of the timeline in pixels.
 * @returns Pixel width per frame, or {@code 0} if inputs are invalid.
 */
export function getFrameWidth(durationInFrames: number, timelineWidth: number) {
  if (durationInFrames <= 0 || timelineWidth <= 0) {
    return 0;
  }

  return timelineWidth / durationInFrames;
}

/**
 * Converts an x position in timeline space to a frame index.
 *
 * <p>Assumes:
 * <ul>
 *   <li>{@code x = 0} is the start of frame 0</li>
 *   <li>{@code x = timelineWidth} is the end of the last frame</li>
 *   <li>Valid frames are {@code 0 .. durationInFrames - 1}</li>
 * </ul>
 *
 * @param x - Horizontal position in timeline coordinates.
 * @param timelineWidth - Full width of the timeline in pixels.
 * @param durationInFrames - Total number of frames.
 * @returns Clamped frame index, or {@code 0} if dimensions are invalid.
 */
export function getFrameFromX(
  x: number,
  timelineWidth: number,
  durationInFrames: number,
) {
  if (durationInFrames <= 0 || timelineWidth <= 0) {
    return 0;
  }

  const clampedX = clamp(x, 0, timelineWidth);
  const frameWidth = timelineWidth / durationInFrames;

  return clamp(Math.floor(clampedX / frameWidth), 0, durationInFrames - 1);
}

/**
 * Returns the left edge x-coordinate of a frame in timeline space.
 *
 * @param frame - Frame index (will be clamped to valid range).
 * @param durationInFrames - Total number of frames.
 * @param timelineWidth - Full width of the timeline in pixels.
 * @returns Left edge x in pixels, or {@code 0} if dimensions are invalid.
 */
export function getXFromFrame(
  frame: number,
  durationInFrames: number,
  timelineWidth: number,
) {
  if (durationInFrames <= 0 || timelineWidth <= 0) {
    return 0;
  }

  const clampedFrame = clamp(frame, 0, durationInFrames - 1);
  const frameWidth = timelineWidth / durationInFrames;

  return clampedFrame * frameWidth;
}

/**
 * Returns the horizontal center of a frame slot in timeline space.
 * <p>Useful for drawing a playhead centered on the current frame.
 *
 * @param frame - Frame index.
 * @param durationInFrames - Total number of frames.
 * @param timelineWidth - Full width of the timeline in pixels.
 * @returns Center x-coordinate in pixels.
 */
export function getFrameCenterX(
  frame: number,
  durationInFrames: number,
  timelineWidth: number,
) {
  const frameWidth = getFrameWidth(durationInFrames, timelineWidth);
  return getXFromFrame(frame, durationInFrames, timelineWidth) + frameWidth / 2;
}

/**
 * Maps a viewport (screen) pointer x-coordinate to timeline-local x.
 *
 * @param pointerX - Client x from the pointer event (e.g. {@code clientX}).
 * @param trackLeft - Left edge of the track element in viewport coordinates.
 * @returns x position relative to the start of the timeline track.
 */
export function getTimelineXFromPointer(pointerX: number, trackLeft: number) {
  return pointerX - trackLeft;
}

/**
 * Resolves the frame under the pointer given the track DOM node and timeline dimensions.
 *
 * @param pointerX - Client x from the pointer event.
 * @param trackRef - Ref to the scrollable track element (must be mounted).
 * @param trackTotalWidth - Total scrollable width of the timeline content.
 * @param durationInFrames - Total number of frames.
 * @returns Frame index, or {@code null} if {@code trackRef.current} is not available.
 */
export function calculateFrameFromPointer(
  pointerX: number,
  trackRef: RefObject<HTMLDivElement | null>,
  trackTotalWidth: number,
  durationInFrames: number,
) {
  if (!trackRef.current) {
    return null;
  }

  const trackLeft = trackRef.current.getBoundingClientRect().left;

  return getFrameFromX(
    getTimelineXFromPointer(pointerX, trackLeft),
    trackTotalWidth,
    durationInFrames,
  );
}

/**
 * Converts a frame index to time in seconds.
 *
 * @param frame - Frame index.
 * @param fps - Frames per second.
 * @returns Seconds corresponding to {@code frame}, or {@code 0} if {@code fps <= 0}.
 */
export function getSecondsFromFrame(frame: number, fps: number) {
  if (fps <= 0) return 0;
  return frame / fps;
}

/**
 * Converts a time in seconds to the nearest frame index (rounded).
 *
 * @param seconds - Time in seconds (negative values clamp to 0).
 * @param fps - Frames per second.
 * @returns Non-negative frame index, or {@code 0} if {@code fps <= 0}.
 */
export function getFrameFromSeconds(seconds: number, fps: number) {
  if (fps <= 0) return 0;
  return Math.max(0, Math.round(seconds * fps));
}

/**
 * Converts elapsed seconds to horizontal position on the ruler.
 *
 * @param seconds - Time in seconds (negative values clamp to 0).
 * @param scale - Horizontal zoom factor.
 * @param pxPerSecond - Pixels per second at scale 1; defaults to {@link PX_PER_SECOND}.
 * @returns x offset in pixels.
 */
export function getXFromSeconds(
  seconds: number,
  scale: number,
  pxPerSecond = PX_PER_SECOND,
) {
  return Math.max(0, seconds * pxPerSecond * scale);
}

/**
 * Converts a horizontal ruler position back to time in seconds.
 *
 * @param x - Horizontal offset in pixels.
 * @param scale - Horizontal zoom factor.
 * @param pxPerSecond - Pixels per second at scale 1; defaults to {@link PX_PER_SECOND}.
 * @returns Non-negative seconds, or {@code 0} if scale or pxPerSecond is non-positive.
 */
export function getSecondsFromX(
  x: number,
  scale: number,
  pxPerSecond = PX_PER_SECOND,
) {
  if (scale <= 0 || pxPerSecond <= 0) return 0;
  return Math.max(0, x / (pxPerSecond * scale));
}

/**
 * Computes how much to scroll horizontally when the pointer is near the container edges
 * during scrubbing (edge “push” behavior).
 *
 * @param pointerX - Client x of the pointer.
 * @param containerBounds - {@code left} and {@code right} of the scroll container in viewport coords.
 * @returns Pixel delta to apply per tick (negative = scroll left, positive = scroll right, {@code 0} = none).
 */
export function calculateAutoScrollAmount(
  pointerX: number,
  containerBounds: { left: number; right: number },
): number {
  const { scrollThreshold, scrollSpeed, leftScrollOffset } = SCRUB_CONFIG;

  const leftEdge = containerBounds.left + leftScrollOffset;
  const rightEdge = containerBounds.right;

  if (pointerX < leftEdge + scrollThreshold) {
    const distance = leftEdge + scrollThreshold - pointerX;
    const intensity = Math.min(distance / scrollThreshold, 1);
    return -scrollSpeed * intensity;
  }

  if (pointerX > rightEdge - scrollThreshold) {
    const distance = pointerX - (rightEdge - scrollThreshold);
    const intensity = Math.min(distance / scrollThreshold, 1);
    return scrollSpeed * intensity;
  }

  return 0;
}
