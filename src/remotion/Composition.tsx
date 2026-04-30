import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { useTimelineStore } from "@/stores/timeline/store";
import type { Clip } from "@/stores/timeline/types";
import { ClipAudio, ClipImage, ClipVideo } from "./components";
import { PX_PER_SECOND } from "./utils";

function renderClip(clip: Clip, src: string) {
  switch (clip.kind) {
    case "video":
      return <ClipVideo src={src} />;
    case "audio":
      return <ClipAudio src={src} />;
    case "image":
      return <ClipImage src={src} />;
    default:
      return null;
  }
}

export const MyComposition = () => {
  const { fps } = useVideoConfig();

  const currentTimelineId = useTimelineStore((s) => s.currentTimelineId);
  const timelines = useTimelineStore((s) => s.timelines);
  const layers = useTimelineStore((s) => s.layers);
  const clips = useTimelineStore((s) => s.clips);
  const assets = useTimelineStore((s) => s.assets);

  const timeline = currentTimelineId ? timelines[currentTimelineId] : null;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {timeline?.layerIds.flatMap((layerId) => {
        const layer = layers[layerId];
        if (!layer) return [];

        return layer.clipIds.map((clipId) => {
          const clip = clips[clipId];
          if (!clip) return null;

          const asset = assets[clip.assetId];
          if (!asset) return null;

          const from = Math.round((clip.startPx / PX_PER_SECOND) * fps);
          const durationInFrames = Math.max(
            1,
            Math.round((clip.widthPx / PX_PER_SECOND) * fps),
          );

          return (
            <Sequence
              key={clip.id}
              from={from}
              durationInFrames={durationInFrames}
              premountFor={fps}
            >
              {renderClip(clip, asset.src)}
            </Sequence>
          );
        });
      })}
    </AbsoluteFill>
  );
};
