import { useState } from "react";
import {
  Timeline as LibraryTimeline,
  type Clip,
  type TimelineClassNames,
  type TimelineProps,
} from "timeline-as-library";
import { useCurrentPlayerFrame } from "@/remotion/hooks/use-current-player-frame";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import "./styles.css";

const FPS = 60;

const DEFAULT_CLIPS: Clip[] = [
  { id: "clip-1", layerId: "1", startPx: 0, widthPx: 140 },
  { id: "clip-2", layerId: "2", startPx: 170, widthPx: 120 },
];

const DEFAULT_CLASS_NAMES: TimelineClassNames = {
  root: "absolute bottom-0 my-2 w-[calc(100%-1rem)] overflow-x-auto overflow-y-hidden rounded-sm bg-neutral-900 shadow-lg demo-timeline",
  layer:
    "relative h-full w-full rounded-md bg-neutral-800/60 flex items-center px-2 text-xs text-neutral-400",
  clip: "h-full w-full rounded-md bg-indigo-500 shadow ring-1 ring-indigo-300/40",
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
    "number_of_layers" | "pixelsPerSecond" | "durationSec" | "classNames"
  >
> & {
  initialClips?: Clip[];
};

/**
 * Application-level Timeline. Wraps the read-only `timeline-as-library`
 * submodule with default styling and wires the component into the Remotion
 * player store so consumers only need to render `<Timeline />`.
 */
export default function Timeline({
  number_of_layers = 3,
  pixelsPerSecond = 80,
  durationSec = 60,
  classNames,
  initialClips = DEFAULT_CLIPS,
}: TimelineWrapperProps = {}) {
  const [clips, setClips] = useState<Clip[]>(initialClips);

  const player = useRemotionPlayerStore((s) => s.player);
  const seekTo = useRemotionPlayerStore((s) => s.seekTo);
  const currentFrame = useCurrentPlayerFrame(player);
  const currentTimeSec = currentFrame / FPS;

  return (
    <LibraryTimeline
      number_of_layers={number_of_layers}
      clips={clips}
      setClips={setClips}
      pixelsPerSecond={pixelsPerSecond}
      durationSec={durationSec}
      currentTimeSec={currentTimeSec}
      onSeek={(timeSec) => seekTo(Math.round(timeSec * FPS))}
      classNames={{ ...DEFAULT_CLASS_NAMES, ...classNames }}
    />
  );
}

export type { Clip, TimelineClassNames } from "timeline-as-library";
