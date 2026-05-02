import {
  useCallback,
  useMemo,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useCurrentFrame, useCurrentScale, useVideoConfig } from "remotion";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import { useTimelineStore } from "@/stores/timeline/store";
import type { Clip, PlayerLayoutRect } from "@/stores/timeline/types";
import { clampPlayerLayout, resolvePlayerLayout } from "../player-layout-utils";

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

type UseClipLayoutInteractionOptions = {
  clip: Clip;
  durationInFrames: number;
};

export function useClipLayoutInteraction({
  clip,
  durationInFrames,
}: UseClipLayoutInteractionOptions) {
  const { width: compW, height: compH } = useVideoConfig();
  const scale = useCurrentScale();
  const localFrame = useCurrentFrame();
  const isPlaying = useRemotionPlayerStore((s) => s.isPlaying);
  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const selectClips = useTimelineStore((s) => s.selectClips);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const [isDragging, setIsDragging] = useState(false);

  const layout = useMemo(
    () => resolvePlayerLayout(clip.playerLayout, compW, compH),
    [clip.playerLayout, compW, compH],
  );

  const frameVisible = localFrame >= 0 && localFrame < durationInFrames;
  const isSelected = selectedClipIds.includes(clip.id);
  const canEditLayout =
    !isPlaying &&
    frameVisible &&
    (clip.kind === "video" || clip.kind === "image");
  const showResizeHandles = canEditLayout && isSelected;

  const commitLayout = useCallback(
    (next: PlayerLayoutRect) => {
      updateClip(clip.id, {
        playerLayout: clampPlayerLayout(next, compW, compH),
      });
    },
    [clip.id, compH, compW, updateClip],
  );

  const startMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      const initialX = event.clientX;
      const initialY = event.clientY;
      const startRect = resolvePlayerLayout(clip.playerLayout, compW, compH);
      setIsDragging(true);

      const onPointerMove = (pointerMoveEvent: PointerEvent) => {
        const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
        const offsetY = (pointerMoveEvent.clientY - initialY) / scale;
        commitLayout({
          left: startRect.left + offsetX,
          top: startRect.top + offsetY,
          width: startRect.width,
          height: startRect.height,
        });
      };

      const stopDragging = () => {
        setIsDragging(false);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDragging);
        window.removeEventListener("pointercancel", stopDragging);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", stopDragging, { once: true });
      window.addEventListener("pointercancel", stopDragging, { once: true });
    },
    [clip.playerLayout, commitLayout, compH, compW, scale],
  );

  const onWrapperPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (event.button !== 0) return;
      selectClips([clip.id]);
      if (canEditLayout) {
        startMove(event);
      }
    },
    [canEditLayout, clip.id, selectClips, startMove],
  );

  const onResizePointerDown = useCallback(
    (corner: ResizeCorner, event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (event.button !== 0) return;

      selectClips([clip.id]);

      const initialX = event.clientX;
      const initialY = event.clientY;
      const startRect = resolvePlayerLayout(clip.playerLayout, compW, compH);
      const isLeft = corner === "nw" || corner === "sw";
      const isTop = corner === "nw" || corner === "ne";
      setIsDragging(true);

      const onPointerMove = (pointerMoveEvent: PointerEvent) => {
        const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
        const offsetY = (pointerMoveEvent.clientY - initialY) / scale;

        commitLayout({
          left: startRect.left + (isLeft ? offsetX : 0),
          top: startRect.top + (isTop ? offsetY : 0),
          width: startRect.width + (isLeft ? -offsetX : offsetX),
          height: startRect.height + (isTop ? -offsetY : offsetY),
        });
      };

      const stopDragging = () => {
        setIsDragging(false);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDragging);
        window.removeEventListener("pointercancel", stopDragging);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", stopDragging, { once: true });
      window.addEventListener("pointercancel", stopDragging, { once: true });
    },
    [clip.id, clip.playerLayout, commitLayout, compH, compW, scale, selectClips],
  );

  return {
    layout,
    scale,
    canEditLayout,
    showResizeHandles,
    isDragging,
    onWrapperPointerDown,
    onResizePointerDown,
  };
}
