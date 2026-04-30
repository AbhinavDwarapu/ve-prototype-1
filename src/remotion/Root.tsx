import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { COMPOSITION_DURATION_FRAMES, COMPOSITION_FPS } from "./utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Empty"
        component={MyComposition}
        durationInFrames={COMPOSITION_DURATION_FRAMES}
        fps={COMPOSITION_FPS}
        width={1280}
        height={720}
      />
    </>
  );
};
