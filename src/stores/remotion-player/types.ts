import type { PlayerRef } from "@remotion/player";

export type RemotionPlayerStoreItems = {
  player: PlayerRef | null;
  isPlaying: boolean;
};

export type RemotionPlayerStoreActions = {
  setPlayer: (player: PlayerRef | null) => void;
  play: () => void;
  pause: () => void;
  seekTo: (frame: number) => void;
};

export type RemotionPlayerStore = RemotionPlayerStoreItems &
  RemotionPlayerStoreActions;
