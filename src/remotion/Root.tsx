import React from "react";
import { Composition } from "remotion";
import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  const fps = useCompositionSettingsStore((s) => s.fps);
  const durationSec = useCompositionSettingsStore((s) => s.durationSec);
  const width = useCompositionSettingsStore((s) => s.width);
  const height = useCompositionSettingsStore((s) => s.height);
  const durationInFrames = getDurationInFrames(fps, durationSec);

  return (
    <>
      <Composition
        id="Empty"
        component={MyComposition}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
