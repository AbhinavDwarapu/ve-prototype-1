import { create } from "zustand";
import { createRemotionPlayerActions } from "./actions";
import type { RemotionPlayerStore } from "./types";

export const useRemotionPlayerStore = create<RemotionPlayerStore>(
  (set, get) => ({
    player: null,
    isPlaying: false,
    ...createRemotionPlayerActions(set, get),
  }),
);
