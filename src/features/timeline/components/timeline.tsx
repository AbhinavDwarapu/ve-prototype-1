import { useMemo } from "react";
import {
  Timeline as LibraryTimeline,
  type LayerMap,
  type TimelineClassNames,
  type TimelineProps,
} from "timeline-as-library";
import { useCurrentPlayerFrame } from "@/remotion/hooks/use-current-player-frame";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import { useTimelineStore } from "@/stores/timeline/store";
import type {
  Clip as StoreClip,
  Layer as StoreLayer,
} from "@/stores/timeline/types";
import "../styles.css";

const DEFAULT_CLASS_NAMES: TimelineClassNames = {
  root: "relative overflow-x-auto overflow-y-hidden rounded-sm bg-neutral-900 shadow-lg demo-timeline",
  layer:
    "relative h-full w-full rounded-md bg-neutral-800/60 flex items-center px-2 text-xs text-neutral-400",
  clip: "h-full w-full rounded-md bg-indigo-500 shadow ring-1 ring-indigo-300/40",
  selectedClip:
    "bg-indigo-400 ring-2 ring-white shadow-[0_0_0_3px_rgba(99,102,241,0.45)]",
  moveable: "demo-moveable",
  playhead: "demo-playhead",
  ticks: "demo-ticks",
  tick: "demo-tick",
  majorTick: "demo-tick-major",
  tickLabel: "demo-tick-label",
  playheadHead: "demo-playhead-head",
};

export type TimelineWrapperProps = Partial<
  Pick<
    TimelineProps,
    "pixelsPerSecond" | "durationSec" | "classNames" | "options"
  >
>;

export default function TimelineComponent({
  pixelsPerSecond: pixelsPerSecondProp,
  durationSec: durationSecProp,
  options,
  classNames,
}: TimelineWrapperProps = {}) {
  const storePixelsPerSecond = useCompositionSettingsStore(
    (s) => s.pixelsPerSecond,
  );
  const storeDurationSec = useCompositionSettingsStore((s) => s.durationSec);
  const fps = useCompositionSettingsStore((s) => s.fps);
  const pixelsPerSecond = pixelsPerSecondProp ?? storePixelsPerSecond;
  const durationSec = durationSecProp ?? storeDurationSec;

  const player = useRemotionPlayerStore((s) => s.player);
  const seekTo = useRemotionPlayerStore((s) => s.seekTo);
  const currentFrame = useCurrentPlayerFrame(player);
  const currentTimeSec = currentFrame / fps;

  const currentTimelineId = useTimelineStore((s) => s.currentTimelineId);
  const timelines = useTimelineStore((s) => s.timelines);
  const storeLayers = useTimelineStore((s) => s.layers);
  const storeClips = useTimelineStore((s) => s.clips);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const selectClips = useTimelineStore((s) => s.selectClips);

  const timeline = currentTimelineId ? timelines[currentTimelineId] : null;

  const visibleLayers = useMemo<LayerMap<StoreLayer>>(() => {
    if (!timeline) return {};

    return Object.fromEntries(
      timeline.layerIds.flatMap((layerId) => {
        const layer = storeLayers[layerId];
        return layer ? [[layerId, layer]] : [];
      }),
    );
  }, [storeLayers, timeline]);

  const visibleClips = useMemo<StoreClip[]>(() => {
    if (!timeline) return [];

    return timeline.layerIds.flatMap((layerId) => {
      const layer = storeLayers[layerId];
      if (!layer) return [];
      return layer.clipIds.flatMap((clipId) => {
        const clip = storeClips[clipId];
        return clip ? [clip] : [];
      });
    });
  }, [storeClips, storeLayers, timeline]);

  return (
    <LibraryTimeline
      layers={visibleLayers}
      clips={visibleClips}
      pixelsPerSecond={pixelsPerSecond}
      durationSec={durationSec}
      options={options}
      currentTimeSec={currentTimeSec}
      selectedClipIds={selectedClipIds}
      onSeek={(timeSec) => seekTo(Math.round(timeSec * fps))}
      onSelectClip={(clipId) => selectClips([clipId])}
      onMove={(clip, result) =>
        updateClip(clip.id, {
          startPx: result.startPx,
          layerId: result.layerId,
        })
      }
      onResize={(clip, result) =>
        updateClip(clip.id, {
          startPx: result.startPx,
          widthPx: result.widthPx,
        })
      }
      classNames={{ ...DEFAULT_CLASS_NAMES, ...classNames }}
    />
  );
}

export type { Clip, TimelineClassNames } from "timeline-as-library";
