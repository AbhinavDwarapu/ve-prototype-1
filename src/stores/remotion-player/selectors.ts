import type { RemotionPlayerStore } from "./types";

export const selectPlayer = (state: RemotionPlayerStore) => state.player;

export const selectIsPlaying = (state: RemotionPlayerStore) => state.isPlaying;

export const selectSetPlayer = (state: RemotionPlayerStore) => state.setPlayer;

export const selectPlay = (state: RemotionPlayerStore) => state.play;

export const selectPause = (state: RemotionPlayerStore) => state.pause;

export const selectSeekTo = (state: RemotionPlayerStore) => state.seekTo;
