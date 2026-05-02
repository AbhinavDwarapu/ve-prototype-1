import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { useTimelineStore } from "@/stores/timeline/store";
import type { Asset, Clip, Layer, Timeline } from "@/stores/timeline/types";
import { ClipAudio, ClipImage, ClipVideo } from "./components";
import { prefetchTimelineAssets } from "./preload-assets";

function renderClip(clip: Clip, src: string) {
  const mediaProps = {
    playbackRate: clip.playbackRate ?? 1,
    volume: clip.volume ?? 1,
    trimBefore: clip.trimBefore || undefined,
    trimAfter: clip.trimAfter || undefined,
  };

  switch (clip.kind) {
    case "video":
      return <ClipVideo src={src} {...mediaProps} />;
    case "audio":
      return <ClipAudio src={src} {...mediaProps} />;
    case "image":
      return <ClipImage src={src} />;
    default:
      return null;
  }
}

function getTimelineAssets({
  assets,
  clips,
  layers,
  timeline,
}: {
  assets: Record<string, Asset>;
  clips: Record<string, Clip>;
  layers: Record<string, Layer>;
  timeline: Timeline | null;
}) {
  if (!timeline) {
    return [];
  }

  const timelineAssets = new Map<string, Asset>();

  for (const layerId of timeline.layerIds) {
    const layer = layers[layerId];
    if (!layer) {
      continue;
    }

    for (const clipId of layer.clipIds) {
      const clip = clips[clipId];
      const asset = clip ? assets[clip.assetId] : null;
      if (asset) {
        timelineAssets.set(asset.src, asset);
      }
    }
  }

  return [...timelineAssets.values()];
}

export const MyComposition = () => {
  const { fps } = useVideoConfig();
  const pixelsPerSecond = useCompositionSettingsStore((s) => s.pixelsPerSecond);
  const [prefetchedAssetKey, setPrefetchedAssetKey] = useState<string | null>(
    null,
  );

  const currentTimelineId = useTimelineStore((s) => s.currentTimelineId);
  const timelines = useTimelineStore((s) => s.timelines);
  const layers = useTimelineStore((s) => s.layers);
  const clips = useTimelineStore((s) => s.clips);
  const assets = useTimelineStore((s) => s.assets);

  const timeline = currentTimelineId ? timelines[currentTimelineId] : null;
  const timelineAssets = useMemo(
    () => getTimelineAssets({ assets, clips, layers, timeline }),
    [assets, clips, layers, timeline],
  );
  const assetPrefetchKey = useMemo(
    () => {
      const assetsToPrefetch = timelineAssets
        .map(({ src, type }) => ({ src, type }))
        .sort((a, b) =>
          `${a.type}:${a.src}`.localeCompare(`${b.type}:${b.src}`),
        );

      return JSON.stringify(assetsToPrefetch);
    },
    [timelineAssets],
  );
  const assetsToPrefetch = useMemo(
    () => JSON.parse(assetPrefetchKey) as Array<Pick<Asset, "src" | "type">>,
    [assetPrefetchKey],
  );
  const assetsPrefetched =
    assetsToPrefetch.length === 0 || prefetchedAssetKey === assetPrefetchKey;

  useEffect(() => {
    if (assetsToPrefetch.length === 0) {
      return;
    }

    let cancelled = false;
    const timelineAssetPrefetch = prefetchTimelineAssets(assetsToPrefetch);

    timelineAssetPrefetch
      .waitUntilDone()
      .then(() => {
        if (!cancelled) {
          setPrefetchedAssetKey(assetPrefetchKey);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Unable to prefetch timeline assets", error);
        }
      });

    return () => {
      cancelled = true;
      timelineAssetPrefetch.free();
    };
  }, [assetPrefetchKey, assetsToPrefetch]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {assetsPrefetched &&
        timeline?.layerIds.flatMap((layerId) => {
          const layer = layers[layerId];
          if (!layer) return [];

          return layer.clipIds.map((clipId) => {
            const clip = clips[clipId];
            if (!clip) return null;

            const asset = assets[clip.assetId];
            if (!asset) return null;

            const from = Math.round((clip.startPx / pixelsPerSecond) * fps);
            const durationInFrames = Math.max(
              1,
              Math.round((clip.widthPx / pixelsPerSecond) * fps),
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
