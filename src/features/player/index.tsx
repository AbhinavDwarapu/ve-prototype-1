"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback } from "react";
import { MyComposition } from "../../remotion/Composition";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";

export default function PlayerPage() {
  const setPlayer = useRemotionPlayerStore((s) => s.setPlayer);

  const playerRef = useCallback(
    (node: PlayerRef | null) => {
      setPlayer(node);
    },
    [setPlayer],
  );

  return (
    <div className="flex flex-col items-center justify-center aspect-video ">
      <Player
        component={MyComposition}
        durationInFrames={60 * 60}
        fps={60}
        compositionWidth={1280 / 2}
        compositionHeight={720 / 2}
        ref={playerRef}
      />
    </div>
  );
}
