import type { PlayerRef } from "@remotion/player";
import type { StoreApi } from "zustand";
import type { RemotionPlayerStore, RemotionPlayerStoreActions } from "./types";

type SetState = StoreApi<RemotionPlayerStore>["setState"];
type GetState = StoreApi<RemotionPlayerStore>["getState"];

export const createRemotionPlayerActions = (
  set: SetState,
  get: GetState,
): RemotionPlayerStoreActions => {
  let detachPlayback: (() => void) | null = null;

  const cleanup = () => {
    detachPlayback?.();
    detachPlayback = null;
  };

  return {
    setPlayer: (player: PlayerRef | null) => {
      cleanup();

      if (!player) {
        set({ player: null, isPlaying: false });
        return;
      }

      const sync = () => {
        if (get().player !== player) {
          return;
        }

        const next = player.isPlaying();
        if (get().isPlaying !== next) {
          set({ isPlaying: next });
        }
      };

      player.addEventListener("play", sync);
      player.addEventListener("pause", sync);
      player.addEventListener("ended", sync);

      detachPlayback = () => {
        player.removeEventListener("play", sync);
        player.removeEventListener("pause", sync);
        player.removeEventListener("ended", sync);
      };

      set({ player, isPlaying: player.isPlaying() });
    },

    play: () => {
      get().player?.play();
    },

    pause: () => {
      get().player?.pause();
    },

    seekTo: (frame: number) => {
      get().player?.seekTo(frame);
    },
  };
};
