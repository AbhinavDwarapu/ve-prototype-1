import type { CallbackListener, PlayerRef } from "@remotion/player";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to `frameupdate` only — re-renders while the playhead moves.
 * Prefer `useRemotionPlayerStore(s => s.isPlaying)` for play / pause UI without per-frame updates.
 */
export const useCurrentPlayerFrame = (player: PlayerRef | null): number => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!player) {
        return () => undefined;
      }
      const updater: CallbackListener<"frameupdate"> = () => {
        onStoreChange();
      };
      player.addEventListener("frameupdate", updater);
      return () => {
        player.removeEventListener("frameupdate", updater);
      };
    },
    [player],
  );

  return useSyncExternalStore(
    subscribe,
    () => player?.getCurrentFrame() ?? 0,
    () => 0,
  );
};
