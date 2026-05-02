"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback } from "react";
import { MyComposition } from "../../remotion/Composition";
import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";

export default function PlayerPage() {
  const fps = useCompositionSettingsStore((s) => s.fps);
  const durationSec = useCompositionSettingsStore((s) => s.durationSec);
  const width = useCompositionSettingsStore((s) => s.width);
  const height = useCompositionSettingsStore((s) => s.height);
  const durationInFrames = getDurationInFrames(fps, durationSec);
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
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={width / 2}
        compositionHeight={height / 2}
        ref={playerRef}
        overflowVisible
      />
    </div>
  );
}
