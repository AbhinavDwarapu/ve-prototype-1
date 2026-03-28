import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from "react";
import type { PlayerRef } from "@remotion/player";
import { calculateFrameFromPointer, calculateAutoScrollAmount } from "../utils";

interface UseTimelineScrubbingOptions {
  timelineRef: RefObject<HTMLDivElement | null>;
  layerRef: RefObject<HTMLDivElement | null>;
  player: PlayerRef | null;
  layerTotalWidth: number;
  durationInFrames: number;
  getFrameFromPx: (x: number, totalWidth: number, duration: number) => number;
}

export function useTimelineScrubbing({
  timelineRef,
  layerRef,
  player,
  layerTotalWidth,
  durationInFrames,
  getFrameFromPx,
}: UseTimelineScrubbingOptions) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const lastPointerX = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const cancelLoop = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  const performScrub = useCallback(
    (pointerX: number) => {
      if (!layerRef.current || !timelineRef.current || !player) {
        return;
      }

      const frame = calculateFrameFromPointer(
        pointerX,
        layerRef,
        layerTotalWidth,
        durationInFrames,
      );

      if (frame !== null) {
        player.seekTo(frame);
      }
    },
    [
      layerRef,
      timelineRef,
      player,
      layerTotalWidth,
      durationInFrames,
      getFrameFromPx,
    ],
  );

  const autoScrollAndSeek = useCallback(() => {
    if (!timelineRef.current || lastPointerX.current === null) {
      animationFrameId.current = null;
      return;
    }

    const { left, right } = timelineRef.current.getBoundingClientRect();
    const pointerX = lastPointerX.current;

    const scrollAmount = calculateAutoScrollAmount(pointerX, { left, right });

    if (scrollAmount !== 0) {
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: "auto" });
    }

    performScrub(pointerX);

    animationFrameId.current = requestAnimationFrame(autoScrollAndSeek);
  }, [timelineRef, performScrub]);

  const startScrubbing = useCallback(
    (pointerX: number) => {
      lastPointerX.current = pointerX;
      setIsScrubbing(true);
      performScrub(pointerX);
    },
    [performScrub],
  );

  const updatePointer = useCallback((pointerX: number) => {
    lastPointerX.current = pointerX;
  }, []);

  const stopScrubbing = useCallback(() => {
    setIsScrubbing(false);
    lastPointerX.current = null;
    cancelLoop();
  }, [cancelLoop]);

  useEffect(() => {
    if (!isScrubbing) {
      cancelLoop();
      return;
    }

    animationFrameId.current = requestAnimationFrame(autoScrollAndSeek);

    const handlePointerMove = (e: PointerEvent) => {
      lastPointerX.current = e.clientX;
    };

    const handlePointerUp = () => {
      stopScrubbing();
    };

    const handlePointerCancel = () => {
      stopScrubbing();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      cancelLoop();
    };
  }, [isScrubbing, autoScrollAndSeek, stopScrubbing, cancelLoop]);

  return {
    isScrubbing,
    startScrubbing,
    updatePointer,
    stopScrubbing,
    performScrub,
  };
}
