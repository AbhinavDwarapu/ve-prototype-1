import type { PlayerLayoutRect } from "@/stores/timeline/types";

export const MIN_PLAYER_LAYOUT_SIZE = 8;

export function defaultPlayerLayout(
  compositionWidth: number,
  compositionHeight: number,
): PlayerLayoutRect {
  return {
    left: 0,
    top: 0,
    width: compositionWidth,
    height: compositionHeight,
  };
}

export function resolvePlayerLayout(
  playerLayout: PlayerLayoutRect | undefined,
  compositionWidth: number,
  compositionHeight: number,
): PlayerLayoutRect {
  if (
    playerLayout &&
    playerLayout.width > 0 &&
    playerLayout.height > 0
  ) {
    return { ...playerLayout };
  }
  return defaultPlayerLayout(compositionWidth, compositionHeight);
}

export function clampPlayerLayout(
  rect: PlayerLayoutRect,
  compositionWidth: number,
  compositionHeight: number,
  minSize = MIN_PLAYER_LAYOUT_SIZE,
): PlayerLayoutRect {
  let { left, top, width, height } = rect;
  width = Math.max(minSize, Math.round(width));
  height = Math.max(minSize, Math.round(height));
  left = Math.round(left);
  top = Math.round(top);

  left = Math.max(0, Math.min(left, compositionWidth - minSize));
  top = Math.max(0, Math.min(top, compositionHeight - minSize));

  width = Math.min(width, compositionWidth - left);
  height = Math.min(height, compositionHeight - top);
  width = Math.max(minSize, Math.round(width));
  height = Math.max(minSize, Math.round(height));

  return { left, top, width, height };
}
