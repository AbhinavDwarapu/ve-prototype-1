import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";

/** Press shorter than this is treated as a tap (skip), longer as a hold (scrub). */
export const TAP_THRESHOLD_MS = 250;

/**
 * Scrub rate as a multiplier of normal playback, ramped up based on how long
 * the button has been held (measured from press start, inclusive of the tap
 * window). Must be sorted ascending by `afterMs`; the last entry whose
 * threshold has been crossed wins. The first entry's `afterMs` should equal
 * {@link TAP_THRESHOLD_MS} so the tap/hold boundary stays consistent.
 */
export const HOLD_STAGES: readonly { afterMs: number; rate: number }[] = [
  { afterMs: TAP_THRESHOLD_MS, rate: 2 },
  { afterMs: 1500, rate: 5 },
  { afterMs: 3500, rate: 10 },
];

const rateForHeldMs = (heldMs: number): number => {
  let rate = 0;
  for (const stage of HOLD_STAGES) {
    if (heldMs >= stage.afterMs) rate = stage.rate;
    else break;
  }
  return rate;
};

const clamp = (frame: number, max: number) =>
  Math.max(0, Math.min(max, frame));

export type HoldToSeekConfig = {
  /** Playback direction: `1` = forward, `-1` = backward. */
  direction: 1 | -1;
  /** Frames per second for the underlying composition. */
  fps: number;
  /** Total frames in the composition; the playhead is clamped to `[0, durationFrames - 1]`. */
  durationFrames: number;
  /** Seconds to jump on a single tap. */
  skipSeconds: number;
};

export type SeekHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

/**
 * Pointer handlers that implement press-and-hold scrubbing for a seek button.
 *
 * - Tap: jump `skipSeconds * fps` frames in `direction`.
 * - Hold: scrub continuously at a rate that ramps up through {@link HOLD_STAGES}
 *   the longer the pointer stays pressed, until it is released. Uses pointer
 *   capture so releasing off the button still stops the scrub.
 */
export const useHoldToSeek = ({
  direction,
  fps,
  durationFrames,
  skipSeconds,
}: HoldToSeekConfig): SeekHandlers => {
  const pause = useRemotionPlayerStore((s) => s.pause);
  const seekTo = useRemotionPlayerStore((s) => s.seekTo);
  const player = useRemotionPlayerStore((s) => s.player);

  const rafRef = useRef<number | null>(null);
  const pressStartRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const didScrubRef = useRef<boolean>(false);
  const activePointerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const maxFrame = durationFrames - 1;

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerRef.current = event.pointerId;
      pressStartRef.current = performance.now();
      lastTimestampRef.current = pressStartRef.current;
      didScrubRef.current = false;
      pause();

      const step = (timestamp: number) => {
        const heldMs = timestamp - pressStartRef.current;
        if (heldMs >= TAP_THRESHOLD_MS) {
          if (!didScrubRef.current) {
            // First frame after crossing the tap threshold: start the scrub
            // clock here so we don't emit one giant catch-up jump worth of the
            // full tap window.
            didScrubRef.current = true;
            lastTimestampRef.current = timestamp;
          } else {
            const deltaMs = timestamp - lastTimestampRef.current;
            const rate = rateForHeldMs(heldMs);
            const framesDelta = (rate * fps * deltaMs) / 1000;
            if (framesDelta >= 1) {
              const current = player?.getCurrentFrame() ?? 0;
              seekTo(
                clamp(current + Math.round(direction * framesDelta), maxFrame),
              );
              lastTimestampRef.current = timestamp;
            }
          }
        }
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [direction, fps, maxFrame, pause, player, seekTo],
  );

  const finish = useCallback(() => {
    stop();
    if (activePointerRef.current === null) return;
    const heldMs = performance.now() - pressStartRef.current;
    if (!didScrubRef.current && heldMs < TAP_THRESHOLD_MS) {
      const current = player?.getCurrentFrame() ?? 0;
      seekTo(clamp(current + direction * skipSeconds * fps, maxFrame));
    }
    activePointerRef.current = null;
  }, [direction, fps, maxFrame, player, seekTo, skipSeconds, stop]);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finish();
    },
    [finish],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finish();
    },
    [finish],
  );

  const onLostPointerCapture = useCallback(() => {
    finish();
  }, [finish]);

  return { onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture };
};
